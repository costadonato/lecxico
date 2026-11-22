# Lecxico — Estado del proyecto

Última actualización: 20/11/2026 (migración 0008 de S12, S13a, S13b y S14a). Reemplaza al documento "Estado del proyecto tras la etapa de gestión de usuarios (slices 1 a 5)" del 9/10/2026.

**Cómo se usa:** es la fuente de contexto para cualquier chat o Claude Code que trabaje en el repo. Cada PR actualiza las secciones que toca (estado de slices, modelo de datos, decisiones, pendientes). Si este documento y el código no coinciden, manda el código; las migraciones de `supabase/migrations/` describen la base exactamente.

Documentos relacionados: `CLAUDE.md` (reglas para Claude Code), `docs/revisiones-especialistas.md` (registro de revisiones), `docs/prompts/` (prompt de cada slice). El plan completo con fechas está en el documento "Lecxico — Plan de desarrollo hasta el 4 de diciembre" y en el tablero de Trello del equipo.

## Resumen

La gestión de usuarios está implementada y probada de punta a punta: registro por rol, autenticación, vinculación profesional–niño por invitación, evaluación tomada por el profesional al niño, historial y recomendación. La evaluación tiene los estilos del resto de la app. S8 suma la contraseña del tutor verificada en el servidor, el historial compartido, la eliminación de la cuenta del niño y el compromiso del profesional (migración 0005). Denominación rápida ya tiene el formato nuevo en los dos niveles (S9, migración 0006). El perfil del niño ya no muestra evaluaciones ni entrenamientos, y el niño no puede leer sus evaluaciones en la base (S10, migración 0007, en revisión). El entrenamiento tiene su modelo de datos (0008, escrita y probada, pendiente de aplicar) y su marco común: el área del niño (práctica y tareas), el modo en consulta del profesional y los tres primeros juegos (S13a, en revisión). S13b suma Memotono, Rompe y une, Palabras de otro planeta, Nombrá rápido y ¡Rápido, tocalo!, y saca el segundo de silencio antes de cada audio. S14a suma Leé y descubrí, Eco de palabras y Caza errores: quedan cubiertas las 14 combinaciones bloque-nivel (en revisión). Faltan las franjas, los complementarios de S14b, armar tareas y el seguimiento.

## Plan de slices

Meta: desarrollo cerrado el viernes 4/12/2026; verificación y documentación del 7 al 11/12; defensa la semana del 14/12.

