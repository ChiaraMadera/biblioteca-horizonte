"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, LoadingState, ErrorState, Badge } from "@/components/ui";
import { RequestTable } from "@/components/RequestTable";
import { ResourceCard } from "@/components/ResourceCard";
import { useAuth, useAuthGuard } from "@/lib/auth";
import { getRequests, getResources, getDashboardMetrics } from "@/lib/api";
import type { Request, Resource, DashboardMetrics } from "@/lib/types";

export default function DashboardPage() {
  const { user, token, isAdmin } = useAuth();
  useAuthGuard();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      if (isAdmin) {
        try {
          const m = await getDashboardMetrics(token);
          setMetrics(m);
        } catch {
          // Dashboard metrics are optional
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, isAdmin]);

  if (!user) return null;

  const userRequests = isAdmin
    ? requests
    : requests.filter((r) => r.user_id === user.id);

  const pendingCount = userRequests.filter((r) => r.status === "PENDIENTE").length;
  const confirmedCount = userRequests.filter((r) => r.status === "CONFIRMADA").length;
  const rejectedCount = userRequests.filter((r) => r.status === "RECHAZADA").length;

  return (
    <Layout>
      <PageTitle
        eyebrow={isAdmin ? "Panel de gestión" : "Tu biblioteca, más cerca"}
        title={isAdmin ? `Buen día, ${user.name.split(" ")[0]}` : `Hola, ${user.name.split(" ")[0]} 👋`}
        subtitle={
          isAdmin
            ? "Revisá las solicitudes y coordiná el uso de los recursos de la biblioteca."
            : "Gestioná tus solicitudes y encontrá el recurso para tu próxima clase."
        }
        action={
          !isAdmin && (
            <Button onClick={() => router.push("/nueva-solicitud")}>
              <Plus size={16} />
              Nueva solicitud
            </Button>
          )
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {(["PENDIENTE", "CONFIRMADA", "RECHAZADA"] as const).map((status) => {
              const count =
                status === "PENDIENTE"
                  ? pendingCount
                  : status === "CONFIRMADA"
                    ? confirmedCount
                    : rejectedCount;
              return (
                <Link
                  key={status}
                  href={`/solicitudes?estado=${status}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-white px-5 py-5 transition hover:border-primary/30"
                >
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {status === "PENDIENTE"
                        ? "Pendientes"
                        : status === "CONFIRMADA"
                          ? "Confirmadas"
                          : "Rechazadas"}
                    </p>
                    <p className="my-1.5 font-heading text-[32px] font-bold leading-tight">
                      {count.toString().padStart(2, "0")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {status === "PENDIENTE"
                        ? "A la espera de revisión"
                        : status === "CONFIRMADA"
                          ? "Recursos confirmados"
                          : "Solicitudes no aprobadas"}
                    </p>
                  </div>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Badge status={status} />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mb-7 flex items-center gap-3 rounded-lg border border-[#e0e9e2] bg-[#edf3ee] px-4 py-3 text-[12px] leading-6 text-[#53705c]">
            <Info className="shrink-0" size={17} />
            <p>
              <span className="font-semibold">
                {isAdmin
                  ? "Cada solicitud necesita tu revisión."
                  : "Una solicitud pendiente aún no está confirmada."}
              </span>{" "}
              {isAdmin
                ? "Verificá la disponibilidad antes de confirmar un recurso."
                : "La bibliotecaria revisará y confirmará la disponibilidad del recurso."}
            </p>
          </div>

          <section className="mb-8 overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-bold">
                  {isAdmin ? "Solicitudes por revisar" : "Mis últimas solicitudes"}
                </h2>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {isAdmin
                    ? userRequests.filter((r) => r.status === "PENDIENTE").length
                    : userRequests.length}
                </span>
              </div>
              <Link
                href={isAdmin ? "/pendientes" : "/solicitudes"}
                className="flex items-center gap-2 text-[11px] font-semibold text-primary"
              >
                Ver todas
                <ArrowRight size={13} />
              </Link>
            </div>
            <RequestTable
              items={(isAdmin
                ? userRequests.filter((r) => r.status === "PENDIENTE")
                : userRequests
              ).slice(0, 4)}
              resources={resources}
              admin={isAdmin}
              compact
              onNewRequest={() => router.push("/nueva-solicitud")}
            />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold">Recursos a tu alcance</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Todo lo que necesitás para acompañar tus clases.
                </p>
              </div>
              <Link
                href="/recursos"
                className="flex items-center gap-2 text-[11px] font-semibold text-primary"
              >
                Explorar recursos
                <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {resources.slice(0, 3).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} compact />
              ))}
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}
