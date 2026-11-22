# S14a — Leé y descubrí, Eco de palabras y Caza errores

## Contexto

S13 dejó el marco del entrenamiento y los 8 juegos de la prioridad 1. Este slice suma los 3 juegos principales que faltan, todos de primario:

- **Leé y descubrí** (comprensión lectora)
- **Eco de palabras** (correspondencia sonido-letra)
- **Caza errores** (reconocimiento visual)

Con estos tres quedan cubiertas las 14 combinaciones bloque-nivel. S14b suma los complementarios: Memopalabras, Ojo de lince y Lluvia.

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `lib/entrenamiento/juegos.ts`, que tiene las fichas;
- los juegos de S13 en `components/entrenamiento/juegos/`. Son el modelo de estructura, estilo y accesibilidad: `planeta.tsx` y `rompe.tsx` son los más parecidos a lo que viene.

Lo que dice este prompt manda sobre el mockup y sobre `docs/banco-entrenamientos.md`.

**La parte visual sigue siendo prioridad.** Cada juego tiene que estar a la altura de los de S13:
- los colores del bloque (`COLOR_BLOQUE`);
- animaciones de Motion, con su alternativa para `prefers-reduced-motion`;
- contenedores redondeados con sombra;
- Lex reaccionando a cada intento.

No hace falta ninguna migración. No cambies `bancos.json` salvo para corregir un error real, y avisá si lo hacés.

## 1. Lógica común nueva

- **`lib/entrenamiento/seleccion.ts`.** Puntaje de los juegos en los que se marcan varios elementos y se corrige al final. Lo usan Caza errores en este slice y Memopalabras, Ojo de lince y Lluvia en S14b.
  - `puntajeSeleccion({ objetivos, marcados })` devuelve `{ encontrados, equivocados, omitidos, correctas, total }`, con `correctas = encontrados` y `total = objetivos + equivocados`. Así, marcar todo no da 100 %.
  - Los objetivos y los marcados se identifican por índice, no por texto: una oración puede repetir una palabra.
  - Va con pruebas.
- **Juegos sin reintento.** Caza errores no tiene reintento: es un juego de selección que se corrige al tocar "Listo", como las cuadrículas.
  - Cada ronda se resuelve con `resolver(perfecta)`: acierto si encontró todo sin marcas equivocadas; si no, respuesta.
  - El evento `fin` lleva `correctas` y `total` sumados con `puntajeSeleccion`, no la cuenta de rondas perfectas.
  - Si hace falta, ampliá `useRondas` o el evento `fin` para que un juego entregue su propio resultado, sin romper los juegos de S13.
- **Disponibles.** Sumá los tres juegos a `JUEGOS_DISPONIBLES` y a `COMPONENTES_JUEGO`, y actualizá el comentario de `presentacion.ts`.

## 2. Leé y descubrí (comprensión lectora, primario)

**Banco:** `bancos.lee.primario[grado]`, con 6 historias por grado. Cada historia trae `{ id, titulo, parrafos[], preguntas[] }`, y cada pregunta trae `{ pregunta, correcta, otras[2] }`. Hay 3 preguntas por historia en los grados 1 y 2, y 4 en el grado 3.

**Partida:** 2 historias al azar, sin repetir.
- La ronda es la **pregunta**, no la historia. `armarPartida` aplana las dos historias en una lista de preguntas (`{ id: "LEE-2-03-p2", historia, pregunta, esPrimera }`), así `useRondas` y el reintento funcionan sin cambios.
- La barra del marco dice "Pregunta 3 de 6" (u "8 de 8" en el grado 3). Resolvelo con una unidad de progreso propia del juego, sin cambiar `partida` de la ficha.

**Flujo** (cambio de la validación del 19/11):
1. **Lectura.** Antes de la primera pregunta de cada historia hay una pantalla de lectura:
   - título, la etiqueta "Historia 1 de 2" y los párrafos en una tarjeta cómoda para leer: letra grande, interlineado amplio, unos 60 caracteres por línea, sin desplazamiento horizontal en 375 px;
   - un botón grande "Ya la leí";
   - sin audio de la historia (se descartó: lo que se mide es la lectura) y sin tiempo límite.
   - El texto sigue el switch "A a".
