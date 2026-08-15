import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listarTarifas } from "@/lib/tarifas.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type Tarifa = Awaited<ReturnType<typeof listarTarifas>>[number];
type Categoria = "TODAS" | "INTERNET" | "DOBLE" | "TRIPLE";

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "INTERNET", label: "Internet" },
  { value: "DOBLE", label: "Internet + TV" },
  { value: "TRIPLE", label: "Internet + TV + Tel." },
];

const pesos = (v: number) => `$${v.toLocaleString("es-CO")}`;

export function TarifasPanel() {
  const [categoria, setCategoria] = useState<Categoria>("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useServerFn(listarTarifas);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    cargar({ data: { categoria, busqueda: busqueda.trim() } })
      .then((data) => {
        if (activo) {
          setTarifas(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (activo) setError(err instanceof Error ? err.message : "Error al cargar tarifas");
      })
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, busqueda]);

  const grupos = useMemo(() => {
    const map = new Map<string, Tarifa[]>();
    for (const t of tarifas) {
      const key = `${t.categoria}|${t.renta}|${t.servicio}`;
      const arr = map.get(key);
      if (arr) arr.push(t);
      else map.set(key, [t]);
    }
    return [...map.entries()];
  }, [tarifas]);

  const copiar = async (codigo: string) => {
    await navigator.clipboard.writeText(codigo);
    toast.success(`Código ${codigo} copiado`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por código, OTT o servicio (ej. CA1, Netflix)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={categoria === c.value ? "default" : "outline"}
              onClick={() => setCategoria(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : grupos.length === 0 ? (
        <Alert>
          <AlertDescription>No encontré tarifas con ese criterio.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {grupos.map(([key, items]) => {
            const t = items[0]!;
            return (
              <Card key={key} className="overflow-hidden border-border/60">
                <div className="h-1.5 bg-primary" />
                <CardContent className="space-y-4 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{t.servicio}</p>
                      <p className="text-sm text-muted-foreground">
                        Renta {pesos(t.renta)} · {t.campana ?? "Sin campaña"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {t.categoria === "INTERNET"
                        ? "Internet"
                        : t.categoria === "DOBLE"
                          ? "Internet + TV"
                          : "Internet + TV + Tel."}
                    </Badge>
                  </div>

                  <div className="divide-y divide-border/60 rounded-lg border border-border/60">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center gap-3 p-3">
                        <div className="min-w-[12rem] flex-1 text-sm text-foreground">
                          {item.ott ?? "Sin OTT"}
                        </div>
                        {[
                          { red: "HFC", codigo: item.codigo_hfc },
                          { red: "FTTH", codigo: item.codigo_ftth },
                        ].map(({ red, codigo }) =>
                          codigo ? (
                            <button
                              key={red}
                              type="button"
                              onClick={() => copiar(codigo)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              <span className="text-xs font-medium text-muted-foreground">{red}</span>
                              {codigo}
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </button>
                          ) : null,
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    {t.decodificadores && <p>📺 {t.decodificadores}</p>}
                    {t.accesos && <p>🔑 {t.accesos}</p>}
                    {t.instalacion && <p className="sm:col-span-2">🛠️ Instalación: {t.instalacion}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
