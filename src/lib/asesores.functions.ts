import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const estadoSchema = z.object({
  id: z.string().uuid(),
  activo: z.boolean(),
});

export const listarAsesores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("No autorizado.");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, cedula, distrito, activo, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listando asesores:", error);
      throw new Error("No se pudieron cargar los asesores.");
    }

    return data ?? [];
  });

export const cambiarEstadoAsesor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => estadoSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("No autorizado.");

    const { error } = await supabase
      .from("profiles")
      .update({ activo: data.activo })
      .eq("id", data.id);

    if (error) {
      console.error("Error actualizando asesor:", error);
      throw new Error("No se pudo actualizar la cuenta.");
    }

    return { ok: true };
  });
