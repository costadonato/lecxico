# S8 — Contraseña y acciones del tutor

Rama: `s8-contrasena-tutor`. Migración: `0005_s8_contrasena_tutor.sql`. Responsable: Camila.

## Contexto

Leé primero `CLAUDE.md` y `docs/estado-proyecto.md` (sección "Definición vigente (propuesta V8)").

La cuenta del niño la crea y la administra el tutor, con su email y su contraseña. El niño usa la plataforma con la sesión abierta, siempre acompañado. Según la propuesta V8, las acciones que le corresponden al tutor exigen volver a ingresar la contraseña, y el servidor la verifica antes de ejecutarlas. Así, con la sesión abierta, el niño u otra persona no puede hacerlas. Las acciones son:

- aceptar o rechazar invitaciones, y al aceptar, elegir si comparte el historial;
- dar de baja vínculos;
- cambiar la etapa escolar;
- eliminar la cuenta del niño;
- pedir el informe (S17, fuera de este slice, pero tiene que poder reutilizar lo que se construya acá).

Además, el profesional acepta al registrarse un compromiso de uso responsable de los datos.

Problema actual: la base no protege nada de esto. Desde el navegador, con la sesión del niño, se puede llamar a `responder_invitacion` y `desvincular`, y hacer un UPDATE directo de `ninos.etapa_escolar` (la 0002 dio permiso sobre esa columna a `authenticated`). Pedir la contraseña solo en la interfaz no alcanza: la 0005 tiene que cerrar esas puertas en la base.

## Leer antes de tocar

- `supabase/migrations/0001` a `0004` completas, sobre todo `handle_new_user` y `proteger_campos_profile` (0002), las funciones de vínculo (0003), `ninos_para_test` (0004) y las políticas de `test` y `test_bloque_resultado` (0001).
- `lib/vinculos.ts`, `lib/ninos/detalle.ts`, `lib/auth/perfil.ts`, `lib/auth/use-perfil-pagina.ts`, `lib/types/database.ts`, `lib/test/bloques.ts` (`ETAPAS_ESCOLARES`, `nivelParaEtapa`, `NIVEL_LABEL`), `lib/supabase/server.ts`.
- `components/campanita-invitaciones.tsx`, `components/confirmar-dialog.tsx`, `components/auth/campos.tsx` (`CasillaTyC`).
- `app/perfil/page.tsx`, `app/mis-profesionales/page.tsx`, `app/register/page.tsx`, `app/completar-perfil/page.tsx`, `app/login/page.tsx` (`MENSAJES_QUERY`), `app/ninos/[id]/page.tsx`, `app/auth/callback/route.ts`, `app/dashboard/page.tsx`.

## Decisiones tomadas

### 1. Mecanismo de verificación (opción A)

- Cada acción del tutor es una Server Action de Next.js.
- La Server Action obtiene el usuario con `getUser()` del cliente de servidor (cookies). El id y el email salen siempre de la sesión, nunca del formulario. Si no hay sesión o el perfil no es `nino`, la acción falla.
- Verifica la contraseña con `signInWithPassword({ email: user.email, password })` usando un cliente aparte de `@supabase/supabase-js` con la clave anon y `auth: { persistSession: false, autoRefreshToken: false }`. No uses el cliente de cookies: reemplazaría la sesión del navegador. Después comprobá que el `user.id` devuelto coincida con el de la sesión.
- Después de verificar, cerrá esa sesión temporal con `signOut({ scope: "local" })`, dentro de un try. Nunca uses `scope: "global"`: cerraría también la sesión del tutor en el navegador.
- Si la contraseña es correcta, ejecuta la función SQL con un cliente con la clave `service_role` (`SUPABASE_SERVICE_ROLE_KEY`, solo en el servidor). Las funciones del tutor reciben `p_nino_id`, que pone la Server Action desde la sesión.
- Las funciones SQL del tutor tienen `revoke` de `public`, `anon` y `authenticated` y `grant execute` solo a `service_role`.
- Las Server Actions devuelven `{ ok: true } | { ok: false, error: string }` en vez de lanzar, porque en producción Next.js oculta los mensajes de los errores lanzados.
- Mensajes de error:
  - contraseña incorrecta: "La contraseña no es correcta.";
  - límite de intentos de Supabase (status 429): "Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.";
  - cualquier otro: "No se pudo completar la acción. Probá de nuevo."
