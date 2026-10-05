# ADR-002: Regla de no duplicación de reservas confirmadas

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | ADR-002 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-04 |
| **Versión** | 1.3 – reestructurado con la plantilla de ADR adaptada (factores, opciones consideradas, validación, cumplimiento); sin cambios en la decisión |
| **Estado** | Aceptado (implementación verificada en ambas capas) |
| **Fuente** | `03_Diseno/05_Decisiones_tecnicas.md`, sección 3 y `03_Diseno/03_Modelo_de_datos.md`, sección 3 |
| **Relacionados** | BH-10 · BH-12 · ADR-001 |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.3 | 2026-10-04 | Reestructuración con la plantilla de ADR adaptada; la decisión y su detalle técnico no cambian | Equipo |
| 1.2 | 2026-10-04 | Capa 2 completada: índice único parcial `uq_confirmed_request_slot` + `IntegrityError` → 409 (B-02 cerrada) | Equipo |
| 1.1 | 2026-10-02 | `review_request` re-verifica conflictos al confirmar (capa 1 completa); sigue pendiente el índice único (capa 2) | Equipo |
| 1.0 | 2026-10-01 | Decisión original: defensa en profundidad; capa de servicio completa, capa de datos pendiente | Equipo |

## Contexto

Es la regla central del producto (RF07): **solo puede existir 1 solicitud `CONFIRMADA` para la misma combinación recurso + fecha + turno + módulo**. El problema original es que dos personas creen tener reservado el mismo equipo.

En la primera revisión del código se detectó que la verificación de conflictos existía **solo al crear** la solicitud: una bibliotecaria podía confirmar una segunda solicitud para un horario ya ocupado y el sistema respondía 200. También faltaba cualquier barrera a nivel de base de datos.

## Factores de decisión

- **RF07:** ninguna combinación recurso + fecha + turno + módulo puede quedar con dos confirmaciones.
- **RNF05:** la regla debe vivir en un **único punto** (una sola función decide si se puede confirmar).
- **Fallo detectado en revisión:** verificar solo al crear dejaba pasar la segunda confirmación (200 en lugar de 409).
- **Respaldo ante errores de código:** una consulta directa o un error de lógica no debería poder duplicar.

## Opciones consideradas

| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| A — Solo verificar al crear | La comprobación existente, sin cambios | Ya estaba implementada; cero esfuerzo | No cubre el momento de confirmar: el fallo detectado en revisión sigue abierto |
| B — Verificar en el servicio al crear y al confirmar | Validación en `request_service.py` en ambos caminos | Un único punto (RNF05), mensaje de error traducible y fácil de testear | No protege ante escrituras directas a la BD ni ante condiciones de carrera |
| C — Índice único solo en la base de datos | Constraint a nivel de datos | Respaldo fuerte ante cualquier vía de escritura | Mensaje de error poco amigable; no valida además que el recurso exista o esté disponible |
| **D — Defensa en profundidad: servicio + índice único** **elegida** | Capa 1 (servicio) y capa 2 (índice parcial en la BD) | RF07 garantizada en los dos caminos normales **y** respaldada por la BD; error 409 con mensaje claro | Hay que mantener sincronizados el servicio y la migración |

## Decisión: defensa en profundidad en dos capas

### Capa 1 — servicio (obligatoria)

La validación vive en `app/services/request_service.py`, el **único punto** que decide si una solicitud puede confirmarse:

| Función | Qué verifica | Estado |
|---|---|---|
| `create_request` | Filtra `status="CONFIRMADA"` por `resource_id + date + shift + module` → error 409 si hay conflicto | Implementado |
| `review_request` | Antes de pasar a `CONFIRMADA`, re-verifica el mismo filtro sobre las **otras** solicitudes (`Request.id != actual`) → error si hay conflicto | Implementado |

Al crear también se verifica que el recurso exista y esté `available=true` (409).

### Capa 2 — base de datos (respaldo) — Implementada

Índice único parcial sobre `(resource_id, date, shift, module)` **para `status='CONFIRMADA'`**: `uq_confirmed_request_slot`, creado con Alembic en `migrations/versions/2ccd2ab74c38_initial.py` (funciona en SQLite y PostgreSQL). Un `IntegrityError` durante el commit se revuelve en **409**, de modo que ni un error de código ni una consulta directa a la BD permitan el duplicado.

> **Estado actual:** ambas capas implementadas — la regla central (RF07/RN-02) está garantizada en el servicio **y** respaldada por la BD (B-02 cerrada).

## Consecuencias

- **Positivas:** RF07 queda garantizada al crear *y* al confirmar, con doble capa (servicio + índice único); la lógica está en un solo archivo, fácil de probar; el mensaje de error es único y traducible por el frontend.
- **Negativas:** el índice solo cubre el hueco de concurrencia de confirmaciones; el resto de reglas sigue sin constraint en la BD. El índice debe mantenerse si cambia el catálogo de turnos/módulos.
- **Si cambia la regla** (p. ej. permitir dos confirmaciones para equipos distintos), se modifica `request_service.py`, la migración correspondiente y este ADR.

## Validación

- **Caso de prueba previsto:** CP-02 (segunda confirmación rechazada con 409) — **pendiente de ejecución** (Etapa 4), junto con su regresión posterior a cualquier corrección.
- **Ya verificado en el código (2026-10-04):** ambas capas presentes — `create_request` y `review_request` filtran por slot confirmado, y existe la migración con `uq_confirmed_request_slot`.
- Es condición de aprobación de la cátedra que esta regla esté **implementada y probada**: la implementación está; la prueba es el CP-02 pendiente.

## Cumplimiento

| Exigencia | Origen | Estado |
|---|---|---|
| Impedir 2 confirmaciones para el mismo slot | RF07 · RB01 | Implementada (ambas capas) |
| La regla en un único punto | RNF05 | `request_service.py` |
| Regla implementada **y probada** | Condición de aprobación de la cátedra | Parcial: implementada; falta ejecutar CP-02 |
| Formato del ADR: título, estado, contexto, decisión, consecuencias, alternativas | Consigna, sección 10.1 | Cumplido desde esta versión (v1.3) |

## Referencias normativas

- Consigna de la materia (Gómez Carlos) — sección 10.1: estructura del ADR.
- ISO/IEC/IEEE 42010:2011 — Arquitectura de sistemas: documentación de decisiones de diseño.
- Plantilla de ADR adaptada — https://arquitectura.guiasoftware.com (basada en MADR, https://adr.github.io).
