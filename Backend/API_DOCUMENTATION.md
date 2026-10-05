# Biblioteca Horizonte — Documentación API

> Fuente viva: `app/docs/openapi.yaml` (Swagger) + este documento (visión general).
> Stack: Flask 3 · SQLAlchemy · Marshmallow · Flask-JWT-Extended · Flask-Migrate · SQLite (dev) / PostgreSQL (prod).

## 1. Arquitectura

```
Backend/
├── run.py                  # Entrada: Flask en 0.0.0.0:5000
├── app/
│   ├── __init__.py         # create_app(): extensiones + blueprints (incl. Swagger)
│   ├── config.py           # Config (SECRET, DATABASE_URL, JWT expiración)
│   ├── extensions.py       # db, ma, jwt, migrate
│   ├── models/             # User, Resource, Request, AuditLog
│   ├── schemas/            # Login, User, Resource, Request (Marshmallow)
│   ├── services/           # auth, user, resource, request (reglas de negocio)
│   ├── routes/             # auth, users, resources, requests, admin
│   ├── docs/
│   │   ├── openapi.yaml    # Especificación OpenAPI 3.0 (fuente única Swagger)
│   │   └── swagger.py      # Blueprint /api/docs + /openapi.yaml
│   └── utils/              # role_required, error_handlers
├── requirements.txt
├── seed.py / reset_passwords.py
└── API_DOCUMENTATION.md (este archivo)
```

## 2. Instalación y ejecución

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"
python run.py          # http://127.0.0.1:5000
python seed.py         # 2 proyectores + 4 notebooks (destructivo)
```

Variables (`.env`): `SECRET_KEY`, `DATABASE_URL` (default `sqlite:///biblioteca_horizonte.db`),
`JWT_SECRET_KEY`, `JWT_ACCESS_TOKEN_EXPIRES` (segundos, default 3600).

## 3. Documentación interactiva (Swagger)

| Recurso | URL |
|---|---|
| Swagger UI | `GET http://127.0.0.1:5000/api/docs/` |
| Spec YAML | `GET http://127.0.0.1:5000/openapi.yaml` |

Flujo en Swagger UI: `POST /api/auth/login` → copiar `token` → botón **Authorize** →
`Bearer <token>` → probar el resto.

Colección Postman: `Biblioteca_Horizonte.postman_collection.json` (misma base URL,
tokens auto-guardados en variables).

## 4. Autenticación y roles

Login: `POST /api/auth/login` con `{email, password}` → `{token, user}`.
Header resto: `Authorization: Bearer <token>`. `GET /api/auth/me` = perfil actual.

Usuarios seed:

| Email | Rol | Password |
|---|---|---|
| admin@horizonte.edu.ar | admin | Admin123! |
| biblioteca@horizonte.edu.ar | bibliotecaria | Biblioteca123! |
| docente1@horizonte.edu.ar | docente | Docente123! |
| docente2@horizonte.edu.ar | docente | Docente123! |

| Rol | Permisos |
|---|---|
| docente | auth, ver recursos, crear/ver/cancelar **sus** solicitudes |
| bibliotecaria | ver **todas** las solicitudes, `review`, disponibilidad con detalle, dashboard. NO administra usuarios ni da de baja recursos |
| admin | usuarios (CRUD + baja lógica), alta/recursos, baja de recursos, reportes, audit-logs, dashboard. NO gestiona solicitudes ajenas |

Cuenta no `ACTIVO` → `403`. Sin token / vencido → `401`.

## 5. Endpoints (20)

### Auth — `/api/auth`
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | autenticado |

### Users — `/api/users`
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/users/?page=&limit=&role=&status=&search=` | admin, bibliotecaria |
| GET | `/api/users/<user_id>` | admin, bibliotecaria |
| POST | `/api/users/` | solo admin → `201` / `409` email duplicado |
| PUT | `/api/users/<user_id>` | solo admin |
| DELETE | `/api/users/<user_id>` | solo admin (baja lógica `INACTIVO`) |

Body crear: `{name, email, password≥8, role, dni?, phone?}`.

### Resources — `/api/resources`
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/resources/?category=&available=&page=&limit=` | autenticado |
| GET | `/api/resources/<resource_id>` | autenticado (slug, ej. `proyector-01`) |
| POST | `/api/resources/` | admin, bibliotecaria |
| PUT | `/api/resources/<resource_id>` | admin, bibliotecaria |
| DELETE | `/api/resources/<resource_id>` | solo admin (`available:false`) |

