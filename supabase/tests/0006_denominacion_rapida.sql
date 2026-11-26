-- =====================================================================
-- Lecxico · Pruebas de la migración 0006 (S9, denominación rápida)
-- =====================================================================
--
-- Escenarios de guardar_test con el bloque nuevo: los de acceso indebido
-- o datos inválidos tienen que FALLAR, y una evaluación completa de cada
-- nivel tiene que FUNCIONAR.
--
-- Cómo correrlo (Postgres local):
--   1. supabase/tests/00_simular_supabase.sql
--   2. supabase/migrations/0001 a la última, en orden
--   3. este archivo
-- Todo corre en una transacción que termina en ROLLBACK: no deja datos.
-- Al final muestra una tabla con cada escenario (columna ok) y, si alguno
-- no dio lo esperado, corta con un error "FALLARON ...".
--
-- Usuarios de prueba (se crean acá y se descartan con el rollback):
--   P1 profesional con vínculo ACTIVO con N1 y N2
--   P2 profesional sin vínculo
--   P3 profesional con vínculo PENDIENTE con N1
--   P4 profesional con vínculo dado de baja (INACTIVA) con N1
--   N1 niño de sala de 5 (nivel inicial)
--   N2 niño de 1.er grado (nivel primario)
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Datos de prueba (como superusuario; el trigger de alta crea los perfiles)
-- ---------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000a1', 'p1@lecxico.test',
   '{"rol":"profesional","nombre":"Paula","apellido":"Uno","nombre_usuario":"p1.prueba","acepta_tyc":"true"}'),
  ('00000000-0000-4000-8000-0000000000a2', 'p2@lecxico.test',
   '{"rol":"profesional","nombre":"Pedro","apellido":"Dos","nombre_usuario":"p2.prueba","acepta_tyc":"true"}'),
  ('00000000-0000-4000-8000-0000000000a3', 'p3@lecxico.test',
   '{"rol":"profesional","nombre":"Pía","apellido":"Tres","nombre_usuario":"p3.prueba","acepta_tyc":"true"}'),
  ('00000000-0000-4000-8000-0000000000a4', 'p4@lecxico.test',
   '{"rol":"profesional","nombre":"Pablo","apellido":"Cuatro","nombre_usuario":"p4.prueba","acepta_tyc":"true"}'),
  ('00000000-0000-4000-8000-0000000000b1', 'tutor1@lecxico.test',
   '{"rol":"nino","nombre":"Nina","apellido":"Inicial","nombre_usuario":"n1.prueba","acepta_tyc":"true",
     "fecha_nacimiento":"2021-05-10","etapa_escolar":"sala_5","tutor_email":"tutor1@lecxico.test"}'),
  ('00000000-0000-4000-8000-0000000000b2', 'tutor2@lecxico.test',
   '{"rol":"nino","nombre":"Nico","apellido":"Primario","nombre_usuario":"n2.prueba","acepta_tyc":"true",
     "fecha_nacimiento":"2019-03-02","etapa_escolar":"primero","tutor_email":"tutor2@lecxico.test"}');

-- comparte_historial (0005): obligatorio en los vínculos activos
-- (profesional_nino_comparte_historial_check); null en los demás.
insert into public.profesional_nino (profesional_id, nino_id, estado, fecha_afiliacion, fecha_baja, comparte_historial) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000b1', 'activa',    now(), null,  true),
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000b2', 'activa',    now(), null,  true),
  ('00000000-0000-4000-8000-0000000000a3', '00000000-0000-4000-8000-0000000000b1', 'pendiente', null,  null,  null),
  ('00000000-0000-4000-8000-0000000000a4', '00000000-0000-4000-8000-0000000000b1', 'inactiva',  now(), now(), null);

-- ---------------------------------------------------------------------
-- Auxiliares
-- ---------------------------------------------------------------------
create temp table resultado (
  n         serial,
  escenario text,
  esperado  text,
  obtenido  text,
  ok        boolean
);

