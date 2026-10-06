# Contrato de integración (API)

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-17 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-05 |
| **Versión** | 1.4 — fuente viva OpenAPI/Swagger (`app/docs/openapi.yaml`, commit `0ae8fa3`); 21 endpoints sin cambios |
| **Base URL** | `http://localhost:5000` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Autenticación** | `Authorization: Bearer <token JWT>` (excepto login) |
| **Relacionados** | BH-11 (fuente local) · BH-12 (D-11) · BH-14 |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.4 | 2026-10-05 | Se agrega `openapi.yaml` como especificación viva (Swagger UI y colección Postman); las 21 operaciones coinciden con este contrato | Equipo |
| 1.3 | 2026-10-04 | 21 endpoints, roles, paginación y B-02/B-03/B-06 cerradas + control documental | Equipo |
| 1.0 | 2026-10-02 | Ingreso al repo (commit 99d53dc) | Equipo |

> Acuerdo de equipo: **frontend y backend usan literalmente los mismos strings** de estados, turnos y módulos. Si uno cambia un valor, cambia el contrato y se documenta aquí.

> **Especificación viva (2026-10-05):** `Backend/app/docs/openapi.yaml` describe las mismas 21 operaciones que este contrato y se sirve en Swagger UI (`http://localhost:5000/api/docs/`) con colección de Postman en `Backend/Biblioteca_Horizonte.postman_collection.json` (D-11). Si cambia una ruta, se actualizan ambos en la misma pasada.

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

## 2. Endpoints (21)

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

Respuesta de listado **paginada** (formato unificado en los 3 listados — B-06 cerrada):

```jsonc
{ "items": [ … ], "page": 1, "per_page": 10, "total": 42, "pages": 5 }
```

> Detalle: el parámetro de página se llama `limit` en `/users` y `/resources`, y `per_page` en `/requests`; la **respuesta** es idéntica en los tres.

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
| GET | `/api/requests/?status=&user_id=&resource_id=&page=&per_page=` | Autenticado | Paginado (B-06). **Solo `bibliotecaria` ve el listado completo**: docente y admin ven únicamente las propias |
| GET | `/api/requests/availability?resource_id=&date=` | Autenticado | Disponibilidad del día: `{slots:[{shift, module, available}]}`; solo `bibliotecaria` recibe además `reason`/`request_id`. 400 si faltan los parámetros |
| GET | `/api/requests/<id>` | Dueño; bibliotecaria | 403 si es ajena y el rol no es `bibliotecaria` (**admin → 403**: no gestiona solicitudes) |
| POST | `/api/requests/` | Autenticado | 201 · 409 si hay conflicto |
| PATCH | `/api/requests/<id>/review` | **solo bibliotecaria** | body `{ "status": "CONFIRMADA" \| "RECHAZADA" \| "CANCELADA" }`; solo sobre `PENDIENTE` (admin → 403) |
| PATCH | `/api/requests/<id>/cancel` | Dueño (cualquier rol) o bibliotecaria | Cancela solicitudes propias (o cualquiera, si es bibliotecaria) en estado PENDIENTE/CONFIRMADA |

> **Cambio de rol (commit `3bd27b0`):** el `admin` quedó **fuera** de la gestión de solicitudes — el panel de administración cubre usuarios, recursos, reportes y auditoría; confirmar/rechazar es exclusivo de la `bibliotecaria`.

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

**GET `/api/requests/availability` — disponibilidad de un recurso por fecha**

```jsonc
// Request: ?resource_id=proyector-01&date=2026-10-10
// 200 OK
{ "slots": [
  { "shift": "Mañana · 08:00–12:00", "module": "Módulo 1 · 08:00–09:20", "available": false },
  { "shift": "Mañana · 08:00–12:00", "module": "Módulo 2 · 09:30–10:50", "available": true },
  // … 6 slots (2 turnos × 3 módulos)
] }

// Solo bibliotecaria, cada slot incluye además:
//   "reason": "PENDIENTE" | "CONFIRMADA", "request_id": "BH-0001"
// (una PENDIENTE NO ocupa el cupo: solo la CONFIRMADA marca available=false)

// 400 – faltan parámetros
{ "error": "Bad Request", "message": "resource_id y date son obligatorios." }
```

**PATCH `/api/requests/<id>/review` — confirmar / rechazar / cancelar (solo bibliotecaria)**

