# S11b — Recomendación en "Entrenar en consulta"

## Contexto

S11 ya calcula las franjas de cada bloque (`lib/test/franjas.ts`) y las muestra en el desglose y en "Franjas y recomendación" de `/ninos/[id]`. **Todo eso queda como está.**

Este agregado lleva la recomendación a la pantalla **Entrenar en consulta** (`/ninos/[id]/entrenamiento`), con otro formato:

- Un **switch "Recomendación"** prende y apaga la vista.
- **Apagado:** la pantalla se ve exactamente como hoy, con los juegos agrupados por bloque.
- **Prendido:** los juegos se reagrupan según la franja de su bloque en la última evaluación del niño.

La misma vista agrupada se va a usar después en S15, cuando el profesional arme tareas. Por eso el agrupamiento tiene que ser una pieza reutilizable y no algo atado a esta página.

Se trabaja en la misma rama de S11 (`desarrollo-camila`). **No hace falta ninguna migración.**

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `app/ninos/[id]/entrenamiento/page.tsx`;
- `components/entrenamiento/catalogo-juegos.tsx`, `tarjeta-juego.tsx`, `switch-letra.tsx` y `colores-bloque.ts`;
- `components/test/franja.tsx` y `components/ninos/franjas-recomendacion.tsx`;
- `lib/test/franjas.ts`;
- `lib/entrenamiento/presentacion.ts`, con `juegosPorBloque`;
- `lib/ninos/detalle.ts`, con `cargarTestsConBloques` y `cargarNinoParaEntrenar`.

## 1. Lógica: agrupar los juegos por franja

Agregá en `lib/entrenamiento/presentacion.ts`, o en un archivo nuevo si queda más claro, una función pura:

`juegosPorFranja(nivel, franjas, opciones)`

- `franjas` dice la franja de cada bloque de la evaluación: un `Map` o un `Record` de `BloqueCodigo` a `Franja | null`, armado con `franjasDeEvaluacion`.
- Devuelve los grupos **en este orden fijo**: `a_observar`, `intermedio`, `correcto` y "sin franja" (`null`). Cada grupo trae su lista de juegos y cada juego va con su bloque.
- **Dentro de cada grupo** se respeta el orden de hoy: bloques en el orden del test (`BLOQUES_POR_NIVEL`) y, dentro de cada bloque, el principal primero. Reusá `juegosPorBloque` para no duplicar el orden.
- **Un bloque del nivel que no aparece en la evaluación** cae en "sin franja". Es el caso de una evaluación vieja sin denominación rápida.
- **Los grupos vacíos no se devuelven.**
- `opciones.incluirSoloConsulta` funciona como en `juegosPorBloque`. En consulta va `true`.

**Pruebas en Vitest:**
- el orden de los grupos;
- el orden dentro de un grupo con juegos de dos bloques;
- un bloque sin resultado que cae en "sin franja";
- los grupos vacíos omitidos;
- todos los bloques en "correcto";
- con y sin los juegos de solo consulta.

Si la función va en un archivo nuevo, sumalo al `coverage.include` de `vitest.config.mts`. Tiene que mantener 90 % de ramas.

## 2. Datos en la página

En `app/ninos/[id]/entrenamiento/page.tsx`, además de lo que ya carga, traé las evaluaciones visibles del niño con `cargarTestsConBloques`. Usa la misma RLS que el detalle: las del profesional, o las de todos si el tutor compartió el historial. Después:

- elegí la última evaluación con `ultimaEvaluacion`;
- calculá el grado con `gradoParaFranja(test.nivel, nino.etapa_escolar)`;
- calculá las franjas con `franjasDeEvaluacion`.

**La recomendación solo está disponible si hay una evaluación y es del mismo nivel que el niño tiene hoy** (`nivelParaEtapa(etapa_escolar)`), porque los juegos que se muestran son los de ese nivel. Si no está disponible, el switch se ve **deshabilitado**, con el motivo en texto al lado o debajo:
- **Sin evaluaciones:** "Disponible después de la primera evaluación."
- **Evaluación de otro nivel:** "La última evaluación es de nivel Inicial. Tomá una de nivel Primario para ver la recomendación." Usá los labels de `NIVEL_LABEL`.

Si falla la carga de las evaluaciones, la página sigue funcionando sin recomendación: switch deshabilitado y `console.error`. No bloquees el entrenamiento por eso.

## 3. El switch "Recomendación"

- **Dónde va:** en la misma tarjeta de la consigna, en el bloque de controles de la derecha, junto a "Tipo de letra". Los dos controles quedan alineados, cada uno con su etiqueta: "Tipo de letra" y "Recomendación". En celular van debajo del texto, como hoy.
- **Componente:** `components/ui/switch.tsx` (shadcn), con `aria-label` o etiqueta asociada, foco visible y estilo coherente con `SwitchLetra` (lavanda al estar prendido). Tiene que llegar a 44 px de alto táctil.
- **Estado inicial:** apagado.
- **Memoria:** la preferencia se guarda en `localStorage`, con una clave global del profesional, no por niño. Por ejemplo `lecxico:recomendacion-consulta`. Leé y escribí dentro de `try/catch`, porque en algunos navegadores falla. Si no se puede leer, arranca apagado.
- **Sin migración:** la preferencia no va a la base. A diferencia del tipo de letra, que sí afecta lo que ve el niño en casa, esta es una preferencia del profesional en esta pantalla.

