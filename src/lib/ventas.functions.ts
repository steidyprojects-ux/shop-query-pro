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
  ciudad: z.string().max(60).optional(),
  observaciones: z.string().max(500).optional(),
});

const idSchema = z.object({ id: z.string().uuid() });

const SELECT_COLS =
  "id, nombre_cliente, cedula_cliente, telefono, cuenta, orden_trabajo, cedula_vendedor, ciudad, observaciones, created_at";

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
        ciudad: data.ciudad || null,
        observaciones: data.observaciones || null,
        created_by: userId,
      })
      .select(SELECT_COLS)
      .single();

    if (error) {
      console.error("Error registrando venta:", error);
      throw new Error("No se pudo registrar la venta.");
    }

    return venta;
  });

export const actualizarVenta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.merge(ventaSchema.partial()).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...rest } = data;

    const updates: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) updates[key] = (value as string) || null;
    }

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
