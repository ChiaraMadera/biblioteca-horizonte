# Requisitos funcionales y no funcionales

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-14 |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-04 |
| **Versión** | 1.2 — reglas RN-01…RN-14; sincronizado con los commits `ba345e7`/`3bd27b0` |
| **Fuente** | `02_Requisitos_Backlog/01_Requisitos.md` |
| **Relacionados** | BH-05 (fuente local) · BH-16 · BH-17 |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.2 | 2026-10-04 | RN-14 y estados de brechas + control documental | Equipo |
| 1.1 | 2026-10-02 | Ingreso al repo: RN-01…RN-13 (commit 99d53dc) | Equipo |

## 1. Requisitos funcionales

| ID | Requisito | Prioridad | Verificación |
|---|---|---|---|
| RF01 | El sistema debe permitir registrar o identificar al docente que solicita un recurso (nombre y rol) | Alta | CP-17 |
| RF02 | El sistema debe consultar y mostrar los recursos que pueden reservarse (2 proyectores, 4 notebooks) | Alta | CP-05 |
| RF03 | El sistema debe crear una solicitud indicando recurso, fecha y módulo horario | Alta | CP-01 |
| RF04 | El sistema debe registrar toda solicitud nueva con estado **PENDIENTE** | Alta | CP-01 |
| RF05 | El sistema debe permitir a Lucía consultar las solicitudes pendientes | Alta | CP-06 |
| RF06 | El sistema debe permitir a Lucía confirmar una solicitud pendiente | Alta | CP-03 |
| RF07 | El sistema debe **impedir** que existan 2 confirmaciones para el mismo recurso, fecha y módulo | Alta (regla central) | CP-02 |
| RF08 | El sistema debe permitir a Lucía rechazar una solicitud pendiente | Alta | CP-04 |
| RF09 | El sistema debe mostrar al docente el estado real de su solicitud (pendiente / confirmada / rechazada) | Alta | CP-07 |
| RF10 | El sistema debe consultar las reservas confirmadas por recurso y fecha | Media | CP-08 |

### Requisitos funcionales de soporte (del código construido)

| ID | Requisito | Endpoints |
|---|---|---|
| RF11 | Autenticación con email y contraseña (hash) y token JWT; autorización por rol en el servidor | `/api/auth` |
| RF12 | Gestión de usuarios: alta, edición y baja lógica con roles; consulta para admin y bibliotecaria | `/api/users` |
| RF13 | Gestión de recursos: alta, edición y baja lógica (available=false); consulta para el docente | `/api/resources` |

## 2. Requisitos no funcionales (7, todos verificables)

| ID | Categoría | Requisito | Cómo se verifica |
|---|---|---|---|
| RNF01 | Usabilidad | Cada solicitud se muestra con **etiqueta y texto inequívoco**; una solicitud pendiente nunca se presenta como confirmada (sin mensajes ambiguos como "Reserva realizada") | Lista de observación; CP-09 |
| RNF02 | Seguridad | Solo el rol **bibliotecaria** puede confirmar o rechazar (el `admin` no gestiona solicitudes); un docente **ni el admin** pueden realizar esas operaciones ni por interfaz ni por llamada directa al servicio | Pruebas de autorización; CP-10, CP-11 (401/403) |
| RNF03 | Confiabilidad | Ante datos inválidos (fecha pasada, módulo fuera de rango, recurso inexistente, campos vacíos) el sistema **rechaza la operación, no persiste ningún registro** y responde con un mensaje de error comprensible; ningún caso negativo produce error no controlado | Suite de casos negativos; CP-12 a CP-14 (0 errores 500) |
| RNF04 | Rendimiento | Las consultas de solicitudes y reservas responden en **menos de 2 segundos** con 100 solicitudes registradas | Medición de tiempo; CP-15 |
| RNF05 | Mantenibilidad | La regla de no duplicación está implementada en **un único punto identificado** (capa de servicio), con pruebas que la cubren; cambiar un mensaje o una etiqueta no requiere modificar esa lógica | Revisión de código; ver ADR-002 |
| RNF06 | Trazabilidad | Cada alta y cada cambio de estado registra **fecha, usuario que lo ejecutó, estado anterior y estado nuevo** | Consulta del historial; CP-16 |
| RNF07 | Portabilidad | El proyecto se ejecuta en otra computadora siguiendo el `README.md`, en **10 minutos o menos** y sin pasos manuales no documentados | Prueba de instalación por un integrante que no desarrolló esa parte |

## 3. Reglas de negocio (RN-01 … RN-14)

Set único de reglas para todo el proyecto (docx, docs/ y carpetas locales). La columna **RB** conserva la correspondencia con las 7 reglas duras del caso de la cátedra (RB01–RB07); **RN ⊃ RB**.

