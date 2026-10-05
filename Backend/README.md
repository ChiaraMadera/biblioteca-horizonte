# Biblioteca Horizonte - Backend

API REST para gestión de recursos de biblioteca (proyectores, espacios, material bibliográfico) con sistema de solicitudes y administración.

## Stack

* **Flask 3** - Framework web
* **SQLAlchemy** - ORM
* **Marshmallow** - Validación y serialización
* **Flask-JWT-Extended** - Autenticación con JWT
* **Flask-Migrate** (Alembic) - Migraciones de base de datos
* **PostgreSQL** (desarrollo: SQLite)

## Características Implementadas

### Regla Central del Sistema
Solo puede existir 1 reserva CONFIRMADA para el mismo equipo, la misma fecha y el mismo módulo horario. **Una solicitud PENDIENTE todavía no garantiza disponibilidad.**

Esta regla se implementa en:
- `create_request()`: al crear, solo un estado `CONFIRMADA` bloquea el slot → varias solicitudes PENDIENTES pueden competir por el mismo cupo
- `get_availability()`: solo las CONFIRMADA marcan un slot como ocupado (las pendientes se informan como detalle, sin bloquear)
- `review_request()`: al confirmar, se re-verifica el conflicto contra otras CONFIRMADA
- Índice único en BD: `uq_confirmed_request_slot` sobre `(resource_id, date, shift, module)` WHERE `status = 'CONFIRMADA'`

Al confirmarse una solicitud el sistema además:
1. **Notifica al docente** (`send_notification` → registro `NOTIFICATION` en `AuditLog`)
2. **Cancela automáticamente** las demás solicitudes PENDIENTES del mismo recurso/fecha/turno/módulo (registro `AUTO_CANCEL_PENDING`)

### Separación de Roles por Responsabilidades

| **Rol** | **Permisos Principales** |
|---------|-------------------------|
| **docente** | Autenticarse, consultar recursos, crear solicitudes, consultar y cancelar las propias solicitudes |
| **bibliotecaria** | Ver **todas** las solicitudes, confirmar/rechazar/cancelarlas, verificar disponibilidad, consultar el dashboard |
| **admin** | **Solo administración:** panel de control, alta/baja de usuarios, alta de recursos, baja lógica de recursos, reportes de estado y logs de auditoría. **No gestiona solicitudes** (eso es del bibliotecario): `GET /requests/` le devuelve únicamente las suyas, `review`, el detalle ajeno y la cancelación ajena responden `403`. |

> Separación estricta: las tareas del bibliotecario (cola de pendientes, confirmación y
> rechazo) no están disponibles para el administrador, y las de administración no están
> disponibles para el bibliotecario (usuarios, bajas de recursos, reportes y auditoría).

### Endpoints Administrativos Nuevos

| **Método** | **Ruta** | **Descripción** | **Permisos** |
|------------|----------|----------------|------------|
| GET | `/api/admin/dashboard` | Métricas del panel (recursos totales, usuarios activos, solicitudes del mes, top más solicitados) | Admin, Bibliotecaria |
| GET | `/api/admin/reporte-usuarios` | Informe de usuarios por rol, recursos por estado y solicitudes por estado | **Admin solo** |
| GET | `/api/admin/audit-logs` | Listado de los últimos 100 registros de auditoría | **Admin solo** |
| POST | `/api/users/` | Crear un nuevo usuario | **Solo Admin** |
| PUT | `/api/users/<id>` | Actualizar datos de un usuario | **Solo Admin** |
| DELETE | `/api/users/<id>` | Baja lógica de usuario (`status: INACTIVO`) | **Solo Admin** |
| POST | `/api/resources/` | Crear un nuevo recurso | Admin, Bibliotecaria |
| PUT | `/api/resources/<id>` | Actualizar datos de un recurso | Admin, Bibliotecaria |
| DELETE | `/api/resources/<id>` | Baja lógica de recurso (`available: false`) | **Solo Admin** |

### Endpoints de Solicitudes (Regla Actualizada)

