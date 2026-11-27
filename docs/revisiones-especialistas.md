# Registro de revisiones con las especialistas

Entregable de la propuesta V6.1 ("Registro fechado de las revisiones con las especialistas y documento de requerimientos vigente"). Es la evidencia del criterio de cumplimiento del objetivo 1: cada bloque de la evaluación necesita la revisión conforme de las especialistas. También registra la revisión de cada juego del entrenamiento.

Especialistas asesoras: Lic. Mónica Chávez y Lic. Melisa Julieta Spillmann (psicopedagogía).

**Cómo se completa:** después de cada reunión, quien asistió agrega una fila a la tabla de reuniones y actualiza el estado de lo revisado. Fechas en dd/mm/aaaa. Si una corrección genera un cambio en el código, se anota el slice o el PR.

## Reuniones

| Fecha | Asistentes | Qué se revisó | Resultado y correcciones pedidas | Slice o PR |
| --- | --- | --- | --- | --- |
| 14/08/2026 | Equipo, especialistas | Evaluación de ambos niveles, revisión general | Algunos cambios pedidos se revirtieron después | Etapa 1 |
| 27/08/2026 | Equipo, Lic. Chávez | Evaluación bloque por bloque | Conteo de sílabas: palabras de 2 sílabas en vez de 1. Evitar pares con la misma sílaba inicial (sol/sopa). Recordar el orden: máximo 2 reproducciones y secuencias de largo progresivo. "Memoria fonológica" pasa a "Memoria auditiva". Construir la palabra: una de 2 y una de 3 sílabas. Pseudopalabras más cortas y de sílabas simples. Audio en el texto de comprensión lectora. Palabras más cortas en reconocimiento visual | PR #3 |
| 04/09/2026 | Equipo, Lic. Chávez | Definición del proyecto | El profesional pasa a ser el usuario principal y toma la evaluación | PR #4, PR #5 |
| 14/10/2026 | Equipo, Lic. Chávez, Lic. Spillmann | Evaluación completa (la revisión más profunda) y definición del proyecto | Muchas correcciones a denominación rápida. El niño entrena siempre acompañado; denominación rápida se suma a primeros lectores; el perfil del niño no muestra resultados. Se planteó que el tutor no viera nada desde la cuenta del niño | S9, S10 |
| 23/10/2026 | Equipo, director | Cambios de requerimientos | El equipo congeló los requerimientos en la definición vigente, con la orientación del director; los cambios posteriores pasan a trabajo futuro. | Propuesta |
| 28/10/2026 | Equipo, director | Definición del proyecto | El equipo definió que el tutor accede por un informe a pedido por correo y, por indicación del director, que los cortes de las franjas se fijan por revisión bibliográfica, provisorios. | S11, S17 |
| 19/11/2026 | Equipo, Lic. Chávez | Validación del mockup de entrenamientos: mapa de juegos y diseño de cada juego | Se aprobó el mapa de juegos. Observaciones generales y cambios por juego en "Reunión del 19/11/2026". La especialista se lleva el mockup para revisarlo y envía correcciones específicas hasta el 25 o 26/11. | S12, S13a, S13b, S14 |
| 26/11/2026 | Lic. Chávez, Donato Costa (virtual) | Correcciones específicas de los juegos del entrenamiento tras revisar el mockup | Cinco correcciones a los juegos; ver "Reunión del 26/11/2026: correcciones a los juegos del entrenamiento" | S13, S14 |
| 03/12/2026 | | Juegos del entrenamiento | | S14 |

Los valores de corte de las franjas los fijó el equipo el 23/11/2026 por revisión bibliográfica (docs/valores-de-corte.md). El director indicó el método; no participó en fijar los cortes.

### Reunión del 19/11/2026: validación del mockup de entrenamientos

Se aprobó el mapa de juegos (14 juegos, al menos uno por bloque y nivel; catálogo en `lib/entrenamiento/juegos.ts`).

Observaciones generales (se aplican a todos los juegos desde S13a):

- **Audio solo al tocar**, con **1 s de silencio** antes de cada audio (a veces se oía la palabra cortada). Nada suena solo al cargar una pantalla ni al empezar una ronda.
- **Un reintento**, que **cuenta como error**: si el primer intento falla, se avisa sin mostrar la respuesta; si el reintento acierta, la ronda cuenta como error; si vuelve a fallar, se muestra la respuesta correcta y se sigue.
- **Un audio a la vez**: tocar otro audio corta el anterior, y salir de la pantalla también.
- **Switch MAYÚSCULA / minúscula** ("A a") para todo el texto del área de juego, recordado por niño.
- **Prioridad de lo visual**: colores, Lex y Lumo, animaciones y contenedores cuidados.

Los cambios por juego se aplican en S13a (Detective de sonidos, Rima y Palmas), S13b y S14. Cambio de diseño en **Rima, grado 3**: los distractores ya no riman ni en asonante. Los audios con límite de reproducciones suman una más que en el mockup, porque ya no hay reproducción automática.

### Reunión del 26/11/2026: correcciones a los juegos del entrenamiento

Todas las correcciones son sobre los juegos del entrenamiento; la evaluación no tuvo correcciones nuevas.

| N.º | Corrección | Estado |
| --- | --- | --- |
| 1 | En general, en los juegos, dar una segunda oportunidad al niño cuando no elige la opción correcta. | Pendiente |
| 2 | Detective de sonidos, primeros lectores, grados 2 y 3: escuchar 2 palabras y elegir entre 4 opciones, para sumar dificultad. | Pendiente |
| 3 | Leé y descubrí (juego de comprensión lectora): el texto separado de las preguntas y un cronómetro visible del tiempo de respuesta, sin guardarlo. | Pendiente |
| 4 | Poder cambiar la letra de los juegos entre imprenta mayúscula e imprenta minúscula. | Aplicada (`components/entrenamiento/switch-letra.tsx` y `components/entrenamiento/proveedor-letra.tsx`) |
| 5 | Ojo de lince, grado 3: límite de tiempo para encontrar las letras, 60 segundos por defecto y modificable por el profesional. | Pendiente |

Estado al 27/11/2026; lo confirma el equipo al integrar las correcciones.

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
