# Biblioteca Horizonte

Sistema web de reservas de recursos de la Biblioteca Escolar Horizonte (2 proyectores y 4 notebooks). El docente solicita un recurso y la bibliotecaria confirma o rechaza cada solicitud, con garantía de consistencia: **solo puede existir 1 solicitud `CONFIRMADA` por recurso, fecha, turno y módulo horario**. Una solicitud `PENDIENTE` no garantiza disponibilidad.

| Campo | Valor |
|---|---|
| Asignatura | Ingeniería de Software – 2026 · Tecnicatura Superior en Desarrollo de Software (Sede Río Tercero) |
| Grupo | Grupo D |
| Integrantes | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| Docente | Gómez Carlos |
| Sincronización | Commit `0ae8fa3` (2026-10-05) |

## Estructura del repositorio

```
biblioteca-horizonte/
├── Backend/                          # API REST (Flask)
│   ├── app/
│   │   ├── __init__.py               # create_app: CORS, JWT, blueprints, Swagger
│   │   ├── config.py                 # SECRET_KEY, DATABASE_URL, expiración del JWT
│   │   ├── extensions.py             # db, ma, jwt, migrate
│   │   ├── models/                   # user · resource · request · audit_log
│   │   ├── schemas/                  # Marshmallow: validación y serialización
│   │   ├── routes/                   # auth · users · resources · requests · admin
│   │   ├── services/                 # lógica de negocio (auth, user, resource, request)
│   │   ├── utils/                    # @role_required y manejadores de error
│   │   └── docs/                     # openapi.yaml (OpenAPI 3.0) + Swagger UI
│   ├── migrations/                   # Alembic (Flask-Migrate)
│   ├── API_DOCUMENTATION.md          # guía completa de endpoints
│   ├── Biblioteca_Horizonte.postman_collection.json   # colección para Postman
│   ├── requirements.txt
│   ├── run.py                        # python run.py -> http://localhost:5000
│   ├── seed.py                       # recursos de ejemplo (reemplaza los existentes)
│   ├── reset_passwords.py            # restaura las credenciales de demostración
│   └── README.md                     # detalle del backend
├── Frontend/                         # aplicación web (Next.js)
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── login/ · perfil/ · guia/
│   │   │   ├── recursos/ · solicitudes/ · nueva-solicitud/ · pendientes/
│   │   │   └── admin/                # dashboard · usuarios · recursos · reportes
│   │   ├── components/               # componentes de interfaz
│   │   └── lib/                      # cliente HTTP (api.ts)
│   ├── package.json                  # npm run dev | build | lint
│   └── README.md                     # detalle del frontend
├── docs/                             # documentación canónica del proyecto
│   ├── 00_indice_maestro.md          # índice general: empezar por aquí
│   ├── alcance.md · requisitos.md · historias.md · backlog.md
│   ├── contrato-api.md · modelo-datos.md
│   ├── pruebas.md · calidad.md · seguridad.md
│   └── decisiones/
│       ├── ADR-001-estados-solicitud.md
│       └── ADR-002-regla-no-duplicacion.md
├── .gitignore                        # excluye .env, venv/ y node_modules/
└── README.md
```

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Flask 3 · SQLAlchemy · Marshmallow (validación) · Flask-JWT-Extended (autenticación) · Flask-Migrate/Alembic (migraciones) · flask-cors · Swagger UI + OpenAPI |
| Base de datos | SQLite en desarrollo (`Backend/instance/`); PostgreSQL configurable vía `DATABASE_URL` |
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind CSS |

## Puesta en marcha

Requisitos: Python 3 y Node.js 18 o superior.

```bash
# 1. Backend -> http://localhost:5000
cd Backend
python -m venv venv
source venv/bin/activate              # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask --app run.py db upgrade         # aplica las migraciones de migrations/
python seed.py                        # crea los 6 recursos de ejemplo
python run.py

# 2. Frontend -> http://localhost:3000
cd ../Frontend
npm install
npm run dev
```

**Configuración (opcional):** ambos servicios funcionan sin archivos de entorno, con valores de desarrollo por defecto.

- `Backend/.env`: `SECRET_KEY`, `JWT_SECRET_KEY` y `DATABASE_URL` (para PostgreSQL, descomentar `psycopg2-binary` en `requirements.txt`).
- `Frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000`.

Los archivos `.env` están excluidos por `.gitignore` y nunca deben subirse al repositorio.