| Slice | Qué entrega | Dueño | Fechas | Migración | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 a 5 | Esquema y RLS, registro y auth, vinculación, selección del niño, detalle e historial | Camila | ago–oct | 0001 a 0004 | Hecho |
| Estilos de la evaluación | `/test/inicial` y `/test/primaria` con los estilos del perfil del niño, tests sin cambios (PR #7) | Donato | 11/11 | — | Hecho |
| S6 Base de trabajo | `CLAUDE.md`, `docs/`, Vitest con cobertura, limpieza | Donato | 12–15/11 | — | Hecho |
| S7 Contenido del home | Landing, footer y metadata con información real | Donato | 12–15/11 | — | Hecho |
| S8 Contraseña y acciones del tutor | Contraseña verificada en el servidor; elección de compartir historial; reglas de acceso a lo compartido; eliminación de la cuenta del niño; compromiso del profesional | Camila | 12–22/11 | 0005 | Hecho |
| S9 Denominación rápida | Cuadrícula de letras, números y colores; cronómetro y carga de errores; se suma a primeros lectores (9 bloques); guarda tiempo, errores y detalle por ejercicio | Donato | 16–22/11 | 0006 | Hecho |
| S10 Perfil del niño sin resultados | El perfil deja de mostrar evaluaciones y entrenamientos; el niño pierde acceso a sus evaluaciones en la base; se borran `/perfil/evaluaciones/[testId]` y `/progress` | Donato | 16–22/11 | 0007 | En revisión |
| S11 Franjas y recomendación | Cortes en el código, franjas con pruebas, recomendación por franja | Camila | 23–26/11 | — | Pendiente |
| S12 Datos del entrenamiento | Juegos, partidas y tareas; desbloqueo del 80 % en el servidor | Camila | 23–29/11 | 0008 | Migración escrita y probada (0008) |
| S13a Marco del entrenamiento | Marco de juego, área del niño (práctica y tareas), modo en consulta, reproductor de audio único, switch "A a"; Detective de sonidos, Rima y Palmas; historial de partidas en `/ninos/[id]`; `/entrenar` y su tarjeta en el inicio del profesional; se retiran los juegos y archivos heredados | Donato | 20–25/11 | usa 0008 | En revisión |
| S13b Juegos (segunda tanda) | Memotono, Rompe y une, Palabras de otro planeta (con variante en consulta), Nombrá rápido (solo consulta, reusa el ejercicio de la evaluación) y ¡Rápido, tocalo!; audio sin el segundo de silencio, `alTerminar` y `decirSecuencia`; `armarPartida` y acción `resolver`; final del profesional con tiempo y errores | Donato | 20–29/11 | usa 0008 | En revisión |
| S14a Juegos principales | Leé y descubrí (lectura sin volver a la historia, ronda = pregunta), Eco de palabras (teclado QWERTY / ABC y corrección fonológica) y Caza errores (selección sin reintento); `seleccion.ts` (puntaje de selección) y `useRondas` con resultado propio. Con ellos están las 14 combinaciones bloque-nivel | Donato | 21/11–4/12 | usa 0008 | En revisión |
| S14b Juegos complementarios | Memopalabras, Ojo de lince y Lluvia (usan `puntajeSeleccion`) | Donato | hasta 4/12 | usa 0008 | Pendiente |
| S15 Tareas del profesional | Armar y asignar tareas; la recomendación enlaza a juegos | Camila | 30/11–2/12 | usa 0008 | Pendiente |
| S16 Gráficos de seguimiento | Evolución por bloque y progreso del entrenamiento | Donato | 30/11–4/12 | — | Pendiente |
| S17 Informes | PDF del profesional; informe a pedido del tutor por correo | Camila | 1–4/12 | 0009 | Pendiente |
| S18 Verificación | Matriz PA, cobertura, auditoría WCAG, comparación con la práctica actual | Los dos | 7–11/12 | — | Pendiente |

**Criterio de corte (V8):** si hay atraso se asegura, en este orden: (1) evaluación y control de acceso; (2) recomendación; (3) entrenamiento mínimo, un juego por bloque y nivel; (4) seguimiento. Lo que no se complete pasa a trabajo futuro.

**Migraciones:** los números están reservados en la tabla. Se aplican en orden de número; si una con número mayor está lista antes, espera o se renumera antes del merge. Las aplica el dueño del slice, con el PR aprobado.

## Stack y configuración

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 4 + shadcn/ui + Motion + Supabase (Postgres + Auth) con `@supabase/ssr`. Vitest para pruebas. Despliegue de prueba en Vercel desde `main`: https://lecxico-three.vercel.app. Repositorio: https://github.com/costadonato/lecxico.

**Pruebas:** `npm test` corre las pruebas de Vitest (`lib/**/*.test.ts`) y `npm run coverage` suma la cobertura V8 de los módulos de lógica listados en `vitest.config.mts` (hoy `lib/test/analisis.ts`, `bloques.ts`, `denominacion.ts` y `denominacion-config.ts`, `lib/auth/perfil.ts`, `lib/tutor/errores.ts`, `etapa.ts` y `validaciones.ts`, y `lib/entrenamiento/juegos.ts`, `bancos.ts`, `rondas.ts`, `presentacion.ts`, `partidas.ts`, desde S13b `partida.ts`, `memotono.ts`, `denominacion-entrenamiento.ts`, `tocalo.ts` y `audio.ts`, y desde S14a `seleccion.ts`, `lee.ts`, `eco.ts` y `caza.ts`), con umbrales de 80 % de líneas y 90 % de ramas (reporte HTML en `coverage/`).

**Pruebas de migraciones:** `supabase/tests/00_simular_supabase.sql` arma en un Postgres local lo que las migraciones esperan de Supabase (`auth.users`, `auth.uid()`, `auth.jwt()`, `auth.role()`, roles `anon`, `authenticated` y `service_role`, la tabla previa `entrenamientos` y la collation `und-x-icu` si falta). Orden: ese archivo → migraciones → `supabase/tests/NNNN_*.sql` (ver `supabase/tests/README.md`). Cada archivo de pruebas corre en una transacción con `rollback` y corta con "FALLARON …" si algún escenario no dio lo esperado. Sin Postgres instalado se puede usar PGlite (`@electric-sql/pglite`, Postgres en WASM) desde Node, fuera del repo.

**Cuidados conocidos:**

- Desde S13a, `npx tsc --noEmit` da 0 errores (los 4 previos estaban en los ejercicios heredados que se borraron) y `next.config.mjs` tiene `ignoreBuildErrors: false`: un error de tipos frena el build.
- Si `tsc` se queja de `.next/types/validator.ts` por rutas que ya no existen, son tipos viejos: borrar `.next` y volver a correr.
- No trabajar con el repo dentro de OneDrive: bloquea `.next` (errores tipo `EINVAL: readlink`). Clonar en una carpeta local.
- `.env.local` no está en git. Cada uno tiene el suyo con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y, desde S8, `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → clave `service_role`) saltea la RLS. Solo la usa el servidor de Next.js, por `lib/supabase/admin.ts` (con `server-only`): nunca con prefijo `NEXT_PUBLIC_` ni en un archivo con `"use client"`. Tiene que estar en `.env.local` y en Vercel (Settings → Environment Variables). Si falta, las acciones del tutor responden "No se pudo completar la acción" y el servidor loguea "Falta configurar SUPABASE_SERVICE_ROLE_KEY".
- `supabase/seed_dev.sql` se usó solo en el slice 1. **No volver a correrlo:** borra y recrea perfiles con sus vínculos y evaluaciones. Para vincular usuarios de prueba se usa la app.

**Configuración fuera del código:**

- Supabase → Authentication → URL Configuration: Site URL `https://lecxico-three.vercel.app`; Redirect URLs `http://localhost:3000/**` y `https://lecxico-three.vercel.app/**`.
- Supabase → Providers: Email con contraseña mínima de 8. "Confirm email" puede desactivarse para pruebas, pero tiene que estar activado antes de mostrar la app. Google activado con un cliente OAuth en modo prueba.
- El servidor de mails de Supabase solo envía mails de autenticación a miembros de la organización y pocas veces por hora. Para el informe del tutor (S17) hace falta otro servicio de envío; está pendiente decidir cuál.

**Para probar la seguridad desde el SQL Editor** se simula un usuario así:

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '<UID>', 'role', 'authenticated')::text, true);
-- consultas a probar
rollback;
```

## Definición vigente (propuesta V8)

La definición funcional es la de la propuesta V8 (reuniones del 14/10 y 28/10/2026). Las marcadas **(V8)** todavía no están implementadas. Las marcadas (S8) están en la rama de S8 y dependen de la 0005.

**Usuarios y cuentas**

- Dos roles: **profesional** y **niño**. La entidad se llama "niño" en todo el sistema; no hay adolescentes ni adultos.
- El profesional se registra solo (email y contraseña, o Google). Al registrarse acepta un compromiso de uso responsable de los datos (casilla obligatoria; texto en `lib/compromiso.ts`). La fecha la fija la base y no se revierte. Los que entran con Google y los profesionales anteriores a la 0005 lo aceptan en `/completar-perfil`; sin compromiso no se puede invitar. (S8)
- La cuenta del niño la crea y la administra **el tutor**, con el email del tutor. Un email = una cuenta. El tutor no es un usuario aparte: su email y teléfono son datos del niño.
- El niño no inicia sesión solo: la sesión la abre el tutor y el niño usa la plataforma siempre acompañado.
- Hoy se inicia sesión con email en los dos roles. El nombre de usuario es único y sirve para que el profesional encuentre al niño.
- Consentimiento = aceptación de Términos y Condiciones al registrarse, obligatoria; la fecha la fija la base y no se puede revertir.
- Nombre y apellido se guardan con formato "Juan Pérez", aplicado por la base.
- Las acciones del tutor exigen volver a ingresar la contraseña, que el servidor verifica antes de ejecutarlas: aceptar o rechazar invitaciones, elegir si comparte el historial, dar de baja vínculos, modificar la etapa escolar y eliminar la cuenta del niño. **(V8)** Pedir el informe (S17) va a reutilizar el mismo diálogo (`components/tutor/dialogo-contrasena-tutor.tsx`) y la misma verificación (`conContrasenaTutor` de `lib/tutor/verificar-contrasena.ts`). (S8)
  - Cómo: cada acción es una Server Action (`lib/tutor/acciones.ts`). Toma el usuario de la sesión (cookies), exige rol `nino`, prueba la contraseña con `signInWithPassword` en un cliente aparte sin persistencia (no toca la sesión del navegador), comprueba que sea el mismo usuario y cierra esa sesión temporal con `scope: "local"`. Recién ahí llama, con el cliente `service_role`, a una función `tutor_*` que solo puede ejecutar `service_role`. El id del niño sale siempre de la sesión.
  - En la base, la sesión del niño ya no puede aceptar, rechazar ni dar de baja vínculos, ni cambiar la etapa escolar.
- El tutor puede eliminar la cuenta del niño con todos sus datos, desde "Acciones del tutor" en `/perfil` (`auth.admin.deleteUser`; el resto se borra en cascada). (S8)

**Vinculación**

- Relación muchos a muchos con estado: pendiente → activa → inactiva (baja lógica).
- Solo el profesional invita, buscando al niño por su nombre de usuario exacto. No se puede listar usuarios.
- El tutor acepta o rechaza desde la campanita; rechazar borra la invitación. El profesional puede cancelar una invitación pendiente.
- Antes de que el tutor acepte, el profesional no ve ningún dato del niño.
- La baja la puede hacer cualquiera de los dos (el tutor, con la contraseña); volver a vincular = invitación nueva. Al darse de baja, el profesional pierde el acceso a todo, incluidas las evaluaciones que tomó él.
- La invitación muestra quién invita y qué verá. Al aceptarla, el tutor elige si ese profesional accede a lo registrado por los demás profesionales (`profesional_nino.comparte_historial`). La elección vale para todo el vínculo: para cambiarla hay que dar de baja y recibir una invitación nueva. (S8)
  - Con `true`, el profesional ve lo que registraron y registren los demás profesionales, antes y después de vincularse. Con `false`, solo lo suyo. Lo propio lo ve siempre que tenga vínculo activo, incluido lo de un vínculo anterior. Lo de un profesional que borró su cuenta (`profesional_id` null) cuenta como "de los demás".
  - La regla está en `profesional_puede_ver_registro(nino, autor)`. Hoy la usan las evaluaciones (`test`, `test_bloque_resultado`, `ninos_para_test`). **S12** la usa para las tareas: las de otros profesionales solo se ven si el tutor compartió (tabla 5 de la propuesta). La práctica en casa no tiene autor profesional y la ven todos los profesionales con vínculo activo (`es_profesional_vinculado`).
  - El tutor consulta lo que eligió en `/mis-profesionales`; el profesional lo ve en `/ninos/[id]`, junto al historial.
- El aviso por correo de las invitaciones queda diferido; por ahora es solo la campanita.

**Evaluación de indicadores**

- Solo la toma un profesional, a un niño con vínculo activo, desde su propia cuenta y en presencia del niño.
- El nivel se deriva de la etapa escolar: sala de 4 y 5 → inicial (pre-lectores); 1.º, 2.º y 3.º grado → primario (primeros lectores).
- Si se interrumpe, se descarta. Salir a mitad de camino pide confirmación.
- Los resultados se guardan por bloque, con correctas y total. En denominación rápida se guardan además el tiempo total, los errores totales y el detalle de cada ejercicio (S9).
- Primeros lectores tiene 9 bloques. Denominación rápida va al final en los dos niveles: es el bloque 5 de 5 en inicial y el 9 de 9 en primario; los 8 bloques anteriores del primario no cambian de orden (S9). Las evaluaciones guardadas conservan su `bloque_codigo` y su `orden`.
- En la interfaz se llama "Evaluación de indicadores de dislexia"; internamente sigue siendo `test`.

**Denominación rápida (S9, definida con las especialistas)**

- Una cuadrícula que mezcla letras, números y colores (cuadrados pintados, sin palabras). El niño nombra todos los estímulos en voz alta, lo más rápido que puede, de izquierda a derecha y fila por fila.
- Lo maneja el profesional: práctica (una fila con un estímulo de cada categoría; único momento en que se corrige al niño) → consigna con la cuadrícula tapada → "Comenzar" (empieza a medir) → "Terminar" cuando el niño nombra el último → carga la cantidad de errores (omisiones y nombres equivocados). El tiempo nunca se muestra durante el ejercicio ni al cargar los errores; aparece en los resultados. No se registran autocorrecciones. "Repetir ejercicio" descarta el tiempo.
- 2 ejercicios (cuadrículas distintas) por nivel; cada uno es un paso de la barra de progreso. La práctica solo antecede al primero.
- Primario: letras A, E, S, D, P; números 2, 4, 6, 7, 9; colores rojo, azul, verde, amarillo, negro; 5 × 10 (50 estímulos). Inicial: solo vocales (A, E, I, O, U), mismos colores; **provisorios**: los números y el tamaño 4 × 6 (24 estímulos).
- El módulo también lo usa Nombrá rápido (S13b) sin cambiar la evaluación: categoría `"dibujo"`, `ConfigDenominacion.ciclo` opcional (por defecto `CICLO_CATEGORIAS`), `estimulos` parcial (la evaluación usa `ConfigDenominacionEvaluacion`, con las tres categorías) y la prop `letra` de `EjercicioDenominacion` para seguir el switch "A a".
- Las cuadrículas son fijas (`lib/test/denominacion-config.ts`): ciclo letra → número → color de corrido, conteos parejos dentro de cada categoría y sin repetir un estímulo en dos apariciones seguidas de su categoría (lo verifica `validarSecuencia`, con pruebas).
- Puntaje por ejercicio: total = estímulos, correctas = total − errores. El bloque suma los dos ejercicios (tiempo, errores, correctas y total). En los resultados (pantalla final y detalle de una evaluación del historial), la fila del bloque muestra correctas / total, tiempo (m:ss) y errores en lugar de la barra de porcentaje. Al final de la fila, un botón "+" (aria-expanded, aria-controls, "Ver el detalle por ejercicio") despliega debajo una sub-fila por ejercicio leída de `detalle`: "Ejercicio N", correctas / total, tiempo y errores; abierto pasa a "−". La aparición es un fundido corto que, con reducir movimiento, no desplaza. Las evaluaciones sin `detalle` no muestran el botón, y las anteriores a S9 (sin tiempo) se ven como antes.
- Se mide por tiempo y errores, no por porcentaje: queda fuera del porcentaje general y del puntaje total que se guardan (`porcentaje_total`, `puntaje_total`), de "X de Y respuestas correctas", de "bloques con más errores" y de la recomendación (`bloquesPorcentuales` y `resumenPorcentual` en `lib/test/analisis.ts`). Se excluye por código de bloque, así que vale también para las evaluaciones viejas sin tiempo. En la base se siguen guardando sus correctas y total.
- No se muestra si se detectaron indicadores: solo el desglose por bloque y una línea neutra ("Esta evaluación es orientativa y no reemplaza un diagnóstico profesional").
- **Hoy** la recomendación ordena los bloques del último test de menor a mayor acierto, sin denominación rápida. **(V8)** Pasa a franjas: dos valores de corte por bloque y nivel, fijados por revisión bibliográfica, ubican cada bloque en "correcto", "intermedio" o "a observar"; la recomendación señala los bloques en "intermedio" y "a observar", en el orden del test, con los juegos vinculados. Un bloque sin referencia bibliográfica queda "sin franja de referencia" y fuera de la recomendación. Solo lo ve el profesional.

**Qué ve cada uno**

- El perfil del niño (`/perfil`, que comparten niño y tutor) no muestra resultados de evaluaciones ni el progreso del entrenamiento (S10). Muestra los datos personales con el nombre de usuario, un aviso ("Los resultados de las evaluaciones los ve el profesional que acompaña al niño.") y "Acciones del tutor". En la base, el niño no lee `test` ni `test_bloque_resultado`, ni las suyas (0007).
- Solo el profesional con vínculo activo ve las evaluaciones, su desglose, las franjas y la recomendación.
- En `/entrenamiento` el niño ve sus tareas y el grado alcanzado en cada juego, con estrellas y nunca con porcentajes; al terminar una partida no ve aciertos (S13a). **(V8)** El tutor accede a los resultados con un informe a pedido que recibe por correo como enlace con acceso autenticado, que vence a los 7 días (S17).

**Entrenamiento (validado con las especialistas el 19/11; S12 y S13a)**

- 14 juegos (catálogo en `lib/entrenamiento/juegos.ts`, espejo de `entrenamiento_juego`), al menos uno por bloque y nivel, con 3 grados. El contenido está en `lib/entrenamiento/bancos.json` (borrador del 19/11, en revisión por las especialistas) con los dibujos de Fluent Emoji 3D (Microsoft, licencia MIT) en `public/emoji/`.
- **Desbloqueo (0008, en el servidor):** una partida con al menos 80 % en el grado g habilita en casa hasta g + 1. Cuentan las de consulta, tarea y práctica del nivel actual; las de una misión no. El grado 1 está siempre habilitado.
- **Orígenes:** práctica en casa (el niño con el tutor, solo grados habilitados y nunca juegos de solo consulta), tarea (el grado lo fija el profesional; se marca hecha cuando todos sus juegos tienen partida) y consulta (el profesional, desde su cuenta, cualquier grado y juego, incluido Nombrá rápido).
- **Rondas** (`lib/entrenamiento/rondas.ts`): primer intento correcto = correcta; si falla, se avisa sin mostrar la respuesta y hay **un** reintento, que cuenta como error aunque acierte; si vuelve a fallar se muestra la respuesta. `detalle` guarda `{ item, correcta, intentos }` por ronda. Desde S13b, la acción `resolver` (en `useRondas`, `resolver(correcta)`) resuelve la ronda en un solo intento, sin reintento (`intentos: 1`): la usan Palabras de otro planeta en consulta y ¡Rápido, tocalo!.
- **Armado de la partida** (`lib/entrenamiento/partida.ts`, S13b): el marco llama a `armarPartida(juego, nivel, grado)`. Los juegos con banco por grado mezclan el banco (`elegirPartida`); Memotono, Nombrá rápido y ¡Rápido, tocalo! generan su contenido (`memotono.ts`, `denominacion-entrenamiento.ts`, `tocalo.ts`). Una lista vacía muestra "Este grado todavía no tiene contenido". Cada ítem generado tiene un id legible (`MEM-bota-mono-ojo`, `NOM-inicial-3-1`, `TOC-03-rojo`).
- **Audio** (`lib/entrenamiento/audio.ts`, reproductor único de la app): suena solo al tocar un botón, uno a la vez; se corta al desmontar y al cambiar de ruta. **La regla del segundo de silencio antes de cada audio se dejó sin efecto el 20/11** (S13b): el audio arranca apenas se toca el botón (o apenas carga el manifiesto, la primera vez). Solo cuando corta a un audio que estaba sonando espera un margen técnico de 80 ms, porque Chrome puede comerse el comienzo de la frase si `speak()` va justo después de `cancel()`. `decir(texto, { alTerminar })` avisa cuando el audio termina solo (no si se corta) y `decirSecuencia(textos, { pausaMs, alTerminar })` dice cada texto por separado, con su archivo del manifiesto, como un solo turno. La única excepción a "nada suena solo" es ¡Rápido, tocalo!, después de "¡Listo, empezá!". Por ahora voz del navegador (es-AR, es-US, es-419, es-MX, cualquier es); si `public/audio/manifest.json` (hoy vacío) tiene un archivo para el texto, usa el archivo. El globo de Lex y Lumo usa el mismo reproductor (`useVoz`), también durante la evaluación. Las preguntas de la evaluación siguen con su propia síntesis de voz.
- **Switch "A a":** MAYÚSCULA o minúscula para todo el texto del área de juego (`data-letra`), guardado por niño en `ninos.letra_entrenamiento`. No afecta a la evaluación.
- **Qué ve cada uno:** el niño, sus tareas, los juegos (sin nombres de bloque, ni en las tarjetas ni en el encabezado del juego) con candados y estrellas, y al final de la partida un cierre festivo (con "¡Desbloqueaste el grado N!" si corresponde), sin aciertos. El profesional ve correctas / total y porcentaje al terminar, el grado habilitado en casa y el historial de partidas en `/ninos/[id]`.
- Lex y Lumo responden a cada intento (poses explicando, pensando, festejando y alentando).
- Hoy se pueden jugar Detective de sonidos, Rima y Palmas (S13a), Memotono, Rompe y une, Palabras de otro planeta, Nombrá rápido y ¡Rápido, tocalo! (S13b) y Leé y descubrí, Eco de palabras y Caza errores (S14a); Memopalabras, Ojo de lince y Lluvia se ven como "Próximamente" (S14b). Armar y asignar tareas es S15.

**Juegos de S13b**

- **Memotono** (memoria auditiva, inicial y primario): "Escuchar la secuencia (N)" dice las palabras con `decirSecuencia` (pausa de 900 ms en inicial y 700 ms en primario). El panel se habilita al terminar la primera reproducción; cada toque pone una insignia con su número. Grados: 2/3/4 elementos en inicial y 3/4/5 palabras en primario (1-2, 2 y 2-3 sílabas); 2, 3 y 4 distractores (ninguno, uno o todos parecidos); 3, 2 y 2 reproducciones. Inicial grado 1 alterna 3 secuencias de dibujos y 3 de colores. En el reintento se borran las insignias y, si no le quedan reproducciones, se suma una.
- **Rompe y une** (conciencia silábica, primario): dibujo y "Escuchar", un casillero por sílaba y una bandeja con las sílabas y el relleno. Se juega con toques (o Enter/Espacio) y con arrastre de Motion (mouse y touch), con animación compartida (`layoutId`). El grado 3 (hasta 5 casilleros y 8 fichas) entra en 375 px.
- **Palabras de otro planeta** (pseudopalabras, primario): en práctica y tareas, tres tarjetas "Audio 1/2/3" con su parlante (velocidad 0,8) y "¡Es esta!", con reintento. **En consulta** (validación del 19/11), solo la palabra: el niño la lee en voz alta y el profesional marca Bien o Mal; se resuelve sin reintento y pasa sola a la siguiente (600 ms). La consigna de consulta es otra (`consignaConsulta` en `juegos.ts`).
- **Nombrá rápido** (denominación, solo consulta): reusa `EjercicioDenominacion`, con 2 cuadrículas generadas al azar en cada partida que cumplen `validarSecuencia`. Inicial: colores 3 × 4; colores y vocales 4 × 5; colores, vocales y dibujos (flor, tren, globo, llave, oso) 4 × 6. Primario: letras 4 × 5; letras y números 5 × 6; letras, números y colores 5 × 8. Se juega sin personaje (`JUEGOS_SIN_PERSONAJE`). Guarda la suma de las dos cuadrículas (correctas, total, tiempo y errores) y el detalle por cuadrícula. El tiempo no cuenta para desbloquear.
- **¡Rápido, tocalo!** (denominación, inicial y primario): 12 estímulos en inicial y 20 en primario, con una cuadrícula nueva cada 4. Nada suena hasta "¡Listo, empezá!"; después Lumo dice cada estímulo solo. El tiempo se mide desde que termina el audio hasta el toque; un toque correcto antes de que termine cuenta como acierto, pero sin tiempo válido (`ms` null), y no entra en el promedio. Límite por estímulo: sin límite en el grado 1; 4 s y 3 s en inicial, 3 s y 2 s en primario (barrita sin números). Guarda como `tiempo_ms` el promedio de los toques correctos con tiempo válido y como `errores` total − correctas (los dos en null si ningún toque correcto tiene tiempo válido); el detalle suma `ms`.
- **Pantalla final del profesional:** si la partida trae tiempo y errores, muestra "Tiempo" (m:ss, Nombrá rápido) o "Tiempo promedio" (segundos con un decimal, ¡Rápido, tocalo!) y "Errores". "Un reintento acertado cuenta como error" solo aparece en los juegos con reintento.
- En modo profesional, lo que lee o carga el profesional (Bien / Mal, carga de errores, notas) va en `normal-case`; los estímulos siguen el switch "A a".

**Juegos de S14a**

- **Resultado propio de un juego:** `useRondas(items, onRonda, { completar })` arma el resultado del evento `fin` a partir del de las rondas (Caza suma los puntajes de selección; Leé y Eco agregan datos al detalle). Sin `completar`, igual que en S13. El evento `{ tipo: "momento" }` cambia la pose y la frase del personaje sin responder (Leé: `lectura` y `pensando`).
- **Puntaje de selección** (`lib/entrenamiento/seleccion.ts`): `puntajeSeleccion({ objetivos, marcados })`, por índice, con correctas = encontrados y total = objetivos + equivocados (marcar todo no da 100 %). Lo usan Caza errores y, en S14b, Memopalabras, Ojo de lince y Lluvia.
- **Leé y descubrí** (comprensión lectora, primario): 2 historias al azar, aplanadas en preguntas (`lib/entrenamiento/lee.ts`; ids `LEE-2-03-p2`); la barra dice "Pregunta N de 6" (u 8 en el grado 3) con `unidadProgreso` de la ficha. Antes de cada historia, una pantalla de lectura (título, "Historia 1 de 2", párrafos con letra grande, interlineado amplio y unos 60 caracteres por línea, "Ya la leí"), sin audio ni tiempo límite; después, las preguntas sin poder volver a la historia, con 3 opciones y reintento. Lex en pose pensando durante la lectura (momento `lectura`). El detalle suma `historia` en cada pregunta y `lecturaMs` en la primera de cada historia.
- **Eco de palabras** (correspondencia sonido-letra, primario): "Escuchar" con 3 reproducciones; un renglón con lo escrito (región que lee el lector de pantalla) y un teclado en pantalla de 27 letras con la Ñ, QWERTY español por defecto o alfabético (switch "QWERTY / ABC", recordado en el dispositivo con `localStorage`, y animación de layout al cambiar), más "Borrar" y "Listo". Acepta el teclado físico (letras, Retroceso y Enter). Largo máximo: la palabra más 4. Corrección fonológica (`lib/entrenamiento/eco.ts`, `suenaIgual`): cuenta como bien lo que suena igual (bentana, kamiza, girafa) y sin tildes; siempre se muestra cómo se escribe, resaltando las letras que cambian. Reintento de `rondas.ts` (se borra lo escrito y, si no le quedan reproducciones, se suma una). El detalle guarda lo escrito en cada intento (`escrito`).
- **Caza errores** (reconocimiento visual, primario): "En esta oración hay N palabra(s) mal escrita(s)"; cada palabra es un botón (`aria-pressed`) que se marca con subrayado ondulado; la puntuación queda pegada pero fuera de la palabra (`lib/entrenamiento/caza.ts`). "Listo" siempre habilitado; sin reintento (`resolver`). Corrección: encontradas en verde y no encontradas en ámbar, las dos con "mal → bien"; marcadas que estaban bien en rojo con ícono. El detalle guarda lo marcado y el puntaje de cada oración.
- **Teclado de Eco en 375 px:** en ABC (7 por fila) las teclas miden 44 × 48 px; en QWERTY las filas de 10 no entran con 44 px de ancho, así que miden unos 30 × 48 px con 4 px de separación (cumple WCAG 2.5.8; desde unos 480 px llegan a 44).

## Modelo de datos actual

Nueve tablas, todas con RLS. Usuarios sin sesión (anon) no acceden a ninguna. Las cuatro del entrenamiento son de la 0008 (pendiente de aplicar), que también borra la tabla heredada `entrenamientos`.

```
profiles ( id uuid PK = auth.users.id, rol ('profesional'|'nino'), nombre, apellido,
  nombre_usuario UNIQUE (minúsculas, ^[a-z0-9._]{3,30}$), acepta_tyc, fecha_aceptacion_tyc,
  acepta_compromiso (solo profesionales, 0005), fecha_aceptacion_compromiso, created_at )