-- Llama a guardar_test con la sesión de p_uid (null = sin sesión) y el
-- rol de base p_rol. p_error_esperado: fragmento del mensaje de error que
-- tiene que aparecer, o null si la llamada tiene que funcionar.
create function pg_temp.probar(
  p_escenario      text,
  p_uid            uuid,
  p_rol            text,
  p_nino           uuid,
  p_nivel          text,
  p_bloques        jsonb,
  p_error_esperado text
) returns void
language plpgsql
as $$
declare
  v_error text;
begin
  perform set_config('request.jwt.claims',
    case when p_uid is null then json_build_object('role', p_rol)::text
         else json_build_object('sub', p_uid, 'role', p_rol)::text end,
    true);
  execute format('set local role %I', p_rol);
  begin
    perform public.guardar_test(p_nino, p_nivel, 40, 80, 'sin_indicadores', p_bloques);
  exception when others then
    v_error := sqlerrm;
  end;
  reset role;
  perform set_config('request.jwt.claims', '', true);

  insert into resultado (escenario, esperado, obtenido, ok) values (
    p_escenario,
    coalesce('error: ' || p_error_esperado, 'funciona'),
    coalesce('error: ' || v_error, 'funcionó'),
    case when p_error_esperado is null then v_error is null
         else coalesce(v_error ilike '%' || p_error_esperado || '%', false) end
  );
end;
$$;

-- Ejecuta p_sql como superusuario (sin pasar por guardar_test), para
-- probar los constraints de la tabla.
create function pg_temp.probar_sql(p_escenario text, p_sql text, p_error_esperado text)
returns void
language plpgsql
as $$
declare
  v_error text;
begin
  begin
    execute p_sql;
  exception when others then
    v_error := sqlerrm;
  end;
  insert into resultado (escenario, esperado, obtenido, ok) values (
    p_escenario,
    coalesce('error: ' || p_error_esperado, 'funciona'),
    coalesce('error: ' || v_error, 'funcionó'),
    case when p_error_esperado is null then v_error is null
         else coalesce(v_error ilike '%' || p_error_esperado || '%', false) end
  );
end;
$$;

-- Bloques de una evaluación inicial válida, con denominación rápida nueva
-- (2 cuadrículas de 24 estímulos: total 48, 3 errores, 61,2 s).
create function pg_temp.bloques_inicial(p_denominacion jsonb)
returns jsonb
language sql
as $$
  select jsonb_build_array(
    jsonb_build_object('bloque_codigo', 'discriminacion_auditiva', 'orden', 1, 'correctas', 5, 'total', 6),
    jsonb_build_object('bloque_codigo', 'conciencia_fonologica',   'orden', 2, 'correctas', 3, 'total', 3),
    jsonb_build_object('bloque_codigo', 'conciencia_silabica',     'orden', 3, 'correctas', 6, 'total', 7),
    jsonb_build_object('bloque_codigo', 'memoria_fonologica',      'orden', 4, 'correctas', 3, 'total', 4),
    p_denominacion
  );
$$;

create function pg_temp.denominacion_valida()
returns jsonb
language sql
as $$
  select '{"bloque_codigo":"denominacion_rapida","orden":5,"correctas":45,"total":48,
           "tiempo_ms":61234,"errores":3,
           "detalle":[{"ejercicio":"inicial-1","tiempo_ms":30000,"errores":1,"correctas":23,"total":24},
                      {"ejercicio":"inicial-2","tiempo_ms":31234,"errores":2,"correctas":22,"total":24}]}'::jsonb;
$$;

-- ---------------------------------------------------------------------
-- Escenarios que tienen que FALLAR
-- ---------------------------------------------------------------------

-- Denominación rápida sin tiempo → "Faltan el tiempo o los errores".
select pg_temp.probar('denominación rápida sin tiempo',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() - 'tiempo_ms'),
  'Faltan el tiempo o los errores');

-- Formato viejo (correctas y total, sin tiempo ni errores) → mismo error.
select pg_temp.probar('denominación rápida con el formato viejo (sin tiempo ni errores)',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial('{"bloque_codigo":"denominacion_rapida","orden":5,"correctas":8,"total":10}'),
  'Faltan el tiempo o los errores');

-- Tiempo 0 → "debe ser mayor a 0".
select pg_temp.probar('denominación rápida con tiempo 0',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() || '{"tiempo_ms":0}'),
  'mayor a 0');

