# Riesgos de seguridad, controles y verificaciones — Biblioteca Horizonte

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-33 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-05 |
| **Versión** | 1.1 — espejo de BH-30 v1.1 |
| **Fuente** | `07_Seguridad/01_Riesgos_de_seguridad.md` (BH-30, local) |
| **Relacionados** | BH-09 (brechas, sección 7) · BH-28 (pruebas) · BH-29 (calidad) · BH-33 (espejo en `docs/seguridad.md`) |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.1 | 2026-10-05 | Espejo de BH-30 v1.1: verificaciones por prueba declaradas como deuda técnica | Equipo |
| 1.0 | 2026-10-05 | Ingreso al repo como espejo de BH-30 | Equipo |

---

## 1. Método

Se aplican los conceptos **amenaza, vulnerabilidad, impacto, control y verificación** exigidos por la consigna, con la referencia de OWASP Top 10:2025 sin forzar las diez categorías: se emplean solo las pertinentes al alcance real del sistema. Cada riesgo indica si su control está verificado por inspección de código (fecha) o pendiente de prueba (caso CP asociado).

## 2. Riesgos registrados

| ID | Activo / dato | Amenaza | Vulnerabilidad | Impacto | Control implementado | Verificación | OWASP 2025 |
|---|---|---|---|---|---|---|---|
| S-01 | Confirmación y rechazo de solicitudes | Un docente confirma o rechaza reservas sin autorización | Ausencia de control de rol en el servidor (solo la interfaz lo ocultaba) | Reserva alterada o duplicada por un usuario no autorizado | Decorador `role_required` aplicado en el servidor a las operaciones de revisión | **Pendiente de prueba:** CP-10 y CP-11 (403 con rol docente) | A01 — Broken Access Control |
| S-02 | Solicitudes de otros usuarios | Un usuario modifica identificadores para consultar solicitudes ajenas | Falta de validación de propiedad sobre el recurso solicitado | Fuga de información personal y de estado de reservas ajenas | Control de propiedad en `GET /api/requests/<id>`: solo dueño o bibliotecaria (403); cierre de B-05 | **Verificado por inspección** el 05/10/2026 (`app/routes/requests.py`); conviene sumar un caso CP dedicado | A01 — Broken Access Control |
| S-03 | Datos de entrada de solicitudes y usuarios | Se procesan entradas sin validación, con formatos inválidos o campos obligatorios vacíos | Sin validación de esquema, datos corruptos persisten en la base | Registros inválidos que rompen el flujo de reserva | Esquemas Marshmallow (422 con `fieldErrors`) y validaciones de servicio (409) | **Pendiente de prueba:** CP-12, CP-13 y CP-14 | A03/A04 — Validación de entrada e diseño |
| S-04 | Credenciales y secretos del sistema | Credenciales o secretos quedan expuestos | `reset_passwords.py` incluye credenciales por defecto en un repositorio público y `config.py` cae en `dev-secret-key` / `jwt-dev-secret` si no hay variables de entorno | Suplantación de identidad y firma de tokens predecibles | `.env` excluido del repositorio (`git check-ignore` verificado el 05/10/2026 y sin presencia en el historial); contraseñas guardadas con hash (werkzeug) | **Parcial:** falta `.env.example` (B-14, DEF-08) y rotar las credenciales del seed fuera del código | A02 — Cryptographic Failures |
| S-05 | Respuestas de error de la API | Los errores del sistema muestran información interna (trazas, detalles de implementación) | Excepciones no controladas que revelan el interior de la aplicación | Facilita la exploración del atacante | Manejadores globales con mensaje uniforme (401, 403, 404, 422, 500) sin volcar trazas de pila (BH-09, sección 6) | **Verificado por inspección** el 05/10/2026 (`app/utils/error_handlers.py`); refuerzo con CP-12 a CP-14 | A05 — Security Misconfiguration |
| S-06 | Orígenes permitidos (CORS) | Cualquier sitio web puede invocar la API en nombre de un usuario con sesión abierta | `CORS(app)` sin restricción de orígenes (B-08, DEF-07) | Amplía la superficie de ataque sobre sesiones válidas | **Control pendiente:** restringir los orígenes al del frontend | **Abierta:** definir y aplicar la lista de orígenes; verificar con una llamada desde un origen no autorizado | A05 — Security Misconfiguration |
| S-07 | Dependencias del backend | Dependencias desactualizadas o comprometidas | Sin procedimiento periódico de revisión de versiones (solo fijado manual en `requirements.txt`) | Vulnerabilidades conocidas explotables sin código propio | Fijado de versiones en `requirements.txt` (control parcial) | **Pendiente:** ejecutar `pip-audit` o `pip check` y adjuntar el resultado como evidencia | A06 — Vulnerable and Outdated Components |
| S-08 | Historial de operaciones críticas | Falta de registros que impide reconstruir operaciones críticas | Auditoría incompleta (no guardaba el estado anterior; B-09) | Imposibilidad de auditar quién confirmó o rechazó qué y cuándo | Modelo `AuditLog` con usuario, acción, `old_status`/`new_status` y consulta `GET /api/admin/audit-logs` | **Verificado por inspección** el 05/10/2026; refuerzo con CP-16 (registro consultable) | A09 — Security Logging and Monitoring Failures |
| S-09 | Superficie de la API documentada | Un tercero explora el mapa completo de la API sin autenticación | `GET /api/docs/` y `GET /openapi.yaml` públicos desde el commit `0ae8fa3` (05/10/2026) | Conocimiento detallado de endpoints y parámetros para preparar ataques | **Control propuesto:** publicar la documentación solo en desarrollo, o detrás de autorización en producción | **Abierta:** decisión del equipo pendiente (aceptación documentada para desarrollo) | A05 — Security Misconfiguration |