| ID | Regla | Origen | RB / Req. | Estado en el código |
|---|---|---|---|---|
| RN-01 | Una solicitud es de 1 recurso, para 1 fecha y 1 módulo horario de la escuela (con su turno) | Caso | RB04 | ✅ `CreateRequestSchema` (OneOf) + `create_request` |
| RN-02 | Solo puede existir 1 reserva CONFIRMADA para el mismo recurso, fecha, turno y módulo | Caso | RB01 (RF07) | ✅ validado al crear y al confirmar (B-01) + **índice único en BD** `uq_confirmed_request_slot` con `IntegrityError` → 409 (B-02 cerrada) |
| RN-03 | Una solicitud pendiente no garantiza disponibilidad; pueden coexistir varias pendientes para el mismo horario | Caso | RB02 (RF04) | ✅ default `PENDIENTE`; `GET /availability` marca cupo ocupado solo con `CONFIRMADA` |
| RN-04 | Solo la bibliotecaria confirma o rechaza (el administrador no gestiona solicitudes). Un rechazo exige un motivo | Propuesta | RB03 | ⚠ rol ✅ (`@role_required("bibliotecaria")` → 403 para docente y admin) · motivo ❌ sin campo en el modelo → fuera de alcance (§2.3) |
| RN-05 | Se reserva por módulos completos y predefinidos; no hay intervalos superpuestos | Caso | RB04 | ✅ catálogo fijo de turnos/módulos (D-02) |
| RN-06 | No se puede solicitar una reserva para una fecha pasada | Propuesta | RB07 | ✅ schema (422) y servicio (409) — B-04 cerrada |
| RN-07 | El docente solo puede elegir materias que tiene asignadas | Propuesta | — | — fuera de alcance de la v1 (sin entidades de materia/asignación) |
| RN-08 | Solo usuarios identificados y activos pueden operar el sistema | Caso | — | ✅ JWT con expiración + control de `status=ACTIVO` en el login |
| RN-09 | Un recurso dado de baja no se ofrece ni puede solicitarse; su historial se conserva | Propuesta | RB04 | ✅ `available=false` → 409 en `create_request` (baja lógica, D-07) |
| RN-10 | El docente puede cancelar solo sus solicitudes pendientes o confirmadas (la bibliotecaria, cualquiera) | Propuesta | — | ✅ `PATCH /requests/<id>/cancel` valida dueño + estado + que el horario no haya pasado |
| RN-11 | La pantalla debe distinguir los estados y nunca mostrar "Reserva realizada" para una solicitud pendiente | Caso | RNF01 | ✅ backend (enum + mensajes) y `Frontend/` con etiquetas por estado (B-15 cerrada) |
| RN-12 | Toda alta y todo cambio de estado queda registrado con fecha, usuario y estado anterior (auditoría) | Nuevo en v0.2 | RB05 (RNF06) | ✅ `audit_logs` con `old_status`/`new_status` en `CHANGE_STATUS`, `CANCEL_REQUEST`, `AUTO_CANCEL_PENDING` y `NOTIFICATION` (B-09 cerrada) |
| RN-13 | El turno elegido debe corresponder al módulo elegido (módulo de la mañana con turno Mañana) | Nuevo en v0.2 | RB06 | ✅ `validate_shift_module_consistency` en `CreateRequestSchema` (B-04 cerrada) |
| RN-14 | Al confirmarse una solicitud, las demás pendientes del mismo recurso+fecha+turno+módulo se auto-cancelan y el docente recibe una notificación | Nuevo en v1.2 | — | ✅ `review_request` → `AUTO_CANCEL_PENDING` + `NOTIFICATION` en `audit_logs` (commit `3bd27b0`) |

**Correspondencia RB → RN:** RB01→RN-02 · RB02→RN-03 · RB03→RN-04 · RB04→RN-01/RN-05/RN-09 · RB05→RN-12 · RB06→RN-13 · RB07→RN-06.

> Las 7 reglas del caso (RB01–RB07) están todas cubiertas por RN. RN-04 (motivo de rechazo) y RN-07 (materias) tienen partes **fuera de alcance de la v1** — ver `alcance.md` §3. RN-10 quedó **completa** en v1.2 (la cancelación valida dueño, estado y fecha).

## 4. Trazabilidad requisito → historia → prueba

| Requisito | Historia | Caso de prueba |
|---|---|---|
| RF01 | HU-08 | CP-17 |
| RF02 | HU-05 | CP-05 |
| RF03, RF04 | HU-01 | CP-01, CP-12 |
| RF05 | HU-06 | CP-06 |
| RF06, RF07 | HU-02 | CP-02, CP-03 |
| RF08 | HU-03 | CP-04 |
| RF09 | HU-04 | CP-07, CP-09 |
| RF10 | HU-07 | CP-08 |

## Referencias normativas

- ISO/IEC/IEEE 29148:2018 – Ingeniería de requisitos para sistemas y software.
- Schwaber & Sutherland, *Scrum Guide* (2020) – artefactos: Product Backlog e historias de usuario.
- ISO/IEC/IEEE 12207:2017 – Procesos del ciclo de vida de software.
