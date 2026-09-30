# Biblioteca Horizonte - Backend

API REST para gestión de recursos de biblioteca (proyectores, espacios, material bibliográfico) con sistema de solicitudes y administración.

## Stack

* **Flask 3** - Framework web
* **SQLAlchemy** - ORM
* **Marshmallow** - Validación y serialización
* **Flask-JWT-Extended** - Autenticación con JWT
* **Flask-Migrate** (Alembic) - Migraciones de base de datos
* **PostgreSQL** (desarrollo: SQLite)

## Estructura del Proyecto

```
biblioteca-horizonte/
├── app/
│   ├── __init__.py          # Factory de la aplicación
│   ├── config.py            # Configuración por entorno
│   ├── extensions.py        # Extensiones (db, ma, jwt, migrate)
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── user.py
│   │   ├── resource.py
│   │   ├── request.py
│   │   └── audit_log.py
│   ├── schemas/             # Schemas Marshmallow (DTOs)
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── resource.py
│   │   └── request.py
│   ├── routes/              # Blueprints (controladores)
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── resources.py
│   │   └── requests.py
│   ├── services/            # Lógica de negocio
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── resource_service.py
│   │   └── request_service.py
│   └── utils/               # Utilidades
│       ├── decorators.py    # @role_required
│       └── error_handlers.py
├── migrations/              # Migraciones Alembic
├── tests/
├── requirements.txt
├── .env.example
└── run.py

```

## Instalación

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear tablas (desarrollo)
flask db init
flask db migrate -m "initial"
flask db upgrade

# O simplemente con SQLite:
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"

# Ejecutar
python run.py

```

## Endpoints

### Autenticación

| Método | Ruta | Descripción | Permisos |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Autentica un usuario y genera token JWT | Público |
| GET | `/api/auth/me` | Obtiene el perfil del usuario autenticado | Autenticado |

### Usuarios

| Método | Ruta | Descripción | Permisos |
| --- | --- | --- | --- |
| GET | `/api/users/` | Listar usuarios con paginación (`page`, `limit`) y filtros (`role`, `status`, `search`) | Admin, Bibliotecaria |
| GET | `/api/users/<id>` | Obtener detalle de usuario por ID | Admin, Bibliotecaria |
| POST | `/api/users/` | Crear un nuevo usuario | Solo Admin |
| PUT | `/api/users/<id>` | Actualizar datos de un usuario | Solo Admin |
| DELETE | `/api/users/<id>` | Baja lógica de usuario (`status: INACTIVO`) | Solo Admin |

### Recursos

| Método | Ruta | Descripción | Permisos |
| --- | --- | --- | --- |
| GET | `/api/resources/` | Listar recursos con filtros opcionales (`category`, `available`) | Autenticado |
| GET | `/api/resources/<id>` | Obtener detalle de recurso por ID (slug) | Autenticado |
| POST | `/api/resources/` | Crear un nuevo recurso | Admin, Bibliotecaria |
| PUT | `/api/resources/<id>` | Actualizar datos de un recurso | Admin, Bibliotecaria |
| DELETE | `/api/resources/<id>` | Baja lógica de recurso (`available: false`) | Solo Admin |

### Solicitudes

| Método | Ruta | Descripción | Permisos |
| --- | --- | --- | --- |
| GET | `/api/requests/` | Listar solicitudes con filtros (`status`, `user_id`, `resource_id`) | Autenticado |
| GET | `/api/requests/<id>` | Obtener detalle de una solicitud por ID (`BH-XXXX`) | Autenticado |
| POST | `/api/requests/` | Crear una nueva solicitud de recurso | Autenticado |
| PATCH | `/api/requests/<id>/review` | Cambiar estado de solicitud (`CONFIRMADA`, `RECHAZADA`, `CANCELADA`) | Admin, Bibliotecaria |

### Administración

| Método | Ruta | Descripción | Permisos |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard` | Métricas del panel (recursos totales, usuarios activos, solicitudes del mes, top más solicitados) | Admin, Bibliotecaria |
| GET | `/api/admin/audit-logs` | Listado de los últimos 100 registros de auditoría | Solo Admin |

## Roles

* **docente** - Puede autenticarse, consultar recursos y crear solicitudes.
* **bibliotecaria** - Puede gestionar el catálogo de recursos, ver usuarios, revisar/aprobar solicitudes y consultar el dashboard administrativo.
* **admin** - Acceso completo al sistema (alta/baja de usuarios, eliminación lógica de recursos, ver logs de auditoría y métricas del sistema).

## Formato de Respuestas

### Éxito (Ejemplo: Solicitud Creada)

```json
{
  "id": "BH-0001",
  "resource_id": "proyector",
  "user_id": "1d8a301d-5b32-4d22-b5e1-873b2a265692",
  "teacher": "Juan Pérez",
  "date": "2026-04-10",
  "shift": "Mañana · 08:00–12:00",
  "module": "Módulo 1 · 08:00–09:20",
  "notes": "Se requiere cable HDMI adicional.",
  "status": "PENDIENTE",
  "created_at": "2026-03-30T17:00:00",
  "reviewed_by": null,
  "reviewed_at": null
}

```

### Éxito (Ejemplo: Login)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1d8a301d-5b32-4d22-b5e1-873b2a265692",
    "name": "María González",
    "email": "maria.gonzalez@horizonte.edu.ar",
    "role": "docente",
    "status": "ACTIVO",
    "dni": "35123456",
    "phone": "3571556677",
    "created_at": "2026-01-15T08:30:00",
    "updated_at": "2026-01-15T08:30:00"
  }
}

```

### Error por Validación de Datos (422 Unprocessable Entity)

```json
{
  "error": "Validation Error",
  "message": "Datos inválidos.",
  "fieldErrors": {
    "email": [
      "Not a valid email address."
    ],
    "role": [
      "Must be one of: docente, bibliotecaria, admin."
    ]
  }
}

```

### Error de Conflicto o Negocio (409 Conflict)

```json
{
  "error": "Conflict",
  "message": "El email ingresado ya pertenece a un usuario registrado."
}

```

### Error de Permisos o Autorización (403 Forbidden)

```json
{
  "error": "Forbidden",
  "message": "No tenés permiso para esta acción."
}

```