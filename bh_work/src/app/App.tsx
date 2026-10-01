"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type FormEvent,
} from "react"
import NextLink from "next/link"
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
} from "next/navigation"
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
  Clock3,
  CircleCheck,
  CircleX,
  CalendarDays,
  Bell,
  ChevronDown,
  Search,
  Laptop,
  Projector,
  Armchair,
  Volume2,
  BookMarked,
  Tablet,
  Info,
  X,
  Menu,
  AlertTriangle,
  Eye,
  EyeOff,
  LoaderCircle,
  Check,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  CircleHelp,
  Inbox,
  type LucideIcon,
} from "lucide-react"

type LocationLike = { pathname: string; search: string }

type NavigateFn = ((href: string, options?: { replace?: boolean }) => void) & {
  push: (href: string) => void
  replace: (href: string) => void
  back: () => void
}

function useNavigate(): NavigateFn {
  const router = useRouter()
  const signalNavigation = () => {
    if (typeof window !== "undefined") {
      window.setTimeout(() => window.dispatchEvent(new Event("bh:navigation")), 0)
    }
  }
  const navigate = ((href: string, options?: { replace?: boolean }) => {
    if (options?.replace) router.replace(href)
    else router.push(href)
    signalNavigation()
  }) as NavigateFn
  navigate.push = navigate
  navigate.replace = (href: string) => {
    router.replace(href)
    signalNavigation()
  }
  navigate.back = () => {
    router.back()
    signalNavigation()
  }
  return navigate
}

function useLocation(): LocationLike {
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  useEffect(() => {
    const sync = () => setSearch(window.location.search)
    sync()
    window.addEventListener("bh:navigation", sync)
    window.addEventListener("popstate", sync)
    return () => {
      window.removeEventListener("bh:navigation", sync)
      window.removeEventListener("popstate", sync)
    }
  }, [pathname])
  return { pathname, search }
}

function useParams<T extends Record<string, string>>() {
  return useNextParams() as T
}

function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate()
  useEffect(() => {
    if (replace) navigate.replace(to)
    else navigate.push(to)
  }, [navigate, replace, to])
  return null
}

type AppLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  to: string
}
function Link({ to, children, ...props }: AppLinkProps) {
  return (
      <NextLink href={to} {...props}>
        {children}
      </NextLink>
  )
}

type NavLinkProps = Omit<AppLinkProps, "className"> & {
  end?: boolean
  className?: string | ((args: { isActive: boolean }) => string)
}
function NavLink({ to, end = false, className, children, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  const resolvedClass = typeof className === "function" ? className({ isActive }) : className
  return (
      <Link to={to} {...props} className={resolvedClass}>
        {children}
      </Link>
  )
}

// -------------------------------------------------------------
// MODELOS Y TIPOS AJUSTADOS SEGÚN ESTRUCTURA BACKEND JSON
// -------------------------------------------------------------
type Role = "docente" | "bibliotecaria" | "admin"
type UserStatus = "ACTIVO" | "INACTIVO" | "SUSPENDIDO"
type Status = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA"
type ResourceCategory = "Equipamiento" | "Espacios" | "Material bibliográfico"
type ResourceCondition = "EXCELENTE" | "BUENO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
type Shift = "Mañana · 08:00–12:00" | "Tarde · 13:00–17:00"
type Module =
    | "Módulo 1 · 08:00–09:20"
    | "Módulo 2 · 09:30–10:50"
    | "Módulo 3 · 11:00–12:00"
    | "Módulo 1 · 13:00–14:20"
    | "Módulo 2 · 14:30–15:50"
    | "Módulo 3 · 16:00–17:00"

type Scenario = "normal" | "empty" | "connection" | "load"

type Resource = {
  id: string
  name: string
  category: ResourceCategory
  description: string
  info: string
  icon: string
  available: boolean
  condition?: ResourceCondition
  serialNumber?: string
  location?: string
  tone: string
}

type Request = {
  id: string
  resourceId: string
  userId: string
  teacher: string
  date: string
  shift: Shift | string
  module: Module | string
  notes?: string
  status: Status
  created: string
  reviewedBy?: string | null
  reviewedAt?: string | null
}

// Mapeador de strings de iconos a componentes Lucide
const iconMap: Record<string, LucideIcon> = {
  Projector,
  Armchair,
  Laptop,
  Volume2,
  BookMarked,
  Tablet,
}

const getResourceIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Info
}

const resources: Resource[] = [
  {
    id: "proyector",
    name: "Proyector multimedia",
    category: "Equipamiento",
    description: "Presentaciones, clases y contenido audiovisual en el aula.",
    info: "Incluye cable HDMI y control remoto. Retiro en biblioteca.",
    icon: "Projector",
    available: true,
    condition: "EXCELENTE",
    location: "Estante 3 - Depósito B",
    tone: "bg-[#edf1ea] text-[#60765a]",
  },
  {
    id: "sala",
    name: "Sala de lectura",
    category: "Espacios",
    description: "Un espacio tranquilo para lectura y actividades grupales.",
    info: "Capacidad de 20 personas. Ubicada en planta baja.",
    icon: "Armchair",
    available: true,
    condition: "EXCELENTE",
    location: "Planta Baja",
    tone: "bg-[#f4eee4] text-[#92754a]",
  },
  {
    id: "notebook",
    name: "Notebook",
    category: "Equipamiento",
    description: "Equipo portátil para acompañar tus actividades educativas.",
    info: "Incluye cargador. Uso dentro de la institución.",
    icon: "Laptop",
    available: true,
    condition: "BUENO",
    location: "Carro de carga",
    tone: "bg-[#eaf0f4] text-[#587687]",
  },
  {
    id: "sonido",
    name: "Equipo de sonido",
    category: "Equipamiento",
    description: "Parlante portátil para actividades en el aula.",
    info: "Conexión Bluetooth y auxiliar. Incluye micrófono.",
    icon: "Volume2",
    available: true,
    condition: "BUENO",
    location: "Depósito A",
    tone: "bg-[#f0ecf5] text-[#7a648a]",
  },
  {
    id: "lectura",
    name: "Kit de lectura",
    category: "Material bibliográfico",
    description: "Selección de libros para trabajar la lectura compartida.",
    info: "15 ejemplares. Consultar el contenido al retirar.",
    icon: "BookMarked",
    available: true,
    condition: "EXCELENTE",
    location: "Sector Literatura",
    tone: "bg-[#f4eee4] text-[#92754a]",
  },
  {
    id: "tablet",
    name: "Tablet",
    category: "Equipamiento",
    description: "Dispositivo para actividades y consultas digitales.",
    info: "Temporalmente fuera de servicio por mantenimiento.",
    icon: "Tablet",
    available: false,
    condition: "EN_MANTENIMIENTO",
    location: "Servicio Técnico",
    tone: "bg-muted text-muted-foreground",
  },
]