- Nunca loguees ni devuelvas la contraseña.
- El mapeo de errores va en una función pura con pruebas de Vitest.
- La eliminación de la cuenta usa `auth.admin.deleteUser(user.id)` con el cliente `service_role`, después de verificar la contraseña y que el rol sea `nino`.
- Si falta `SUPABASE_SERVICE_ROLE_KEY`, el cliente admin lanza un error claro en el servidor ("Falta configurar SUPABASE_SERVICE_ROLE_KEY"), y la acción le devuelve al usuario el mensaje genérico.
- El cliente admin va en `lib/supabase/admin.ts`, con `import "server-only"`. Si el paquete `server-only` no está, instalalo con `npm install server-only --legacy-peer-deps`.
- El profesional no usa contraseña para cancelar invitaciones ni para dar de baja vínculos: no son acciones del tutor.

### 2. Compartir el historial

- Columna nueva `profesional_nino.comparte_historial boolean`:
  - es null mientras el vínculo está `pendiente`;
  - se fija al aceptar y es obligatoria en los vínculos `activa` (check: `estado <> 'activa' or comparte_historial is not null`);
  - se conserva al pasar a `inactiva`;
  - `invitar_nino` la vuelve a null al reutilizar una fila `inactiva`.
- Ninguna función la modifica mientras el vínculo está activo. Para cambiarla, hay que dar de baja el vínculo y recibir una invitación nueva.
- Alcance: con `true`, el profesional ve lo que registraron y registren los demás profesionales, antes y después de vincularse, mientras el vínculo esté activo. Con `false`, ve solo lo que registró él. Lo propio lo ve siempre que tenga vínculo activo, incluidas las evaluaciones que tomó en un vínculo anterior.
- Las evaluaciones con `profesional_id` null (de un profesional que borró su cuenta) cuentan como "de los demás".
- Los vínculos `activa` que ya existen quedan en `false`. Hacé el backfill antes de crear el check.
- Función reutilizable `profesional_puede_ver_registro(p_nino uuid, p_autor uuid) returns boolean`, `security definer`, `stable`. Devuelve true si el usuario actual tiene vínculo activo con `p_nino` y además pasa una de estas dos cosas:
  - `p_autor is not null and p_autor = auth.uid()`, o
  - el vínculo tiene `comparte_historial`.
- Dejá comentado en la función, y anotado en `docs/estado-proyecto.md`, que S12 la usa para las tareas: la práctica en casa no tiene autor profesional y la ven todos los profesionales con vínculo activo (`es_profesional_vinculado`), mientras que las tareas de otros profesionales solo se ven si el tutor compartió (tabla 5 de la propuesta).
- Políticas:
  - `test_select` pasa a `nino_id = auth.uid() or profesional_puede_ver_registro(nino_id, profesional_id)`;
  - `test_bloque_resultado_select` usa la misma regla a través de su test.
  - Mantené la cláusula del niño: la saca S10 en la 0006.
- `entrenamientos` no cambia (no tiene autor; S12 la reemplaza).
- `ninos_para_test()`: la última evaluación (fecha y porcentaje) se calcula solo entre las que el profesional puede ver (propias, o de cualquiera si `comparte_historial`). Hoy muestra la de cualquier profesional.
- Detalle del niño (`/ninos/[id]`):
  - "Última evaluación" sale de la evaluación visible más reciente (los tests que ya carga el detalle), no de `ninos.ultima_prueba`, que se actualiza con las de cualquiera;
  - sumá `comparte_historial` a la consulta del vínculo en `cargarDetalleNino`;
  - mostrá una línea visible, cerca del historial:
    - con `true`: "El tutor compartió el historial completo: ves lo que registraron todos los profesionales del niño.";
    - con `false`: "El tutor eligió no compartir el historial: ves solo lo que registraste vos."
  - Corregí el comentario "de cualquier profesional" de `lib/ninos/detalle.ts`.
