import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, FileSearch } from "lucide-react";

interface ResultCardProps {
  resultado: {
    encontrado: boolean;
    resultado: {
      id: string;
      cedula: string;
      primer_apellido: string | null;
      ciudad: string;
      estado: string;
      observaciones: string | null;
      nombre_completo: string | null;
      consejo: string | null;
      nodo: string | null;
      tipo_red: string | null;
      direccion: string | null;
      cedula_asesor: string | null;
      created_at: string;
    } | null;
  };
}

const estadoConfig: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline"; icon: React.ReactNode; color: string }
> = {
  aprobada: {
    label: "Aprobada",
    variant: "default",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-success",
  },
  rechazada: {
    label: "Rechazada",
    variant: "destructive",
    icon: <XCircle className="h-5 w-5" />,
    color: "text-destructive",
  },
  con_deuda: {
    label: "Con deuda",
    variant: "secondary",
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-warning",
  },
};

export function ResultCard({ resultado }: ResultCardProps) {
  if (!resultado.encontrado || !resultado.resultado) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileSearch className="h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No se encontraron resultados
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            No hay registros asociados a esa cédula y ciudad. Verifica los datos e intenta de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const record = resultado.resultado;
  const config = estadoConfig[record.estado] ?? {
    label: record.estado,
    variant: "outline",
    icon: <FileSearch className="h-5 w-5" />,
    color: "text-muted-foreground",
  };

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="h-1.5 bg-primary" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>Resultado de la consulta</span>
          <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cédula
            </p>
            <p className="text-lg font-semibold text-foreground">{record.cedula}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nombre completo
            </p>
            <p className="text-lg font-semibold text-foreground">{record.nombre_completo ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Primer apellido
            </p>
            <p className="text-lg font-semibold text-foreground">{record.primer_apellido ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ciudad
            </p>
            <p className="text-lg font-semibold text-foreground">{record.ciudad}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Nodo", value: record.nodo },
            { label: "Tipo de red", value: record.tipo_red },
            { label: "Dirección", value: record.direccion },
            { label: "Cédula asesor de digitación", value: record.cedula_asesor },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="text-base font-medium text-foreground">
                {item.value || "—"}
              </p>
            </div>
          ))}
        </div>



        <div className={`flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-4 ${config.color}`}>
          {config.icon}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{config.label}</p>
            {record.consejo ? (
              <p className="text-sm text-muted-foreground">{record.consejo}</p>
            ) : record.observaciones ? (
              <p className="text-sm text-muted-foreground">{record.observaciones}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin observaciones adicionales.</p>
            )}
          </div>
        </div>

        <p className="text-right text-xs text-muted-foreground">
          Registrado el {new Date(record.created_at).toLocaleDateString("es-CO")}
        </p>
      </CardContent>
    </Card>
  );
}
