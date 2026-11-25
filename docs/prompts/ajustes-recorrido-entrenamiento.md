# Ajustes del recorrido del entrenamiento (25/11)

## Contexto

El 25/11 se hizo un recorrido con sesión real de los 14 juegos en consulta. Anduvo todo; quedan dos ajustes chicos. Leé `CLAUDE.md` antes de empezar.

No hace falta migración. Lo que no se nombra acá no cambia. En particular, el resumen de cada lluvia en Lluvia ("8 atrapados · 1 toque de más") **queda como está**.

## 1. Frase final según el resultado

Hoy, al terminar una partida, Lex o Lumo dicen siempre una frase de festejo (`FRASES.final` en `lib/entrenamiento/presentacion.ts`), aunque el resultado sea 0 %. Desde ahora la frase depende del porcentaje de la partida (`correctas / total`, redondeado como en el resto del marco):

| Porcentaje | Frase | Pose | Animación |
|---|---|---|---|
| 80 % o más | "¡Lo hiciste genial!" | `festejando` | `saltar` |
| De 40 % a 79 % | "¡Lo hiciste bien!" | `festejando` | `flotarSuave` |
| Menos de 40 %, incluido 0 % | "¡Podés hacerlo mejor!" | `alentando` | `flotarSuave` |

**Dónde va la lógica:**
- En `presentacion.ts`, con una función pura, por ejemplo `fraseFinal(porcentaje)`, que devuelva `{ frase, pose, animacion }`. Va con pruebas de los bordes: 0, 1, 39, 40, 79, 80 y 100.
- El momento `final` deja de usar la lista fija de frases. Sacá esa lista de `FRASES` si queda sin uso.

**Dónde se ve:**
- La pantalla final del niño (`FinalNino`): globo, pose y animación del personaje.
- La región `aria-live` del marco, que tiene que leer la misma frase.
- La frase de la pantalla final del profesional, si el personaje aparece ahí.

**Qué no cambia:**
- El niño sigue sin ver porcentajes: el número se usa solo para elegir la frase.
- El premio "¡Desbloqueaste el grado N!" sigue apareciendo igual cuando corresponde.
- El fondo decorado de la pantalla final queda igual en los tres casos.

## 2. Nombrá rápido: "Cuadrícula 1 de 2" repetido

En el entrenamiento, la barra de progreso del marco ya dice "Cuadrícula 1 de 2", y `EjercicioDenominacion` (`components/test/ejercicio-denominacion.tsx`) repite el mismo texto como título de la tarjeta.

- Sumá a `EjercicioDenominacion` una prop opcional, por ejemplo `mostrarNumero` (por defecto `true`).
- En el entrenamiento (`components/entrenamiento/juegos/nombra.tsx`) pasala en `false`: la tarjeta ya no muestra "Cuadrícula N de 2".
- El rótulo "Práctica" de la fila de práctica se sigue mostrando.
- **La evaluación no cambia:** ahí la prop queda en `true` y se ve igual que hoy.

## Restricciones

- Español rioplatense, con voseo.
- Comandos de npm, desde cmd y con `--legacy-peer-deps`.
- No hagas commits ni cambies de rama, y no corras migraciones.
- Si necesitás sesión para probar, pedile a Donato que la inicie él. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- **Revisión a mano**, con una ruta temporal sin sesión que borrás al terminar:
  - la pantalla final del niño con 100 %, 60 % y 0 %;
  - Nombrá rápido en el entrenamiento sin el título repetido;
  - la evaluación de denominación igual que antes.

## Al terminar

Resumí los archivos modificados, las pruebas, los errores de `tsc` y cualquier diferencia con este prompt. No hagas commit.
