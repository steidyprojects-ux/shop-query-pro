import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { verificarAdmin, listarRegistros } from "@/lib/mobility.functions";
import { MobilityRecordsTable } from "@/components/MobilityRecordsTable";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administración — Visor Movilidad" },
      { name: "description", content: "Gestiona los registros de movilidad." },
      { property: "og:title", content: "Administración — Visor Movilidad" },
      { property: "og:description", content: "Gestiona los registros de movilidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const checkAdmin = useServerFn(verificarAdmin);
  const fetchRecords = useServerFn(listarRegistros);

  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => checkAdmin(),
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ["mobilityRecords"],
    queryFn: () => fetchRecords(),
    enabled: !!adminData?.isAdmin,
  });

  if (adminLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminData?.isAdmin) {
    return <Navigate to="/consulta" />;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Administración
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona los registros de movilidad disponibles para consulta.
        </p>
      </div>
      <MobilityRecordsTable records={records ?? []} isLoading={recordsLoading} />
    </main>
  );
}
