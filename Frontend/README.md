# Biblioteca Horizonte - Frontend Conectado

Frontend Next.js conectado al backend Flask de Biblioteca Horizonte.

## Requisitos

- Node.js 18+
- Backend Flask corriendo en `http://localhost:5000`

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env.local` con la URL del backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`.

## Build de producción

```bash
npm run build   # compila sin errores de tipos (tsc) ni de lint
npm start
```

Si el build queda en un estado raro tras renombrar archivos, limpiá la caché:

```bash
rm -rf .next
```

## Estructura del Proyecto

```
src/
├── app/                         # Páginas Next.js App Router
│   ├── layout.tsx               # Layout raíz (envuelve todo en AuthProvider)
│   ├── page.tsx                 # Dashboard principal
│   ├── globals.css              # Estilos globales (Tailwind v4)
│   ├── login/page.tsx           # Inicio de sesión
│   ├── recursos/page.tsx        # Catálogo de recursos (todos los roles)
│   ├── recursos/[id]/page.tsx   # Detalle de recurso
│   ├── nueva-solicitud/page.tsx # Nueva solicitud (docente)
│   ├── solicitudes/page.tsx     # Lista de solicitudes
│   ├── solicitudes/[id]/page.tsx          # Detalle + confirmar/rechazar/cancelar
│   ├── solicitudes/[id]/enviada/page.tsx
│   ├── solicitudes/[id]/confirmada/page.tsx
│   ├── solicitudes/[id]/rechazada/page.tsx
│   ├── pendientes/page.tsx      # Cola de revisión (gestores)
│   ├── perfil/page.tsx          # Perfil y permisos del rol
│   ├── guia/page.tsx            # Guía del sistema
│   └── admin/                   # Exclusivo del rol admin
│       ├── dashboard/page.tsx   # Panel de control y métricas
│       ├── usuarios/page.tsx    # Alta y baja de usuarios
│       ├── recursos/page.tsx    # Alta, estado y baja de recursos
│       └── reportes/page.tsx    # Reportes de baja/mantenimiento
├── components/
│   ├── Layout.tsx               # Sidebar + header (navegación según rol)
│   ├── ui.tsx                   # Button, Alert, PageTitle, Badge, estados
│   ├── ResourceCard.tsx         # Tarjeta de recurso
│   ├── RequestTable.tsx         # Tabla de solicitudes
│   └── Modal.tsx                # Modal de confirmación
└── lib/
    ├── api.ts                   # Cliente HTTP para la API
    ├── auth.tsx                 # AuthContext (isAdmin, isBibliotecaria, isDocente)
    ├── types.ts                 # Tipos TypeScript
    └── utils.ts                 # Funciones utilitarias (fieldClass, dateLabel, getIconByName)
```

## Conexión con el backend

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| POST | `/api/auth/login` | Iniciar sesión | público |
| GET | `/api/auth/me` | Usuario actual | autenticado |
| GET | `/api/resources/` | Listar recursos (paginado) | autenticado |
| GET | `/api/resources/:id` | Obtener recurso | autenticado |
| POST | `/api/resources/` | Crear recurso | admin, bibliotecaria |
| PUT | `/api/resources/:id` | Actualizar recurso | admin, bibliotecaria |
| DELETE | `/api/resources/:id` | Baja lógica de recurso | **admin** |
| GET | `/api/requests/` | Listar solicitudes (paginado) | autenticado |
| GET | `/api/requests/availability` | Disponibilidad por recurso y fecha | autenticado |
| GET | `/api/requests/:id` | Obtener solicitud | dueño o gestor |
| POST | `/api/requests/` | Crear solicitud | docente |
| PATCH | `/api/requests/:id/review` | Confirmar / rechazar | **bibliotecaria** |
| PATCH | `/api/requests/:id/cancel` | Cancelar solicitud | dueño o gestor |
| GET | `/api/users/` | Listar usuarios (paginado) | admin, bibliotecaria |
| POST | `/api/users/` | Crear usuario | **admin** |
| PUT | `/api/users/:id` | Actualizar usuario | **admin** |
| DELETE | `/api/users/:id` | Baja lógica de usuario | **admin** |
| GET | `/api/admin/dashboard` | Métricas del panel | admin, bibliotecaria |
| GET | `/api/admin/reporte-usuarios` | Reportes de baja/mantenimiento | **admin** |
| GET | `/api/admin/audit-logs` | Logs de auditoría | **admin** |

Los listados de `requests`, `users` y `resources` responden todos el mismo contrato:

