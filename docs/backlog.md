# Product Backlog

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-16 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-04 |
| **Versión** | 1.1 – sincronizado con el código: HU-08 corregida (login real), estados de implementación, +HU-15 y HU-16 |
| **Estado** | Se actualiza durante todo el proyecto |
| **Estimación** | Relativa (fibra: 1, 2, 3, 5, 8) |
| **Fuente** | `02_Requisitos_Backlog/03_Product_Backlog.md` |
| **Relacionados** | BH-07 (fuente local) · BH-15 |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.1 | 2026-10-04 | HU-08/HU-15/HU-16 y estados de implementación + control documental | Equipo |
| 1.0 | 2026-10-02 | Ingreso al repo (commit 99d53dc) | Equipo |

**Leyenda de prioridad:** Alta = necesario para el MVP · Media = mejora el producto · Baja = opcional/pospuesto.
**Leyenda de estado:** `Implementada — sin verificar con CP` = existe en el código, falta ejecutar los casos de prueba (Etapa 4).

| ID | Historia / necesidad | Prioridad | Estimación | Criterios de aceptación (resumen) | Dependencias | Estado |
|---|---|---|---|---|---|---|
| HU-01 | Como docente quiero crear una solicitud con recurso, fecha y módulo para reservar un equipo | Alta | 3 | Se crea en PENDIENTE; valida campos, recurso y fecha/módulo; nunca muestra "Reserva realizada" | HU-08, HU-05 | Implementada — sin verificar con CP |
| HU-02 | Como Lucía quiero confirmar una solicitud para garantizar el equipo al docente | Alta | 5 | Pasa a CONFIRMADA; impide 2.ª confirmación para mismo recurso/fecha/módulo; solo rol Lucía; validación en servidor | HU-01, HU-06 | Implementada — sin verificar con CP |
| HU-03 | Como Lucía quiero rechazar una solicitud para dejar la decisión registrada | Alta | 3 | Pasa a RECHAZADA; no permite rechazar CONFIRMADA; solo rol Lucía; registra autor y fecha | HU-01, HU-06 | Implementada — sin verificar con CP |
| HU-04 | Como docente quiero consultar el estado de mi solicitud para saber si tendré el equipo | Alta | 3 | Muestra Pendiente/Confirmada/Rechazada con texto inequívoco; no expone solicitudes ajenas | HU-01 | Implementada — sin verificar con CP |
| HU-05 | Como docente quiero ver los recursos disponibles (2 proyectores, 4 notebooks) para elegir | Alta | 2 | Lista completa; indica disponibilidad para fecha/módulo elegidos (endpoint `availability`) | — | Implementada — sin verificar con CP |
| HU-06 | Como Lucía quiero ver las solicitudes pendientes para gestionarlas | Alta | 3 | Lista con docente/recurso/fecha/módulo; acciones confirmar/rechazar; acceso solo rol Lucía | HU-01 | Implementada — sin verificar con CP |
| HU-07 | Como Lucía quiero consultar las reservas confirmadas por recurso y fecha para planificar el uso | Media | 3 | Filtra por recurso y fecha; muestra solo CONFIRMADAS con su docente | HU-02 | Implementada — sin verificar con CP |
| HU-08 | Como usuario quiero identificarme con email y contraseña para que el sistema sepa quién actúa | Alta | 2 | Login con email + contraseña (JWT); el **servidor** determina el rol desde la BD (sin selector de rol); sin token no se opera | — | Implementada — sin verificar con CP |
| HU-09 | Como sistema quiero validar los datos de entrada para no persistir información inválida | Alta | 2 | Rechaza fecha pasada/inexistente, módulo fuera de rango, campos vacíos; mensaje claro; 0 errores de servidor | HU-01 | Implementada — sin verificar con CP |
| HU-10 | Como Lucía quiero ver el historial de solicitudes con su evolución para reconstruir qué ocurrió | Media | 3 | Lista con estado actual, fecha y autor de cada cambio de estado | HU-02, HU-03 | Parcial — historial en `audit-logs` (visible solo para admin) |
| HU-11 | Como institución quiero que cada cambio de estado quede registrado para trazabilidad | Media | 2 | Se guardan fecha, usuario, estado anterior y nuevo; visible en el historial | HU-10 | Implementada — sin verificar con CP |
| HU-12 | Como Lucía quiero enviar recordatorios por correo para avisar al docente sobre su reserva | Baja | 5 | **Cambio pendiente de análisis** (valor, esfuerzo, riesgo e impacto) – no forma parte del MVP hasta decisión registrada en `08_Cambios/`. *Nota: la notificación interna (auditoría `NOTIFICATION`) ya está implementada; falta el envío real por correo* | HU-02, infraestructura de correo | Pendiente (evaluar) |
| HU-13 | Como Lucía quiero exportar la lista de reservas del día para imprimirla y usarla en el mostrador | Baja | 3 | Exporta CSV/imprimible de reservas confirmadas del día | HU-07 | Pendiente |
| HU-14 | Como integrante del equipo quiero un README con requisitos e instrucciones para ejecutar el proyecto en otra computadora | Media | 1 | Describe estructura, requisitos y pasos de ejecución verificados por un integrante | — | Implementada — sin verificar con CP |
| HU-15 | Como docente quiero cancelar una solicitud propia (pendiente o confirmada) para liberar el horario cuando ya no la necesito | Media | 2 | Cancela solo las propias en PENDIENTE/CONFIRMADA → CANCELADA; valida dueño, estado y fecha; la bibliotecaria puede cancelar cualquiera; queda auditado | HU-01, HU-04 | Implementada — sin verificar con CP |
| HU-16 | Como administrador quiero un panel de administración para gestionar usuarios, recursos y reportes | Media | 3 | Pantallas `/admin/*`: dashboard, usuarios, recursos y reportes; admin gestiona todo, la bibliotecaria solo consulta; el admin **no** gestiona solicitudes | HU-08 | Implementada — sin verificar con CP |

