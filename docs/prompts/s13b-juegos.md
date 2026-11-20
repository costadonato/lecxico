# S13b — Cinco juegos más y audio sin demora

## Contexto

S13a dejó el marco del entrenamiento, las áreas del niño y del profesional y tres juegos (Detective de sonidos, Rima y Palmas). Este slice suma los otros cinco juegos de la prioridad 1:

- **Memotono**
- **Rompe y une**
- **Palabras de otro planeta**, con una variante para la consulta
- **Nombrá rápido**, solo en consulta, reusando el componente de la evaluación
- **¡Rápido, tocalo!**

También saca el segundo de silencio antes de cada audio.

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`.
- `lib/entrenamiento/juegos.ts`, que es la fuente de cada ficha: nivel, bloque, tamaño de la partida, consigna y qué cambia en cada grado.
- Los tres juegos de S13a (`components/entrenamiento/juegos/`): son el modelo de estructura, estilo y accesibilidad.

Lo que dice este prompt manda sobre el mockup y sobre `docs/banco-entrenamientos.md`.

**La parte visual sigue siendo prioridad.** Cada juego tiene que estar a la altura de Detective y Palmas: los colores del bloque (`COLOR_BLOQUE`), animaciones de Motion con su alternativa para `prefers-reduced-motion`, contenedores redondeados con sombra, y Lex o Lumo reaccionando a cada intento.

No hace falta ninguna migración: la 0008 ya tiene todo. No cambies `bancos.json` salvo para corregir un error real, y avisá si lo hacés.

## 0. Audio sin el segundo de silencio

Donato pidió sacar el segundo de silencio que `decir()` espera antes de cada audio. Se siente lento, y en ¡Rápido, tocalo! y en Memotono no se puede usar.

- **`lib/entrenamiento/audio.ts`:**
  - Sacá `SILENCIO_MS` y la espera.
  - El audio arranca apenas se toca el botón, o apenas carga el manifiesto la primera vez.
  - Se mantienen "un audio a la vez" y "nada suena solo".
- **Si al probar se corta el comienzo de la palabra:** puede pasar en Chrome al llamar `speak()` justo después de `cancel()`. En ese caso dejá un margen técnico mínimo (100 ms como máximo), y solo cuando se cortó un audio anterior. Si lo dejás, documentalo en el encabezado.
- **Este cambio también afecta la evaluación,** porque `useVoz` usa el mismo reproductor.
- **Textos y pruebas:**
  - Actualizá los comentarios de `audio.ts`, `use-audio.ts` y `lib/hooks/use-voz.ts`.
  - Actualizá `audio.test.ts`, que hoy prueba la espera.
  - En `docs/estado-proyecto.md`, anotá que la regla del segundo de silencio se dejó sin efecto el 20/11.
- **Dos agregados al reproductor, que necesitan los juegos de este slice:**
  - **`decir(texto, { alTerminar })`:**
    - Llama a `alTerminar` cuando el audio termina solo, por su `onend` o por el seguro de duración.
    - No lo llama si el audio se cortó con `detener()` o con otro `decir()`.
  - **`decirSecuencia(textos, { pausaMs, dueno, alTerminar })`:**
    - Dice cada texto por separado, en orden y con `pausaMs` entre uno y otro.
    - Cada texto busca su archivo en el manifiesto, así sirve igual cuando lleguen los audios de Azure.
    - Toda la secuencia es un solo turno: `hablando` queda en true de principio a fin, y un `decir()`, un `detener()` o un cambio de ruta la cortan entera.
  - **En `useAudio`:** exponé los dos agregados.
  - **Pruebas:** que `alTerminar` no se llame tras un corte, y que la secuencia respete el orden y la pausa (con timers falsos).

## 1. Cambios comunes

- **Armado de la partida:**
  - Hoy el marco arma la partida con `elegirPartida(itemsDe(...))`. Memotono, Nombrá rápido y ¡Rápido, tocalo! no tienen banco por grado: generan su contenido.
  - Creá `armarPartida(juego, nivel, grado, azar = Math.random)` en `lib/entrenamiento/partida.ts`:
    - para los juegos con banco, hace lo mismo que hoy;
    - para los otros tres, llama a su generador.
  - El marco la usa al empezar. "Este grado todavía no tiene contenido" pasa a depender de que `armarPartida` devuelva una lista vacía.
  - Cada ítem generado lleva un `id` estable y legible, para el `detalle` (por ejemplo `MEM-bota-mono-ojo`).
- **`rondas.ts`: acción `{ tipo: "resolver", correcta }`.**
  - Resuelve la ronda en un solo intento, sin reintento: acierto o respuesta, con `intentos: 1`.
  - La usan Palabras de otro planeta en consulta y ¡Rápido, tocalo!.
  - En `useRondas`, exponela como `resolver(correcta)`.
  - Sumá sus pruebas.
- **Props de los juegos:** sumá `origen` y `modo` a `PropsJuego` (`components/entrenamiento/juegos/tipos.ts`). El marco se los pasa.
- **Resultado con tiempo y errores:**
  - El evento `fin` puede traer `tiempoMs` y `errores` opcionales, y un `detalle` con otra forma (por ejemplo, el de cada cuadrícula de Nombrá rápido).
  - Ampliá los tipos de `ResultadoRondas` / `EventoRonda` sin romper los juegos de S13a.
  - El marco pasa `tiempoMs` y `errores` a `guardarPartida`. La 0008 exige que vayan los dos juntos o ninguno.
- **Pantalla final del profesional:** si la partida trae tiempo y errores, muestra "Tiempo" (formato `m:ss`, con `formatearTiempo` de `lib/test/denominacion.ts`) y "Errores", además de correctas y porcentaje.
- **Disponibles:**
  - Sumá los cinco juegos a `JUEGOS_DISPONIBLES` y a `COMPONENTES_JUEGO`.
  - Actualizá el comentario de `presentacion.ts`.
  - "Próximamente" queda solo para los de S14.
- **Texto del profesional:** en modo profesional, lo que lee o carga el profesional va con `normal-case`: botones Bien / Mal, carga de errores, notas. Solo los estímulos del juego siguen el switch "A a" (como ya hace `FinalProfesional`).

## 2. Memotono (memoria auditiva, inicial y primario)

**Mecánica.** Lumo dice una secuencia de palabras y el niño toca los dibujos de un panel en el mismo orden.

**Generador** (`lib/entrenamiento/memotono.ts`):
- Arma las 6 secuencias de una partida a partir de `bancos.memotono[nivel]`, que es una lista de `{ palabra, silabas, parecidas }`, no un banco por grado.

| Grado | Inicial | Primario | Distractores en el panel | Reproducciones |
|---|---|---|---|---|
| 1 | 2 elementos | 3 palabras de 1 o 2 sílabas | 2, que no se parecen a ninguna de la secuencia | 3 |
| 2 | 3 elementos | 4 palabras de 2 sílabas | 3, uno de ellos `parecida` de una palabra de la secuencia | 2 |
| 3 | 4 elementos | 5 palabras de 2 o 3 sílabas | 4, todos `parecidas` de alguna palabra de la secuencia | 2 |

- **Reglas de cada secuencia:**
  - no repite palabras;
  - no junta dos palabras que sean `parecidas` entre sí;
  - no repite la misma secuencia dentro de la partida.
- **Panel:** la secuencia más los distractores, en orden al azar. Todas las palabras del panel tienen dibujo.
- **Inicial, grado 1:**
  - alterná secuencias de dibujos con secuencias de colores (`bancos.memotono.colores`): 3 y 3;
  - en las de colores, el panel muestra círculos de color, sin palabras, y los distractores son otros colores;
  - en inicial no hay números, en ningún grado.
- **Pruebas** con muchas semillas: largo, sílabas en primario, cantidad y tipo de distractores, sin repetidos, y todo con dibujo.

**Pantalla:**
- **Botón grande "Escuchar la secuencia (N)":**
  - usa `decirSecuencia`, con una pausa de 900 ms en inicial y 700 ms en primario;
  - las reproducciones son las de la tabla;
  - nada suena solo.
- **Panel:**
  - Queda deshabilitado (atenuado, con el texto "Primero escuchá la secuencia") hasta que termina la primera reproducción (`alTerminar`).
  - Cada toque pone en el dibujo una insignia con su número de orden (1, 2, 3…), con un rebote corto. No se puede tocar dos veces el mismo.
- **Botones:**
  - "Borrar" vuelve a empezar la selección.
  - "Listo" se habilita al elegir tantos como tiene la secuencia, y corrige con el reintento de `rondas.ts`.
- **Reintento:**
  - se borran las insignias;
  - si ya no le quedan reproducciones, se le suma una.
- **Al mostrar la respuesta:**
  - las insignias correctas aparecen en verde sobre los dibujos;
  - debajo, una tira chica con la secuencia en orden.

**Porcentaje:** secuencias completas y en orden / 6.

## 3. Rompe y une (conciencia silábica, primario)

**Banco:** `bancos.rompe.primario[grado]`. Cada ítem trae `{ id, palabra, silabas[], relleno[] }`, con las sílabas en mayúscula.

**Pantalla:**
- **Arriba:** el dibujo de la palabra y un "Escuchar" sin límite. La palabra no se muestra escrita.
- **Casilleros:** uno por sílaba, en fila, con el contorno punteado del color del bloque (mandarina).
- **Fichas:** las sílabas correctas más las de relleno, mezcladas, como fichas grandes de al menos 44 px, que siguen el switch "A a". Las sílabas repetidas (HI-PO-PO-TA-MO) son fichas distintas: se identifican por índice, no por texto.
- **Dos formas de jugar,** como pide WCAG 2.5.7:
  - **Toque, la principal:**
    - tocar una ficha la lleva al primer casillero libre;
    - tocar una ficha puesta la devuelve a la bandeja;
    - las fichas se mueven con una animación compartida (`layoutId`).
  - **Arrastre:**
    - una ficha se puede arrastrar a un casillero en particular, con `drag` de Motion. Si el casillero está ocupado, la ficha que estaba vuelve a la bandeja;
    - al soltar fuera de un casillero, vuelve a su lugar;
    - el arrastre funciona con mouse y con touch.
  - **Teclado:** Enter o Espacio sobre una ficha hace lo mismo que el toque.
- **Botones:** "Borrar" (todo a la bandeja) y "Listo", que se habilita con todos los casilleros llenos.
- **Corrección:** se compara el orden de los textos, con el reintento de `rondas.ts`.
  - **Al fallar:** sacudida corta y los casilleros se vacían.
  - **Al mostrar la respuesta:** los casilleros se llenan con las sílabas correctas, en verde.
- **En 375 px:** el grado 3 tiene hasta 5 casilleros y 8 fichas. Tiene que entrar sin desplazamiento horizontal: casilleros y fichas se achican y la bandeja hace salto de línea.

**Pruebas del banco:**
- las sílabas unidas forman la palabra, sin tildes y en minúscula;
- el relleno tiene la cantidad del grado (1, 2 y 3);
- ninguna sílaba de relleno está entre las correctas.

**Porcentaje:** palabras armadas bien / palabras de la partida.

## 4. Palabras de otro planeta (lectura de pseudopalabras, primario)

**Banco:** `bancos.planeta.primario[grado]`, con `{ id, palabra, distractores[2] }`.

**Presentación común:**
- La pseudopalabra va grande, en una tarjeta con aire "de otro planeta": fondo lavanda, el emoji 🪐 y estrellitas decorativas.
- Sigue el switch "A a", con buen interletrado.

**Práctica en casa y tareas** (origen distinto de `consulta`):
- **Debajo:** tres tarjetas, "Audio 1", "Audio 2" y "Audio 3". Cada una tiene su botón de parlante (`BotonEscuchar` en tamaño icono, sin límite, a velocidad 0,8) y un botón "¡Es esta!".
- **Contenido de los audios:** la palabra y sus dos distractores, en orden al azar fijo por ronda. Escuchar no elige; elegir no reproduce.
- **Corrección:** reintento de `rondas.ts`. En el fallo se marca la tarjeta equivocada; al mostrar la respuesta, la correcta va en verde.

**En consulta** (origen `consulta`, cambio de la validación del 19/11):
- Se ve solo la pseudopalabra, sin audios. El niño la lee en voz alta.
- El profesional marca **"Bien"** o **"Mal"**: dos botones grandes, verde y rojo con ícono, en `normal-case`, más una nota chica: "Marcá Bien si la leyó completa y sin cambiar ningún sonido".
- Se resuelve con `resolver` (sin reintento) y pasa sola a la siguiente después de unos 600 ms, sin "Seguir".

**Pruebas del banco:** 2 distractores por ítem, distintos de la palabra y entre sí.

**Porcentaje:** correctas / 8.

## 5. Nombrá rápido (denominación rápida, inicial y primario, solo en consulta)

Reusa `EjercicioDenominacion` (`components/test/ejercicio-denominacion.tsx`), con su práctica, consigna, cuadrícula tapada, cronómetro oculto y carga de errores. La partida es de 2 cuadrículas.

**Estímulos y tamaños:**

| Grado | Inicial | Primario |
|---|---|---|
| 1 | Colores, 3 × 4 | Letras, 4 × 5 |
| 2 | Colores y vocales, 4 × 5 | Letras y números, 5 × 6 |
| 3 | Colores, vocales y dibujos, 4 × 6 | Letras, números y colores, 5 × 8 |

- **Estímulos:**
  - Los de la evaluación (`DENOMINACION_POR_NIVEL`): en primario, letras A E S D P, números 2 4 6 7 9 y los cinco colores; en inicial, vocales y colores. En inicial no hay números.
  - Los dibujos de inicial son flor, tren, globo, llave y oso, que ya están en `bancos.json`.

**Cambios mínimos en el módulo de la evaluación (`lib/test/denominacion-config.ts`, `denominacion.ts` y el componente):**
- Nueva categoría `"dibujo"`, que se dibuja con `<Dibujo>`.
- `ConfigDenominacion.ciclo` opcional: el orden de las categorías de esa configuración. Por defecto, `CICLO_CATEGORIAS`.
- `estimulos` como registro parcial.
- Una prop para que las letras de la cuadrícula sigan el switch "A a" en lugar de forzar `uppercase`.
- **La evaluación no cambia de comportamiento:** sus configuraciones y sus pruebas quedan como están y tienen que seguir pasando.

**Generador** (`lib/entrenamiento/denominacion-entrenamiento.ts`):
- Arma la `ConfigDenominacion` del grado, con 2 cuadrículas generadas al azar en cada partida que cumplen `validarSecuencia`:
  - ciclo de las categorías del grado;
  - usos parejos;
  - sin repetir seguido dentro de la categoría.
- En los grados de una sola categoría, además, sin dos celdas iguales seguidas.
- Las dos cuadrículas son distintas.
- **Textos:**
  - práctica: "Vamos a jugar con {colores / colores y vocales / …}. Decime el nombre de cada uno.";
  - consigna y criterio de error: los de la evaluación.
- **Pruebas:** con muchas semillas, todas las cuadrículas generadas pasan `validarSecuencia` y tienen el tamaño del grado.

**En el marco:**
- La práctica va solo antes de la primera cuadrícula.
- El progreso es "Cuadrícula 1 de 2".
- **Sin personaje:** durante el juego no se muestra la columna del personaje, porque la cuadrícula no debe tener distracciones. Usá todo el ancho con una lista `JUEGOS_SIN_PERSONAJE` en `presentacion.ts`.
- **Resultado:**
  - `correctas` y `total`: la suma de las dos cuadrículas;
  - `tiempoMs` y `errores`: la suma;
  - `detalle`: uno por cuadrícula, con la forma de `DetalleEjercicioDenominacion`.
- **Validaciones:** sigue siendo solo de consulta: no aparece en el área del niño y `jugadaValida` lo rechaza en modo niño (ya lo hace).

**Porcentaje:** (estímulos − errores) / estímulos. El tiempo no cuenta para desbloquear.

## 6. ¡Rápido, tocalo! (denominación rápida, inicial y primario)

**Mecánica:** Lumo nombra un estímulo de una cuadrícula chica y el niño lo toca lo más rápido que puede. La partida es de 12 estímulos en inicial y 20 en primario.

| Grado | Inicial | Primario | Tiempo por estímulo |
|---|---|---|---|
| 1 | Colores, 2 × 2 | Letras, 2 × 3 | Sin límite: Lumo espera el toque |
| 2 | Colores y vocales, 2 × 3 | Letras y números, 3 × 3 | Inicial 4 s · primario 3 s |
| 3 | Colores, vocales y dibujos, 3 × 3 | Letras, números y colores, 3 × 4 | Inicial 3 s · primario 2 s |

**Generador** (`lib/entrenamiento/tocalo.ts`):
- **Celdas:** todas distintas, repartidas parejo entre las categorías del grado.
- **Cuadrícula:** se arma una nueva cada 4 estímulos (inicial: 3 cuadrículas; primario: 5).
- **Objetivo:** al azar entre las celdas de la cuadrícula actual, sin repetir el anterior.
- **Estímulos de cada categoría:**
  - colores y vocales: los de la evaluación;
  - dibujos: flor, tren, globo, llave y oso;
  - números: 2 4 6 7 9;
  - letras de primario: A E S D P M L T (nombres: a, e, ese, de, pe, eme, ele, te). Son 8 porque el grado 1 necesita 6 letras distintas.
- **Lo que dice Lumo:** el nombre del estímulo ("rojo", "a", "ese", "flor").
- **Cada ítem:** `{ id, objetivo, celdas }`.
- **Pruebas** con muchas semillas: celdas únicas, el objetivo siempre está en la cuadrícula, reparto entre categorías y tamaños del grado.

**Pantalla:**
- **Arranque:** al empezar, un botón grande "¡Listo, empezá!". Nada suena hasta tocarlo. Desde ahí, Lumo dice cada estímulo solo, uno tras otro. Es la única excepción a "nada suena solo", porque es la mecánica del juego, y vale solo después de ese toque.
- **Celdas:**
  - colores: cuadrados redondeados pintados, sin palabras;
  - letras: grandes, siguen el switch;
  - dibujos: con `<Dibujo>`.
  - aria-label con el nombre.
  - Una cuadrícula nueva entra con una animación corta.
- **Tiempo:**
  - se mide desde que termina el audio (`alTerminar`) hasta el toque, con `performance.now()`;
  - "Escuchar otra vez" vuelve a decir el estímulo y no reinicia el tiempo.
- **Corrección:** se resuelve con `resolver`, sin reintento.
  - **El primer toque decide.**
  - **Correcto dentro del tiempo:** brillo verde y sigue.
  - **Celda equivocada:** sacudida roja y la correcta se ilumina 800 ms.
  - **Se acaba el tiempo:** la correcta se ilumina 800 ms y cuenta como error.
  - **El tiempo límite no se muestra** como cuenta regresiva numérica. Si querés dar una pista visual, que sea una barrita fina que se vacía, sin números.
- **Resultado:**
  - `tiempoMs` es el promedio del tiempo de respuesta de los toques correctos, redondeado;
  - `errores` es total − correctas;
  - si no hubo ningún toque correcto, los dos van en null;
  - el `detalle` de cada estímulo suma `ms`.

**Porcentaje:** toques correctos dentro del tiempo / estímulos.

## Restricciones

- **Revisión visual:** en 375 px y en escritorio. La app no tiene modo oscuro activo.
- **Movimiento:** con `prefers-reduced-motion`, nada se desplaza. Las animaciones pasan a fundidos.
- **Accesibilidad:**
  - todo se puede hacer con teclado y con lector de pantalla, sin incumplimientos WCAG 2.2 A ni AA;
  - los objetivos táctiles miden al menos 44 px;
  - en ¡Rápido, tocalo!, el límite de tiempo es parte esencial de la actividad (excepción de 2.2.1), y el grado 1 no tiene límite.
- **Texto:** en español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- **Comandos:** de npm, desde cmd y con `--legacy-peer-deps`.
- **Dependencias:** no agregues librerías de arrastre. Alcanza con Motion.
- **Git y base:** no hagas commits ni cambies de rama, y no corras migraciones contra Supabase.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales. Sumá los módulos nuevos de `lib/entrenamiento/` a `coverage.include`.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- Recorrido manual:
  1. **Audio:** tocar "Escuchar" suena enseguida, sin el segundo de espera, también en la evaluación. Tocar otro audio corta el anterior.
  2. **Memotono:**
     - en inicial grado 1 hay secuencias de colores;
     - el panel se habilita al terminar la secuencia;
     - el reintento borra las insignias;
     - el contador de reproducciones baja.
  3. **Rompe y une:**
     - se arma con toques y con arrastre (mouse y, si podés, el emulador táctil de Chrome);
     - el grado 3 entra en 375 px.
  4. **Palabras de otro planeta:**
     - en práctica, tres audios y "¡Es esta!";
     - en consulta (`/ninos/[id]/entrenamiento/planeta`), solo la palabra y Bien / Mal.
  5. **Nombrá rápido:**
     - en consulta, inicial grado 3 muestra colores, vocales y dibujos;
     - el final muestra tiempo y errores;
     - la partida queda en el historial;
     - la evaluación de denominación sigue igual.
  6. **¡Rápido, tocalo!:**
     - nada suena hasta "¡Listo, empezá!";
     - en el grado 2 se acaba el tiempo y cuenta como error;
     - el final del profesional muestra el tiempo promedio.
  7. **Área del niño:** los juegos nuevos ya no dicen "Próximamente". Nombrá rápido no aparece.

## Al terminar

Resumí:
- los archivos creados, modificados y borrados;
- las pruebas, con cuántas pasan;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt. Si dejaste el margen técnico del audio, decilo y explicá por qué.

No hagas commit.
