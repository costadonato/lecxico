# S13a — Marco del entrenamiento, áreas y primeros juegos

## Contexto

Lecxico ya tiene la evaluación completa. Este slice construye el **entrenamiento**: el marco común de los juegos, el área del niño (práctica en casa y tareas), el modo en consulta del profesional y los tres primeros juegos (Detective de sonidos, Rima y Palmas). S13b suma Memotono, Rompe y une, Palabras de otro planeta, Nombrá rápido y ¡Rápido, tocalo!. S14 suma el resto y las misiones.

Leé antes `CLAUDE.md` y `docs/estado-proyecto.md`. El diseño de los juegos está validado con las especialistas: lo que dice este prompt manda sobre el mockup y sobre los juegos heredados de `components/games/`.

**La parte visual es prioridad de las especialistas.** El entrenamiento tiene que verse lindo, con colores, Lex y Lumo, animaciones y contenedores cuidados, en línea con los estilos que ya tiene la app (`app/globals.css`, `components/motion/`, `components/personajes/`). No es una pantalla de formulario: es un juego para chicos de 4 a 8 años.

## Archivos que ya vienen hechos (no los reescribas)

Vienen en el zip de este slice. Revisalos, pero no cambies su contenido salvo para corregir un error real, y avisá si lo hacés.

- `supabase/migrations/0008_s12_entrenamiento.sql`: tablas `entrenamiento_juego`, `entrenamiento_tarea`, `entrenamiento_tarea_item` y `entrenamiento_partida`; la columna `ninos.letra_entrenamiento`; las funciones `grados_habilitados`, `guardar_partida`, `crear_tarea`, `cancelar_tarea` y `cambiar_letra_entrenamiento`; y el borrado de la tabla heredada `entrenamientos`. Leé su encabezado: tiene todas las reglas.
- `supabase/tests/0008_entrenamiento.sql`: 55 escenarios, todos pasan. `supabase/tests/0005_s8_contrasena_tutor.sql` cambió en el escenario 8, porque la tabla `entrenamientos` ya no existe.
- `lib/entrenamiento/juegos.ts`: catálogo de los 14 juegos, con nivel, bloque, tamaño de partida, consigna y qué cambia en cada grado, más `porcentaje` y `gradoTrasPartida`.
- `lib/entrenamiento/bancos.json`: contenido de todos los juegos (borrador del 19/11, en revisión por las especialistas), el mapa `dibujos` (palabra → archivo) y `emojis` (emoji → archivo).
- `public/emoji/*.webp`: 217 dibujos de Fluent Emoji 3D (Microsoft, licencia MIT), de 160 px.

No corras la migración contra Supabase. La aplica Donato en el SQL Editor el mismo día del merge.

## Qué construir

### 1. Datos y lógica (`lib/entrenamiento/`)

- **`bancos.ts`.** Acceso tipado a `bancos.json`:
  - `itemsDe(juego, nivel, grado)`;
  - `elegirPartida(items, n)`, que mezcla y toma `n` sin repetir;
  - `tieneDibujo(palabra)` y `rutaDibujo(palabra)`.

  Un ítem que usa una palabra sin dibujo se descarta al armar la partida. Hoy les pasa a capa, tapa, cuna, ola, lana, nota, tela, cono y goma, que están en `a_generar`.
- **`rondas.ts`.** Lógica pura de una partida, como reductor y sin React:
  - **Primer intento correcto:** la ronda cuenta como correcta.
  - **Primer intento incorrecto:** se avisa sin mostrar la respuesta y se permite **un** reintento.
  - **Reintento:** si acierta, la ronda cuenta como **error**. Si vuelve a fallar, se muestra la respuesta correcta y se sigue.
  - **Detalle de cada ronda:** `{ item, correcta, intentos }`, para la columna `detalle` de la partida.
  - Exporta `correctas`, `total` y `detalle` al terminar.
