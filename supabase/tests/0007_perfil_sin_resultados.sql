-- =====================================================================
-- Lecxico · Escenarios de acceso indebido de la 0007 (S10)
-- =====================================================================
--
-- Requiere 00_simular_supabase.sql y las migraciones 0001 a 0007
-- aplicadas en un Postgres local (ver supabase/tests/README.md).
--
-- Qué se prueba: después de la 0007, las evaluaciones (test) y sus
-- bloques (test_bloque_resultado) solo las lee el profesional con
-- vínculo ACTIVO, según profesional_puede_ver_registro (0005). El niño ya
-- no lee ninguna, ni las suyas.
--
-- Todo corre en UNA transacción que termina en ROLLBACK: la base queda
-- como estaba y el archivo se puede volver a correr.
--
-- Cada caso imprime "PASA <caso>" (NOTICE) o "FALLA <caso>" (WARNING). Al
-- final hay un resumen; si algún caso falló, el archivo termina con error.
--
-- Usuarios de prueba (los crea handle_new_user al insertar en auth.users):
--   A   profesional con vínculo activo con N1, compartiendo el historial,
--       y con N2, sin compartir
--   B   profesional con vínculo activo con N1, sin compartir
--   C   profesional con vínculo pendiente con N1
--   D   profesional con vínculo dado de baja con N1
--   E   profesional sin vínculo
--   N1, N2  niños
--
-- Evaluaciones (cada una con 2 bloques):
--   tA  N1, tomada por A (10/01)       tX  N1, sin profesional (10/03)
--   tB  N1, tomada por B (10/02)       tD  N1, tomada por D (10/04)
--   tN2 N2, tomada por A (10/05)
-- =====================================================================

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

begin;

-- ---------------------------------------------------------------------
-- Ayudas (las mismas que en 0005_s8_contrasena_tutor.sql)
-- ---------------------------------------------------------------------
create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.ids (alias text primary key, id uuid not null default gen_random_uuid());
create table pruebas.resultado (n serial primary key, caso text not null, pasa boolean not null, detalle text);

-- Id de un usuario o evaluación por su alias.
create function pruebas.id(p_alias text) returns uuid
language sql stable security definer set search_path = pruebas as $$
  select id from pruebas.ids where alias = p_alias;
$$;

-- Registra un caso.
create function pruebas.ok(p_caso text, p_condicion boolean, p_detalle text default null) returns void
language plpgsql security definer set search_path = pruebas as $$
begin
  insert into pruebas.resultado (caso, pasa, detalle) values (p_caso, coalesce(p_condicion, false), p_detalle);
  if coalesce(p_condicion, false) then
    raise notice 'PASA  %', p_caso;
  else
    raise warning 'FALLA %  (%)', p_caso, coalesce(p_detalle, 'condición falsa');
  end if;
end $$;

