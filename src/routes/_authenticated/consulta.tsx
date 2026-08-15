import { createFileRoute } from "@tanstack/react-router";
import { ConsultaForm } from "@/components/ConsultaForm";

export const Route = createFileRoute("/_authenticated/consulta")({
  head: () => ({
    meta: [
      { title: "Consultar — Visor Movilidad" },
      { name: "description", content: "Consulta el estado de movilidad por cédula y ciudad." },
      { property: "og:title", content: "Consultar — Visor Movilidad" },
      { property: "og:description", content: "Consulta el estado de movilidad por cédula y ciudad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultaPage,
});

function ConsultaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Consulta de movilidad
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ingresa la cédula y la ciudad del cliente para verificar su estado.
        </p>
      </div>
      <ConsultaForm />
    </main>
  );
}