2. **Preguntas.** Después, las preguntas en otra pantalla, **sin poder volver a la historia**: no hay botón para verla ni se muestra el texto.
   - Cada pregunta tiene 3 opciones (la correcta y las 2 `otras`), en orden al azar fijo por pregunta. Son botones anchos, uno debajo del otro.
   - Reintento de `rondas.ts`.
   - Al mostrar la respuesta, la correcta queda en verde.
3. Al terminar las preguntas de la primera historia, viene la lectura de la segunda.

- **Personaje:** durante la lectura, Lex en pose `pensando` con frases como "Leé con calma" o "Tomate tu tiempo". Sumá un momento `lectura` a las frases de `presentacion.ts` si hace falta.
- **Detalle:** el `detalle` de la partida suma, por historia, el tiempo de lectura (desde que se muestra hasta "Ya la leí"). Sirve para el seguimiento y no cuenta para el puntaje.

**Pruebas:**
- el banco: 6 historias por grado, 3 o 4 preguntas, 2 `otras` distintas de la correcta;
- el aplanado de `armarPartida`.

**Porcentaje:** respuestas correctas / preguntas de la partida (6, 6 y 8).

## 3. Eco de palabras (correspondencia sonido-letra, primario)

**Banco:** `bancos.eco.primario[grado]`, con 15 palabras por grado. La partida es de 5.

**Pantalla:**
- **Arriba:** un "Escuchar" grande con 3 reproducciones por palabra (2 + 1 por la regla de los audios con límite). La palabra no se muestra.
- **Respuesta:** un renglón grande con lo que va escribiendo el niño, letra por letra, con un cursor que titila (fundido con reducir movimiento). Sigue el switch "A a".
- **Teclado en pantalla** (validación del 19/11):
  - letras grandes con la Ñ (27 letras), en filas que entren en 375 px;
  - **distribución QWERTY española por defecto** (Q W E R T Y U I O P / A S D F G H J K L Ñ / Z X C V B N M), con un switch chico encima del teclado, "QWERTY / ABC", para pasar a orden alfabético;
  - la elección del switch se recuerda en el dispositivo (`localStorage`, con try/catch: si falla, vuelve a QWERTY);
  - al cambiar de distribución, las teclas se reacomodan con una animación de layout (fundido con reducir movimiento), sin borrar lo escrito;
  - teclas de al menos 44 px;
  - "Borrar" (la última letra) y "Listo";
  - sin tildes ni mayúsculas aparte: la tecla escribe la letra y el switch decide cómo se ve;
  - sin autocorrector ni sugerencias.
- **Teclado físico:** también se acepta, como alternativa de accesibilidad. Las letras escriben, Retroceso borra y Enter es "Listo".
- **Largo máximo:** el de la palabra más 4.

**Corrección fonológica** (`lib/entrenamiento/eco.ts`, función pura con pruebas):
- `suenaIgual(escrita, palabra)` compara las dos después de normalizarlas.
- **Normalización:**
  - minúsculas y sin tildes;
  - `güe/güi` → `gue/gui` con u que suena: un marcador interno, para que no se confunda con `gue/gui`;
  - `h` muda fuera de `ch`;
  - `v` → `b`;
  - `z` y `c` delante de e, i → `s`;
  - `qu`, `k` y `c` delante de a, o, u o de una consonante → `k`;
  - `ll` → `y`, e `y` al final → `i`;
  - `g` delante de e, i → `j`, y `gue/gui` → `g` dura;
  - `nb` → `mb`.
- **Cuenta como bien** una escritura que suena igual (bentana, kamiza, jirafa / girafa). No se exigen tildes.
- **Cuenta como error** todo lo que cambia el sonido: omisiones, agregados, inversiones, `r` por `rr` en el medio (pero / perro) y cambios de letra.
- **Pruebas:** con al menos los ejemplos de este punto, todas las palabras del banco contra sí mismas, y los casos que tienen que fallar.

**Después de "Listo":**
- Se aplica el reintento de `rondas.ts`. En el reintento se borra lo escrito y, si no le quedan reproducciones, se le suma una.
- **Siempre se muestra cómo se escribe** (validación del 19/11):
  - si acertó escribiéndola igual: "¡Bien!" y la palabra en verde;
  - si acertó con una escritura que suena igual: "¡Bien! Se escribe así:" y la palabra bien escrita, resaltando las letras que cambian;
  - al mostrar la respuesta: la palabra bien escrita.