`category`: `Equipamiento|Espacios|Material bibliográfico`.
`condition`: `EXCELENTE|BUENO|EN_MANTENIMIENTO|FUERA_DE_SERVICIO`.

### Requests — `/api/requests`
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/requests/?status=&user_id=&resource_id=&page=&per_page=` | autenticado (solo bibliotecaria ve todo; resto solo lo suyo) |
| GET | `/api/requests/availability?resource_id=&date=` | autenticado |
| GET | `/api/requests/<request_id>` | dueño o bibliotecaria (`BH-XXXX`) |
| POST | `/api/requests/` | autenticado (típicamente docente) |
| PATCH | `/api/requests/<id>/cancel` | dueño o bibliotecaria |
| PATCH | `/api/requests/<id>/review` | **solo bibliotecaria** body `{status: CONFIRMADA\|RECHAZADA\|CANCELADA}` |

Crear:
```json
{ "resource_id": "proyector-01", "teacher": "Juan Pérez", "date": "2026-10-20",
  "shift": "Mañana · 08:00–12:00", "module": "Módulo 1 · 08:00–09:20", "notes": "..." }
```
`shift/module` deben ser coherentes (ver `SHIFT_MODULES` en `schemas/request.py`),
fecha no pasada, máx 60 días anticipación, recurso `available:true`.

### Admin — `/api/admin`
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/admin/dashboard` | admin, bibliotecaria |
| GET | `/api/admin/reporte-usuarios` | solo admin |
| GET | `/api/admin/audit-logs` | solo admin (últimos 100) |

### Paginación (contrato único)
```json
{ "items": [], "page": 1, "per_page": 10, "total": 0, "pages": 0 }
```
`requests` usa `page/per_page`; `users` y `resources` usan `page/limit` (respuesta normalizada a `per_page`).

## 6. Regla central de reservas

Solo **1 CONFIRMADA** por `(resource_id, date, shift, module)`:
- Crear: solo CONFIRMADA bloquea → varias PENDIENTES pueden competir.
- Disponibilidad: solo CONFIRMADA marca ocupado.
- Review: al confirmar se re-verifica; índice único parcial `uq_confirmed_request_slot WHERE status='CONFIRMADA'`.
- Al confirmar: `NOTIFICATION` al docente + auto-cancelación de las demás PENDIENTES (`AUTO_CANCEL_PENDING` en `AuditLog`).

## 7. Errores estándar

| Código | error | Cuándo |
|---|---|---|
| 400 | Bad Request | `availability` sin params, `cancel/review` inválido, horario pasado |
| 401 | Unauthorized | sin token, vencido, login inválido, usuario inexistente |
| 403 | Forbidden | rol insuficiente, cuenta no activa, solicitud ajena |
| 404 | Not Found | entidad inexistente |
| 409 | Conflict | slot ocupado, email/DNI duplicado, recurso no disponible |
| 422 | Validation Error | Marshmallow → incluye `fieldErrors` |
| 500 | Internal Server Error | excepción no controlada |

```json
{ "error": "Validation Error", "message": "Datos inválidos.",
  "fieldErrors": { "module": ["El módulo ... no corresponde al turno ..."] } }
```

## 8. Mantenimiento docs

1. Cambiar código → actualizar `app/docs/openapi.yaml` **primero**.
2. Si cambia el contrato (enums, paginación, roles) → actualizar este `.md` + `../../docs/contrato-api.md` + tipos del frontend.
3. Validar: `python -c "import yaml; yaml.safe_load(open('app/docs/openapi.yaml'))"` y abrir `/api/docs/`.
