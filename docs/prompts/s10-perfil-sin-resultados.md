# S10 — Perfil del niño sin resultados

## Contexto
Rama `s10-perfil-sin-resultados`. Leé primero `CLAUDE.md` y `docs/estado-proyecto.md`, sobre todo la sección "Coordinación entre slices (desde S8)".

Según la propuesta V8 (Tabla 5), la cuenta del niño la comparten el niño y su tutor, y **el perfil del niño no muestra resultados de evaluaciones ni progreso del entrenamiento**. Solo el profesional con vínculo activo ve las evaluaciones y su desglose. El tutor va a recibir esa información con un informe a pedido por correo (S17, todavía no existe).

Hoy el niño ve en `/perfil`:
- el historial de sus evaluaciones, que lleva al desglose en `/perfil/evaluaciones/[testId]`;
- un historial de entrenamientos.

Además, la base le permite leer sus propias evaluaciones: las políticas `test_select` y `test_bloque_resultado_select` (última versión: la 0005 de S8) tienen la cláusula `nino_id = auth.uid()`. Este slice saca todo eso, en la interfaz y en la base.

## Leer antes de tocar
- `CLAUDE.md`, `docs/estado-proyecto.md`
- `app/perfil/page.tsx`, `app/perfil/evaluaciones/[testId]/page.tsx`, `app/dashboard/page.tsx`
- `lib/ninos/detalle.ts` (`cargarTestsConBloques`, `cargarTestDeNino`, `perfilVisible`), `components/test/historial-evaluaciones.tsx`
- `components/tutor/acciones-tutor.tsx` (lo sumó S8 en el perfil: se queda)
- `supabase/migrations/0005_s8_contrasena_tutor.sql`: sección 7 (`test_select`, `test_bloque_resultado_select`) y la función `profesional_puede_ver_registro`
- `supabase/tests/README.md`, `supabase/tests/0005_s8_contrasena_tutor.sql` y `supabase/tests/0006_denominacion_rapida.sql`
- `app/progress/page.tsx` y los enlaces a `/progress`

## Reglas
- No hacer commits ni cambiar de rama. No ejecutar la migración contra Supabase.
- No tocar lo que ve el profesional: `/ninos/[id]`, el desglose `/ninos/[id]/tests/[testId]` y `ninos_para_test()` siguen igual.
- En `/perfil` se conservan los datos personales, el nombre de usuario copiable y `AccionesTutor` (S8).

## Tareas

### 1. Migración `supabase/migrations/0007_s10_perfil_sin_resultados.sql`
Comentada, idempotente, en `begin; … commit;`:
- Recrear `test_select` partiendo **exactamente** de la versión de la 0005: se saca solo `nino_id = (select auth.uid())` y queda `public.profesional_puede_ver_registro(nino_id, profesional_id)`.
- Lo mismo para `test_bloque_resultado_select`: el `exists` sobre `test` queda solo con `profesional_puede_ver_registro(t.nino_id, t.profesional_id)`.
- Revisar si alguna función `security definer` le devuelve al niño datos de evaluaciones (resultados, porcentajes, bloques). Si hay alguna, documentarla en el resumen y no cambiarla sin avisar.
- **No** tocar `entrenamientos`: esa tabla se reemplaza en S12, que ya va a aplicar la misma regla.

### 2. Pruebas de acceso `supabase/tests/0007_perfil_sin_resultados.sql`
Mismo formato que las anteriores (`pruebas.ok`, `pruebas.sesion`, transacción con `rollback`). Escenarios:
- el niño no ve ninguna fila de `test` ni de `test_bloque_resultado`, ni siquiera las suyas;
- otro niño tampoco;
- el profesional con vínculo activo sigue viendo las evaluaciones que tomó;
- con historial compartido, también las de otros profesionales; sin compartir, solo las suyas;
- un profesional con vínculo pendiente o dado de baja no ve nada;
- una sesión anónima no ve nada.

