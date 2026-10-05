# ADR-001: Estados de la solicitud y transiciones

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | ADR-001 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-04 |
| **Versión** | 1.2 – reestructurado con la plantilla de ADR adaptada (factores, opciones consideradas, validación, cumplimiento); sin cambios en la decisión |
| **Estado** | Aceptado |
| **Fuente** | `03_Diseno/02_Estados_y_reglas.md` |
| **Relacionados** | BH-09 · ADR-002 |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.2 | 2026-10-04 | Reestructuración con la plantilla de ADR adaptada; la decisión y su detalle técnico no cambian | Equipo |
| 1.1 | 2026-10-04 | 409 al confirmar, `review` solo `bibliotecaria` y solo sobre `PENDIENTE` + control documental | Equipo |
| 1.0 | 2026-10-02 | Ingreso al repo (commit `99d53dc`) | Equipo |

## Contexto

El caso de la cátedra define 3 estados para la reserva (pendiente, confirmada, rechazada) y el episodio de clase exige que **pendiente y confirmada nunca se presenten como equivalentes**. El equipo necesita un modelo de estados que:

- permita informar al docente el estado real de su solicitud,
- centralice quién puede ejecutar cada transición,
- y deje constancia de cada cambio.

Además, el equipo quería poder **anular** una solicitud sin rechazarla (por ejemplo, si el docente ya no necesita el equipo), lo que el modelo de 3 estados no contempla.

## Factores de decisión

- **Caso de la cátedra:** 3 estados —pendiente, confirmada, rechazada— que el docente debe distinguir sin ambigüedad.
- **Episodio de clase:** "pendiente" no puede presentarse como "confirmada" (prohibido el mensaje "Reserva realizada" para una solicitud pendiente).
- **Caso real no cubierto:** anular porque el docente dejó de necesitar el equipo no es lo mismo a que lo rechacen.
- **Trazabilidad y control:** cada transición debe quedar registrada con autor y fecha, y cada rol debe operar solo las suyas.

## Opciones consideradas

| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| A — Los 3 estados tal cual el caso | `PENDIENTE`, `CONFIRMADA`, `RECHAZADA`; "anular" se modela como rechazo con motivo | Coincide literalmente con el caso de la cátedra; menos transiciones y menos pruebas | Confunde al docente: ve "Rechazada" cuando en realidad anuló; se pierde la distinción anular / rechazar |
| **B — Extender a 4 estados con `CANCELADA`** **elegida** | Se agrega `CANCELADA` como estado final propio | Resuelve "ya no lo necesito" sin ensuciar `RECHAZADA`; estados inequívocos y auditables | Se aleja del modelo literal de la cátedra (la extensión queda documentada en este ADR y en BH-09); agrega transiciones a probar |
| C — Máquina con estados intermedios | Estados tipo `EN_REVISION` / `APROBADA` antes de confirmar | Escalable si el flujo crece | Contradice la exigencia de estados claros y simples; trabajo extra sin caso de uso que lo pida |

## Decisión

### 1. Estados

| Estado | Significado | ¿Es final? |
|---|---|---|
| `PENDIENTE` | Solicitud creada; **no garantiza** disponibilidad | No |
| `CONFIRMADA` | Lucía aceptó; reserva garantizada (máx. 1 por recurso+fecha+turno+módulo) | Sí |
| `RECHAZADA` | Lucía no aceptó; el docente quedó informado | Sí |
| `CANCELADA` | Solicitud anulada; el horario queda libre | Sí |

Se **mantiene `CANCELADA`** como extensión del modelo de la cátedra (opción B): permite anular sin rechazar y queda documentada en este ADR.

### 2. Máquina de estados

```
[*] --> PENDIENTE: POST /api/requests/ (docente)
PENDIENTE --> CONFIRMADA: PATCH /review (solo bibliotecaria)
PENDIENTE --> RECHAZADA:  PATCH /review (solo bibliotecaria)
PENDIENTE --> CANCELADA:  PATCH /review (bibliotecaria) o PATCH /cancel (dueño/bibliotecaria)
PENDIENTE --> CANCELADA:  auto-cancel al confirmar otra del mismo slot (RN-14)
CONFIRMADA --> CANCELADA: PATCH /cancel (dueño/bibliotecaria)
CONFIRMADA --> [*]
RECHAZADA  --> [*]
CANCELADA  --> [*]
```

> `review` solo opera sobre solicitudes `PENDIENTE` (otro estado → 400) y es exclusivo de la `bibliotecaria` (docente y admin → 403).

**Transiciones válidas:** solo las que salen de `PENDIENTE` más `CONFIRMADA → CANCELADA`. Una solicitud `RECHAZADA` o `CANCELADA` no vuelve a otro estado: se crea una solicitud nueva.

### 3. Matriz de transiciones × rol

