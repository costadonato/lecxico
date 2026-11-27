# Corrección de rutaSegura y de las fechas inválidas, y código muerto

Tarea: corregir la redirección de rutaSegura y las fechas inválidas, y borrar código muerto.
Rama sugerida: fix-rutas-fechas, desde main actualizado. No hagas commits, no cambies de rama,
no apliques nada en Supabase. Las pruebas marcadas con // POSIBLE ERROR en lib/auth/rutas.test.ts
y lib/fechas.test.ts documentan el comportamiento actual: este pedido lo corrige.

1. lib/auth/rutas.ts, rutaSegura. Hoy deja pasar "/\t/otro-sitio.com" y "/\n/otro-sitio.com", que
   el navegador lee como //otro-sitio.com: en /login, router.push(next) puede mandar al usuario
   a otro sitio después de iniciar sesión. Corregila para que solo acepte rutas relativas del
   mismo sitio. Rechaza (devolviendo lo mismo que hoy para una ruta inválida):
   - cualquier ruta con caracteres de control (\t, \n, \r y el resto de 0x00 a 0x1F, y 0x7F)
     o con barra invertida;
   - las que empiezan con "//" o que, interpretadas con new URL(ruta, "https://lecxico.invalid"),
     no conservan ese origen;
   - esquemas (https:, javascript:, data:) y rutas que no empiezan con "/".
   Sigue aceptando rutas válidas con query y hash, por ejemplo "/ninos/abc?x=1#y".
   Revisá todos los lugares que usan rutaSegura o leen `next` (login, auth/callback, registro) y
   decí en el resumen si alguno redirige sin pasar por ella.

2. lib/fechas.ts. Que cada función cumpla lo que dice su comentario también con entradas inválidas:
   - formatearFecha, formatearFechaCorta y formatearFechaHora devuelven "" si el texto no es una
     fecha válida o es una fecha imposible ("2026-13-45", "2020-02-30");
   - calcularEdad devuelve null para fechas imposibles, no solo para formatos inválidos;
   - tiempoRelativo devuelve "" si la fecha no se puede leer.
   Con fechas válidas, todo tiene que dar exactamente lo mismo que hoy.

3. Pruebas. En rutas.test.ts y fechas.test.ts, convertí los casos // POSIBLE ERROR en casos que
   esperan el comportamiento corregido y sacá la marca. Sumá en rutas.test.ts los casos rechazados
   del punto 1, uno por tipo. Que sigan pasando en UTC, Tokio, Buenos Aires y Kiritimati.

4. Código muerto. Antes de borrar, verificá con grep en app/, components/, lib/ y hooks/ que nadie
   lo importa (las pruebas no cuentan):
   - lib/auth-utils.ts (simulación en localStorage heredada del prototipo);
   - lib/types/game-telemetry.ts;
   - gradoTrasPartida de lib/entrenamiento/juegos.ts y sus pruebas: la regla del 80 % que vale es
     la de la base (migración 0008), y la app la lee con lib/entrenamiento/partidas.ts.
   Si algo de esto sí se usa, no lo borres y decilo en el resumen.

5. docs/cobertura.md: sacá los archivos borrados, aclará que el desbloqueo se aplica en la base
   (0008, pruebas SQL) y que el cliente lo lee con partidas.ts, y actualizá el resultado de coverage.
   docs/estado-proyecto.md: una línea con la corrección de rutaSegura y de fechas.

6. Corré npm run build, npx tsc --noEmit y npm run coverage.

7. Guardá este prompt en docs/prompts/fix-rutas-fechas.md y sumalo a docs/prompts/README.md.

Al terminar, resumí: el resultado de build, tsc y coverage (líneas, ramas, sentencias, funciones,
archivos de prueba, cantidad de pruebas y módulos medidos); cómo quedó rutaSegura y qué casos
rechaza; los lugares que leen `next`; qué se borró y qué no; y los archivos modificados.

## Ajustes

### Ajuste del 27/11/2026

    Ajuste en la rama fix-rutas-fechas. No hagas commits ni cambies de rama.
    1. rutaSegura: rechazá también las rutas cuyo pathname resuelto (con new URL(ruta,
       "https://lecxico.invalid")) empiece con "//", como "/..//otro-sitio.com". Cambiá la prueba
       que hoy documenta que se acepta para que espere el rechazo.
    2. Borrá lib/schemas/telemetry-examples.json si nada lo importa ni lo lee (buscá con grep en app/,
       components/, lib/, hooks/ y en la configuración); si algo lo usa, no lo borres y decilo.
    3. Corré npm run build, npx tsc --noEmit y npm run coverage, y agregá este pedido en "Ajustes"
       de docs/prompts/fix-rutas-fechas.md.
    Resumí el resultado de los tres comandos y los archivos modificados.
