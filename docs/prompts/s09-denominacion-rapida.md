# S9 — Denominación rápida: cuadrícula de letras, números y colores, con tiempo y errores

## Contexto

Rama `s9-denominacion-rapida`. Leé primero `CLAUDE.md` y `docs/estado-proyecto.md`.

Hoy el bloque "Denominación Rápida" existe solo en el nivel inicial y funciona como un juego de tocar ("Tocá el cuadrado ROJO", preguntas 21 a 24 de `app/test/inicial/page.tsx`, con `RAPID\\\_COLORS`, temporizador y puntaje fraccionario). Se reemplaza por completo.

**Formato nuevo (definido con las especialistas):** se muestra una cuadrícula que mezcla **letras, números y colores**. Los colores son cuadrados pintados, no palabras. El niño nombra en voz alta todos los estímulos, lo más rápido que puede, de izquierda a derecha y fila por fila. El profesional maneja la computadora: inicia el cronómetro, lo detiene cuando el niño nombra el último estímulo y, al final, escribe la cantidad de errores, que fue contando por su cuenta. **El tiempo no se muestra en pantalla durante el ejercicio**, para no distraer al niño. No se registran autocorrecciones.

Cada nivel tiene **2 ejercicios** (2 cuadrículas distintas) dentro del bloque:

* **Primario:** cuadrícula de 5 filas × 10 columnas, con letras, números y colores.
* **Inicial:** el mismo formato con una cuadrícula más chica y **solo vocales** como letras.

El bloque se suma al nivel primario, que pasa de 8 a 9 bloques. Se registran el tiempo y los errores, además de correctas y total como en el resto de los bloques.

## Leer antes de tocar

* `CLAUDE.md`, `docs/estado-proyecto.md`
* `app/test/inicial/page.tsx` (bloque 5 actual y cómo arma los resultados por bloque)
* `app/test/primaria/page.tsx` (constante `BLOCKS`, campo `block` de cada pregunta y el tipo `professional\\\_rated`, que ya es una pregunta que califica el profesional)
* `lib/test/bloques.ts` (`BLOQUES\\\_POR\\\_NIVEL`, `bloqueCodigoPorOrden`), `lib/test/guardar-test.ts`, `lib/test/analisis.ts`
* `components/test/` (marco, tarjeta, botones, `resultados-evaluacion.tsx`, `final-evaluacion.tsx`), `lib/ninos/detalle.ts`, `lib/types/database.ts`
* `supabase/migrations/0001\\\_slice1\\\_esquema\\\_rls.sql` (tabla `test\\\_bloque\\\_resultado` y función `guardar\\\_test`)

## Reglas

* No hacer commits ni cambiar de rama. No ejecutar la migración contra Supabase.
* No cambiar las preguntas de los demás bloques ni su lógica.
* Estilo de la evaluación: el de `components/test/` (fondo liso, sin formas flotantes). Durante la cuadrícula, nada que distraiga: ni animaciones, ni personajes, ni cronómetro, ni contadores.
* Las cuadrículas son **fijas**: todos los niños ven la misma secuencia, en el mismo orden. Nada de mezclar al azar.

## Decisiones ya tomadas

1. **Posición del bloque en primario:** quinto, como en inicial (discriminación auditiva, conciencia fonológica, conciencia silábica, memoria auditiva, **denominación rápida**, comprensión lectora, correspondencia sonido-letra, reconocimiento visual, lectura de pseudopalabras). Los bloques 5 a 8 actuales del primario pasan a ser 6 a 9: actualizar `BLOCKS`, el `block` de cada pregunta y `BLOQUES\\\_POR\\\_NIVEL` de forma consistente. Las evaluaciones ya guardadas no cambian, porque cada fila guarda su `bloque\\\_codigo` y su `orden`.
2. **Puntaje:** por ejercicio, `total` = cantidad de estímulos de la cuadrícula y `correctas` = `total - errores` (mínimo 0). El bloque suma sus dos ejercicios: tiempo total, errores totales, correctas y total.
3. **Detalle por ejercicio:** se guardan también el tiempo y los errores de cada ejercicio por separado. Las franjas (S11) pueden necesitarlos.
4. **Sin autocorrecciones ni conteo en pantalla:** el profesional solo escribe la cantidad final de errores.

## Tareas

### 1\. Configuración: `lib/test/denominacion-config.ts`