const initialRequests: Request[] = [
  {
    id: "BH-0018",
    resourceId: "proyector",
    userId: "d8329b14-8f76-4d45-9271-70bf81d19b78",
    teacher: "Martín Fernández",
    date: "2026-10-05",
    shift: "Mañana · 08:00–12:00",
    module: "Módulo 1 · 08:00–09:20",
    notes: "Presentación para la clase de Ciencias Naturales.",
    status: "PENDIENTE",
    created: "2026-09-30T09:15:00",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "BH-0017",
    resourceId: "sala",
    userId: "d8329b14-8f76-4d45-9271-70bf81d19b78",
    teacher: "Martín Fernández",
    date: "2026-10-06",
    shift: "Mañana · 08:00–12:00",
    module: "Módulo 2 · 09:30–10:50",
    notes: "Lectura compartida con el grupo de segundo año.",
    status: "PENDIENTE",
    created: "2026-09-29T14:30:00",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "BH-0016",
    resourceId: "notebook",
    userId: "d8329b14-8f76-4d45-9271-70bf81d19b78",
    teacher: "Martín Fernández",
    date: "2026-10-07",
    shift: "Tarde · 13:00–17:00",
    module: "Módulo 1 · 13:00–14:20",
    notes: "",
    status: "PENDIENTE",
    created: "2026-09-29T10:20:00",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "BH-0015",
    resourceId: "proyector",
    userId: "d8329b14-8f76-4d45-9271-70bf81d19b78",
    teacher: "Martín Fernández",
    date: "2026-10-02",
    shift: "Mañana · 08:00–12:00",
    module: "Módulo 1 · 08:00–09:20",
    notes: "Clase de Geografía.",
    status: "CONFIRMADA",
    created: "2026-09-28T11:00:00",
    reviewedBy: "c381f2ba-24a9-4672-882f-2d7c4a1797c2",
    reviewedAt: "2026-09-29T08:30:00",
  },
  {
    id: "BH-0014",
    resourceId: "lectura",
    userId: "d8329b14-8f76-4d45-9271-70bf81d19b78",
    teacher: "Martín Fernández",
    date: "2026-10-01",
    shift: "Tarde · 13:00–17:00",
    module: "Módulo 2 · 14:30–15:50",
    notes: "",
    status: "CONFIRMADA",
    created: "2026-09-28T09:00:00",
    reviewedBy: "c381f2ba-24a9-4672-882f-2d7c4a1797c2",
    reviewedAt: "2026-09-28T12:00:00",
  },
  {
    id: "BH-0013",
    resourceId: "sala",
    userId: "d8329b14-8f76-4d45-9271-70bf81d19b78",
    teacher: "Martín Fernández",
    date: "2026-09-29",
    shift: "Mañana · 08:00–12:00",
    module: "Módulo 1 · 08:00–09:20",
    notes: "",
    status: "RECHAZADA",
    created: "2026-09-25T08:00:00",
    reviewedBy: "c381f2ba-24a9-4672-882f-2d7c4a1797c2",
    reviewedAt: "2026-09-26T10:00:00",
  },
  {
    id: "BH-0019",
    resourceId: "proyector",
    userId: "7cf3d3b7-7892-4f33-b1d5-eef41b619421",
    teacher: "Ana Rodríguez",
    date: "2026-10-02",
    shift: "Mañana · 08:00–12:00",
    module: "Módulo 1 · 08:00–09:20",
    notes: "Actividad audiovisual. Ejemplo de solicitud con conflicto.",
    status: "PENDIENTE",
    created: "2026-09-30T10:00:00",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "BH-0020",
    resourceId: "sonido",
    userId: "fa25de4a-5c21-4f11-9a99-cfd0725ee190",
    teacher: "Diego López",
    date: "2026-10-08",
    shift: "Tarde · 13:00–17:00",
    module: "Módulo 2 · 14:30–15:50",
    notes: "Actividad de expresión oral.",
    status: "PENDIENTE",
    created: "2026-09-30T11:00:00",
    reviewedBy: null,
    reviewedAt: null,
  },
]

const statusConfig: Record<
    Status,
    {
      icon: LucideIcon
      color: string
      surface: string
      message: string
      description: string
      label: string
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
    color: "bg-muted text-muted-foreground border-border",
    surface: "bg-muted/30 border-border",
    message: "La solicitud fue cancelada.",
    description: "Solicitudes canceladas",
    label: "Canceladas",
  },
}

const resourceById = (id: string): Resource =>
    resources.find((resource) => resource.id === id) || resources[0]

const dateLabel = (date: string) =>
    new Date(`${date}T12:00:00`)
        .toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/\./g, "")

const timeLabel = (date: string) =>
    new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const fieldClass =
    "w-full rounded-lg border border-border bg-white px-3.5 py-3 text-sm text-foreground transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted disabled:text-muted-foreground"

type AppContextValue = {
  role: Role | null
  setRole: (role: Role | null) => void
  requests: Request[]
  setRequests: React.Dispatch<React.SetStateAction<Request[]>>
  notify: (text: string) => void
  scenario: Scenario
  setScenario: (value: Scenario) => void
}

const AppContext = createContext<AppContextValue>(null!)
const useApp = () => useContext(AppContext)

function Button({
                  children,
                  variant = "primary",
                  className = "",
                  to,
                  ...props
                }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  to?: string
}) {
  const variants = {
    primary: "border-primary bg-primary text-white hover:bg-[#1d503d]",
    secondary: "border-border bg-white text-foreground hover:bg-muted",
    danger: "border-destructive bg-destructive text-white hover:bg-[#903636]",
    ghost:
        "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  }
  const classes = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`
  if (to)
    return (
        <Link to={to} className={classes}>
          {children}
        </Link>
    )
  return (
      <button {...props} className={classes}>
        {children}
      </button>
  )
}

function Badge({ status }: { status: Status }) {
  const { icon: Icon, color } = statusConfig[status]
  return (
      <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-[0.035em] ${color}`}
      >
      <Icon size={12} strokeWidth={2} />
        {status}
    </span>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
      <Link to="/" className="flex items-center gap-3">
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
  )
}

function Alert({
                 children,
                 title,
                 kind = "info",
               }: {
  children: ReactNode
  title?: string
  kind?: "info" | "error" | "success" | "warning"
}) {
  const Icon =
      kind === "success"
          ? CircleCheck
          : kind === "warning" || kind === "error"
              ? AlertTriangle
              : Info
  const colors = {
    info: "bg-secondary/60 text-primary border-[#dbe8df]",
    success: "bg-[#edf7ef] text-[#286440] border-[#d5e9db]",
    warning: "bg-[#fff9ed] text-[#886017] border-[#efe0bf]",
    error: "bg-[#fff3f3] text-[#a13e3e] border-[#f0d7d7]",
  }
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
  )
}

function PageTitle({
                     eyebrow,
                     title,
                     subtitle,
                     action,
                   }: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
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
  )
}

function EmptyState({
                      title,
                      description,
                      action,
                    }: {
  title: string
  description: string
  action?: ReactNode
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
  )
}

function DataState({
                     children,
                     emptyTitle,
                   }: {
  children: ReactNode
  emptyTitle: string
}) {
  const { scenario, setScenario } = useApp()
  if (scenario === "empty")
    return (
        <EmptyState
            title={emptyTitle}
            description="No hay información para mostrar en esta vista."
            action={
              <Button variant="secondary" onClick={() => setScenario("normal")}>
                Restaurar datos de ejemplo
              </Button>
            }
        />
    )
  if (scenario !== "normal")
    return (
        <EmptyState
            title={
              scenario === "connection"
                  ? "Error de conexión"
                  : "Error al cargar información"
            }
            description={
              scenario === "connection"
                  ? "No pudimos conectarnos. Verificá tu conexión e intentá nuevamente."
                  : "No pudimos cargar la información. Tus solicitudes no se han modificado."
            }
            action={
              <Button onClick={() => setScenario("normal")}>
                <RefreshCw size={15} />
                Reintentar
              </Button>
            }
        />
    )
  return <>{children}</>
}

