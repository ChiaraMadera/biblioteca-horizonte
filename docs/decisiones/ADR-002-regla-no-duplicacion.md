# ADR-002: Regla de no duplicación de reservas confirmadas

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | ADR-002 |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-04 |
| **Versión** | 1.2 |
| **Estado** | Aceptado (implementación parcial) |
| **Fuente** | `03_Diseno/05_Decisiones_tecnicas.md` §3 y `03_Diseno/03_Modelo_de_datos.md` §3 |
| **Relacionados** | BH-10 · BH-12 · ADR-001 |

## Contexto

Es la regla central del producto (RF07): **solo puede existir 1 solicitud `CONFIRMADA` para la misma combinación recurso + fecha + turno + módulo**. El problema original es que dos personas creen tener reservado el mismo equipo.

En la primera revisión del código se detectó que la verificación de conflictos existía **solo al crear** la solicitud: una bibliotecaria podía confirmar una segunda solicitud para un horario ya ocupado y el sistema respondía 200. También faltaba cualquier barrera a nivel de base de datos.

**Requisitos asociados:** RF07 (impedir 2 confirmaciones) · RB01 · RNF05 (la regla vive en un único punto).

## Decisión: defensa en profundidad en dos capas

### Capa 1 — servicio (obligatoria)

La validación vive en `app/services/request_service.py`, el **único punto** que decide si una solicitud puede confirmarse:

| Función | Qué verifica | Estado |
|---|---|---|
| `create_request` | Filtra `status="CONFIRMADA"` por `resource_id + date + shift + module` → error 409 si hay conflicto | ✅ Implementado |
| `review_request` | Antes de pasar a `CONFIRMADA`, re-verifica el mismo filtro sobre las **otras** solicitudes (`Request.id != actual`) → error si hay conflicto | ✅ Implementado |

Al crear también se verifica que el recurso exista y esté `available=true` (409).

### Capa 2 — base de datos (respaldo) — ✅ implementada

Índice único parcial sobre `(resource_id, date, shift, module)` **para `status='CONFIRMADA'`**: `uq_confirmed_request_slot`, creado con Alembic en `migrations/versions/2ccd2ab74c38_initial.py` (funciona en SQLite y PostgreSQL). Un `IntegrityError` durante el commit se revuelve en **409**, de modo que ni un error de código ni una consulta directa a la BD permitan el duplicado.

> **Estado actual:** ambas capas implementadas — la regla central (RF07/RN-02) está garantizada en el servicio **y** respaldada por la BD (B-02 cerrada).

## Consecuencias

- **Positivas:** RF07 queda garantizada al crear *y* al confirmar, con doble capa (servicio + índice único); la lógica está en un solo archivo, fácil de probar (CP-02); el mensaje de error es único y traducible por el frontend.
- **Negativas:** el índice solo cubre el hueco de concurrencia de confirmaciones; el resto de reglas sigue sin constraint en la BD. El índice debe mantenerse si cambia el catálogo de turnos/módulos.
- **Pruebas:** CP-02 (segunda confirmación rechazada) y la regresión posterior a cualquier corrección. Es condición de aprobación de la cátedra que esta regla esté **implementada y probada**.
- **Si cambia la regla** (p. ej. permitir dos confirmaciones para equipos distintos), se modifica `request_service.py`, la migración correspondiente y este ADR.

## Historial

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-10-01 | 1.0 | Decisión original: defensa en profundidad; capa de servicio completa, capa de datos pendiente |
| 2026-10-02 | 1.1 | `review_request` re-verifica conflictos al confirmar (capa 1 completa); sigue pendiente el índice único (capa 2) |
| 2026-10-04 | 1.2 | Capa 2 completada: índice único parcial `uq_confirmed_request_slot` + `IntegrityError` → 409 (B-02 cerrada) |
