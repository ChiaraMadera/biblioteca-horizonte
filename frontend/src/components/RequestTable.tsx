"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import type { Request, Resource } from "@/lib/types";
import { getIconByName, dateLabel, timeLabel } from "@/lib/utils";
import { Badge, Button, EmptyState } from "./ui";

export function RequestTable({
  items,
  resources,
  admin = false,
  compact = false,
  onNewRequest,
}: {
  items: Request[];
  resources: Resource[];
  admin?: boolean;
  compact?: boolean;
  onNewRequest?: () => void;
}) {
  const resourceById = (id: string) => resources.find((r) => r.id === id);

  if (!items.length)
    return (
      <EmptyState
        title="No hay solicitudes"
        description="Las solicitudes que registres aparecerán aquí, junto con su estado."
        action={
          !admin && onNewRequest ? (
            <Button onClick={onNewRequest}>
              <Plus size={15} />
              Nueva solicitud
            </Button>
          ) : undefined
        }
      />
    );

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-y border-border bg-[#fafbfA] text-[10px] font-medium text-muted-foreground">
            <tr>
              {admin && <th className="px-5 py-3 font-medium">Docente</th>}
              <th className="px-5 py-3 font-medium">Recurso</th>
              <th className="px-4 py-3 font-medium">Fecha de uso</th>
              <th className="px-4 py-3 font-medium">Horario / Módulo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              {!compact && (
                <th className="px-4 py-3 font-medium">Fecha de solicitud</th>
              )}
              <th className="px-5 py-3 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((request) => {
              const resource = resourceById(request.resource_id);
              if (!resource) return null;
              const Icon = getIconByName(resource.icon);
              return (
                <tr
                  key={request.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  {admin && (
                    <td className="px-5 py-4 text-[11px] font-medium">
                      {request.teacher}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <Link
                      href={`/solicitudes/${request.id}`}
                      className="flex items-center gap-2.5 text-[12px] font-semibold"
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${resource.tone}`}
                      >
                        <Icon size={16} strokeWidth={1.6} />
                      </span>
                      {resource.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[11px]">
                    {dateLabel(request.date)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="block whitespace-nowrap text-[11px]">
                      {request.shift.split(" · ")[0]}{" "}
                      <span className="text-muted-foreground">
                        · {request.module.split(" · ")[1]}
                      </span>
                    </span>
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      {request.module.split(" · ")[0]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge status={request.status} />
                  </td>
                  {!compact && (
                    <td className="px-4 py-4 text-[11px] text-muted-foreground">
                      {timeLabel(request.created_at)}
                    </td>
                  )}
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/solicitudes/${request.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                    >
                      Ver
                      <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-border md:hidden">
        {items.map((request) => {
          const resource = resourceById(request.resource_id);
          if (!resource) return null;
          return (
            <Link
              key={request.id}
              href={`/solicitudes/${request.id}`}
              className="block p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{resource.name}</span>
                <Badge status={request.status} />
              </div>
              {admin && (
                <p className="mb-1 text-xs text-muted-foreground">
                  {request.teacher}
                </p>
              )}
              <div className="flex items-end justify-between">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{dateLabel(request.date)}</p>
                  <p>
                    {request.shift.split(" · ")[0]} · {request.module}
                  </p>
                  <p className="text-[10px]">
                    Solicitada el {timeLabel(request.created_at)}
                  </p>
                </div>
                <ChevronRight size={16} className="text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
