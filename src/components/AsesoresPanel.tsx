import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listarAsesores, cambiarEstadoAsesor } from "@/lib/asesores.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";

export function AsesoresPanel() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listarAsesores);
  const toggleFn = useServerFn(cambiarEstadoAsesor);

  const { data: asesores = [], isLoading } = useQuery({
    queryKey: ["asesores"],
    queryFn: () => listFn(),
  });

  const toggle = async (id: string, activo: boolean) => {
    try {
      await toggleFn({ data: { id, activo: !activo } });
      await queryClient.invalidateQueries({ queryKey: ["asesores"] });
      toast.success(!activo ? "Cuenta activada" : "Cuenta desactivada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la cuenta");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (asesores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aún no hay asesores registrados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asesor</TableHead>
              <TableHead className="hidden sm:table-cell">Cédula</TableHead>
              <TableHead className="hidden md:table-cell">Correo</TableHead>
              <TableHead className="hidden lg:table-cell">Distrito</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asesores.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.full_name ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{a.cedula ?? "—"}</TableCell>
                <TableCell className="hidden md:table-cell">{a.email}</TableCell>
                <TableCell className="hidden lg:table-cell">{a.distrito ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={a.activo ? "default" : "secondary"}>
                    {a.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={a.activo ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggle(a.id, a.activo)}
                  >
                    {a.activo ? "Desactivar" : "Activar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
