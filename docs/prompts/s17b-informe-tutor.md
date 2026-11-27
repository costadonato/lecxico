# S17b — Informe a pedido del tutor

**Tarjeta de Trello:** https://trello.com/c/pUKA5i0N · **Rama:** `s17-informes` (la misma de S17a: un solo PR para S17) · **Migración:** 0009

## Contexto

La propuesta V8 fija estas reglas para el tutor:
- accede a la información del niño mediante un **informe a pedido**, sin franjas ni recomendación;
- el pedido queda **registrado**;
- el informe se envía **solo al correo verificado** de la cuenta, como **enlace con acceso autenticado y vencimiento**, nunca como adjunto;
- **cada acceso queda registrado** (Ley 25.326, art. 9).

Decisiones del 16/11 y del 26/11:
- el correo sale de una **cuenta de Gmail del proyecto, con contraseña de aplicación**, desde el servidor de Next.js;
- el tutor **no elige nada** al pedirlo: siempre todo el historial, para no confundirlo;
- el informe se descarga en PDF con el **mismo generador de S17a**, variante `"tutor"`.

Antes de empezar, leé:
- `CLAUDE.md` y `docs/estado-proyecto.md`;
- `lib/tutor/` (`acciones.ts`, `verificar-contrasena.ts` y `errores.ts`) y `components/tutor/dialogo-contrasena-tutor.tsx`;
- `lib/supabase/admin.ts` (cliente `service_role`);
- `lib/auth/rutas.ts` y el middleware;
- `supabase/tests/README.md` y la migración 0005, para seguir su estilo;
- lo que dejó S17a en `lib/informes/` y `components/informes/pdf/`.

## Flujo

1. **El pedido.** En la página del niño (donde están hoy las acciones del tutor, en `/perfil`), un bloque "Informe para el tutor" con:
   - el texto "Recibí por correo un informe con las evaluaciones y los entrenamientos de [nombre]. El enlace vence a los 7 días.";
   - el botón **"Pedir informe"**, que abre `DialogoContrasenaTutor`.
2. **La acción del servidor `pedirInformeTutor({ password })`** va con `conContrasenaTutor`, como las demás acciones del tutor. El id del niño sale **siempre de la sesión**.
   1. **Límite:** como máximo **3 pedidos por día** por niño. Si se pasa, muestra "Ya pediste 3 informes hoy. Probá mañana."
   2. **Correo verificado:** el destino es el correo de la cuenta y tiene que estar verificado (`email_confirmed_at`). Si no lo está, la acción no sigue y muestra un error claro.
   3. **Foto de los datos:** con el cliente `service_role` arma la foto de ese momento:
      - datos del niño;
      - **todas** las evaluaciones con sus bloques: aciertos, total, y tiempo y errores de denominación rápida;
      - **todas** las partidas;
      - las tareas con su estado;
      - el nombre de cada profesional que registró algo.
      - **Sin franjas, bandas ni recomendación**: no se calculan ni se guardan.
   4. **Enlace:**
      - genera un token aleatorio de 32 bytes (`crypto.randomBytes`) en base64url;
      - guarda **solo su hash SHA-256**;
      - inserta el pedido en `informe_tutor` con la foto y `vence_at = now() + 7 días`.
   5. **Correo:** lo manda con `nodemailer` por SMTP de Gmail, con el enlace `${URL_APP}/informe/${token}`.
      - Si el envío falla, guarda el error en el pedido y devuelve "No pudimos enviar el correo. Probá de nuevo en unos minutos."
   6. **Al terminar bien:** "Te enviamos el informe a d•••@gmail.com. El enlace vence el dd/mm/aaaa." El correo va enmascarado. Debajo, la fecha del último pedido.
