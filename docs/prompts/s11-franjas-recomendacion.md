# S11 — Franjas y recomendación

## Contexto

Hoy la recomendación de `/ninos/[id]` ordena los bloques de la última evaluación de menor a mayor acierto (`ordenRecomendacion` y `bloquesMasDebiles` en `lib/test/analisis.ts`). Este slice la reemplaza por **franjas**, como fija la propuesta V8 (sección 5.2):

- Cada bloque de una evaluación cae en una de tres franjas orientativas: **"correcto"**, **"intermedio"** o **"a observar"**.
- Los cortes salen de una revisión bibliográfica que el equipo cerró el 23/11/2026. Los valores definitivos están en la sección 1 de este prompt. No los cambies ni los recalcules: son decisiones tomadas.
- Si un bloque no tiene referencia, queda **"sin franja de referencia"**: se muestran sus datos y queda fuera de la recomendación.
- La recomendación señala los bloques en "intermedio" y "a observar", **en el orden del test**. No compara bloques entre sí.

Entrega (tarjeta de Trello):
- los valores de corte registrados en el código;
- el cálculo de franjas con pruebas de Vitest, con 90 % de ramas o más;
- la franja de cada bloque en el detalle del niño y en el desglose de la evaluación;
- la recomendación de los bloques en "intermedio" y "a observar", en el orden del test;
- la leyenda "sin franja de referencia".

Rama: `s11-franjas-recomendacion`. Responsable: Camila. **No hace falta ninguna migración.**

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `lib/test/analisis.ts` y `lib/test/bloques.ts`;
- `components/test/resultados-evaluacion.tsx`, que es el desglose de la pantalla final y del detalle de una evaluación;
- `app/ninos/[id]/page.tsx`, con la sección Recomendación;
- `lib/entrenamiento/presentacion.ts`, con `juegosPorBloque`.

## 1. Valores de corte (definitivos)

Los cortes se cuentan en **aciertos sobre el total de ítems que hoy tiene cada bloque**. Cada corte guarda el total para el que vale. **Si el total guardado de un bloque es distinto, ese bloque queda sin franja** (por ejemplo, una evaluación vieja con otra cantidad de ítems).

### Bloques por aciertos

| Nivel | Bloque | Total | Correcto | Intermedio | A observar |
| --- | --- | --- | --- | --- | --- |
| inicial | discriminacion_auditiva | 6 | 4 a 6 | 3 | 0 a 2 |
| inicial | conciencia_fonologica | 3 | 2 a 3 | 1 | 0 |
| inicial | conciencia_silabica | 7 | 4 a 7 | 3 | 0 a 2 |
| inicial | memoria_fonologica | 4 | 3 a 4 | 2 | 0 a 1 |
| inicial | denominacion_rapida | — | sin franja de referencia | | |
| primario | discriminacion_auditiva | 5 | 4 a 5 | 3 | 0 a 2 |
| primario | conciencia_fonologica | 7 | 5 a 7 | 4 | 0 a 3 |
| primario | conciencia_silabica | 6 | 4 a 6 | 3 | 0 a 2 |
| primario | memoria_fonologica | 6 | 5 a 6 | 4 | 0 a 3 |
| primario | comprension_lectora | 3 | 3 | 2 | 0 a 1 |
| primario | correspondencia_sonido_letra, 2.º y 3.º | 6 | 6 | 5 | 0 a 4 |
| primario | correspondencia_sonido_letra, 1.º | 6 | 5 a 6 | 4 | 0 a 3 |
| primario | reconocimiento_visual | 2 | 2 | 1 | 0 |
| primario | lectura_pseudopalabras | 7 | 5 a 7 | 4 | 0 a 3 |

### Denominación rápida del primario: tiempo y errores

Vale para el bloque completo: 2 cuadrículas de 50 estímulos, `total` = 100, con `tiempo_ms` y `errores` sumados.

**Tiempo** (en segundos enteros del bloque, `Math.round(tiempo_ms / 1000)`, el mismo redondeo de `formatearTiempo`):

| Grado | Correcto | Intermedio | A observar |
| --- | --- | --- | --- |
| 1.º (`primero`) | hasta 137 s (2:17) | 138 a 146 s | 147 s o más |
| 2.º (`segundo`) | hasta 121 s (2:01) | 122 a 131 s | 132 s o más |
| 3.º (`tercero`) | hasta 101 s (1:41) | 102 a 109 s | 110 s o más |

