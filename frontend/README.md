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
npm run build
npm start
```

## Estructura del proyecto

```
src/
├── app/                    # Páginas Next.js App Router
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Dashboard
│   ├── globals.css         # Estilos globales
│   ├── login/page.tsx      # Inicio de sesión
│   ├── recursos/page.tsx   # Lista de recursos
│   ├── recursos/[id]/page.tsx  # Detalle de recurso
│   ├── nueva-solicitud/page.tsx # Nueva solicitud
│   ├── solicitudes/page.tsx    # Lista de solicitudes
│   ├── solicitudes/[id]/page.tsx # Detalle de solicitud
│   ├── solicitudes/[id]/enviada/page.tsx
│   ├── solicitudes/[id]/confirmada/page.tsx
│   ├── solicitudes/[id]/rechazada/page.tsx
│   ├── pendientes/page.tsx     # Solicitudes pendientes (admin)
│   ├── perfil/page.tsx         # Perfil de usuario
│   └── guia/page.tsx           # Guía del sistema
├── components/             # Componentes reutilizables
│   ├── Layout.tsx          # Layout con sidebar
│   ├── ui.tsx              # Componentes UI base
│   ├── ResourceCard.tsx    # Tarjeta de recurso
│   ├── RequestTable.tsx    # Tabla de solicitudes
│   └── Modal.tsx           # Modal de confirmación
└── lib/                    # Utilidades y configuración
    ├── api.ts              # Cliente HTTP para la API
    ├── auth.tsx            # Contexto de autenticación
    ├── types.ts            # Tipos TypeScript
    └── utils.ts            # Funciones utilitarias
```

## Conexión con el backend

El frontend se conecta a la API Flask a través de los siguientes endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |
| GET | `/api/resources/` | Listar recursos |
| GET | `/api/resources/:id` | Obtener recurso |
| POST | `/api/resources/` | Crear recurso (admin) |
| PUT | `/api/resources/:id` | Actualizar recurso (admin) |
| DELETE | `/api/resources/:id` | Eliminar recurso (admin) |
| GET | `/api/requests/` | Listar solicitudes |
| GET | `/api/requests/:id` | Obtener solicitud |
| POST | `/api/requests/` | Crear solicitud |
| PATCH | `/api/requests/:id/review` | Revisar solicitud (admin) |
| GET | `/api/users/` | Listar usuarios (admin) |
| GET | `/api/admin/dashboard` | Métricas (admin) |

## Autenticación

El sistema usa JWT (JSON Web Tokens) para la autenticación. El token se almacena en
`localStorage` y se envía en el header `Authorization: Bearer <token>` en cada solicitud.

## Roles

- **docente**: Puede ver recursos, crear solicitudes y ver sus propias solicitudes.
- **bibliotecaria**: Puede ver todas las solicitudes, confirmar o rechazar solicitudes pendientes.
- **admin**: Acceso completo al sistema.
