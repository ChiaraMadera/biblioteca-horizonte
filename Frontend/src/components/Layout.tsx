"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  FileText,
  Plus,
  UserRound,
  LogOut,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Menu,
  CircleHelp,
  ArrowUpRight,
  ExternalLink,
  Users,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
        <BookOpen size={24} strokeWidth={1.7} />
      </span>
      <span>
        <span className="block font-heading text-[17px] font-extrabold leading-5">
          Biblioteca
          <span className="block">
            Horizonte<span className="text-primary">.</span>
          </span>
        </span>
        {!compact && (
          <span className="mt-1 block text-[10px] text-muted-foreground">
            Recursos que acompañan
          </span>
        )}
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, loading, logout, isAdmin, isBibliotecaria } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const roleLabel = isAdmin
    ? "Administrador"
    : isBibliotecaria
      ? "Bibliotecaria"
      : "Docente";

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (!user) return null;

  const name = user.name;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // El administrador solo ve el bloque «Administración»: no se cruza con las
  // tareas del bibliotecario (solicitudes) ni con el espacio del docente.
  const navigation = isAdmin
    ? []
    : [
        { to: "/", label: "Inicio", icon: LayoutDashboard },
        ...(isBibliotecaria
          ? [
              { to: "/pendientes", label: "Solicitudes pendientes", icon: Clock3 },
              { to: "/solicitudes", label: "Solicitudes", icon: FileText },
              { to: "/recursos", label: "Recursos", icon: Library },
            ]
          : [
              { to: "/recursos", label: "Recursos", icon: Library },
              { to: "/nueva-solicitud", label: "Nueva solicitud", icon: Plus },
              { to: "/solicitudes", label: "Mis solicitudes", icon: FileText },
            ]),
      ];

  // Solo el administrador gestiona usuarios, recursos y reportes del sistema
  const adminNavigation = isAdmin
    ? [
        { to: "/admin/dashboard", label: "Panel de control", icon: ShieldCheck },
        { to: "/admin/usuarios", label: "Usuarios", icon: Users },
        { to: "/admin/recursos", label: "Gestión de recursos", icon: LayoutGrid },
        { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
      ]
    : [];

  const section = pathname.startsWith("/admin")
    ? pathname.startsWith("/admin/usuarios")
      ? "Usuarios"
      : pathname.startsWith("/admin/recursos")
        ? "Gestión de recursos"
        : pathname.startsWith("/admin/reportes")
          ? "Reportes"
          : "Panel de control"
    : pathname.startsWith("/recursos")
      ? "Recursos"
      : pathname.startsWith("/nueva")
        ? "Nueva solicitud"
        : pathname.startsWith("/pendientes")
          ? "Solicitudes pendientes"
          : pathname.startsWith("/solicitudes")
            ? isBibliotecaria
              ? "Solicitudes"
              : "Mis solicitudes"
            : pathname === "/perfil"
              ? "Perfil"
              : pathname === "/guia"
                ? "Guía del sistema"
                : "Inicio";

  return (
    <div className="min-h-screen lg:pl-[238px]">
      {mobileOpen && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[238px] flex-col overflow-y-auto border-r border-border bg-white transition-transform lg:visible lg:translate-x-0 ${
          mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="px-6 pb-9 pt-8">
          <Brand />
        </div>
        {navigation.length > 0 && (
          <>
            <div className="px-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {isBibliotecaria ? "Gestión de biblioteca" : "Mi espacio"}
            </div>
            <nav aria-label="Navegación principal" className="mt-4 space-y-1.5 px-3.5">
              {navigation.map(({ to, label, icon: Icon }) => {
                const isActive =
                  to === "/" ? pathname === "/" : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    className={`flex min-h-[45px] items-center gap-3 rounded-lg px-3.5 text-[13px] font-medium transition ${
                      isActive
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.65} />
                    <span className="flex-1">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        {adminNavigation.length > 0 && (
          <>
            <div
              className={`${
                navigation.length > 0 ? "mt-7 " : ""
              }px-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground`}
            >
              Administración
            </div>
            <nav aria-label="Administración" className="mt-4 space-y-1.5 px-3.5">
              {adminNavigation.map(({ to, label, icon: Icon }) => {
                const isActive = pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    className={`flex min-h-[45px] items-center gap-3 rounded-lg px-3.5 text-[13px] font-medium transition ${
                      isActive
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.65} />
                    <span className="flex-1">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        <div className="mt-7 border-t border-border px-3.5 pt-5">
          <Link
            href="/perfil"
            className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-[13px] ${
              pathname === "/perfil"
                ? "bg-accent text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <UserRound size={18} strokeWidth={1.65} />
            Perfil
          </Link>
        </div>
        <div className="mt-auto px-5 pb-5">
          <div className="mb-6 rounded-xl border border-border bg-background p-4">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <CircleHelp size={15} className="text-primary" />
              ¿Cómo funciona?
            </span>
            <p className="text-[11px] leading-5 text-muted-foreground">
              Solicitá un recurso. La bibliotecaria revisará tu solicitud.
            </p>
            <Link
              href="/guia"
              className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-primary"
            >
              Ver guía del sistema
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 border-t border-border px-2 py-4 text-[13px] text-muted-foreground hover:text-destructive"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
          <div className="flex items-center gap-3 rounded-lg bg-muted/70 p-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e0eae3] text-xs font-bold text-primary">
              {initials}
            </span>
            <div>
              <span className="block text-xs font-semibold">{name}</span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">
                {roleLabel}
              </span>
            </div>
            <span className="ml-auto size-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </aside>
      <header className="relative z-20 flex h-[76px] items-center justify-between border-b border-border bg-white px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 lg:hidden"
            aria-label="Abrir navegación"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={21} />
          </button>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {isAdmin
              ? "Administración"
              : isBibliotecaria
                ? "Gestión de biblioteca"
                : "Mi espacio"}
          </span>
          <ChevronRight className="hidden text-muted-foreground sm:block" size={13} />
          <span className="text-xs font-medium">{section}</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="hidden items-center gap-2 text-xs text-muted-foreground xl:flex">
            <CalendarDays size={15} />
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <Link
            href="/perfil"
            className="flex items-center gap-2.5 border-l border-border pl-4"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e9efe9] text-[11px] font-bold text-primary">
              {initials}
            </span>
            <span className="hidden text-xs font-medium sm:block">{name.split(" ")[0]}</span>
            <ChevronDown size={13} className="text-muted-foreground" />
          </Link>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"
      >
        {children}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[10px] text-muted-foreground">
          <span>
            Biblioteca Horizonte · Gestión de recursos institucionales
          </span>
          <Link
            href="/guia"
            className="flex items-center gap-1 hover:text-primary"
          >
            <span className="size-1.5 rounded-full bg-primary/70" />
            Sistema conectado al backend
            <ExternalLink size={10} />
          </Link>
        </footer>
      </main>
    </div>
  );
}

function Clock3(props: { size?: number; strokeWidth?: number }) {
  return <LayoutDashboard {...props} />;
}
