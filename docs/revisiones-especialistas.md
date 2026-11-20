# Registro de revisiones con las especialistas

Entregable de la propuesta V8 ("Registro fechado de las revisiones con las especialistas y documento de requerimientos vigente"). Es la evidencia del criterio de cumplimiento del objetivo 1: cada bloque de la evaluación necesita la revisión conforme de las especialistas. También registra la revisión de cada juego del entrenamiento.

Especialistas asesoras: Lic. Mónica Chávez y Lic. Melisa Julieta Spillmann (psicopedagogía).

**Cómo se completa:** después de cada reunión, quien asistió agrega una fila a la tabla de reuniones y actualiza el estado de lo revisado. Fechas en dd/mm/aaaa. Si una corrección genera un cambio en el código, se anota el slice o el PR.

## Reuniones

| Fecha | Asistentes | Qué se revisó | Resultado y correcciones pedidas | Slice o PR |
| --- | --- | --- | --- | --- |
| 04/09/2026 | Equipo, Lic. Chávez | Definición del proyecto | El profesional pasa a ser el usuario principal y toma la evaluación | — |
| _Completar_ | | Validación de la evaluación (etapa 3, cuatro semanas): bloques de ambos niveles | | Etapa 3 |
| 14/10/2026 | Equipo, Lic. Chávez | Definición del proyecto | El niño entrena siempre acompañado; denominación rápida se suma a primeros lectores; el perfil del niño no muestra resultados | S9, S10 |
| 28/10/2026 | Equipo, director | Definición del proyecto | El tutor accede por un informe a pedido por correo; los cortes de las franjas se fijan por revisión bibliográfica, provisorios | S11, S17 |
| 19/11/2026 | _Completar_ | Validación del mockup de entrenamientos: mapa de juegos y diseño de cada juego | Se aprobó el mapa de juegos. Observaciones generales y cambios por juego en "Reunión del 19/11/2026" | S12, S13a, S13b, S14 |
| 26/11/2026 | | Juegos del entrenamiento | | S13, S14 |
| 03/12/2026 | | Juegos del entrenamiento | | S14 |

### Reunión del 19/11/2026: validación del mockup de entrenamientos

Se aprobó el mapa de juegos (14 juegos, al menos uno por bloque y nivel; catálogo en `lib/entrenamiento/juegos.ts`).

Observaciones generales (se aplican a todos los juegos desde S13a):

- **Audio solo al tocar**, con **1 s de silencio** antes de cada audio (a veces se oía la palabra cortada). Nada suena solo al cargar una pantalla ni al empezar una ronda.
- **Un reintento**, que **cuenta como error**: si el primer intento falla, se avisa sin mostrar la respuesta; si el reintento acierta, la ronda cuenta como error; si vuelve a fallar, se muestra la respuesta correcta y se sigue.
- **Un audio a la vez**: tocar otro audio corta el anterior, y salir de la pantalla también.
- **Switch MAYÚSCULA / minúscula** ("A a") para todo el texto del área de juego, recordado por niño.
- **Prioridad de lo visual**: colores, Lex y Lumo, animaciones y contenedores cuidados.

Los cambios por juego se aplican en S13a (Detective de sonidos, Rima y Palmas), S13b y S14. Cambio de diseño en **Rima, grado 3**: los distractores ya no riman ni en asonante. Los audios con límite de reproducciones suman una más que en el mockup, porque ya no hay reproducción automática.

## Conformidad de la evaluación (objetivo 1)

| Nivel | Bloque | Última revisión | Conforme |
| --- | --- | --- | --- |
| Pre-lectores | Discriminación auditiva | | |
| Pre-lectores | Conciencia fonológica | | |
| Pre-lectores | Conciencia silábica | | |
| Pre-lectores | Memoria auditiva | | |
| Pre-lectores | Denominación rápida | | |
| Primeros lectores | Discriminación auditiva | | |
| Primeros lectores | Conciencia fonológica | | |
| Primeros lectores | Conciencia silábica | | |
| Primeros lectores | Memoria auditiva | | |
| Primeros lectores | Denominación rápida (rediseñado) | | |
| Primeros lectores | Comprensión lectora | | |
| Primeros lectores | Correspondencia sonido-letra | | |
| Primeros lectores | Reconocimiento visual | | |
| Primeros lectores | Lectura de pseudopalabras | | |

## Conformidad de los juegos (objetivo 3)

Una fila por combinación bloque-nivel. Un mismo juego puede cubrir un bloque en los dos niveles, con contenido propio de cada uno.

| Nivel | Bloque | Juego | Grados revisados | Última revisión | Conforme |
| --- | --- | --- | --- | --- | --- |
| Pre-lectores | Discriminación auditiva | Detective de sonidos | 1 a 3 (mockup) | 19/11/2026 | Diseño aprobado; banco en revisión |
| Pre-lectores | Conciencia fonológica | Rima | 1 a 3 (mockup) | 19/11/2026 | Diseño aprobado; banco en revisión |
| Pre-lectores | Conciencia silábica | Palmas | 1 a 3 (mockup) | 19/11/2026 | Diseño aprobado; banco en revisión |
| Pre-lectores | Memoria auditiva | Memotono | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Pre-lectores | Denominación rápida | Nombrá rápido · ¡Rápido, tocalo! | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Discriminación auditiva | Detective de sonidos | 1 a 3 (mockup) | 19/11/2026 | Diseño aprobado; banco en revisión |
| Primeros lectores | Conciencia fonológica | Rima | 1 a 3 (mockup) | 19/11/2026 | Diseño aprobado; banco en revisión |
| Primeros lectores | Conciencia silábica | Rompe y une | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Memoria auditiva | Memotono | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Comprensión lectora | Leé y descubrí | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Correspondencia sonido-letra | Eco de palabras | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Reconocimiento visual | Caza errores | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Lectura de pseudopalabras | Palabras de otro planeta | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
| Primeros lectores | Denominación rápida | Nombrá rápido · ¡Rápido, tocalo! | 1 a 3 (mockup) | 19/11/2026 | Mapa aprobado |
