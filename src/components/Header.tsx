import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Search, Shield, User } from "lucide-react";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Visor Movilidad
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {!loading && user ? (
            <>
              <Link
                to="/consulta"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Consultar
              </Link>
              <Link
                to="/nodos"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Nodos
              </Link>
              <Link
                to="/admin"
                className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >

                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="gap-1">
              <Link to="/login">
                <User className="h-4 w-4" />
                Ingresar
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