ninos ( profile_id PK, fecha_nacimiento, etapa_escolar ('sala_4'|'sala_5'|'primero'|'segundo'|'tercero'),
  tutor_email (sincronizado por trigger), tutor_telefono, ultima_conexion, ultimo_entrenamiento, ultima_prueba,
  letra_entrenamiento ('mayuscula'|'minuscula', default 'mayuscula', 0008) )

profesional_nino ( id PK, profesional_id, nino_id, estado ('pendiente'|'activa'|'inactiva'),
  fecha_invitacion, fecha_afiliacion (= fecha de vinculación), fecha_baja,
  comparte_historial (0005: null en 'pendiente', obligatorio en 'activa', se conserva en 'inactiva'),
  UNIQUE (profesional_id, nino_id) )

test ( id PK, nino_id, profesional_id (null si el profesional borró su cuenta), nivel ('inicial'|'primario'),
  fecha, puntaje_total, porcentaje_total, conclusion, created_at )

test_bloque_resultado ( id PK, test_id, bloque_codigo, orden, correctas, total > 0, UNIQUE (test_id, bloque_codigo),
  tiempo_ms > 0, errores (0..total, correctas = total - errores), detalle jsonb (arreglo) )
  -- tiempo_ms, errores y detalle (0006): solo en denominacion_rapida, los dos primeros juntos;
  -- null en los demás bloques y en las evaluaciones anteriores a S9.
  -- detalle = [{ejercicio, tiempo_ms, errores, correctas, total}, ...] (un elemento por cuadrícula)