**Resumen: 9 riesgos — 3 controles verificados por inspección (S-02, S-05, S-08), 3 con verificación por prueba pendiente (S-01, S-03, S-07), 1 parcial (S-04) y 2 abiertos (S-06, S-09).**

## 3. Controles transversales verificados por inspección

| Control | Evidencia en el código | Fecha |
|---|---|---|
| Contraseñas con hash, nunca en texto plano | `generate_password_hash` al crear usuario y `check_password_hash` al autenticar (`app/services/`) | 05/10/2026 |
| Token JWT con expiración configurable | `JWT_ACCESS_TOKEN_EXPIRES` (3600 s por defecto) en `app/config.py` | 05/10/2026 |
| Autorización por rol en el servidor | `app/utils/decorators.py` (`role_required` con `verify_jwt_in_request`) | 05/10/2026 |
| Secretos fuera del repositorio | `.env` en `.gitignore`; sin registros en el historial de Git | 05/10/2026 |
| Errores uniformes sin trazas | `app/utils/error_handlers.py` | 05/10/2026 |
| Trazabilidad de operaciones | `AuditLog` con estado anterior y nuevo, consultable por `GET /api/admin/audit-logs` | 05/10/2026 |
| Respaldo físico de la regla central | Índice `uq_confirmed_request_slot` con conversión de `IntegrityError` en 409 | 05/10/2026 |

## 4. Brechas de seguridad abiertas y plan de cierre

| Brecha | Riesgo asociado | Acción de cierre | Responsable área |
|---|---|---|---|
| B-08 (CORS abierto, DEF-07) | S-06 | Restringir los orígenes a la dirección del frontend y verificar con una llamada externa | Backend |
| B-14 (sin `.env.example`, DEF-08) | S-04 | Crear `Backend/.env.example` con `SECRET_KEY`, `JWT_SECRET_KEY` y `JWT_ACCESS_TOKEN_EXPIRES`, y rotar las credenciales del seed | Backend |
| Exposición de Swagger en producción | S-09 | Definir si se publica solo en desarrollo | Equipo |
| Sin revisión de dependencias | S-07 | Ejecutar `pip-audit` y adjuntar la salida como evidencia | Backend |

## 5. Verificaciones pendientes

1. CP-10 y CP-11: autorización con rol docente (403) — condición de la demostración final.
2. CP-16: registro de auditoría consultable.
3. Caso dedicado a propiedad de recursos (S-02): sumarlo a la suite de BH-28 en la v1.1.
4. `pip-audit` sobre `requirements.txt` (S-07).
5. Cierre de B-08 y B-14 con su verificación.

---

## Referencias normativas

- OWASP Top 10:2025 — Categorías de riesgo de aplicaciones web (referencia sin forzar las diez categorías).
- RFC 7519 — JSON Web Token (JWT).
- RFC 9110 — HTTP Semantics (códigos 401, 403, 404, 409, 422, 500).
- Consigna de la cátedra, sección 17 (Seguridad aplicada al sistema) y sección 21, entregable 12.
- `03_Diseno/02_Estados_y_reglas.md` (BH-09), sección 7 — fuente única de brechas.