> `python seed.py` **reemplaza todos los recursos existentes** con la lista fija de 6 (2 proyectores y 4 notebooks). Ejecutarlo solo en desarrollo.

## Usuarios de demostración

| Email | Rol | Contraseña |
|---|---|---|
| admin@horizonte.edu.ar | admin | Admin123! |
| biblioteca@horizonte.edu.ar | bibliotecaria | Biblioteca123! |
| docente1@horizonte.edu.ar | docente | Docente123! |
| docente2@horizonte.edu.ar | docente | Docente123! |

## API

- **Base URL:** `http://localhost:5000` · JSON · `Authorization: Bearer <token JWT>` (excepto login).
- **21 endpoints** en cinco grupos: `/api/auth`, `/api/users`, `/api/resources`, `/api/requests` y `/api/admin`.
- **Swagger UI:** `http://localhost:5000/api/docs/` (en *Authorize*, el token de `POST /api/auth/login`).
- **Especificación OpenAPI:** `GET /openapi.yaml`, con fuente en `Backend/app/docs/openapi.yaml`.
- **Documentación:** [`docs/contrato-api.md`](docs/contrato-api.md) (contrato de integración) · [`Backend/API_DOCUMENTATION.md`](Backend/API_DOCUMENTATION.md) (guía completa) · [`Backend/Biblioteca_Horizonte.postman_collection.json`](Backend/Biblioteca_Horizonte.postman_collection.json) (colección de Postman).

## Regla central y estados

La no duplicación se verifica en dos capas: en el servicio (`Backend/app/services/request_service.py`, al crear y al confirmar) y en la base de datos (índice único `uq_confirmed_request_slot` sobre recurso + fecha + turno + módulo). El duplicado responde `409 Conflict`.

| Estado | Significado |
|---|---|
| `PENDIENTE` | Solicitada; no garantiza disponibilidad |
| `CONFIRMADA` | Reserva efectiva; única para su cupo |
| `RECHAZADA` | Resuelta por la bibliotecaria |
| `CANCELADA` | Anulada por el docente o por la bibliotecaria |

### Roles

| Rol | Permisos |
|---|---|
| docente | Autenticarse, consultar recursos, crear solicitudes y ver o cancelar las propias |
| bibliotecaria | Ver todas las solicitudes, confirmar, rechazar o cancelarlas, verificar disponibilidad |
| admin | Administrar usuarios y recursos, reportes y auditoría; no gestiona solicitudes (recibe `403`) |

El detalle de permisos por endpoint está en [`Backend/README.md`](Backend/README.md); las decisiones de diseño, en [`docs/decisiones/ADR-001-estados-solicitud.md`](docs/decisiones/ADR-001-estados-solicitud.md) y [`docs/decisiones/ADR-002-regla-no-duplicacion.md`](docs/decisiones/ADR-002-regla-no-duplicacion.md).

## Documentación

La documentación vive en [`docs/`](docs/), con [`docs/00_indice_maestro.md`](docs/00_indice_maestro.md) como índice general:

| Documento | Contenido |
|---|---|
| [`alcance.md`](docs/alcance.md) | Alcance del MVP y fuera de alcance |
| [`requisitos.md`](docs/requisitos.md) | Requisitos funcionales, no funcionales y reglas de negocio |
| [`historias.md`](docs/historias.md) | Historias de usuario con criterios de aceptación |
| [`backlog.md`](docs/backlog.md) | Product Backlog priorizado |
| [`contrato-api.md`](docs/contrato-api.md) | Contrato de integración (21 endpoints) |
| [`modelo-datos.md`](docs/modelo-datos.md) | Modelo de datos y restricciones |
| [`pruebas.md`](docs/pruebas.md) | Plan de pruebas y casos CP-01…CP-18 |
| [`calidad.md`](docs/calidad.md) | Atributos de calidad e indicadores |
| [`seguridad.md`](docs/seguridad.md) | Riesgos, controles y verificaciones |

## Convenciones del repositorio

- **Commits:** `tipo(ámbito): descripción` — por ejemplo, `feat(crear-solicitud): valida recurso y módulo`.
- **Ramas:** `main` siempre integrada; trabajos en `feat/…`, `fix/…`, `docs/…` o `test/…`.
- **Integración:** al menos una revisión antes de fusionar a `main`.
- **Secretos:** nunca commitear `.env`, contraseñas ni tokens.
