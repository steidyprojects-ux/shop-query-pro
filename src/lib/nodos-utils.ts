export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

/** Quita prefijos ND / NOD / NODO del código de nodo. */
export function limpiarCodigoNodo(texto: string): string {
  return normalizar(texto).replace(/^(NODO|NOD|ND)[\s._-]*/, "").trim();
}

/** Traduce la red del archivo a la nomenclatura comercial. */
export function redComercial(red: string | null): "HFC" | "FTTH" | "OTRA" {
  const r = normalizar(red ?? "");
  if (r === "BIDIRECCIONAL" || r === "UNIDIRECCIONAL") return "HFC";
  if (r === "FTT" || r.startsWith("FO") || r === "RFO") return "FTTH";
  return "OTRA";
}