- **Detalle:** guarda lo que escribió el niño en cada intento.

**Porcentaje:** palabras bien (con la regla fonológica) / 5.

## 4. Caza errores (reconocimiento visual, primario)

**Banco:** `bancos.caza.primario[grado]`, con 20 o 21 oraciones por grado. Cada ítem trae `{ id, oracion, errores }`, donde `errores` es `{ palabra mal escrita: palabra correcta }`. La partida es de 5 oraciones.

**Pantalla:**
- **Arriba:** "En esta oración hay 1 palabra mal escrita" (o "2 palabras"), con una lupa (🔎) y el color del bloque (celeste fuerte).
- **La oración:**
  - Cada palabra es un botón grande, con salto de línea natural y sin desplazamiento horizontal en 375 px. La puntuación queda pegada visualmente pero fuera de la palabra comparable: "tarde." marca "tarde".
  - Tocar una palabra la marca (subrayado ondulado y fondo suave) y tocarla otra vez la desmarca.
  - Sigue el switch "A a".
- **"Listo":** siempre habilitado. Si no marcó nada, cuenta como 0 encontradas.

**Corrección** (sin reintento):
- **Encontradas:** en verde, con la palabra correcta en una etiqueta chica debajo ("palto → plato").
- **No encontradas:** en ámbar, con su corrección.
- **Marcadas que estaban bien:** en rojo, con ícono, además del color.
- Después aparece "Seguir".

**Pruebas del banco:**
- cada clave de `errores` aparece como palabra de la oración;
- la cantidad de errores es 1 en grado 1, 1 o 2 en grado 2 y 2 en grado 3;
- ninguna corrección es igual a su error.

**Porcentaje:** palabras con error marcadas / (palabras con error + palabras bien escritas marcadas), sumadas en toda la partida, con `puntajeSeleccion`.

## Restricciones

- **Revisión visual:** en 375 px y en escritorio. La app no tiene modo oscuro activo.
- **Movimiento:** con `prefers-reduced-motion`, nada se desplaza. Las animaciones pasan a fundidos.
- **Accesibilidad:**
  - todo se puede hacer con teclado y con lector de pantalla, sin incumplimientos WCAG 2.2 A ni AA;
  - los objetivos táctiles miden al menos 44 px;
  - en Caza errores, cada palabra anuncia si está marcada (`aria-pressed`);
  - en Eco de palabras, el renglón de respuesta es una región que el lector de pantalla lee al cambiar.
- **Texto:** en español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- **Comandos:** de npm, desde cmd y con `--legacy-peer-deps`.
- **Git y base:** no hagas commits ni cambies de rama, y no corras migraciones contra Supabase.
- **Contraseñas:** si necesitás sesión para probar, pedile a Donato que la inicie él en el navegador. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales. Sumá los módulos nuevos de `lib/entrenamiento/` a `coverage.include`.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- Recorrido manual. Podés usar una ruta temporal sin sesión, como en S13b, y borrarla al terminar.
  1. **Leé y descubrí:**
     - la historia, "Ya la leí" y las preguntas sin poder volver;
     - la segunda historia aparece después de las preguntas de la primera;
     - la barra dice "Pregunta N de 6";
     - en 375 px se lee cómodo.
  2. **Eco de palabras:**
     - escribir con el teclado en pantalla y con el físico;
     - el switch QWERTY / ABC cambia la distribución, no borra lo escrito y se recuerda al volver;
     - "bentana" cuenta como bien y muestra cómo se escribe;
     - "betana" va al reintento;
     - el contador de reproducciones baja.
  3. **Caza errores:**
     - marcar y desmarcar;
     - la corrección muestra encontradas, no encontradas y equivocadas;
     - marcar todas las palabras no da 100 %.
  4. **Área del niño y consulta:** los tres juegos ya no dicen "Próximamente".

## Al terminar

Resumí:
- los archivos creados, modificados y borrados;
- las pruebas, con cuántas pasan;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt;
- en `docs/estado-proyecto.md`, el estado de S14a.

No hagas commit.