3. **El correo:**
   - **Asunto:** "Informe de [Nombre] en Lecxico".
   - **Contenido:** saludo, qué es, el botón o enlace "Ver el informe", la fecha de vencimiento, "Para abrirlo vas a tener que iniciar sesión con la cuenta de [Nombre]", "Si no pediste este informe, cambiá la contraseña de la cuenta" y "No respondas este correo".
   - **Formato:** HTML simple con estilos en línea, con su versión de texto plano. Sin datos del niño más allá del nombre: **nada de resultados en el correo**.
   - **Código:** el armado del correo es una función pura con pruebas (`lib/informes/correo.ts`).
4. **La página `/informe/[token]`:**
   - **Ruta protegida:** sumala a `RUTAS_PROTEGIDAS`. Sin sesión, va al login y vuelve con `next`.
   - **Pantalla mínima,** con el estilo del lado del niño y del tutor: Lex, el nombre del niño y el botón **"Descargar informe (PDF)"**.
   - **Al tocar el botón,** la acción del servidor `abrirInformeTutor(token)`:
     1. calcula el hash del token y busca el pedido;
     2. verifica que no esté vencido y que `nino_id` sea el usuario de la sesión;
     3. **registra el acceso** en `informe_tutor_acceso`;
     4. devuelve la foto.

     El cliente arma el modelo con `construirInforme(…, "tutor")` y descarga el PDF con los componentes de S17a.
   - **Errores, sin revelar si el pedido existe:**
     - enlace vencido o inexistente: "Este enlace ya no es válido. Pedí un informe nuevo desde el perfil.";
     - otra cuenta: "Este enlace no corresponde a esta cuenta."
5. **El PDF del tutor:**
   - **Título:** "Informe de evaluaciones y entrenamiento".
   - **Lenguaje simple:**
     - "Evaluaciones": fecha, nivel y, por bloque, "respondió bien X de Y"; en denominación rápida, tiempo y errores;
     - "Entrenamiento": por juego, el grado alcanzado y cuántas veces jugó, separado en consulta, tareas y en casa;
     - "Tareas": cuáles y cuándo se hicieron.
   - **Sin franjas, bandas, recomendación ni observaciones.**
   - **Siempre va** la aclaración "Este informe no es un diagnóstico. Si tenés dudas sobre los resultados, consultá con el profesional que acompaña a [Nombre]." y el pie "Lecxico · Confidencial · Página N de M".

## Migración 0009 (`supabase/migrations/0009_s17_informe_tutor.sql`)

```
informe_tutor
  id            uuid pk default gen_random_uuid()
  nino_id       uuid not null references public.profiles(id) on delete cascade
  token_hash    text not null unique            -- SHA-256 en hex, nunca el token
  correo        text not null                   -- destino al momento del pedido
  datos         jsonb not null                  -- la foto
  pedido_at     timestamptz not null default now()
  vence_at      timestamptz not null            -- pedido_at + 7 días
  enviado_at    timestamptz
  error_envio   text
  check (vence_at > pedido_at)

informe_tutor_acceso
  id            uuid pk default gen_random_uuid()
  informe_id    uuid not null references informe_tutor(id) on delete cascade
  user_id       uuid not null
  accedido_at   timestamptz not null default now()
```

- **Índices:** `(nino_id, pedido_at)` y `(informe_id)`.
- **Permisos:** RLS activada en las dos tablas, **sin ninguna política**, y `revoke all` para `anon` y `authenticated`. Solo `service_role` lee y escribe. Así ni el niño ni un profesional pueden leer la foto desde el cliente.
- **Pruebas** en `supabase/tests/0009_informe_tutor.sql`, con el estilo de las anteriores (`PASA`/`FALLA` y `rollback`):
  - `anon` y `authenticated` (niño, tutor y profesional vinculado) no pueden `select`, `insert`, `update` ni `delete` en ninguna de las dos tablas;
  - `service_role` sí;
  - borrar la cuenta del niño borra sus pedidos y sus accesos;
  - el `check` de vencimiento.

  Agregalo a la tabla del README de pruebas.
