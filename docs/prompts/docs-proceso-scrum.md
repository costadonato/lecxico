Tarea de documentación del proceso. No toca código de la app ni la base de datos.
Rama sugerida: docs-proceso-scrum. No hagas commits, no cambies de rama, no hagas push.

Contexto: el equipo trabaja con Scrum adaptado. Sprints de duración variable hasta el 14/10/2026
(cada uno cierra con una revisión con las especialistas) y semanales desde el 12/11/2026.
Los slices (S6, S8…) son ítems del Product Backlog, identificados como PB-01 a PB-50.
El Product Backlog y el registro de sprints viven fuera del repo, en el documento
"Lecxico — Artefactos Scrum del trabajo final" y la planilla "Lecxico — Product Backlog e incrementos".

1. Plantilla de PR. Creá `.github/pull_request_template.md` con:
   - **Ítem del backlog:** PB-xx · **Sprint:** N · **Slice:** sNN-nombre
   - **Qué cambia** (2 o 3 líneas)
   - **Migración:** número o "ninguna"
   - **Definición de Hecho** (checklist):
     - [ ] `npm run build` pasa y `npx tsc --noEmit` no da errores
     - [ ] Pruebas de Vitest pasan (80 % de líneas y 90 % de ramas en los módulos de lógica)
     - [ ] Migración probada en Postgres local con sus escenarios de acceso indebido
     - [ ] Probado en la app con un profesional y un niño de prueba
     - [ ] `docs/estado-proyecto.md` actualizado
     - [ ] Revisado por el otro integrante
     - [ ] Si toca un ejercicio o un juego: revisión registrada en `docs/revisiones-especialistas.md`

2. CLAUDE.md.
   - En "Cómo trabajamos", agregá: "Cada slice corresponde a un ítem del Product Backlog (PB-xx) y a un
     sprint (Sprint N). El nombre del slice (S8, S9…) no es el número de sprint."
   - En "Al terminar, resumí", agregá un punto 5: "Ítem PB-xx y Sprint N, y qué casillas de la
     Definición de Hecho quedaron sin cumplir."

3. docs/revisiones-especialistas.md, tabla "Reuniones". Dejala en este orden, con fechas dd/mm/aaaa.
   Eliminá la fila "_Completar_". No toques las filas del 26/11 y del 03/12, ni la sección
   "Reunión del 19/11/2026" que está debajo de la tabla.
   | 14/08/2026 | Equipo, especialistas | Evaluación de ambos niveles, revisión general | Algunos cambios pedidos se revirtieron después | Etapa 1 |
   | 27/08/2026 | Equipo, Lic. Chávez | Evaluación bloque por bloque | Conteo de sílabas: palabras de 2 sílabas en vez de 1. Evitar pares con la misma sílaba inicial (sol/sopa). Recordar el orden: máximo 2 reproducciones y secuencias de largo progresivo. "Memoria fonológica" pasa a "Memoria auditiva". Construir la palabra: una de 2 y una de 3 sílabas. Pseudopalabras más cortas y de sílabas simples. Audio en el texto de comprensión lectora. Palabras más cortas en reconocimiento visual | PR #3 |
   | 04/09/2026 | Equipo, Lic. Chávez | Definición del proyecto | El profesional pasa a ser el usuario principal y toma la evaluación | PR #4, PR #5 |
   | 14/10/2026 | Equipo, Lic. Chávez, Lic. Spillmann | Evaluación completa (la revisión más profunda) y definición del proyecto | Muchas correcciones a denominación rápida. El niño entrena siempre acompañado; denominación rápida se suma a primeros lectores; el perfil del niño no muestra resultados. Se planteó que el tutor no viera nada desde la cuenta del niño | S9, S10 |
   | 23/10/2026 | Equipo, director | Cambios de requerimientos | Se congelan los requerimientos en la definición vigente; los cambios posteriores pasan a trabajo futuro | Propuesta |
   | 28/10/2026 | Equipo, director | (dejá el contenido actual) | (dejá el contenido actual) | S11, S17 |
   | 19/11/2026 | Equipo, Lic. Chávez | (dejá el contenido actual) | Agregá al final: "La especialista se lleva el mockup para revisarlo y envía correcciones específicas hasta el 25 o 26/11." | (dejá el contenido actual) |

4. docs/prompts/README.md. Rehacé la tabla con todos los archivos que hay hoy en `docs/prompts/`
   (salvo el README), con su slice y su responsable según el historial de git. Si la tabla nombra
   un archivo que no existe (por ejemplo `estilos-evaluacion.md`), sacalo de la tabla y avisalo en
   el resumen.

5. docs/estado-proyecto.md. Al principio de "Plan de slices", agregá: "Calendario de sprints y
   artefactos Scrum: documento 'Lecxico — Artefactos Scrum del trabajo final'. Sprints de duración
   variable hasta el 14/10/2026 y semanales desde el 12/11/2026."

6. Guardá este mismo prompt en `docs/prompts/docs-proceso-scrum.md` y sumalo a la tabla del punto 4.

Al terminar, resumí los archivos creados y modificados, y cualquier cosa que no hayas podido hacer.