- **`partidas.ts`.** Envoltorio de `supabase.rpc("guardar_partida", …)` y de `grados_habilitados`, con tipos y mensajes de error para mostrar al usuario.
- **`audio.ts` y `use-audio.ts`.** Un único reproductor para toda la app. Reglas de la validación:
  - **Nada suena solo.** Un audio suena únicamente al tocar un botón: nunca al cargar una pantalla, ni al empezar una ronda o una partida.
  - **Un segundo de silencio** antes de cada audio (a veces se oía la palabra cortada).
  - **Un audio a la vez.** Tocar otro audio corta el que estaba sonando, y salir de la pantalla también (limpiá en el desmontaje y al cambiar de ruta).
  - **Por ahora, voz del navegador.** Usá `speechSynthesis` en español, en este orden de preferencia: es-AR, es-US, es-419, es-MX y cualquier es. Dejá preparado un punto de entrada para reproducir archivos (`public/audio/manifest.json`, texto → archivo) que hoy está vacío: más adelante se generan con voces de Azure, y si hay archivo para un texto, se usa el archivo.
  - Exponé `decir(texto, { velocidad })`, `detener()` y `hablando`.
- **Pruebas de Vitest:**
  - `rondas.test.ts`: todos los casos del reintento.
  - `juegos.test.ts`: los códigos coinciden con la lista de la 0008; cada bloque existe en `BLOQUES_POR_NIVEL`; `gradoTrasPartida` y `porcentaje`.
  - `bancos.test.ts`: cada palabra con dibujo tiene su archivo en `public/emoji/`; cada grado de cada juego tiene al menos los ítems de una partida, contando solo los que tienen dibujo.

  Sumá estos módulos a `coverage.include` en `vitest.config.mts`.

### 2. Componentes comunes (`components/entrenamiento/`)

- **`marco-juego.tsx`** maneja el flujo **consigna → jugando → final**:
  - **Encabezado en píldora**, como `MarcoEvaluacion`: el icono del juego (`<Emoji>`), su nombre, chips de bloque, grado y modo ("En consulta", "Tarea" o "Práctica"), el switch "A a" y "Salir". Salir pide confirmación con `ConfirmarDialog`: "La partida se descarta y no queda registrada".
  - **Barra de progreso** ("Palabra 3 de 8"), con la unidad que define el catálogo.
  - **El personaje del juego** (`JUEGOS[codigo].personaje`) con las poses nuevas de `lib/personajes.ts`, según el momento:
    - `explicando` en la consigna;
    - `pensando` mientras espera la respuesta;
    - `festejando` en un acierto;
    - `alentando` en un error.

    Lleva un globo con frases cortas que varían ("¡Muy bien!", "¡Eso es!" / "Casi. Probá otra vez." / "Era esta. ¡Seguimos!"). En celular el personaje va chico, arriba del área de juego. En escritorio va al costado.
  - **Pantalla de consigna:** tarjeta grande con la consigna, "Escuchar la consigna" (`BotonEscuchar`) y "Comenzar". El profesional ve además qué cambia en ese grado.
  - **Pantalla final del niño:**
    - personaje festejando y un mensaje de cierre, **sin porcentaje ni aciertos**: el niño nunca ve resultados;
    - si la partida desbloqueó un grado nuevo: "¡Desbloqueaste el grado N!", con una animación de premio;
    - botones "Jugar otra vez" y "Volver al entrenamiento".
  - **Pantalla final del profesional:** correctas sobre total y porcentaje (tiempo y errores en los juegos que los miden), y el grado habilitado en casa.
  - **Guardado:** la partida se guarda al llegar al final, con un estado "Guardando…". Si falla, se muestra el error y "Reintentar". Una partida abandonada no se guarda.
- **`boton-escuchar.tsx`:** botón grande con icono de parlante. Con `max`, el rótulo dice cuántas veces queda ("Escuchar (2)") y al llegar a cero pasa a "Sin más reproducciones". Mientras suena, se anima. Los audios con límite tienen **una reproducción más** que en el mockup, porque ya no hay reproducción automática.
- **`opcion-dibujo.tsx`:** botón de opción con el dibujo (`<Dibujo>`) y, si hace falta, su propio botón de audio **al lado, no adentro**. Estados normal, elegido, correcto (verde, pequeño rebote) e incorrecto (rojo suave, sacudida corta). Mínimo 44 px de alto, `aria-label` con la palabra y foco visible.
- **`dibujo.tsx`:** `<Dibujo palabra="vaca" />` y `<Emoji char="🍌" />`, que muestran el WebP de Fluent (`next/image`, `unoptimized`). Usá `alt` con la palabra, salvo en las opciones que ya tienen `aria-label`.
- **`switch-letra.tsx` y `proveedor-letra.tsx`:**
  - El switch muestra "A a" y cambia entre MAYÚSCULA y minúscula todo el texto del área de juego, con `text-transform` sobre un contenedor con `data-letra`.
  - Arranca con `ninos.letra_entrenamiento` y al cambiar llama a `cambiar_letra_entrenamiento`.
  - Está en el área del niño y en el modo en consulta. No afecta a la evaluación.
