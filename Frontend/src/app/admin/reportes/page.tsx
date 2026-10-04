"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { PageTitle, LoadingState, ErrorState, Alert } from "@/components/ui";
import { useAuth, useAuthGuard } from "@/lib/auth";
import { getSystemReport, getDashboardMetrics } from "@/lib/api";
import type { DashboardMetrics, SystemReport } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administradores",
  bibliotecaria: "Bibliotecarias",
  docente: "Docentes",
};

const CONDITION_LABEL: Record<string, string> = {
  EXCELENTE: "Excelente",
  BUENO: "Bueno",
  EN_MANTENIMIENTO: "En mantenimiento",
  FUERA_DE_SERVICIO: "Fuera de servicio",
};

function Table({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<{ key: string; cells: Array<string | number> }>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-bold">{title}</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-5 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, i) => (
                <td
                  key={i}
                  className={`px-5 py-3 ${i === 0 ? "font-medium" : "text-muted-foreground"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function AdminReportesPage() {
  const { user, token, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<SystemReport | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useAuthGuard();

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  const fetchReport = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(false);
    try {
      const [r, m] = await Promise.all([
        getSystemReport(token),
        getDashboardMetrics(token).catch(() => null),
      ]);
      setReport(r);
      setMetrics(m);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [token]);

  if (!user) return null;

  const usuarioRows = report
    ? Object.entries(report.usuariosPorRol).map(([rol, c]) => ({
        key: rol,
        cells: [ROLE_LABEL[rol] ?? rol, c.activos, c.dados_de_baja, c.total],
      }))
    : [];

  const recursoRows = report
    ? Object.entries(report.recursosPorEstado).map(([estado, c]) => ({
        key: estado,
        cells: [
          CONDITION_LABEL[estado] ?? estado,
          c.disponibles,
          c.en_mantenimiento,
          c.total,
        ],
      }))
    : [];

  const solicitudRows = report
    ? [
        {
          key: "PENDIENTE",
          cells: ["Pendientes", report.solicitudesPorEstado.pendientes],
        },
        {
          key: "CONFIRMADA",
          cells: ["Confirmadas", report.solicitudesPorEstado.confirmadas],
        },
        {
          key: "RECHAZADA",
          cells: ["Rechazadas", report.solicitudesPorEstado.rechazadas],
        },
        {
          key: "CANCELADA",
          cells: ["Canceladas", report.solicitudesPorEstado.canceladas],
        },
      ]
    : [];

  return (
    <Layout>
      <PageTitle
        eyebrow="Administración"
        title="Reportes de estado"
        subtitle="Bajas, mantenimientos y estado operativo de usuarios, recursos y solicitudes."
      />

      {isLoading ? (
        <LoadingState message="Generando reportes…" />
      ) : error ? (
        <ErrorState onRetry={fetchReport} />
      ) : !report ? (
        <ErrorState />
      ) : (
        <>
          {metrics && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-white px-5 py-5">
                <p className="text-xs text-muted-foreground">Recursos totales</p>
                <p className="mt-1 font-heading text-[30px] font-bold leading-none">
                  {metrics.totalResources}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white px-5 py-5">
                <p className="text-xs text-muted-foreground">Usuarios activos</p>
                <p className="mt-1 font-heading text-[30px] font-bold leading-none">
                  {metrics.activeUsers}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white px-5 py-5">
                <p className="text-xs text-muted-foreground">Solicitudes del mes</p>
                <p className="mt-1 font-heading text-[30px] font-bold leading-none">
                  {metrics.totalRequestsThisMonth}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Alert kind="info" title="Criterio de los reportes">
              Se consideran <strong>dados de baja</strong> los usuarios con estado
              INACTIVO y <strong>en mantenimiento / fuera de servicio</strong> los
              recursos no disponibles.
            </Alert>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Table
              title="Usuarios por rol"
              headers={["Rol", "Activos", "Baja", "Total"]}
              rows={usuarioRows}
            />
            <Table
              title="Recursos por estado"
              headers={["Estado", "Disponibles", "Mantenimiento", "Total"]}
              rows={recursoRows}
            />
          </div>

          <div className="mt-5">
            <Table
              title="Solicitudes por estado"
              headers={["Estado", "Cantidad"]}
              rows={solicitudRows}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
