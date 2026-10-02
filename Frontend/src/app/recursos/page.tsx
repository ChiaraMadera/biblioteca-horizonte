"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { ResourceCard } from "@/components/ResourceCard";
import { useAuth } from "@/lib/auth";
import { getResources } from "@/lib/api";
import { fieldClass } from "@/lib/utils";
import type { Resource, ResourceCategory } from "@/lib/types";

export default function ResourcesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const fetchResources = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getResources(token);
      setResources(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [token]);

  const filtered = resources.filter(
    (resource) =>
      `${resource.name} ${resource.description}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === "Todos" || resource.category === category) &&
      (!onlyAvailable || resource.available)
  );

  return (
    <Layout>
      <PageTitle
        eyebrow="Catálogo institucional"
        title="Recursos"
        subtitle="Consultá los recursos disponibles y solicitá el que necesitás."
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search size={17} className="absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            aria-label="Buscar recursos"
            placeholder="Buscar un recurso…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${fieldClass} pl-10`}
          />
        </div>
        <select
          aria-label="Filtrar por categoría"
          className={`${fieldClass} w-auto`}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {["Todos", "Equipamiento", "Espacios", "Material bibliográfico"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={onlyAvailable}
            onChange={(event) => setOnlyAvailable(event.target.checked)}
          />
          Solo disponibles
        </label>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={fetchResources} />
      ) : filtered.length ? (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            {filtered.length} recursos · La disponibilidad final se verifica al confirmar.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No hay resultados"
          description="No encontramos recursos con esos filtros. Probá otra búsqueda."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("Todos");
                setOnlyAvailable(false);
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      )}
    </Layout>
  );
}
