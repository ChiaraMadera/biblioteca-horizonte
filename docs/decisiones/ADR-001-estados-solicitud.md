# ADR-001: Estados de la solicitud y transiciones

| Campo | Valor |
|---|---|
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-02 |
| **Versión** | 1.0 |
| **Estado** | Aceptado |
| **Fuente** | `03_Diseno/02_Estados_y_reglas.md` |

## Contexto

El caso de la cátedra define 3 estados para la reserva (pendiente, confirmada, rechazada) y el episodio de clase exige que **pendiente y confirmada nunca se presenten como equivalentes**. El equipo necesita un modelo de estados que:

- permita informar al docente el estado real de su solicitud,
- centralice quién puede ejecutar cada transición,
- y deje constancia de cada cambio.

Además, el equipo quería poder **anular** una solicitud sin rechazarla (por ejemplo, si el docente ya no necesita el equipo), lo que el modelo de 3 estados no contempla.

## Decisión

### 1. Estados

| Estado | Significado | ¿Es final? |
|---|---|---|
| `PENDIENTE` | Solicitud creada; **no garantiza** disponibilidad | No |
| `CONFIRMADA` | Lucía aceptó; reserva garantizada (máx. 1 por recurso+fecha+turno+módulo) | Sí |
| `RECHAZADA` | Lucía no aceptó; el docente quedó informado | Sí |
| `CANCELADA` | Solicitud anulada; el horario queda libre | Sí |

Se **mantiene `CANCELADA`** como extensión del modelo de la cátedra (decisión del equipo): permite anular sin rechazar y queda documentada en este ADR.

### 2. Máquina de estados

```
[*] --> PENDIENTE: POST /api/requests/ (docente)
PENDIENTE --> CONFIRMADA: PATCH /review (bibliotecaria/admin)
PENDIENTE --> RECHAZADA:  PATCH /review (bibliotecaria/admin)
PENDIENTE --> CANCELADA:  PATCH /review (biblio/admin) o PATCH /cancel (docente dueño)
CONFIRMADA --> CANCELADA: PATCH /review (biblio/admin) o PATCH /cancel (docente dueño)
CONFIRMADA --> [*]
RECHAZADA  --> [*]
CANCELADA  --> [*]
```

**Transiciones válidas:** solo las que salen de `PENDIENTE` más `CONFIRMADA → CANCELADA`. Una solicitud `RECHAZADA` o `CANCELADA` no vuelve a otro estado: se crea una solicitud nueva.

### 3. Matriz de transiciones × rol

| Transición | Docente | Bibliotecaria | Admin | ¿Implementada correctamente? |
|---|---|---|---|---|
| Crear solicitud → `PENDIENTE` | ✅ `POST /api/requests/` | ✅ | ✅ | ✅ siempre nace `PENDIENTE` |
| `PENDIENTE` → `CONFIRMADA` | ❌ 403 | ✅ `PATCH /review` | ✅ | ✅ re-verifica duplicados |
| `PENDIENTE` → `RECHAZADA` | ❌ 403 | ✅ | ✅ | ⚠ no valida el estado actual (todavía acepta desde estados finales) |
| `PENDIENTE` → `CANCELADA` | ✅ `PATCH /cancel` (dueño) | ✅ | ✅ | ✅ respeta dueño y estado |
| `CONFIRMADA` → `CANCELADA` | ✅ `PATCH /cancel` (dueño) | ✅ | ✅ | ✅ libera el horario |
| `CONFIRMADA` → `RECHAZADA` | ❌ 403 | ⚠ **permitido** | ⚠ **permitido** | ❌ debería rechazarse (queda como known issue) |
| Ver detalle de solicitud ajena | ❌ 403 | ✅ | ✅ | ✅ dueño o admin/bibliotecaria |

### 4. Mensajes que debe ver el docente por estado

| Estado | Etiqueta visible | Texto de apoyo (acordado) |
|---|---|---|
| PENDIENTE | 🟡 **Pendiente** | "Tu solicitud fue enviada y está en revisión. **Pendiente no significa confirmada:** todavía no tenés el equipo garantizado." |
| CONFIRMADA | 🟢 **Confirmada** | "Tu solicitud fue aprobada. El {fecha} {turno} {módulo} tenés reservado {recurso}." |
| RECHAZADA | 🔴 **Rechazada** | "Tu solicitud fue rechazada. Podés solicitar otro horario o recurso disponible." |
| CANCELADA | ⚪ **Cancelada** | "La solicitud fue anulada y ya no ocupa el horario." |

**Prohibido:** mensajes ambiguos tipo "Reserva realizada" para un estado pendiente (episodio de clase).

### 5. Comportamiento ante datos inválidos u operaciones no permitidas

| Situación | Respuesta HTTP |
|---|---|
| Campos faltantes / formato incorrecto | 422 + `fieldErrors` |
| Turno o módulo fuera del catálogo / módulo incoherente con el turno | 422 |
| Fecha pasada | 422 |
| Recurso inexistente o `available=false` | 409 |
| Duplicado al crear | 409 |
| Duplicado al confirmar | ⚠ 400 hoy; debería ser 409 (known issue, ver contrato §6) |
| Token inválido o vencido | 401 |
| Rol insuficiente | 403 |
| Excepción no controlada | 500 (sin volcar stack trace) |

## Consecuencias

- **Positivas:** el docente siempre ve un estado inequívoco; `CANCELADA` resuelve el caso "ya no lo necesito" sin ensuciar `RECHAZADA`; cada transición queda auditada con estado anterior y nuevo.
- **Negativas / pendientes:** `review_request` todavía no valida el estado actual, por lo que una solicitud final puede ser re-resuelta desde la API — es el punto a corregir para cerrar el conocido *known issue* de transiciones.
- **Impacto en pruebas:** CP-07, CP-09, CP-18 verifican los mensajes; CP-03, CP-04 y CP-18 las transiciones.
