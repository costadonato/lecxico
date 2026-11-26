# S16 — Ajustes después de la revisión de Donato (26/11)

**Rama:** `s16-graficos-seguimiento`, la misma. Los cambios van como commits nuevos en el PR #26 · **Migración:** ninguna

Antes de empezar, leé lo que hiciste en S16 (`lib/seguimiento/` y la sección "Seguimiento" de `/ninos/[id]`).

## 1. Las franjas tienen que verse siempre, aunque el corte sea 100 %

**El problema:** hoy las bandas van de `intermedioDesde / total` a `correctoDesde / total`. En los bloques con pocos ítems, "correcto" puede empezar justo en 100 %, y entonces la banda verde no tiene altura:
- Reconocimiento visual: 2 de 2;
- Comprensión lectora: 3 de 3.

**La solución:** como los puntajes posibles son discretos (k / total), el borde entre dos franjas va **a mitad de camino entre el último valor posible de la franja de abajo y el primero de la de arriba**:
- borde intermedio / correcto = `(correctoDesde − 0,5) / total`;
- borde a observar / intermedio = `(intermedioDesde − 0,5) / total`.

**Resultado en Reconocimiento visual (total 2):**

| Franja | Rango |
|---|---|
| A observar | 0 % a 25 % |
| Intermedio | 25 % a 75 % |
| Correcto | 75 % a 100 % |

- **Así se ven las tres franjas** y cada punto (0, 50 y 100 %) cae dentro del color de su franja.
- **El borde inferior no baja de 0 %:** si `intermedioDesde` es 0, se acota.
- **Dónde va:** el cambio es en `bandasDeFranja` (`lib/seguimiento/evaluaciones.ts`). Actualizá sus pruebas con Reconocimiento visual, Comprensión lectora, un corte "normal" (por ejemplo 5 de 7) y un bloque con corte por grado.
- **Prueba nueva:** para todos los bloques con corte y cada valor posible de aciertos, el punto cae dentro de la banda de su franja.
- **Qué no cambia:** solo el dibujo. El cálculo de la franja (`franjaDeBloque` en `lib/test/franjas.ts`) queda igual.

## 2. Denominación rápida vuelve a "Evaluaciones"

Es un bloque más de la evaluación, así que va en la grilla de "Evaluaciones" y **se saca la pestaña "Denominación rápida"**. La sección queda con dos pestañas: "Evaluaciones" y "Entrenamiento".

**Ubicación:** la tarjeta de denominación rápida va en la grilla en su orden del test (`BLOQUES_POR_NIVEL`): en primaria, al final.

**Contenido de la tarjeta:**
- **Título y chip:** el nombre del bloque y el chip de la franja de la última evaluación, como en las demás. En inicial dice "Sin franja de referencia".
- **Dos gráficos chicos**, uno debajo del otro:
  - **"Tiempo (segundos)":** el tiempo del bloque en cada evaluación;
  - **"Aciertos (%)":** `(total − errores) / total`, de 0 a 100 %, en cada evaluación. **Reemplaza al gráfico de errores sueltos.**
- **Sin bandas de color de fondo en ninguno de los dos,** ni en inicial ni en primaria. Solo la línea y los puntos sobre la grilla neutra.
- **Una nota chica:** "Menos tiempo es mejor."
- **Resumen en texto:** de tiempo y de aciertos, por ejemplo "Denominación rápida: tiempo de 2:31 a 2:05 y aciertos de 92 % a 98 % en 3 evaluaciones; última franja: correcto". El tiempo va en formato `m:ss`, con `formatearTiempo` de `lib/test/denominacion.ts`.
- **"Ver datos en tabla":** con las columnas Fecha, Tiempo, Errores, Aciertos (%) y Franja.
- **Sin tiempo registrado:** en las evaluaciones viejas sin tiempo, la tarjeta muestra "Sin tiempo registrado en estas evaluaciones" en lugar de los gráficos.
- **Altura:** la tarjeta puede ocupar el alto de dos filas de la grilla, o ser más alta que las demás. Que no deforme la grilla en 375 px.

En `lib/seguimiento/evaluaciones.ts`, `serieDenominacion` devuelve `aciertosPorcentaje` en lugar de, o además de, `errores`, y se saca `bandasDenominacion` si queda sin uso. Actualizá sus pruebas.

## 3. Ver un gráfico en grande

**Cómo se abre:** al tocar un gráfico de la pestaña "Evaluaciones" se abre un **modal** (`components/ui/dialog.tsx`) con ese gráfico en grande.
- **Accesibilidad:** el gráfico, o un botón que lo cubre, es un botón con `aria-label` "Ampliar el gráfico de [bloque]".
- **Ícono:** un ícono chico de ampliar (`Maximize2`) en la esquina del gráfico, para que se note que se puede tocar.

**Qué muestra el modal:**
- **Título:** el nombre del bloque y el chip de la franja de la última evaluación.
- **El mismo gráfico en grande:** ocupa casi todo el ancho del modal, más o menos 720 px en escritorio y el ancho de la pantalla en 375 px. Tiene:
  - fechas completas (`dd/mm/aaaa`) en el eje X, inclinadas si no entran;
  - las bandas de franja, salvo en denominación rápida;
  - tooltip;
  - los valores escritos sobre cada punto, si entran.
- **En denominación rápida,** los dos gráficos, tiempo y aciertos, uno debajo del otro.
- **Debajo del gráfico:** el resumen en texto y la tabla de datos, ya abierta.
- **Cierre:** con Escape o con la cruz, y el foco vuelve al gráfico que lo abrió.

**Código:** reusá el componente del gráfico con una prop de tamaño. No dupliques la lógica.

**Teclado:** con Tab y las flechas se siguen recorriendo los puntos dentro del gráfico chico. Para abrir el modal, Enter o Espacio sobre el botón de ampliar. Si el gráfico entero es el botón, el recorrido de puntos con flechas queda solo dentro del modal.

## Restricciones

- Español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- Revisión en escritorio y en 375 px, con Blas (primaria) y con Nico (inicial).
- Con `prefers-reduced-motion`, el modal aparece sin animación de escala.
- Comandos de npm, desde cmd y con `--legacy-peer-deps`.
- No hagas commits ni cambies de rama.
- Si necesitás sesión para probar, pedile a Donato que la inicie él. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- **Reconocimiento visual y Comprensión lectora** muestran las tres franjas, y cada punto cae en su color.
- **Denominación rápida** está en la grilla de "Evaluaciones", con tiempo y aciertos y sin fondos de color.
- **El modal** abre desde cada gráfico, con el mouse y con el teclado, y en 375 px se ve completo.
- Actualizá `docs/estado-proyecto.md`.

## Al terminar

Resumí los archivos modificados, las pruebas, los errores de `tsc` y cualquier diferencia con este prompt. No hagas commit.
