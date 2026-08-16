import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { limpiarCodigoNodo, normalizar, redComercial } from "@/lib/nodos-utils";

const consultaSchema = z
  .object({
    codigo: z.string().max(40).optional(),
    ciudad: z.string().max(60).optional(),
  })
  .refine((v) => (v.codigo && v.codigo.trim()) || (v.ciudad && v.ciudad.trim()), {
    message: "Ingresa un código de nodo o una ciudad.",
  });

const REDES_VALIDAS = ["BIDIRECCIONAL", "FTT"];

export const consultarNodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => consultaSchema.parse(data))
  .handler(async ({ data }) => {
    // Catálogo servido por el servidor tras verificar la sesión del asesor.
    const { supabaseAdmin: supabase } = await import("@/integrations/supabase/client.server");
    const codigo = data.codigo ? limpiarCodigoNodo(data.codigo) : "";
    const ciudad = data.ciudad ? normalizar(data.ciudad) : "";

    // Consulta solo por ciudad → resumen de red disponible
    if (!codigo && ciudad) {
      const { data: filas, error } = await supabase
        .from("nodos")
        .select("nombre_comunidad, red_por_nodo, regional")
        .ilike("nombre_comunidad", ciudad)
        .limit(20000);

      if (error) {
        console.error("Error consultando ciudad:", error);
        throw new Error("No se pudo realizar la consulta.");
      }
      if (!filas || filas.length === 0) {
        return { tipo: "vacio" as const, mensaje: `No encontré la ciudad "${ciudad}". Verifica el nombre e intenta de nuevo.` };
      }

      const redes = new Set(filas.map((f) => redComercial(f.red_por_nodo)));
      const regionales = [...new Set(filas.map((f) => f.regional).filter(Boolean))] as string[];
      const disponibles = ["HFC", "FTTH"].filter((r) => redes.has(r as "HFC" | "FTTH"));

      return {
        tipo: "ciudad" as const,
        ciudad: filas[0]?.nombre_comunidad ?? ciudad,
        red: disponibles.length ? disponibles.join(" + ") : "Sin red comercial",
        regional: regionales.join(", ") || "—",
        totalNodos: filas.length,
      };
    }

    // Consulta por código (con o sin ciudad)
    let query = supabase
      .from("nodos")
      .select("id_nodo, nombre_nodo, nombre_comunidad, departamento, red_por_nodo, distrito, regional, estado_nodo")
      .ilike("id_nodo", codigo);

    if (ciudad) query = query.ilike("nombre_comunidad", ciudad);

    const { data: filas, error } = await query.limit(100);
    if (error) {
      console.error("Error consultando nodo:", error);
      throw new Error("No se pudo realizar la consulta.");
    }
    if (!filas || filas.length === 0) {
      return {
        tipo: "vacio" as const,
        mensaje: `No encontré el nodo "${codigo}"${ciudad ? ` en ${ciudad}` : ""}. Verifica el código e intenta de nuevo.`,
      };
    }

    const comerciales = filas.filter((f) => REDES_VALIDAS.includes(normalizar(f.red_por_nodo ?? "")));
    const resultados = comerciales.length > 0 ? comerciales : filas;
    const soloReferencia = comerciales.length === 0;

    const distritos = [...new Set(resultados.map((r) => normalizar(r.distrito ?? "")))];
    const { data: calleRows } = await supabase.from("distritos_calle").select("distrito");
    const setCalle = new Set((calleRows ?? []).map((c) => normalizar(c.distrito ?? "")));

    const { data: codigos } = await supabase
      .from("codigos_asesor")
      .select("tipo, codigo, cc_completa, nombre, regional");

    const items = resultados.map((r) => {
      const distrito = normalizar(r.distrito ?? "");
      const esCalle = distritos.length >= 0 && setCalle.has(distrito);
      const regional = normalizar(r.regional ?? "");
      const tipoBuscado = esCalle ? "CALLE" : "PDV";
      let asignados = (codigos ?? []).filter((c) => c.tipo === tipoBuscado && normalizar(c.regional) === regional);
      let tipoFinal = tipoBuscado;
      if (asignados.length === 0) {
        // p. ej. R1 no tiene código CALLE → se usa PDV
        asignados = (codigos ?? []).filter((c) => c.tipo === "PDV" && normalizar(c.regional) === regional);
        tipoFinal = "PDV";
      }

      return {
        idNodo: r.id_nodo,
        nombreNodo: r.nombre_nodo,
        ciudad: r.nombre_comunidad,
        departamento: r.departamento,
        distrito: r.distrito,
        red: r.red_por_nodo,
        redComercial: redComercial(r.red_por_nodo),
        regional: r.regional,
        estado: r.estado_nodo,
        esCalle,
        tipoCodigo: tipoFinal,
        codigos: asignados.map((c) => ({
          codigo: c.codigo,
          cc: c.cc_completa,
          nombre: c.nombre,
        })),
      };
    });

    return {
      tipo: "nodo" as const,
      soloReferencia,
      multiple: items.length > 1,
      items,
    };
  });
