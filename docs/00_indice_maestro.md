# Índice maestro del expediente — Biblioteca Horizonte

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-00 |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-04 |
| **Versión** | 1.0 |
| **Estado** | Vigente — índice maestro del expediente |
| **Relacionados** | Todo el expediente (BH-01…BH-19 · ADR-001 · ADR-002) |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-10-04 | Versión inicial: índice, mapa de artefactos, convenciones de identificadores y referencias normativas | Equipo |

---

## 1. Resumen ejecutivo

**Biblioteca Horizonte** es el Proyecto Integrador de Ingeniería de Software (ciclo 2026): una aplicación web para gestionar la reserva de los recursos de la Biblioteca Escolar Horizonte (2 proyectores y 4 notebooks), desde la solicitud de un docente hasta la confirmación o el rechazo por parte de la bibliotecaria, con reglas explícitas contra reservas duplicadas.

Estado del expediente a la fecha:

- **Backend** Flask + SQLAlchemy con **21 endpoints** verificados contra el código (`docs/contrato-api.md`).
- **16 historias** en el backlog (48 puntos, 4 sprints; MVP = HU-01…HU-09); **6 historias completas** con criterios de aceptación.
- **14 reglas de negocio** (RN-01…RN-14) unificadas en todos los documentos.
- **Brechas código–documentación**: 11 cerradas · 2 parciales (B-08 CORS, B-12 seed) · 2 abiertas (B-10 IDs sin transición atómica, B-14 sin `.env.example`) — fuente única: `03_Diseno/02_Estados_y_reglas.md` §7 (BH-09).
- **Casos de prueba**: 0 ejecutados (meta de la consigna: ≥ 15) — pendiente en `05_Pruebas/`.

## 2. Índice del expediente

Convención de rutas: `docs/…` = dentro del repositorio (`biblioteca-horizonte/`, único contenido que se sube a GitHub); el resto = carpetas locales que se entregan por Drive.

### 2.1 Documentos del repositorio (`biblioteca-horizonte/docs/`)

| Código | Documento | Ruta | Versión | Estado |
|---|---|---|---|---|
| BH-00 | Índice maestro del expediente | `docs/00_indice_maestro.md` | 1.0 | Vigente |
| BH-13 | Alcance del producto | `docs/alcance.md` | 1.1 | Vigente — espejo de BH-04 |
| BH-14 | Requisitos y reglas de negocio | `docs/requisitos.md` | 1.2 | Vigente — espejo de BH-05 |
| BH-15 | Historias de usuario (índice) | `docs/historias.md` | 1.1 | Vigente — espejo de BH-06 |
| BH-16 | Product Backlog priorizado | `docs/backlog.md` | 1.1 | Vigente — espejo de BH-07 |
| BH-17 | Contrato de integración (API) | `docs/contrato-api.md` | 1.3 | Vigente — espejo de BH-11 |
| BH-18 | Modelo de datos | `docs/modelo-datos.md` | 1.2 | Vigente — espejo de BH-10 |
| ADR-001 | Estados de la solicitud y transiciones | `docs/decisiones/ADR-001-estados-solicitud.md` | 1.1 | Aceptado |
| ADR-002 | Regla de no duplicación de reservas confirmadas | `docs/decisiones/ADR-002-regla-no-duplicacion.md` | 1.2 | Aceptado (implementación parcial) |

### 2.2 Documentos locales (fuera del repo — Drive)

| Código | Documento | Ruta | Versión | Estado |
|---|---|---|---|---|
| BH-01 | Ficha del proyecto | `01_Inicio/01_Ficha_del_proyecto.md` | 1.1 | Vigente |
| BH-02 | Mapa de stakeholders | `01_Inicio/02_Stakeholders.md` | 1.1 | Vigente |
| BH-03 | Acuerdo de trabajo del equipo | `01_Inicio/03_Acuerdo_de_trabajo_del_equipo.md` | 1.1 | Vigente |
| BH-04 | Alcance MVP y fuera de alcance | `01_Inicio/04_Alcance_MVP_y_fuera_de_alcance.md` | 1.1 | Vigente |
| BH-05 | Requisitos (RF/RB/RNF + RN-01…RN-14) | `02_Requisitos_Backlog/01_Requisitos.md` | 1.2 | Vigente |
| BH-06 | Historias de usuario | `02_Requisitos_Backlog/02_Historias_de_usuario.md` | 1.1 | Vigente |
| BH-07 | Product Backlog priorizado | `02_Requisitos_Backlog/03_Product_Backlog.md` | 1.1 | Vigente |
| BH-08 | Flujo del proceso de negocio | `03_Diseno/01_Flujo_del_proceso.md` | 1.2 | Vigente |
| BH-09 | Estados, reglas y brechas (§7) | `03_Diseno/02_Estados_y_reglas.md` | 1.2 | Vigente |
| BH-10 | Modelo de datos | `03_Diseno/03_Modelo_de_datos.md` | 1.2 | Vigente |
| BH-11 | Contrato de integración (API) | `03_Diseno/04_Contrato_de_integracion.md` | 1.2 | Vigente |
| BH-12 | Decisiones técnicas (D-01…D-10) | `03_Diseno/05_Decisiones_tecnicas.md` | 1.1 | Vigente |
| BH-19 | Bitácora de decisiones | `03_Diseno/06_Bitacora_de_decisiones.md` | 1.2 | Vigente |
| — | README del proyecto (raíz) | `README.md` | 0.4.0 | Vigente — no se sube al repo |
| — | BH-DOC-01 Documento único de la consigna | `BH-DOC-01….docx` (raíz) | 0.3 | Desactualizado — regenerar v0.4 |

