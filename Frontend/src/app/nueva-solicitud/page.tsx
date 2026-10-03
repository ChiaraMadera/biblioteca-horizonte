"use client";

import { useEffect, useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button, PageTitle, Alert, LoadingState } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getResources, getAvailability, createRequest } from "@/lib/api";
import { fieldClass, shifts, modules, today } from "@/lib/utils";
import type { Resource, Shift, Module } from "@/lib/types";

function NewRequestForm() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resources, setResources] = useState<Resource[]>([]);
const [availability, setAvailability] = useState<
  { shift: Shift; module: Module; available: boolean }[]
>([]);
const [loadingResources, setLoadingResources] = useState(true);
const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    resourceId: searchParams.get("recurso") || "",
    date: "",
    shift: "" as Shift | "",
    module: "" as Module | "",
    notes: "",
  });

  useEffect(() => {
    if (!token) return;
    getResources(token)
      .then((data) => setResources(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingResources(false));
  }, [token]);

    useEffect(() => {
    if (!token || !form.resourceId || !form.date) {
      setAvailability([]);
      return;
    }

    setLoadingAvailability(true);
    setError("");

    getAvailability(token, form.resourceId, form.date)
      .then((data) => {
        setAvailability(data);
        setForm((current) => ({
          ...current,
          shift: "",
          module: "",
        }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingAvailability(false));
  }, [token, form.resourceId, form.date]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.resourceId || !form.date || !form.shift || !form.module) {
      setError("Por favor completá todos los campos obligatorios.");
      return;
    }

    if (!token || !user) return;

    setSubmitting(true);
    setError("");

    try {
      const created = await createRequest(token, {
        resource_id: form.resourceId,
        teacher: user.name,
        date: form.date,
        shift: form.shift as Shift,
        module: form.module as Module,
        notes: form.notes || undefined,
      });
      router.push(`/solicitudes/${created.id}/enviada`);
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        err.status === 409
      ) {
        setForm((current) => ({
          ...current,
          module: "",
        }));

        if (token && form.resourceId && form.date) {
          try {
            const updatedAvailability = await getAvailability(
              token,
              form.resourceId,
              form.date
          );
          setAvailability(updatedAvailability);
        } catch {
          // Mantener el mensaje original de conflicto.
        }
      }    

      setError(
        "Ese horario acaba de ser ocupado. Actualizamos la disponibilidad; elegí otro módulo."
      );
    } else {
      setError(
        err instanceof Error
          ? err.message
          : "Error al crear la solicitud"
      );
       
    }
  } finally {
      setSubmitting(false);
    }
  };

  if (loadingResources) {
    return <LoadingState message="Cargando recursos disponibles..." />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {error && (
        <div className="mb-6">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="resourceId" className="mb-2 block text-xs font-semibold">
            Recurso *
          </label>
          <select
            id="resourceId"
            className={fieldClass}
            value={form.resourceId}
            onChange={(e) =>
              setForm({
                ...form,
                resourceId: e.target.value,
                shift: "",
                module: "",
              })
            }
            required
          >
            <option value="">Seleccionar un recurso...</option>
            {resources.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name} ({res.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-xs font-semibold">
            Fecha de reserva *
          </label>
          <input
            id="date"
            type="date"
            className={fieldClass}
            value={form.date}
            min={today()}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
                shift: "",
                module: "",
              })  
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shift" className="mb-2 block text-xs font-semibold">
              Turno *
            </label>
            <select
              id="shift"
              className={fieldClass}
              value={form.shift}
              onChange={(e) =>
                setForm({ ...form, shift: e.target.value as Shift, module: "" })
              }
              required
            >
              <option value="">Seleccionar turno...</option>
              {shifts
                .filter((s) =>
                  availability.some((slot) => slot.shift === s && slot.available)
                )
                .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="module" className="mb-2 block text-xs font-semibold">
              Módulo *
            </label>
            <select
              id="module"
              className={fieldClass}
              value={form.module}
              onChange={(e) => setForm({ ...form, module: e.target.value as Module })}
              disabled={!form.shift}
              required
            >
              <option value="">
                {form.shift ? "Seleccionar módulo..." : "Primero elegí un turno..."}
              </option>
              {(form.shift ? modules[form.shift] : [])
                .filter((m) =>
                  availability.some(
                    (slot) =>
                      slot.shift === form.shift &&
                      slot.module === m &&
                      slot.available
                  )
                )
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-2 block text-xs font-semibold">
            Notas o aclaraciones opcionales
          </label>
          <textarea
            id="notes"
            rows={3}
            className={fieldClass}
            placeholder="Ej: Requiero proyector y conector HDMI..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Volver
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar Solicitud
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Layout>
      <PageTitle
        eyebrow="Reserva de Recursos"
        title="Nueva Solicitud"
        subtitle="Completá el formulario para solicitar un recurso para tu clase."
      />
      <Suspense fallback={<LoadingState message="Cargando..." />}>
        <NewRequestForm />
      </Suspense>
    </Layout>
  );
}