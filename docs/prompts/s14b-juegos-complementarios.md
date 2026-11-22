# S14b — Memopalabras, Ojo de lince y Lluvia

## Contexto

Con S14a quedaron cubiertas las 14 combinaciones bloque-nivel. Este slice suma los 3 juegos complementarios, con lo que el entrenamiento queda completo, con sus 14 juegos:

- **Memopalabras** (primario)
- **Ojo de lince** (inicial y primario), que antes se llamaba Busca la letra
- **Lluvia** (inicial y primario)

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `lib/entrenamiento/juegos.ts`, con las fichas;
- `lib/entrenamiento/seleccion.ts`, de S14a, con el puntaje de los juegos de selección;
- Caza errores, el modelo para "marcar y corregir al final".

Lo que dice este prompt manda sobre el mockup y sobre `docs/banco-entrenamientos.md`.

**La parte visual sigue siendo prioridad,** como en S13 y S14a: los colores del bloque, animaciones de Motion con su alternativa para `prefers-reduced-motion`, contenedores redondeados y Lex o Lumo. Lluvia es el juego más vistoso del entrenamiento: tiene que ser divertido de mirar.

No hace falta ninguna migración.

## 1. Reglas comunes

- **Los tres son juegos de selección:**
  - el niño marca varios elementos y corrige con "Finalizar";
  - no hay reintento (validación del 19/11: "Misma mecánica de Finalizar");
  - el puntaje usa `puntajeSeleccion`, sumado en toda la partida, y el evento `fin` lleva esas `correctas` y ese `total`, como en Caza errores.
- **Corrección visual,** igual que en Caza errores:
  - encontrados en verde;
  - no encontrados en ámbar;
  - marcados por error en rojo con ícono;
  - y después "Seguir".
- **Generadores:** Ojo de lince y Lluvia de inicial generan o eligen su contenido en `armarPartida`. Cada ítem lleva un `id` legible.
- **Disponibles:** sumá los tres a `JUEGOS_DISPONIBLES` y a `COMPONENTES_JUEGO`. Ya no queda ningún juego en "Próximamente": si el área del niño o el catálogo tienen lógica para eso, dejala igual pero sin uso, o simplificala si queda código muerto.

## 2. Memopalabras (complementario de reconocimiento visual, primario)

**Banco:** `bancos.memopalabras.primario[grado]`, con `{ id, palabra, parecida }`. En el grado 1, `parecida` es null.

**Agregado al banco (grado 2).** Con 4 palabras por conjunto y 6 conjuntos, la partida necesita 24 palabras sin repetir y el grado 2 tiene 20. Sumá estos 6 ítems al final de `bancos.memopalabras.primario["2"]`:

```json
{ "id": "MPA-2-21", "palabra": "pescado", "parecida": "pestaña" },
{ "id": "MPA-2-22", "palabra": "botella", "parecida": "botines" },
{ "id": "MPA-2-23", "palabra": "cuchara", "parecida": "cuchillo" },
{ "id": "MPA-2-24", "palabra": "tobogán", "parecida": "tobillo" },
{ "id": "MPA-2-25", "palabra": "ladrillo", "parecida": "ladrido" },
{ "id": "MPA-2-26", "palabra": "pantalón", "parecida": "pantufla" }
```

Ninguna es estímulo de la evaluación, y cada `parecida` comparte la primera sílaba, como el resto del grado 2.

**Partida** (generada a partir del banco):

| Grado | Conjuntos | Palabras para leer | Distractores |
|---|---|---|---|
| 1 | 6 | 3 | La misma cantidad: otras palabras del grado 1 que no están en el conjunto, preferentemente que todavía no aparecieron en la partida |
| 2 | 6 | 4 | La `parecida` de cada palabra (comparten la sílaba inicial) |
| 3 | 4 | 5 | La `parecida` de cada palabra (una letra cambiada o invertida) |

- Las palabras para leer no se repiten en la partida.
- Ninguna `parecida` coincide con una palabra para leer del mismo conjunto.
- **Pruebas** con muchas semillas: tamaños, sin repetidos, los distractores del grado y el banco del grado 2 con 26 ítems.

**Pantalla:**
1. **Para leer:** las palabras en tarjetas grandes y bien separadas, que siguen el switch "A a", y "Ya las leí". Sin límite de tiempo. El tiempo de lectura va al `detalle`.
2. **Para marcar:** las palabras leídas y los distractores, mezclados, en una cuadrícula de tarjetas (2 columnas en 375 px, 3 o 4 en escritorio).
   - Tocar marca y tocar otra vez desmarca.
   - Arriba dice "Marcá las 4 palabras que leíste" (con la cantidad).
   - "Finalizar" siempre habilitado.
   - La pantalla para leer ya no se puede ver.
- La barra del marco dice "Conjunto N de 6".

**Porcentaje:** palabras encontradas / (palabras leídas + toques equivocados).

## 3. Ojo de lince (inicial y primario)

