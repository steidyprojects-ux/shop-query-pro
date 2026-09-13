import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  crearRegistro,
  actualizarRegistro,
  eliminarRegistro,
} from "@/lib/mobility.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface MobilityRecord {
  id: string;
  cedula: string;
  primer_apellido: string | null;
  ciudad: string;
  estado: string;
  observaciones: string | null;
  nodo: string | null;
  tipo_red: string | null;
  direccion: string | null;
  cedula_asesor: string | null;
  created_at: string;
  updated_at: string;
}

interface MobilityRecordsTableProps {
  records: MobilityRecord[];
  isLoading: boolean;
}

const estadoOptions = [
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "con_deuda", label: "Con deuda" },
];

const estadoVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  aprobada: "default",
  rechazada: "destructive",
  con_deuda: "secondary",
};

export function MobilityRecordsTable({ records, isLoading }: MobilityRecordsTableProps) {
  const queryClient = useQueryClient();
  const createFn = useServerFn(crearRegistro);
  const updateFn = useServerFn(actualizarRegistro);
  const deleteFn = useServerFn(eliminarRegistro);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<MobilityRecord | null>(null);
  const [form, setForm] = useState({
    cedula: "",
    primer_apellido: "",
    ciudad: "",
    estado: "aprobada",
    observaciones: "",
    nodo: "",
    tipo_red: "",
    direccion: "",
    cedula_asesor: "",
  });

  const resetForm = () => {
    setForm({ cedula: "", primer_apellido: "", ciudad: "", estado: "aprobada", observaciones: "", nodo: "", tipo_red: "", direccion: "", cedula_asesor: "" });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editing) {
        await updateFn({
          data: {
            id: editing.id,
            cedula: form.cedula,
            ciudad: form.ciudad,
            estado: form.estado as "aprobada" | "rechazada" | "con_deuda",
            observaciones: form.observaciones,
            nodo: form.nodo,
            tipo_red: form.tipo_red,
            direccion: form.direccion,
            cedula_asesor: form.cedula_asesor,
          },
        });
      } else {
        await createFn({
          data: {
            cedula: form.cedula,
            ciudad: form.ciudad,
            estado: form.estado as "aprobada" | "rechazada" | "con_deuda",
            observaciones: form.observaciones,
            nodo: form.nodo,
            tipo_red: form.tipo_red,
            direccion: form.direccion,
            cedula_asesor: form.cedula_asesor,
          },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["mobilityRecords"] });
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      await deleteFn({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["mobilityRecords"] });
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (record: MobilityRecord) => {
    setEditing(record);
    setForm({
      cedula: record.cedula,
      ciudad: record.ciudad,
      estado: record.estado,
      observaciones: record.observaciones ?? "",
      nodo: record.nodo ?? "",
      tipo_red: record.tipo_red ?? "",
      direccion: record.direccion ?? "",
      cedula_asesor: record.cedula_asesor ?? "",
    });
  };

  return (
    <div className="space-y-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo registro
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar registro" : "Nuevo registro"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información del registro seleccionado."
                : "Crea un nuevo registro de movilidad."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(value) => setForm({ ...form, estado: value })}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nodo">Nodo</Label>
                <Input
                  id="nodo"
                  value={form.nodo}
                  onChange={(e) => setForm({ ...form, nodo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_red">Tipo de red</Label>
                <Input
                  id="tipo_red"
                  value={form.tipo_red}
                  onChange={(e) => setForm({ ...form, tipo_red: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula_asesor">Cédula asesor de digitación</Label>
                <Input
                  id="cedula_asesor"
                  value={form.cedula_asesor}
                  onChange={(e) => setForm({ ...form, cedula_asesor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? "Guardar cambios" : "Crear registro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Nodo</TableHead>
              <TableHead className="hidden lg:table-cell">Tipo de red</TableHead>
              <TableHead className="hidden xl:table-cell">Dirección</TableHead>
              <TableHead className="hidden xl:table-cell">Cédula asesor</TableHead>
              <TableHead className="hidden md:table-cell">Observaciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  No hay registros aún.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.cedula}</TableCell>
                  <TableCell>{record.ciudad}</TableCell>
                  <TableCell>
                    <Badge variant={estadoVariant[record.estado] ?? "outline"}>
                      {estadoOptions.find((o) => o.value === record.estado)?.label ??
                        record.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{record.nodo ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{record.tipo_red ?? "—"}</TableCell>
                  <TableCell className="hidden max-w-xs truncate xl:table-cell">{record.direccion ?? "—"}</TableCell>
                  <TableCell className="hidden xl:table-cell">{record.cedula_asesor ?? "—"}</TableCell>
                  <TableCell className="hidden max-w-xs truncate md:table-cell">
                    {record.observaciones ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
