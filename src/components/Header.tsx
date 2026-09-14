import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { verificarAdmin } from "@/lib/mobility.functions";
import { LogOut, Search, Shield, User } from "lucide-react";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(verificarAdmin);

  const { data: adminData } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
  });
  const isAdmin = adminData?.isAdmin === true;

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
            Best Seller
          </span>

        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          {!loading && user ? (
            <>
              <Link
                to="/consulta"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Consultar
              </Link>
              <Link
                to="/nodos"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Nodos
              </Link>
              <Link
                to="/tarifas"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Tarifas
              </Link>
              <Link
                to="/legalizacion"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                Legalización
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
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
