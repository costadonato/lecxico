# Estilo del lado del profesional: fondo rojizo, tarjetas de vidrio y actividad reciente

## Contexto

El lado del niño tiene identidad propia: colores, Lex grande, decoración. El del profesional se ve demasiado blanco y plano: fondo crema, tarjetas blancas opacas y casi sin color.

**La disposición de los elementos no cambia.** Este cambio es de aspecto, más dos agregados en el inicio:
- la tarjeta "Tareas" como "Próximamente";
- un botón circular de actividad reciente.

Antes de empezar, leé:
- `CLAUDE.md`;
- en `app/globals.css`: `fondo-profesional`, `fondo-nino` y los tokens de color;
- `components/fondo-decorado.tsx` (`FondoProfesional`);
- `components/inicio/inicio-profesional.tsx`, `app/dashboard/page.tsx` y `components/pagina-app.tsx`.

No hace falta ninguna migración.

**Los valores de este prompt ya están elegidos.** Donato los aprobó en una maqueta (tono "Durazno", intensidad del fondo al 120 % y opacidad del vidrio al 66 %). Usá estos números tal cual; ajustá solo si algo no cumple el contraste.

## 1. Fondo rojizo pastel

- **`fondo-profesional`:** reemplazá el fondo actual por este:
  ```css
  background-color: #fbe9e4;
  background-image:
    radial-gradient(44rem 32rem at -8% -12%, color-mix(in oklab, var(--rojo) 24%, transparent), transparent 70%),
    radial-gradient(40rem 30rem at 108% 0%, color-mix(in oklab, #f4a6b6 36%, transparent), transparent 70%),
    radial-gradient(44rem 34rem at 105% 105%, color-mix(in oklab, var(--mandarina) 19%, transparent), transparent 70%),
    radial-gradient(34rem 26rem at -6% 100%, color-mix(in oklab, var(--lavanda) 12%, transparent), transparent 70%);
  ```
- **`FondoProfesional`:**
  - Las manchas celeste y roja de hoy se van, porque el color ya lo da `fondo-profesional`.
  - La trama de puntos queda como está, con la máscara que se desvanece hacia abajo.
  - Hay tres anillos flotantes:
    - uno de 64 px con borde de 6 px en blanco al 70 %, arriba a la derecha;
    - uno de 40 px con borde de 6 px en rojo al 30 %, abajo a la izquierda;
    - uno grande de unos 300 px con borde de 2 px en blanco al 55 %, asomando desde abajo, cerca del centro.
  - Sin letras ni estrellas de colores.
- **Alcance:** el cambio vale para todas las pantallas que usan `fondo-profesional` o `FondoDecorado variante="profesional"`:
  - el inicio, `/ninos`, el detalle del niño, `/entrenar`, `/ninos/[id]/entrenamiento`, el perfil, las notificaciones y la elección de niño para la evaluación;
  - **no** cambian las pantallas que ve el niño durante la evaluación ni los juegos del entrenamiento: siguen con su estilo.

## 2. Tarjetas de vidrio

- **Utilidades nuevas en `globals.css`:**
  - **`vidrio`:**
    ```css
    background: rgb(255 255 255 / 0.66);
    backdrop-filter: blur(14px) saturate(1.2);
    border: 1px solid rgb(255 255 255 / 0.65);
    box-shadow: 0 1px 2px rgb(120 30 30 / 0.05), 0 14px 34px -14px rgb(168 29 34 / 0.28);
    ```
    Con `-webkit-backdrop-filter`, para Safari.
  - **`vidrio-fuerte`:** igual que `vidrio`, pero con el fondo al 80 %. Va en los paneles con mucho texto: listas, tablas, formularios, el historial y el panel de actividad reciente.
- **Contraste:** todo texto sobre vidrio cumple WCAG AA (4,5:1; 3:1 en textos grandes) contra el peor punto del fondo. Si una combinación no llega, subí la opacidad de esa superficie; no aclares el texto. Verificalo con las herramientas del navegador en el inicio y en el detalle del niño.
- **Dónde se aplica:** en el lado del profesional, las superficies que hoy son `bg-card` blancas pasan a `vidrio` o a `vidrio-fuerte`. Si conviene, usá un ámbito (`.fondo-profesional`) que redefina `--card` en lugar de tocar componente por componente, pero sin afectar a las pantallas del niño. Incluye:
  - el panel del saludo;
  - las tarjetas del inicio;
  - el encabezado (`AppHeader`) en modo profesional;
  - las listas y los paneles de `/ninos`, del detalle y de `/entrenar`.
  - Los diálogos (`Dialog` y `AlertDialog`) quedan opacos.
- **Rojo en los detalles:**
  - El panel del saludo lleva `vidrio` con un degradado leve, de `rojo-suave` al 74 % arriba a la izquierda a blanco al 66 % (`linear-gradient(120deg, …)`), para diferenciarse de las tarjetas.
  - Las flechas circulares de las tarjetas van en blanco al 70 % con borde blanco al 80 %. Al pasar el mouse, se pintan de rojo con la flecha blanca, como ya hacen.
- **Mismo alto:** las tarjetas del inicio tienen todas el mismo alto. La de Entrenamiento ya no tiene un borde amarillo distinto del resto.

