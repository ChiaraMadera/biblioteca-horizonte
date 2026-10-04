"use client";

import { Layout } from "@/components/Layout";
import { PageTitle, Alert } from "@/components/ui";
import { useAuth, useAuthGuard } from "@/lib/auth";

export default function ProfilePage() {
  const { user, isAdmin, isBibliotecaria } = useAuth();
  useAuthGuard();

  if (!user) return null;

  const roleLabel = isAdmin
    ? "Administrador"
    : isBibliotecaria
      ? "Bibliotecaria"
      : "Docente";

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Layout>
      <PageTitle
        title="Mi perfil"
        subtitle="Información de tu usuario y permisos dentro del sistema."
      />
      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-border bg-white p-7">
          <div className="mb-7 flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-accent text-lg font-bold text-primary">
              {initials}
            </span>
            <div>
              <h2 className="text-lg font-bold">
                {user.name} — {roleLabel}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Alert title="Permisos de tu rol">
            {isAdmin
              ? "Podés registrar y dar de baja usuarios y recursos, consultar todos los reportes y revisar solicitudes."
              : isBibliotecaria
                ? "Podés consultar todas las solicitudes, confirmar o rechazar solicitudes pendientes y verificar conflictos de disponibilidad."
                : "Podés consultar recursos, enviar solicitudes y ver tus solicitudes. La confirmación y el rechazo son exclusivos de la bibliotecaria."}
          </Alert>
        </section>
        <section className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-bold">Información de la cuenta</h2>
          <dl className="space-y-4 text-sm">
            {[
              ["Nombre", user.name],
              ["Email", user.email],
              ["Rol", user.role],
              ["Estado", user.status],
              ["DNI", user.dni || "—"],
              ["Teléfono", user.phone || "—"],
              ["Miembro desde", new Date(user.created_at).toLocaleDateString("es-AR")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-border pb-3 last:border-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </Layout>
  );
}
