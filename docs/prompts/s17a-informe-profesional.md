# S17a — Informe PDF del profesional

**Tarjeta de Trello:** https://trello.com/c/pUKA5i0N · **Rama:** `s17-informes` (S17a y S17b van en la misma rama y en un solo PR) · **Migración:** ninguna en esta parte

## Contexto

La propuesta V8 pide un **informe exportable en PDF** para el profesional con este contenido mínimo:
- datos del niño;
- fecha y nivel;
- resultado y franja de cada bloque;
- tiempo y errores en denominación rápida;
- tareas y práctica en casa realizadas;
- la aclaración de que no constituye un diagnóstico.

El diseño lo acordamos con Donato el 26/11 y está más abajo. S17b, que viene después en la misma rama, suma el informe del tutor reusando este mismo generador.

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `lib/seguimiento/`, de S16: los cálculos de series se reusan tal cual;
- `lib/test/franjas.ts` y `components/test/franja.tsx`;
- `lib/ninos/detalle.ts`, `app/ninos/[id]/page.tsx` y la página del detalle de una evaluación.

## Diseño acordado

**Un solo botón, "Generar informe",** en las acciones del encabezado de `/ninos/[id]`. Abre un diálogo con estas opciones:

1. **Contenido:** "Evaluación", "Seguimiento" o ambos.
   - Por defecto van **ambos**: es lo que cubre el contenido mínimo de la propuesta.
   - Si no hay ninguna marcada, "Generar" queda deshabilitado con su motivo visible.
2. **Si incluye la evaluación:**
   - **Cuál:** un selector con las evaluaciones visibles (fecha y nivel). Por defecto, la última.
   - **Qué sale:**
     - tabla de bloques con aciertos, total, porcentaje y franja;
     - tiempo y errores de denominación rápida;
     - leyenda "Sin franja de referencia" donde corresponda.
   - **Casilla "Incluir recomendación",** marcada por defecto: los bloques en "intermedio" y "a observar" con sus juegos vinculados, como en el detalle.
3. **Si incluye el seguimiento:**
   - **Período:** "Último mes", "Últimos 3 meses" (por defecto), "Todo" o "Elegir fechas", con desde y hasta.
   - **Secciones,** con casillas, todas marcadas por defecto:
     - "Evolución de las evaluaciones": gráficos por bloque con sus franjas;
     - "Denominación rápida": tiempo y errores;
     - "Entrenamiento por juego": la tabla de S16 más un gráfico de partidas por semana apiladas por origen;
     - "Tareas": asignadas en el período, con estado y fecha de realización;
     - "Práctica en casa": cantidad de partidas y juegos practicados en el período.
4. **Autoría:** casilla "Incluir lo registrado por otros profesionales", marcada por defecto.
   - Solo aparece si el tutor compartió el historial (`vinculo.comparte_historial`).
   - Si se desmarca, salen las evaluaciones y las partidas de consulta y de tarea de otros profesionales.
   - La práctica en casa no tiene autor y **siempre** se incluye.
   - Donde hay datos de otros profesionales, las tablas llevan una columna "Registrado por", con el nombre si la RLS deja leerlo o, si no, "Otro profesional".
5. **"Observaciones del profesional":** texto libre de hasta 2000 caracteres, con contador. Sale impreso al final y **no se guarda** en ningún lado.

**Atajo:** en el detalle de una evaluación, el botón "Descargar informe" abre el mismo diálogo con esa evaluación elegida.

**Siempre van, aunque no se elijan:**
- **Encabezado:**
  - logo Lecxico (`LogoLecxico` como SVG);
  - título "Informe de evaluación", "Informe de seguimiento" o "Informe de evaluación y seguimiento";
  - quién lo emite (nombre del profesional);
  - fecha de emisión;
  - período, si lo hay.
- **Datos del niño:** nombre y apellido, fecha de nacimiento y edad, etapa escolar, nivel, y vinculado desde.
- **Aclaración final:** "Este informe es orientativo y no constituye un diagnóstico. Las franjas son referencias provisorias derivadas de la bibliografía, no normas poblacionales. La interpretación de los resultados corresponde al profesional." Más una línea de confidencialidad: "Contiene datos personales de un niño. Uso confidencial (Ley 25.326)."
- **Pie de cada página:** "Lecxico · Confidencial" y "Página N de M".

## 1. Modelo del informe (`lib/informes/`)

Lógica pura, sin React ni base de datos, con pruebas (80 % de líneas y 90 % de ramas). Va en `coverage.include`.

- **`opciones.ts`:** el tipo `OpcionesInforme` y `opcionesPorDefecto(detalle)`, más la validación: al menos un contenido, fechas válidas con desde ≤ hasta, y observaciones de hasta 2000 caracteres.
- **`periodo.ts`:** `rangoDelPeriodo(opcion, hoy)` devuelve las fechas desde y hasta, en hora de Argentina. Las fechas a elección incluyen el día "hasta" completo.
- **`modelo.ts`:** `construirInforme(datos, opciones, variante)` devuelve un objeto JSON plano, el **modelo**, con todo lo que se imprime ya calculado: textos, filas de tablas y series de gráficos (de `lib/seguimiento/`).
  - **El PDF no calcula nada:** solo dibuja el modelo.
  - **`variante`:** `"profesional"` ahora; `"tutor"` en S17b, que **nunca** lleva franjas, bandas ni recomendación.
  - **Filtros:** período, autoría (`tests.profesional_id` y `partidas.profesional_id` contra el usuario actual) y secciones.