-- El SQL tiene que fallar con un mensaje que contenga p_fragmento.
-- Corre con el rol de la sesión simulada (no es security definer).
create function pruebas.falla(p_caso text, p_sql text, p_fragmento text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    perform pruebas.ok(p_caso, sqlerrm ilike '%' || p_fragmento || '%', 'error: ' || sqlerrm);
    return;
  end;
  perform pruebas.ok(p_caso, false, 'no dio error');
end $$;

-- Simula una sesión: 'anon', 'authenticated' (con p_uid), 'service_role'
-- o 'postgres' (vuelve al superusuario, sin claims).
create function pruebas.sesion(p_rol text, p_uid uuid default null) returns void
language plpgsql as $$
begin
  perform set_config('role', p_rol, true);
  perform set_config(
    'request.jwt.claims',
    case when p_uid is null then '' else json_build_object('sub', p_uid, 'role', p_rol)::text end,
    true
  );
end $$;

-- Las evaluaciones que ve la sesión actual (ids ordenados por fecha).
-- No es security definer: corre con la RLS de la sesión simulada.
create function pruebas.tests_visibles() returns uuid[]
language sql stable as $$
  select coalesce(array_agg(id order by fecha), '{}') from public.test;
$$;

-- Cuántos bloques ve la sesión actual.
create function pruebas.bloques_visibles() returns bigint
language sql stable as $$
  select count(*) from public.test_bloque_resultado;
$$;


-- ---------------------------------------------------------------------
-- Preparación: usuarios, vínculos y evaluaciones (como superusuario)
-- ---------------------------------------------------------------------
insert into pruebas.ids (alias) values
  ('A'), ('B'), ('C'), ('D'), ('E'), ('N1'), ('N2'),
  ('tA'), ('tB'), ('tX'), ('tD'), ('tN2');

insert into auth.users (id, email, raw_user_meta_data) values
  (pruebas.id('A'), 'a@prueba.test',
   '{"rol":"profesional","nombre":"ana","apellido":"arias","nombre_usuario":"prof_a","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('B'), 'b@prueba.test',
   '{"rol":"profesional","nombre":"beto","apellido":"basso","nombre_usuario":"prof_b","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('C'), 'c@prueba.test',
   '{"rol":"profesional","nombre":"carla","apellido":"cruz","nombre_usuario":"prof_c","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('D'), 'd@prueba.test',
   '{"rol":"profesional","nombre":"dani","apellido":"díaz","nombre_usuario":"prof_d","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('E'), 'e@prueba.test',
   '{"rol":"profesional","nombre":"eva","apellido":"estévez","nombre_usuario":"prof_e","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('N1'), 'tutor1@prueba.test',
   '{"rol":"nino","nombre":"nico","apellido":"uno","nombre_usuario":"nino_uno","acepta_tyc":true,"fecha_nacimiento":"2020-05-01","etapa_escolar":"sala_5"}'),
  (pruebas.id('N2'), 'tutor2@prueba.test',
   '{"rol":"nino","nombre":"nina","apellido":"dos","nombre_usuario":"nino_dos","acepta_tyc":true,"fecha_nacimiento":"2019-03-01","etapa_escolar":"primero"}');

insert into public.profesional_nino (profesional_id, nino_id, estado, fecha_afiliacion, fecha_baja, comparte_historial) values
  (pruebas.id('A'), pruebas.id('N1'), 'activa',    now(), null,  true),
  (pruebas.id('B'), pruebas.id('N1'), 'activa',    now(), null,  false),
  (pruebas.id('C'), pruebas.id('N1'), 'pendiente', null,  null,  null),
  (pruebas.id('D'), pruebas.id('N1'), 'inactiva',  now(), now(), true),
  (pruebas.id('A'), pruebas.id('N2'), 'activa',    now(), null,  false);

insert into public.test (id, nino_id, profesional_id, nivel, fecha, puntaje_total, porcentaje_total) values
  (pruebas.id('tA'),  pruebas.id('N1'), pruebas.id('A'), 'inicial',  '2026-01-10', 4, 40),
  (pruebas.id('tB'),  pruebas.id('N1'), pruebas.id('B'), 'inicial',  '2026-02-10', 6, 60),
  (pruebas.id('tX'),  pruebas.id('N1'), null,            'inicial',  '2026-03-10', 8, 80),
  (pruebas.id('tD'),  pruebas.id('N1'), pruebas.id('D'), 'inicial',  '2026-04-10', 5, 50),
  (pruebas.id('tN2'), pruebas.id('N2'), pruebas.id('A'), 'primario', '2026-05-10', 7, 70);

insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total)
select t.id, b.codigo, b.orden, 2, 5
from (values (pruebas.id('tA')), (pruebas.id('tB')), (pruebas.id('tX')), (pruebas.id('tD')), (pruebas.id('tN2'))) as t(id)
cross join (values ('discriminacion_auditiva', 1), ('conciencia_fonologica', 2)) as b(codigo, orden);


-- =====================================================================
-- 1. Las políticas quedaron como define la 0007
-- =====================================================================
select pruebas.ok('1.1 test tiene una sola política de lectura, test_select',
  (select array_agg(policyname::text) from pg_policies
   where schemaname = 'public' and tablename = 'test' and cmd in ('SELECT', 'ALL')) = array['test_select']);
select pruebas.ok('1.2 test_bloque_resultado tiene una sola política de lectura',
  (select array_agg(policyname::text) from pg_policies
   where schemaname = 'public' and tablename = 'test_bloque_resultado' and cmd in ('SELECT', 'ALL'))
  = array['test_bloque_resultado_select']);
select pruebas.ok('1.3 test_select usa profesional_puede_ver_registro y ya no compara nino_id con auth.uid()',
  (select qual ilike '%profesional_puede_ver_registro%' and qual not ilike '%auth.uid%'
   from pg_policies where schemaname = 'public' and tablename = 'test' and policyname = 'test_select'));
select pruebas.ok('1.4 test_bloque_resultado_select tampoco compara con auth.uid()',
  (select qual ilike '%profesional_puede_ver_registro%' and qual not ilike '%auth.uid%'
   from pg_policies where schemaname = 'public' and tablename = 'test_bloque_resultado'
     and policyname = 'test_bloque_resultado_select'));


-- =====================================================================
-- 2. La sesión del niño (que comparte con su tutor)
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.ok('2.1 el niño no ve ninguna fila de test, ni las suyas',
  (select count(*) from public.test) = 0);
select pruebas.ok('2.2 el niño no ve sus evaluaciones ni filtrando por su id',
  (select count(*) from public.test where nino_id = pruebas.id('N1')) = 0
  and not exists (select 1 from public.test where id = pruebas.id('tA')));