**Errores** (los tres grados): 0 o 1 es correcto; 2 es intermedio; 3 o más es a observar.

**Combinación:** el bloque toma **la franja más baja** entre la de tiempo y la de errores. Así, un tiempo mayor nunca sube la franja.

### Cuándo un bloque queda "sin franja de referencia"

- Denominación rápida de inicial, siempre.
- Denominación rápida de primario sin `tiempo_ms` o sin `errores`, como las evaluaciones anteriores a S9.
- Un bloque cuyo `total` no coincide con el total del corte.
- Un bloque del primario que depende del grado (correspondencia sonido-letra y denominación rápida) cuando no se conoce el grado (ver la sección 2).
- Un bloque sin ejercicios (`total` = 0).

## 2. De dónde sale el grado

La tabla `test` no guarda la etapa escolar y este slice no lleva migración. Por eso, para los dos bloques que dependen del grado se usa la **etapa escolar actual del niño** (`ninos.etapa_escolar`):

- Si la evaluación es de primario y la etapa es `primero`, `segundo` o `tercero`, se usa ese grado.
- En cualquier otro caso, el grado es desconocido y esos dos bloques quedan sin franja.

Si el tutor cambia el grado, las evaluaciones anteriores se leen con el grado nuevo. Anotalo en "Pendientes y riesgos" de `docs/estado-proyecto.md` y dejá como mejora futura guardar la etapa en `test`.

## 3. Lógica: `lib/test/franjas.ts` (nuevo)

Funciones puras, sin acceso a la base, con su `lib/test/franjas.test.ts` al lado. Los nombres son una sugerencia: si algo encaja mejor con lo que ya hay, adaptalo.

- `type Franja = "correcto" | "intermedio" | "a_observar"`. Un resultado sin franja es `null` (o un tipo que lo distinga), nunca una cuarta franja escondida.
- `CORTES`: la tabla de la sección 1 como una constante única, tipada por nivel y bloque, con el total esperado y los dos cortes. Encima va un comentario con la fuente: "Valores de corte provisorios fijados por revisión bibliográfica (23/11/2026); fundamentación en docs/valores-de-corte.md. No son normas poblacionales".
  - Los cortes de aciertos se expresan como "correcto desde" e "intermedio desde".
  - Los de denominación rápida, como "correcto hasta" e "intermedio hasta", en segundos y en errores.
- `gradoParaFranja(nivel, etapa)` devuelve `"primero" | "segundo" | "tercero" | null`.
- `franjaDeBloque(nivel, bloque, grado)` devuelve la franja o null. Recibe un bloque con `bloque_codigo`, `correctas`, `total` y, opcionales, `tiempo_ms` y `errores`.
- `franjasDeEvaluacion(nivel, bloques, grado)` devuelve todos los bloques **en el orden del test** (`orden`), cada uno con su franja.
- `recomendacion(nivel, bloques, grado)` devuelve:
  - los bloques en "intermedio" y "a observar", en el orden del test, sin reordenar por gravedad;
  - los bloques sin franja, aparte.

  Si todos los que tienen franja están en "correcto", la lista de recomendados queda vacía.
- `ultimaEvaluacion(tests)` elige la más reciente por `fecha` y, si empatan, por `created_at`. La recomendación usa solo esa; las anteriores no intervienen.
- Textos visibles en un solo lugar: `FRANJA_LABEL` ("Correcto", "Intermedio", "A observar") y `SIN_FRANJA_LABEL` ("Sin franja de referencia").

**Limpieza:**
- `ordenRecomendacion` queda sin uso: borrala, con sus pruebas.
- `bloquesMasDebiles` sigue en uso en `historial-evaluaciones.tsx`: no la toques.

**Pruebas** (90 % de ramas o más; sumá `lib/test/franjas.ts` al `coverage.include` de `vitest.config.ts`). Tienen que cubrir los casos del criterio del objetivo 4 de la propuesta:
- **Cada bloque por aciertos, en sus dos bordes:** el último puntaje de cada franja y el primero de la siguiente. Por ejemplo, en conciencia fonológica de primario: 5 es correcto, 4 es intermedio, 4 no es correcto y 3 es a observar.
- **Correspondencia sonido-letra:** con 5 aciertos es correcto en 1.º e intermedio en 2.º y 3.º; con 4 es intermedio en 1.º y a observar en 2.º.
- **Denominación rápida por tiempo, en cada grado:** 137 s es correcto y 138 s es intermedio en 1.º. Probá también el redondeo: 137 499 ms es correcto y 137 500 ms es intermedio.
- **Denominación rápida por errores:** 1, 2 y 3 errores.
- **Combinación:** tiempo correcto con 3 errores da a observar; tiempo a observar con 0 errores da a observar; tiempo intermedio con 1 error da intermedio.
- **Sin franja:** denominación rápida de inicial; denominación rápida sin tiempo; un total distinto al esperado; grado desconocido; un bloque con total 0.
- **Recomendación:**
  - todos en correcto: lista vacía;
  - una mezcla de intermedio y a observar: salen en el orden del test, aunque el bloque en "a observar" venga después de uno en "intermedio";
  - los bloques sin franja no entran nunca.