entrenamiento_juego ( codigo PK, niveles text[] ('inicial'|'primario'), solo_consulta )   -- 0008: los 14 juegos

entrenamiento_tarea ( id PK, nino_id (cascada), profesional_id (null si borró su cuenta), nombre, es_mision,
  estado ('pendiente'|'hecha'), created_at, completada_at (con 'hecha') )

entrenamiento_tarea_item ( tarea_id (cascada), orden 1..10, juego, grado 1..3, PK (tarea_id, orden), UNIQUE (tarea_id, juego, grado) )

entrenamiento_partida ( id PK, nino_id (cascada), profesional_id (autor: quien jugó en consulta o asignó la tarea;
  null en la práctica), juego, nivel, grado 1..3, origen ('consulta'|'tarea'|'practica'), tarea_id (solo 'tarea'),
  mision (agrupa los 3 desafíos de una misión; no desbloquea), correctas, total 1..200,
  porcentaje (generada: round(100 * correctas / total)), tiempo_ms y errores (juntos; Nombrá rápido y ¡Rápido, tocalo!),
  detalle jsonb [{item, correcta, intentos}], created_at )
```

**Bloques de la evaluación** (`lib/test/bloques.ts`, en orden):

| Nivel | Bloques |
| --- | --- |
| Inicial (5) | discriminacion_auditiva · conciencia_fonologica · conciencia_silabica · memoria_fonologica ("Memoria Auditiva") · denominacion_rapida |
| Primario (9) | discriminacion_auditiva · conciencia_fonologica · conciencia_silabica · memoria_fonologica · comprension_lectora · correspondencia_sonido_letra · reconocimiento_visual · lectura_pseudopalabras · denominacion_rapida |

Las evaluaciones primarias guardadas antes de S9 tienen los 8 primeros, en el mismo orden. Las constantes `BLOCKS` de las páginas de la evaluación se arman desde `BLOQUES_POR_NIVEL` y `BLOQUE_NOMBRES`, y `lib/test/bloques.test.ts` verifica el orden de los dos niveles.

**Quién puede ver qué (RLS actual):**

| Tabla | Lectura | Escritura |
| --- | --- | --- |
| profiles | La propia; un profesional, la del niño con vínculo activo; un niño, la de profesionales que lo invitaron o están vinculados | La propia, solo nombre, apellido, nombre_usuario, acepta_tyc y acepta_compromiso (solo profesionales; las fechas las fija la base) |
| ninos | El propio niño; un profesional con vínculo activo | El propio niño, solo fecha_nacimiento, tutor_telefono y ultima_conexion. La etapa escolar, solo con `tutor_cambiar_etapa` (0005) |
| profesional_nino | Las dos partes | Solo mediante funciones; las del tutor, solo `service_role` |
| test, test_bloque_resultado | Solo el profesional con vínculo activo: las suyas, o todas si el tutor compartió el historial (`profesional_puede_ver_registro`, 0005). El niño no lee ninguna, ni las suyas (0007) | Solo `guardar_test` |
| entrenamiento_juego | Todos los usuarios con sesión | Nadie (lo carga la 0008) |
| entrenamiento_tarea, entrenamiento_tarea_item | El propio niño; el profesional con vínculo activo, las suyas o todas si el tutor compartió (`profesional_puede_ver_registro`) | Solo `crear_tarea` y `cancelar_tarea`; la marca `guardar_partida` |
| entrenamiento_partida | Profesionales con vínculo activo: la práctica, todos; consulta y tareas, según `profesional_puede_ver_registro`. El niño no lee partidas (ve el grado habilitado con `grados_habilitados`) | Solo `guardar_partida` |

**Funciones:** `nivel_para_etapa`, `es_profesional_vinculado`, `es_profesional_del_nino_actual`, `profesional_puede_ver_registro`, `guardar_test`, `nombre_usuario_disponible`, `invitar_nino`, `cancelar_invitacion`, `desvincular` (solo el profesional), `vinculos_del_profesional`, `ninos_para_test`, `formatear_nombre`.

**Funciones del entrenamiento (0008, `authenticated`):** `grados_habilitados(nino)` (el niño para sí o un profesional con vínculo activo), `guardar_partida` (devuelve id, porcentaje y grado habilitado; valida origen, grado y tarea), `crear_tarea`, `cancelar_tarea` y `cambiar_letra_entrenamiento`. Las envuelve `lib/entrenamiento/partidas.ts`.

**Funciones del tutor (0005, solo `service_role`):** `tutor_responder_invitacion`, `tutor_desvincular`, `tutor_cambiar_etapa`. Las llama `lib/tutor/acciones.ts` después de verificar la contraseña. `responder_invitacion` se eliminó en la 0005.

**Triggers:** `handle_new_user`, `sincronizar_tutor_email`, `proteger_campos_profile`, `formatear_nombres_profile`.

## Migraciones

| Migración | Qué hace | Estado |
| --- | --- | --- |
| 0001_slice1_esquema_rls.sql | Tablas, RLS, `guardar_test`, funciones de vínculo, trigger de alta | Aplicada |
| 0002_slice2_auth.sql | Usuario disponible, email del tutor sincronizado, TyC obligatorio, edición limitada por columnas | Aplicada |
| 0003_slice3_vinculacion.sql | Funciones de invitación y vinculación; borra tablas viejas | Aplicada |
| 0004_slice4_seleccion_nombres.sql | `ninos_para_test`, `formatear_nombre` | Aplicada |
| 0005_s8_contrasena_tutor.sql | Funciones del tutor solo para `service_role`, historial compartido, compromiso del profesional, etapa escolar fuera del alcance del niño | Aplicada |
| 0006_s9_denominacion_rapida.sql | `test_bloque_resultado`: tiempo_ms, errores y detalle con sus constraints; `guardar_test` los exige en denominación rápida y los rechaza en los demás bloques (misma firma; mensajes sin "test"). Pruebas en `supabase/tests/0006_denominacion_rapida.sql` | Aplicada |
| 0007_s10_perfil_sin_resultados.sql | `test_select` y `test_bloque_resultado_select` sin la cláusula `nino_id = auth.uid()`: solo `profesional_puede_ver_registro`. Pruebas en `supabase/tests/0007_perfil_sin_resultados.sql` | Pendiente de aplicar |
| 0008_s12_entrenamiento.sql | Tablas `entrenamiento_juego`, `entrenamiento_tarea`, `entrenamiento_tarea_item` y `entrenamiento_partida`; `ninos.letra_entrenamiento`; funciones `grados_habilitados`, `guardar_partida`, `crear_tarea`, `cancelar_tarea` y `cambiar_letra_entrenamiento`; borra `entrenamientos`. Pruebas en `supabase/tests/0008_entrenamiento.sql` (55 escenarios). Se aplica el mismo día del merge de S13a, que deja de leer `entrenamientos` | Pendiente de aplicar |
| 0009 (S17) | Reservada | — |

### Coordinación entre slices (desde S8)

- La 0005 se aplica antes que la 0006, la 0006 antes que la 0007 y la 0007 antes que la 0008.
- La 0008 borra `entrenamientos`: aplicarla el mismo día del merge de S13a (`lib/ninos/detalle.ts` ya lee `entrenamiento_partida`). Hasta que se aplique, en el despliegue de prueba fallan el área de entrenamiento y el detalle del niño. `supabase/tests/0005_s8_contrasena_tutor.sql` cambió en el escenario 8 (ahora borra en cascada una partida en lugar de una fila de `entrenamientos`).
- La 0007 (S10) recrea `test_select` y `test_bloque_resultado_select` a partir de la versión de la 0005: sacó solo la cláusula `nino_id = auth.uid()` y conserva `profesional_puede_ver_registro(nino_id, profesional_id)`. Quien vuelva a tocar esas políticas parte de la 0007.
- En `/perfil`, S8 sumó `AccionesTutor` y el nombre de usuario en Datos personales; S10 los conserva.
- Los archivos de `supabase/tests/` corren después de todas las migraciones: cuando una migración cambia una regla, se ajustan los escenarios anteriores que la probaban (S10 cambió el 4.6 de la 0005).
- Toda tabla nueva con datos del niño (S12, S17) tiene que borrarse en cascada al borrar la cuenta (FK a `profiles` o `auth.users` con `on delete cascade`): la eliminación de la cuenta solo borra el usuario de Auth.
- Toda migración nueva que toque permisos trae sus escenarios en `supabase/tests/NNNN_....sql`.

## Pantallas y rutas

| Ruta | Quién | Qué muestra |
| --- | --- | --- |
| `/`, `/dislexia` | Público | Landing e información sobre dislexia para familias y profesionales (`/dislexia` sin enlaces falsos ni promesas; cita IDA 2025 y DISFAM) |
| `/login`, `/register` | Público | Inicio de sesión y registro por rol. `/login?cuenta=eliminada` avisa que se eliminó la cuenta del niño |
| `/recuperar`, `/restablecer`, `/auth/callback` | Público | Recuperación de contraseña y confirmación de mail |
| `/terminos`, `/privacidad` | Público | "Contenido en preparación" |
| `/completar-perfil` | Con sesión | Profesional que entró con Google sin nombre de usuario, o al que le falta aceptar el compromiso de uso responsable |
| `/dashboard` | Los dos | Profesional: Evaluación, Entrenamiento, Mis niños (la gestión de tareas suma su propia tarjeta en S15). Niño: Entrenamiento, Mis profesionales, Mi perfil |
| `/test` | Profesional | Tabla para elegir el niño a evaluar |
| `/entrenar` | Profesional | Acceso directo al modo en consulta, con la estructura de `/test`: los niños con vínculo activo (nombre, nivel y último entrenamiento: fecha, juego y grado de la partida más reciente que el profesional puede ver, o "Todavía no entrenó") y "Entrenar en consulta". En celular, tarjetas |
| `/test/inicial?nino=<id>`, `/test/primaria?nino=<id>` | Profesional | La evaluación de cada nivel |
| `/ninos`, `/ninos/[id]`, `/ninos/[id]/tests/[testId]` | Profesional | Gestión de niños, detalle con recomendación e historiales, desglose. El historial de entrenamientos muestra las últimas 20 partidas (fecha, juego, grado, origen y correctas / total con porcentaje); el contador de la tarjeta, el total. "Entrenar en consulta" junto a "Tomar evaluación" |
| `/ninos/[id]/entrenamiento` | Profesional | Modo en consulta: banda "Entrenamiento de Nombre Apellido", switch "A a" y todos los juegos del nivel del niño (incluido Nombrá rápido) con el grado libre y el grado habilitado en casa. Sin vínculo activo vuelve a `/ninos` |
| `/ninos/[id]/entrenamiento/[juego]?grado=N` | Profesional | Una partida en consulta (marco de juego con origen consulta) |
| `/mis-profesionales` | Niño | Profesionales vinculados, con lo que eligió el tutor sobre el historial; desvincular pide la contraseña |
| `/perfil` | Los dos | Datos personales con el nombre de usuario (copiable). Niño: aviso de que los resultados los ve el profesional y "Acciones del tutor" (cambiar la etapa escolar, eliminar la cuenta). Sin evaluaciones ni entrenamientos (S10) |
| `/entrenamiento` | Niño | Bienvenida con Lex y el switch "A a", "Tareas de tu profesional" (si hay pendientes) y los juegos del nivel en una sola cuadrícula, sin nombres de bloque (en el orden de la evaluación, el principal de cada bloque primero), con candados y estrellas. Un grado bloqueado explica con un cartelito cómo desbloquearlo ("¡Jugá bien el grado 1 para desbloquear este!"), sin mencionar porcentajes. Sin los de solo consulta. Un profesional va a `/dashboard` |
| `/entrenamiento/jugar/[juego]?grado=N&tarea=<id>` | Niño | Una partida. Sin `tarea` es práctica (un grado no habilitado vuelve a `/entrenamiento`); con `tarea`, el grado lo fija el profesional |

## Interfaz

- Componentes de la evaluación en `components/test/`: `marco-evaluacion`, `barra-progreso-evaluacion`, `tarjeta-pregunta`, `boton-opcion`, `boton-audio`, `ejercicio-denominacion` (una cuadrícula de denominación rápida, de la práctica a la carga de errores), `final-evaluacion`, `resultados-evaluacion` (resultados reutilizables, tema oscuro y claro) e `historial-evaluaciones`.
- Durante la evaluación: fondo liso (`fondo-nino`) sin formas flotantes; encabezado tipo píldora como `AppHeader`.
- Componentes del entrenamiento en `components/entrenamiento/`: `marco-juego` (consigna → jugando → final, guardado con "Reintentar", salida con confirmación), `juegos/` (Detective, Rima y Palmas; desde S13b Memotono, Rompe y une, Planeta, Nombrá rápido y Tocalo; desde S14a Lee, Eco y Caza; más `tipos.ts`, con `origen` y `modo` en `PropsJuego`, y el registro `index.ts`), `use-rondas`, `boton-escuchar`, `boton-seguir`, `opcion-dibujo`, `dibujo` (`Dibujo` y `Emoji`), `proveedor-letra` y `switch-letra` (siempre muestra "A a", con `normal-case`), `tarjeta-juego` (sin chip de bloque), `bloqueado` (cartelito con Popover: cursor, foco del teclado o toque; Escape lo cierra), `catalogo-juegos` (cuadrícula única para el niño, por bloque para el profesional), `tabla-ninos-entrenar` (tabla de `/entrenar`) y `colores-bloque` (un color fijo por bloque: celeste, lavanda, mandarina, menta, sol, rojo, y celeste, lavanda y sol fuertes). `TestBandaNino` acepta `prefijo` y `ChipEnDesarrollo`, `texto` ("Próximamente").
- `useSalidaDelTest` acepta los textos del diálogo; el entrenamiento lo usa con "La partida se descarta y no queda registrada".
- Pendiente para más adelante: darle más color a la interfaz (hoy predomina el crema).

## Pendientes chicos

- [ ] Iniciar sesión con email o nombre de usuario. El prompt está armado; requiere `SUPABASE_SERVICE_ROLE_KEY` (desde S8 está el cliente `lib/supabase/admin.ts`) y una función que solo pueda usar `service_role`. Los errores no deben revelar si un usuario existe.
- [ ] Si algún día se activa el modo oscuro: revisar el contraste de los recuadros con fondos `-suave` (por ejemplo, en `/dislexia`, el texto de color claro sobre `celeste-suave`, `menta-suave` y `rojo-suave`).
- [ ] Contenido real de `/terminos` y `/privacidad` (borrador v0.1, sin validez legal para producción).
- [ ] Algunos mensajes de error de las funciones SQL todavía dicen "test" (la interfaz bloquea esos casos antes). `guardar_test` ya no (0006).
- [ ] Las evaluaciones guardadas antes de S9 tienen un `porcentaje_total` que incluye la denominación rápida vieja (10 ítems en inicial). El anillo de resultados y el historial muestran ese valor guardado, mientras que "X de Y respuestas correctas" ya la excluye; en esas evaluaciones de inicial los dos números pueden no coincidir.
- [ ] Confirmar con las especialistas los números y el tamaño de la cuadrícula de denominación rápida en inicial (provisorios).
- [ ] Mail de aviso de invitación al tutor (TODO en `invitar_nino`).
- [ ] Dibujos que faltan: las palabras de `a_generar` en `bancos.json` (capa, tapa, cuna, ola, lana, nota, tela, cono, goma). Los iconos de los 14 juegos ya tienen su dibujo de Fluent (lo controla `bancos.test.ts`). Detective de primario, grado 2, tiene 6 ítems jugables de 8: la partida se juega con 6 hasta que lleguen los dibujos (lo marca `lib/entrenamiento/bancos.test.ts`).
- [ ] El niño no lee partidas, así que en una tarea con varios juegos no ve cuáles ya jugó; la tarea desaparece cuando se completa entera. Si hace falta, S15 puede sumar una función que lo devuelva.