function Layout({ children }: { children: ReactNode }) {
  const { role, setRole, requests, scenario, setScenario } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileOpen(false)
    setNotifications(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!role) return <Navigate to="/login" replace />

  const isStaff = role === "bibliotecaria" || role === "admin"
  const name = isStaff ? "Lucía" : "Martín Fernández"
  const pending = requests.filter(
      (request) =>
          request.status === "PENDIENTE" &&
          (isStaff || request.teacher === "Martín Fernández"),
  ).length

  const navigation = [
    { to: "/", label: "Inicio", icon: LayoutDashboard },
    ...(isStaff
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
  ]

  const section = location.pathname.startsWith("/recursos")
      ? "Recursos"
      : location.pathname.startsWith("/nueva")
          ? "Nueva solicitud"
          : location.pathname.startsWith("/pendientes")
              ? "Solicitudes pendientes"
              : location.pathname.startsWith("/solicitudes")
                  ? isStaff
                      ? "Solicitudes"
                      : "Mis solicitudes"
                  : location.pathname === "/perfil"
                      ? "Perfil"
                      : location.pathname === "/guia"
                          ? "Guía del prototipo"
                          : "Inicio"

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
          <div className="px-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {isStaff ? "Gestión de biblioteca" : "Mi espacio"}
          </div>
          <nav
              aria-label="Navegación principal"
              className="mt-4 space-y-1.5 px-3.5"
          >
            {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                        `flex min-h-[45px] items-center gap-3 rounded-lg px-3.5 text-[13px] font-medium transition ${
                            isActive
                                ? "bg-accent text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                    }
                >
                  <Icon size={18} strokeWidth={1.65} />
                  <span className="flex-1">{label}</span>
                  {to === "/pendientes" && (
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold">
                  {pending}
                </span>
                  )}
                </NavLink>
            ))}
          </nav>
          <div className="mt-7 border-t border-border px-3.5 pt-5">
            <NavLink
                to="/perfil"
                className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3.5 py-3 text-[13px] ${
                        isActive
                            ? "bg-accent text-primary"
                            : "text-muted-foreground hover:bg-muted"
                    }`
                }
            >
              <UserRound size={18} strokeWidth={1.65} />
              Perfil
            </NavLink>
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
                  to="/guia"
                  className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-primary"
              >
                Ver guía del prototipo
                <ArrowUpRight size={13} />
              </Link>
            </div>
            <button
                onClick={() => {
                  setRole(null)
                  navigate("/login")
                }}
                className="flex w-full items-center gap-3 border-t border-border px-2 py-4 text-[13px] text-muted-foreground hover:text-destructive"
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
            <div className="flex items-center gap-3 rounded-lg bg-muted/70 p-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e0eae3] text-xs font-bold text-primary">
              {isStaff ? "LU" : "MF"}
            </span>
              <div>
                <span className="block text-xs font-semibold">{name}</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground capitalize">
                {role}
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
            Mi espacio
          </span>
            <ChevronRight
                className="hidden text-muted-foreground sm:block"
                size={13}
            />
            <span className="text-xs font-medium">{section}</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
          <span className="hidden items-center gap-2 text-xs text-muted-foreground xl:flex">
            <CalendarDays size={15} />
            Miércoles, 30 de septiembre de 2026
          </span>
            <div className="relative">
              <button
                  aria-label="Ver mensajes de solicitudes"
                  aria-expanded={notifications}
                  className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  onClick={() => setNotifications(!notifications)}
              >
                <Bell size={19} />
                <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-primary ring-2 ring-white" />
              </button>
              {notifications && (
                  <div className="absolute right-0 top-12 w-72 rounded-xl border border-border bg-white p-4 shadow-lg">
                    <h3 className="mb-3 text-sm font-semibold">
                      Estado de solicitudes
                    </h3>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {pending} solicitudes pendientes de revisión. Una solicitud
                      pendiente todavía no está confirmada.
                    </p>
                    <Link
                        to={isStaff ? "/pendientes" : "/solicitudes"}
                        className="mt-4 block text-xs font-semibold text-primary"
                    >
                      Ver solicitudes →
                    </Link>
                  </div>
              )}
            </div>
            <Link
                to="/perfil"
                className="flex items-center gap-2.5 border-l border-border pl-4"
            >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e9efe9] text-[11px] font-bold text-primary">
              {isStaff ? "LU" : "MF"}
            </span>
              <span className="hidden text-xs font-medium sm:block">
              {isStaff ? "Lucía" : "Martín F."}
            </span>
              <ChevronDown size={13} className="text-muted-foreground" />
            </Link>
          </div>
        </header>
        <main
            id="main"
            className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"
        >
          {scenario !== "normal" && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#efe0bf] bg-[#fff9ed] px-4 py-2 text-xs text-[#886017]">
                Escenario de prueba activo:{" "}
                {scenario === "empty"
                    ? "estado vacío"
                    : scenario === "load"
                        ? "error al cargar"
                        : "error de conexión"}
                <button
                    onClick={() => setScenario("normal")}
                    className="font-semibold underline"
                >
                  Volver al estado normal
                </button>
              </div>
          )}
          {children}
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[10px] text-muted-foreground">
          <span>
            Biblioteca Horizonte · Gestión de recursos institucionales
          </span>
            <Link
                to="/guia"
                className="flex items-center gap-1 hover:text-primary"
            >
              <span className="size-1.5 rounded-full bg-primary/70" />
              Prototipo navegable · Datos de ejemplo
              <ExternalLink size={10} />
            </Link>
          </footer>
        </main>
      </div>
  )
}

function Stats({ requests: items }: { requests: Request[] }) {
  return (
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {(["PENDIENTE", "CONFIRMADA", "RECHAZADA"] as Status[]).map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          return (
              <Link
                  key={status}
                  to={`/solicitudes?estado=${status}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-white px-5 py-5 transition hover:border-primary/30"
              >
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {config.label}
                  </p>
                  <p className="my-1.5 font-heading text-[32px] font-bold leading-tight">
                    {items
                        .filter((request) => request.status === status)
                        .length.toString()
                        .padStart(2, "0")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {config.description}
                  </p>
                </div>
                <span
                    className={`flex size-11 items-center justify-center rounded-xl ${config.color.split(" border")[0]}`}
                >
              <Icon size={21} strokeWidth={1.6} />
            </span>
              </Link>
          )
        })}
      </div>
  )
}

function ResourceCard({
                        resource,
                        compact = false,
                      }: {
  resource: Resource
  compact?: boolean
}) {
  const { role } = useApp()
  const Icon = getResourceIcon(resource.icon)
  return (
      <div className="group overflow-hidden rounded-xl border border-border bg-white transition hover:border-primary/30">
        <Link
            to={`/recursos/${resource.id}`}
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
              to={`/recursos/${resource.id}`}
              className="font-heading text-[14px] font-bold hover:text-primary"
          >
            {resource.name}
          </Link>
          <p className="mb-4 mt-2 text-[12px] leading-5 text-muted-foreground">
            {resource.description}
          </p>
          <Link
              to={
                role === "docente" && resource.available
                    ? `/nueva-solicitud?recurso=${resource.id}`
                    : `/recursos/${resource.id}`
              }
              className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-primary"
          >
            {role === "docente" && resource.available
                ? "Solicitar recurso"
                : "Ver detalle"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
  )
}

function RequestTable({
                        items,
                        admin = false,
                        compact = false,
                      }: {
  items: Request[]
  admin?: boolean
  compact?: boolean
}) {
  const navigate = useNavigate()
  if (!items.length)
    return (
        <EmptyState
            title="No hay solicitudes"
            description="Las solicitudes que registres aparecerán aquí, junto con su estado."
            action={
                !admin && (
                    <Button onClick={() => navigate("/nueva-solicitud")}>
                      <Plus size={15} />
                      Nueva solicitud
                    </Button>
                )
            }
        />
    )
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
              const resource = resourceById(request.resourceId)
              const Icon = getResourceIcon(resource.icon)
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
                          to={`/solicitudes/${request.id}`}
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
                          {timeLabel(request.created)}
                        </td>
                    )}
                    <td className="px-5 py-4 text-right">
                      <Link
                          to={`/solicitudes/${request.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                      >
                        Ver
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
              )
            })}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-border md:hidden">
          {items.map((request) => (
              <Link
                  key={request.id}
                  to={`/solicitudes/${request.id}`}
                  className="block p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">
                {resourceById(request.resourceId).name}
              </span>
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
                      Solicitada el {timeLabel(request.created)}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              </Link>
          ))}
        </div>
      </>
  )
}

function Dashboard() {
  const { role, requests } = useApp()
  const isStaff = role === "bibliotecaria" || role === "admin"
  const items = requests.filter(
      (request) => isStaff || request.teacher === "Martín Fernández",
  )
  const navigate = useNavigate()
  return (
      <>
        <PageTitle
            eyebrow={isStaff ? "Panel de gestión" : "Tu biblioteca, más cerca"}
            title={isStaff ? "Buen día, Lucía" : "Hola, Martín 👋"}
            subtitle={
              isStaff
                  ? "Revisá las solicitudes y coordiná el uso de los recursos de la biblioteca."
                  : "Gestioná tus solicitudes y encontrá el recurso para tu próxima clase."
            }
            action={
                !isStaff && (
                    <Button onClick={() => navigate("/nueva-solicitud")}>
                      <Plus size={16} />
                      Nueva solicitud
                    </Button>
                )
            }
        />
        <DataState emptyTitle="No hay solicitudes">
          <Stats requests={items} />
          <div className="mb-7 flex items-center gap-3 rounded-lg border border-[#e0e9e2] bg-[#edf3ee] px-4 py-3 text-[12px] leading-6 text-[#53705c]">
            <Info className="shrink-0" size={17} />
            <p>
            <span className="font-semibold">
              {isStaff
                  ? "Cada solicitud necesita tu revisión."
                  : "Una solicitud pendiente aún no está confirmada."}
            </span>{" "}
              {isStaff
                  ? "Verificá la disponibilidad antes de confirmar un recurso."
                  : "Lucía, nuestra bibliotecaria, revisará y confirmará la disponibilidad del recurso."}
            </p>
          </div>
          <section className="mb-8 overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-bold">
                  {isStaff ? "Solicitudes por revisar" : "Mis últimas solicitudes"}
                </h2>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {isStaff
                    ? items.filter((item) => item.status === "PENDIENTE").length
                    : items.length}
              </span>
              </div>
              <Link
                  to={isStaff ? "/pendientes" : "/solicitudes"}
                  className="flex items-center gap-2 text-[11px] font-semibold text-primary"
              >
                Ver todas
                <ArrowRight size={13} />
              </Link>
            </div>
            <RequestTable
                items={(isStaff
                        ? items.filter((item) => item.status === "PENDIENTE")
                        : items
                ).slice(0, 4)}
                admin={isStaff}
                compact
            />
          </section>
        </DataState>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold">Recursos a tu alcance</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Todo lo que necesitás para acompañar tus clases.
              </p>
            </div>
            <Link
                to="/recursos"
                className="flex items-center gap-2 text-[11px] font-semibold text-primary"
            >
              Explorar recursos
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {resources.slice(0, 3).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} compact />
            ))}
          </div>
        </section>
      </>
  )
}