En inicial es complementario de denominación rápida; en primario, de correspondencia sonido-letra.

**Partida:** 3 cuadrículas. Cerca del 25 % de las celdas son el objetivo:

| Cuadrícula | Celdas | Objetivos |
|---|---|---|
| 3 × 3 | 9 | 2 |
| 3 × 4 | 12 | 3 |
| 4 × 4 | 16 | 4 |
| 5 × 5 | 25 | 6 |
| 6 × 6 | 36 | 9 |
| 7 × 7 | 49 | 12 |

Las posiciones son al azar. La cuadrícula está completa, sin celdas sobrantes. La barra del marco dice "Cuadrícula N de 3".

### Inicial

- **Tamaño:** 3 × 3 en grado 1, 3 × 4 en grado 2 y 4 × 4 en grado 3.
- **Categorías:** cada cuadrícula de la partida usa una, en orden al azar:
  - **colores:** los 5 de denominación rápida (`COLORES_ESTIMULO`), como círculos pintados;
  - **dibujos:** flor, tren, globo, llave, oso y estrella, de `bancos.json`;
  - **vocales:** A, E, I, O, U, que siguen el switch.
- **Muestra:** arriba, grande, en un recuadro con el título "Buscá todos los que son así".
- **Distractores:** los otros elementos de la misma categoría.

### Primario

- **Muestra y audio:** Lumo dice la letra con un "Escuchar" sin límite.
  - En el grado 1 la letra también se ve en la muestra.
  - En los grados 2 y 3 la muestra es solo el botón de audio: "¿Qué letra dice Lumo?".
- **Nombres que dice Lumo:** be, de, pe, cu, eme, ene, ese, te, ele, efe, hache, ka, a, e, i, o, u, ce, erre. No se usa la v, porque en nuestra variedad suena igual que la b.
- **Siempre en minúscula:** el switch "A a" no cambia las letras de este juego, porque las letras espejo solo existen en minúscula. Agregá una nota chica para el profesional en la consigna: "En este juego las letras van siempre en minúscula".
- **Tipografía:** una en la que b, d, p y q sean espejos reales.

| Grado | Cuadrícula | Objetivos posibles | Distractores |
|---|---|---|---|
| 1 | 5 × 5; la letra se ve y se escucha | m, s, t, l, f, b, d | De forma distinta: a, e, o, u, r, c, n, i, menos el objetivo y las de forma parecida (tabla del grado 2) |
| 2 | 6 × 6; solo se escucha | b, n, m, f, t, e | De forma parecida: b → h, l, k; n → h, m, u, r; m → n, r, u; f → t, l; t → f, l, i; e → c, o, a |
| 3 | 7 × 7; solo se escucha | b, d, p, q | Las otras tres letras espejo |

- Cada cuadrícula de la partida tiene un objetivo distinto.
- **Pruebas** con muchas semillas: tamaños, cantidad de objetivos, que no haya v, que los distractores sean los de la tabla y que el objetivo no aparezca entre los distractores.

**Pantalla:**
- Cuadrícula de celdas cuadradas que entra sin desplazamiento horizontal en 375 px, también la de 7 × 7: las celdas se achican, pero cada una mide al menos 44 px de objetivo táctil (la celda puede ser más grande que el símbolo).
- Tocar marca (anillo y fondo suave) y tocar otra vez desmarca. `aria-pressed` en cada celda.
- "Finalizar" siempre habilitado.

**Porcentaje:** objetivos encontrados / (objetivos + toques equivocados).

## 4. Lluvia (inicial y primario)

En inicial es complementario de denominación rápida; en primario, de reconocimiento visual.

**Banco:**
- `bancos.lluvia[nivel][grado]`, con 9 ítems por grado: `{ id, categoria, objetivo, distractores[] }`.
- En inicial, `categoria` es colores, objetos (emojis del mapa `emojis`) o vocales, y `objetivo` es un texto.
- En primario, `objetivo` es una lista: una palabra en los grados 1 y 2, y dos en el grado 3.

**Partida:**
- 3 lluvias de 30 segundos.
- En inicial, una de cada categoría, en orden al azar.
- En primario, 3 ítems al azar.
- La barra del marco dice "Lluvia N de 3".

**Antes de cada lluvia:** una tarjeta con la muestra grande ("Tocá solo estos", con uno o dos objetivos) y un botón "¡Que empiece la lluvia!". Nada empieza solo.

**Durante la lluvia:**
- **La muestra:** queda a la vista arriba todo el tiempo, chica.
- **Los elementos:** caen desde arriba en carriles (4 en inicial, 5 en primario), sin superponerse. Todos del mismo color de fondo (validación del 19/11), con el contenido según la categoría:
  - un color pintado;
  - un dibujo;
  - una vocal o una palabra, que siguen el switch "A a".
