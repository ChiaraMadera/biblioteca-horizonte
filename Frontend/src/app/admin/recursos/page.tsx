"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, Wrench } from "lucide-react";
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
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/api";
import { fieldClass } from "@/lib/utils";
import type { Resource } from "@/lib/types";

const CATEGORIES = ["Equipamiento", "Espacios", "Material bibliográfico"];

const CONDITIONS = [
  { value: "EXCELENTE", label: "Excelente" },
  { value: "BUENO", label: "Bueno" },
  { value: "EN_MANTENIMIENTO", label: "En mantenimiento" },
  { value: "FUERA_DE_SERVICIO", label: "Fuera de servicio" },
];

const noOperativo = (condition: string) =>
  condition === "EN_MANTENIMIENTO" || condition === "FUERA_DE_SERVICIO";

export default function AdminRecursosPage() {
  const { user, token, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    category: CATEGORIES[0],
    description: "",
    info: "",
    icon: "Package",
    tone: "emerald",
    condition: "EXCELENTE",
    serial_number: "",
    location: "",
  });

  useAuthGuard();

  useEffect(() => {
    if (!loading && user && !isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  const fetchResources = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(false);
    try {
      const data = await getResources(token, { page: 1, limit: 200 });
      setResources(data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError("");
    try {
      await createResource(token, {
        id: form.id.trim(),
        name: form.name,
        category: form.category as Resource["category"],
        description: form.description,
        info: form.info,
        icon: form.icon,
        tone: form.tone,
        condition: form.condition as Resource["condition"],
        available: !noOperativo(form.condition),
        serial_number: form.serial_number || undefined,
        location: form.location || undefined,
      });
      setForm({
        id: "",
        name: "",
        category: CATEGORIES[0],
        description: "",
        info: "",
        icon: "Package",
        tone: "emerald",
        condition: "EXCELENTE",
        serial_number: "",
        location: "",
      });
      setShowForm(false);
      await fetchResources();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo crear el recurso"
      );
    } finally {
      setSaving(false);
    }
  };

  const changeCondition = async (resource: Resource, condition: string) => {
    if (!token) return;
    try {
      await updateResource(token, resource.id, {
        condition: condition as Resource["condition"],
        available: !noOperativo(condition),
      });
      await fetchResources();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se pudo actualizar");
    }
  };

  const handleBaja = async (resource: Resource) => {
    if (!token) return;
    if (!window.confirm(`¿Dar de baja lógica a "${resource.name}"?`)) return;
    try {
      await deleteResource(token, resource.id);
      await fetchResources();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se pudo dar de baja");
    }
  };

  if (!user) return null;

  const filtered = resources.filter((r) =>
    `${r.name} ${r.description} ${r.id}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageTitle
        eyebrow="Administración"
        title="Gestión de recursos"
        subtitle="Registrá recursos y marcá su estado: baja, mantenimiento o disponibilidad."
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} />
            {showForm ? "Cerrar formulario" : "Nuevo recurso"}
          </Button>
        }
      />

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-xl border border-border bg-white p-5"
        >
          <h2 className="mb-4 text-[15px] font-bold">Registrar recurso</h2>
          {formError && (
            <div className="mb-4">
              <Alert kind="error">{formError}</Alert>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">
                Identificador * (ej: proyector-03)
              </span>
              <input
                required
                className={fieldClass}
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="proyector-03"
              />
            </label>
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
              <span className="mb-2 block text-xs font-semibold">Categoría *</span>
              <select
                className={fieldClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold">Descripción *</span>
              <input
                required
                className={fieldClass}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold">
                Especificaciones *
              </span>
              <input
                required
                className={fieldClass}
                value={form.info}
                onChange={(e) => setForm({ ...form, info: e.target.value })}
                placeholder="Ej: 3200 lumen, HDMI, USB"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Estado inicial</span>
              <select
                className={fieldClass}
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">N° de serie</span>
              <input
                className={fieldClass}
                value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">Ubicación</span>
              <input
                className={fieldClass}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ej: Depósito, estante 3"
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Crear recurso"}
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
            aria-label="Buscar recursos"
            placeholder="Buscar recurso…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando recursos…" />
      ) : error ? (
        <ErrorState onRetry={fetchResources} />
      ) : filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Recurso</th>
                <th className="px-5 py-3 font-semibold">Categoría</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Disponible</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3.5">
                    <span className="block font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.id}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.category}</td>
                  <td className="px-5 py-3.5">
                    <select
                      aria-label={`Estado de ${r.name}`}
                      className={`${fieldClass} w-auto py-2 text-xs`}
                      value={r.condition}
                      onChange={(e) => changeCondition(r, e.target.value)}
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                        r.available
                          ? "border-[#d9eade] bg-[#eaf5ee] text-[#2d7451]"
                          : "border-[#f2dede] bg-[#fcEEEE] text-[#a94d4d]"
                      }`}
                    >
                      {r.available ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      disabled={!r.available}
                      onClick={() => handleBaja(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {r.condition === "EN_MANTENIMIENTO" ? (
                        <Wrench size={13} />
                      ) : (
                        <Trash2 size={13} />
                      )}
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
          description="No encontramos recursos con esa búsqueda."
        />
      )}
    </Layout>
  );
}
