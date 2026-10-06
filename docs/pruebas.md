# Plan de pruebas y casos de prueba — Biblioteca Horizonte

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-31 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-05 |
| **Versión** | 1.1 — espejo de BH-28 v1.1 |
| **Fuente** | `05_Pruebas/01_Plan_y_casos_de_prueba.md` (BH-28, local) |
| **Relacionados** | BH-05 (requisitos) · BH-06 (historias) · BH-25 (registro de cambios) · BH-31 (espejo en `docs/pruebas.md`) |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.1 | 2026-10-05 | Espejo de BH-28 v1.1: ejecución de los CP declarada como deuda técnica | Equipo |
| 1.0 | 2026-10-05 | Ingreso al repo como espejo de BH-28 | Equipo |

---

## 1. Alcance y estrategia

Las pruebas se derivan de los requisitos y las historias de usuario, tal como exige la consigna: no se inventan al cierre. Cada caso de la sección 3 indica el requisito (RF/RNF) y la historia (HU) de la que nace, de modo que la trazabilidad es verificable en ambas direcciones.

La suite cubre los tipos exigidos:

| Tipo exigido | Casos que lo cubren |
|---|---|
| Casos positivos (recorridos que deben funcionar) | CP-01, CP-03, CP-05, CP-07, CP-08, CP-18 |
| Casos negativos (datos u operaciones que deben rechazarse) | CP-10, CP-11, CP-12, CP-13, CP-14, CP-17 |
| Valores límite | CP-14 (fecha pasada; turno Mañana con módulo de la tarde) |
| Integración entre pantalla, servicio y datos | CP-01 a CP-08, CP-15, CP-16 |
| Autorización | CP-06, CP-10, CP-11, CP-17 |
| Regresión (al menos 2 después de corregir defectos) | CP-02 (regresión obligatoria por B-01/B-02) y CP-18 (regresión del recorrido completo); se suman CP-10 y CP-12 como regresión de los defectos DEF-01 y DEF-05 |

Entorno de ejecución: backend Flask en `http://127.0.0.1:5000` con datos de `Backend/seed.py` (2 proyectores y 4 notebooks), y frontend Next.js sobre la versión integrada. Los casos de nivel "Integración" se ejecutan contra la API (colección de Postman y Swagger UI disponibles en el repositorio); los de nivel "Manual" se ejecutan sobre la pantalla.

## 2. Convenciones

| Campo | Valores admitidos |
|---|---|
| Nivel | Unitaria · Integración · Manual |
| Estado del caso | Pendiente · Ejecutada · No ejecutable |
| Resultado del caso | Pasó · Falló · No ejecutable |
| Estado global | Ejecutada con resultado "Pasó" cuenta para el mínimo de 15 casos exigidos; todo caso "Falló" genera un registro en la sección 4 |

## 3. Casos de prueba CP-01 … CP-18