```json
{ "items": [], "page": 1, "per_page": 10, "total": 0, "pages": 0 }
```

`getResources()` y `getRequests()` ya desempaquetan `.items` y devuelven un array al resto de la app.

## Autenticación

El sistema usa JWT (JSON Web Tokens). El token y el usuario se guardan en `localStorage`
(`bh-token`, `bh-user`) y el token se envía en `Authorization: Bearer <token>`.

Flags expuestos por `AuthContext`:

| Flag | Valor | Uso |
|------|-------|-----|
| `isAdmin` | `role === "admin"` | Únicamente las 4 secciones `/admin/*`. Redirige a `/admin/dashboard` si entra en `/`, `/solicitudes` o `/nueva-solicitud` |
| `isBibliotecaria` | `role === "bibliotecaria"` | Ver **todas** las solicitudes, confirmar/rechazar/cancelar, cola de pendientes |
| `isDocente` | `role === "docente"` | Crear solicitudes y ver solo las propias |

> **Separación estricta:** no existe un flag `isGestor` que mezcle roles. La gestión de
> solicitudes es exclusiva de la bibliotecaria; el administrador solo administra
> usuarios, recursos y reportes. El backend lo refuerza (`403` en `/requests/<id>/review`
> para cualquier rol distinto de `bibliotecaria`).

## Roles y Acceso en la Interfaz

| **Rol** | **Sidebar** | **Funciones** |
|---------|-------------|---------------|
| **docente** | Inicio · Recursos · Nueva solicitud · Mis solicitudes · Perfil | Crear solicitudes, ver y cancelar las propias |
| **bibliotecaria** | Gestión de biblioteca: Inicio · Solicitudes pendientes · Solicitudes · Recursos · Perfil | Ver todas las solicitudes, confirmar/rechazar, verificar disponibilidad |
| **admin** | **Administración**: Panel de control · Usuarios · Gestión de recursos · Reportes · Perfil | Solo administración: altas/bajas de usuarios y recursos, reportes y auditoría. No ve la cola de solicitudes (tarea del bibliotecario) |

## Flujo de Trabajo

1. **Acceso**: el usuario se loguea; `AuthProvider` persiste sesión en `localStorage`.
2. **Navegación**: `Layout` arma el sidebar según `isAdmin` / `isBibliotecaria`, sin
   mezclar bloques (admin → solo «Administración»; bibliotecaria → «Gestión de
   biblioteca»; docente → «Mi espacio»).
3. **Guardas de ruta**: las páginas `/admin/*` redirigen a `/` si `!isAdmin`; el
   administrador redirige a `/admin/dashboard` desde `/`, `/solicitudes` y
   `/nueva-solicitud`, y `/pendientes` muestra «Acceso no permitido» para cualquier rol
   distinto de bibliotecaria. Las páginas protegidas usan `useAuthGuard()` y redirigen a
   `/login` sin sesión.
4. **Acciones**: cada botón se muestra según rol y el backend vuelve a validar por JWT
   (`@role_required`).

## Páginas Administrativas

### Panel de control (`/admin/dashboard`)
Métricas (recursos, usuarios activos, solicitudes del mes, pendientes), estado de
solicitudes, recursos más solicitados y últimas acciones de auditoría.

### Usuarios (`/admin/usuarios`)
Listado con búsqueda y filtro por rol, formulario de alta (nombre, email, contraseña,
rol, DNI, teléfono) y baja lógica.

### Gestión de recursos (`/admin/recursos`)
Listado con búsqueda, alta de recursos (id, nombre, categoría, descripción,
especificaciones, estado, serie, ubicación), cambio de estado en línea
(Excelente/Bueno/En mantenimiento/Fuera de servicio) y baja lógica.

> `EN_MANTENIMIENTO` y `FUERA_DE_SERVICIO` marcan automáticamente `available: false`,
> lo que impide crear solicitudes sobre ese recurso.

### Reportes (`/admin/reportes`)
Consume `/api/admin/reporte-usuarios`: usuarios por rol (activos/baja), recursos por
estado (disponibles/mantenimiento) y solicitudes por estado.

## Regla central visible en la UI

- **Nueva solicitud**: los módulos solo se habilitan si el slot no tiene una
  `CONFIRMADA`. Una `PENDIENTE` no bloquea la selección.
- **Panel de control**: muestra el recordatorio de la regla.
- Al confirmar, el backend cancela las demás pendientes del cupo y notifica al docente
  (traza `NOTIFICATION` en auditoría).