-- Errores mayores al total → "deben estar entre 0 y 48".
select pg_temp.probar('denominación rápida con errores mayores al total',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() || '{"errores":50,"correctas":0}'),
  'deben estar entre 0 y 48');

-- Errores negativos → "deben estar entre 0 y 48".
select pg_temp.probar('denominación rápida con errores negativos',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() || '{"errores":-1}'),
  'deben estar entre 0 y 48');

-- correctas ≠ total - errores → "el total menos los errores".
select pg_temp.probar('denominación rápida con correctas que no coinciden',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() || '{"correctas":40}'),
  'el total menos los errores');

-- Sin detalle → "Falta el detalle".
select pg_temp.probar('denominación rápida sin detalle',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() - 'detalle'),
  'Falta el detalle');

-- Detalle que no es un arreglo → "Falta el detalle".
select pg_temp.probar('denominación rápida con detalle que no es un arreglo',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida() || '{"detalle":{"ejercicio":"inicial-1"}}'),
  'Falta el detalle');

-- Tiempo en otro bloque → "no lleva tiempo, errores ni detalle".
select pg_temp.probar('tiempo en otro bloque',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  jsonb_set(pg_temp.bloques_inicial(pg_temp.denominacion_valida()), '{0,tiempo_ms}', '1000'),
  'no lleva tiempo, errores ni detalle');

-- Errores en otro bloque → mismo error.
select pg_temp.probar('errores en otro bloque',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  jsonb_set(pg_temp.bloques_inicial(pg_temp.denominacion_valida()), '{1,errores}', '0'),
  'no lleva tiempo, errores ni detalle');

-- Detalle en otro bloque → mismo error.
select pg_temp.probar('detalle en otro bloque',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  jsonb_set(pg_temp.bloques_inicial(pg_temp.denominacion_valida()), '{2,detalle}', '[]'),
  'no lleva tiempo, errores ni detalle');

-- Un usuario niño llamando a guardar_test → "Solo un profesional".
select pg_temp.probar('PA-09 un niño llama a guardar_test',
  '00000000-0000-4000-8000-0000000000b1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida()),
  'Solo un profesional');

-- Profesional sin vínculo → "No tenés un vínculo activo".
select pg_temp.probar('PA-11 profesional sin vínculo',
  '00000000-0000-4000-8000-0000000000a2', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida()),
  'No tenés un vínculo activo');

-- Profesional con vínculo pendiente → mismo error.
select pg_temp.probar('PA-06 profesional con vínculo pendiente',
  '00000000-0000-4000-8000-0000000000a3', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida()),
  'No tenés un vínculo activo');

-- Profesional dado de baja → mismo error.
select pg_temp.probar('PA-07 profesional con vínculo dado de baja',
  '00000000-0000-4000-8000-0000000000a4', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida()),
  'No tenés un vínculo activo');

-- Sesión anónima → sin permiso de ejecución (revoke de anon).
select pg_temp.probar('PA-01 sesión anónima',
  null, 'anon', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida()),
  'permission denied');

-- Constraints de la tabla (defensa en profundidad, sin pasar por guardar_test).
select pg_temp.probar_sql('tabla: tiempo en un bloque que no es denominación rápida',
  $sql$
    with t as (
      insert into public.test (nino_id, profesional_id, nivel, puntaje_total, porcentaje_total)
      values ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000a1', 'inicial', 1, 100)
      returning id
    )
    insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total, tiempo_ms, errores)
    select id, 'conciencia_fonologica', 2, 3, 3, 1000, 0 from t
  $sql$,
  'test_bloque_resultado_medicion_bloque_check');

select pg_temp.probar_sql('tabla: correctas distintas de total - errores',
  $sql$
    with t as (
      insert into public.test (nino_id, profesional_id, nivel, puntaje_total, porcentaje_total)
      values ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000a1', 'inicial', 1, 100)
      returning id
    )
    insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total, tiempo_ms, errores, detalle)
    select id, 'denominacion_rapida', 5, 40, 48, 1000, 3, '[]' from t
  $sql$,
  'test_bloque_resultado_errores_check');

