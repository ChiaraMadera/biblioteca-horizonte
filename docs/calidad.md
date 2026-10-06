# Atributos de calidad y métricas — Biblioteca Horizonte

**Control documental**

| Campo | Valor |
|---|---|
| **Código** | BH-32 |
| **Grupo** | Grupo D |
| **Equipo** | Madera Chiara · Riveros Silvio · Lasa Julio · Gonzalez Williams |
| **Fecha** | 2026-10-05 |
| **Versión** | 1.1 — espejo de BH-29 v1.1 |
| **Fuente** | `06_Calidad/01_Atributos_de_calidad.md` (BH-29, local) |
| **Relacionados** | BH-05 (RNF01…RNF07) · BH-28 (pruebas) · BH-30 (seguridad) · BH-32 (espejo en `docs/calidad.md`) |

**Historial de cambios**

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.1 | 2026-10-05 | Espejo de BH-29 v1.1: recolección de indicadores declarada como deuda técnica | Equipo |
| 1.0 | 2026-10-05 | Ingreso al repo como espejo de BH-29 | Equipo |

---

## 1. Criterio de selección

La consigna exige al menos 4 atributos de calidad convertidos en criterios observables, con justificación, un indicador por atributo, datos o evidencias y una interpretación. No se acepta la afirmación "es de buena calidad" sin evidencia.

Se seleccionaron cuatro atributos del modelo ISO/IEC 25010 directamente ligados al problema del caso (evitar reservas contradictorias y estados confiables):

| Atributo | Categoría ISO/IEC 25010 | Requisito de origen |
|---|---|---|
| A1 — Adecuación funcional | Exactitud funcional · Completitud funcional | RF07, RN-01…RN-14 |
| A2 — Usabilidad de los estados | Adecuación en uso (interacción) | RNF01 |
| A3 — Confiabilidad ante datos inválidos | Madurez · Tolerancia a fallos | RNF03 |
| A4 — Mantenibilidad de la regla central | Modularidad · Analizabilidad | RNF05 |

El atributo Seguridad no se duplica aquí: la consigna lo trata como entregable propio con riesgos, controles y verificaciones (BH-30, `07_Seguridad/`).

## 2. Tabla resumen

| Atributo | Por qué es importante para Biblioteca Horizonte | Indicador (métrica) | Meta | Método de recolección | Dato al 05/10/2026 |
|---|---|---|---|---|---|
| A1 — Adecuación funcional | El sistema existe para impedir reservas contradictorias; si la regla falla, el producto no cumple su propósito | Porcentaje de casos del flujo principal (CP-01…CP-08 y CP-18) que pasan sin defectos abiertos | 100 % | Ejecución de los casos de BH-28 sobre la versión integrada | Por recoger (0 de 18 casos ejecutados). Evidencia preliminar: regla re-verificada al confirmar e índice único de respaldo (B-01 y B-02 cerradas) |
| A2 — Usabilidad de los estados | Un docente debe distinguir PENDIENTE de CONFIRMADA sin ambigüedad; la confusión es el modo de falla central del caso | Cantidad de mensajes o etiquetas que presenten una solicitud pendiente como confirmada | 0 | Lista de observación sobre los estados de la pantalla (CP-09), contrastada con la tabla de mensajes del contrato (BH-11, sección 10.4) | Por recoger (CP-09 pendiente). Evidencia preliminar: cada estado tiene etiqueta y texto propios en la tabla de mensajes |
| A3 — Confiabilidad ante datos inválidos | Datos mal cargados no deben producir reservas rotas ni caídas del servicio | Cantidad de casos negativos que producen error 500 o persistencia indebida | 0 de los casos CP-12, CP-13, CP-14 y CP-17 | Ejecución de la suite de casos negativos | Por recoger. Evidencia preliminar: los manejadores devuelven 4xx/500 con mensaje uniforme y sin volcar trazas (BH-09, sección 6) |
| A4 — Mantenibilidad de la regla central | Si la regla vive en muchos lugares, cualquier cambio la rompe; el equipo debe poder modificarla sin efectos colaterales | Cantidad de puntos del código que implementan la lógica de la regla, más casos que la cubren | 1 lógica de servicio + 1 índice de BD de respaldo; cobertura por CP-02, CP-03 y CP-18 | Revisión de código y trazabilidad con los casos de prueba | Verificado por inspección el 05/10/2026: la regla está en `review_request` (capa de servicio) con el índice `uq_confirmed_request_slot` como respaldo |

## 3. Interpretación y mejora propuesta

- **A4 es el único indicador con dato a la fecha** y se cumple: la regla está en un único punto de la capa de servicio, con respaldo en la base de datos y decisiones registradas (ADR-002).
- **A1, A2 y A3 dependen de la ejecución de las pruebas.** Mientras los CP sigan en 0, los tres indicadores quedan "sin dato", y esa es la principal deuda de calidad del proyecto: el 15 % de la rúbrica (calidad y pruebas) y la condición mínima de evidencias quedan sostenidos por esta ejecución.
- **Mejora que se probará:** ejecutar la suite completa de BH-28 al cierre de la Etapa 4 y publicar en este documento la columna "Dato" con los valores obtenidos, incluyendo al menos dos regresiones (CP-02 y CP-18). El criterio de verificación es que el resumen del informe final (BH-27) cierre con los tres indicadores en meta o con la causa de su desvío.

---

## Referencias normativas

- ISO/IEC 25010:2011 — Modelos de calidad de sistemas y software.
- Consigna de la cátedra, sección 15 (Evaluación de calidad) y sección 21, entregable 11.
- `02_Requisitos_Backlog/01_Requisitos.md` (BH-05), sección de requisitos no funcionales.
- `05_Pruebas/01_Plan_y_casos_de_prueba.md` (BH-28).
