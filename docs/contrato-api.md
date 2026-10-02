# Contrato de integración (API)

| Campo | Valor |
|---|---|
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-02 |
| **Base URL** | `http://localhost:5000` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Autenticación** | `Authorization: Bearer <token JWT>` (excepto login) |

> Acuerdo de equipo: **frontend y backend usan literalmente los mismos strings** de estados, turnos y módulos. Si uno cambia un valor, cambia el contrato y se documenta aquí.

## 1. Catálogo compartido (fuente única de verdad)

| Concepto | Valores permitidos |
|---|---|
| `status` de solicitud | `PENDIENTE`, `CONFIRMADA`, `RECHAZADA`, `CANCELADA` |
| `role` de usuario | `docente`, `bibliotecaria`, `admin` |
| `status` de usuario | `ACTIVO`, `INACTIVO`, `SUSPENDIDO` |
| `shift` | `Mañana · 08:00–12:00`, `Tarde · 13:00–17:00` |
| `module` | `Módulo 1 · 08:00–09:20`, `Módulo 2 · 09:30–10:50`, `Módulo 3 · 11:00–12:00`, `Módulo 1 · 13:00–14:20`, `Módulo 2 · 14:30–15:50`, `Módulo 3 · 16:00–17:00` |
| `category` de recurso | `Equipamiento`, `Espacios`, `Material bibliográfico` |
| `condition` | `EXCELENTE`, `BUENO`, `EN_MANTENIMIENTO`, `FUERA_DE_SERVICIO` |

## 2. Endpoints (19)

### 2.1 Autenticación — `/api/auth`

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Devuelve `{token, user}` |
| GET | `/api/auth/me` | Autenticado | Perfil del token actual |

**POST `/api/auth/login`** — el cuerpo **no incluye `role`**: el servidor lo busca en la base de datos.

```jsonc
// Request
{ "email": "lucia@horizonte.edu.ar", "password": "••••" }

// 200 OK
{ "token": "eyJhbGciOiJIUzI1NiIs…",
  "user": { "id": "1d8a…", "name": "Lucía", "email": "lucia@horizonte.edu.ar",
            "role": "bibliotecaria", "status": "ACTIVO", "dni": "…", "phone": "…",
            "created_at": "…", "updated_at": "…" } }

// 401 – credenciales inválidas o cuenta no activa
{ "error": "Unauthorized", "message": "Credenciales inválidas." }
```

### 2.2 Usuarios — `/api/users`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/users/?page=&limit=&role=&status=&search=` | admin, bibliotecaria |
| GET | `/api/users/<id>` | admin, bibliotecaria |
| POST | `/api/users/` | admin |
| PUT | `/api/users/<id>` | admin |
| DELETE | `/api/users/<id>` | admin (baja lógica `status: INACTIVO`) |

Respuesta de listado **paginada**: `{ "data": [...], "total": 12 }`.

### 2.3 Recursos — `/api/resources`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/resources/?category=&available=&page=&limit=` | Autenticado (paginado si envía `page`/`limit`) |
| GET | `/api/resources/<id>` | Autenticado |
| POST | `/api/resources/` | admin, bibliotecaria |
| PUT | `/api/resources/<id>` | admin, bibliotecaria |
| DELETE | `/api/resources/<id>` | admin (`available: false`) |

### 2.4 Solicitudes — `/api/requests`

| Método | Ruta | Rol | Notas |
|---|---|---|---|
| GET | `/api/requests/?status=&user_id=&resource_id=` | Autenticado | ⚠ sin paginación (devuelve array completo) |
| GET | `/api/requests/<id>` | Dueño; admin, bibliotecaria | 403 si es ajena y el rol no es admin/bibliotecaria |
| POST | `/api/requests/` | Autenticado | 201 · 409 si hay conflicto |
| PATCH | `/api/requests/<id>/review` | admin, bibliotecaria | body `{ "status": "CONFIRMADA" \| "RECHAZADA" \| "CANCELADA" }` |
| PATCH | `/api/requests/<id>/cancel` | Dueño (cualquier rol) | Cancela sus propias solicitudes PENDIENTE/CONFIRMADA |

**POST `/api/requests/` — crear solicitud**

```jsonc
// Request
{
  "resource_id": "proyector-01",
  "teacher": "Juan Pérez",
  "date": "2026-10-10",
  "shift": "Mañana · 08:00–12:00",
  "module": "Módulo 1 · 08:00–09:20",
  "notes": "Se requiere cable HDMI adicional."
}

// 201 Created
{ "id": "BH-0001", "resource_id": "proyector-01", "user_id": "1d8a…", "teacher": "Juan Pérez",
  "date": "2026-10-10", "shift": "Mañana · 08:00–12:00", "module": "Módulo 1 · 08:00–09:20",
  "notes": "…", "status": "PENDIENTE", "created_at": "…", "reviewed_by": null, "reviewed_at": null }

// 409 Conflict – duplicado al crear, recurso no disponible o inexistente
{ "error": "Conflict", "message": "El recurso ya está reservado en ese horario." }

// 422 – fecha pasada, módulo incoherente con el turno, datos inválidos
{ "error": "Validation Error", "message": "Datos inválidos.",
  "fieldErrors": { "date": ["La fecha no puede ser anterior a hoy."] } }
```

