# Historias de usuario

| Campo | Valor |
|---|---|
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-02 |
| **Versión** | 1.0 |
| **Formato** | Como [tipo de usuario], quiero [necesidad] para [beneficio] |
| **Fuente** | `02_Requisitos_Backlog/02_Historias_de_usuario.md` |

---

## HU-01 · Crear una solicitud de equipo

**Como** docente, **quiero** solicitar un recurso para una fecha y un módulo horario, **para** saber si podré utilizarlo en mi clase.

- **Prioridad:** Alta · **Estimación:** 3 · **Requisitos:** RF03, RF04 · **Sprint sugerido:** Sprint 1
- **Depende de:** HU-08 (identificación), HU-05 (lista de recursos)

**Criterios de aceptación:**

1. Dado un docente identificado, cuando envía una solicitud válida (recurso existente, fecha válida y módulo válido), entonces la solicitud se crea con estado **PENDIENTE** y se le informa su identificador.
2. Dado un docente, cuando envía la solicitud sin completar campos obligatorios, entonces el sistema **no crea** la solicitud y muestra qué campo falta.
3. Dado un recurso inexistente, cuando se envía la solicitud, entonces el sistema la rechaza con mensaje "Recurso no encontrado".
4. Dada una fecha inválida (pasada o inexistente) o un módulo fuera del horario definido, cuando se envía la solicitud, entonces el sistema la rechaza sin persistir datos.
5. Dado que ya existe una solicitud pendiente, cuando el docente envía otra para el mismo recurso/fecha/módulo, entonces **se permite** crearla (solo la confirmación está limitada) y ambas quedan PENDIENTES.
6. El estado mostrado al confirmar el envío es siempre **"Pendiente"**, nunca "Reserva realizada" ni "Confirmada".

---

## HU-02 · Confirmar una solicitud

**Como** Lucía (bibliotecaria), **quiero** confirmar una solicitud pendiente, **para** que el docente sepa con certeza que tendrá el equipo.

- **Prioridad:** Alta · **Estimación:** 5 · **Requisitos:** RF06, RF07 · **Sprint sugerido:** Sprint 2
- **Depende de:** HU-01, HU-06

**Criterios de aceptación:**

1. Dada una solicitud PENDIENTE, cuando Lucía pulsa "Confirmar", entonces el estado pasa a **CONFIRMADA** y queda visible para el docente.
2. Dada una solicitud que ya está CONFIRMADA o RECHAZADA, cuando se intenta confirmar de nuevo, entonces el sistema **rechaza la operación** y muestra el motivo.
3. Dado que ya existe una reserva CONFIRMADA para el **mismo recurso, misma fecha y mismo módulo**, cuando Lucía intenta confirmar otra solicitud, entonces el sistema **impide la segunda confirmación** con el mensaje: *"Ya existe una reserva confirmada para este recurso en esa fecha y módulo."*
4. Dado un usuario sin rol Lucía, cuando intenta confirmar (interfaz o llamada directa al servicio), entonces la operación es **denegada** (RNF02).
5. Toda confirmación queda registrada con fecha, usuario y estado anterior (RNF06).
6. La validación de duplicados ocurre **en el servidor**, no solo en la interfaz.

---

## HU-03 · Rechazar una solicitud

**Como** Lucía (bibliotecaria), **quiero** rechazar una solicitud pendiente, **para** liberar al docente de una espera sin salida y dejar la decisión registrada.

- **Prioridad:** Alta · **Estimación:** 3 · **Requisitos:** RF08 · **Sprint sugerido:** Sprint 2
- **Depende de:** HU-01, HU-06

**Criterios de aceptación:**

1. Dada una solicitud PENDIENTE, cuando Lucía la rechaza, entonces su estado pasa a **RECHAZADA** (estado final).
2. Dada una solicitud CONFIRMADA, cuando se intenta rechazarla, entonces el sistema **no permite** la transición y lo informa.
3. Dado un usuario sin rol Lucía, cuando intenta rechazar, entonces la operación es **denegada**.
4. El docente, al consultar, ve la solicitud como **"Rechazada"** con texto inequívoco.
5. El rechazo queda registrado con fecha, usuario y estado anterior.

---

## HU-04 · Consultar el estado de mi solicitud

**Como** docente, **quiero** consultar el estado real de mi solicitud, **para** saber si puedo llevar a cabo mi clase con el equipo reservado.

- **Prioridad:** Alta · **Estimación:** 3 · **Requisitos:** RF09 · **Sprint sugerido:** Sprint 1 (creación) / Sprint 3 (consulta completa)
- **Depende de:** HU-01

**Criterios de aceptación:**

1. Dado un docente identificado, cuando consulta su solicitud, entonces ve una de estas etiquetas: **Pendiente**, **Confirmada** o **Rechazada**.
2. Dada una solicitud PENDIENTE, cuando el docente la consulta, entonces el mensaje indica explícitamente que **pendiente no significa confirmada** y que aún no hay disponibilidad garantizada.
3. Dada una solicitud de otro docente, cuando el usuario intenta consultarla por identificador, entonces el sistema **no muestra** los datos ajenos (RNF02).
4. Cuando el estado cambia, la consulta refleja el valor actualizado sin necesidad de recargar datos obsoletos.
5. El color/etiqueta de estado es consistente en todas las pantallas (RNF01).

---

## HU-05 · Consultar los recursos disponibles

**Como** docente, **quiero** ver los recursos que pueden reservarse y su disponibilidad, **para** elegir el equipo que necesito.

- **Prioridad:** Alta · **Estimación:** 2 · **Requisitos:** RF02 · **Sprint sugerido:** Sprint 1
- **Depende de:** —

**Criterios de aceptación:**

1. Cuando el docente abre la consulta, entonces el sistema muestra **2 proyectores y 4 notebooks** con su identificación.
2. Dada una fecha y un módulo seleccionados, cuando consulta, entonces el sistema indica si el recurso ya tiene una **reserva confirmada** en ese horario.
3. Un recurso con reserva confirmada sigue visible, pero marcado como no disponible para ese horario.
4. Si no hay recursos, se muestra un mensaje claro (caso improbable, verificable en datos de prueba).

---

## HU-06 · Consultar solicitudes pendientes (vista de Lucía)

**Como** Lucía (bibliotecaria), **quiero** ver todas las solicitudes pendientes con su contexto, **para** decidir qué confirmar y qué rechazar.

- **Prioridad:** Alta · **Estimación:** 3 · **Requisitos:** RF05 · **Sprint sugerido:** Sprint 2
- **Depende de:** HU-01

**Criterios de aceptación:**

1. Cuando Lucía abre la vista, entonces ve las solicitudes en estado **PENDIENTE** con docente, recurso, fecha y módulo.
2. Desde cada fila puede **confirmar** o **rechazar**.
3. Dado un usuario sin rol Lucía, cuando intenta acceder a la vista, entonces el acceso es **denegado**.
4. Cuando no hay pendientes, se muestra "No hay solicitudes pendientes".
5. Las solicitudes ya resueltas no aparecen en esta lista (se consultan en la vista de reservas/historial).

---

## Historias adicionales del backlog

Las historias HU-07 a HU-14 están definidas con sus criterios en [`backlog.md`](backlog.md) (14 ítems en total, mínimo exigido: 12).
