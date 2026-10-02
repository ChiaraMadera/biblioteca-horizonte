"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, Alert, LoadingState, EmptyState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getResource } from "@/lib/api";
import { getIconByName } from "@/lib/utils";
import type { Resource } from "@/lib/types";

export default function ResourceDetailPage() {
  const { token, isDocente } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!token) return;
      setLoading(true);
      setError(false);
      try {
        const data = await getResource(token, params.id);
        setResource(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [token, params.id]);

  if (loading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (error || !resource) {
    return (
      <Layout>
        <EmptyState
          title="Recurso no encontrado"
          description="El recurso que buscas no existe o fue dado de baja."
          action={<Button onClick={() => router.push("/recursos")}>Volver a recursos</Button>}
        />
      </Layout>
    );
  }

  const Icon = getIconByName(resource.icon);

  return (
    <Layout>
      <Button
        variant="ghost"
        onClick={() => router.push("/recursos")}
        className="mb-5"
      >
        <ArrowLeft size={14} />
        Volver a recursos
      </Button>
      <PageTitle
        eyebrow={resource.category}
        title={resource.name}
        subtitle={resource.description}
      />
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className={`flex h-56 items-center justify-center ${resource.tone}`}>
            <Icon size={100} strokeWidth={1} />
          </div>
          <div className="space-y-5 p-6">
            <h2 className="text-lg font-bold">Información del recurso</h2>
            <p className="text-sm leading-7 text-muted-foreground">{resource.info}</p>
            {resource.location && (
              <p className="text-xs leading-6 text-muted-foreground">
                <strong>Ubicación:</strong> {resource.location}
              </p>
            )}
            {resource.serial_number && (
              <p className="text-xs leading-6 text-muted-foreground">
                <strong>Número de serie:</strong> {resource.serial_number}
              </p>
            )}
          </div>
        </div>
        <div className="h-fit space-y-5 rounded-xl border border-border bg-white p-6">
          <h2 className="font-bold">Disponibilidad</h2>
          <Alert
            kind={resource.available ? "info" : "error"}
            title={resource.available ? "Disponible para solicitar" : "Recurso no disponible"}
          >
            {resource.available
              ? "Una solicitud no garantiza la disponibilidad. La bibliotecaria debe revisar y confirmar el turno seleccionado."
              : "Este recurso está en mantenimiento. Elegí otro recurso o volvé a consultar más adelante."}
          </Alert>
          {isDocente && (
            <Button
              className="w-full"
              disabled={!resource.available}
              onClick={() => router.push(`/nueva-solicitud?recurso=${resource.id}`)}
            >
              <Plus size={16} />
              Solicitar recurso
            </Button>
          )}
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck size={16} />
            Las solicitudes se revisan antes de confirmarse.
          </p>
        </div>
      </div>
    </Layout>
  );
}
