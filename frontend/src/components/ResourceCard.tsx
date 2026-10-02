"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Resource } from "@/lib/types";
import { getIconByName } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function ResourceCard({
  resource,
  compact = false,
}: {
  resource: Resource;
  compact?: boolean;
}) {
  const { isDocente } = useAuth();
  const Icon = getIconByName(resource.icon);
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-white transition hover:border-primary/30">
      <Link
        href={`/recursos/${resource.id}`}
        className={`flex items-center justify-center ${resource.tone} ${
          compact ? "h-[112px]" : "h-36"
        }`}
      >
        <Icon size={compact ? 49 : 58} strokeWidth={1.1} />
      </Link>
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium text-muted-foreground">
            {resource.category}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] ${
              resource.available ? "text-primary" : "text-destructive"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                resource.available ? "bg-primary" : "bg-destructive"
              }`}
            />
            {resource.available ? "Disponible" : "No disponible"}
          </span>
        </div>
        <Link
          href={`/recursos/${resource.id}`}
          className="font-heading text-[14px] font-bold hover:text-primary"
        >
          {resource.name}
        </Link>
        <p className="mb-4 mt-2 text-[12px] leading-5 text-muted-foreground">
          {resource.description}
        </p>
        <Link
          href={
            isDocente && resource.available
              ? `/nueva-solicitud?recurso=${resource.id}`
              : `/recursos/${resource.id}`
          }
          className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-primary"
        >
          {isDocente && resource.available ? "Solicitar recurso" : "Ver detalle"}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