select pruebas.ok('2.3 el niño no ve ninguna fila de test_bloque_resultado',
  pruebas.bloques_visibles() = 0
  and not exists (select 1 from public.test_bloque_resultado where test_id = pruebas.id('tA')));
select pruebas.ok('2.4 el niño no obtiene filas de ninos_para_test()',
  (select count(*) from public.ninos_para_test()) = 0);
select pruebas.ok('2.5 profesional_puede_ver_registro da false para el niño',
  not public.profesional_puede_ver_registro(pruebas.id('N1'), pruebas.id('A'))
  and not public.profesional_puede_ver_registro(pruebas.id('N1'), null));
select pruebas.falla('2.6 el niño no puede insertar una evaluación directamente',
  $q$insert into public.test (nino_id, profesional_id, nivel, puntaje_total, porcentaje_total)
     values (pruebas.id('N1'), pruebas.id('A'), 'inicial', 1, 10)$q$, 'permission denied');


-- =====================================================================
-- 3. Otro niño
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N2'));
select pruebas.ok('3.1 N2 no ve las evaluaciones de N1 ni las suyas',
  (select count(*) from public.test) = 0);
select pruebas.ok('3.2 N2 no ve ningún bloque',
  pruebas.bloques_visibles() = 0);


-- =====================================================================
-- 4. Profesionales con vínculo activo (sin cambios respecto de la 0005)
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('4.1 A (comparte N1) ve las 4 de N1, incluidas la de otro, la sin autor y la de D',
  (select array_agg(id order by fecha) from public.test where nino_id = pruebas.id('N1'))
  = array[pruebas.id('tA'), pruebas.id('tB'), pruebas.id('tX'), pruebas.id('tD')]);
select pruebas.ok('4.2 A ve también la que tomó a N2 (sin compartir, pero es suya)',
  pruebas.tests_visibles() = array[pruebas.id('tA'), pruebas.id('tB'), pruebas.id('tX'), pruebas.id('tD'), pruebas.id('tN2')]);
select pruebas.ok('4.3 A ve los bloques de las 5 evaluaciones',
  pruebas.bloques_visibles() = 10);
select pruebas.ok('4.4 ninos_para_test() sigue igual: la última visible de N1 es la de D (50 %)',
  (select fecha_ultimo_test::date = '2026-04-10' and porcentaje_ultimo_test = 50
   from public.ninos_para_test() where nino_id = pruebas.id('N1')));

select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.ok('4.5 B (no comparte) ve solo la que tomó él',
  pruebas.tests_visibles() = array[pruebas.id('tB')]);
select pruebas.ok('4.6 B ve solo los bloques de su evaluación',
  pruebas.bloques_visibles() = 2
  and not exists (select 1 from public.test_bloque_resultado where test_id <> pruebas.id('tB')));


-- =====================================================================
-- 5. Profesionales sin vínculo activo
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('C'));
select pruebas.ok('5.1 C con vínculo pendiente no ve evaluaciones ni bloques',
  pruebas.tests_visibles() = '{}' and pruebas.bloques_visibles() = 0);

select pruebas.sesion('authenticated', pruebas.id('D'));
select pruebas.ok('5.2 D dado de baja no ve nada, ni la que tomó él (aunque compartía)',
  pruebas.tests_visibles() = '{}' and pruebas.bloques_visibles() = 0
  and not exists (select 1 from public.test where id = pruebas.id('tD')));

select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.ok('5.3 E sin vínculo no ve evaluaciones ni bloques',
  pruebas.tests_visibles() = '{}' and pruebas.bloques_visibles() = 0);


-- =====================================================================
-- 6. Sesión anónima
-- =====================================================================
select pruebas.sesion('anon');
select pruebas.falla('6.1 anon no puede leer test',
  $q$select count(*) from public.test$q$, 'permission denied');
select pruebas.falla('6.2 anon no puede leer test_bloque_resultado',
  $q$select count(*) from public.test_bloque_resultado$q$, 'permission denied');
select pruebas.sesion('postgres');

select pruebas.ok('6.3 los datos siguen en la base (5 evaluaciones, 10 bloques)',
  (select count(*) from public.test) = 5 and (select count(*) from public.test_bloque_resultado) = 10);


-- ---------------------------------------------------------------------
-- Resumen
-- ---------------------------------------------------------------------
\pset tuples_only off
\pset format aligned
select count(*) filter (where pasa) as pasan, count(*) filter (where not pasa) as fallan
from pruebas.resultado;

select caso, detalle from pruebas.resultado where not pasa order by n;

do $$
begin
  if exists (select 1 from pruebas.resultado where not pasa) then
    raise exception 'Hay escenarios que fallaron (ver arriba).';
  end if;
end $$;

rollback;