- `/mis-profesionales`: en cada tarjeta, una línea con lo que eligió el tutor ("Comparte el historial" / "No comparte el historial"), para que lo pueda consultar.

### 3. Funciones SQL (0005)

Todas `security definer`, `set search_path = public`, comentadas, con los mismos mensajes en español y sin revelar si algo existe.

Del tutor, solo para `service_role`. Cada una valida que `p_nino_id` sea un perfil con rol `nino`, con el mismo mensaje de "no encontrado" si no lo es:

- `tutor_responder_invitacion(p_nino_id uuid, p_vinculo_id uuid, p_aceptar boolean, p_comparte_historial boolean)`:
  - misma lógica que `responder_invitacion`;
  - al aceptar, `p_comparte_historial` es obligatorio ("Elegí si compartís el historial.") y se guarda;
  - al rechazar se ignora y se borra la fila.
- `tutor_desvincular(p_nino_id uuid, p_vinculo_id uuid)`: baja lógica de un vínculo activo de ese niño.
- `tutor_cambiar_etapa(p_nino_id uuid, p_etapa text)`: valida los 5 valores y actualiza `ninos.etapa_escolar`.

Cambios a funciones existentes:

- `responder_invitacion(uuid, boolean)`: se elimina (`drop function if exists`). La reemplaza `tutor_responder_invitacion`.
- `desvincular(uuid)`: queda solo para el profesional. Si quien llama no es `profesional_id`, falla con "No se encontró el vínculo."
- `invitar_nino`:
  - exige además `acepta_compromiso`, con el mensaje "Completá tu perfil (nombre de usuario, Términos y Condiciones y compromiso de uso responsable) antes de invitar a un niño.";
  - pone `comparte_historial = null` al reutilizar una fila.
- Permisos: `revoke update (etapa_escolar) on public.ninos from authenticated`. Las otras columnas que edita el niño siguen igual.

### 4. Compromiso del profesional

- `profiles.acepta_compromiso boolean not null default false` y `profiles.fecha_aceptacion_compromiso timestamptz`.
- `handle_new_user`:
  - para rol `profesional`, lee `acepta_compromiso` de la metadata y fija la fecha con `now()` si es true;
  - si falta (alta con Google), no falla: queda en false.
  - Reescribila completa a partir de la versión de la 0002, sin cambiar nada más.
- `proteger_campos_profile`:
  - la aceptación no se revierte;
  - la fecha la fija la base;
  - un perfil `nino` no puede ponerla en true.
  - Reescribila a partir de la versión de la 0002.
- `grant update (acepta_compromiso) on public.profiles to authenticated`, así `/completar-perfil` la puede guardar.
- `perfilIncompleto()` suma `profile.rol === "profesional" && !profile.acepta_compromiso`. Los profesionales de Google y los que ya existen pasan por `/completar-perfil`. Agregá `lib/auth/perfil.ts` al `include` de cobertura de `vitest.config.mts`, con pruebas que cubran cada condición por sus dos caminos.
- Formularios:
  - `app/register/page.tsx`, rol profesional: casilla obligatoria, y se manda `acepta_compromiso: true` en la metadata;
  - `app/completar-perfil/page.tsx`: casilla visible si `!profile.acepta_compromiso`, igual que pasa con la de TyC.
  - Componente `CasillaCompromiso` junto a `CasillaTyC`. El texto corto va junto a la casilla y el texto completo, en un diálogo que abre "Leer el compromiso".
- El texto va en una constante en `lib/compromiso.ts` (ver "Textos").

### 5. Interfaz

Diálogo reutilizable `components/tutor/dialogo-contrasena-tutor.tsx`:

- Un solo componente para todas las acciones del tutor (S17 lo va a usar para el informe).
- Recibe:
  - título;
  - descripción (ReactNode);
  - texto del botón;
  - contenido extra opcional (`children`, para las opciones de compartir o la casilla de eliminar);
  - si el botón está habilitado según ese contenido;
  - la acción, que recibe la contraseña y devuelve `{ ok, error }`.
