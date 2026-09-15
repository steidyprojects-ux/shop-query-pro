import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const consultaSchema = z.object({
  cedula: z.string().min(5).max(20).trim(),
  primer_apellido: z.string().min(2).max(50).trim(),
  ciudad: z.string().min(2).max(50).trim(),
});

const recordSchema = z.object({
  cedula: z.string().min(5).max(20).trim(),
  primer_apellido: z.string().min(2).max(50).trim(),
  ciudad: z.string().min(2).max(50).trim(),
  estado: z.enum(["aprobada", "rechazada", "con_deuda"]),
  observaciones: z.string().max(500).optional(),
  nombre_completo: z.string().max(120).optional(),
  consejo: z.string().max(1000).optional(),
  nodo: z.string().max(100).optional(),
  tipo_red: z.string().max(100).optional(),
  direccion: z.string().max(200).optional(),
  cedula_asesor: z.string().max(20).optional(),
});

const idSchema = z.object({
  id: z.string().uuid(),
});

const RECORD_COLS =
  "id, cedula, primer_apellido, ciudad, estado, observaciones, nombre_completo, consejo, nodo, tipo_red, direccion, cedula_asesor, created_at";

// ============================================================
// Llama al servicio de Playwright en el VPS que consulta en vivo
// el portal Visor Movilidad de Claro (mismo servidor que SIAPP,
// misma API key, ruta distinta). El servidor ya devuelve el
// estado (aprobada/rechazada/con_deuda) y el consejo para el
// asesor, según las reglas de negocio.
// ============================================================
async function consultarVisorEnVivo(input: {
  cedula: string;
  apellido: string;
  ciudad: string;
}): Promise<
  | {
      ok: true;
      textoCompleto: string;
      estado: "aprobada" | "rechazada" | "con_deuda";
      consejo: string;
    }
  | { ok: false; error: string }
> {
  const url = process.env['VISOR_API_URL'];
  const apiKey = process.env['SIAPP_API_KEY']; // misma clave compartida del servidor api-lovable

  if (!url || !apiKey) {
    return { ok: false, error: "Integración con el Visor no configurada." };
  }

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(input),
      // El login + formulario + modal en el portal real puede tardar hasta ~1.5 minutos,
      // y con varias consultas simultáneas puede tardar un poco más por la cola interna.
      signal: AbortSignal.timeout(150000),
    });

    const json = (await respuesta.json().catch(() => null)) as
      | {
          ok?: boolean;
          textoCompleto?: string;
          estado?: "aprobada" | "rechazada" | "con_deuda";
          consejo?: string;
          error?: string;
        }
      | null;

    if (!respuesta.ok || !json?.ok) {
      return { ok: false, error: json?.error ?? `Error HTTP ${respuesta.status}` };
    }

    return {
      ok: true,
      textoCompleto: json.textoCompleto ?? "",
      estado: json.estado ?? "rechazada",
      consejo: json.consejo ?? "",
    };
  } catch (e) {
    console.error("Error llamando al servicio del Visor:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export const consultarMovilidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => consultaSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const live = await consultarVisorEnVivo({
      cedula: data.cedula,
      apellido: data.primer_apellido,
      ciudad: data.ciudad,
    });

    if (!live.ok) {
      // El Visor falló o no está configurado: avisamos claro, sin inventar un resultado.
      throw new Error("No se pudo consultar el Visor en este momento: " + live.error);
    }

    const observacionesFinal = [live.textoCompleto, live.consejo].filter(Boolean).join("\n\n");

    // Guardamos el resultado como historial, igual que antes hacía crearRegistro.
    const { data: registro, error } = await supabase
      .from("mobility_records")
      .insert({
        cedula: data.cedula,
        primer_apellido: data.primer_apellido,
        ciudad: data.ciudad,
        estado: live.estado,
        observaciones: observacionesFinal || null,
        consejo: live.consejo || null,
        created_by: userId,
      })
      .select(RECORD_COLS)
      .single();

    if (error) {
      console.error("Error guardando historial de consulta:", error);
      // La consulta en vivo sí funcionó; devolvemos el resultado aunque no se
      // haya podido guardar el historial, para no dejar al asesor sin respuesta.
      return {
        encontrado: true,
        resultado: {
          id: "",
          cedula: data.cedula,
          primer_apellido: data.primer_apellido,
          ciudad: data.ciudad,
          estado: live.estado,
          observaciones: observacionesFinal || null,
          nombre_completo: null,
          consejo: live.consejo || null,
          nodo: null,
          tipo_red: null,
          direccion: null,
          cedula_asesor: null,
          created_at: new Date().toISOString(),
        },
      };
    }

    return { encontrado: true, resultado: registro };
  });