| ID | Req. / Historia | Datos o condición | Resultado esperado | Nivel | Resultado obtenido | Estado (05/10/2026) |
|---|---|---|---|---|---|---|
| CP-01 | RF03, RF04 / HU-01 | Docente válido + proyector + fecha + módulo | Se crea la solicitud con estado PENDIENTE | Integración | — | Pendiente |
| CP-02 | RF07 / HU-02 | Ya existe una CONFIRMADA para mismo recurso/fecha/módulo | Se rechaza la segunda confirmación con 409 (B-01 + B-02 cerradas) y la solicitud sigue PENDIENTE | Integración | — | Pendiente (regresión obligatoria) |
| CP-03 | RF06 / HU-02 | Solicitud PENDIENTE sin conflicto, rol bibliotecaria | Pasa a CONFIRMADA con quién y cuándo resolvió | Integración | — | Pendiente |
| CP-04 | RF08 / HU-03 | Solicitud PENDIENTE, rol bibliotecaria | Pasa a RECHAZADA (final) con autor y fecha | Integración | — | Pendiente |
| CP-05 | RF02 / HU-05 | Consulta de recursos | Muestra 2 proyectores y 4 notebooks con su identificación | Integración | — | Pendiente |
| CP-06 | RF05 / HU-06 | Listar pendientes como bibliotecaria y como docente | Bibliotecaria: lista con contexto; docente: 403 | Integración | — | Pendiente |
| CP-07 | RF09 / HU-04 | Docente consulta su solicitud | Ve Pendiente / Confirmada / Rechazada con texto inequívoco | Integración | — | Pendiente |
| CP-08 | RF10 / HU-07 | Filtrar confirmadas por recurso y fecha | Solo CONFIRMADAS, con docente y módulo | Integración | — | Pendiente |
| CP-09 | RNF01 / HU-04 | Ver una solicitud en cada estado en la pantalla | Texto y color propios; nunca un mensaje que presente la reserva como hecha | Manual | — | Pendiente |
| CP-10 | RNF02 / HU-02 | Docente intenta confirmar (interfaz y llamada directa) | 403 con mensaje de permiso | Integración | — | Pendiente (regresión de DEF-01) |
| CP-11 | RNF02 / HU-03, HU-06 | Docente intenta rechazar o ver pendientes | 403 | Integración | — | Pendiente |
| CP-12 | RNF03 / HU-09 | Campos obligatorios vacíos o con formato inválido | 422 con `fieldErrors`; no persiste ningún registro | Unitaria | — | Pendiente (regresión de DEF-05) |
| CP-13 | RNF03 / HU-09 | Recurso inexistente o `available=false` | 409/422; no crea la solicitud | Integración | — | Pendiente |
| CP-14 | RNF03 / HU-09 | Fecha pasada; turno Mañana con módulo de la tarde | Rechazo sin persistir | Unitaria | — | Pendiente |
| CP-15 | RNF04 | 100 solicitudes registradas; consulta de listados | Respuesta en menos de 2 segundos | Integración | — | Pendiente (B-06) |
| CP-16 | RNF06 / HU-10, HU-11 | Crear y cambiar estado de una solicitud | Quedan registrados fecha, usuario y acción; consultables | Integración | — | Pendiente |
| CP-17 | RF01 / HU-08 | Login con credenciales correctas, incorrectas y cuenta INACTIVA | 200 con token y rol / 401 genérico / sin ingreso | Integración | — | Pendiente |
| CP-18 | Recorrido completo | Docente solicita, ve Pendiente, Lucía confirma, docente ve Confirmada; luego Lucía rechaza otra | Todo el recorrido funciona sobre la versión integrada | Manual | — | Pendiente (regresión) |

**Estado al 05/10/2026: 0 de 18 casos ejecutados.** El diseño y la trazabilidad están completos; la ejecución queda **declarada como deuda técnica** (decisión del equipo del 05/10/2026 — registrada en BH-00, sección 2.3 y en BH-27, sección 10) y es condición de la Etapa 4: la consigna exige un mínimo de 15 casos ejecutados.

## 4. Registro de defectos

Formato exigido por la consigna: ID, versión, pasos para reproducir, resultado esperado, resultado observado, severidad, estado y evidencia de la corrección.

> Origen de los registros DEF-01 a DEF-09: la revisión código–documentación registrada en `03_Diseno/02_Estados_y_reglas.md` (sección 7, BH-09). Se incorporan al registro con su formato de defecto; los casos que se detecten al ejecutar los CP se agregarán con origen "CP-xx".

