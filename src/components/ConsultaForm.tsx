import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { consultarMovilidad } from "@/lib/mobility.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResultCard } from "./ResultCard";
import { Loader2, Search } from "lucide-react";

export function ConsultaForm() {
  const [cedula, setCedula] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [resultado, setResultado] = useState<{
    encontrado: boolean;
    resultado: {
      id: string;
      cedula: string;
      primer_apellido: string;
      ciudad: string;
      estado: string;
      observaciones: string | null;
      nodo: string | null;
      tipo_red: string | null;
      direccion: string | null;
      cedula_asesor: string | null;
      created_at: string;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultar = useServerFn(consultarMovilidad);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const data = await consultar({ data: { cedula: cedula.trim(), primer_apellido: primerApellido.trim(), ciudad: ciudad.trim() } });
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cedula">Número de cédula</Label>
                <Input
                  id="cedula"
                  placeholder="Ej. 1234567890"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                  minLength={5}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primerApellido">Primer apellido</Label>
                <Input
                  id="primerApellido"
                  placeholder="Ej. Martínez"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  placeholder="Ej. Bogotá"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Consultar
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultado && <ResultCard resultado={resultado} />}
    </div>
  );
}
