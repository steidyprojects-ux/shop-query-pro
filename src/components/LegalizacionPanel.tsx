import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listarVentas,
  registrarVenta,
  eliminarVenta,
} from "@/lib/ventas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Download, Copy, FileText } from "lucide-react";

interface Venta {
  id: string;
  nombre_cliente: string;
  cedula_cliente: string;
  telefono: string | null;
  cuenta: string | null;
  orden_trabajo: string | null;
  cedula_vendedor: string;
  ciudad: string | null;
  observaciones: string | null;
  created_at: string;
}

const emptyForm = {
  nombre_cliente: "",
  cedula_cliente: "",
  telefono: "",
  cuenta: "",
  orden_trabajo: "",
  cedula_vendedor: "",
  ciudad: "",
  observaciones: "",
};

function ventaTexto(v: Venta) {
  return [
    v.nombre_cliente.toUpperCase(),
    v.cedula_cliente,
    v.telefono ?? "",
    `Cuenta: ${v.cuenta ?? ""}`,
    `Orden de Trabajo: ${v.orden_trabajo ?? ""}`,
    `Cédula del vendedor: ${v.cedula_vendedor}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function LegalizacionPanel() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listarVentas);
  const createFn = useServerFn(registrarVenta);
  const deleteFn = useServerFn(eliminarVenta);

  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ["ventasSiap"],
    queryFn: () => listFn({}) as Promise<Venta[]>,
  });

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createFn({ data: form });
      await queryClient.invalidateQueries({ queryKey: ["ventasSiap"] });
      setForm({ ...emptyForm, cedula_vendedor: form.cedula_vendedor });
      toast.success("Venta registrada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar la venta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta venta?")) return;
    try {
      await deleteFn({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["ventasSiap"] });
      toast.success("Venta eliminada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar");
    }
  };

  const copiar = async (v: Venta) => {
    await navigator.clipboard.writeText(ventaTexto(v));
    toast.success("Datos copiados para SIAP");
  };

  const exportarCsv = () => {
    const headers = [
      "Fecha",
      "Nombre cliente",
      "Cédula cliente",
      "Teléfono",
      "Cuenta",
      "Orden de trabajo",
      "Cédula vendedor",
      "Ciudad",
      "Observaciones",
    ];
    const rows = ventas.map((v) => [
      new Date(v.created_at).toLocaleDateString("es-CO"),
      v.nombre_cliente,
      v.cedula_cliente,
      v.telefono ?? "",
      v.cuenta ?? "",
      v.orden_trabajo ?? "",
      v.cedula_vendedor,
      v.ciudad ?? "",
      v.observaciones ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas-siap-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nombre_cliente">Nombre completo del cliente</Label>
                <Input
                  id="nombre_cliente"
                  value={form.nombre_cliente}
                  onChange={(e) => set("nombre_cliente", e.target.value)}
                  placeholder="ELIECER QUIÑONEZ ARENIZ"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula_cliente">Cédula del cliente</Label>
                <Input
                  id="cedula_cliente"
                  inputMode="numeric"
                  value={form.cedula_cliente}
                  onChange={(e) => set("cedula_cliente", e.target.value)}
                  placeholder="13850760"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  inputMode="tel"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  placeholder="3209655649"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuenta">Cuenta</Label>
                <Input
                  id="cuenta"
                  value={form.cuenta}
                  onChange={(e) => set("cuenta", e.target.value)}
                  placeholder="57743907"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orden_trabajo">Orden de trabajo</Label>
                <Input
                  id="orden_trabajo"
                  value={form.orden_trabajo}
                  onChange={(e) => set("orden_trabajo", e.target.value)}
                  placeholder="476680642"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula_vendedor">Cédula del vendedor</Label>
                <Input
                  id="cedula_vendedor"
                  inputMode="numeric"
                  value={form.cedula_vendedor}
                  onChange={(e) => set("cedula_vendedor", e.target.value)}
                  placeholder="1121928133"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={form.ciudad}
                  onChange={(e) => set("ciudad", e.target.value)}
                  placeholder="PEREIRA"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={form.observaciones}
                  onChange={(e) => set("observaciones", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full gap-2 sm:w-auto">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Registrar venta
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Mis ventas {ventas.length > 0 && `(${ventas.length})`}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={exportarCsv}
            disabled={ventas.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ventas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aún no has registrado ventas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ventas.map((v) => (
              <Card key={v.id}>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-foreground">{v.nombre_cliente}</p>
                    <p className="text-sm text-muted-foreground">
                      CC {v.cedula_cliente}
                      {v.telefono ? ` · ${v.telefono}` : ""}
                      {v.ciudad ? ` · ${v.ciudad}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cuenta: {v.cuenta ?? "—"} · OT: {v.orden_trabajo ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vendedor {v.cedula_vendedor} ·{" "}
                      {new Date(v.created_at).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => copiar(v)}>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(v.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
