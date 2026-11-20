# S13a — Ajustes después de la revisión

## Contexto

Seguimos en la rama `s13a-marco-entrenamiento`, sobre lo que hiciste en `docs/prompts/s13a-marco-entrenamiento.md`. Donato lo revisó en la app. Estos son los ajustes. S13b va a construir los demás juegos sobre este marco, así que todo lo que es común tiene que quedar resuelto acá.

## Ajustes

### 1. El niño no ve bloques

En `/entrenamiento` (área del niño), los juegos ya no se agrupan por bloque. Van **todos en una sola cuadrícula de tarjetas**, en el orden del catálogo (el principal de cada bloque primero, como ahora). Hablarle al niño de "discriminación auditiva" lo confunde.

- **Tarjeta del juego:** sacá el chip del bloque. Queda el icono, el nombre, las estrellas y los grados.
- **Encabezado del juego** (`marco-juego`): cuando juega el niño (práctica o tarea), no se muestra el chip del bloque. En consulta, el profesional lo sigue viendo.
- **Área del profesional** (`/ninos/[id]/entrenamiento`): mantiene la agrupación por bloque, porque al profesional le sirve. El nombre del bloque ya está en el título de cada sección, así que la tarjeta tampoco lleva el chip.

### 2. Tarjeta de entrenamiento en el inicio del profesional

Hoy el profesional llega al entrenamiento por Inicio → Mis niños → Ver detalle → Entrenar en consulta. Ese camino queda, y se suma un acceso directo.

- **En `/dashboard`, rol profesional:** una tarjeta nueva, "Entrenamiento", junto a las de Evaluación y Mis niños, con el mismo estilo. Lleva a `/entrenar`.
- **Página nueva `/entrenar`** (solo profesional), con la misma estructura que `/test`:
  - Tabla de los niños con vínculo activo: nombre y apellido, nivel, **último entrenamiento** y un botón "Entrenar en consulta" que va a `/ninos/[id]/entrenamiento`.
  - El último entrenamiento muestra fecha, juego y grado de la partida más reciente que el profesional puede ver (`entrenamiento_partida`, con la RLS de la 0008). Si no hay ninguna, "Todavía no entrenó".
  - En 375 px la tabla pasa a tarjetas, como en `/test`.
- Sumá `/entrenar` a las rutas protegidas del middleware.
- La gestión de tareas va a tener **su propia tarjeta** en el inicio (S15). No la agregues ahora.

### 3. Grados bloqueados: explicar en lugar de prohibir

- Los grados no habilitados ya no usan `cursor-not-allowed` ni se ven "apagados" como si fueran un error. Siguen con el candado y no inician el juego.
- **Al pasar el cursor, con el foco del teclado o con un toque en celular**, aparece un cartelito con un texto para el niño:
  - "¡Jugá bien el grado 1 para desbloquear este!" (con el número del grado anterior).
  - **Nunca** se menciona el 80 % ni ningún porcentaje: es un cálculo interno.
  - Usá el `Tooltip` de `components/ui/` si existe y anda en táctil. Si no, un `Popover` que se abre al tocar.
  - Accesible: `aria-describedby` y que se cierre con Escape.
- Lo mismo vale para cualquier otro elemento bloqueado del área del niño.

### 4. El switch "A a" siempre muestra "A a"

En `/entrenamiento`, el switch queda dentro del contenedor con `data-letra` y hereda la transformación: muestra "A A" o "a a". El propio switch tiene que quedar fuera de la transformación (`normal-case` o fuera del contenedor) y mostrar siempre una "A" mayúscula y una "a" minúscula, con la opción activa resaltada. Dentro de los juegos ya está bien: revisá que siga así.

### 5. Consigna centrada

La pantalla "¿Cómo se juega?" deja mucho espacio vacío arriba y la tarjeta queda baja y corrida a la derecha.

- En escritorio, el **personaje y la tarjeta van juntos y centrados** en la pantalla, vertical y horizontalmente, con un ancho máximo cómodo de unos 900 px. El personaje va a la izquierda de la tarjeta, a su misma altura.
- En 375 px, el personaje va chico arriba y la tarjeta debajo, también centrados.
- Revisá con el mismo criterio las pantallas de juego y la final: nada pegado abajo con aire vacío arriba.

### 6. Iconos de los juegos

En `public/emoji/` vienen 9 WebP nuevos, y `iconos.json` (en la raíz del zip) dice qué emoji corresponde a cada archivo: 🕵️ 🎶 🎧 🪐 ⏱️ 📖 ✍️ 🔎 👀.

- Sumá esas entradas al mapa `emojis` de `lib/entrenamiento/bancos.json`, sin tocar el resto del archivo, y después borrá `iconos.json`.
- Comprobá que ningún icono del catálogo use el emoji del sistema. Agregá una prueba en `bancos.test.ts` que lo verifique para los 14 juegos.

### 7. Limpieza que quedó pendiente

- Borrá de `lib/` los archivos heredados que ya nadie importa:
  - `games-catalog.ts`, `exercises.ts`, `race-engine.ts`, `reading-content.ts`, `linguistic-rules.ts`, `shuffle-utils.ts` y `lex-dialogues.json`;
  - `name-storage.ts` y `hooks/use-child-name.ts`;
  - `mock-data/dashboard-data.ts` y `types/dashboard.ts`.

  Antes de borrar cada uno, confirmá con una búsqueda que nadie lo importa.
- En `app/robots.ts`, sacá la regla de `/games/*/results`.
- Actualizá los pendientes de `docs/estado-proyecto.md` y sumá la ruta `/entrenar` a la tabla de pantallas.

## Restricciones

Las mismas de `docs/prompts/s13a-marco-entrenamiento.md`:

- Revisá en 375 px y en escritorio.
- Con reducir movimiento, nada se desplaza.
- WCAG 2.2 AA y objetivos táctiles de al menos 44 px.
- Textos con voseo.
- Comandos de npm desde cmd y con `--legacy-peer-deps`.
- Sin commits, sin cambios de rama y sin migraciones contra Supabase.

## Verificación

- `npm test`, `npm run coverage`, `npx tsc --noEmit` (sigue en 0) y `npm run build` pasan.
- Revisión visual de:
  - `/entrenamiento`: cuadrícula sin bloques, cartelito en los grados bloqueados y switch "A a";
  - la consigna centrada en los dos tamaños;
  - `/dashboard` y `/entrenar` del profesional;
  - `/ninos/[id]/entrenamiento`.

## Al terminar

Resumí:
- qué cambiaste en cada punto;
- los archivos creados, modificados y borrados;
- las pruebas.

No hagas commit.