export const listarRegistros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("No tienes permisos para ver todos los registros.");
    }

    const { data: records, error } = await supabase
      .from("mobility_records")
      .select(
        "id, cedula, primer_apellido, ciudad, estado, observaciones, nombre_completo, consejo, nodo, tipo_red, direccion, cedula_asesor, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listando registros:", error);
      throw new Error("No se pudieron cargar los registros.");
    }

    return records ?? [];
  });

export const crearRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => recordSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("No tienes permisos para crear registros.");
    }

    const { data: record, error } = await supabase
      .from("mobility_records")
      .insert({
        cedula: data.cedula,
        primer_apellido: data.primer_apellido,
        ciudad: data.ciudad,
        estado: data.estado,
        observaciones: data.observaciones ?? null,
        nodo: data.nodo ?? null,
        tipo_red: data.tipo_red ?? null,
        direccion: data.direccion ?? null,
        cedula_asesor: data.cedula_asesor ?? null,
        created_by: userId,
      })
      .select(RECORD_COLS)
      .single();

    if (error) {
      console.error("Error creando registro:", error);
      throw new Error("No se pudo crear el registro.");
    }

    return record;
  });

export const actualizarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    idSchema.merge(recordSchema.partial()).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("No tienes permisos para actualizar registros.");
    }

    const { id, cedula, primer_apellido, ciudad, estado, observaciones, nodo, tipo_red, direccion, cedula_asesor } = data;
    const updates: Partial<{
      cedula: string;
      primer_apellido: string;
      ciudad: string;
      estado: "aprobada" | "rechazada" | "con_deuda";
      observaciones: string | null;
      nodo: string | null;
      tipo_red: string | null;
      direccion: string | null;
      cedula_asesor: string | null;
    }> = {};

    if (cedula !== undefined) updates.cedula = cedula;
    if (primer_apellido !== undefined) updates.primer_apellido = primer_apellido;
    if (ciudad !== undefined) updates.ciudad = ciudad;
    if (estado !== undefined) updates.estado = estado;
    if (observaciones !== undefined) {
      updates.observaciones = observaciones || null;
    }
    if (nodo !== undefined) updates.nodo = nodo || null;
    if (tipo_red !== undefined) updates.tipo_red = tipo_red || null;
    if (direccion !== undefined) updates.direccion = direccion || null;
    if (cedula_asesor !== undefined) updates.cedula_asesor = cedula_asesor || null;

    const { data: record, error } = await supabase
      .from("mobility_records")
      .update(updates)
      .eq("id", id)
      .select(
        "id, cedula, primer_apellido, ciudad, estado, observaciones, nodo, tipo_red, direccion, cedula_asesor, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Error actualizando registro:", error);
      throw new Error("No se pudo actualizar el registro.");
    }

    return record;
  });

export const eliminarRegistro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("No tienes permisos para eliminar registros.");
    }

    const { error } = await supabase
      .from("mobility_records")
      .delete()
      .eq("id", data.id);

    if (error) {
      console.error("Error eliminando registro:", error);
      throw new Error("No se pudo eliminar el registro.");
    }

    return { ok: true };
  });

export const verificarAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    return { isAdmin: !!isAdmin };
  });
