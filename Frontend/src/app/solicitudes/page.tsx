"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, LoadingState, ErrorState, EmptyState, Badge } from "@/components/ui";
import { RequestTable } from "@/components/RequestTable";
import { useAuth, useAuthGuard } from "@/lib/auth";
import { getRequests, getResources } from "@/lib/api";
import { fieldClass } from "@/lib/utils";
import type { Request, Resource, RequestStatus } from "@/lib/types";

function RequestsContent() {
  const { token, user, isAdmin } = useAuth();
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<Request[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState(searchParams.get("estado") || "TODAS");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const [reqs, res] = await Promise.all([
        getRequests(token),
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

  useEffect(() => {
    setFilter(searchParams.get("estado") || "TODAS");
  }, [searchParams]);

  if (!user) return null;

  const userRequests = isAdmin
    ? requests
    : requests.filter((r) => r.user_id === user.id);

  const filtered = userRequests.filter(
    (request) =>
      (filter === "TODAS" || request.status === filter) &&
      `${request.teacher} ${request.id}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageTitle
        eyebrow={isAdmin ? "Gestión de solicitudes" : "Seguimiento"}
        title={isAdmin ? "Todas las solicitudes" : "Mis solicitudes"}
        subtitle="Consultá el estado y los detalles de cada solicitud."
        action={
          !isAdmin && (
            <Button onClick={() => router.push("/nueva-solicitud")}>
              <Plus size={16} />
              Nueva solicitud
            </Button>
          )
        }
      />
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex flex-wrap gap-1">
            {(["TODAS", "PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"] as const).map((status) => (
              <button
                key={status}
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-2 text-[11px] font-medium ${
                  filter === status
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {status === "TODAS"
                  ? "Todas"
                  : status === "PENDIENTE"
                    ? "Pendientes"
                    : status === "CONFIRMADA"
                      ? "Confirmadas"
                      : "Rechazadas"}
                <span className="ml-1.5 text-[10px] opacity-70">
                  {
                    userRequests.filter(
                      (r) => status === "TODAS" || r.status === status
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          <div className="relative min-w-48 flex-1 sm:max-w-64">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={15} />
            <input
              aria-label="Buscar solicitudes"
              placeholder={isAdmin ? "Buscar recurso o docente…" : "Buscar solicitud…"}
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
          <RequestTable items={filtered} resources={resources} admin={isAdmin} onNewRequest={() => router.push("/nueva-solicitud")} />
        ) : (
          <div className="p-5">
            <EmptyState
              title={search ? "No hay resultados" : "No hay solicitudes"}
              description={
                search
                  ? "Probá otro recurso, nombre o número de solicitud."
                  : "Las solicitudes aparecerán aquí cuando se registren."
              }
              action={
                search ? (
                  <Button variant="secondary" onClick={() => setSearch("")}>
                    Limpiar búsqueda
                  </Button>
                ) : (
                  !isAdmin && (
                    <Button onClick={() => router.push("/nueva-solicitud")}>
                      Nueva solicitud
                    </Button>
                  )
                )
              }
            />
          </div>
        )}
      </div>
    </>
  );
}

export default function RequestsPage() {
  return (
    <Layout>
      <Suspense fallback={<LoadingState />}>
        <RequestsContent />
      </Suspense>
    </Layout>
  );
}
