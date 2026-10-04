"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Library,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { Button, Alert } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { fieldClass } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Completá el usuario y la contraseña.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const logged = await login({ email, password });
      // El administrador solo navega por /admin/*, así que entra a su panel.
      router.push(logged.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <aside className="hidden flex-col justify-between bg-[#edf3ee] p-14 lg:flex">
        <div className="flex items-center gap-3">
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
          </span>
        </div>
        <div className="max-w-md">
          <span className="mb-8 flex size-20 items-center justify-center rounded-2xl border border-primary/15 bg-white/50 text-primary">
            <Library size={43} strokeWidth={1.2} />
          </span>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Biblioteca Horizonte
          </p>
          <h1 className="text-[42px] font-bold leading-[1.25]">
            Recursos compartidos.
            <br />
            Más posibilidades.
          </h1>
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            Un espacio para conectar tus clases con los recursos de nuestra
            biblioteca. Solicitá, consultá y seguí cada solicitud en un solo
            lugar.
          </p>
          <div className="mt-9 flex items-center gap-3 text-xs text-primary">
            <ShieldCheck size={19} />
            Solicitud → Revisión → Confirmación o rechazo
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Proyecto integrador · Ingeniería de Software · 2026
        </p>
      </aside>
      <main className="flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
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
              </span>
            </div>
          </div>
          <p className="mb-2 text-xs font-semibold text-primary">
            BIENVENIDO A TU BIBLIOTECA
          </p>
          <h2 className="text-3xl font-bold">Iniciar sesión</h2>
          <p className="mb-7 mt-3 text-sm text-muted-foreground">
            Accedé a tu espacio de gestión de recursos.
          </p>
          <form onSubmit={submit} noValidate className="space-y-5">
            {error && <Alert kind="error">{error}</Alert>}
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold">
                Usuario / email
              </label>
              <input
                id="email"
                autoComplete="username"
                type="email"
                className={fieldClass}
                placeholder="nombre@horizonte.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!error}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  autoComplete="current-password"
                  type={show ? "text" : "password"}
                  className={`${fieldClass} pr-12`}
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-3 text-muted-foreground"
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? "Iniciando sesión…" : "Iniciar sesión"}
            </Button>
          </form>
          <p className="mt-5 text-center text-[10px] leading-5 text-muted-foreground">
            Prototipo académico. No ingreses credenciales reales.
          </p>
        </div>
      </main>
    </div>
  );
}