- Tiene un campo de contraseña con etiqueta "Contraseña de la cuenta" y botón para mostrar u ocultar. Se puede enviar con Enter.
- Mientras ejecuta, muestra "cargando" y se bloquea el doble envío. Los errores se muestran dentro del diálogo, con `role="alert"`.
- Al cerrar o al terminar, la contraseña se borra del estado.
- Mantené el estilo de `ConfirmarDialog` y renderizalo fuera de popovers, para que no se cierre junto con la campanita.
- Debajo del campo, un texto chico: "Esta acción la confirma el tutor con la contraseña de la cuenta."

Campanita (niño):

- Aceptar:
  - abre el diálogo con el párrafo de qué verá el profesional y las dos opciones de compartir (RadioGroup de shadcn, ninguna marcada al abrir);
  - el botón "Aceptar invitación" está deshabilitado hasta que se elija una opción y se escriba la contraseña.
- Rechazar: el diálogo pide solo la contraseña, con el texto actual.

`/mis-profesionales`: "Desvincular" usa el diálogo con el texto actual y la contraseña.

`/perfil` (niño):

- Componente nuevo `components/tutor/acciones-tutor.tsx`, montado en `/perfil` con una sola línea. Es una `Seccion` titulada "Acciones del tutor" con:
  - Etapa escolar:
    - muestra la actual y deja elegirla con un Select de `ETAPAS_ESCOLARES`;
    - si el nivel cambia (`nivelParaEtapa`), avisa antes de confirmar: "Con este cambio, la evaluación pasa de {NIVEL_LABEL anterior} a {NIVEL_LABEL nuevo}.";
    - confirma con el diálogo y la contraseña;
    - la comparación de niveles va en una función pura con pruebas de Vitest.
  - Eliminar la cuenta:
    - botón con variante destructiva;
    - el diálogo muestra el texto de eliminación y una casilla obligatoria: "Entiendo que se borran todos los datos y no se pueden recuperar.";
    - al terminar bien, la Server Action limpia las cookies de sesión (`signOut({ scope: "local" })` del cliente de servidor, ignorando el error de un usuario que ya no existe);
    - el cliente redirige a `/login?cuenta=eliminada`;
    - el login muestra un mensaje informativo (no de error): "La cuenta del niño y todos sus datos se eliminaron."

Nombre de usuario visible (pedido de este slice):

- En `/perfil`, para los dos roles, agregá "Nombre de usuario: @usuario" en Datos personales, con un botón para copiarlo.
- Al copiar, el botón muestra "Copiado" con `aria-live="polite"`. Si el portapapeles no está disponible, el texto sigue visible y seleccionable.
- En `/mis-profesionales`, en el estado vacío, sumá: "Para que un profesional te invite, pasale tu nombre de usuario: @usuario."

`lib/vinculos.ts`: `responderInvitacion` y `desvincular` del lado del niño pasan a llamar a las Server Actions, con la contraseña y la elección. Siguen llamando a `avisarCambioVinculos()` cuando sale bien. El `desvincular` del profesional sigue usando la RPC.

Tipos: actualizá `lib/types/database.ts` (`comparte_historial`, `acepta_compromiso`, `fecha_aceptacion_compromiso`).

Ubicación sugerida:

- Server Actions: `lib/tutor/acciones.ts`, con `"use server"`.
- Verificación de la contraseña: `lib/tutor/verificar-contrasena.ts`, con `server-only`.
- Funciones puras con sus pruebas: `lib/tutor/`. Sumalas al `include` de cobertura.

## Textos

Español rioplatense con voseo, frases cortas. `{profesional}` = "Nombre Apellido (@usuario)", como en `nombreProfesional()` de la campanita.

### Diálogo de aceptar invitación

- Título: "Aceptar la invitación de {profesional}"
- Párrafo: "Si aceptás, {profesional} va a poder ver los datos del niño (nombre, fecha de nacimiento y etapa escolar), tu mail y tu teléfono, las evaluaciones que le tome y su entrenamiento: la práctica en casa y las tareas que le asigne. Va a ver esta información mientras el vínculo esté activo. Podés darlo de baja cuando quieras."
- Pregunta: "¿Querés que también vea lo que registraron otros profesionales del niño?"
- Opción 1: "Sí, compartir el historial". Detalle: "Va a ver las evaluaciones y tareas de los demás profesionales, las de antes y las que se registren después."
- Opción 2: "No, solo lo suyo". Detalle: "Va a ver únicamente lo que registre él."
- Nota: "Esta elección vale mientras dure el vínculo. Para cambiarla, hay que darlo de baja y recibir una invitación nueva."
- Botón: "Aceptar invitación"

