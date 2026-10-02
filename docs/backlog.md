# Product Backlog inicial

| Campo | Valor |
|---|---|
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-02 |
| **Versión** | 1.0 |
| **Estado** | Inicial – se actualiza durante todo el proyecto |
| **Estimación** | Relativa (fibra: 1, 2, 3, 5, 8) |
| **Fuente** | `02_Requisitos_Backlog/03_Product_Backlog.md` |

**Leyenda de prioridad:** Alta = necesario para el MVP · Media = mejora el producto · Baja = opcional/pospuesto.

| ID | Historia / necesidad | Prioridad | Estimación | Criterios de aceptación (resumen) | Dependencias | Estado |
|---|---|---|---|---|---|---|
| HU-01 | Como docente quiero crear una solicitud con recurso, fecha y módulo para reservar un equipo | Alta | 3 | Se crea en PENDIENTE; valida campos, recurso y fecha/módulo; nunca muestra "Reserva realizada" | HU-08, HU-05 | Pendiente |
| HU-02 | Como Lucía quiero confirmar una solicitud para garantizar el equipo al docente | Alta | 5 | Pasa a CONFIRMADA; impide 2.ª confirmación para mismo recurso/fecha/módulo; solo rol Lucía; validación en servidor | HU-01, HU-06 | Pendiente |
| HU-03 | Como Lucía quiero rechazar una solicitud para dejar la decisión registrada | Alta | 3 | Pasa a RECHAZADA; no permite rechazar CONFIRMADA; solo rol Lucía; registra autor y fecha | HU-01, HU-06 | Pendiente |
| HU-04 | Como docente quiero consultar el estado de mi solicitud para saber si tendré el equipo | Alta | 3 | Muestra Pendiente/Confirmada/Rechazada con texto inequívoco; no expone solicitudes ajenas | HU-01 | Pendiente |
| HU-05 | Como docente quiero ver los recursos disponibles (2 proyectores, 4 notebooks) para elegir | Alta | 2 | Lista completa; indica disponibilidad para fecha/módulo elegidos | — | Pendiente |
| HU-06 | Como Lucía quiero ver las solicitudes pendientes para gestionarlas | Alta | 3 | Lista con docente/recurso/fecha/módulo; acciones confirmar/rechazar; acceso solo rol Lucía | HU-01 | Pendiente |
| HU-07 | Como Lucía quiero consultar las reservas confirmadas por recurso y fecha para planificar el uso | Media | 3 | Filtra por recurso y fecha; muestra solo CONFIRMADAS con su docente | HU-02 | Pendiente |
| HU-08 | Como usuario quiero identificarme con mi nombre y rol para que el sistema sepa quién actúa | Alta | 2 | Selector/login simple de usuario (docente / Lucía); el rol determina las acciones disponibles | — | Pendiente |
| HU-09 | Como sistema quiero validar los datos de entrada para no persistir información inválida | Alta | 2 | Rechaza fecha pasada/inexistente, módulo fuera de rango, campos vacíos; mensaje claro; 0 errores de servidor | HU-01 | Pendiente |
| HU-10 | Como Lucía quiero ver el historial de solicitudes con su evolución para reconstruir qué ocurrió | Media | 3 | Lista con estado actual, fecha y autor de cada cambio de estado | HU-02, HU-03 | Pendiente |
| HU-11 | Como institución quiero que cada cambio de estado quede registrado para trazabilidad | Media | 2 | Se guardan fecha, usuario, estado anterior y nuevo; visible en el historial | HU-10 | Pendiente |
| HU-12 | Como Lucía quiero enviar recordatorios por correo para avisar al docente sobre su reserva | Baja | 5 | **Cambio pendiente de análisis** (valor, esfuerzo, riesgo e impacto) – no forma parte del MVP hasta decisión registrada en `08_Cambios/` | HU-02, infraestructura de correo | Pendiente (evaluar) |
| HU-13 | Como Lucía quiero exportar la lista de reservas del día para imprimirla y usarla en el mostrador | Baja | 3 | Exporta CSV/imprimible de reservas confirmadas del día | HU-07 | Pendiente |
| HU-14 | Como integrante del equipo quiero un README con requisitos e instrucciones para ejecutar el proyecto en otra computadora | Media | 1 | Describe estructura, requisitos y pasos de ejecución verificados por un integrante | — | Pendiente |

## Resumen

- **Total de ítems:** 14 (mínimo exigido: 12).
- **Alta:** 9 · **Media:** 4 · **Baja:** 2 (HU-12 es un *cambio* pendiente de decisión).
- **Estimación total:** 43 puntos relativos.
- **MVP (etiquetado):** HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09.

## Criterios completos de las historias HU-07 a HU-14

- **HU-07:** filtra por recurso y fecha; muestra únicamente reservas CONFIRMADAS con docente y módulo; sin resultados ⇒ mensaje claro.
- **HU-08:** identificación simple con nombre y rol (docente / Lucía); el rol decide qué acciones se muestran y qué acepta el servidor; sin identificación no se pueden crear solicitudes.
- **HU-09:** rechaza fecha pasada o inexistente, módulo fuera del horario y campos vacíos; no persiste nada; mensaje de error comprensible.
- **HU-10:** lista todas las solicitudes con estado actual; permite ver fecha, autor y transición de cada cambio.
- **HU-11:** cada cambio de estado guarda fecha, usuario, estado anterior y nuevo; la información es consultable.
- **HU-12:** enviar correo al docente al confirmar/rechazar; **solo si el cambio es aprobado**; debe poder desactivarse sin romper el flujo principal.
- **HU-13:** exporta las reservas confirmadas del día en formato imprimible/CSV; respeta los filtros de fecha.
- **HU-14:** README con descripción, requisitos y pasos de ejecución; verificado por un integrante en una computadora distinta.

## Reglas de priorización aplicadas

1. Primero el problema central (crear, decidir, impedir duplicados, consultar estado).
2. Después lo que habilita el recorrido (identificación, recursos, vistas).
3. Los cambios nuevos (HU-12) entran al backlog y se priorizan por **valor, esfuerzo, riesgo y efecto sobre el alcance** antes de desarrollarse.
4. La prioridad se revisa en cada Sprint Review.
