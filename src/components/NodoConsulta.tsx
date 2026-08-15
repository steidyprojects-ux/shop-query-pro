import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { consultarNodo } from "@/lib/nodos.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Radar } from "lucide-react";

type Resultado = Awaited<ReturnType<typeof consultarNodo>>;

export function NodoConsulta() {
  const [codigo, setCodigo] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultar = useServerFn(consultarNodo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() && !ciudad.trim()) {
      setError("Ingresa un código de nodo, una ciudad, o ambos.");
      return;
    }
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const data = await consultar({ data: { codigo: codigo.trim(), ciudad: ciudad.trim() } });
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nodo">Código de nodo</Label>
                <Input
                  id="nodo"
                  placeholder="Ej. PSI"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  autoComplete="off"
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad-nodo">Ciudad</Label>
                <Input
                  id="ciudad-nodo"
                  placeholder="Ej. PEREIRA"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  autoComplete="off"
                  maxLength={60}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Puedes buscar solo por nodo, solo por ciudad, o por ambos para un resultado exacto.
            </p>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
              Consultar nodo
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultado?.tipo === "vacio" && (
        <Alert>
          <AlertDescription>{resultado.mensaje}</AlertDescription>
        </Alert>
      )}

      {resultado?.tipo === "ciudad" && (
        <Card className="overflow-hidden border-border/60">
          <div className="h-1.5 bg-primary" />
          <CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              🏙️ {resultado.ciudad}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Dato label="🌐 Red disponible" valor={resultado.red} />
              <Dato label="🗺️ Regional" valor={resultado.regional} />
            </div>
            <p className="text-xs text-muted-foreground">
              {resultado.totalNodos.toLocaleString("es-CO")} nodos registrados en esta ciudad.
            </p>
          </CardContent>
        </Card>
      )}

      {resultado?.tipo === "nodo" && (
        <div className="space-y-4">
          {resultado.multiple && (
            <Alert>
              <AlertDescription>
                Encontré {resultado.items.length} coincidencias. Confirma cuál corresponde al cliente.
              </AlertDescription>
            </Alert>
          )}
          {resultado.soloReferencia && (
            <Alert>
              <AlertDescription>
                Ninguna coincidencia tiene red BIDIRECCIONAL o FTT. Se muestran los datos de referencia; verifica antes de digitar.
              </AlertDescription>
            </Alert>
          )}
          {resultado.items.map((item, i) => (
            <Card key={`${item.idNodo}-${i}`} className="overflow-hidden border-border/60">
              <div className="h-1.5 bg-primary" />
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {item.idNodo} — {item.nombreNodo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.ciudad} · {item.departamento}
                    </p>
                  </div>
                  <Badge variant={item.esCalle ? "default" : "secondary"}>
                    {item.esCalle ? "✅ Calle" : "❌ No Calle"}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Dato label="📍 Distrito" valor={item.distrito ?? "—"} />
                  <Dato label="🌐 Red" valor={`${item.red ?? "—"} (${item.redComercial})`} />
                  <Dato label="🗺️ Regional" valor={item.regional ?? "—"} />
                  <Dato label="Estado nodo" valor={item.estado ?? "—"} />
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    🔢 Código {item.tipoCodigo}
                  </p>
                  {item.codigos.length === 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Sin código asignado para esta regional.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {item.codigos.map((c) => (
                        <li key={c.codigo} className="text-sm">
                          <span className="font-semibold text-foreground">{c.codigo}</span>
                          <span className="text-muted-foreground"> · CC {c.cc} · {c.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-medium text-foreground">{valor}</p>
    </div>
  );
}
