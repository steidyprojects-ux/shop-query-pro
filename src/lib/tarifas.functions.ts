import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  categoria: z.enum(["TODAS", "INTERNET", "DOBLE", "TRIPLE"]).default("TODAS"),
  busqueda: z.string().max(60).optional(),
});

export const listarTarifas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("tarifas")
      .select("*")
      .order("categoria", { ascending: true })
      .order("renta", { ascending: false })
      .order("orden", { ascending: true });

    if (data.categoria !== "TODAS") query = query.eq("categoria", data.categoria);

    const term = data.busqueda?.trim();
    if (term) {
      const t = `%${term}%`;
      query = query.or(
        `codigo_hfc.ilike.${t},codigo_ftth.ilike.${t},ott.ilike.${t},servicio.ilike.${t}`,
      );
    }

    const { data: filas, error } = await query.limit(200);
    if (error) {
      console.error("Error listando tarifas:", error);
      throw new Error("No se pudieron cargar las tarifas.");
    }
    return filas ?? [];
  });
