# Alcance del producto

| Campo | Valor |
|---|---|
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-02 |
| **Versión** | 1.0 |
| **Fuente** | `01_Inicio/01_Ficha_del_proyecto.md` y `01_Inicio/04_Alcance_MVP_y_fuera_de_alcance.md` |

## 1. Problema y objetivo

La biblioteca escolar Horizonte presta **2 proyectores y 4 notebooks** a docentes. Hoy recibe los pedidos por mensajes y los anota en un cuaderno, y a veces dos personas creen tener reservado el mismo equipo.

**Objetivo del MVP:** recorrer de punta a punta el proceso principal —solicitud → revisión → confirmación o rechazo → consulta de estado— **sin producir reservas duplicadas**.

## 2. Alcance del MVP (versión propuesta)

### Funciones incluidas

| N.º | Función | Requisito | Historia |
|---|---|---|---|
| 1 | Identificar al docente que solicita (nombre y rol) | RF01 | HU-08 |
| 2 | Consultar los recursos disponibles (2 proyectores, 4 notebooks) | RF02 | HU-05 |
| 3 | Crear 1 solicitud con recurso, fecha y módulo horario | RF03 | HU-01 |
| 4 | Registrar la solicitud inicialmente como PENDIENTE | RF04 | HU-01 |
| 5 | Consultar solicitudes pendientes (vista de Lucía) | RF05 | HU-06 |
| 6 | Confirmar una solicitud | RF06 | HU-02 |
| 7 | Impedir 2 confirmaciones para mismo recurso, fecha y módulo | RF07 | HU-02 |
| 8 | Rechazar una solicitud | RF08 | HU-03 |
| 9 | Consultar el estado de la propia solicitud (docente) | RF09 | HU-04 |
| 10 | Consultar reservas confirmadas por recurso y fecha | RF10 | HU-07 |

### Funciones de soporte (ya implementadas en el backend)

| Función | Requisito | Endpoints |
|---|---|---|
| Autenticación con email, contraseña y token JWT; autorización por rol en el servidor | RF11 | `/api/auth` |
| Gestión de usuarios: alta, edición y baja lógica (admin) y consulta (admin, bibliotecaria) | RF12 | `/api/users` |
| Gestión de recursos: alta, edición y baja lógica | RF13 | `/api/resources` |

### Regla central (no negociable en el MVP)

> Solo puede existir **1 reserva CONFIRMADA** para la misma combinación **recurso + fecha + turno + módulo**. Una solicitud PENDIENTE **no** garantiza disponibilidad y nunca debe presentarse como confirmada.

- La validación se aplica **en el servidor**, en el momento de crear *y* de confirmar (no solo en la interfaz).
- Ante un intento de segunda confirmación, el sistema **rechaza la operación** y lo informa con un mensaje claro.

### Estados del MVP

```
PENDIENTE ──(Bibliotecaria confirma)──▶ CONFIRMADA
    │
    └──────(Bibliotecaria rechaza)────▶ RECHAZADA
```

Transiciones: `PENDIENTE → CONFIRMADA` y `PENDIENTE → RECHAZADA`, ambas solo por Lucía (o admin). `CONFIRMADA` y `RECHAZADA` son estados finales. El equipo decidió mantener además el estado **`CANCELADA`** como extensión documentada del modelo (ver ADR-001).

## 3. Fuera de alcance (por ahora)

| Item | Motivo | Destino |
|---|---|---|
| Recordatorios por correo | Pedido nuevo, sin análisis de valor/esfuerzo | Product Backlog como HU-12, evaluado como **cambio** (CR-001) |
| Catálogo de materias y asignación docente–materia–módulo | No aparece en la consigna ni en el código | Backlog futuro |
| CRUD de módulos horarios | Los turnos y módulos son un catálogo fijo (2 turnos × 3 módulos) | Decisión técnica, no hay CRUD |
| Rechazo con motivo escrito | El modelo no tiene campo de motivo | Candidato a CR |
| Cancelación por el docente desde la interfaz | Amplía transiciones y roles | Candidato a backlog futuro |
| Pagos y multas | No pertenecen al caso original | Fuera de alcance |
| Inventario de reparaciones | Fuera del caso original | Fuera de alcance |
| Reservas recurrentes y módulos parciales | Complejiza la regla de duplicados | Fuera de alcance |
| Notificaciones, app móvil, multi-sede | Sin relación con el problema central | Fuera de alcance |

## 4. Supuestos vigentes

- Los turnos y módulos son un catálogo fijo: `Mañana · 08:00–12:00` y `Tarde · 13:00–17:00`, con 3 módulos cada uno.
- Se reserva solo desde el día de hoy en adelante (sin anticipación máxima ni límite de reservas por docente, por ahora).
- La bibliotecaria (Lucía) opera; el administrador configura usuarios.
- En desarrollo se usa SQLite; PostgreSQL queda como alternativa de producción.

## 5. Criterio de aceptación del MVP (demo final mínima)

1. Un docente crea una solicitud válida → queda **PENDIENTE**.
2. Lucía la confirma → el docente consulta y ve **CONFIRMADA**.
3. Se intenta confirmar otra solicitud para el mismo recurso, fecha y módulo → **el sistema la rechaza**.
4. Lucía rechaza otra solicitud → el docente ve **RECHAZADA**.
5. Pendiente y confirmada **nunca** se muestran como equivalentes.