### Diálogo de eliminar la cuenta

- Título: "¿Eliminar la cuenta del niño?"
- Texto: "Se van a borrar para siempre la cuenta y todos sus datos: evaluaciones, entrenamientos y vínculos con profesionales. Los profesionales vinculados dejan de ver todo, incluidas las evaluaciones que tomaron ellos. No se puede deshacer."
- Casilla: "Entiendo que se borran todos los datos y no se pueden recuperar."
- Botón: "Eliminar la cuenta"

### Compromiso: texto corto junto a la casilla

"Acepto el compromiso de uso responsable de los datos de los niños." + enlace "Leer el compromiso".

### Compromiso: texto completo (en `lib/compromiso.ts`, tal cual)

Compromiso de uso responsable de los datos

Lecxico guarda información de niños: sus datos, los de su tutor y los resultados de sus evaluaciones y entrenamientos. Al registrarte como profesional, te comprometés a:

1. Trabajar con el niño. Invitar solo a niños con los que trabajás, y cuyo tutor esté de acuerdo.
2. Usar los datos solo para acompañar al niño. No usarlos con fines comerciales, de publicidad ni para otro fin.
3. Mantener la confidencialidad. No compartir los datos ni los resultados con personas ajenas al trabajo con el niño, salvo que el tutor lo autorice.
4. Tomar las evaluaciones como corresponde. Siempre en presencia del niño y desde tu propia cuenta.
5. Recordar que los resultados son orientativos. Lecxico no emite diagnósticos. La interpretación de los resultados es tu responsabilidad profesional.
6. Cuidar el acceso a tu cuenta. No compartir tu contraseña ni dejar la sesión abierta en equipos de otras personas.
7. Darte de baja cuando termines. Si dejás de trabajar con un niño, desvinculate.
8. Respetar la ley. Cumplir con la Ley 25.326 de Protección de Datos Personales.

Tu condición de profesional es declarativa: el prototipo no verifica título ni matrícula. Lecxico es un prototipo en entorno de prueba, desarrollado como Trabajo Final de Ingeniería en Informática (FTyCA-UNCa).

## Pruebas de acceso indebido (`supabase/tests/`)

La carpeta no existe todavía: este slice la crea.

- `supabase/tests/README.md`: cómo levantar un Postgres local y correr los archivos en orden.
- `supabase/tests/00_simular_supabase.sql`: esquema `auth`, `auth.users` con las columnas que usan los triggers (`id`, `email`, `raw_user_meta_data`), `auth.uid()` y `auth.jwt()` leyendo `request.jwt.claims`, y roles `anon`, `authenticated` y `service_role`. Así se pueden aplicar las migraciones 0001 a 0005 y simular cada sesión.
- `supabase/tests/0005_s8_contrasena_tutor.sql`: los escenarios, con usuarios de prueba creados por `handle_new_user` (insert en `auth.users` con metadata). Cada escenario muestra claramente si pasó o falló, por ejemplo con `do $$ … assert … $$` o un `raise notice` por caso.

Escenarios mínimos:

1. `anon` y `authenticated` (incluida la sesión del propio niño) no pueden ejecutar ninguna función `tutor_*`.
2. La sesión del niño:
   - no puede llamar a `responder_invitacion` (ya no existe);
   - no puede dar de baja su vínculo con `desvincular`;
   - no puede hacer UPDATE de `ninos.etapa_escolar`;
   - sí puede seguir actualizando `tutor_telefono`.
3. `service_role` con `tutor_responder_invitacion`:
   - con el `p_nino_id` de otro niño → "No se encontró la invitación.";
   - con un `p_nino_id` que es un profesional → mismo mensaje;
   - aceptar sin `p_comparte_historial` → error;
   - aceptar con true y con false → `activa` con el valor guardado;
   - rechazar → fila borrada;
   - una invitación que ya no está pendiente → error.