* Tipos:

  * `Estimulo`: `{ categoria: "letra" | "numero" | "color", valor: string, nombre: string }`. Para un color, `valor` es la clave del color y `nombre` lo que dice el niño ("rojo").
  * `EjercicioDenominacion`: `{ id, nombre, filas, columnas, secuencia: Estimulo\\\["valor"]\\\[] }`.
  * `ConfigDenominacion`: estímulos del nivel por categoría, sus ejercicios y la fila de práctica.
* Colores: un mapa propio (`rojo`, `azul`, `verde`, `amarillo`, `negro`) a valores de color bien saturados y distinguibles entre sí. No usar los tokens de la interfaz, para que el color del estímulo no cambie con el tema claro u oscuro.
* `DENOMINACION\\\_POR\\\_NIVEL: Record<Nivel, ConfigDenominacion>`, con estos valores. Comentar arriba del archivo cuáles están confirmados y cuáles son provisorios:

  * **Primario:**

    * Letras A, E, S, D, P; números 2, 4, 6, 7, 9; colores rojo, azul, verde, amarillo y negro.
    * 2 ejercicios de 5 filas × 10 columnas (50 estímulos cada uno).
  * **Inicial:**

    * Vocales A, E, I, O, U; los mismos números y colores (los números, **provisorio**: confirmar con las especialistas si en sala de 4 y 5 se usan estos).
    * 2 ejercicios de 4 filas × 6 columnas (24 estímulos; **provisorio**).
* Reglas de cada secuencia (como en la hoja de referencia):

  * las categorías se alternan siempre en el mismo ciclo, **letra → número → color**, de corrido a lo largo de toda la cuadrícula, también al pasar de una fila a la otra;
  * dentro de cada categoría, todos los estímulos aparecen una cantidad de veces pareja (diferencia máxima de 1 entre el más y el menos usado);
  * el mismo estímulo no se repite en dos apariciones seguidas de su categoría;
  * los dos ejercicios de un nivel tienen secuencias distintas.

  Generá las secuencias una vez y escribilas como arreglos literales en el archivo, no las calcules en tiempo de ejecución.

* Textos configurables:

  * La **práctica**, que el profesional lee en voz alta: "Vamos a jugar con letras, números y colores. Decime el nombre de cada uno." La práctica es el único momento en el que se puede corregir al niño.
  * La **consigna**: "Ahora nombrá todos, lo más rápido que puedas y sin equivocarte. Empezá por acá y seguí fila por fila."
  * El **criterio de error**, que se muestra al profesional al cargarlos: "Cuentan como error las omisiones y los nombres equivocados."

### 2\. Lógica pura: `lib/test/denominacion.ts` + `lib/test/denominacion.test.ts`

* `resultadoEjercicio({ tiempoMs, errores, total })` → correctas acotadas a `\\\[0, total]`.
* `resultadoBloqueDenominacion(ejercicios)` → `{ tiempoMs, errores, correctas, total, detalle }` con la suma.
* `formatearTiempo(ms)` → `"1:05"` (minutos:segundos), y `"0:48"` para menos de un minuto.
* `validarSecuencia(config, ejercicio)`, que verifique las reglas del punto 1:

  * largo = filas × columnas;
  * solo estímulos del nivel;
  * ciclo de categorías;
  * conteos parejos;
  * sin repeticiones seguidas dentro de la categoría.

  Una prueba la corre sobre **todos** los ejercicios de los dos niveles, y otra comprueba que los dos ejercicios de cada nivel son distintos.

* Pruebas con Vitest al 100 % de líneas y ramas. Agregá estos módulos al `include` de cobertura de `vitest.config.mts`.

### 3\. Componente: `components/test/ejercicio-denominacion.tsx`

Un componente para un ejercicio, usado por las dos páginas. Flujo, en la misma tarjeta:

1. **Práctica.** Se muestra una fila con un estímulo de cada categoría, más el texto de práctica y una nota para el profesional: "Si no conoce algún nombre, enseñáselo ahora: es el único momento en que se lo puede corregir." Botón "Listo, pasar a la cuadrícula". En el segundo ejercicio del bloque la práctica no se repite.
2. **Preparado.** La consigna para leer en voz alta y la cuadrícula tapada o difuminada. Botón "Comenzar": al tocarlo se muestra la cuadrícula y empieza a medir el tiempo (`performance.now()`), **sin mostrar ningún cronómetro**.
3. **En curso.** Solo la cuadrícula, grande y legible:

   * letras y números en tipografía grande (Lexend), en mayúscula;
   * colores como cuadrados llenos, del mismo tamaño que el texto, sin palabras.

   Un único botón discreto, "Terminar", para cuando el niño nombra el último estímulo.