## 4. Vista con la recomendación prendida

Un componente reutilizable, por ejemplo `components/entrenamiento/juegos-por-franja.tsx`:
- recibe los grupos de `juegosPorFranja` y una función `renderJuego(juego, bloque)` que dibuja cada tarjeta. En consulta, esa función devuelve `TarjetaJuego` con los grados y `rutaConsulta`, como hoy. En S15 se va a pasar otra tarjeta para elegir juegos de una tarea.
- `CatalogoJuegos` sigue igual para la vista apagada y para el área del niño. **El niño nunca ve franjas ni recomendación** (`app/entrenamiento/page.tsx` no cambia).

**Encabezado de la vista:** "Según la evaluación del dd/mm/aaaa." Si no hay ningún bloque en "intermedio" ni en "a observar", agregá: "Todos los bloques con franja quedaron en «Correcto»: no hay una recomendación específica."

**Un contenedor por grupo,** en el orden del punto 1:

| Grupo | Título | Chip | Contenedor (sutil) |
| --- | --- | --- | --- |
| `a_observar` | Mayor prioridad | `ChipFranja` "A observar" | borde `rojo` muy suave y fondo `rojo-suave` translúcido |
| `intermedio` | Prioridad media | "Intermedio" | ídem con `sol` |
| `correcto` | Menor prioridad | "Correcto" | ídem con `menta` |
| sin franja | Sin franja de referencia | (sin chip) | `muted` translúcido; debajo del título, en `text-sm`: "No hay valores de la bibliografía para comparar este bloque. Su interpretación queda a cargo del profesional." |

- Los colores son una referencia: el contenedor tiene que ser **sutil**, que las tarjetas blancas sigan siendo lo que más se ve.
- Sumá las clases a `ESTILO_FRANJA` en `components/test/franja.tsx`, en una clave nueva (por ejemplo `contenedor`) para las cuatro claves. Así los colores de las franjas siguen en un solo lugar.
- Revisá el contraste AA del título y del texto chico sobre ese fondo, también sobre el fondo rojizo del profesional (`vidrio`).
- Cada contenedor es una `<section>` con `aria-labelledby` en su título, con el nivel de encabezado correcto según la página.

**Juegos contiguos, sin perder el bloque:**
- Dentro de cada contenedor, **todos los juegos del grupo van en una sola cuadrícula** con la misma cuadrícula y la misma tarjeta de hoy: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, con el mismo tamaño de letra y de tarjeta. No hay un título por bloque encima de cada juego.
- Para que no se pierda a qué bloque pertenece cada juego, la tarjeta suma un **chip con el nombre del bloque**:
  - va arriba del nombre del juego, en el cuerpo de la tarjeta;
  - usa el color del bloque (`COLOR_BLOQUE[bloque].chip`) y `BLOQUE_NOMBRES`;
  - va en texto, no solo con el color.
- Agregalo a `TarjetaJuego` como una prop opcional (por ejemplo `mostrarBloque`), apagada por defecto. Así la vista de hoy y el área del niño no cambian. Actualizá el comentario de la tarjeta, que hoy dice que no lleva el nombre del bloque.

**Cambio de vista:**
- Al prender o apagar el switch, la cuadrícula cambia con una transición corta: `ListaCascada` / `ItemCascada` o un fundido. Con "reducir movimiento" no se desplaza nada.
- El foco del teclado queda en el switch.
- Si conviene, anunciá el cambio con `aria-live="polite"`: por ejemplo, "Juegos ordenados según la recomendación".

## 5. Fuera de este agregado

- **`/ninos/[id]`, el desglose y la lógica de franjas:** no cambian.
- **El área del niño (`/entrenamiento`):** no cambia.
- **Las tareas (S15):** solo dejá lista la pieza reutilizable; no armes nada de tareas.

## 6. Documentación

- **`docs/estado-proyecto.md`:**
  - en la fila de S11, sumá "recomendación en Entrenar en consulta (switch, juegos agrupados por franja, preferencia en localStorage)";
  - en la sección del entrenamiento o de la recomendación, describí la vista y aclará que S15 reutiliza `juegosPorFranja` y el componente.
- **`docs/prompts/README.md`:** sumá la fila de `s11b-recomendacion-en-consulta.md` (S11b Recomendación en consulta, Camila).

## 7. Hecho cuando

- [ ] `npm run build` pasa y `npx tsc --noEmit` da 0 errores.
- [ ] `npm run coverage` cumple los umbrales, con 90 % de ramas o más, incluida la función nueva.
- [ ] Probado en la app con un profesional y un niño de prueba:
  - [ ] switch apagado: la pantalla se ve igual que antes;
  - [ ] switch prendido: aparecen los grupos en orden y cada juego con su chip de bloque;
  - [ ] la preferencia se mantiene al recargar;
  - [ ] niño sin evaluaciones: switch deshabilitado con su motivo;
  - [ ] niño con la última evaluación de otro nivel: switch deshabilitado con su motivo;
  - [ ] inicial: denominación rápida queda en "Sin franja de referencia";
  - [ ] todos los bloques en correcto: aparece el mensaje de "no hay recomendación específica";
  - [ ] revisado en 375 px y en escritorio, y recorrido con el teclado.
- [ ] Docs actualizados (sección 6).

Al terminar, en el resumen, contá qué archivos tocaste y avisá si algo de este prompt no encajó con el código.