- **`tarjeta-juego.tsx`:**
  - Tarjeta del juego en las áreas: icono grande, nombre, bloque y tres botones de grado.
  - **Niño:** los grados no habilitados tienen candado y no se pueden tocar. El grado alcanzado se ve con estrellas, nunca con porcentajes.
  - **Profesional:** los tres grados están libres y una línea indica qué grado tiene habilitado el niño en casa.
- **Colores por bloque**, siempre los mismos, con los tokens de `globals.css`:

  | Bloque | Color |
  |---|---|
  | Discriminación auditiva | celeste |
  | Conciencia fonológica | lavanda |
  | Conciencia silábica | mandarina |
  | Memoria auditiva | menta |
  | Comprensión lectora | sol |
  | Correspondencia sonido-letra | rojo |
  | Reconocimiento visual | celeste-fuerte |
  | Lectura de pseudopalabras | lavanda-fuerte |
  | Denominación rápida | sol-fuerte |

  Usá las versiones `-suave` para los fondos y las `-fuerte` para el texto.

### 3. Rutas

- **`/entrenamiento`, del niño.** Reemplaza la página heredada.
  - Bienvenida con Lex (`volando` o `explicando`) y el switch de letra.
  - **"Tareas de tu profesional"**, si hay tareas pendientes: cada una lista sus juegos con el grado y un botón para jugar. Una tarea hecha desaparece.
  - **Juegos del nivel**, agrupados por bloque en el orden de la evaluación (`BLOQUES_POR_NIVEL`), con el principal primero. No aparecen los juegos de solo consulta.
  - El nivel sale de la etapa escolar (`nivelParaEtapa`).
  - Solo para el rol niño. Un profesional que entra va a `/dashboard`.
- **`/entrenamiento/jugar/[juego]?grado=N&tarea=<id>`, del niño.**
  - Sin `tarea`, el origen es práctica: si el grado no está habilitado, redirige a `/entrenamiento`.
  - Con `tarea`, el origen es tarea, con el grado que fijó el profesional.
- **`/ninos/[id]/entrenamiento`, del profesional (modo en consulta).**
  - Banda "Entrenamiento de Nombre Apellido", como `TestBandaNino`.
  - Todos los juegos del nivel del niño, **incluido Nombrá rápido**, con el grado libre.
  - Solo con vínculo activo. Si no, va a `/ninos`.
  - En `/ninos/[id]`, sumá un botón "Entrenar en consulta" junto a "Evaluar".
- **`/ninos/[id]/entrenamiento/[juego]?grado=N`:** el mismo marco de juego con origen consulta.
- Un juego que todavía no existe (los de S13b y S14) se ve en las áreas como tarjeta deshabilitada con el chip "Próximamente". Usá `components/chip-en-desarrollo.tsx`.

### 4. Los tres primeros juegos (`components/entrenamiento/juegos/`)

Cada juego recibe `{ nivel, grado, items, onRonda, letra }` y usa `rondas.ts`. El marco no sabe nada de la mecánica.

- **Detective de sonidos** (inicial y primario):
  - Un botón grande "Escuchar" (máximo 3 reproducciones) y tres dibujos: la palabra y sus dos distractores, en orden al azar.
  - El niño toca el dibujo que escuchó, con el reintento de `rondas.ts`.
  - Las opciones **no tienen audio**.
- **Rima:**
  - **Inicial:** arriba, el estímulo con su dibujo y su botón de audio. Abajo, tres opciones con dibujo, cada una con su audio al lado.
  - **Primario:** palabras escritas sin dibujo. Solo el grado 1 tiene audio (en el estímulo y en las opciones). Los grados 2 y 3 no tienen audio.
  - Pregunta: "¿Qué rima con ___?".
- **Palmas** (inicial):
  - Se ven el dibujo y "Escuchar".
  - El niño toca un tambor grande una vez por sílaba: cada toque suma un punto visible y hace una animación de golpe. Hay un botón "Borrar" y otro "Listo".
  - Al tocar "Listo" se compara con `silabas` y se aplica el reintento.
  - Accesible con teclado: Enter o Espacio sobre el tambor.