function Resources() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const filtered = resources.filter(
      (resource) =>
          `${resource.name} ${resource.description}`
              .toLowerCase()
              .includes(search.toLowerCase()) &&
          (category === "Todos" || resource.category === category) &&
          (!onlyAvailable || resource.available),
  )
  return (
      <>
        <PageTitle
            eyebrow="Catálogo institucional"
            title="Recursos"
            subtitle="Consultá los recursos disponibles y solicitá el que necesitás."
        />
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search
                size={17}
                className="absolute left-3.5 top-3.5 text-muted-foreground"
            />
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
            {["Todos", "Equipamiento", "Espacios", "Material bibliográfico"].map(
                (item) => (
                    <option key={item}>{item}</option>
                ),
            )}
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
        <DataState emptyTitle="No hay recursos">
          {filtered.length ? (
              <>
                <p className="mb-4 text-xs text-muted-foreground">
                  {filtered.length} recursos · La disponibilidad final se verifica
                  al confirmar.
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
                          setSearch("")
                          setCategory("Todos")
                          setOnlyAvailable(false)
                        }}
                    >
                      Limpiar filtros
                    </Button>
                  }
              />
          )}
        </DataState>
      </>
  )
}

function ResourceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { role } = useApp()
  const resource = resources.find((item) => item.id === id)
  if (!resource) return <NotFound />
  const Icon = getResourceIcon(resource.icon)
  return (
      <>
        <BackLink to="/recursos" label="Volver a recursos" />
        <PageTitle
            eyebrow={resource.category}
            title={resource.name}
            subtitle={resource.description}
        />
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div
                className={`flex h-56 items-center justify-center ${resource.tone}`}
            >
              <Icon size={100} strokeWidth={1} />
            </div>
            <div className="space-y-5 p-6">
              <h2 className="text-lg font-bold">Información del recurso</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {resource.info}
              </p>
              {resource.location && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Ubicación:</strong> {resource.location}
                  </p>
              )}
              {resource.condition && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Condición:</strong> {resource.condition}
                  </p>
              )}
              <p className="text-xs leading-6 text-muted-foreground">
                Este recurso es un dato de ejemplo para validar el recorrido de
                solicitud. La fecha, el turno y el módulo se seleccionan en el
                formulario.
              </p>
            </div>
          </div>
          <div className="h-fit space-y-5 rounded-xl border border-border bg-white p-6">
            <h2 className="font-bold">Disponibilidad</h2>
            <Alert
                kind={resource.available ? "info" : "error"}
                title={
                  resource.available
                      ? "Disponible para solicitar"
                      : "Recurso no disponible"
                }
            >
              {resource.available
                  ? "Una solicitud no garantiza la disponibilidad. La bibliotecaria debe revisar y confirmar el turno seleccionado."
                  : "Este recurso está en mantenimiento. Elegí otro recurso o volvé a consultar más adelante."}
            </Alert>
            {role === "docente" && (
                <Button
                    className="w-full"
                    disabled={!resource.available}
                    onClick={() =>
                        navigate(`/nueva-solicitud?recurso=${resource.id}`)
                    }
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
      </>
  )
}

function BackLink({ to, label }: { to: string; label: string }) {
  return (
      <Link
          to={to}
          className="mb-5 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={14} />
        {label}
      </Link>
  )
}

function NewRequest() {
  const { role, requests, setRequests, notify, scenario } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    resourceId: new URLSearchParams(location.search).get("recurso") || "",
    date: "",
    shift: "",
    module: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const shifts: Shift[] = ["Mañana · 08:00–12:00", "Tarde · 13:00–17:00"]
  const modules: Module[] = form.shift.startsWith("Mañana")
      ? [
        "Módulo 1 · 08:00–09:20",
        "Módulo 2 · 09:30–10:50",
        "Módulo 3 · 11:00–12:00",
      ]
      : [
        "Módulo 1 · 13:00–14:20",
        "Módulo 2 · 14:30–15:50",
        "Módulo 3 · 16:00–17:00",
      ]
  const selected = resources.find((resource) => resource.id === form.resourceId)
  const conflict = requests.find(
      (request) =>
          request.status === "CONFIRMADA" &&
          request.resourceId === form.resourceId &&
          request.date === form.date &&
          request.shift === form.shift &&
          request.module === form.module,
  )

  const change = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "shift" ? { module: "" } : {}),
    }))
    setErrors((prev) => ({ ...prev, [key]: "", general: "" }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    for (const key of ["resourceId", "date", "shift", "module"] as const)
      if (!form[key]) next[key] = "Este campo es obligatorio."
    if (
        form.date &&
        (Number.isNaN(Date.parse(form.date)) || form.date < today())
    )
      next.date = "Seleccioná una fecha válida, de hoy en adelante."
    if (selected && !selected.available)
      next.resourceId = "Recurso no disponible. Seleccioná otro recurso."
    if (form.shift && !shifts.includes(form.shift as Shift))
      next.shift = "Seleccioná un turno válido."
    if (form.module && !modules.includes(form.module as Module))
      next.module = "Seleccioná un módulo válido para el turno."
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    if (scenario === "connection" || scenario === "load") {
      setErrors({
        general:
            "Error de conexión. No se envió la solicitud. Intentá nuevamente.",
      })
      return
    }
    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    const highestId = requests.length
        ? Math.max(0, ...requests.map((item) => Number(item.id.split("-")[1]) || 0))
        : 20
    const request: Request = {
      ...form,
      userId: "d8329b14-8f76-4d45-9271-70bf81d19b78", // UUID de Martín Fernández
      teacher: "Martín Fernández",
      id: `BH-${String(highestId + 1).padStart(4, "0")}`,
      status: "PENDIENTE",
      created: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
    }
    setRequests((prev) => [request, ...prev])
    setSending(false)
    notify("Solicitud enviada · PENDIENTE")
    navigate(`/solicitudes/${request.id}/enviada`)
  }

  if (role !== "docente") return <PermissionDenied />

  const field = (key: string, label: string, child: ReactNode) => (
      <div>
        <label htmlFor={key} className="mb-2 block text-xs font-semibold">
          {label} <span className="text-destructive">*</span>
        </label>
        {child}
        {errors[key] && (
            <p
                id={`${key}-error`}
                className="mt-1.5 flex items-center gap-1 text-xs text-destructive"
            >
              <CircleX size={12} />
              {errors[key]}
            </p>
        )}
      </div>
  )

  return (
      <>
        <BackLink to="/recursos" label="Volver a recursos" />
        <PageTitle
            eyebrow="Solicitud de recurso"
            title="Nueva solicitud"
            subtitle="Completá los datos. Lucía revisará la disponibilidad y el estado de tu solicitud."
        />
        <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
          <form
              onSubmit={submit}
              noValidate
              className="space-y-6 rounded-xl border border-border bg-white p-5 sm:p-7"
          >
            <div className="border-b border-border pb-5">
              <h2 className="text-base font-bold">Datos de la solicitud</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Los campos marcados con * son obligatorios.
              </p>
            </div>
            {errors.general && <Alert kind="error">{errors.general}</Alert>}
            {field(
                "resourceId",
                "Recurso",
                <select
                    id="resourceId"
                    aria-invalid={!!errors.resourceId}
                    aria-describedby={errors.resourceId ? "resourceId-error" : undefined}
                    className={fieldClass}
                    value={form.resourceId}
                    onChange={(event) => change("resourceId", event.target.value)}
                >
                  <option value="">Seleccioná un recurso</option>
                  {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                        {!resource.available ? " — No disponible" : ""}
                      </option>
                  ))}
                </select>,
            )}
            {selected && !selected.available && (
                <Alert kind="error" title="Recurso no disponible">
                  Este recurso está en mantenimiento. Seleccioná otro para
                  continuar.
                </Alert>
            )}
            {field(
                "date",
                "Fecha de uso",
                <input
                    id="date"
                    type="date"
                    min={today()}
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? "date-error" : undefined}
                    className={fieldClass}
                    value={form.date}
                    onChange={(event) => change("date", event.target.value)}
                />,
            )}
            {field(
                "shift",
                "Horario / turno",
                <select
                    id="shift"
                    className={fieldClass}
                    aria-invalid={!!errors.shift}
                    aria-describedby={errors.shift ? "shift-error" : undefined}
                    value={form.shift}
                    onChange={(event) => change("shift", event.target.value)}
                >
                  <option value="">Seleccioná un turno</option>
                  {shifts.map((shift) => (
                      <option key={shift}>{shift}</option>
                  ))}
                </select>,
            )}
            {field(
                "module",
                "Módulo",
                <select
                    id="module"
                    disabled={!form.shift}
                    className={fieldClass}
                    aria-invalid={!!errors.module}
                    aria-describedby={errors.module ? "module-error" : undefined}
                    value={form.module}
                    onChange={(event) => change("module", event.target.value)}
                >
                  <option value="">
                    {form.shift
                        ? "Seleccioná un módulo"
                        : "Primero seleccioná un turno"}
                  </option>
                  {form.shift &&
                      modules.map((module) => <option key={module}>{module}</option>)}
                </select>,
            )}
            <div>
              <label htmlFor="notes" className="mb-2 block text-xs font-semibold">
                Observaciones{" "}
                <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
              </label>
              <textarea
                  id="notes"
                  className={`${fieldClass} min-h-28 resize-y`}
                  placeholder="Contanos para qué actividad necesitás el recurso…"
                  maxLength={500}
                  value={form.notes}
                  onChange={(event) => change("notes", event.target.value)}
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {form.notes.length}/500
              </p>
            </div>
            {conflict && (
                <Alert kind="warning" title="Conflicto de disponibilidad">
                  Este recurso ya está confirmado para el turno y módulo
                  seleccionados. Podés modificar los datos o enviar la solicitud
                  para revisión; no podrá confirmarse mientras exista el conflicto.
                </Alert>
            )}
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
              <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/recursos")}
              >
                Cancelar
              </Button>
              <Button
                  type="submit"
                  disabled={sending || selected?.available === false}
              >
                {sending ? (
                    <LoaderCircle size={16} className="animate-spin" />
                ) : (
                    <ArrowRight size={16} />
                )}
                {sending ? "Enviando…" : "Enviar solicitud"}
              </Button>
            </div>
          </form>
          <aside className="space-y-5">
            <div className="rounded-xl border border-border bg-white p-6">
              <h2 className="mb-5 text-sm font-bold">Resumen de tu solicitud</h2>
              <dl className="space-y-4 text-xs">
                {[
                  ["Recurso", selected?.name || "Por seleccionar"],
                  ["Fecha", form.date ? dateLabel(form.date) : "Por seleccionar"],
                  ["Turno", form.shift || "Por seleccionar"],
                  ["Módulo", form.module || "Por seleccionar"],
                  ["Docente", "Martín Fernández"],
                ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="mb-1 text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                ))}
              </dl>
            </div>
            <Alert title="Primero una solicitud, luego la confirmación">
              Al enviar, el estado será <strong>PENDIENTE</strong>. Solo la
              bibliotecaria puede confirmar el uso del recurso.
            </Alert>
          </aside>
        </div>
      </>
  )
}