select pg_temp.probar_sql('tabla: tiempo sin errores',
  $sql$
    with t as (
      insert into public.test (nino_id, profesional_id, nivel, puntaje_total, porcentaje_total)
      values ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000a1', 'inicial', 1, 100)
      returning id
    )
    insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total, tiempo_ms)
    select id, 'denominacion_rapida', 5, 48, 48, 1000 from t
  $sql$,
  'test_bloque_resultado_tiempo_errores_check');

-- ---------------------------------------------------------------------
-- Escenarios que tienen que FUNCIONAR
-- ---------------------------------------------------------------------

-- Evaluación inicial completa con el bloque nuevo.
select pg_temp.probar('evaluación inicial completa con denominación rápida',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  pg_temp.bloques_inicial(pg_temp.denominacion_valida()),
  null);

-- Se guardaron tiempo, errores y detalle solo en denominación rápida.
insert into resultado (escenario, esperado, obtenido, ok)
select
  'inicial: columnas nuevas guardadas',
  'denominacion_rapida = 61234 ms, 3 errores, 2 ejercicios; el resto null',
  string_agg(format('%s=%s/%s/%s', b.bloque_codigo, b.tiempo_ms, b.errores, jsonb_array_length(b.detalle)), ', ' order by b.orden),
  bool_and(case when b.bloque_codigo = 'denominacion_rapida'
                then b.tiempo_ms = 61234 and b.errores = 3 and b.correctas = 45
                     and jsonb_array_length(b.detalle) = 2
                else b.tiempo_ms is null and b.errores is null and b.detalle is null end)
  and count(*) = 5
from public.test t
join public.test_bloque_resultado b on b.test_id = t.id
where t.nino_id = '00000000-0000-4000-8000-0000000000b1'
  and exists (select 1 from public.test_bloque_resultado d where d.test_id = t.id and d.tiempo_ms is not null);

-- Evaluación primaria completa: 9 bloques, denominación rápida al final (orden 9).
select pg_temp.probar('evaluación primaria completa (9 bloques)',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b2', 'primario',
  '[{"bloque_codigo":"discriminacion_auditiva","orden":1,"correctas":4,"total":5},
    {"bloque_codigo":"conciencia_fonologica","orden":2,"correctas":5,"total":7},
    {"bloque_codigo":"conciencia_silabica","orden":3,"correctas":6,"total":6},
    {"bloque_codigo":"memoria_fonologica","orden":4,"correctas":5,"total":6},
    {"bloque_codigo":"comprension_lectora","orden":5,"correctas":2,"total":3},
    {"bloque_codigo":"correspondencia_sonido_letra","orden":6,"correctas":5,"total":6},
    {"bloque_codigo":"reconocimiento_visual","orden":7,"correctas":2,"total":2},
    {"bloque_codigo":"lectura_pseudopalabras","orden":8,"correctas":5,"total":7},
    {"bloque_codigo":"denominacion_rapida","orden":9,"correctas":96,"total":100,"tiempo_ms":95000,"errores":4,
     "detalle":[{"ejercicio":"primario-1","tiempo_ms":50000,"errores":3,"correctas":47,"total":50},
                {"ejercicio":"primario-2","tiempo_ms":45000,"errores":1,"correctas":49,"total":50}]}]',
  null);

-- Un "detalle": null explícito en otro bloque se toma como ausente.
select pg_temp.probar('detalle null explícito en otro bloque',
  '00000000-0000-4000-8000-0000000000a1', 'authenticated', '00000000-0000-4000-8000-0000000000b1', 'inicial',
  jsonb_set(pg_temp.bloques_inicial(pg_temp.denominacion_valida()), '{0,detalle}', 'null'),
  null);

-- ---------------------------------------------------------------------
-- Resultado
-- ---------------------------------------------------------------------
select n, ok, escenario, esperado, obtenido from resultado order by n;

do $$
declare
  v_fallaron text;
begin
  select string_agg(escenario, '; ' order by n) into v_fallaron from resultado where not ok;
  if v_fallaron is not null then
    raise exception 'FALLARON: %', v_fallaron;
  end if;
  raise notice 'Todos los escenarios dieron lo esperado (% en total).', (select count(*) from resultado);
end $$;

rollback;
