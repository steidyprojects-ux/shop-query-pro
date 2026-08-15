import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const consultaSchema = z.object({
  cedula: z.string().min(5).max(20).trim(),
  ciudad: z.string().min(2).max(50).trim(),
});

const recordSchema = z.object({
  cedula: z.string().min(5).max(20).trim(),
  ciudad: z.string().min(2).max(50).trim(),
  estado: z.enum(["aprobada", "rechazada", "con_deuda"]),
  observaciones: z.string().max(500).optional(),
});

const idSchema = z.object({
  id: z.string().uuid(),
});

export const consultarMovilidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => consultaSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: records, error } = await supabase
      .from("mobility_records")
      .select("id, cedula, ciudad, estado, observaciones, created_at")
      .eq("cedula", data.cedula)
      .ilike("ciudad", data.ciudad)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error consultando movilidad:", error);
      throw new Error("No se pudo realizar la consulta. Intenta de nuevo.");
    }

    return {
      encontrado: records && records.length > 0,
      resultado: records?.[0] ?? null,
    };
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
      .select("id, cedula, ciudad, estado, observaciones, created_at, updated_at")
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
        ciudad: data.ciudad,
        estado: data.estado,
        observaciones: data.observaciones ?? null,
        created_by: userId,
      })
      .select("id, cedula, ciudad, estado, observaciones, created_at")
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

    const { id, ...rawUpdates } = data;

    const updates = Object.fromEntries(
      Object.entries(rawUpdates).filter(([, v]) => v !== undefined)
    );

    const { data: record, error } = await supabase
      .from("mobility_records")
      .update(updates)
      .eq("id", id)
      .select("id, cedula, ciudad, estado, observaciones, created_at, updated_at")
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