### 3. Ajustar las pruebas anteriores
Los archivos de pruebas corren después de **todas** las migraciones, así que tienen que reflejar la regla vigente:
- `supabase/tests/0005_s8_contrasena_tutor.sql`, escenario 4.6: hoy espera que el niño vea sus tres evaluaciones. Pasa a esperar 0, con el texto "4.6 el niño no ve sus evaluaciones (S10)".
- `supabase/tests/0006_denominacion_rapida.sql`: la 0005 exige `comparte_historial` en los vínculos activos (`profesional_nino_comparte_historial_check`) y el `insert into public.profesional_nino` de este archivo no lo carga. Agregar la columna con `true` en los vínculos activos y `null` en los demás.
- `supabase/tests/README.md`: sumar la 0006 y la 0007 a la tabla de archivos y a los comandos de "Aplicar y probar".

Correr la cadena completa en el Postgres local:
1. `00_simular_supabase.sql`;
2. las migraciones 0001 a 0007 (la 0007 dos veces);
3. los tres archivos de pruebas: 0005, 0006 y 0007.

Todos tienen que pasar.

### 4. Perfil del niño (`app/perfil/page.tsx`)
- Sacar la sección "Historial de evaluaciones" y la carga de `cargarTestsConBloques` para el niño.
- Sacar la sección "Historial de entrenamientos" y su consulta a `entrenamientos`. El niño va a ver el grado alcanzado en cada juego dentro del área de entrenamiento (S13), no en el perfil.
- Agregar, después de los datos personales, un aviso breve y neutro (con `MensajeAlerta` de tipo información u otro componente existente): "Los resultados de las evaluaciones los ve el profesional que acompaña al niño." Sin prometer funciones que todavía no existen.
- Borrar los imports, estados y tipos que queden sin uso.

### 5. Desglose desde el perfil
- Borrar `app/perfil/evaluaciones/[testId]/` entero.
- En `lib/ninos/detalle.ts`, actualizar el comentario de `cargarTestDeNino` ("o el propio niño") y cualquier rama de código que solo existía para el niño. Revisar que `components/test/historial-evaluaciones.tsx` siga funcionando en `/ninos/[id]`, que es su único uso.

### 6. Otros lugares donde el niño ve progreso
- `app/dashboard/page.tsx`: la tarjeta "Mi Perfil" dice "Revisá tu progreso y resultados". Cambiarla por "Tus datos y tu cuenta".
- `app/progress/page.tsx` es una página heredada del prototipo con datos inventados ("María", promedios falsos). Borrarla y sacar los tres enlaces que llevan ahí: `app/games/child/page.tsx`, `app/games/teen/page.tsx` y `components/teen-start-card.tsx`. Si al sacar el enlace queda un contenedor vacío, sacalo también. El resto de esas páginas no se toca: se rehacen en S13.
- Buscar con `grep` si queda algún otro texto o enlace que le ofrezca al niño "progreso", "resultados" o "puntaje", y listarlo en el resumen sin cambiarlo, salvo que sea un enlace roto.

### 7. Documentación
- `docs/estado-proyecto.md`:
  - S10 en el plan (estado "En revisión");
  - en "Qué ve cada uno", el perfil del niño ya no muestra resultados;
  - en RLS, quién puede leer `test` y `test_bloque_resultado`;
  - en migraciones, 0007 = S10;
  - en rutas, sacar `/perfil/evaluaciones/[testId]` y `/progress`;
  - en pendientes, anotar que el niño todavía puede leer `entrenamientos` en la base hasta S12.

## Fuera de alcance
- El informe a pedido para el tutor (S17).
- Cambios en `entrenamientos` o en los juegos (S12 y S13).
- La vista del profesional.

## Criterio de hecho
- La cadena de migraciones y las pruebas SQL 0005, 0006 y 0007 pasan en el Postgres local.
- `npm test` y `npm run coverage` pasan.
- `npm run build` pasa y `npx tsc --noEmit` no suma errores a los 4 previos.
- No queda ninguna referencia a `/perfil/evaluaciones` ni a `/progress`.

## Al terminar, resumí
- Archivos creados, modificados y eliminados.
- El texto final de las dos políticas.
- Si encontraste funciones que le devuelven datos de evaluaciones al niño.
- Lo que encontraste en el punto 6 y no cambiaste.
- Pasos para aplicar la 0007 y para probar a mano: como niño, `/perfil` sin resultados y `/perfil/evaluaciones/<id>` devuelve 404; como profesional, el detalle del niño igual que antes.
- Resultado de las pruebas SQL, Vitest, build y `tsc`.