- **Pruebas:**
  - cada combinación de contenido;
  - período vacío, que da secciones con "Sin registros en el período";
  - el filtro de autoría, donde la práctica siempre queda;
  - un niño sin evaluaciones;
  - un bloque sin referencia;
  - denominación rápida de inicial (sin corte) y de primaria;
  - la variante tutor sin ningún campo de franja ni de recomendación (comprobalo recorriendo el objeto).

## 2. Datos (`lib/informes/datos.ts`)

- Reusá `cargarDetalleNino` para el niño, el vínculo y las evaluaciones, y `cargarPartidasSeguimiento` (S16) para todas las partidas.
- **Tareas:** de `entrenamiento_tarea` con sus `entrenamiento_tarea_item`, con la RLS de la 0008. Si S15 (Camila) ya dejó una función para leerlas, usá esa.
- **Nombre del profesional que emite:** de su propio perfil.
- **Nombres de otros profesionales:** solo si la RLS deja leerlos. Si no, "Otro profesional". No agregues permisos.

## 3. PDF (`components/informes/pdf/`)

- **Librería:** instalá `@react-pdf/renderer` con `--legacy-peer-deps` y revisá que sea compatible con React 19.
- **Carga diferida:** el módulo del PDF se carga con `import()` dinámico al tocar "Generar", así no pesa en la carga de la página.
- **Tipografía:**
  - registrá Lexend (regular y bold) con archivos TTF en `public/fonts/`. Es licencia OFL; dejá el archivo de licencia al lado.
  - si no se puede, Helvetica, pero avisalo.
- **Diseño A4, sobrio y legible** (es un documento profesional, no un juego):
  - márgenes de 2 cm;
  - títulos de sección con una barra del rojo de marca;
  - tablas con filas alternadas;
  - el chip de franja con texto y color: correcto en menta, intermedio en sol, a observar en rojo y sin franja en gris;
  - nada de fondos llenos de color que gasten tinta.
- **Gráficos como SVG de react-pdf** (`Svg`, `Line`, `Rect`, `Text`), dibujados a mano a partir de las series del modelo:
  - líneas chicas por bloque con las bandas de franja de fondo, en grilla de 2 columnas;
  - tiempo y errores de denominación rápida;
  - barras apiladas por semana.
  - Cada gráfico lleva al lado o debajo un resumen en texto, como en S16.
- **Saltos de página:** sin títulos huérfanos al pie (`minPresenceAhead` o `wrap={false}` donde corresponda) y sin filas de tabla partidas.
- **Nombre del archivo:** `Informe-Lecxico_Apellido-Nombre_aaaa-mm-dd.pdf`, sin tildes ni espacios.

## 4. Diálogo (`components/informes/dialogo-informe.tsx`)

- Con los componentes de `components/ui/` (`Dialog`, `Checkbox`, `RadioGroup`, `Select`, `Textarea`) y el estilo del profesional.
- **"Generar PDF":**
  - mientras arma el PDF, el botón muestra "Generando…" y no se puede volver a tocar;
  - al terminar, se descarga el archivo y aparece el aviso "Informe descargado";
  - si falla, se muestra un mensaje corto y el diálogo queda abierto con las opciones como estaban.
- **Accesible:**
  - etiquetas en todos los campos;
  - el foco va al título al abrir;
  - Escape cierra;
  - los grupos de opciones con `fieldset` y `legend`.
- **En celular,** el diálogo se puede desplazar y los botones quedan a la vista.

## 5. Evidencia para el informe final

- **Un script** (`scripts/informe-ejemplo.tsx` o una prueba de Vitest en entorno node con `renderToBuffer`) que genere `docs/evidencias/informe-ejemplo.pdf` a partir de **datos ficticios**:
  - un niño de primaria con 3 evaluaciones;
  - partidas de los tres orígenes;
  - 2 tareas;
  - observaciones;
  - con todas las secciones.
- **Una prueba** que compruebe que el render no falla con el modelo mínimo (solo evaluación) ni con el completo.

## Restricciones

- Solo el profesional genera este informe. El niño no ve el botón.
- No se suben datos a ningún servicio: el PDF se arma en el navegador con los datos que la RLS ya deja leer.
- Español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- Revisión visual del diálogo en 375 px y en escritorio, y del PDF abierto en el navegador.
- Comandos de npm, desde cmd y con `--legacy-peer-deps`.
- No hagas commits ni cambies de rama, y no corras migraciones.
- Si necesitás sesión para probar, pedile a Donato que la inicie él. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- **El PDF de ejemplo** está en `docs/evidencias/` y se ve bien: sin títulos huérfanos, con los gráficos legibles y el pie en todas las páginas.
- **Prueba con un profesional real:**
  - un informe de solo evaluación;
  - uno de solo seguimiento de los últimos 3 meses;
  - uno de ambos con observaciones;
  - uno sin lo de otros profesionales.
- Actualizá `docs/estado-proyecto.md` con el estado de S17a.

## Al terminar

Resumí:
- los archivos creados y modificados;
- la dependencia nueva y su versión;
- las pruebas;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt.

No hagas commit. Después sigue S17b en la misma rama.