Las partidas toman `JUEGOS[c].niveles[nivel].partida[grado]` ítems de `bancos.json`.

### 5. Lo que se retira

- Borrá los juegos y pantallas heredados del prototipo:
  - `app/games/`, `app/exercise/` y `components/games/`;
  - `components/daily-challenge-card.tsx`, `teen-start-card.tsx`, `child-tutorial-modal.tsx`, `achievement-badge.tsx` y `exercise-card.tsx`;
  - `components/lex-speaker.tsx` y `lib/game-generators*`.

  **Antes de borrar cada archivo, buscá quién lo importa.** Si algo fuera de esas carpetas lo usa, adaptalo o avisá.
- Si después de eso `npx tsc --noEmit` da **0 errores**, poné `ignoreBuildErrors: false` en `next.config.mjs` y anotalo en `docs/estado-proyecto.md`. Si quedan errores, no lo toques y listalos.
- **`lib/ninos/detalle.ts` y `/ninos/[id]`:** la sección "Historial de entrenamientos" pasa a leer `entrenamiento_partida`. Muestra las últimas 20 partidas con fecha, juego (nombre del catálogo), grado, origen (Consulta, Tarea o Práctica) y resultado (correctas / total y porcentaje). El contador de la tarjeta usa el total.

### 6. Documentación

- **`docs/estado-proyecto.md`:**
  - S12 queda "Migración escrita y probada (0008)" y S13a "En revisión".
  - Actualizá el modelo de datos (las 4 tablas nuevas y `ninos.letra_entrenamiento`), la tabla de RLS, las funciones, la tabla de migraciones (0008 pendiente de aplicar), las rutas y la sección "Entrenamiento".
  - Sacá de pendientes la tabla `entrenamientos` y las páginas heredadas.
- **`docs/revisiones-especialistas.md`:** registrá la reunión del 19/11, validación del mockup de entrenamientos. Se aprobó el mapa de juegos. Las observaciones generales fueron:
  - audio solo al tocar y con 1 s de silencio;
  - un reintento, que cuenta como error;
  - un audio a la vez;
  - switch MAYÚSCULA / minúscula;
  - prioridad de lo visual.

  Los cambios por juego se aplican en S13a, S13b y S14. Hubo un cambio de diseño en Rima grado 3: los distractores ya no riman ni en asonante.

## Restricciones

- **Revisión visual:** en 375 px y en escritorio. La app no tiene modo oscuro activo.
- **Movimiento:** con `prefers-reduced-motion`, nada se desplaza. Las animaciones pasan a fundidos.
- **Accesibilidad:** todo se puede hacer con teclado y con lector de pantalla, sin incumplimientos WCAG 2.2 A ni AA. Los objetivos táctiles miden al menos 44 px.
- **Texto:** en español rioplatense, con voseo ("Tocá", "Escuchá"). Ningún texto dice "test": se dice "evaluación".
- **Comandos:** de npm, desde cmd y con `--legacy-peer-deps`.
- **Git y base:** no hagas commits ni cambies de rama, y no corras migraciones contra Supabase.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales.
- `npx tsc --noEmit` no suma errores. Si llegaste a 0, decilo.
- `npm run build` pasa.
- Las pruebas de SQL (`supabase/tests/README.md`): 0005, 0006, 0007 y 0008 pasan sobre las migraciones 0001 a 0008.
- Recorrido manual, con la 0008 aplicada en un Supabase de prueba si lo tenés; si no, describí qué no pudiste probar:
  1. Niño de sala de 5: `/entrenamiento` muestra los juegos de inicial, sin Nombrá rápido y con candado en los grados 2 y 3.
  2. Jugar Detective grado 1 con al menos 7 de 8 desbloquea el grado 2 y lo festeja.
  3. Un error muestra el aviso, deja reintentar y la ronda cuenta como error.
  4. Ningún audio suena solo. Tocar otro audio corta el anterior.
  5. El switch "A a" cambia todo el texto del juego y se recuerda al volver.
  6. Profesional: `/ninos/[id]/entrenamiento` muestra todos los juegos con el grado libre. Una partida en consulta aparece en el historial de `/ninos/[id]`.

## Al terminar

Resumí:
- los archivos creados, modificados y borrados;
- las pruebas, con cuántas pasan;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt.

No hagas commit.
