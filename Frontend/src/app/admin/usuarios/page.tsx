"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  PageTitle,
  LoadingState,
  ErrorState,
  EmptyState,
  Button,
  Alert,
} from "@/components/ui";
import { useAuth, useAuthGuard } from "@/lib/auth";
import { getUsers, createUser, deleteUser } from "@/lib/api";
import { fieldClass } from "@/lib/utils";
import type { User } from "@/lib/types";

const ROLES = [
  { value: "docente", label: "Docente" },
  { value: "bibliotecaria", label: "Bibliotecaria" },
  { value: "admin", label: "Administrador" },
];

const roleLabel = (role: string) =>
  ROLES.find((r) => r.value === role)?.label ?? role;

export default function AdminUsuariosPage() {
  const { user, token, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "docente",
    dni: "",
    phone: "",
  });

  useAuthGuard();

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(false);
    try {
      const result = await getUsers(token, { page: 1, limit: 200 });
      setUsers(result.items);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError("");
    try {
      await createUser(token, {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role as User["role"],
        dni: form.dni || undefined,
        phone: form.phone || undefined,
      });
      setForm({
        name: "",
        email: "",
        password: "",
        role: "docente",
        dni: "",
        phone: "",
      });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (target: User) => {
    if (!token) return;
    if (!window.confirm(`¿Dar de baja a ${target.name}? Perderá el acceso al sistema.`))
      return;
    try {
      await deleteUser(token, target.id);
      await fetchUsers();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se pudo dar de baja");
    }
  };

  if (!user) return null;

  const filtered = users.filter(
    (u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "todos" || u.role === roleFilter)
  );

  return (
    <Layout>
      <PageTitle
        eyebrow="Administración"
        title="Usuarios"
        subtitle="Registrá docentes, bibliotecarias y administradores, y gestioná sus bajas."
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            <UserPlus size={16} />
            {showForm ? "Cerrar formulario" : "Nuevo usuario"}
          </Button>
        }
      />

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-xl border border-border bg-white p-5"
        >
          <h2 className="mb-4 text-[15px] font-bold">Registrar usuario</h2>
          {formError && (
            <div className="mb-4">
              <Alert kind="error">{formError}</Alert>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Nombre *</span>
              <input
                required
                className={fieldClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Email *</span>
              <input
                required
                type="email"
                className={fieldClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">
                Contraseña * (mínimo 8)
              </span>
              <input
                required
                type="password"
                minLength={8}
                className={fieldClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Rol *</span>
              <select
                className={fieldClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">DNI</span>
              <input
                className={fieldClass}
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Teléfono</span>
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Crear usuario"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setFormError("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search size={17} className="absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            aria-label="Buscar usuarios"
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
        <select
          aria-label="Filtrar por rol"
          className={`${fieldClass} w-auto`}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando usuarios…" />
      ) : error ? (
        <ErrorState onRetry={fetchUsers} />
      ) : filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5">{roleLabel(u.role)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                        u.status === "ACTIVO"
                          ? "border-[#d9eade] bg-[#eaf5ee] text-[#2d7451]"
                          : "border-[#f2dede] bg-[#fcEEEE] text-[#a94d4d]"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      disabled={u.status !== "ACTIVO"}
                      onClick={() => handleDelete(u)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Sin resultados"
          description="No encontramos usuarios con esos filtros."
        />
      )}
    </Layout>
  );
}
