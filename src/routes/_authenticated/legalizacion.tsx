import { createFileRoute } from "@tanstack/react-router";
import { LegalizacionPanel } from "@/components/LegalizacionPanel";

export const Route = createFileRoute("/_authenticated/legalizacion")({
  head: () => ({
    meta: [
      { title: "Legalización de Ventas — Best Seller" },
      { name: "description", content: "Registra y gestiona tus ventas para legalización en SIAP." },
      { property: "og:title", content: "Legalización de Ventas — Best Seller" },
      { property: "og:description", content: "Registra y gestiona tus ventas para legalización en SIAP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalizacionPage,
});

function LegalizacionPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Legalización de Ventas</h1>
        <p className="mt-2 text-muted-foreground">
          Registra tus ventas aquí para tener el soporte listo para SIAP.
        </p>
      </div>
      <LegalizacionPanel />
    </main>
  );
}