- **Base:** no corras la migración contra Supabase. La aplica Donato en el SQL Editor el día del merge.

## Configuración

- **Variables nuevas** (sumalas a `.env.example` sin valores):
  - `GMAIL_USER` y `GMAIL_APP_PASSWORD`: solo del servidor, **nunca** con `NEXT_PUBLIC_` ni en git;
  - `URL_APP`: base para el enlace, por ejemplo `https://lecxico-three.vercel.app`. En desarrollo, `http://localhost:3000`.
- **Si falta alguna variable,** la acción devuelve un error claro y lo registra en el servidor sin mostrar valores.
- **En `docs/estado-proyecto.md`,** anotá los pasos para crear la contraseña de aplicación de Gmail (verificación en dos pasos → Contraseñas de aplicación) y para cargar las variables en Vercel.
- **Dependencia:** instalá `nodemailer` y sus tipos con `--legacy-peer-deps`. Las acciones que lo usan corren en el runtime de Node, no en Edge.

## Textos legales

- **Consentimiento informado** del tutor, al crear la cuenta del niño:
  - revisá que diga que el tutor accede a la información mediante un informe a pedido que recibe por correo como enlace con acceso, que vence a los 7 días;
  - si no lo dice, agregalo sin cambiar lo demás.
- **Compromiso de uso responsable del profesional** (`lib/compromiso.ts`): sumá un punto sobre los informes en PDF: tratarlos como confidenciales y compartirlos solo con el tutor o con quien él autorice.

## Pruebas de Vitest

Van en `coverage.include` (90 % de ramas):
- token y hash: el hash es estable y el token no se guarda;
- vencimiento;
- límite diario;
- enmascarado del correo;
- armado del correo;
- foto → modelo tutor, sin campos de franja ni de recomendación;
- validación de la acción con contraseña incorrecta, sin sesión, con otra cuenta y con correo no verificado. Simulá el cliente y `nodemailer`.

## Restricciones

- **Nada de resultados en el correo** ni en la URL. El enlace solo lleva el token.
- **El token no se guarda en texto** en ningún lado: tampoco en los logs.
- Español rioplatense, con voseo. Ningún texto dice "test": se dice "evaluación".
- Comandos de npm, desde cmd y con `--legacy-peer-deps`.
- No hagas commits ni cambies de rama, y no corras migraciones contra Supabase.
- Si necesitás sesión para probar, pedile a Donato que la inicie él. No escribas contraseñas.

## Verificación

- `npm test` y `npm run coverage` pasan con los umbrales.
- `npx tsc --noEmit` sigue en 0 errores.
- `npm run build` pasa.
- Las pruebas SQL de 0005 a 0009 pasan sobre las migraciones 0001 a 0009 (`supabase/tests/README.md`).
- **Recorrido manual,** con la 0009 aplicada en un Supabase de prueba y las variables de Gmail en `.env.local`. Si no los tenés, describí qué no pudiste probar.
  1. Pedir el informe con la contraseña mala: error. Con la buena: aviso con el correo enmascarado.
  2. Llega el correo, sin resultados.
  3. El enlace sin sesión lleva al login y vuelve. Con la cuenta del niño, descarga el PDF.
  4. En el PDF del tutor no aparece ninguna franja ni la recomendación.
  5. Con otra cuenta o con el pedido vencido (forzá `vence_at` en la base de prueba), aparece el error genérico.
  6. Cada apertura queda en `informe_tutor_acceso`.
- Actualizá `docs/estado-proyecto.md` con el estado de S17 completo.

## Al terminar

Resumí:
- los archivos creados y modificados;
- la migración y sus escenarios;
- las dependencias nuevas;
- las variables de entorno nuevas;
- las pruebas;
- los errores de `tsc`;
- lo que no pudiste probar;
- cualquier diferencia con este prompt.

No hagas commit.
