# Pruebas SQL de acceso indebido

Cada migración que toca permisos trae acá sus escenarios de acceso indebido (métrica PA de la propuesta). Se corren en un Postgres local que simula Supabase. **Nunca contra Supabase.**

| Archivo | Qué hace |
| --- | --- |
| `00_simular_supabase.sql` | Roles `anon`, `authenticated` y `service_role`, permisos por defecto de Supabase, esquema `auth` con `auth.users`, `auth.uid()` y `auth.jwt()`, y la tabla `entrenamientos` que existía antes de la 0001. Se corre una vez, antes de las migraciones. |
| `0005_s8_contrasena_tutor.sql` | Escenarios de la 0005 (S8): funciones del tutor, sesión del niño, historial compartido, compromiso y eliminación de la cuenta. |
| `0006_denominacion_rapida.sql` | Escenarios de la 0006 (S9): `guardar_test` con denominación rápida (tiempo, errores y detalle), accesos indebidos y constraints de la tabla. |
| `0007_perfil_sin_resultados.sql` | Escenarios de la 0007 (S10): el niño ya no lee `test` ni `test_bloque_resultado`; el profesional con vínculo activo sí, según el historial compartido. |
| `0008_entrenamiento.sql` | Escenarios de la 0008 (S12): desbloqueo del 80 %, quién registra cada origen (consulta, tarea, práctica), juegos de solo consulta y de otro nivel, visibilidad de partidas y tareas, letra del entrenamiento y borrado en cascada (55 escenarios). |

Los archivos de escenarios corren después de **todas** las migraciones, así que reflejan la regla vigente: por ejemplo, desde la 0007 el escenario 4.6 de la 0005 espera que el niño no vea sus evaluaciones.

Los archivos de escenarios corren en una sola transacción que termina en `rollback`: no dejan datos y se pueden repetir. Cada caso imprime `PASA …` o `FALLA …`, y al final hay un resumen. Si un caso falla, el archivo termina con error.

## Requisitos

PostgreSQL 15 o más nuevo, con ICU (la 0004 usa la collation `und-x-icu`). El instalador oficial de Windows la trae.

## Base descartable (recomendado)

Así no se toca el servicio de Postgres instalado ni se necesita su contraseña. En cmd, desde la raíz del repo:

```
set PGBIN=C:\Program Files\PostgreSQL\16\bin
set PGCLIENTENCODING=UTF8
"%PGBIN%\initdb.exe" -D %TEMP%\lecxico-pg -U postgres -A trust -E UTF8 --locale=C
"%PGBIN%\pg_ctl.exe" -D %TEMP%\lecxico-pg -o "-p 55432" -l %TEMP%\lecxico-pg.log start
"%PGBIN%\psql.exe" -p 55432 -U postgres -c "create database lecxico_pruebas"
```

## Aplicar y probar

Las migraciones van en orden. Para comprobar la idempotencia, la última se aplica dos veces.

```
set PSQL="%PGBIN%\psql.exe" -p 55432 -U postgres -d lecxico_pruebas -q -v ON_ERROR_STOP=1
%PSQL% -f supabase\tests\00_simular_supabase.sql
%PSQL% -f supabase\migrations\0001_slice1_esquema_rls.sql
%PSQL% -f supabase\migrations\0002_slice2_auth.sql
%PSQL% -f supabase\migrations\0003_slice3_vinculacion.sql
%PSQL% -f supabase\migrations\0004_slice4_seleccion_nombres.sql
%PSQL% -f supabase\migrations\0005_s8_contrasena_tutor.sql
%PSQL% -f supabase\migrations\0006_s9_denominacion_rapida.sql
%PSQL% -f supabase\migrations\0007_s10_perfil_sin_resultados.sql
%PSQL% -f supabase\migrations\0008_s12_entrenamiento.sql
%PSQL% -f supabase\migrations\0008_s12_entrenamiento.sql
%PSQL% -f supabase\tests\0005_s8_contrasena_tutor.sql
%PSQL% -f supabase\tests\0006_denominacion_rapida.sql
%PSQL% -f supabase\tests\0007_perfil_sin_resultados.sql
%PSQL% -f supabase\tests\0008_entrenamiento.sql
```

Los `NOTICE: ... does not exist, skipping` de las migraciones son normales (vienen de los `drop ... if exists`).

## Empezar de cero y apagar

```
"%PGBIN%\psql.exe" -p 55432 -U postgres -c "drop database lecxico_pruebas" -c "create database lecxico_pruebas"
"%PGBIN%\pg_ctl.exe" -D %TEMP%\lecxico-pg stop
```

## Cómo se simula una sesión

Igual que en el SQL Editor de Supabase. Los escenarios usan `pruebas.sesion(rol, uid)`, que hace esto:

```sql
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '<UID>', 'role', 'authenticated')::text, true);
```

Con `service_role` no hay claims (`auth.uid()` da null): así llama el servidor de Next.js a las funciones `tutor_*`.

## Al sumar una migración

1. Escribir `NNNN_sN_nombre.sql` acá, con el mismo armado (`begin`, ayudas de `pruebas`, casos, resumen, `rollback`).
2. Cubrir como mínimo: sesión anónima, la sesión del propio niño, otro niño, profesional sin vínculo, con vínculo pendiente y dado de baja.
3. Sumar la migración y el archivo a la lista de "Aplicar y probar".