**PATCH `/api/requests/<id>/review` — confirmar / rechazar / cancelar (bibliotecaria o admin)**

```jsonc
// Request
{ "status": "CONFIRMADA" }

// 200 OK
{ "id": "BH-0001", "status": "CONFIRMADA", "reviewed_by": "…", "reviewed_at": "…", "…": "…" }

// 403 – un docente intenta confirmar
{ "error": "Forbidden", "message": "No tenés permiso para esta acción." }

// Segunda confirmación para mismo recurso/fecha/turno/módulo:
// ver §6 — hoy responde 400, debería ser 409 (known issue)
{ "error": "Bad Request", "message": "El recurso ya está reservado en ese horario por otra solicitud confirmada." }
```

**PATCH `/api/requests/<id>/cancel` — cancelación por el docente dueño**

```jsonc
// Request (sin body; se identifica por el token)
// 200 OK
{ "id": "BH-0001", "status": "CANCELADA", "reviewed_by": "…", "reviewed_at": "…" }

// 403 – no es el dueño
{ "error": "Forbidden", "message": "No tenés permiso para cancelar esta solicitud." }

// 400 – estado final (RECHAZADA o CANCELADA)
{ "error": "Bad Request", "message": "Solo se pueden cancelar solicitudes pendientes o confirmadas." }
```

### 2.5 Administración — `/api/admin`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/admin/dashboard` | admin, bibliotecaria |
| GET | `/api/admin/audit-logs` | admin (últimos 100) |

`dashboard` devuelve `totalResources`, `activeUsers`, `totalRequestsThisMonth`, `pendingRequests`, `confirmedRequests`, `rejectedRequests`, `mostRequestedResources[]`.

## 3. Formato de errores (estándar)

| Código | `error` | Cuándo |
|---|---|---|
| 400 | `Bad Request` | Error genérico de la petición o regla de negocio rechazada en `review`/`cancel` |
| 401 | `Unauthorized` | Sin token, token vencido o credenciales inválidas |
| 403 | `Forbidden` | Rol insuficiente / cuenta no activa / recurso ajeno |
| 404 | `Not Found` | Entidad inexistente |
| 409 | `Conflict` | Regla de negocio violada al crear (duplicado, email repetido, recurso no disponible) |
| 422 | `Validation Error` | Falló Marshmallow → incluye `fieldErrors` |
| 500 | `Internal Server Error` | Excepción no controlada (sin detalle interno) |

```jsonc
// 422 Ejemplo
{ "error": "Validation Error", "message": "Datos inválidos.", "fieldErrors": { "module": ["El módulo no corresponde al turno 'Mañana · 08:00–12:00'."] } }
```

## 4. Acuerdos de integración

1. **El cliente no decide estados:** solo envía la intención (`status`) y pinta lo que el servidor responde.
2. **Errores amigables:** el frontend traduce cada código (409/400 → mensaje de duplicado, 422 → resaltar campo, 403 → "no tenés permiso").
3. **JWT:** se guarda en `localStorage` y se lee dentro de `useEffect` (evita el error de pantalla en blanco).
4. **CORS:** el backend habilita CORS en todas las rutas; en producción se restringirá al origen del frontend.
5. **Cambios al contrato:** se registran y se actualiza este documento **antes** de tocar el código.

## 5. Datos compartidos con el frontend

- El frontend (`Frontend/src/lib/api.ts`) usa `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:5000`) y un `rewrite` de Next.js para `/api/*`.
- Los paquetes del frontend se manejan con **npm** (`package-lock.json`).
- Los enums (estados, turnos, módulos) están duplicados como literales en `Frontend/src/lib/types.ts`: si cambian, cambian ambos extremos.
- Estructura del repo: `Backend/` (Flask, arranca con `python run.py`) y `Frontend/` (Next.js).

## 6. Known issues del contrato → `brechas.md`

Los known issues que afectan a este contrato están versionados en **[`brechas.md`](brechas.md)** (fuente única). Los directamente vinculados a la API:

| # | Issue | Efecto | Brecha | Estado |
|---|---|---|---|---|
| 1 | `review` devuelve **400** para el duplicado al confirmar, pero el contrato y el frontend esperan **409** (y 409 para estado inválido) | El front no distingue el duplicado de un error genérico | B-03 | ❌ Abierto — unificar en 409 al corregir B-03 |
| 2 | `GET /api/requests/` sin paginación | Rendimiento con muchos registros (RNF04) | B-06 | ⚠️ Parcial — `users` y `resources` paginados, `requests` no |
| 3 | `datetime.utcnow` sin zona horaria; `CORS(app)` sin restricción de orígenes | Robustez y seguridad | B-08 | ❌ Abierto |
| 4 | Sin `.env.example` ni `migrations/` inicializado | RNF07 (ejecución en otra computadora) | B-14, B-13 | ❌ Abiertos |
| 5 | ID `BH-XXXX` generado sin transacción | Colisiones ante concurrencia | B-10 | ❌ Abierto |
| 6 | Regla central sin índice único de respaldo en BD | Única barrera restante para RF07 | B-02 | ❌ Abierto (crítico) |

---

**Uso de este documento:** contrato vivo entre Next.js (cliente) y Flask (servicio); se modifica junto con el código y el frontend.
