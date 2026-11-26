# S16 — Gráficos de seguimiento

**Tarjeta de Trello:** https://trello.com/c/C41mbfYX · **Rama:** `s16-graficos-seguimiento` · **Migración:** ninguna

## Contexto

La propuesta V8 pide para el profesional, en el detalle del niño:
- gráficos de evolución por bloque (evaluaciones);
- gráficos de progreso en el entrenamiento, separando las partidas en consulta, de tareas y de práctica en casa;
- en denominación rápida, la evolución del tiempo y los errores.

Solo los ve el profesional. Los cálculos de este slice los va a reusar S17 para el informe en PDF, así que **la lógica va separada de los gráficos.**

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `lib/test/franjas.ts` (cortes y franjas, S11) y `components/test/franja.tsx` (colores y chips de franja);
- `lib/ninos/detalle.ts` y `app/ninos/[id]/page.tsx`;
- `components/ui/chart.tsx`: `recharts` ya está instalado.

## 1. Lógica pura (`lib/seguimiento/`)

Funciones sin React ni base de datos, con pruebas de Vitest (80 % de líneas y 90 % de ramas). Sumalas a `coverage.include`.

### `evaluaciones.ts`

- **`serieEvaluaciones(tests, nivel)`:** las evaluaciones del nivel, de la más vieja a la más nueva. Cada punto lleva `fecha`, `testId` y, por bloque, `correctas`, `total`, `porcentaje` y `franja`, calculada con `franjaDeBloque` y el grado del niño.
- **Las evaluaciones de otro nivel no se mezclan:** las de un niño que pasó de inicial a primario se ven con un selector de nivel.
- **`bandasDeFranja(nivel, bloque, grado)`:** los límites de las tres franjas expresados en porcentaje, para pintarlas de fondo.
  - Para `aciertos`, `correctoDesde / total` e `intermedioDesde / total`.
  - Para `aciertos_por_grado`, los del grado del niño.
  - Devuelve `null` si el bloque es `sin_referencia` o si es denominación rápida, que tiene su propia función.
- **`serieDenominacion(tests, nivel)`:** por evaluación, el tiempo del bloque en segundos (`tiempo_ms / 1000`) y los errores, con su franja si hay corte. En primaria hay corte por tiempo y por errores; en inicial no hay.
  - Incluye también `bandasDenominacion(nivel, grado)`, con los límites de tiempo y de errores en primaria.
  - Las evaluaciones viejas sin `tiempo_ms` quedan fuera de la serie.

### `entrenamiento.ts`

- **`partidasPorSemana(partidas, { desde, hasta })`:** partidas por semana (de lunes a domingo, hora de Argentina) y por origen (`consulta`, `tarea`, `practica`). Incluye las semanas sin partidas, con 0.
- **`resumenPorJuego(partidas, habilitados)`:** una fila por juego jugado, con:
  - nombre;
  - grado habilitado en casa;
  - partidas por origen;
  - último resultado (porcentaje y fecha);
  - mejor porcentaje;
  - grado más alto jugado.

  Las filas van ordenadas por la última partida, de la más reciente a la más vieja.
- **Pruebas de los bordes:** sin partidas, una sola semana, cambio de año y partidas con tiempo y errores (denominación) mezcladas con las demás.

## 2. Datos (`lib/seguimiento/datos.ts`)

- **`cargarPartidasSeguimiento(supabase, ninoId)`:** todas las partidas visibles del niño, con `juego, grado, origen, correctas, total, porcentaje, tiempo_ms, errores, created_at`.
  - El historial de `/ninos/[id]` hoy trae solo 20. Esta función trae todas, con paginación por `range` de a 1000 hasta agotar: el límite por defecto de PostgREST es 1000 filas.
  - Las RLS deciden qué ve el profesional (0008). No agregues filtros por tu cuenta.
- **Grado habilitado:** con `gradosHabilitados` (`lib/entrenamiento/partidas.ts`).
- **Evaluaciones:** ya llegan en `DetalleNino.tests`, con sus bloques.

## 3. Sección "Seguimiento" en `/ninos/[id]`

Va **debajo de los historiales** y usa `Seccion` y el estilo de vidrio del profesional, como el resto de la página. Tiene tres pestañas (`components/ui/tabs.tsx`).

### Pestaña "Evaluaciones"

