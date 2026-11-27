# Correcciones del bloque B de la devolución del director

Tarea: correcciones del bloque B de la devolución del director (repositorio).
Rama sugerida: proceso-bloque-b, desde main actualizado. No hagas commits, no cambies de rama,
no apliques nada en Supabase. Si algo de lo que se pide no coincide con lo que encontrás en el
repo, no lo "arregles" por tu cuenta: anotalo en el resumen.

1. DEFINICIÓN DE HECHO EN CLAUDE.md
Reemplazá la Definición de Hecho de CLAUDE.md por esta, tal cual (es la misma que va en el
capítulo del informe), manteniendo el resto del archivo:

   Definición de Hecho (vigente desde el 27/11/2026). Un ítem está terminado cuando:
   1. `npm run build` pasa y `npx tsc --noEmit` da 0 errores. (Hasta S13a, el 20/11, la regla
      era no sumar errores a los 4 previos del código heredado, que S13a eliminó.)
   2. Las pruebas de Vitest pasan, con al menos 80 % de líneas y 90 % de ramas en los módulos
      de lógica listados en docs/cobertura.md.
   3. Si hay migración, se probó en el Postgres local con sus escenarios, y cada escenario de
      acceso indebido lleva su código PA de docs/matriz-pa.md.
   4. Se probó en la aplicación con un profesional y un niño de prueba.
   5. docs/estado-proyecto.md está actualizado en lo que tocó el ítem.
   6. Si el PR trae una migración o cambia políticas de acceso (RLS, permisos o funciones
      security definer), lo revisa el otro integrante antes de integrarlo y de aplicar la
      migración. Los demás PR los integra su dueño, que pide revisión si hay conflictos.
   7. Está integrado en main y desplegado en el entorno de prueba. La migración la aplica el
      dueño del slice después de la revisión del punto 6.
   8. Si es un ejercicio o un juego, la revisión con las especialistas quedó registrada en
      docs/revisiones-especialistas.md.
   El agente ejecuta y reporta los puntos 1, 2, 3 y 5. El desarrollador verifica ese reporte y
   hace los puntos 4, 6, 7 y 8.

2. PLANTILLA DE PR (.github/pull_request_template.md)
- La línea de Vitest pasa a: "Pruebas de Vitest pasan (80 % de líneas y 90 % de ramas en los
  módulos de docs/cobertura.md)".
- La línea "Revisado por el otro integrante" pasa a: "Revisado por el otro integrante
  (obligatorio si hay migración o cambios en políticas de acceso; si no, solo si hubo conflictos)".
- No cambies nada más.

3. PRUEBAS DE LOS MÓDULOS PUROS QUE HOY NO SE MIDEN
Escribí pruebas para lib/niveles.ts, lib/fechas.ts, lib/auth/validaciones.ts y lib/auth/rutas.ts
y sumalos al include de cobertura de vitest.config.mts. No modifiques esos módulos: si una prueba
muestra un comportamiento que parece un error, no lo corrijas; dejá la prueba con lo que el código
hace hoy, marcala con un comentario y explicalo en el resumen. Casos mínimos: cada función
exportada con un caso normal, los bordes (vacío, nulo, límites de rango, fechas en el cambio de
mes y de año) y, en validaciones, un caso válido y uno inválido por regla.

4. docs/cobertura.md (nuevo)
Un archivo que liste qué entra en la medición de cobertura y qué no, con el motivo. Estructura:
- Una línea arriba: "Lista definida por el equipo. La propuesta nombra cuatro módulos de lógica:
  cálculo de resultados, franjas, recomendación y desbloqueo."
- Tabla de módulos medidos (los del include de vitest.config.mts después del punto 3), agrupados
  por área. Indicá qué archivo implementa cada uno de los cuatro módulos de la propuesta: cálculo
  de resultados → lib/test/analisis.ts y lib/test/denominacion.ts; franjas y recomendación →
  lib/test/franjas.ts; desbloqueo → en la base (migración 0008, probado con SQL) y, en el cliente,
  el archivo de lib/entrenamiento/ que lo calcule (verificá cuál es).
- Tabla de archivos de lib/ que no se miden, con el motivo, en estas categorías:
  · Acceso a Supabase o al servidor; se verifican con las pruebas SQL y en la aplicación:
    lib/supabase/admin.ts, client.ts, server.ts; lib/tutor/acciones.ts,
    verificar-contrasena.ts; lib/test/guardar-test.ts, ninos-para-test.ts; lib/ninos/detalle.ts;
    lib/vinculos.ts.
  · Hooks de React, que necesitan el DOM: lib/auth/use-nombre-usuario.ts,
    use-perfil-pagina.ts; lib/entrenamiento/use-audio.ts; lib/hooks/use-voz.ts;
    lib/test/use-acceso-test.ts.
  · Tipos, textos y constantes, sin lógica: lib/types/database.ts, game-telemetry.ts;
    lib/sitio.ts; lib/compromiso.ts; lib/utils.ts (envoltorio de librerías).
  · Código heredado del prototipo (simulación en localStorage), a retirar: lib/auth-utils.ts.
  Revisá cada archivo. Si alguno no encaja en su categoría (por ejemplo, tiene lógica propia
  que se podría probar), no lo muevas ni lo pruebes: anotalo en el resumen.
