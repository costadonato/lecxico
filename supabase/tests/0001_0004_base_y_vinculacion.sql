-- =====================================================================
-- Lecxico · Escenarios de acceso indebido de las migraciones 0001 a 0004
-- =====================================================================
--
-- Requiere 00_simular_supabase.sql y TODAS las migraciones aplicadas en
-- un Postgres local (ver supabase/tests/README.md). Refleja la regla
-- vigente: por ejemplo, desde la 0003 la vinculación pasa por funciones y
-- desde la 0005 responder_invitacion ya no existe.
--
-- Qué se prueba: las tablas base (profiles, ninos, profesional_nino,
-- test, test_bloque_resultado), su RLS y sus permisos, las funciones de
-- invitación (invitar_nino, cancelar_invitacion, desvincular,
-- vinculos_del_profesional) y ninos_para_test.
--
-- Cada escenario de acceso indebido empieza con su código de la matriz
-- (docs/matriz-pa.md). Los casos de uso legítimo empiezan con "VÁLIDO".
--
-- Todo corre en UNA transacción que termina en ROLLBACK: la base queda
-- como estaba y el archivo se puede volver a correr.
--
-- Cada caso imprime "PASA <caso>" (NOTICE) o "FALLA <caso>" (WARNING). Al
-- final hay un resumen; si algún caso falló, el archivo termina con error.
--
-- Usuarios de prueba (los crea handle_new_user al insertar en auth.users):
--   A   profesional con vínculo activo con N1 (comparte el historial)
--   B   profesional con una invitación pendiente a N2
--   E   profesional sin vínculo
--   N1  niño (sala de 5), vinculado con A
--   N2  niño (primer grado), con la invitación pendiente de B
--
-- Datos de N1: una evaluación tomada por A (tA, con 2 bloques) y una
-- partida de consulta registrada por A.
-- =====================================================================

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

begin;

-- ---------------------------------------------------------------------
-- Ayudas (las mismas que en 0005_s8_contrasena_tutor.sql, más sin_cambios)
-- ---------------------------------------------------------------------
create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.ids (alias text primary key, id uuid not null default gen_random_uuid());
create table pruebas.resultado (n serial primary key, caso text not null, pasa boolean not null, detalle text);

-- Id de un usuario, evaluación o partida por su alias.
create function pruebas.id(p_alias text) returns uuid
language sql stable security definer set search_path = pruebas as $$
  select id from pruebas.ids where alias = p_alias;
$$;

-- Id del vínculo entre un profesional y un niño (sin pasar por la RLS).
create function pruebas.vinculo(p_prof text, p_nino text) returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.profesional_nino
  where profesional_id = pruebas.id(p_prof) and nino_id = pruebas.id(p_nino);
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

-- El SQL tiene que andar sin error.
create function pruebas.anda(p_caso text, p_sql text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    perform pruebas.ok(p_caso, false, 'error: ' || sqlerrm);
    return;
  end;
  perform pruebas.ok(p_caso, true);
end $$;

-- El UPDATE o DELETE no tiene que cambiar nada: pasa si da error o si no
-- toca ninguna fila (la RLS de UPDATE filtra en silencio, sin error).
-- Corre con el rol de la sesión simulada (no es security definer).
create function pruebas.sin_cambios(p_caso text, p_sql text) returns void
language plpgsql as $$
declare
  v_filas bigint;
begin
  begin
    execute p_sql;
    get diagnostics v_filas = row_count;
  exception when others then
    perform pruebas.ok(p_caso, true, 'error: ' || sqlerrm);
    return;
  end;
  perform pruebas.ok(p_caso, v_filas = 0, v_filas || ' filas modificadas');
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


-- ---------------------------------------------------------------------
-- Preparación: usuarios, vínculos, evaluación y partida
-- ---------------------------------------------------------------------
insert into pruebas.ids (alias) values
  ('A'), ('B'), ('E'), ('N1'), ('N2'), ('tA'), ('pA');

insert into auth.users (id, email, raw_user_meta_data) values
  (pruebas.id('A'), 'a@prueba.test',
   '{"rol":"profesional","nombre":"ana","apellido":"arias","nombre_usuario":"prof_a","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('B'), 'b@prueba.test',
   '{"rol":"profesional","nombre":"beto","apellido":"basso","nombre_usuario":"prof_b","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('E'), 'e@prueba.test',
   '{"rol":"profesional","nombre":"eva","apellido":"estévez","nombre_usuario":"prof_e","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('N1'), 'tutor1@prueba.test',
   '{"rol":"nino","nombre":"nico","apellido":"uno","nombre_usuario":"nino_uno","acepta_tyc":true,"fecha_nacimiento":"2020-05-01","etapa_escolar":"sala_5"}'),
  (pruebas.id('N2'), 'tutor2@prueba.test',
   '{"rol":"nino","nombre":"nina","apellido":"dos","nombre_usuario":"nino_dos","acepta_tyc":true,"fecha_nacimiento":"2019-03-01","etapa_escolar":"primero"}');

-- A → N1 activo (como superusuario: aceptar es una acción del tutor, 0005).
insert into public.profesional_nino (profesional_id, nino_id, estado, fecha_afiliacion, comparte_historial)
values (pruebas.id('A'), pruebas.id('N1'), 'activa', now(), true);

-- B → N2 pendiente, por la vía normal.
select pruebas.sesion('authenticated', pruebas.id('B'));
select from public.invitar_nino('nino_dos');
select pruebas.sesion('postgres');

-- Evaluación de N1 tomada por A, con dos bloques.
insert into public.test (id, nino_id, profesional_id, nivel, fecha, puntaje_total, porcentaje_total)
values (pruebas.id('tA'), pruebas.id('N1'), pruebas.id('A'), 'inicial', '2026-01-10', 4, 40);
insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total) values
  (pruebas.id('tA'), 'discriminacion_auditiva', 1, 2, 5),
  (pruebas.id('tA'), 'conciencia_fonologica',   2, 2, 5);