- **Niño con varias evaluaciones:** `ultimaEvaluacion` elige la más reciente, también con la lista desordenada y con fechas iguales.
- **Integridad de `CORTES`:**
  - cada bloque de `BLOQUES_POR_NIVEL` tiene corte o está marcado sin referencia;
  - en todos, intermedio desde < correcto desde ≤ total;
  - los totales coinciden con la cantidad de ítems de cada bloque. Si podés contarlos desde los datos de las páginas del test sin acoplarte de más, mejor; si no, una prueba con los totales de esta tabla alcanza.

## 4. Desglose de la evaluación (`components/test/resultados-evaluacion.tsx`)

Lo usan la pantalla final de la evaluación y el detalle de una evaluación del historial. Las dos son del profesional.

- **Nueva prop** con la etapa escolar actual del niño, para calcular el grado.
  - La pantalla final la saca de `useAccesoTest`: ya consulta `etapa_escolar`, solo hay que sumarla al estado `permitido`.
  - El detalle de una evaluación la saca de `cargarTestDeNino`: sumá `etapa_escolar` a `TestDeNino`, leyendo `ninos` con la RLS que ya existe.
- **Nueva columna "Franja"** en la tabla por bloque, después de la del resultado, con un chip con texto:
  - "Correcto" con `Badge variant="menta"`;
  - "Intermedio" con `sol`;
  - "A observar" con `rojo`;
  - "Sin franja de referencia" con `neutro`.

  El color nunca es la única señal. En celular, la tarjeta de la fila lleva `data-label="Franja"`. La sub-fila por ejercicio de denominación rápida no lleva franja.
- **Color de la fila según la franja.** El número y la barra de porcentaje de cada fila toman el color de su franja (correcto `nivel-alto`, intermedio `nivel-medio`, a observar `nivel-critico`, sin franja neutro) en lugar de la escala general 80/60/40 de `estiloNivel`. Si no, una fila puede verse en amarillo y decir "Correcto" (2 de 3 en conciencia fonológica de inicial). `BarraPorcentaje` ya acepta `claseRelleno`.
  - El anillo del porcentaje general no cambia.
- **Debajo de la tabla,** antes de la línea "Esta evaluación es orientativa...":
  - Siempre: "Las franjas comparan cada bloque con valores de referencia de la bibliografía. Son orientativas y no son normas de población."
  - Si hay algún bloque sin franja: "Sin franja de referencia: no hay valores de la bibliografía para comparar este resultado. Su interpretación queda a cargo del profesional."
  - Si correspondencia sonido-letra o denominación rápida tienen franja: "La franja de correspondencia sonido-letra y la de denominación rápida usan el grado actual del niño (2do grado)", con el label de `ETAPAS_ESCOLARES`.

## 5. Detalle del niño (`/ninos/[id]`): franjas y recomendación

La sección "Recomendación" pasa a llamarse **"Franjas y recomendación"** y usa la última evaluación (`ultimaEvaluacion(datos.tests)`) y la etapa actual del niño.

- **Encabezado:** "Según la evaluación del dd/mm/aaaa (Nivel X)."
- **Una lista con todos los bloques de esa evaluación, en el orden del test.** Cada ítem tiene:
  - el nombre del bloque;
  - su chip de franja, con los mismos chips del desglose;
  - el resultado: "correctas / total" o, en denominación rápida, tiempo (m:ss) y errores.

  Los ítems en "intermedio" y "a observar" se destacan: borde y fondo suave del color de su franja, y debajo "Juegos para practicar" con los nombres de los juegos vinculados a ese bloque y nivel. Usá `juegosPorBloque(nivel, { incluirSoloConsulta: true })`: el principal primero, y incluye Nombrá rápido, que es solo de consulta. Por ahora los juegos van como chips de texto, sin enlace: enlazar y armar tareas desde la recomendación es S15. Dejalo anotado en un comentario.
