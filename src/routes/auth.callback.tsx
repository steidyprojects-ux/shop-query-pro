import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Procesando inicio de sesión — Visor Movilidad" },
      { name: "description", content: "Procesando autenticación." },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Navigate to="/consulta" />;
}