| Transición | Docente | Bibliotecaria | Admin | ¿Implementada correctamente? |
|---|---|---|---|---|
| Crear solicitud → `PENDIENTE` | Sí (`POST /api/requests/`) | Sí | Sí | Siempre nace `PENDIENTE` |
| `PENDIENTE` → `CONFIRMADA` | No (403) | Sí (`PATCH /review`) | Sí | Re-verifica duplicados |
| `PENDIENTE` → `RECHAZADA` | No (403) | Sí | Sí | Parcial: no valida el estado actual (todavía acepta desde estados finales) |
| `PENDIENTE` → `CANCELADA` | Sí (`PATCH /cancel` — dueño) | Sí | Sí | Respeta dueño y estado |
| `CONFIRMADA` → `CANCELADA` | Sí (`PATCH /cancel` — dueño) | Sí | Sí | Libera el horario |
| `CONFIRMADA` → `RECHAZADA` | No (403) | **Permitido** | **Permitido** | No debería permitirse (queda como known issue) |
| Ver detalle de solicitud ajena | No (403) | Sí | No (403) | Dueño o bibliotecaria |

### 4. Mensajes que debe ver el docente por estado

| Estado | Etiqueta visible | Texto de apoyo (acordado) |
|---|---|---|
| PENDIENTE | **Pendiente** | "Tu solicitud fue enviada y está en revisión. **Pendiente no significa confirmada:** todavía no tenés el equipo garantizado." |
| CONFIRMADA | **Confirmada** | "Tu solicitud fue aprobada. El {fecha} {turno} {módulo} tenés reservado {recurso}." |
| RECHAZADA | **Rechazada** | "Tu solicitud fue rechazada. Podés solicitar otro horario o recurso disponible." |
| CANCELADA | **Cancelada** | "La solicitud fue anulada y ya no ocupa el horario." |

**Prohibido:** mensajes ambiguos tipo "Reserva realizada" para un estado pendiente (episodio de clase).

### 5. Comportamiento ante datos inválidos u operaciones no permitidas

| Situación | Respuesta HTTP |
|---|---|
| Campos faltantes / formato incorrecto | 422 + `fieldErrors` |
| Turno o módulo fuera del catálogo / módulo incoherente con el turno | 422 |
| Fecha pasada | 422 |
| Recurso inexistente o `available=false` | 409 |
| Duplicado al crear | 409 |
| Duplicado al confirmar | 409 (verificación en el servicio + índice único `uq_confirmed_request_slot`) |
| `review` sobre solicitud que no es `PENDIENTE` | 400 "Solo se pueden revisar solicitudes pendientes." |
| Token inválido o vencido | 401 |
| Rol insuficiente (docente o admin en `review`) | 403 |
| Excepción no controlada | 500 (sin volcar stack trace) |

## Consecuencias

- **Positivas:** el docente siempre ve un estado inequívoco; `CANCELADA` resuelve el caso "ya no lo necesito" sin ensuciar `RECHAZADA`; cada transición queda auditada con estado anterior y nuevo.
- **Negativas / pendientes:** `review_request` todavía no valida el estado actual, por lo que una solicitud final puede ser re-resuelta desde la API — es el punto a corregir para cerrar el *known issue* de transiciones.

## Validación

- **Casos de prueba previstos:** CP-03 y CP-04 (transiciones), CP-07, CP-09 y CP-18 (mensajes por estado) — **pendientes de ejecución** (Etapa 4).
- **Ya verificado en el código (2026-10-04):** la matriz de la sección 3 se revisó contra `request_service.py` y `requests.py`; los ítems marcados como incorrectos o a revisar en esa matriz son el listado de pendientes conocidos.
- **Correcciones verificadas en commits:** 409 al duplicar y 403 por rol en `review` (`ba345e7`, `3bd27b0`).

## Cumplimiento

| Exigencia | Origen | Estado |
|---|---|---|
| Estados pendiente / confirmada / rechazada | Caso de la cátedra | Cumplidos — más `CANCELADA`, extensión documentada en este ADR |
| Mensajes inequívocos (nada de "Reserva realizada" en pendiente) | Episodio de clase | Tabla de mensajes (sección 4) |
| Transiciones por rol y registro de cada cambio | BH-09, sección 7 | Parcial — ver matriz de la sección 3 |
| Formato del ADR: título, estado, contexto, decisión, consecuencias, alternativas | Consigna, sección 10.1 | Cumplido desde esta versión (v1.2) |

## Referencias normativas

- Consigna de la materia (Gómez Carlos) — sección 10.1: estructura del ADR.
- ISO/IEC/IEEE 42010:2011 — Arquitectura de sistemas: documentación de decisiones de diseño.
- Plantilla de ADR adaptada — https://arquitectura.guiasoftware.com (basada en MADR, https://adr.github.io).