- **Si no hay ningún bloque en "intermedio" ni en "a observar":** "En esa evaluación todos los bloques con franja quedaron en «Correcto». No hay una recomendación específica."
- **Si hay bloques sin franja,** la misma leyenda del desglose.
- **Se mantiene** "Es una orientación a partir de la última evaluación: vos decidís qué trabajar con el niño." y el estado vacío cuando no hay evaluaciones.
- **Se va** el orden de menor a mayor acierto y el chip "Practicar primero".
- Animaciones con `ListaCascada` / `ItemCascada`, como ahora. Revisá en 375 px y en escritorio, y que se pueda recorrer con el teclado.

## 6. Fuera de este slice

- **El historial de evaluaciones** (`historial-evaluaciones.tsx`), con sus "bloques con más errores", y la pantalla `/test`: no cambian. La evolución por bloque es S16.
- **El niño y el tutor** no ven franjas ni recomendación en ningún lado. El perfil sigue sin resultados (S10).
- **Las franjas no se guardan en la base:** se calculan al mostrar. `test.conclusion` sigue igual.

## 7. Documentación

- **`docs/valores-de-corte.md` (nuevo).** Es un resumen para el repo; la fundamentación completa va al informe final. Incluí:
  - las tablas de la sección 1;
  - la regla: correcto desde M − 1 DE, intermedio entre M − 1,5 DE y M − 1 DE, y a observar por debajo de M − 1,5 DE, convertidos a aciertos (criterio de Cuetos et al., 2015);
  - las decisiones del equipo del 23/11/2026: los pisos de 4 años en discriminación auditiva y conciencia silábica de primario; la franja de reconocimiento visual; Betts en comprensión lectora; el corte propio de 1.º en correspondencia sonido-letra por las letras espejo; el desvío estimado y la franja más baja en denominación rápida; el redondeo al segundo;
  - la lista de fuentes:
    - Cuetos, Suárez-Coalla, Molina y Llenderrozas (2015 y 2017), *Pediatría Atención Primaria*;
    - Sebastián y Hernández-Gil (2012), *Psicothema*;
    - Querejeta (2017), *Revista de Psicología (UNLP)*;
    - Seymour, Aro y Erskine (2003), *British Journal of Psychology*;
    - Betts (1946);
    - Fonseca, Corrado, Lasala, García-Blanco y Simian (2019), *Ocnos*;
    - Outón y Ferraces (2021), *Dyslexia*;
    - Pearson (2017), *Dislexia: una forma diferente de leer*;
    - Semrud-Clikeman y Teeter Ellison (2011), *Neuropsicología infantil*;
    - Dehaene (2014), *El cerebro lector*.
- **`docs/estado-proyecto.md`:**
  - S11 pasa a "En revisión" en la tabla de slices;
  - en "Evaluación", reemplazá el "**Hoy** la recomendación ordena..." por cómo funciona ahora: franjas, orden del test, sin franja, grado actual del niño;
  - sumá el riesgo de la sección 2 a "Pendientes y riesgos";
  - actualizá la fecha de arriba.
- **`docs/revisiones-especialistas.md`:** sumá una fila con fecha 23/11/2026: "Equipo, director (revisión bibliográfica, sin especialistas)" · "Valores de corte de las franjas" · "Se fijaron dos cortes por bloque y nivel; ver docs/valores-de-corte.md" · "S11".
- **`docs/prompts/README.md`:** sumá la fila de `s11-franjas-recomendacion.md` (S11 Franjas y recomendación, Camila). El archivo del prompt lo agrega Camila.

## 8. Hecho cuando

- [ ] `npm run build` pasa y `npx tsc --noEmit` da 0 errores.
- [ ] `npm test` pasa y `npm run coverage` cumple los umbrales, con `lib/test/franjas.ts` incluido y 90 % de ramas o más.
- [ ] Probado en la app con un profesional y un niño de prueba:
  - [ ] una evaluación de inicial, con denominación rápida "sin franja de referencia";
  - [ ] una de primario con bloques en las tres franjas;
  - [ ] el desglose de la pantalla final y el del historial muestran la misma franja;
  - [ ] la recomendación sale en el orden del test;
  - [ ] con todos los bloques en correcto, aparece el mensaje de "no hay recomendación específica".
- [ ] Docs actualizados (sección 7).

Al terminar, en el resumen, contá qué archivos tocaste y avisá si algo de este prompt no encajó con el código.