-- Partida de consulta de N1 registrada por A.
insert into public.entrenamiento_partida (id, nino_id, profesional_id, juego, nivel, grado, origen, correctas, total)
values (pruebas.id('pA'), pruebas.id('N1'), pruebas.id('A'), 'rima', 'inicial', 1, 'consulta', 5, 8);


-- =====================================================================
-- PA-01 · Usuario sin sesión
-- =====================================================================
select pruebas.sesion('anon');
select pruebas.falla('PA-01 anon no lee profiles',
  $q$select count(*) from public.profiles$q$, 'permission denied');
select pruebas.falla('PA-01 anon no lee ninos',
  $q$select count(*) from public.ninos$q$, 'permission denied');
select pruebas.falla('PA-01 anon no lee profesional_nino',
  $q$select count(*) from public.profesional_nino$q$, 'permission denied');
select pruebas.falla('PA-01 anon no ejecuta invitar_nino',
  $q$select public.invitar_nino('nino_uno')$q$, 'permission denied');
select pruebas.falla('PA-01 anon no ejecuta cancelar_invitacion',
  $q$select public.cancelar_invitacion(pruebas.vinculo('B', 'N2'))$q$, 'permission denied');
select pruebas.falla('PA-01 anon no ejecuta desvincular',
  $q$select public.desvincular(pruebas.vinculo('A', 'N1'))$q$, 'permission denied');
select pruebas.falla('PA-01 anon no ejecuta ninos_para_test',
  $q$select * from public.ninos_para_test()$q$, 'permission denied');
select pruebas.falla('PA-01 anon no ejecuta vinculos_del_profesional',
  $q$select * from public.vinculos_del_profesional()$q$, 'permission denied');
select pruebas.sesion('postgres');


-- =====================================================================
-- PA-02 · Cuenta de niño que intenta ver datos de otro niño (N2 → N1)
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N2'));
select pruebas.ok('PA-02 N2 no lee la fila de ninos de N1',
  not exists (select 1 from public.ninos where profile_id = pruebas.id('N1'))
  and (select array_agg(profile_id) from public.ninos) = array[pruebas.id('N2')]);
select pruebas.ok('PA-02 N2 no ve los vínculos de N1 en profesional_nino',
  not exists (select 1 from public.profesional_nino where nino_id = pruebas.id('N1')));
select pruebas.ok('PA-02 N2 no lee el perfil de N1',
  not exists (select 1 from public.profiles where id = pruebas.id('N1')));
select pruebas.ok('PA-02 N2 no ve otros perfiles: solo el suyo y el de B, que lo invitó',
  (select array_agg(id order by id) from public.profiles)
  = (select array_agg(x order by x) from unnest(array[pruebas.id('N2'), pruebas.id('B')]) as x));
select pruebas.ok('PA-02 ninos_para_test() no le devuelve nada a N2',
  (select count(*) from public.ninos_para_test()) = 0);
select pruebas.sesion('postgres');


-- =====================================================================
-- PA-05 · Profesional sin vínculo que intenta leer datos del niño (E → N1)
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.ok('PA-05 E no lee la fila de ninos de N1',
  (select count(*) from public.ninos) = 0);