## 3. Tarjeta "Tareas" como "Próximamente"

- En el inicio del profesional, sumá una cuarta tarjeta: **"Tareas"**, con la descripción "Asigná juegos para practicar en casa", tono lavanda y el ícono `ListChecks`.
- **No es clickeable.** Lleva un chip "Próximamente", el ícono y el texto un poco atenuados (sin bajar del contraste AA) y `aria-disabled="true"`. La flecha no se muestra.
- Con 4 tarjetas, la grilla queda en 2 × 2 en escritorio y una columna en celular.
- La tarjeta se activa en S15, con el enlace a la gestión de tareas.

## 4. Actividad reciente

**Botón:**
- Botón **circular** de 48 px, con `vidrio`, el ícono `History` (22 px) en `rojo-fuerte`, ubicado **arriba a la izquierda del contenido del inicio**: debajo del encabezado y encima del panel del saludo, alineado con su borde izquierdo (18 px por debajo del encabezado).
- `aria-label`: "Actividad reciente".
- Lleva una insignia roja con el número de actividades de los últimos 7 días: arriba a la derecha del botón, de 20 px, texto blanco en negrita y borde blanco de 2 px. Se esconde si no hay ninguna y muestra "9+" si pasa de 9.

**Panel:**
- Al tocarlo se despliega, anclado al botón:
  - **en escritorio,** un popover de unos 380 px de ancho que se abre hacia abajo desde la esquina del botón, con escala y fundido (0,18 s) y por encima del panel del saludo;
  - **en celular,** un panel que sube desde abajo, a todo el ancho y con las esquinas de arriba redondeadas.
  - Con `prefers-reduced-motion`, solo fundido.
- Fondo `vidrio-fuerte`, título "Actividad reciente" y las **10** más recientes, de la más nueva a la más vieja.
- **Cada fila:**
  - un punto de color: rojo para una evaluación y mandarina para una partida;
  - el nombre del niño (nombre e inicial del apellido);
  - qué fue: "Evaluación de primaria" o "Memotono · grado 2 · Práctica";
  - la fecha relativa: "hoy", "ayer", "hace 3 días" o la fecha corta.
  - Cada fila es un enlace al detalle del niño (`/ninos/[id]`).
- **Sin actividad:** "Todavía no hay actividad. Cuando evalúes o entrenes a un niño, va a aparecer acá."
- **Mientras carga:** filas esqueleto.
- **Si falla la consulta:** un mensaje corto. El resto del inicio sigue funcionando.
- **Cierre:** Escape, tocar afuera o tocar otra vez el botón. El foco vuelve al botón al cerrar.
- **Accesibilidad:** `aria-expanded` y `aria-controls`, y el foco va al título del panel al abrir.

**Datos** (`lib/inicio/actividad.ts`, lógica pura con pruebas más una función de consulta que recibe el cliente):
- **Fuentes:**
  - las evaluaciones (tabla `test`) de los niños vinculados;
  - las partidas (`entrenamiento_partida`) de los niños vinculados.
- **Las RLS deciden qué se ve.** No agregues filtros que muestren de más, ni consultes con una clave de servicio.
- **Consultas:** dos consultas limitadas (las 10 más recientes de cada fuente). Se mezclan en el cliente, se ordenan por fecha y se toman 10.
- **Nombres:** los nombres de los niños salen de la lista de vinculados que ya existe (`lib/ninos/`).
- **Pruebas:**
  - la mezcla y el orden;
  - el texto de cada fila (evaluación y partida, con los tres orígenes);
  - las fechas relativas, con un reloj inyectado;
  - el contador de 7 días y el "9+".

## Restricciones

- **Revisión visual:** en 375 px y en escritorio, en todas las pantallas del profesional mencionadas. La app no tiene modo oscuro activo.
- **Movimiento:** con `prefers-reduced-motion`, nada se desplaza.
- **Accesibilidad:** sin incumplimientos WCAG 2.2 A ni AA. El contraste del vidrio es el punto a vigilar.
- **Rendimiento:** el desenfoque se aplica a las superficies, no a elementos chicos repetidos por cientos. Si una lista larga se pone lenta en celular, usá `vidrio-fuerte` sin desenfoque en sus filas.
- **Texto:** en español rioplatense, con voseo.
- **Comandos:** de npm, desde cmd y con `--legacy-peer-deps`.
- **Git y base:** no hagas commits ni cambies de rama, y no corras migraciones contra Supabase.
- **Contraseñas:** si necesitás sesión para probar, pedile a Donato que la inicie él en el navegador. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales (sumá `lib/inicio/actividad.ts` a `coverage.include`).
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- **Revisión visual:** capturas del inicio, `/ninos`, el detalle de un niño y `/entrenar`, antes y después.
- **Las pantallas del niño no cambiaron:** inicio del niño, evaluación y juegos.

## Al terminar

Resumí:
- los archivos creados, modificados y borrados;
- las pruebas, con cuántas pasan;
- los errores de `tsc`;
- los valores de contraste que mediste;
- lo que no pudiste probar;
- cualquier diferencia con este prompt.

No hagas commit.
