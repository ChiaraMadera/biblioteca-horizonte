"use client";

import { Layout } from "@/components/Layout";
import { PageTitle, Alert, Badge } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function GuidePage() {
  const { isAdmin, isBibliotecaria } = useAuth();
  const rolActual = isAdmin
    ? "Administrador"
    : isBibliotecaria
      ? "Bibliotecaria"
      : "Docente";

  return (
    <Layout>
      <PageTitle
        eyebrow="Documentación del sistema"
        title="Guía del sistema"
        subtitle="Recorridos, estados y funcionalidades disponibles."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-bold">01 — Recorridos navegables</h2>
          <div className="space-y-4 text-xs leading-6">
            <p>
              <strong>Docente:</strong> Login → Inicio → Recursos → Detalle → Nueva solicitud →
              Solicitud enviada → Mis solicitudes → Detalle.
            </p>
            <p>
              <strong>Bibliotecaria:</strong> Login → Inicio → Solicitudes pendientes → Detalle →
              Confirmar / Rechazar → Confirmación.
            </p>
            <p>
              <strong>Conflicto:</strong> Solicitud pendiente → Confirmar → Verificación → Conflicto →
              Mantener pendiente o rechazar.
            </p>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-bold">02 — Estados y mensajes</h2>
          <div className="space-y-5">
            {(["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"] as const).map((status) => (
              <div key={status}>
                <Badge status={status} />
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {status === "PENDIENTE"
                    ? "La solicitud fue registrada y está pendiente de confirmación."
                    : status === "CONFIRMADA"
                      ? "La solicitud fue confirmada correctamente."
                      : status === "RECHAZADA"
                        ? "La solicitud fue rechazada."
                        : "La solicitud fue cancelada por el docente."}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
            Una solicitud nueva comienza PENDIENTE. Solo la bibliotecaria puede confirmar o
            rechazar. El docente puede cancelar sus propias solicitudes PENDIENTES o CONFIRMADAS,
            siempre que el horario todavía no haya pasado.
          </p>
        </section>
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-bold">03 — Conexión con el backend</h2>
          <p className="mb-4 text-xs leading-6 text-muted-foreground">
            Este frontend se conecta a la API Flask del backend. Los datos se obtienen de la base de
            datos a través de los endpoints definidos en el schema.
          </p>
          <div className="space-y-2 text-xs">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}</p>
            <p><strong>Autenticación:</strong> JWT Bearer Token</p>
            <p><strong>Rol actual:</strong> {rolActual}</p>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-bold">04 — Endpoints disponibles</h2>
          <div className="space-y-2 text-xs leading-6">
            <p><strong>POST /api/auth/login</strong> — Iniciar sesión</p>
            <p><strong>GET /api/auth/me</strong> — Usuario actual</p>
            <p><strong>GET /api/resources/</strong> — Listar recursos</p>
            <p><strong>GET /api/resources/:id</strong> — Detalle de recurso</p>
            <p><strong>POST /api/requests/</strong> — Crear solicitud</p>
            <p><strong>GET /api/requests/</strong> — Listar solicitudes con filtros y paginación</p>
            <p><strong>PATCH /api/requests/:id/cancel</strong> — Cancelar una solicitud propia</p>
            <p><strong>PATCH /api/requests/:id/review</strong> — Revisar solicitud</p>
            <p><strong>GET /api/admin/dashboard</strong> — Métricas (admin)</p>
          </div>
        </section>
      </div>
      <div className="mt-6">
        <Alert title="Alcance del sistema">
          Este sistema está conectado al backend Flask. La autenticación, permisos y validaciones se
          realizan en el servidor. Los datos se almacenan en la base de datos configurada.
        </Alert>
      </div>
    </Layout>
  );
}