select pruebas.ok('PA-05 E no lee el perfil de N1',
  not exists (select 1 from public.profiles where id = pruebas.id('N1')));
select pruebas.ok('PA-05 E no ve el vínculo de N1 con A',
  (select count(*) from public.profesional_nino) = 0);
select pruebas.ok('PA-05 ninos_para_test() no le devuelve a N1',
  (select count(*) from public.ninos_para_test()) = 0);
select pruebas.sesion('postgres');


-- =====================================================================
-- PA-09 · Cuenta de niño que intenta modificar resultados registrados
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('PA-09 N1 no modifica su evaluación (test)',
  $q$update public.test set porcentaje_total = 100 where id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-09 N1 no borra su evaluación (test)',
  $q$delete from public.test where id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-09 N1 no modifica los bloques de su evaluación',
  $q$update public.test_bloque_resultado set correctas = 5 where test_id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-09 N1 no borra los bloques de su evaluación',
  $q$delete from public.test_bloque_resultado where test_id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.sesion('postgres');


-- =====================================================================
-- PA-15 · Profesional que intenta modificar o borrar lo que registró
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.falla('PA-15 A no modifica la evaluación que tomó (test)',
  $q$update public.test set porcentaje_total = 100 where id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-15 A no borra la evaluación que tomó (test)',
  $q$delete from public.test where id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-15 A no modifica los bloques de su evaluación',
  $q$update public.test_bloque_resultado set correctas = 5 where test_id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-15 A no borra los bloques de su evaluación',
  $q$delete from public.test_bloque_resultado where test_id = pruebas.id('tA')$q$, 'permission denied');
select pruebas.falla('PA-15 A no modifica la partida que registró',
  $q$update public.entrenamiento_partida set correctas = 8 where id = pruebas.id('pA')$q$, 'permission denied');
select pruebas.falla('PA-15 A no borra la partida que registró',
  $q$delete from public.entrenamiento_partida where id = pruebas.id('pA')$q$, 'permission denied');
select pruebas.sesion('postgres');


-- =====================================================================
-- PA-03e · Eliminar la cuenta sin la contraseña del tutor
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('PA-03e la sesión de N1 no borra su fila de ninos',
  $q$delete from public.ninos where profile_id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.falla('PA-03e la sesión de N1 no borra su perfil',
  $q$delete from public.profiles where id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.falla('PA-03e la sesión de N1 no borra su usuario de auth.users',
  $q$delete from auth.users where id = pruebas.id('N1')$q$, 'permission denied');

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.falla('PA-03e A, vinculado, no borra la fila de ninos de N1',
  $q$delete from public.ninos where profile_id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.falla('PA-03e A, vinculado, no borra el perfil de N1',
  $q$delete from public.profiles where id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.sesion('postgres');


-- =====================================================================
-- PA-13 · Escrituras indebidas sobre el perfil
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('PA-13 N1 no cambia su rol a profesional',
  $q$update public.profiles set rol = 'profesional' where id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.sin_cambios('PA-13 N1 no cambia el nombre de N2',
  $q$update public.profiles set nombre = 'Otro' where id = pruebas.id('N2')$q$);
select pruebas.sin_cambios('PA-13 N1 no cambia el nombre de A, aunque ve su perfil',
  $q$update public.profiles set nombre = 'Otro' where id = pruebas.id('A')$q$);

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.sin_cambios('PA-13 A, vinculado, no cambia el nombre de N1',
  $q$update public.profiles set nombre = 'Otro', apellido = 'Otro' where id = pruebas.id('N1')$q$);
select pruebas.sin_cambios('PA-13 A, vinculado, no cambia el nombre de usuario de N1',
  $q$update public.profiles set nombre_usuario = 'robado' where id = pruebas.id('N1')$q$);
select pruebas.sin_cambios('PA-13 A no cambia el nombre de usuario de B',
  $q$update public.profiles set nombre_usuario = 'robado' where id = pruebas.id('B')$q$);
select pruebas.falla('PA-13 A no cambia el rol de N1',
  $q$update public.profiles set rol = 'profesional' where id = pruebas.id('N1')$q$, 'permission denied');

select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.falla('PA-13 E no cambia el rol de A',
  $q$update public.profiles set rol = 'nino' where id = pruebas.id('A')$q$, 'permission denied');
select pruebas.sesion('postgres');


-- =====================================================================
-- VÁLIDO · Uso legítimo de las tablas base
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('VÁLIDO A, vinculado, lee la fila de ninos de N1',
  exists (select 1 from public.ninos where profile_id = pruebas.id('N1') and etapa_escolar = 'sala_5'));
select pruebas.ok('VÁLIDO A, vinculado, lee el perfil de N1',
  (select nombre_usuario from public.profiles where id = pruebas.id('N1')) = 'nino_uno');
select pruebas.ok('VÁLIDO ninos_para_test() le devuelve a N1 con su última evaluación',
  (select porcentaje_ultimo_test from public.ninos_para_test() where nino_id = pruebas.id('N1')) = 40);

select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.ok('VÁLIDO N1 lee su propio perfil',
  (select nombre_usuario from public.profiles where id = pruebas.id('N1')) = 'nino_uno');
select pruebas.ok('VÁLIDO N1 lee su fila de ninos',
  (select array_agg(profile_id) from public.ninos) = array[pruebas.id('N1')]);
select pruebas.ok('VÁLIDO N1 ve el perfil de A, su profesional',
  exists (select 1 from public.profiles where id = pruebas.id('A')));
select pruebas.anda('VÁLIDO N1 edita su propio nombre',
  $q$update public.profiles set nombre = 'nicolás' where id = pruebas.id('N1')$q$);
select pruebas.sesion('postgres');
select pruebas.ok('VÁLIDO el nombre se guardó con formato y el rol no cambió',
  (select nombre = 'Nicolás' and rol = 'nino' from public.profiles where id = pruebas.id('N1')));


-- =====================================================================
-- PA-14 · Uso indebido de las invitaciones
-- =====================================================================
-- A invita a N2 por la vía normal: es el punto de partida de los casos.
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.anda('VÁLIDO A invita a N2',
  $q$select public.invitar_nino('nino_dos')$q$);

select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('PA-14 una cuenta de niño no puede llamar a invitar_nino',
  $q$select public.invitar_nino('nino_dos')$q$, 'Solo un profesional');

select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.falla('PA-14 E no inserta un vínculo activo directamente en profesional_nino',
  $q$insert into public.profesional_nino (profesional_id, nino_id, estado, fecha_afiliacion, comparte_historial)
     values (pruebas.id('E'), pruebas.id('N1'), 'activa', now(), true)$q$, 'permission denied');

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.falla('PA-14 A no pasa su invitación pendiente a activa con un UPDATE',
  $q$update public.profesional_nino set estado = 'activa', comparte_historial = true
     where id = pruebas.vinculo('A', 'N2')$q$, 'permission denied');
select pruebas.ok('PA-14 A no ve en la tabla la invitación que B le mandó a N2',
  not exists (select 1 from public.profesional_nino where profesional_id = pruebas.id('B')));
select pruebas.ok('PA-14 vinculos_del_profesional() no le muestra a A la invitación de B',
  not exists (select 1 from public.vinculos_del_profesional() where vinculo_id = pruebas.vinculo('B', 'N2')));
select pruebas.falla('PA-14 A no cancela la invitación de B',
  $q$select public.cancelar_invitacion(pruebas.vinculo('B', 'N2'))$q$, 'No se encontró la invitación.');
select pruebas.falla('PA-14 A no puede invitar a un usuario que no es niño',
  $q$select public.invitar_nino('prof_b')$q$, 'No existe una cuenta de niño');

select pruebas.sesion('authenticated', pruebas.id('N2'));
select pruebas.falla('PA-14 N2 no cancela una invitación que recibió',
  $q$select public.cancelar_invitacion(pruebas.vinculo('A', 'N2'))$q$, 'No se encontró la invitación.');
select pruebas.sesion('postgres');

select pruebas.ok('VÁLIDO la invitación de B a N2 sigue pendiente',
  (select estado from public.profesional_nino where id = pruebas.vinculo('B', 'N2')) = 'pendiente');


-- =====================================================================
-- VÁLIDO · El profesional ve y cancela su propia invitación pendiente
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('VÁLIDO A ve su invitación pendiente a N2 en la tabla',
  (select estado from public.profesional_nino where id = pruebas.vinculo('A', 'N2')) = 'pendiente');
select pruebas.ok('VÁLIDO vinculos_del_profesional() le muestra la invitación, sin el nombre del niño',
  (select estado = 'pendiente' and nombre_usuario = 'nino_dos' and nombre is null
   from public.vinculos_del_profesional() where vinculo_id = pruebas.vinculo('A', 'N2')));
select pruebas.anda('VÁLIDO A cancela su invitación pendiente',
  $q$select public.cancelar_invitacion(pruebas.vinculo('A', 'N2'))$q$);
select pruebas.sesion('postgres');
select pruebas.ok('VÁLIDO la invitación cancelada ya no existe y la de B sigue',
  pruebas.vinculo('A', 'N2') is null and pruebas.vinculo('B', 'N2') is not null);


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