function Requests() {
  const { role, requests } = useApp()
  const location = useLocation()
  const isStaff = role === "bibliotecaria" || role === "admin"
  const pendingPage = location.pathname === "/pendientes"
  const [filter, setFilter] = useState(
      new URLSearchParams(location.search).get("estado") || "TODAS",
  )
  const [search, setSearch] = useState("")

  useEffect(() => {
    setFilter(new URLSearchParams(location.search).get("estado") || "TODAS")
  }, [location.search])

  if (pendingPage && !isStaff) return <PermissionDenied />

  const visible = requests.filter(
      (request) =>
          (isStaff || request.teacher === "Martín Fernández") &&
          (!pendingPage || request.status === "PENDIENTE"),
  )
  const filtered = visible.filter(
      (request) =>
          (pendingPage || filter === "TODAS" || request.status === filter) &&
          `${resourceById(request.resourceId).name} ${request.teacher} ${request.id}`
              .toLowerCase()
              .includes(search.toLowerCase()),
  )

  return (
      <>
        <PageTitle
            eyebrow={isStaff ? "Gestión de solicitudes" : "Seguimiento"}
            title={
              pendingPage
                  ? "Solicitudes pendientes"
                  : isStaff
                      ? "Todas las solicitudes"
                      : "Mis solicitudes"
            }
            subtitle={
              pendingPage
                  ? "Revisá los datos y verificá la disponibilidad antes de confirmar."
                  : "Consultá el estado y los detalles de cada solicitud."
            }
            action={
                !isStaff && (
                    <Button to="/nueva-solicitud">
                      <Plus size={16} />
                      Nueva solicitud
                    </Button>
                )
            }
        />
        {pendingPage && (
            <div className="mb-5">
              <Alert>
                Solo las solicitudes <strong>PENDIENTES</strong> pueden confirmarse
                o rechazarse. El estado confirmado no puede volver a pendiente.
              </Alert>
            </div>
        )}
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            {!pendingPage && (
                <div className="flex flex-wrap gap-1">
                  {["TODAS", "PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"].map(
                      (status) => (
                          <button
                              key={status}
                              aria-pressed={filter === status}
                              onClick={() => setFilter(status)}
                              className={`rounded-lg px-3 py-2 text-[11px] font-medium transition ${
                                  filter === status
                                      ? "bg-accent text-primary"
                                      : "text-muted-foreground hover:bg-muted"
                              }`}
                          >
                            {status === "TODAS"
                                ? "Todas"
                                : statusConfig[status as Status]?.label || status}
                            <span className="ml-1.5 text-[10px] opacity-70">
                      {
                        visible.filter(
                            (request) =>
                                status === "TODAS" || request.status === status,
                        ).length
                      }
                    </span>
                          </button>
                      ),
                  )}
                </div>
            )}
            <div className="relative min-w-48 flex-1 sm:max-w-64">
              <Search
                  className="absolute left-3 top-3 text-muted-foreground"
                  size={15}
              />
              <input
                  aria-label="Buscar solicitudes"
                  placeholder={
                    isStaff ? "Buscar recurso o docente…" : "Buscar solicitud…"
                  }
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={`${fieldClass} py-2.5 pl-9 text-xs`}
              />
            </div>
          </div>
          <DataState
              emptyTitle={
                pendingPage ? "No hay solicitudes pendientes" : "No hay solicitudes"
              }
          >
            {filtered.length ? (
                <>
                  {pendingPage ? (
                      <div className="divide-y divide-border">
                        {filtered.map((request) => (
                            <div
                                key={request.id}
                                className="flex flex-wrap items-center justify-between gap-4 border-t border-border p-5"
                            >
                              <div className="flex items-center gap-3">
                        <span
                            className={`rounded-lg p-3 ${resourceById(request.resourceId).tone}`}
                        >
                          {(() => {
                            const Icon = getResourceIcon(resourceById(request.resourceId).icon)
                            return <Icon size={22} />
                          })()}
                        </span>
                                <div>
                                  <Link
                                      className="text-sm font-semibold hover:text-primary"
                                      to={`/solicitudes/${request.id}`}
                                  >
                                    {resourceById(request.resourceId).name}
                                  </Link>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {request.teacher} · {request.id}
                                  </p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    {dateLabel(request.date)} ·{" "}
                                    {request.shift.split(" · ")[0]} · {request.module}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge status={request.status} />
                                <Button
                                    to={`/solicitudes/${request.id}`}
                                    variant="ghost"
                                >
                                  Ver
                                </Button>
                                <Button
                                    to={`/solicitudes/${request.id}?accion=confirmar`}
                                >
                                  <Check size={14} />
                                  Confirmar
                                </Button>
                                <Button
                                    to={`/solicitudes/${request.id}?accion=rechazar`}
                                    variant="secondary"
                                    className="text-destructive"
                                >
                                  <X size={14} />
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <RequestTable items={filtered} admin={isStaff} />
                  )}
                </>
            ) : (
                <div className="p-5">
                  <EmptyState
                      title={
                        search
                            ? "No hay resultados"
                            : pendingPage
                                ? "No hay solicitudes pendientes"
                                : filter !== "TODAS"
                                    ? "No hay solicitudes en este estado"
                                    : "No hay solicitudes"
                      }
                      description={
                        search
                            ? "Probá otro recurso, nombre o número de solicitud."
                            : pendingPage
                                ? "Todas las solicitudes fueron revisadas. Las nuevas solicitudes aparecerán aquí."
                                : "Las solicitudes aparecerán aquí cuando se registren."
                      }
                      action={
                        search ? (
                            <Button variant="secondary" onClick={() => setSearch("")}>
                              Limpiar búsqueda
                            </Button>
                        ) : (
                            !isStaff && (
                                <Button to="/nueva-solicitud">Nueva solicitud</Button>
                            )
                        )
                      }
                  />
                </div>
            )}
          </DataState>
        </div>
      </>
  )
}

function Modal({
                 children,
                 title,
                 close,
               }: {
  children: ReactNode
  title: string
  close: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
    const dialog = ref.current
    return () => dialog?.close()
  }, [])
  return (
      <dialog
          ref={ref}
          onCancel={(event) => {
            event.preventDefault()
            close()
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close()
          }}
          className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-white p-0 text-foreground shadow-xl backdrop:bg-[#16291e]/35"
          aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 id="modal-title" className="text-base font-bold">
            {title}
          </h2>
          <button
              aria-label="Cerrar modal"
              className="rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={close}
          >
            <X size={19} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </dialog>
  )
}

function RequestDetail() {
  const { id } = useParams()
  const { role, requests, setRequests, notify, scenario } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const request = requests.find((item) => item.id === id)
  const isStaff = role === "bibliotecaria" || role === "admin"
  const [modal, setModal] =
      useState<"confirmar" | "rechazar" | "conflict" | null>(null)
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    const action = new URLSearchParams(location.search).get("accion")
    if (
        isStaff &&
        request?.status === "PENDIENTE" &&
        (action === "confirmar" || action === "rechazar")
    )
      setModal(action)
  }, [location.search, isStaff, request?.status])

  if (!request) return <NotFound />
  if (!isStaff && request.teacher !== "Martín Fernández")
    return <PermissionDenied />

  const resource = resourceById(request.resourceId)
  const Icon = getResourceIcon(resource.icon)
  const StatusIcon = statusConfig[request.status]?.icon || Info
  const conflicting = requests.find(
      (item) =>
          item.id !== request.id &&
          item.status === "CONFIRMADA" &&
          item.resourceId === request.resourceId &&
          item.date === request.date &&
          item.shift === request.shift &&
          item.module === request.module,
  )

  const closeModal = () => {
    if (processing) return
    setModal(null)
    setActionError("")
    navigate(location.pathname, { replace: true })
  }

  const process = async () => {
    if (
        processing ||
        !isStaff ||
        request.status !== "PENDIENTE" ||
        (modal !== "confirmar" && modal !== "rechazar")
    )
      return
    if (scenario === "connection" || scenario === "load") {
      setActionError(
          "Error de conexión. No se modificó el estado de la solicitud. Intentá nuevamente.",
      )
      return
    }
    if (modal === "confirmar" && conflicting) {
      setModal("conflict")
      return
    }
    if (modal === "confirmar" && !resource.available) {
      setActionError("Recurso no disponible. La solicitud continúa PENDIENTE.")
      return
    }
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const status: Status = modal === "confirmar" ? "CONFIRMADA" : "RECHAZADA"
    setRequests((prev) =>
        prev.map((item) =>
            item.id === request.id && item.status === "PENDIENTE"
                ? {
                  ...item,
                  status,
                  reviewedBy: "c381f2ba-24a9-4672-882f-2d7c4a1797c2", // UUID de Lucía
                  reviewedAt: new Date().toISOString(),
                }
                : item,
        ),
    )
    notify(statusConfig[status].message)
    setProcessing(false)
    setModal(null)
    navigate(
        `/solicitudes/${request.id}/${
            status === "CONFIRMADA" ? "confirmada" : "rechazada"
        }`,
    )
  }

  return (
      <>
        <BackLink
            to={isStaff ? "/pendientes" : "/solicitudes"}
            label={
              isStaff ? "Volver a solicitudes pendientes" : "Volver a mis solicitudes"
            }
        />
        <PageTitle
            eyebrow={`${request.id} · Detalle de solicitud`}
            title={`Solicitud de ${resource.name.toLowerCase()}`}
            subtitle={`Registrada el ${timeLabel(request.created)}`}
            action={<Badge status={request.status} />}
        />
        <div
            className={`mb-6 flex items-start gap-4 rounded-xl border p-5 ${statusConfig[request.status]?.surface}`}
        >
        <span
            className={`rounded-lg p-2 ${statusConfig[request.status]?.color}`}
        >
          <StatusIcon size={23} />
        </span>
          <div>
            <h2 className="text-base font-bold">Solicitud {request.status}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {statusConfig[request.status]?.message}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {resource.category}
                </p>
              </div>
            </div>
            <dl className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              {[
                ["Docente", request.teacher],
                ["Fecha de uso", dateLabel(request.date)],
                ["Horario / turno", request.shift],
                ["Módulo", request.module],
                [
                  "Fecha de solicitud",
                  new Date(request.created).toLocaleString("es-AR"),
                ],
                [
                  "Última revisión",
                  request.reviewedAt
                      ? `${new Date(request.reviewedAt).toLocaleString("es-AR")} · Lucía`
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
              <h2 className="mb-5 text-sm font-bold">
                Recorrido de la solicitud
              </h2>
              <div className="flex gap-3">
                <CircleCheck className="shrink-0 text-primary" size={20} />
                <div>
                  <p className="text-xs font-semibold">Solicitud enviada</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {timeLabel(request.created)}
                  </p>
                </div>
              </div>
              <div className="ml-2.5 my-2 h-7 border-l border-border" />
              <div className="flex gap-3">
                <StatusIcon
                    className={`shrink-0 ${
                        request.status === "RECHAZADA" || request.status === "CANCELADA"
                            ? "text-destructive"
                            : request.status === "CONFIRMADA"
                                ? "text-primary"
                                : "text-[#916516]"
                    }`}
                    size={20}
                />
                <div>
                  <p className="text-xs font-semibold">
                    {request.status === "PENDIENTE"
                        ? "Pendiente de confirmación"
                        : `Solicitud ${request.status}`}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {request.reviewedAt
                        ? `Revisada por Lucía · ${timeLabel(request.reviewedAt)}`
                        : "A la espera de Lucía — Bibliotecaria"}
                  </p>
                </div>
              </div>
            </div>
            {isStaff && request.status === "PENDIENTE" && (
                <div className="space-y-3 rounded-xl border border-border bg-white p-6">
                  <h2 className="mb-4 text-sm font-bold">Revisar solicitud</h2>
                  {conflicting && (
                      <Alert kind="warning" title="Posible conflicto">
                        Hay otra solicitud confirmada para este recurso, fecha, turno
                        y módulo.
                      </Alert>
                  )}
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
                    La disponibilidad se verifica antes de confirmar. No se permite
                    confirmar dos solicitudes para el mismo recurso, fecha, turno y
                    módulo.
                  </p>
                </div>
            )}
            {!isStaff && request.status === "RECHAZADA" && (
                <Button
                    to={`/nueva-solicitud?recurso=${request.resourceId}`}
                    className="w-full"
                >
                  Crear una nueva solicitud
                  <ArrowRight size={15} />
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
                          : "Rechazar solicitud"
                }
                close={closeModal}
            >
              {modal === "conflict" ? (
                  <>
                    <Alert
                        kind="error"
                        title="Este recurso ya está confirmado para el turno seleccionado."
                    >
                      No se puede confirmar esta solicitud porque el recurso ya está
                      confirmado para ese turno.
                    </Alert>
                    <div className="my-5 rounded-lg border border-border bg-muted/50 p-4 text-xs leading-6">
                      <p className="font-semibold">
                        Solicitud confirmada: {conflicting?.id}
                      </p>
                      <p>
                        {resource.name} · {dateLabel(request.date)}
                      </p>
                      <p>
                        {request.shift} · {request.module}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <Badge status="PENDIENTE" />
                      <span className="text-xs text-muted-foreground">
                  Esta solicitud continúa sin confirmarse.
                </span>
                    </div>
                    <p className="mb-5 text-xs leading-6 text-muted-foreground">
                      Podés mantenerla pendiente para revisar más tarde o rechazarla.
                      El docente podrá enviar una nueva solicitud para otra fecha o
                      módulo.
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
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
                          : "La solicitud pasará a RECHAZADA. El docente verá el mensaje de rechazo en el detalle. Esta acción no puede deshacerse en este prototipo."}
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
                      <Button
                          variant="secondary"
                          disabled={processing}
                          onClick={closeModal}
                      >
                        Cancelar
                      </Button>
                      <Button
                          variant={modal === "rechazar" ? "danger" : "primary"}
                          disabled={processing}
                          onClick={process}
                      >
                        {processing && (
                            <LoaderCircle size={15} className="animate-spin" />
                        )}
                        {processing
                            ? "Verificando…"
                            : modal === "confirmar"
                                ? "Confirmar solicitud"
                                : "Rechazar solicitud"}
                      </Button>
                    </div>
                  </>
              )}
            </Modal>
        )}
      </>
  )
}

function Outcome() {
  const { id } = useParams()
  const { requests, role } = useApp()
  const request = requests.find((item) => item.id === id)
  if (!request) return <NotFound />
  const isStaff = role === "bibliotecaria" || role === "admin"
  if (!isStaff && request.teacher !== "Martín Fernández")
    return <PermissionDenied />
  const pending = request.status === "PENDIENTE"
  const Icon = statusConfig[request.status]?.icon || Info
  return (
      <div className="mx-auto max-w-2xl py-7">
        <div className="rounded-2xl border border-border bg-white px-6 py-10 text-center sm:px-12">
        <span
            className={`mx-auto mb-6 flex size-18 items-center justify-center rounded-full ${statusConfig[request.status]?.color}`}
        >
          <Icon size={35} strokeWidth={1.5} />
        </span>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            {request.id}
          </p>
          <h1 className="mb-4 text-2xl font-bold">
            {pending
                ? "Solicitud enviada correctamente"
                : request.status === "CONFIRMADA"
                    ? "Solicitud CONFIRMADA"
                    : "Solicitud RECHAZADA"}
          </h1>
          <Badge status={request.status} />
          <p className="my-6 text-sm leading-7 text-muted-foreground">
            {pending
                ? "Tu solicitud fue registrada y está pendiente de confirmación por la bibliotecaria."
                : statusConfig[request.status]?.message}
          </p>
          {pending && (
              <Alert>
                Tu solicitud todavía <strong>no es una reserva confirmada</strong>.
                Consultá su estado en Mis solicitudes.
              </Alert>
          )}
          <dl className="my-6 grid grid-cols-2 gap-5 rounded-xl bg-muted/60 p-5 text-left text-xs">
            {[
              ["Recurso", resourceById(request.resourceId).name],
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
            <Button
                to={isStaff ? "/pendientes" : "/solicitudes"}
            >
              {isStaff
                  ? "Ver solicitudes pendientes"
                  : "Ver mis solicitudes"}
              <ArrowRight size={15} />
            </Button>
            <Button
                to={pending ? "/recursos" : `/solicitudes/${request.id}`}
                variant="secondary"
            >
              {pending ? "Volver a recursos" : "Ver detalle de solicitud"}
            </Button>
          </div>
        </div>
      </div>
  )
}

function Login() {
  const { setRole, notify } = useApp()
  const navigate = useNavigate()
  const [role, selectRole] = useState<Role>("docente")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const demoEmail =
      role === "docente"
          ? "docente@horizonte.edu"
          : role === "bibliotecaria"
              ? "lucia@horizonte.edu"
              : "admin@horizonte.edu"

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email || !password) {
      setError("Completá el usuario y la contraseña.")
      return
    }
    if (email.toLowerCase() !== demoEmail || password !== "horizonte2026") {
      setError(
          "Credenciales incorrectas. Verificá tu usuario y contraseña e intentá nuevamente.",
      )
      return
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Error de conexión. Verificá tu conexión e intentá nuevamente.")
      return
    }
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRole(role)
    notify("Sesión de demostración iniciada")
    navigate("/")
  }

  return (
      <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
        <aside className="hidden flex-col justify-between bg-[#edf3ee] p-14 lg:flex">
          <Brand />
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
              <Brand />
            </div>
            <p className="mb-2 text-xs font-semibold text-primary">
              BIENVENIDO A TU BIBLIOTECA
            </p>
            <h2 className="text-3xl font-bold">Iniciar sesión</h2>
            <p className="mb-7 mt-3 text-sm text-muted-foreground">
              Accedé a tu espacio de gestión de recursos.
            </p>
            <form onSubmit={submit} noValidate className="space-y-5">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold">
                  Rol de demostración
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["docente", "bibliotecaria", "admin"] as Role[]).map((value) => (
                      <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border p-2 text-[11px] capitalize transition ${
                              role === value
                                  ? "border-primary bg-secondary text-primary font-semibold"
                                  : "border-border"
                          }`}
                      >
                        <input
                            type="radio"
                            name="role"
                            checked={role === value}
                            onChange={() => {
                              selectRole(value)
                              setEmail("")
                              setError("")
                            }}
                            className="accent-primary"
                        />
                        {value}
                      </label>
                  ))}
                </div>
              </fieldset>
              {error && <Alert kind="error">{error}</Alert>}
              <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold"
                >
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
                <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold"
                >
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
                      aria-label={
                        show ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                ) : (
                    <ArrowRight size={16} />
                )}
                {loading ? "Iniciando sesión…" : "Iniciar sesión"}
              </Button>
            </form>
            <div className="mt-7 rounded-lg border border-border bg-background p-4">
              <p className="mb-2 text-xs font-semibold">
                Acceso de prueba ·{" "}
                {role === "docente"
                    ? "Martín — Docente"
                    : role === "bibliotecaria"
                        ? "Lucía — Bibliotecaria"
                        : "Carlos — Administrador"}
              </p>
              <p className="text-xs leading-6 text-muted-foreground">
                {demoEmail}
                <br />
                Contraseña: horizonte2026
              </p>
              <button
                  onClick={() => {
                    setEmail(demoEmail)
                    setPassword("horizonte2026")
                    setError("")
                  }}
                  className="mt-2 text-xs font-semibold text-primary underline hover:text-[#1d503d]"
              >
                Completar credenciales de prueba →
              </button>
            </div>
            <p className="mt-5 text-center text-[10px] leading-5 text-muted-foreground">
              Prototipo académico. No ingreses credenciales reales.
              <br />
              La autenticación y los datos son de demostración.
            </p>
          </div>
        </main>
      </div>
  )
}

function Profile() {
  const { role, setRole, notify } = useApp()
  const isStaff = role === "bibliotecaria" || role === "admin"
  const navigate = useNavigate()
  return (
      <>
        <PageTitle
            title="Mi perfil"
            subtitle="Información de tu usuario y permisos dentro del sistema."
        />
        <div className="max-w-2xl space-y-6">
          <section className="rounded-xl border border-border bg-white p-7">
            <div className="mb-7 flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-accent text-lg font-bold text-primary">
              {isStaff ? "LU" : "MF"}
            </span>
              <div>
                <h2 className="text-lg font-bold capitalize">
                  {role === "docente"
                      ? "Martín Fernández — Docente"
                      : role === "bibliotecaria"
                          ? "Lucía — Bibliotecaria"
                          : "Carlos Gómez — Administrador"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {role === "docente"
                      ? "docente@horizonte.edu"
                      : role === "bibliotecaria"
                          ? "lucia@horizonte.edu"
                          : "admin@horizonte.edu"}
                </p>
              </div>
            </div>
            <Alert title="Permisos de tu rol">
              {isStaff
                  ? "Podés consultar todas las solicitudes, confirmar o rechazar solicitudes pendientes y verificar conflictos de disponibilidad."
                  : "Podés consultar recursos, enviar solicitudes y ver tus solicitudes. La confirmación y el rechazo son exclusivos de la biblioteca."}
            </Alert>
          </section>
          <section className="rounded-xl border border-dashed border-border bg-white p-6">
            <h2 className="text-sm font-bold">Explorar el otro recorrido</h2>
            <p className="my-3 text-xs leading-6 text-muted-foreground">
              Control exclusivo del prototipo. Cambia el rol de prueba conservando
              las solicitudes para validar el recorrido completo.
            </p>
            <Button
                variant="secondary"
                onClick={() => {
                  setRole(role === "docente" ? "bibliotecaria" : "docente")
                  notify(
                      `Vista cambiada a ${role === "docente" ? "Lucía — Bibliotecaria" : "Docente"}`,
                  )
                  navigate("/")
                }}
            >
              Cambiar a {role === "docente" ? "Lucía — Bibliotecaria" : "Docente"}
              <ArrowRight size={15} />
            </Button>
          </section>
        </div>
      </>
  )
}

function Guide() {
  const { role, setRole, setScenario, setRequests, notify } = useApp()
  const navigate = useNavigate()
  return (
      <>
        <PageTitle
            eyebrow="Artefacto de diseño · Ingeniería de Software"
            title="Guía del prototipo"
            subtitle="Recorridos, estados y trazabilidad para validar antes de implementar."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-bold">01 — Recorridos navegables</h2>
            <p className="mb-4 text-xs leading-6 text-muted-foreground">
              Fuente principal: Herramientas tecnológicas, artefactos y etapas ·
              Biblioteca Horizonte · 2026, secciones 5.2, 7.1 y 10.2. Nombres de
              recursos, docentes, horarios y módulos son datos de ejemplo.
            </p>
            <div className="space-y-4 text-xs leading-6">
              <p>
                <strong>Docente:</strong> Login → Inicio → Recursos → Detalle →
                Nueva solicitud → Solicitud enviada → Mis solicitudes → Detalle.
              </p>
              <p>
                <strong>Lucía — Bibliotecaria:</strong> Login → Inicio →
                Solicitudes pendientes → Detalle → Confirmar / Rechazar →
                Confirmación.
              </p>
              <p>
                <strong>Conflicto:</strong> Solicitud BH-0019 → Confirmar →
                Verificación → Conflicto → Mantener pendiente o rechazar.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                  variant="secondary"
                  onClick={() => {
                    setRole(role === "docente" ? "bibliotecaria" : "docente")
                    navigate("/")
                  }}
              >
                Explorar como {role === "docente" ? "bibliotecaria" : "docente"}
              </Button>
              <Button
                  variant="secondary"
                  onClick={() => {
                    setRole("bibliotecaria")
                    navigate("/solicitudes/BH-0019")
                  }}
              >
                Probar conflicto
              </Button>
            </div>
          </section>
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-bold">02 — Estados y mensajes</h2>
            <div className="space-y-5">
              {(["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"] as Status[]).map(
                  (status) => (
                      <div key={status}>
                        <Badge status={status} />
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                          {statusConfig[status]?.message}
                        </p>
                      </div>
                  ),
              )}
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
              Una solicitud nueva comienza PENDIENTE. Solo la bibliotecaria puede
              confirmar o rechazar. Una solicitud confirmada no vuelve a
              pendiente.
            </p>
          </section>
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-3 font-bold">03 — Validación de escenarios</h2>
            <p className="mb-5 text-xs leading-6 text-muted-foreground">
              Estos controles afectan únicamente la demostración. Restaurá el
              estado normal desde el aviso superior o el botón Reintentar.
            </p>
            <div className="flex flex-wrap gap-2">
              {([
                ["empty", "Estado vacío"],
                ["connection", "Error de conexión"],
                ["load", "Error al cargar"],
              ] as [Scenario, string][]).map(([scenario, label]) => (
                  <Button
                      key={scenario}
                      variant="secondary"
                      onClick={() => {
                        setScenario(scenario)
                        navigate("/recursos")
                      }}
                  >
                    {label}
                  </Button>
              ))}
              <Button
                  variant="secondary"
                  onClick={() => {
                    setScenario("normal")
                    setRole("docente")
                    navigate("/nueva-solicitud")
                  }}
              >
                Campos obligatorios / datos inválidos
              </Button>
              <Button to="/recursos/tablet" variant="secondary">
                Recurso no disponible
              </Button>
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <Button
                  variant="ghost"
                  onClick={() => {
                    setRequests(initialRequests)
                    setScenario("normal")
                    notify("Datos de ejemplo restaurados")
                  }}
              >
                Restaurar datos de ejemplo
                <RefreshCw size={14} />
              </Button>
            </div>
          </section>
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-bold">04 — Componentes reutilizables</h2>
            <div className="mb-5 flex flex-wrap gap-2">
              <Button onClick={() => notify("Ejemplo de mensaje de éxito")}>
                Primario
              </Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="danger">Peligro</Button>
              <Button disabled>Deshabilitado</Button>
              <Button disabled>
                <LoaderCircle size={14} className="animate-spin" />
                Cargando
              </Button>
            </div>
            <Alert title="Información">
              Color, texto e iconografía hacen reconocibles los estados.
            </Alert>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              Inputs, selectores de fecha, turno y módulo, textarea, checkbox y
              radio; tablas adaptables, cards, avatar, sidebar, navbar,
              breadcrumb, alertas, toast, modal y confirmaciones. Todos usados en
              los recorridos.
            </p>
            <div className="mt-4 flex gap-4 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" />
                Checkbox de ejemplo
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="example" className="accent-primary" />
                Radio de ejemplo
              </label>
            </div>
          </section>
        </div>
        <section className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
          <h2 className="p-6 font-bold">05 — Trazabilidad funcional</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-muted text-muted-foreground">
              <tr>
                {[
                  "Regla / necesidad",
                  "Historia de usuario",
                  "Pantalla / acción",
                  "Estado / resultado",
                ].map((label) => (
                    <th key={label} className="p-4 font-medium">
                      {label}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody>
              {[
                [
                  "Enviar una solicitud",
                  "Como docente, solicitar un recurso",
                  "Nueva solicitud → Enviar",
                  "PENDIENTE · Solicitud enviada",
                ],
                [
                  "Confirmación exclusiva por rol",
                  "Como bibliotecaria, revisar solicitudes",
                  "Detalle → Confirmar → Modal",
                  "CONFIRMADA · Recurso confirmado",
                ],
                [
                  "Rechazar una pendiente",
                  "Como bibliotecaria, rechazar una solicitud",
                  "Detalle → Rechazar → Modal",
                  "RECHAZADA · Mensaje de rechazo",
                ],
                [
                  "No duplicación · CP08",
                  "Como bibliotecaria, evitar duplicaciones",
                  "Verificar recurso + fecha + turno + módulo",
                  "Conflicto · No confirmar · Sigue PENDIENTE",
                ],
                [
                  "Seguimiento claro",
                  "Como docente, conocer el estado",
                  "Mis solicitudes → Detalle",
                  "Estado + icono + mensaje + fecha",
                ],
              ].map((row) => (
                  <tr key={row[0]} className="border-t border-border">
                    {row.map((value) => (
                        <td key={value} className="p-4 leading-6">
                          {value}
                        </td>
                    ))}
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="mt-6">
          <Alert title="Alcance del artefacto">
            Este prototipo es una interfaz navegable, no un backend de producción.
            Los datos se conservan localmente en este navegador. En la
            implementación, autenticación, permisos y no duplicación deben
            validarse también en la API y la base de datos. Los recordatorios por
            correo quedan fuera de este alcance, según el documento.
          </Alert>
        </div>
      </>
  )
}

function PermissionDenied() {
  return (
      <EmptyState
          title="Acceso no permitido"
          description="Esta acción no está disponible para tu rol. Solo la bibliotecaria puede revisar, confirmar o rechazar solicitudes."
          action={<Button to="/">Volver al inicio</Button>}
      />
  )
}

function NotFound() {
  return (
      <EmptyState
          title="No encontramos esta información"
          description="El recurso o la solicitud no existe. Volvé al inicio para continuar."
          action={<Button to="/">Volver al inicio</Button>}
      />
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = "Biblioteca Horizonte · Gestión de recursos"
    document.documentElement.lang = "es"
  }, [])

  const [role, setRole] = useState<Role | null>("docente")
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [scenario, setScenario] = useState<Scenario>("normal")
  const [toast, setToast] = useState("")

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("bh-role")
      if (storedRole) setRole(JSON.parse(storedRole))

      const storedRequests = localStorage.getItem("bh-requests-v1")
      if (storedRequests) setRequests(JSON.parse(storedRequests))
    } catch {
      // Manejo seguro en caso de error de parseo local
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bh-role", JSON.stringify(role))
    }
  }, [role])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bh-requests-v1", JSON.stringify(requests))
    }
  }, [requests])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(""), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  return (
      <AppContext.Provider
          value={{
            role,
            setRole,
            requests,
            setRequests,
            notify: setToast,
            scenario,
            setScenario,
          }}
      >
        <a
            href="#main"
            className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-primary px-4 py-3 text-white focus:not-sr-only"
        >
          Ir al contenido principal
        </a>
        {children}
        {toast && (
            <div
                role="status"
                className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100%-2.5rem)] items-center gap-3 rounded-xl border border-border bg-white px-5 py-4 text-xs shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
            >
              <CircleCheck className="shrink-0 text-primary" size={19} />
              <span>{toast}</span>
              <button
                  aria-label="Cerrar mensaje"
                  className="ml-3 rounded p-1 text-muted-foreground hover:bg-muted"
                  onClick={() => setToast("")}
              >
                <X size={16} />
              </button>
            </div>
        )}
      </AppContext.Provider>
  )
}

export {
  Layout,
  Dashboard,
  Resources,
  ResourceDetail,
  NewRequest,
  Requests,
  RequestDetail,
  Outcome,
  Login,
  Profile,
  Guide,
  PermissionDenied,
  NotFound,
}