| ID | Origen / versión | Pasos para reproducir | Resultado esperado | Resultado observado | Severidad | Estado | Evidencia de la corrección |
|---|---|---|---|---|---|---|---|
| DEF-01 | B-01 · v0.3 | Confirmar una solicitud cuando ya existe una CONFIRMADA para el mismo recurso, fecha y módulo, por camino alternativo del servicio | Rechazo con 409 sin persistir | La segunda confirmación podía resolverse sin re-verificar la regla | Alta | Cerrada | `review_request` re-verifica la regla (BH-09, sección 7); commits `ba345e7` y `3bd27b0` |
| DEF-02 | B-02 · v0.3 | Repetir la confirmación de forma concurrente (dos peticiones simultáneas) | Rechazo con 409 por restricción de unicidad | Sin restricción `UNIQUE` de respaldo en la base de datos | Alta | Cerrada | Índice parcial `uq_confirmed_request_slot` + `IntegrityError` convertido en 409 (BH-09, sección 7) |
| DEF-03 | B-03 · v0.3 | Enviar `PATCH /api/requests/<id>/review` sobre una solicitud en estado CONFIRMADA o RECHAZADA | Rechazo con 400: `review` solo opera sobre PENDIENTE | El endpoint aceptaba transiciones desde cualquier estado | Media | Cerrada | `review` valida el estado y devuelve 400 (BH-09, sección 7) |
| DEF-04 | B-05 · v0.3 | Consultar `GET /api/requests/<id>` de otra persona con un token válido de docente | 403 (solo dueño o bibliotecaria) | Cualquier usuario autenticado podía leer solicitudes ajenas | Alta | Cerrada | Control de propiedad en `app/routes/requests.py` (BH-09, sección 7); inspección 05/10/2026 |
| DEF-05 | B-04 · v0.3 | Crear una solicitud con fecha pasada o con turno Mañana y módulo de la tarde | 422/409 sin persistir | El sistema aceptaba fechas pasadas y módulos incoherentes con el turno | Media | Cerrada | Esquema Marshmallow (422) y validación de servicio (409) (BH-09, sección 7) |
| DEF-06 | B-09 · v0.3 | Cambiar el estado de una solicitud y consultar `GET /api/admin/audit-logs` | Quedan registrados estado anterior y nuevo | La auditoría no guardaba el estado anterior | Media | Cerrada | Campos `old_status`/`new_status` y acciones `AUTO_CANCEL_PENDING`/`NOTIFICATION` (BH-09, sección 7) |
| DEF-07 | B-08 · v0.4 | Realizar una llamada a la API desde un origen distinto al del frontend | Solo el origen del frontend es aceptado | `CORS(app)` acepta cualquier origen (la parte de zona horaria de B-08 sí quedó resuelta) | Media | Abierta | Pendiente: restringir orígenes (ver BH-30, riesgo S-06) |
| DEF-08 | B-14 · v0.4 | Clonar el repositorio en otra máquina e intentar configurar el entorno sin leer el código | Existe `.env.example` con las variables documentadas | No hay `.env.example`; `config.py` cae en valores por defecto de desarrollo | Media | Abierta | Pendiente: crear `Backend/.env.example` (ver BH-30, riesgo S-04) |
| DEF-09 | B-10 · v0.4 | Generar dos identificadores `BH-XXXX` en operaciones simultáneas | Identificador único garantizado por transacción | El identificador se calcula sin transacción (colisión posible) | Baja | Abierta | Pendiente: corrección en el flujo de alta (BH-09, sección 7) |

**Resumen: 9 defectos registrados — 6 cerrados · 3 abiertos (DEF-07, DEF-08, DEF-09).**

## 5. Estado de ejecución y próximo paso

**Deuda técnica (2026-10-05):** el equipo decide no ejecutar los casos en esta entrega; el plan queda íntegro y este documento conserva el procedimiento para retomarlo sin recomenzar. Pasos a seguir cuando se atienda la deuda:

1. Levantar el backend (`python run.py`) con los datos de `seed.py` y el frontend (`npm run dev`).
2. Ejecutar los 18 casos en el orden de la sección 3, registrando en "Resultado obtenido" el valor observado y la fecha.
3. Registrar como defecto todo caso con resultado "Falló" (formato de la sección 4) y regresarlo al cerrarlo.
4. Cerrar la Etapa 4 con un mínimo de 15 casos ejecutados y al menos 2 regresiones (CP-02 y CP-18).
5. Actualizar este documento (v1.1 → siguiente versión) y su espejo `docs/pruebas.md`, y volcar el resumen al informe final (BH-27).

---

## Referencias normativas

- ISO/IEC/IEEE 29119 — Pruebas de software (planes, casos y registro de defectos).
- ISO/IEC/IEEE 29148:2018 — Ingeniería de requisitos (trazabilidad requisito–caso).
- Consigna de la cátedra, sección 16 (Pruebas de software) y sección 21, entregable 10.
- `02_Requisitos_Backlog/01_Requisitos.md` (BH-05) y `02_Requisitos_Backlog/02_Historias_de_usuario.md` (BH-06).
