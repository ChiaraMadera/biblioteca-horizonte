# ADR-002: Regla de no duplicación de reservas confirmadas

| Campo | Valor |
|---|---|
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-02 |
| **Versión** | 1.1 |
| **Estado** | Aceptado (implementación parcial) |
| **Fuente** | `03_Diseno/05_Decisiones_tecnicas.md` §3 y `03_Diseno/03_Modelo_de_datos.md` §3 |

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

### Capa 2 — base de datos (respaldo, pendiente)

Índice/resticción única sobre `(resource_id, date, shift, module)` **para `status='CONFIRMADA'`**, de modo que ni un error de código ni una consulta directa a la BD permitan el duplicado. Opción alternativa: tabla puente `confirmed_slots` con `UNIQUE(resource_id, date, shift, module)` que solo se inserta al confirmar.

> **Estado actual:** la capa de servicio está implementada; **la capa de datos todavía no** (sin constraint de respaldo en `models/request.py`). Hasta que no se agregue, la regla depende de una sola capa.

## Consecuencias

- **Positivas:** RF07 queda garantizada al crear *y* al confirmar; la lógica está en un solo archivo, fácil de probar (CP-02); el mensaje de error es único y traducible por el frontend.
- **Negativas:** sin el índice único, una condición de carrera entre dos confirmaciones simultáneas podría colar el duplicado; la verificación actual no está envuelta en una transacción que cierre la fila.
- **Pruebas:** CP-02 (segunda confirmación rechazada) y la regresión posterior a cualquier corrección. Es condición de aprobación de la cátedra que esta regla esté **implementada y probada**.
- **Si cambia la regla** (p. ej. permitir dos confirmaciones para equipos distintos), se modifica solo `request_service.py` y este ADR.

## Historial

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-10-01 | 1.0 | Decisión original: defensa en profundidad; capa de servicio completa, capa de datos pendiente |
| 2026-10-02 | 1.1 | `review_request` re-verifica conflictos al confirmar (capa 1 completa); sigue pendiente el índice único (capa 2) |