- **Selector de nivel:** solo si el niño tiene evaluaciones de los dos niveles. Por defecto, su nivel actual.
- **Grilla de gráficos chicos, uno por bloque** (*small multiples*), en el orden del test (`BLOQUES_POR_NIVEL`):
  - 3 columnas en escritorio, 2 en tableta y 1 en celular;
  - en cada uno, una línea con el porcentaje de cada evaluación (eje Y de 0 a 100 %, eje X con las fechas);
  - de fondo, las tres franjas en colores suaves (correcto, intermedio y a observar), tomados de los tokens `--nivel-*`;
  - el título del bloque y el chip de la franja de la última evaluación, con texto además de color, como en `components/test/franja.tsx`;
  - si el bloque no tiene referencia, no hay bandas y aparece la leyenda "Sin franja de referencia".
  - **Denominación rápida no entra en esta grilla:** tiene su pestaña.
- **Tooltip** al pasar por un punto: fecha, aciertos sobre total, porcentaje y franja.
- **Con una sola evaluación:** se muestra el punto y el texto "Con dos evaluaciones o más vas a ver la evolución".

### Pestaña "Denominación rápida"

- **Dos gráficos:** tiempo del bloque en segundos y errores, en cada evaluación.
- **En primaria,** con las bandas de corte de fondo y la nota "Más tiempo o más errores ubican el resultado en una franja más baja".
- **En inicial** no hay corte: leyenda "Sin franja de referencia".
- **Sin datos:** si no hay evaluaciones con tiempo registrado, un estado vacío.

### Pestaña "Entrenamiento"

- **Barras apiladas por semana,** de las **últimas 12 semanas**, con un color por origen y su leyenda.
  - Usá los mismos tonos que el historial de entrenamientos: consulta en celeste, tarea en lavanda y práctica en menta.
  - Un selector cambia el período a "Últimas 12 semanas" o "Todo".
- **Debajo, la tabla "Por juego"** (de `resumenPorJuego`), con estas columnas:
  - Juego;
  - Grado habilitado en casa;
  - Partidas: consulta, tarea y práctica;
  - Último resultado;
  - Mejor resultado.
- **Sin partidas:** estado vacío con un botón a "Entrenar en consulta".

### Para todos los gráficos

- **Accesibilidad:**
  - cada gráfico tiene un resumen en texto, por ejemplo "Conciencia silábica: de 50 % a 83 % en 3 evaluaciones; última franja: correcto";
  - un botón "Ver datos en tabla" muestra los mismos datos en una tabla accesible (WCAG 1.1.1);
  - el color nunca es la única señal;
  - todo se puede manejar con teclado.
- **Movimiento:** con `prefers-reduced-motion`, los gráficos aparecen sin animación.
- **Carga:**
  - la sección carga las partidas aparte, con su esqueleto, sin trabar el resto del detalle;
  - si la consulta falla, se muestra un mensaje corto y el resto de la página sigue andando.
- **Fechas:** en formato `dd/mm`, y `dd/mm/aaaa` en los tooltips y tablas, con `lib/fechas.ts`.

## 4. Pensando en S17

- Las funciones de `lib/seguimiento/` tienen que servir tal cual para el PDF.
- No metas en ellas nada de `recharts` ni de React.
- Si un cálculo hoy vive dentro de un componente del detalle y el PDF lo va a necesitar, movelo a `lib/`.

## Restricciones

- Solo para el profesional: el niño no ve esta sección. La ruta `/ninos/[id]` ya es del profesional.
- Español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- Revisión visual en 375 px y en escritorio. La app no tiene modo oscuro activo.
- Comandos de npm, desde cmd y con `--legacy-peer-deps`.
- No hagas commits ni cambies de rama, y no corras migraciones.
- Si necesitás sesión para probar, pedile a Donato que la inicie él. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- **Revisión a mano con un profesional de prueba:**
  - un niño de primaria con varias evaluaciones y partidas;
  - un niño de inicial;
  - un niño sin nada.

  Revisá también "Ver datos en tabla" y la vista en 375 px.
- Actualizá `docs/estado-proyecto.md`, con el estado de S16 y las decisiones que tomes.

## Al terminar

Resumí:
- los archivos creados y modificados;
- las pruebas, con cuántas pasan;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt.

No hagas commit.
