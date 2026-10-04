"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Inbox, CircleCheck, BarChart3 } from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  PageTitle,
  LoadingState,
  ErrorState,
  Button,
  Alert,
} from "@/components/ui";
import { useAuth, useAuthGuard } from "@/lib/auth";
import { getDashboardMetrics, getAuditLogs } from "@/lib/api";
import type { AuditLog, DashboardMetrics } from "@/lib/types";

export default function AdminDashboardPage() {
  const { user, token, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useAuthGuard();

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  const fetchMetrics = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(false);
    try {
      const [m, l] = await Promise.all([
        getDashboardMetrics(token),
        getAuditLogs(token).catch(() => [] as AuditLog[]),
      ]);
      setMetrics(m);
      setLogs(l);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  if (!user) return null;

  const cards = metrics
    ? [
        {
          label: "Recursos totales",
          value: metrics.totalResources,
          icon: ShieldCheck,
          tone: "text-primary bg-accent",
        },
        {
          label: "Usuarios activos",
          value: metrics.activeUsers,
          icon: Users,
          tone: "text-[#2d7451] bg-[#eaf5ee]",
        },
        {
          label: "Solicitudes del mes",
          value: metrics.totalRequestsThisMonth,
          icon: BarChart3,
          tone: "text-[#916516] bg-[#fff6e5]",
        },
        {
          label: "Pendientes de revisión",
          value: metrics.pendingRequests,
          icon: Inbox,
          tone: "text-[#a94d4d] bg-[#fcEEEE]",
        },
      ]
    : [];

  return (
    <Layout>
      <PageTitle
        eyebrow="Administración"
        title="Panel de control"
        subtitle="Estado general del sistema y últimas acciones registradas."
        action={
          <Button variant="secondary" to="/admin/reportes">
            Ver reportes
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState message="Cargando métricas…" />
      ) : error ? (
        <ErrorState onRetry={fetchMetrics} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-white px-5 py-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg ${tone}`}
                  >
                    <Icon size={17} strokeWidth={1.7} />
                  </span>
                </div>
                <p className="font-heading text-[30px] font-bold leading-none">
                  {String(value).padStart(2, "0")}
                </p>
              </div>
            ))}
          </div>

          <Alert kind="warning" title="Regla central del sistema">
            Solo puede existir <strong>una reserva CONFIRMADA</strong> por recurso,
            fecha y módulo. Una solicitud PENDIENTE no garantiza la disponibilidad y
            no bloquea el cupo para otros docentes.
          </Alert>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[15px] font-bold">Estado de solicitudes</h2>
              </div>
              <ul className="divide-y divide-border">
                {(
                  [
                    ["Confirmadas", metrics?.confirmedRequests ?? 0],
                    ["Pendientes", metrics?.pendingRequests ?? 0],
                    ["Rechazadas", metrics?.rejectedRequests ?? 0],
                  ] as const
                ).map(([label, value]) => (
                  <li
                    key={label}
                    className="flex items-center justify-between px-5 py-3.5 text-sm"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="flex items-center gap-2 font-semibold">
                      <CircleCheck size={15} className="text-primary" />
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[15px] font-bold">Recursos más solicitados</h2>
              </div>
              {metrics?.mostRequestedResources.length ? (
                <ul className="divide-y divide-border">
                  {metrics.mostRequestedResources.map((item) => (
                    <li
                      key={item.resourceId}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm"
                    >
                      <span className="truncate">{item.resourceName}</span>
                      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {item.requestCount}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-6 text-sm text-muted-foreground">
                  Todavía no hay solicitudes registradas.
                </p>
              )}
            </section>
          </div>

          <section className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[15px] font-bold">Últimas acciones</h2>
            </div>
            {logs.length ? (
              <ul className="divide-y divide-border">
                {logs.slice(0, 8).map((log) => (
                  <li
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs"
                  >
                    <span className="font-semibold">{log.action}</span>
                    <span className="text-muted-foreground">
                      {log.targetEntity}
                      {log.targetId ? ` · ${log.targetId}` : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString("es-AR")
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No hay acciones registradas.
              </p>
            )}
          </section>
        </>
      )}
    </Layout>
  );
}