4. **Errores.** El profesional escribe la cantidad de errores en un campo numérico (entre 0 y el total), con el criterio de error a la vista. El tiempo **no** se muestra en este paso; aparece en los resultados al final de la evaluación. Botones "Repetir ejercicio" (vuelve a "Preparado" y descarta el tiempo) y "Confirmar".
* Teclado: "Comenzar" y "Terminar" accesibles con teclado y con foco visible. La barra espaciadora o Enter no deben terminar el ejercicio por accidente mientras está en curso.
* En celular la cuadrícula tiene que entrar sin desplazamiento horizontal, porque las celdas se achican.
* No mostrar el nombre del color en ningún atributo visible. El `aria-label` de cada celda puede llevarlo, para accesibilidad del profesional.

### 4\. Páginas de la evaluación

* `app/test/inicial/page.tsx`: reemplazar las preguntas 21 a 24 y todo lo exclusivo del juego viejo (`RAPID\\\_COLORS`, el temporizador y el puntaje fraccionario de `rapid\\\_naming`) por el bloque nuevo, con los dos ejercicios de `DENOMINACION\\\_POR\\\_NIVEL.inicial` uno tras otro. Que no quede código muerto del juego viejo.
* `app/test/primaria/page.tsx`: agregar el bloque en la posición 5 con `DENOMINACION\\\_POR\\\_NIVEL.primario`, y renumerar los bloques siguientes.
* La barra de progreso y la etiqueta del bloque funcionan igual que en el resto. Cada ejercicio cuenta como un paso.
* Salir a mitad de un ejercicio usa la confirmación de salida que ya existe (`useSalidaDelTest`).

### 5\. Guardado

* `lib/test/guardar-test.ts`: `ResultadoBloque` suma `tiempoMs?`, `errores?` y `detalle?`, y los envía como `tiempo\\\_ms`, `errores` y `detalle` solo en el bloque de denominación rápida.
* `lib/types/database.ts`: agregar las columnas nuevas.

### 6\. Migración `supabase/migrations/0006\\\_s9\\\_denominacion\\\_rapida.sql`

Comentada, idempotente, en `begin; … commit;`:

* `test\\\_bloque\\\_resultado`: agregar `tiempo\\\_ms int`, `errores int` y `detalle jsonb`, todas nullables (las evaluaciones viejas no las tienen).
* Constraints:

  * `tiempo\\\_ms > 0` y `errores >= 0` cuando no son null;
  * las tres columnas son null en cualquier bloque que no sea `denominacion\\\_rapida`;
  * `errores <= total`.
* `guardar\\\_test`: `create or replace` con la **misma firma** (así se conservan los permisos). Lee también `tiempo\\\_ms`, `errores` y `detalle` de cada bloque, y para `denominacion\\\_rapida` exige:

  * tiempo y errores presentes;
  * `correctas = total - errores`;
  * `detalle` como arreglo.

  Para los demás bloques los rechaza si vienen. Mensajes de error en español, que no digan "test".

* Después del `create or replace`, repetir `revoke` de `public` y `anon` y `grant` a `authenticated`, por si acaso.

### 7\. Pruebas de acceso: `supabase/tests/0006\\\_denominacion\\\_rapida.sql`

Escenarios que deben fallar, cada uno con su resultado esperado comentado:

* guardar denominación rápida sin tiempo;
* con errores mayores al total;
* con `correctas` que no coinciden;
* tiempo o errores en otro bloque;
* un usuario niño llamando a `guardar\\\_test`;
* un profesional sin vínculo activo.

Y uno que debe funcionar: una evaluación inicial completa con el bloque nuevo. Probá todo en el Postgres local que simula Supabase.

### 8\. Mostrar los resultados

* `components/test/resultados-evaluacion.tsx`: en la fila de denominación rápida, mostrar **tiempo** (`formatearTiempo`) y **errores** en lugar de la barra de porcentaje. Las evaluaciones viejas (sin tiempo) se muestran como hasta ahora.
* `lib/ninos/detalle.ts` y donde se lean los bloques: traer las columnas nuevas.

### 9\. Documentación

* `docs/estado-proyecto.md`:

  * S9 en el plan (estado "En revisión");
  * modelo de datos con las columnas nuevas;
  * bloques del primario (9);
  * definición vigente de denominación rápida;
  * migraciones: 0006 = S9.
