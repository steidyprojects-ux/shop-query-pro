import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Visor Movilidad" },
      { name: "description", content: "Inicia sesión en el Visor de Movilidad de Claro." },
      { property: "og:title", content: "Iniciar sesión — Visor Movilidad" },
      { property: "og:description", content: "Inicia sesión en el Visor de Movilidad de Claro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
      <AuthForm />
    </main>
  );
}