| **Método** | **Ruta** | **Descripción** | **Permisos** |
|------------|----------|----------------|------------|
| GET | `/api/requests/` | Listar solicitudes con filtros (`status`, `user_id`, `resource_id`) y paginación (`page`, `per_page`). **Solo la bibliotecaria ve el listado completo**; el docente y el administrador ven únicamente las suyas. | Autenticado |
| GET | `/api/requests/<id>` | Obtener detalle de una solicitud por ID (`BH-XXXX`). **Validación de autorización:** solo el dueño o la bibliotecaria pueden verla. | Autenticado |
| GET | `/api/requests/availability` | Disponibilidad de los módulos para un recurso/fecha. El campo `reason`/`request_id` de los slots ocupados solo se incluye para la bibliotecaria. | Autenticado |
| POST | `/api/requests/` | Crear una solicitud. Valida usuario activo, recurso disponible, fecha hábil, feriados, anticipación máxima de 60 días, turno/módulo, horario y conflictos de disponibilidad (solo CONFIRMADA bloquea). | Docente |
| PATCH | `/api/requests/<id>/review` | Cambiar estado de una solicitud (`CONFIRMADA`, `RECHAZADA`, `CANCELADA`). Solo revisa solicitudes PENDIENTES y re-verifica la disponibilidad al confirmar. Al confirmar notifica al docente y cancela las demás PENDIENTES del mismo cupo. | **Solo Bibliotecaria** (`403` para admin y docente) |
| PATCH | `/api/requests/<id>/cancel` | Cancelar una solicitud. El docente solo puede cancelar las propias; la bibliotecaria puede cancelar cualquiera. No permite cancelar solicitudes cuyo horario ya pasó. | Dueño o Bibliotecaria |

### Formato de paginación (contrato único)

Los listados `/api/requests/`, `/api/users/` y `/api/resources/` responden **siempre** la misma estructura:

```json
{
  "items": [],
  "page": 1,
  "per_page": 10,
  "total": 0,
  "pages": 0
}
```

Parámetros: `page` y `per_page` (requests), `page` y `limit` (users y resources).

### Endpoints de Recursos

| **Método** | **Ruta** | **Descripción** | **Permisos** |
|------------|----------|----------------|------------|
| GET | `/api/resources/` | Listar recursos con filtros opcionales (`category`, `available`) y paginación (`page`, `limit`) | Autenticado |
| GET | `/api/resources/<id>` | Obtener detalle de recurso por ID (slug) | Autenticado |
| POST | `/api/resources/` | Crear un nuevo recurso | Admin, Bibliotecaria |
| PUT | `/api/resources/<id>` | Actualizar datos de un recurso | Admin, Bibliotecaria |
| DELETE | `/api/resources/<id>` | Baja lógica de recurso (`available: false`) | **Solo Admin** |

### Usuarios Predefinidos

Los siguientes usuarios vienen definidos por defecto en el sistema (pueden ser modificados con `reset_passwords.py`):

| **Email** | **Rol** | **Contraseña** |
|-----------|---------|----------------|
| admin@horizonte.edu.ar | admin | Admin123! |
| biblioteca@horizonte.edu.ar | bibliotecaria | Biblioteca123! |
| docente1@horizonte.edu.ar | docente | Docente123! |
| docente2@horizonte.edu.ar | docente | Docente123! |

### Recursos Iniciales

6 recursos por defecto (insertados con `seed.py`):

* 2 proyectores: Epson EB-X06, BenQ MW550
* 4 notebooks: Lenovo ThinkPad E14, HP 255 G8, Dell Latitude 3520, Acer Aspire 5

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

# Ejecutar migración de recursos (2 proyectores y 4 notebooks)
# ADVERTENCIA: Este script elimina todos los recursos existentes y los reemplaza
python seed.py

# Actualizar referencias en solicitudes existentes (si las hay)
sqlite3 instance/biblioteca_horizonte.db "UPDATE requests SET resource_id = 'proyector-01' WHERE resource_id = 'res-proj-01';"
sqlite3 instance/biblioteca_horizonte.db "UPDATE requests SET resource_id = 'proyector-02' WHERE resource_id = 'res-esp-01';"
```

## Documentación API (Swagger)

* **Swagger UI:** `http://127.0.0.1:5000/api/docs/` (botón Authorize con el JWT de `/api/auth/login`)
* **Spec:** `GET /openapi.yaml` — fuente única en `app/docs/openapi.yaml`
* **Guía completa:** [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
* **Postman:** [`Biblioteca_Horizonte.postman_collection.json`](Biblioteca_Horizonte.postman_collection.json)

## Notificaciones

`request_service.send_notification(target_user_id, subject, message, reference)` es el punto único de notificación al docente. Hoy deja una traza en `AuditLog` con acción `NOTIFICATION`; ahí se debe conectar el envío real de correo o mensajería.

## Endpoints completos

La implementación de todos los endpoints vive en `app/routes/` (`auth.py`, `users.py`, `resources.py`, `requests.py`, `admin.py`).

## Roles

* **docente** - Puede autenticarse, consultar recursos y crear solicitudes.
* **bibliotecaria** - Puede gestionar el catálogo de recursos, ver usuarios, revisar/aprobar solicitudes y consultar el dashboard administrativo.
* **admin** - Acceso completo al sistema (alta/baja de usuarios, eliminación lógica de recursos, ver logs de auditoría y métricas del sistema).