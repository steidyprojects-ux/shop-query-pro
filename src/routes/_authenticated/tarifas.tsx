import { createFileRoute } from "@tanstack/react-router";
import { TarifasPanel } from "@/components/TarifasPanel";

export const Route = createFileRoute("/_authenticated/tarifas")({
  head: () => ({
    meta: [
      { title: "Tarifas y códigos — Visor Movilidad" },
      { name: "description", content: "Códigos de tarifa HFC y FTTH para Internet, Internet + TV e Internet + TV + Telefonía." },
      { property: "og:title", content: "Tarifas y códigos — Visor Movilidad" },
      { property: "og:description", content: "Códigos de tarifa HFC y FTTH para Internet, Internet + TV e Internet + TV + Telefonía." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TarifasPage,
});

function TarifasPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tarifas y códigos</h1>
        <p className="mt-2 text-muted-foreground">
          Vigencia Agosto · toca un código para copiarlo y digitar la venta.
        </p>
      </div>
      <TarifasPanel />
    </main>
  );
}
