import { createFileRoute } from "@tanstack/react-router";
import { NodoConsulta } from "@/components/NodoConsulta";

export const Route = createFileRoute("/_authenticated/nodos")({
  head: () => ({
    meta: [
      { title: "Nodos y red — Visor Movilidad" },
      { name: "description", content: "Consulta el distrito, la red y el código de digitación de cualquier nodo." },
      { property: "og:title", content: "Nodos y red — Visor Movilidad" },
      { property: "og:description", content: "Consulta el distrito, la red y el código de digitación de cualquier nodo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NodosPage,
});

function NodosPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Consulta de nodos</h1>
        <p className="mt-2 text-muted-foreground">
          Distrito, tipo de red, regional y el código con el que debes digitar la venta.
        </p>
      </div>
      <NodoConsulta />
    </main>
  );
}
