"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, Badge, LoadingState, EmptyState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getRequest, getResources } from "@/lib/api";
import { dateLabel } from "@/lib/utils";
import type { Request, Resource } from "@/lib/types";

export default function ConfirmadaPage() {
  const { token, isAdmin } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [req, res] = await Promise.all([
          getRequest(token, params.id),
          getResources(token),
        ]);
        setRequest(req);
        setResources(res);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, params.id]);

  if (loading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (error || !request) {
    return (
      <Layout>
        <EmptyState
          title="Solicitud no encontrada"
          description="La solicitud que buscas no existe."
          action={<Button onClick={() => router.push("/solicitudes")}>Volver a solicitudes</Button>}
        />
      </Layout>
    );
  }

  const resource = resources.find((r) => r.id === request.resource_id);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl py-7">
        <div className="rounded-2xl border border-border bg-white px-6 py-10 text-center sm:px-12">
          <span className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full bg-[#eaf5ee] text-[#2d7451]">
            <CircleCheck size={35} strokeWidth={1.5} />
          </span>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{request.id}</p>
          <h1 className="mb-4 text-2xl font-bold">Solicitud CONFIRMADA</h1>
          <Badge status={request.status} />
          <p className="my-6 text-sm leading-7 text-muted-foreground">
            El recurso está confirmado para la fecha, el turno y el módulo indicados.
          </p>
          <dl className="my-6 grid grid-cols-2 gap-5 rounded-xl bg-muted/60 p-5 text-left text-xs">
            {[
              ["Recurso", resource?.name || "—"],
              ["Fecha", dateLabel(request.date)],
              ["Horario / turno", request.shift],
              ["Módulo", request.module],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="mb-1.5 text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => router.push(isAdmin ? "/pendientes" : "/solicitudes")}>
              {isAdmin ? "Ver solicitudes pendientes" : "Ver mis solicitudes"}
              <ArrowRight size={15} />
            </Button>
            <Button variant="secondary" onClick={() => router.push(`/solicitudes/${request.id}`)}>
              Ver detalle de solicitud
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
