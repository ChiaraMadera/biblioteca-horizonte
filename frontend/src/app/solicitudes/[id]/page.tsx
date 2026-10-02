"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  LoaderCircle,
  ArrowRight,
  Ban,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, Badge, Alert, LoadingState, EmptyState } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/lib/auth";
import { getRequest, getResources, reviewRequest, cancelRequest } from "@/lib/api";
import { dateLabel, timeLabel, getIconByName } from "@/lib/utils";
import type { Request, Resource } from "@/lib/types";

export default function RequestDetailPage() {
  const { token, user, isAdmin } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [request, setRequest] = useState<Request | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<"confirmar" | "rechazar" | "conflict" | "cancelar" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
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

  useEffect(() => {
    fetchData();
  }, [token, params.id]);

  useEffect(() => {
    const action = searchParams.get("accion");
    if (isAdmin && request?.status === "PENDIENTE" && (action === "confirmar" || action === "rechazar")) {
      setModal(action);
    }
  }, [searchParams, isAdmin, request?.status]);

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

  if (!isAdmin && request.user_id !== user?.id) {
    return (
      <Layout>
        <EmptyState
          title="Acceso no permitido"
          description="Esta solicitud no te pertenece."
          action={<Button onClick={() => router.push("/solicitudes")}>Volver a mis solicitudes</Button>}
        />
      </Layout>
    );
  }

  const resource = resources.find((r) => r.id === request.resource_id);
  if (!resource) return null;

  const Icon = getIconByName(resource.icon);
  const conflicting = resources.length > 0 && request.status === "PENDIENTE";

  const closeModal = () => {
    if (processing) return;
    setModal(null);
    setActionError("");
    router.replace(`/solicitudes/${request.id}`);
  };

  const process = async () => {
    if (processing || !request) return;

    // Procesar cancelación (docente)
    if (modal === "cancelar") {
      if (!token || !user || request.user_id !== user.id) return;
      setProcessing(true);
      setActionError("");
      try {
        const updated = await cancelRequest(token, request.id);
        setRequest(updated);
        setModal(null);
        router.push(`/solicitudes/${request.id}`);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Error al cancelar la solicitud");
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Procesar confirmación/rechazo (admin)
    if (!isAdmin || request.status !== "PENDIENTE" || (modal !== "confirmar" && modal !== "rechazar")) return;
    setProcessing(true);
    setActionError("");
    try {
      const newStatus = modal === "confirmar" ? "CONFIRMADA" : "RECHAZADA";
      const updated = await reviewRequest(token!, request.id, newStatus);
      setRequest(updated);
      setModal(null);
      router.push(`/solicitudes/${request.id}/${newStatus === "CONFIRMADA" ? "confirmada" : "rechazada"}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al procesar la solicitud");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <Button
        variant="ghost"
        onClick={() => router.push(isAdmin ? "/pendientes" : "/solicitudes")}
        className="mb-5"
      >
        <ArrowLeft size={14} />
        {isAdmin ? "Volver a solicitudes pendientes" : "Volver a mis solicitudes"}
      </Button>
      <PageTitle
        eyebrow={`${request.id} · Detalle de solicitud`}
        title={`Solicitud de ${resource.name.toLowerCase()}`}
        subtitle={`Registrada el ${timeLabel(request.created_at)}`}
        action={<Badge status={request.status} />}
      />

      <div className="mb-6 flex items-start gap-4 rounded-xl border border-border bg-white p-5">
        <span className="rounded-lg bg-accent p-2 text-primary">
          {request.status === "CONFIRMADA" ? (
            <CircleCheck size={23} />
          ) : request.status === "RECHAZADA" ? (
            <CircleX size={23} />
          ) : (
            <CircleCheck size={23} />
          )}
        </span>
        <div>
          <h2 className="text-base font-bold">Solicitud {request.status}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {request.status === "PENDIENTE"
              ? "El recurso aún no está confirmado. La bibliotecaria debe revisar esta solicitud."
              : request.status === "CONFIRMADA"
                ? "El recurso está confirmado para la fecha, el turno y el módulo indicados."
                : "Podés consultar recursos y enviar una nueva solicitud con otra fecha o módulo."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-border bg-white p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
            <span className={`rounded-lg p-3 ${resource.tone}`}>
              <Icon size={25} />
            </span>
            <div>
              <h2 className="text-sm font-bold">{resource.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{resource.category}</p>
            </div>
          </div>
          <dl className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            {[
              ["Docente", request.teacher],
              ["Fecha de uso", dateLabel(request.date)],
              ["Horario / turno", request.shift],
              ["Módulo", request.module],
              ["Fecha de solicitud", new Date(request.created_at).toLocaleString("es-AR")],
              [
                "Última revisión",
                request.reviewed_at
                  ? `${new Date(request.reviewed_at).toLocaleString("es-AR")}`
                  : "Pendiente de revisión",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="mb-2 text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="mb-2 text-xs font-semibold">Observaciones</h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {request.notes || "Sin observaciones."}
            </p>
          </div>
        </section>
        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-5 text-sm font-bold">Recorrido de la solicitud</h2>
            <div className="flex gap-3">
              <CircleCheck className="shrink-0 text-primary" size={20} />
              <div>
                <p className="text-xs font-semibold">Solicitud enviada</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {timeLabel(request.created_at)}
                </p>
              </div>
            </div>
            <div className="ml-2.5 my-2 h-7 border-l border-border" />
            <div className="flex gap-3">
              <span
                className={`shrink-0 ${
                  request.status === "RECHAZADA"
                    ? "text-destructive"
                    : request.status === "CONFIRMADA"
                      ? "text-primary"
                      : "text-[#916516]"
                }`}
              >
                {request.status === "CONFIRMADA" ? (
                  <CircleCheck size={20} />
                ) : request.status === "RECHAZADA" ? (
                  <CircleX size={20} />
                ) : (
                  <CircleCheck size={20} />
                )}
              </span>
              <div>
                <p className="text-xs font-semibold">
                  {request.status === "PENDIENTE"
                    ? "Pendiente de confirmación"
                    : `Solicitud ${request.status}`}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {request.reviewed_at
                    ? `Revisada el ${timeLabel(request.reviewed_at)}`
                    : "A la espera de revisión"}
                </p>
              </div>
            </div>
          </div>
          {isAdmin && request.status === "PENDIENTE" && (
            <div className="space-y-3 rounded-xl border border-border bg-white p-6">
              <h2 className="mb-4 text-sm font-bold">Revisar solicitud</h2>
              <Button className="w-full" onClick={() => setModal("confirmar")}>
                <CircleCheck size={16} />
                Confirmar solicitud
              </Button>
              <Button
                variant="secondary"
                className="w-full text-destructive"
                onClick={() => setModal("rechazar")}
              >
                <CircleX size={16} />
                Rechazar solicitud
              </Button>
              <p className="text-[11px] leading-5 text-muted-foreground">
                La disponibilidad se verifica antes de confirmar. No se permite confirmar dos
                solicitudes para el mismo recurso, fecha, turno y módulo.
              </p>
            </div>
          )}
          {!isAdmin && request.status === "RECHAZADA" && (
            <Button
              className="w-full"
              onClick={() => router.push(`/nueva-solicitud?recurso=${request.resource_id}`)}
            >
              Crear una nueva solicitud
              <ArrowRight size={15} />
            </Button>
          )}
          {!isAdmin && (request.status === "PENDIENTE" || request.status === "CONFIRMADA") && (
            <Button
              variant="secondary"
              className="w-full text-destructive"
              onClick={() => setModal("cancelar")}
            >
              <Ban size={16} />
              Cancelar solicitud
            </Button>
          )}
        </aside>
      </div>

      {modal && (
        <Modal
          title={
            modal === "conflict"
              ? "Conflicto de disponibilidad"
              : modal === "confirmar"
                ? "Confirmar solicitud"
                : modal === "cancelar"
                  ? "Cancelar solicitud"
                  : "Rechazar solicitud"
          }
          close={closeModal}
        >
          {modal === "conflict" ? (
            <>
              <Alert kind="error" title="Este recurso ya está confirmado para el turno seleccionado.">
                No se puede confirmar esta solicitud porque el recurso ya está confirmado para ese turno.
              </Alert>
              <div className="flex justify-end gap-2 mt-5">
                <Button variant="secondary" onClick={closeModal}>
                  Mantener pendiente
                </Button>
                <Button variant="danger" onClick={() => setModal("rechazar")}>
                  Rechazar solicitud
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                {modal === "confirmar"
                  ? "Se verificará la disponibilidad antes de confirmar. Si no hay conflictos, el recurso quedará confirmado para esta solicitud."
                  : modal === "cancelar"
                    ? "La solicitud pasará a CANCELADA. Esta acción no se puede deshacer."
                    : "La solicitud pasará a RECHAZADA. El docente verá el mensaje de rechazo en el detalle."}
              </p>
              <div className="mb-5 rounded-lg bg-muted p-4 text-xs leading-6">
                <strong>
                  {request.teacher} · {resource.name}
                </strong>
                <p>
                  {dateLabel(request.date)} · {request.module}
                </p>
              </div>
              {actionError && (
                <div className="mb-4">
                  <Alert kind="error">{actionError}</Alert>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="secondary" disabled={processing} onClick={closeModal}>
                  Volver
                </Button>
                <Button
                  variant={modal === "rechazar" || modal === "cancelar" ? "danger" : "primary"}
                  disabled={processing}
                  onClick={process}
                >
                  {processing && <LoaderCircle size={15} className="animate-spin" />}
                  {processing
                    ? "Procesando…"
                    : modal === "confirmar"
                      ? "Confirmar solicitud"
                      : modal === "cancelar"
                        ? "Cancelar solicitud"
                        : "Rechazar solicitud"}
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </Layout>
  );
}
