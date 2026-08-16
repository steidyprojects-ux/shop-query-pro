import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShieldCheck, Smartphone, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Best Seller — Consulta en un solo lugar" },
      { name: "description", content: "Consulta el estado de tus clientes, nodos, tarifas y legaliza tus ventas en Best Seller." },
      { property: "og:title", content: "Best Seller — Consulta en un solo lugar" },
      { property: "og:description", content: "Consulta el estado de tus clientes, nodos, tarifas y legaliza tus ventas en Best Seller." },

      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex flex-col">
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Consulta rápida y segura
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            Consulta en un solo lugar
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Consulta el estado de tus clientes por cédula y ciudad. Obtén resultados claros: aprobada, rechazada o con deuda. 
            No solo ello, códigos de tarifas, nodos y cobertura, cédula de asesor para digitar tus ventas según la regional.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link to="/login">
                <Search className="h-5 w-5" />
                Iniciar consulta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link to="/login">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Todo lo que necesitas para consultar
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Consulta por cédula</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ingresa el número de cédula del cliente y la ciudad para verificar su estado.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Resultados claros</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Visualiza si el cliente está aprobado, rechazado o cuenta con deudas pendientes.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Panel administrador</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Los administradores pueden crear, editar y eliminar registros de forma sencilla.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
