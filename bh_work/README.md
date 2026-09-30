# Biblioteca Horizonte — Next.js + App Router

Versión adaptada desde el prototipo original de Figma Make para utilizar **Next.js + App Router + TypeScript + Tailwind CSS**.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
```

El proyecto utiliza `output: "export"`, por lo que `pnpm build` genera el sitio estático en `out/`.

## Arquitectura

- `src/app/layout.tsx`: layout raíz y proveedor global.
- `src/app/App.tsx`: estado de la demo, componentes reutilizables y funcionalidades.
- `src/app/**/page.tsx`: rutas del App Router.
- `next.config.ts`: configuración de Next.js y exportación estática.
- `src/index.css`: Tailwind CSS v4 y tokens visuales.

## Rutas principales

- `/login`
- `/`
- `/recursos`
- `/recursos/[id]`
- `/nueva-solicitud`
- `/solicitudes`
- `/solicitudes/[id]`
- `/pendientes`
- `/perfil`
- `/guia`
- `/solicitudes/[id]/enviada`
- `/solicitudes/[id]/confirmada`
- `/solicitudes/[id]/rechazada`

La interfaz conserva los roles Docente y Bibliotecaria, los estados PENDIENTE/CONFIRMADA/RECHAZADA y la regla de no duplicación definida para Biblioteca Horizonte.