```jsonc
// Request
{ "status": "CONFIRMADA" }

// 200 OK
{ "id": "BH-0001", "status": "CONFIRMADA", "reviewed_by": "…", "reviewed_at": "…", "…": "…" }

// 403 – un docente (o el admin) intenta revisar
{ "error": "Forbidden", "message": "No tenés permiso para esta acción." }

// 400 – la solicitud no está PENDIENTE (ej.: ya fue confirmada/rechazada)
{ "error": "Bad Request", "message": "Solo se pueden revisar solicitudes pendientes." }

// 409 – segunda confirmación para mismo recurso/fecha/turno/módulo
// (re-verificación en el servicio + índice único `uq_confirmed_request_slot` como respaldo)
{ "error": "Conflict", "message": "El recurso ya está reservado en ese horario." }
```

> **Efectos de confirmar (commit `3bd27b0`):** además de cambiar el estado, el servicio (a) registra una **notificación** al docente (`AuditLog action=NOTIFICATION`) y (b) **auto-cancela** las demás solicitudes `PENDIENTE` del mismo recurso+fecha+turno+módulo (`AuditLog action=AUTO_CANCEL_PENDING`).

**PATCH `/api/requests/<id>/cancel` — cancelación por el docente dueño o la bibliotecaria**

```jsonc
// Request (sin body; se identifica por el token)
// 200 OK
{ "id": "BH-0001", "status": "CANCELADA", "reviewed_by": "…", "reviewed_at": "…" }

// 403 – no es el dueño (y no es bibliotecaria)
{ "error": "Forbidden", "message": "No tenés permiso para cancelar esta solicitud." }

// 400 – estado final (RECHAZADA o CANCELADA)
{ "error": "Bad Request", "message": "Solo se pueden cancelar solicitudes pendientes o confirmadas." }

// 400 – el horario ya pasó
{ "error": "Bad Request", "message": "No se puede cancelar una solicitud cuyo horario ya pasó." }
```

### 2.5 Administración — `/api/admin`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/admin/dashboard` | admin, bibliotecaria |
| GET | `/api/admin/reporte-usuarios` | admin |
| GET | `/api/admin/audit-logs` | admin (últimos 100) |

`dashboard` devuelve `totalResources`, `activeUsers`, `totalRequestsThisMonth`, `pendingRequests`, `confirmedRequests`, `rejectedRequests`, `mostRequestedResources[]`.

## 3. Formato de errores (estándar)

| Código | `error` | Cuándo |
|---|---|---|
| 400 | `Bad Request` | Error genérico de la petición o regla de negocio rechazada en `review`/`cancel` |
| 401 | `Unauthorized` | Sin token, token vencido o credenciales inválidas |
| 403 | `Forbidden` | Rol insuficiente / cuenta no activa / recurso ajeno |
| 404 | `Not Found` | Entidad inexistente |
| 409 | `Conflict` | Regla de negocio violada: duplicado al crear o al **confirmar** (409 desde el servicio + índice único), email repetido, recurso no disponible |
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

## 6. Known issues del contrato (al 04/10/2026)

Tabla propia de este contrato; el detalle de todas las brechas vive en `03_Diseno/02_Estados_y_reglas.md`, sección 7 (fuente única).

| # | Issue | Efecto | Brecha | Estado |
|---|---|---|---|---|
| 1 | `review` resolvía el duplicado con **400** en lugar de **409** | El front no distinguía el duplicado de un error genérico | B-03 (relacionada) | Cerrado — hoy responde **409** |
| 2 | `GET /api/requests/` sin paginación | Rendimiento con muchos registros (RNF04) | B-06 | Cerrado — `{items, page, per_page, total, pages}` en los 3 listados |
| 3 | `CORS(app)` sin restricción de orígenes (`datetime.utcnow` ya no se usa: todos los timestamps usan `America/Argentina/Cordoba`) | Seguridad/robustez | B-08 | Parcial — tz resuelta · CORS sigue abierto |
| 4 | Sin `.env.example` (el `migrations/` ya está inicializado con Alembic) | RNF07 (ejecución en otra computadora) | B-14, B-13 | B-13 Cerrada · B-14 Abierta |
| 5 | ID `BH-XXXX` generado sin transacción (`max()+1` en el servicio) | Colisiones ante concurrencia | B-10 | Abierto |
| 6 | Regla central sin índice único de respaldo en BD | Única barrera restante para RF07 | B-02 | Cerrado — `uq_confirmed_request_slot` (parcial, `WHERE status='CONFIRMADA'`) + `IntegrityError` → 409 |

**Sin known issues abiertos que afecten el formato del contrato.** Los pendientes (B-08 CORS, B-10 IDs, B-14 `.env.example`) no cambian request/response.

---

**Uso de este documento:** contrato vivo entre Next.js (cliente) y Flask (servicio); se modifica junto con el código y el frontend.

## Referencias normativas

- RFC 9110 – HTTP Semantics (códigos de estado 4xx/5xx).
- RFC 7519 – JSON Web Token (JWT).
- OpenAPI Specification 3.1 – estilo de descripción de APIs REST.