## Resumen

- **Total de ítems:** 16 (mínimo exigido: 12).
- **Alta:** 8 · **Media:** 6 · **Baja:** 2 (HU-12 es un *cambio* pendiente de decisión).
- **Estimación total:** 48 puntos relativos.
- **MVP (etiquetado):** HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09.
- **Estado general:** 12 implementadas sin CP · 1 parcial (HU-10) · 2 pendientes (HU-12 evaluar, HU-13) · 0 verificadas con casos de prueba (Etapa 4).

## Criterios completos de las historias HU-07 a HU-16

- **HU-07:** filtra por recurso y fecha; muestra únicamente reservas CONFIRMADAS con docente y módulo; sin resultados ⇒ mensaje claro.
- **HU-08:** login con **email y contraseña** (token JWT); el servidor determina el rol desde la base de datos (no hay selector de rol); el rol decide qué acciones se muestran y qué acepta el servidor; sin token no se pueden crear solicitudes.
- **HU-09:** rechaza fecha pasada o inexistente, módulo fuera del horario y campos vacíos; no persiste nada; mensaje de error comprensible.
- **HU-10:** lista todas las solicitudes con estado actual; permite ver fecha, autor y transición de cada cambio. *Hoy el historial vive en `/api/admin/audit-logs` (solo admin) — parcial.*
- **HU-11:** cada cambio de estado guarda fecha, usuario, estado anterior y nuevo; la información es consultable.
- **HU-12:** enviar correo al docente al confirmar/rechazar; **solo si el cambio es aprobado**; debe poder desactivarse sin romper el flujo principal. *La notificación interna (auditoría `NOTIFICATION`) ya está implementada.*
- **HU-13:** exporta las reservas confirmadas del día en formato imprimible/CSV; respeta los filtros de fecha.
- **HU-14:** README con descripción, requisitos y pasos de ejecución; verificado por un integrante en una computadora distinta.
- **HU-15:** el docente cancela sus propias solicitudes en estado PENDIENTE o CONFIRMADA → CANCELADA; el servidor valida dueño, estado y que el horario no haya pasado; la bibliotecaria puede cancelar cualquiera; toda cancelación queda auditada (`CANCEL_REQUEST`) y se informa al docente.
- **HU-16:** panel `/admin/*` con dashboard (métricas), gestión de usuarios y de recursos, y reportes; el admin accede a todo salvo revisar solicitudes; la bibliotecaria ve el dashboard pero no usuarios/reportes; auditoría visible solo para admin.

## Reglas de priorización aplicadas

1. Primero el problema central (crear, decidir, impedir duplicados, consultar estado).
2. Después lo que habilita el recorrido (identificación, recursos, vistas).
3. Los cambios nuevos (HU-12) entran al backlog y se priorizan por **valor, esfuerzo, riesgo y efecto sobre el alcance** antes de desarrollarse.
4. La prioridad se revisa en cada Sprint Review.

## Referencias normativas

- Schwaber & Sutherland, *Scrum Guide* (2020) – artefactos: Product Backlog e historias de usuario.
