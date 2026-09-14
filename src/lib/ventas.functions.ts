import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ventaSchema = z.object({
  nombre_cliente: z.string().min(3).max(120).trim(),
  cedula_cliente: z.string().min(5).max(20).trim(),
  telefono: z.string().max(20).optional(),
  cuenta: z.string().max(30).optional(),
  orden_trabajo: z.string().max(30).optional(),
  cedula_vendedor: z.string().min(5).max(20).trim(),
  empresa: z.enum(["MOVILCO", "ALIADO"]).optional(),
  tipo_acceso: z.enum(["@", "DOBLE", "TRIPLE"]).optional(),
  observaciones: z.string().max(500).optional(),
});

const idSchema = z.object({ id: z.string().uuid() });

const SELECT_COLS =
  "id, nombre_cliente, cedula_cliente, telefono, cuenta, orden_trabajo, cedula_vendedor, empresa, tipo_acceso, observaciones, created_at";

export const listarVentas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data, error } = await supabase
      .from("ventas_siap")
      .select(SELECT_COLS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listando ventas:", error);
      throw new Error("No se pudieron cargar las ventas.");
    }

    return data ?? [];
  });

// ============================================================
// Llama al servicio de Playwright en el VPS para registrar la
// venta directamente en SIAPP. Nunca lanza: si falla, se lo
// reportamos al frontend como advertencia, pero la venta ya
// quedó guardada en Supabase de todas formas.
// ============================================================
async function intentarRegistrarEnSiapp(data: {
  cuenta?: string;
  orden_trabajo?: string;
  cedula_cliente: string;
  nombre_cliente: string;
  telefono?: string;
  cedula_vendedor: string;
  empresa?: string;
}): Promise<{ ok: boolean; error?: string; omitido?: boolean }> {
  // SIAPP solo aplica para ventas MOVILCO. Las de ALIADO se registran
  // en Supabase igual, pero nunca se mandan al portal SIAPP.
  // El "tipo_acceso" tampoco se envía: SIAPP no maneja ese dato.
  if (data.empresa !== "MOVILCO") {
    return { ok: false, omitido: true, error: "Empresa distinta de MOVILCO: no se registra en SIAPP." };
  }

  const url = process.env.SIAPP_API_URL;
  const apiKey = process.env.SIAPP_API_KEY;

  if (!url || !apiKey) {
    console.error("SIAPP_API_URL o SIAPP_API_KEY no configuradas — se omite el registro automático en SIAPP.");
    return { ok: false, error: "Integración con SIAPP no configurada." };
  }

  if (!data.cuenta || !data.orden_trabajo) {
    return { ok: false, error: "Falta cuenta u orden de trabajo para registrar en SIAPP." };
  }

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        cuenta: data.cuenta,
        ordenTrabajo: data.orden_trabajo,
        cedulaCliente: data.cedula_cliente,
        nombreCliente: data.nombre_cliente,
        celular: data.telefono ?? "",
        cedulaVendedor: data.cedula_vendedor,
      }),
      // Playwright puede tardar hasta ~1.5 minutos en cargar y llenar el formulario real.
      signal: AbortSignal.timeout(120000),
    });

    const json = (await respuesta.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

    if (!respuesta.ok || !json?.ok) {
      return { ok: false, error: json?.error ?? `Error HTTP ${respuesta.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Error llamando al servicio de SIAPP:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export const registrarVenta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ventaSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: venta, error } = await supabase
      .from("ventas_siap")
      .insert({
        nombre_cliente: data.nombre_cliente,
        cedula_cliente: data.cedula_cliente,
        telefono: data.telefono || null,
        cuenta: data.cuenta || null,
        orden_trabajo: data.orden_trabajo || null,
        cedula_vendedor: data.cedula_vendedor,
        empresa: data.empresa || null,
        tipo_acceso: data.tipo_acceso || null,
        observaciones: data.observaciones || null,
        created_by: userId,
      })
      .select(SELECT_COLS)
      .single();

    if (error) {
      console.error("Error registrando venta:", error);
      throw new Error("No se pudo registrar la venta.");
    }

    // La venta ya está guardada en tu historial (Supabase) pase lo que pase.
    // Ahora intentamos también el registro automático en SIAPP (solo si es MOVILCO).
    const siapp = await intentarRegistrarEnSiapp(data);

    return { ...venta, siappOk: siapp.ok, siappOmitido: siapp.omitido ?? false, siappError: siapp.error };
  });

export const actualizarVenta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.merge(ventaSchema.partial()).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...rest } = data;

    const updates: {
      nombre_cliente?: string;
      cedula_cliente?: string;
      telefono?: string | null;
      cuenta?: string | null;
      orden_trabajo?: string | null;
      cedula_vendedor?: string;
      empresa?: string | null;
      tipo_acceso?: string | null;
      observaciones?: string | null;
    } = {};

    if (rest.nombre_cliente !== undefined) updates.nombre_cliente = rest.nombre_cliente;
    if (rest.cedula_cliente !== undefined) updates.cedula_cliente = rest.cedula_cliente;
    if (rest.cedula_vendedor !== undefined) updates.cedula_vendedor = rest.cedula_vendedor;
    if (rest.telefono !== undefined) updates.telefono = rest.telefono || null;
    if (rest.cuenta !== undefined) updates.cuenta = rest.cuenta || null;
    if (rest.orden_trabajo !== undefined) updates.orden_trabajo = rest.orden_trabajo || null;
    if (rest.empresa !== undefined) updates.empresa = rest.empresa || null;
    if (rest.tipo_acceso !== undefined) updates.tipo_acceso = rest.tipo_acceso || null;
    if (rest.observaciones !== undefined) updates.observaciones = rest.observaciones || null;

    const { data: venta, error } = await supabase
      .from("ventas_siap")
      .update(updates)
      .eq("id", id)
      .select(SELECT_COLS)
      .single();

    if (error) {
      console.error("Error actualizando venta:", error);
      throw new Error("No se pudo actualizar la venta.");
    }

    return venta;
  });

export const eliminarVenta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { error } = await supabase
      .from("ventas_siap")
      .delete()
      .eq("id", data.id);

    if (error) {
      console.error("Error eliminando venta:", error);
      throw new Error("No se pudo eliminar la venta.");
    }

    return { ok: true };
  });

// --- Salidas de datos sensibles: autorizadas y construidas en el servidor ---

/** Devuelve el texto SIAP de UNA venta, solo si es del asesor o si es admin. */
export const copiarVenta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: adminFlag } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    const admin = adminFlag === true;

    let query = supabase.from("ventas_siap").select(SELECT_COLS).eq("id", data.id);
    if (!admin) query = query.eq("created_by", userId);

    const { data: venta, error } = await query.maybeSingle();
    if (error) {
      console.error("Error obteniendo venta:", error);
      throw new Error("No se pudo obtener la venta.");
    }
    if (!venta) throw new Error("No autorizado para copiar esta venta.");

    return {
      texto: [
        venta.nombre_cliente.toUpperCase(),
        venta.cedula_cliente,
        venta.telefono ?? "",
        `Cuenta: ${venta.cuenta ?? ""}`,
        `Orden de Trabajo: ${venta.orden_trabajo ?? ""}`,
        `Cédula del vendedor: ${venta.cedula_vendedor}`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  });

/** Genera el CSV en el servidor con solo las ventas que el usuario puede ver. */
export const exportarVentasCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: adminFlag } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    const admin = adminFlag === true;

    let query = supabase
      .from("ventas_siap")
      .select(SELECT_COLS)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (!admin) query = query.eq("created_by", userId);

    const { data: filas, error } = await query;
    if (error) {
      console.error("Error exportando ventas:", error);
      throw new Error("No se pudo generar la exportación.");
    }
    if (!filas || filas.length === 0) {
      throw new Error("No hay ventas para exportar.");
    }

    const headers = [
      "Fecha",
      "Nombre cliente",
      "Cédula cliente",
      "Teléfono",
      "Cuenta",
      "Orden de trabajo",
      "Cédula vendedor",
      "Empresa",
      "Tipo de acceso",
      "Observaciones",
    ];
    const rows = filas.map((v) => [
      new Date(v.created_at).toLocaleDateString("es-CO"),
      v.nombre_cliente,
      v.cedula_cliente,
      v.telefono ?? "",
      v.cuenta ?? "",
      v.orden_trabajo ?? "",
      v.cedula_vendedor,
      v.empresa ?? "",
      v.tipo_acceso ?? "",
      v.observaciones ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    return {
      filename: `ventas-siap-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      total: filas.length,
    };
  });