### 2.3 Artefactos pendientes (carpetas vacías)

| Carpeta | Contenido previsto | Estado |
|---|---|---|
| `04_Sprints/Sprint_1…4/` | Actas, planificación y cierres de sprint | Pendiente |
| `05_Pruebas/` | Plan y ejecución de ≥ 15 casos de prueba (CP-01…) | Pendiente — 0 ejecutados |
| `06_Calidad/` | Revisión de calidad / ISO 25010 | Pendiente |
| `07_Seguridad/` | Análisis STRIDE y OWASP Top 10 (B-08 CORS) | Pendiente |
| `08_Cambios/` | Registro de cambios entre entregas | Pendiente |
| `09_Evidencias_Git/` | Matriz de trazabilidad RF → HU → CP → Riesgo → Sprint | Pendiente |
| `10_Informe_Final/` | Informe final consolidado | Pendiente |

## 3. Convenciones de identificadores

| Prefijo | Significado | Ejemplo |
|---|---|---|
| `BH-00…BH-19` | Código de documento del expediente (este índice) | BH-09 = Estados y reglas |
| `ADR-###` | Architecture Decision Record | ADR-002 |
| `RF/RB/RNF` | Requisitos funcionales / de negocio / no funcionales (`BH-DOC-01`) | RF07 |
| `RN-##` | Reglas de negocio unificadas en todos los documentos | RN-14 |
| `HU-##` | Historias de usuario (MVP = HU-01…09; total 16) | HU-15 |
| `CP-##` / `TC-##` | Casos de prueba (plan `05_Pruebas/`) | CP-01 |
| `B-##` | Brechas código–documentación (fuente única: BH-09 §7) | B-10 |
| `D-##` | Decisiones técnicas (BH-12) | D-08 |
| `Sprint N` | Iteraciones de 4 sprints | Sprint 1 |

## 4. Fuente canónica y sincronización

1. **`biblioteca-horizonte/docs/` es la fuente canónica**; los documentos locales de las carpetas `01_…10_` son su espejo para entregar por Drive, y el `.docx` es derivado.
2. **Solo `docs/` se sube al GitHub**; nada de `.env`, secretos, PDFs ni `.docx`.
3. Todo documento del expediente lleva **Control documental** (código, versión, estado, fecha, relacionados) e **Historial de cambios** al inicio, y **Referencias normativas** al cierre cuando aplica.
4. Los cambios de reglas (RN), estados o contrato se aplican **en todos los documentos afectados** en la misma pasada de sincronización.

## 5. Referencias normativas

- ISO/IEC/IEEE 12207:2017 — Procesos del ciclo de vida de software.
- ISO/IEC/IEEE 29148:2018 — Ingeniería de requisitos para sistemas y software.
- ISO/IEC 25010:2011 — Modelos de calidad de sistemas y software.
- ISO/IEC/IEEE 29119 — Pruebas de software (cuando se elabore `05_Pruebas/`).
- Schwaber & Sutherland, *Scrum Guide* (2020) — Product Backlog, historias de usuario, sprints.
- RFC 9110 — HTTP Semantics (códigos de estado 4xx/5xx).
- RFC 7519 — JSON Web Token (JWT).
- OpenAPI Specification 3.1 — estilo de descripción de APIs REST.
- OWASP Top 10 — riesgos de seguridad web (cuando se elabore `07_Seguridad/`).
- Nygard, M. (2011) — *Documenting Architecture Decisions* (formato ADR).
- Harel, D. (1987) — *Statecharts: A Visual Formalism for Complex Systems*.
- Chen, P. (1976) — *The Entity-Relation Model* (modelado de datos).