* Las reservas siguientes se corren un número: **0007 = S10, 0008 = S12, 0009 = S17**. Actualizar la tabla del plan y la de migraciones.

## Fuera de alcance

* Franjas y valores de corte (S11). La recomendación sigue funcionando como hoy.
* Retirar los resultados del perfil del niño (S10).
* Grabar audio o reconocer voz.
* Registrar autocorrecciones.

## Criterio de hecho

* `npm test` y `npm run coverage` pasan, con 100 % en `denominacion.ts`.
* `npm run build` pasa y `npx tsc --noEmit` no suma errores a los 4 previos.
* La migración y sus pruebas corren bien en el Postgres local.
* Revisión manual en 375 px y en escritorio: una evaluación inicial y una primaria completas, incluidos "Repetir ejercicio" y la salida a mitad de un ejercicio. Durante la cuadrícula no aparece ningún tiempo.

## Al terminar, resumí

* Archivos creados, modificados y eliminados.
* Las cuadrículas generadas para cada ejercicio, escritas como grilla de texto (con el nombre de los colores), para revisarlas con las especialistas.
* Decisiones que tomaste fuera de lo pedido.
* Pasos para aplicar la migración y para probar a mano.
* Resultado de las pruebas, de la cobertura, del build y de `tsc`.



Ajustes:
Ajuste de S9, sin commits:

Denominación rápida se mide por tiempo y errores, no por porcentaje. En lib/test/analisis.ts agregá un filtro de bloques "porcentuales" (todos menos denominacion\_rapida) y usalo en:

\- el porcentaje general y el puntaje total que se calculan al terminar la evaluación (los que se mandan a guardar\_test),

\- "X de Y respuestas correctas" en resultados-evaluacion.tsx,

\- bloquesMasDebiles y ordenRecomendacion (la recomendación y "bloques con más errores" del historial).

La fila de denominación rápida se sigue mostrando con tiempo y errores, y en la base se siguen guardando correctas y total. Para evaluaciones viejas donde denominación no tiene tiempo, aplicá el mismo criterio (se excluye por código de bloque, no por tener tiempo).

Agregá las pruebas en analisis.test.ts, mantené el 100 % de cobertura y actualizá docs/estado-proyecto.md. Después corré test, coverage, tsc y build.

Ajustes de S9, sin commits:



1\. Orden de los bloques: denominación rápida va al final en los dos niveles.

&#x20;  - Inicial ya la tiene última (bloque 5 de 5): verificá que siga así.

&#x20;  - Primario: pasala de la posición 5 a la 9. Los bloques que hoy son 6 a 9 (comprensión lectora, correspondencia sonido-letra, reconocimiento visual, lectura de pseudopalabras) vuelven a ser 5 a 8, como antes de S9.

&#x20;  - Actualizá de forma consistente BLOQUES\_POR\_NIVEL, BLOCKS y el campo block de cada pregunta en app/test/primaria/page.tsx. Las evaluaciones ya guardadas no se tocan: cada fila tiene su propio orden.

&#x20;  - Revisá que la barra de progreso, la etiqueta de cada bloque y el guardado (bloqueCodigoPorOrden) sigan coincidiendo, con una prueba en lib/test que verifique el orden de los dos niveles.



2\. Detalle de denominación rápida en los resultados (components/test/resultados-evaluacion.tsx):

&#x20;  - La fila de denominación rápida sigue mostrando el total: correctas / total, tiempo y errores.

&#x20;  - Al final de la fila, un botón chico con un signo "+" que despliega debajo una sub-fila por ejercicio, leída de `detalle`: "Ejercicio 1", correctas / total, tiempo y errores. Al desplegar, el "+" pasa a "−".

&#x20;  - Accesible: <button> con aria-expanded, aria-controls y aria-label ("Ver el detalle por ejercicio"), foco visible y operable con teclado.

&#x20;  - Animación suave al desplegar, respetando reducir movimiento (components/motion).

&#x20;  - Si `detalle` no está (evaluaciones viejas), no se muestra el "+".

&#x20;  - Mismo comportamiento en la pantalla final de la evaluación y en el detalle de una evaluación del historial. Revisá 375 px y modo oscuro.

&#x20;  - Si quedó hecho el ajuste anterior (desglose siempre visible debajo de la fila), reemplazalo por este.



3\. Actualizá docs/estado-proyecto.md (orden de los bloques del primario y la vista del detalle). Después corré test, coverage, tsc y build.