- Al final, el resultado de `npm run coverage` de hoy (líneas, ramas, sentencias, funciones,
  archivos de prueba y cantidad de pruebas), con la fecha.

5. docs/verificacion-funcional.md (nuevo)
Copiá tal cual el encabezado y la tabla de abajo. No agregues, quites ni cambies casos: los
define el equipo. Revisá que las rutas y los pasos existan en la aplicación (app/) y, si alguno
no coincide, decilo en el resumen sin cambiarlo.

   # Verificación funcional

   Casos definidos por el equipo a partir de los requerimientos funcionales del capítulo de
   proceso. Se corren a mano en el entorno de prueba (https://lecxico-three.vercel.app) con
   cuentas de prueba y datos ficticios. Cada pasada registra la fecha, quién la corrió y el
   resultado (PASA o FALLA, con una observación si falla). Pasadas previstas: la primera
   antes del 30/11/2026 y la segunda al cierre del desarrollo (04/12), sumando S15 a S17.

   Cuentas: P1 y P2, profesionales; N1, niño de sala de 5 (pre-lector); N2, niño de 2.º grado
   (primeros lectores). El tutor usa la cuenta del niño.

   | ID | RF | Cuenta | Pasos | Resultado esperado | Fecha | Quién | Resultado | Observaciones |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- |
   | VF-01 | RF-01 | P1 | Registrarse con correo y contraseña sin marcar el compromiso; después, marcándolo | Sin el compromiso no deja continuar; con él se crea la cuenta y pide confirmar el correo | | | | |
   | VF-02 | RF-01 | P2 | Registrarse con Google | Antes de entrar pide completar el perfil y aceptar el compromiso | | | | |
   | VF-03 | RF-02 | N1 | Crear la cuenta del niño con el correo del tutor, contraseña y etapa escolar, primero sin aceptar el consentimiento y después aceptándolo | Sin consentimiento no se crea; con él se crea | | | | |
   | VF-04 | RF-03 | P1 | Iniciar sesión con la contraseña correcta y con una incorrecta | Con la correcta entra al inicio de su rol; con la incorrecta muestra un error | | | | |
   | VF-05 | RF-03 | P1 | Pedir la recuperación de contraseña, seguir el enlace del correo y fijar una nueva | Llega el correo, el enlace abre la página para restablecer y la nueva contraseña funciona | | | | |
   | VF-06 | RF-04 | Nueva | Registrar una cuenta con un nombre de usuario ya usado | El formulario avisa que no está disponible | | | | |
   | VF-07 | RF-07 | P1, N1 | P1 invita a N1 por su nombre de usuario exacto; después intenta con una parte del nombre | Con el nombre exacto queda una invitación pendiente; con una parte no encuentra a nadie | | | | |
   | VF-08 | RF-08 | N1 | Ver la invitación de P1 y aceptarla con la contraseña del tutor, eligiendo no compartir lo registrado por otros profesionales | La invitación muestra quién invita y qué verá; el vínculo queda activo y P1 ve a N1 en su lista | | | | |
   | VF-09 | RF-08 | P2, N2 | P2 invita a N2; N2 la rechaza con la contraseña del tutor | P2 no ve a N2 | | | | |
   | VF-10 | RF-09 | P2, N1 | P2 invita a N1 y cancela la invitación antes de que la acepte | N1 deja de ver la invitación | | | | |
   | VF-11 | RF-05 | N1 | En el perfil, cambiar la etapa escolar con una contraseña incorrecta y después con la correcta | Con la incorrecta no cambia nada; con la correcta se aplica | | | | |
   | VF-12 | RF-10 | P1 | Tomar la evaluación a N1 (sala de 5) y a un niño de 2.º grado vinculado | A N1 le corresponde el nivel inicial y al de 2.º grado el primario; un niño sin vínculo activo no aparece para evaluar | | | | |
   | VF-13 | RF-11 | P1, N1 | Completar la evaluación de N1 | Cinco bloques en orden, con denominación rápida al final | | | | |
   | VF-14 | RF-12 | P1 | Completar la evaluación de un niño de primeros lectores | Nueve bloques en orden, con denominación rápida al final | | | | |
   | VF-15 | RF-13 | P1 | Abrir el detalle de la evaluación de VF-13 | Cada bloque muestra aciertos sobre total, que coinciden con lo respondido | | | | |
   | VF-16 | RF-14 | P1 | En denominación rápida, completar la serie y cargar errores | Se mide el tiempo y se guardan los errores; el bloque no entra en el porcentaje general | | | | |
   | VF-17 | RF-15 | P1 | Recorrer el área de entrenamiento en los dos niveles | Cada bloque de cada nivel tiene al menos un juego y cada juego tiene tres grados | | | | |
   | VF-18 | RF-16 | N1 | Jugar el grado 1 de un juego con menos de 80 % de aciertos y después con 80 % o más | Con menos de 80 % el grado 2 sigue bloqueado; con 80 % o más se habilita | | | | |
   | VF-19 | RF-17 | N1 | Desde la cuenta del niño, jugar un juego en la práctica en casa | La partida se registra como práctica; el niño no ve resultados de evaluaciones | | | | |
   | VF-20 | RF-18 | P1 | Abrir el entrenamiento de N1 en modo en consulta y jugar una partida | La partida se registra como consulta | | | | |
   | VF-21 | RF-20 | P1 | Ver el historial de partidas de N1 | Aparecen las partidas de VF-19 y VF-20, cada una con su origen | | | | |
   | VF-22 | RF-21 | N1 | En un juego, responder una vez bien y una vez mal | Lex y Lumo responden a cada intento | | | | |
   | VF-23 | RF-22 | P1 | Abrir la última evaluación de un niño de primeros lectores | Cada bloque muestra su franja o "Sin franja de referencia" | | | | |
   | VF-24 | RF-23 | P1 | Ver la recomendación de ese niño en el entrenamiento en consulta | Aparecen los bloques en "intermedio" y "a observar", en el orden del test, con sus juegos | | | | |
   | VF-25 | RF-24 | P1 | Abrir el detalle de N1 | Muestra el historial de evaluaciones y de entrenamientos | | | | |
   | VF-26 | RF-28 | N1 | Abrir el perfil desde la cuenta del niño | No muestra resultados de evaluaciones ni progreso del entrenamiento | | | | |
   | VF-27 | RF-30 | P2, N1 | Vincular a N1 con P2 sin compartir; después, compartiendo | Sin compartir, P2 no ve las evaluaciones de P1; compartiendo, sí | | | | |
   | VF-28 | RF-09, RF-29 | N1, P1 | El tutor da de baja el vínculo con P1, con su contraseña | P1 deja de ver a N1 y no accede a su detalle ni a las evaluaciones que tomó | | | | |
   | VF-29 | RF-06 | Niño de prueba | El tutor elimina la cuenta con su contraseña | La cuenta no puede iniciar sesión y el niño desaparece de la lista de sus profesionales | | | | |
   | VF-30 | RNF-07 | P1 | Repetir VF-13 y VF-20 en una pantalla de 375 px de ancho | Se completan sin elementos cortados ni desplazamiento horizontal | | | | |

6. VERSIÓN DE LA PROPUESTA
"V8" fue una denominación interna; la versión presentada es la V6.1. Reemplazá "V8" por "V6.1"
donde se refiere a la propuesta, en CLAUDE.md, docs/estado-proyecto.md,
docs/revisiones-especialistas.md, docs/prompts/README.md y app/perfil/page.tsx (si en la app
es un comentario; si es texto visible, decilo en el resumen y no lo cambies). No toques los
prompts de los slices (docs/prompts/sNN-*.md): son registro histórico.

7. docs/revisiones-especialistas.md
- Fila del 23/10: Asistentes "Equipo, director". Resultado: "El equipo congeló los
  requerimientos en la definición vigente, con la orientación del director; los cambios
  posteriores pasan a trabajo futuro."
- Fila del 28/10: Asistentes "Equipo, director". Resultado: "El equipo definió que el tutor
  accede por un informe a pedido por correo y, por indicación del director, que los cortes de
  las franjas se fijan por revisión bibliográfica, provisorios."
- Fila del 23/11: sacala de la tabla de reuniones (no hubo reunión) y agregá debajo de la tabla:
  "Los valores de corte de las franjas los fijó el equipo el 23/11/2026 por revisión
  bibliográfica (docs/valores-de-corte.md). El director indicó el método; no participó en fijar
  los cortes."
- Fila del 26/11: Asistentes "Lic. Chávez, Donato Costa (virtual)". Qué se revisó:
  "Correcciones específicas de los juegos del entrenamiento tras revisar el mockup". Resultado:
  "Cinco correcciones a los juegos; ver 'Reunión del 26/11/2026: correcciones a los juegos del
  entrenamiento'". Slice o PR: "S13, S14".
- Nueva sección "Reunión del 26/11/2026: correcciones a los juegos del entrenamiento", con una
  línea arriba: "Todas las correcciones son sobre los juegos del entrenamiento; la evaluación
  no tuvo correcciones nuevas." Debajo, esta tabla con una columna Estado:
  1. En general, en los juegos, dar una segunda oportunidad al niño cuando no elige la opción
     correcta.
  2. Detective de sonidos, primeros lectores, grados 2 y 3: escuchar 2 palabras y elegir entre
     4 opciones, para sumar dificultad.
  3. Leé y descubrí (juego de comprensión lectora): el texto separado de las preguntas y un
     cronómetro visible del tiempo de respuesta, sin guardarlo.
  4. Poder cambiar la letra de los juegos entre imprenta mayúscula e imprenta minúscula.
  5. Ojo de lince, grado 3: límite de tiempo para encontrar las letras, 60 segundos por
     defecto y modificable por el profesional.
  Estado: "Aplicada" solo si lo verificás en el código de main (nombrá el archivo); si no,
  "Pendiente". Aclará debajo: "Estado al [fecha]; lo confirma el equipo al integrar las
  correcciones." En el resumen decí qué encontraste para cada una.

8. docs/estado-proyecto.md
Mencioná la Definición de Hecho vigente desde el 27/11 (revisión obligatoria en PR con migración
o políticas de acceso), docs/cobertura.md y docs/verificacion-funcional.md.

9. Corré `npm run build`, `npx tsc --noEmit` y `npm run coverage`.

10. Guardá este prompt en docs/prompts/proceso-bloque-b.md y sumalo a docs/prompts/README.md.

Al terminar, resumí:
- Resultado de build, tsc y coverage (líneas, ramas, sentencias, funciones, archivos de prueba y
  cantidad de pruebas), y cuántos módulos se miden ahora.
- Pruebas que muestran comportamientos que parecen errores (punto 3).
- Archivos de docs/cobertura.md que no encajan en su categoría.
- Qué archivo implementa el desbloqueo en el cliente.
- Pasos de la verificación funcional que no coinciden con la aplicación.
- Cada "V8" reemplazado y los que dejaste.
- Estado de cada corrección del 26/11 según el código.
- Archivos modificados.

## Ajustes

El prompt se mandó dos veces el 27/11/2026. Esta es la segunda versión, que reemplazó a la primera antes de que se modificara algún archivo. Solo cambia el punto 7: la fila del 26/11 y la sección nueva nombran "los juegos del entrenamiento", la sección suma la línea sobre la evaluación, y las correcciones 1, 3 y 4 hablan de "los juegos" y de "Leé y descubrí" en lugar de "comprensión lectora" y "los ejercicios".

### Ajuste a docs/verificacion-funcional.md (27/11/2026)

Después del resumen, el equipo ajustó la línea de cuentas y cinco casos (VF-03, VF-06, VF-17, VF-24 y VF-27) a partir de los pasos que no coincidían con la aplicación. Pedido:

    Ajuste a docs/verificacion-funcional.md (misma rama proceso-bloque-b). No hagas commits, no
    cambies de rama. Cambiá solo lo que sigue, tal cual, y no toques los demás casos.

    1. Línea de cuentas, reemplazala por:
       Cuentas: P1 y P2, profesionales; N1, niño de sala de 5 (pre-lector); N2, niño de 2.º grado
       (primeros lectores). El tutor usa la cuenta del niño. Antes de VF-12, N2 tiene que estar
       vinculado con P1 (invitación aceptada como en VF-08).

    2. Reemplazá estas filas completas:
    | VF-03 | RF-02 | N1 | Crear la cuenta del niño con el correo del tutor, contraseña y etapa escolar, primero sin aceptar los Términos y Condiciones y la Política de Privacidad (el consentimiento) y después aceptándolos | Sin aceptarlos no se crea; aceptándolos, se crea | | | | |
    | VF-06 | RF-04 | Nueva | Registrar una cuenta con un nombre de usuario ya usado | El formulario avisa que ese nombre de usuario ya está en uso | | | | |
    | VF-17 | RF-15 | P1 | Abrir el entrenamiento en consulta de N1 y después el de N2 | Cada bloque del nivel de cada niño tiene al menos un juego, y cada juego tiene tres grados | | | | |
    | VF-24 | RF-23 | P1 | Abrir el detalle de N2, sección "Franjas y recomendación" | Aparecen los bloques en "intermedio" y "a observar", en el orden del test, con sus juegos | | | | |
    | VF-27 | RF-30 | P2, N1 | P2 invita a N1 y el tutor acepta sin compartir lo registrado por otros profesionales; después el tutor da de baja ese vínculo, P2 invita de nuevo y el tutor acepta compartiendo | Sin compartir, P2 no ve las evaluaciones que tomó P1; compartiendo, sí | | | | |

    3. Agregá al final de docs/prompts/proceso-bloque-b.md, en "Ajustes", una nota con este pedido.

    Al terminar, mostrame el diff de docs/verificacion-funcional.md.