- **Proporción de objetivos:** cerca del 35 % de lo que cae, con al menos 6 por lluvia.
- **Al tocar:**
  - un objetivo estalla con un destello y suma;
  - un distractor se sacude en rojo y desaparece.
  - Un objetivo que llega abajo sin tocar se desvanece.
- **No se muestran números:** ni contador ni cuenta regresiva. El tiempo restante es una barrita fina que se vacía.
- **Al terminar los 30 s:** lo que queda en pantalla se desvanece y aparece "Seguir".

**Parámetros:**
- Van en una constante `PARAMETROS_LLUVIA` para ajustarlos probando.
- La caída es el tiempo en recorrer la zona de juego.
- En primario hay un 30 % más de palabras por lluvia que en el mockup (validación del 19/11). Por eso el intervalo es más corto.

| Grado | Inicial | Primario |
|---|---|---|
| 1 | Caída 7 s, una cada 1,3 s | Caída 7 s, una cada 0,9 s |
| 2 | Caída 6,5 s, una cada 1,0 s | Caída 6,5 s, una cada 0,85 s |
| 3 | Caída 5 s, una cada 1,0 s | Caída 6 s, una cada 0,8 s |

**Colores de inicial que no están en `COLORES_ESTIMULO`** (los distractores del grado 3):

| Color | Hex |
|---|---|
| naranja | #f97316 |
| rosa | #ec4899 |
| celeste | #38bdf8 |
| violeta | #8b5cf6 |
| dorado | #d4a017 |

Agregalos en un mapa propio del juego, sin tocar el de la evaluación.

**Técnica:**
- Animá con `requestAnimationFrame` o con Motion, sin un re-render de React por cuadro para cada elemento.
- Pausá todo si la pestaña queda oculta (`visibilitychange`). Al volver, la lluvia sigue desde donde estaba, sin contar ese tiempo.
- Al salir o desmontar, se limpia todo.

**Sin personaje:** el personaje no se muestra durante la lluvia, para dejar todo el ancho al juego. Agregá `lluvia` a `JUEGOS_SIN_PERSONAJE`. En la tarjeta de antes de cada lluvia sí puede estar Lumo.

**Reducir movimiento y teclado:**
- Con `prefers-reduced-motion`, nada cae: los elementos aparecen en casillas fijas de una cuadrícula y se desvanecen después del mismo tiempo que tardarían en caer.
- En los dos modos, cada elemento es un botón: se alcanza con Tab y se toca con Enter o Espacio.
- El movimiento es parte esencial de la actividad (excepción de WCAG 2.2.2).

**Puntaje:**
- **Detalle por lluvia:** `{ item, aparecieron, tocados, equivocados }`.
- **Para `puntajeSeleccion`:** los objetivos son los que aparecieron y los equivocados, los distractores tocados.
- **Pruebas:** el generador de la lluvia (proporción, mínimo de objetivos, carriles sin superposición) va en lógica pura, con un reloj inyectable.

**Porcentaje:** toques al objetivo / (apariciones del objetivo + toques a distractores).

## Restricciones

- **Revisión visual:** en 375 px y en escritorio. La app no tiene modo oscuro activo.
- **Movimiento:** con `prefers-reduced-motion`, nada se desplaza.
- **Accesibilidad:**
  - todo se puede hacer con teclado y con lector de pantalla, sin incumplimientos WCAG 2.2 A ni AA;
  - los objetivos táctiles miden al menos 44 px.
- **Texto:** en español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- **Comandos:** de npm, desde cmd y con `--legacy-peer-deps`.
- **Git y base:** no hagas commits ni cambies de rama, y no corras migraciones contra Supabase.
- **Contraseñas:** si necesitás sesión para probar, pedile a Donato que la inicie él en el navegador. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales. Sumá los módulos nuevos a `coverage.include`.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- Recorrido manual. Podés usar una ruta temporal sin sesión y borrarla al terminar.
  1. **Memopalabras:**
     - leer, "Ya las leí", marcar y "Finalizar";
     - en el grado 2 los distractores empiezan igual;
     - marcar todo no da 100 %.
  2. **Ojo de lince:**
     - en inicial, una cuadrícula de cada categoría con la muestra;
     - en primario grado 3 hay solo b, d, p y q, en minúscula aunque el switch esté en MAYÚSCULA;
     - el 7 × 7 entra en 375 px.
  3. **Lluvia:**
     - nada empieza hasta el botón;
     - caen sin superponerse;
     - tocar objetivo y distractor da su respuesta visual;
     - a los 30 s termina;
     - en primario grado 3 hay dos objetivos;
     - con reducir movimiento (emulado en DevTools) nada cae;
     - al cambiar de pestaña se pausa.
  4. **Área del niño y consulta:** los 14 juegos se pueden abrir, salvo Nombrá rápido, que el niño no ve.

## Al terminar

Resumí:
- los archivos creados, modificados y borrados;
- las pruebas, con cuántas pasan;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt;
- en `docs/estado-proyecto.md`, el estado de S14 y que el entrenamiento quedó completo.

No hagas commit.
