"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import {
  Clock3,
  CircleCheck,
  CircleX,
  Info,
  AlertTriangle,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import type { RequestStatus } from "@/lib/types";

type Status = RequestStatus;

const statusConfig: Record<
  Status,
  {
    icon: LucideIcon;
    color: string;
    surface: string;
    message: string;
    description: string;
    label: string;
  }
> = {
  PENDIENTE: {
    icon: Clock3,
    color: "bg-[#fff6e5] text-[#916516] border-[#f2e5c9]",
    surface: "bg-[#fffbf2] border-[#f1e5cb]",
    message: "Tu solicitud fue registrada y está pendiente de confirmación.",
    description: "A la espera de revisión",
    label: "Pendientes",
  },
  CONFIRMADA: {
    icon: CircleCheck,
    color: "bg-[#eaf5ee] text-[#2d7451] border-[#d9eade]",
    surface: "bg-[#f1f8f3] border-[#d9eade]",
    message: "La solicitud fue confirmada correctamente.",
    description: "Recursos confirmados",
    label: "Confirmadas",
  },
  RECHAZADA: {
    icon: CircleX,
    color: "bg-[#fcEEEE] text-[#a94d4d] border-[#f2dede]",
    surface: "bg-[#fff5f5] border-[#f2dede]",
    message: "La solicitud fue rechazada.",
    description: "Solicitudes no aprobadas",
    label: "Rechazadas",
  },
  CANCELADA: {
    icon: CircleX,
    color: "bg-[#fcEEEE] text-[#a94d4d] border-[#f2dede]",
    surface: "bg-[#fff5f5] border-[#f2dede]",
    message: "La solicitud fue cancelada.",
    description: "Solicitudes canceladas",
    label: "Canceladas",
  },
};

export function Button({
  children,
  variant = "primary",
  className = "",
  to,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  to?: string;
}) {
  const variants = {
    primary: "border-primary bg-primary text-white hover:bg-[#1d503d]",
    secondary: "border-border bg-white text-foreground hover:bg-muted",
    danger: "border-destructive bg-destructive text-white hover:bg-[#903636]",
    ghost:
      "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  };
  const classes = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`;
  if (to)
    return (
      <Link href={to} className={classes}>
        {children}
      </Link>
    );
  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}

export function Badge({ status }: { status: Status }) {
  const { icon: Icon, color } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-[0.035em] ${color}`}
    >
      <Icon size={12} strokeWidth={2} />
      {status}
    </span>
  );
}

export function Alert({
  children,
  title,
  kind = "info",
}: {
  children: ReactNode;
  title?: string;
  kind?: "info" | "error" | "success" | "warning";
}) {
  const Icon =
    kind === "success"
      ? CircleCheck
      : kind === "warning" || kind === "error"
        ? AlertTriangle
        : Info;
  const colors = {
    info: "bg-secondary/60 text-primary border-[#dbe8df]",
    success: "bg-[#edf7ef] text-[#286440] border-[#d5e9db]",
    warning: "bg-[#fff9ed] text-[#886017] border-[#efe0bf]",
    error: "bg-[#fff3f3] text-[#a13e3e] border-[#f0d7d7]",
  };
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-lg border px-4 py-3.5 text-[13px] leading-6 ${colors[kind]}`}
    >
      <Icon className="mt-0.5 shrink-0" size={18} />
      <div>
        {title && <strong className="block font-semibold">{title}</strong>}
        {children}
      </div>
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[26px] font-bold leading-[1.35] sm:text-[29px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
      <span className="mb-4 rounded-full bg-muted p-4">
        <Inbox size={28} className="text-muted-foreground" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-5 mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  );
}

export function LoadingState({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Error al cargar",
  description = "No pudimos cargar la información. Intentá nuevamente.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button onClick={onRetry}>Reintentar</Button>
        ) : undefined
      }
    />
  );
}