4. Compartir, con el profesional A vinculado y evaluaciones de A, de B y una con `profesional_id` null:
   - con `false`, A ve solo las suyas (también en `test_bloque_resultado`);
   - con `true`, ve las tres;
   - `ninos_para_test()` muestra la última visible en cada caso;
   - un profesional con vínculo pendiente o inactivo no ve ninguna;
   - después de la baja y una nueva vinculación, A vuelve a ver las suyas, y `comparte_historial` se reinició al invitar.
5. `tutor_desvincular` con el vínculo de otro niño → no encontrado. El profesional sigue pudiendo usar `desvincular`.
6. `tutor_cambiar_etapa`:
   - con un valor inválido → error;
   - con un valor válido → actualiza;
   - con un `p_nino_id` de profesional → no encontrado.
7. Compromiso:
   - `handle_new_user` lo guarda con fecha si viene en la metadata, y no falla si falta;
   - un niño no puede poner `acepta_compromiso` en true;
   - no se puede revertir;
   - la fecha la pone la base aunque el cliente mande otra;
   - `invitar_nino` falla sin compromiso.
8. Eliminación: `delete from auth.users` de un niño con vínculos, evaluaciones con bloques y entrenamientos no deja filas suyas en `profiles`, `ninos`, `profesional_nino`, `test`, `test_bloque_resultado` ni `entrenamientos`.

## Coordinación con S10 (Donato) y tablas futuras

Dejalo anotado en `docs/estado-proyecto.md`:

- La 0005 se aplica antes que la 0006.
- La `test_select` de la 0006 tiene que partir de la versión de la 0005: sacar solo la cláusula `nino_id = auth.uid()` y conservar `profesional_puede_ver_registro`.
- En `/perfil`, S8 suma el componente `AccionesTutor` y el nombre de usuario en Datos personales. S10 los conserva al sacar el historial.
- Toda tabla nueva con datos del niño (S12, S17) tiene que borrarse en cascada al borrar la cuenta.

## Fuera de alcance

- El informe del tutor (S17). Solo tiene que poder reutilizar el diálogo y la verificación.
- Sacar el historial de evaluaciones del perfil del niño (S10).
- El login con nombre de usuario.
- El aviso por mail de las invitaciones.
- Cambiar el email o la contraseña de la cuenta.
- Cambios de paleta o de estilo general.

## Criterio de hecho

- `npm run build` pasa.
- `npx tsc --noEmit` muestra solo los 4 errores previos.
- `npm test` y `npm run coverage` pasan, con las funciones puras nuevas y `lib/auth/perfil.ts` en el `include` de cobertura.
- La 0005 se probó en Postgres local, aplicada después de 0001 a 0004, con todos los escenarios de `supabase/tests/` en verde. Además, aplicarla dos veces seguidas no falla (idempotencia).
- Búsqueda sin resultados de `SUPABASE_SERVICE_ROLE_KEY` en archivos con `"use client"` y de `NEXT_PUBLIC_SUPABASE_SERVICE`.
- Revisión en 375 px y en modo oscuro: los diálogos, el RadioGroup y la sección "Acciones del tutor" se leen bien y se usan con teclado.
- Documentación:
  - `docs/estado-proyecto.md` actualizado: plan de slices (S8 en curso), definición vigente (quitar los "(V8)" ya implementados), modelo de datos, tabla de RLS, funciones, migraciones, `SUPABASE_SERVICE_ROLE_KEY` en "Cuidados conocidos" y la coordinación de arriba;
  - este prompt guardado como `docs/prompts/s08-contrasena-acciones-tutor.md` y agregado a la tabla de `docs/prompts/README.md`.

## Al terminar

Además del resumen que pide `CLAUDE.md`, listá:

- las funciones SQL creadas, modificadas y eliminadas, con sus permisos;
- los escenarios de `supabase/tests/` con su resultado;
- todo lo que haya que configurar a mano en Supabase o en Vercel para probar el slice.
