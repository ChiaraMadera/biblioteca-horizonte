"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, Badge, Alert, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getRequests, getResources } from "@/lib/api";
import { fieldClass, dateLabel, getIconByName } from "@/lib/utils";
import type { Request, Resource } from "@/lib/types";

export default function PendientesPage() {
  const { token, isBibliotecaria } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const [reqs, res] = await Promise.all([
        getRequests(token, { status: "PENDIENTE" }),
        getResources(token),
      ]);
      setRequests(reqs);
      setResources(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (!isBibliotecaria) {
    return (
      <Layout>
        <EmptyState
          title="Acceso no permitido"
          description="Esta acción no está disponible para tu rol."
          action={<Button onClick={() => router.push("/")}>Volver al inicio</Button>}
        />
      </Layout>
    );
  }

  const filtered = requests.filter(
    (request) =>
      `${request.teacher} ${request.id}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageTitle
        eyebrow="Gestión de solicitudes"
        title="Solicitudes pendientes"
        subtitle="Revisá los datos y verificá la disponibilidad antes de confirmar."
      />
      <div className="mb-5">
        <Alert>
          Solo las solicitudes <strong>PENDIENTES</strong> pueden confirmarse o rechazarse. El estado
          confirmado no puede volver a pendiente.
        </Alert>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="relative min-w-48 flex-1 sm:max-w-64">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={15} />
            <input
              aria-label="Buscar solicitudes"
              placeholder="Buscar recurso o docente…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`${fieldClass} py-2.5 pl-9 text-xs`}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={fetchData} />
        ) : filtered.length ? (
          <div className="divide-y divide-border">
            {filtered.map((request) => {
              const resource = resources.find((r) => r.id === request.resource_id);
              if (!resource) return null;
              const Icon = getIconByName(resource.icon);
              return (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-t border-border p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg p-3 ${resource.tone}`}>
                      <Icon size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{resource.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {request.teacher} · {request.id}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {dateLabel(request.date)} · {request.shift.split(" · ")[0]} · {request.module}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={request.status} />
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/solicitudes/${request.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      onClick={() => router.push(`/solicitudes/${request.id}?accion=confirmar`)}
                    >
                      <Check size={14} />
                      Confirmar
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-destructive"
                      onClick={() => router.push(`/solicitudes/${request.id}?accion=rechazar`)}
                    >
                      <X size={14} />
                      Rechazar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title={search ? "No hay resultados" : "No hay solicitudes pendientes"}
              description={
                search
                  ? "Probá otro recurso, nombre o número de solicitud."
                  : "Todas las solicitudes fueron revisadas. Las nuevas solicitudes aparecerán aquí."
              }
              action={
                search ? (
                  <Button variant="secondary" onClick={() => setSearch("")}>
                    Limpiar búsqueda
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
