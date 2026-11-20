-- =====================================================================
-- Lecxico · Escenarios de acceso indebido de la 0005 (S8)
-- =====================================================================
--
-- Requiere 00_simular_supabase.sql y las migraciones aplicadas en un
-- Postgres local (ver supabase/tests/README.md). Se corre después de
-- TODAS las migraciones, así que refleja la regla vigente (por ejemplo,
-- desde la 0007 el niño ya no ve sus evaluaciones).
--
-- Todo corre en UNA transacción que termina en ROLLBACK: la base queda
-- como estaba y el archivo se puede volver a correr.
--
-- Cada caso imprime "PASA <caso>" (NOTICE) o "FALLA <caso>" (WARNING). Al
-- final hay un resumen; si algún caso falló, el archivo termina con error.
--
-- Usuarios de prueba (los crea handle_new_user al insertar en auth.users):
--   A, B  profesionales con TyC y compromiso
--   C     profesional con TyC, sin compromiso
--   G     profesional dado de alta con Google (sin rol ni compromiso)
--   N1, N2, N3  niños (N3 se elimina en el escenario 8)
-- =====================================================================

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

begin;

-- ---------------------------------------------------------------------
-- Ayudas
-- ---------------------------------------------------------------------
create schema pruebas;
grant usage on schema pruebas to public;

create table pruebas.ids (alias text primary key, id uuid not null default gen_random_uuid());
create table pruebas.resultado (n serial primary key, caso text not null, pasa boolean not null, detalle text);

-- Id de un usuario, vínculo o evaluación por su alias.
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
-- Preparación: usuarios, invitaciones y evaluaciones
-- ---------------------------------------------------------------------
insert into pruebas.ids (alias) values
  ('A'), ('B'), ('C'), ('G'), ('N1'), ('N2'), ('N3'),
  ('tA'), ('tB'), ('tX'), ('tN3');

insert into auth.users (id, email, raw_user_meta_data) values
  (pruebas.id('A'), 'a@prueba.test',
   '{"rol":"profesional","nombre":"ana","apellido":"arias","nombre_usuario":"prof_a","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('B'), 'b@prueba.test',
   '{"rol":"profesional","nombre":"beto","apellido":"basso","nombre_usuario":"prof_b","acepta_tyc":true,"acepta_compromiso":true}'),
  (pruebas.id('C'), 'c@prueba.test',
   '{"rol":"profesional","nombre":"carla","apellido":"cruz","nombre_usuario":"prof_c","acepta_tyc":true}'),
  (pruebas.id('G'), 'g@prueba.test',
   '{"given_name":"gabi","family_name":"gómez","full_name":"Gabi Gómez"}'),
  (pruebas.id('N1'), 'tutor1@prueba.test',
   '{"rol":"nino","nombre":"nico","apellido":"uno","nombre_usuario":"nino_uno","acepta_tyc":true,"fecha_nacimiento":"2020-05-01","etapa_escolar":"sala_5","tutor_telefono":"1111","acepta_compromiso":true}'),
  (pruebas.id('N2'), 'tutor2@prueba.test',
   '{"rol":"nino","nombre":"nina","apellido":"dos","nombre_usuario":"nino_dos","acepta_tyc":true,"fecha_nacimiento":"2019-03-01","etapa_escolar":"primero"}'),
  (pruebas.id('N3'), 'tutor3@prueba.test',
   '{"rol":"nino","nombre":"noe","apellido":"tres","nombre_usuario":"nino_tres","acepta_tyc":true,"fecha_nacimiento":"2018-03-01","etapa_escolar":"segundo"}');

-- Invitaciones pendientes: A → N1, A → N2, B → N1, B → N2.
select pruebas.sesion('authenticated', pruebas.id('A'));
select from public.invitar_nino('nino_uno');
select from public.invitar_nino('nino_dos');
select pruebas.sesion('authenticated', pruebas.id('B'));
select from public.invitar_nino('nino_uno');
select from public.invitar_nino('nino_dos');
select pruebas.sesion('postgres');

-- Evaluaciones de N1: una de A, una de B y una sin profesional (cuenta borrada).
insert into public.test (id, nino_id, profesional_id, nivel, fecha, puntaje_total, porcentaje_total) values
  (pruebas.id('tA'), pruebas.id('N1'), pruebas.id('A'), 'inicial', '2026-01-10', 4, 40),
  (pruebas.id('tB'), pruebas.id('N1'), pruebas.id('B'), 'inicial', '2026-02-10', 6, 60),
  (pruebas.id('tX'), pruebas.id('N1'), null,            'inicial', '2026-03-10', 8, 80);

insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total)
select t.id, b.codigo, b.orden, 2, 5
from (values (pruebas.id('tA')), (pruebas.id('tB')), (pruebas.id('tX'))) as t(id)
cross join (values ('discriminacion_auditiva', 1), ('conciencia_fonologica', 2)) as b(codigo, orden);


-- =====================================================================
-- 1. Nadie salvo service_role ejecuta las funciones tutor_*
-- =====================================================================
select pruebas.ok('1.1 anon no tiene EXECUTE sobre tutor_responder_invitacion',
  not has_function_privilege('anon', 'public.tutor_responder_invitacion(uuid,uuid,boolean,boolean)', 'execute'));
select pruebas.ok('1.2 anon no tiene EXECUTE sobre tutor_desvincular',
  not has_function_privilege('anon', 'public.tutor_desvincular(uuid,uuid)', 'execute'));
select pruebas.ok('1.3 anon no tiene EXECUTE sobre tutor_cambiar_etapa',
  not has_function_privilege('anon', 'public.tutor_cambiar_etapa(uuid,text)', 'execute'));
select pruebas.ok('1.4 authenticated no tiene EXECUTE sobre tutor_responder_invitacion',
  not has_function_privilege('authenticated', 'public.tutor_responder_invitacion(uuid,uuid,boolean,boolean)', 'execute'));
select pruebas.ok('1.5 authenticated no tiene EXECUTE sobre tutor_desvincular',
  not has_function_privilege('authenticated', 'public.tutor_desvincular(uuid,uuid)', 'execute'));
select pruebas.ok('1.6 authenticated no tiene EXECUTE sobre tutor_cambiar_etapa',
  not has_function_privilege('authenticated', 'public.tutor_cambiar_etapa(uuid,text)', 'execute'));
select pruebas.ok('1.7 service_role sí tiene EXECUTE sobre las tres',
  has_function_privilege('service_role', 'public.tutor_responder_invitacion(uuid,uuid,boolean,boolean)', 'execute')
  and has_function_privilege('service_role', 'public.tutor_desvincular(uuid,uuid)', 'execute')
  and has_function_privilege('service_role', 'public.tutor_cambiar_etapa(uuid,text)', 'execute'));

select pruebas.sesion('anon');
select pruebas.falla('1.8 anon no puede llamar a tutor_cambiar_etapa',
  $q$select public.tutor_cambiar_etapa(pruebas.id('N1'), 'primero')$q$, 'permission denied');
select pruebas.falla('1.9 anon no puede llamar a tutor_responder_invitacion',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, true)$q$, 'permission denied');

select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('1.10 la sesión del niño no puede aceptar con tutor_responder_invitacion',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, true)$q$, 'permission denied');
select pruebas.falla('1.11 la sesión del niño no puede usar tutor_desvincular',
  $q$select public.tutor_desvincular(pruebas.id('N1'), pruebas.vinculo('A', 'N1'))$q$, 'permission denied');
select pruebas.falla('1.12 la sesión del niño no puede usar tutor_cambiar_etapa',
  $q$select public.tutor_cambiar_etapa(pruebas.id('N1'), 'primero')$q$, 'permission denied');

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.falla('1.13 un profesional no puede usar tutor_cambiar_etapa',
  $q$select public.tutor_cambiar_etapa(pruebas.id('N1'), 'primero')$q$, 'permission denied');
select pruebas.sesion('postgres');

select pruebas.ok('1.14 nada cambió: la invitación A → N1 sigue pendiente y N1 sigue en sala_5',
  (select estado from public.profesional_nino where id = pruebas.vinculo('A', 'N1')) = 'pendiente'
  and (select etapa_escolar from public.ninos where profile_id = pruebas.id('N1')) = 'sala_5');


-- =====================================================================
-- 3. service_role con tutor_responder_invitacion
-- =====================================================================
-- (Va antes del 2 porque el 2 necesita un vínculo activo.)
select pruebas.sesion('service_role');
select pruebas.falla('3.1 con el p_nino_id de otro niño → no encontrada',
  $q$select public.tutor_responder_invitacion(pruebas.id('N2'), pruebas.vinculo('A', 'N1'), true, true)$q$,
  'No se encontró la invitación.');
select pruebas.falla('3.2 con un p_nino_id que es un profesional → mismo mensaje',
  $q$select public.tutor_responder_invitacion(pruebas.id('A'), pruebas.vinculo('A', 'N1'), true, true)$q$,
  'No se encontró la invitación.');
select pruebas.falla('3.3 con un vínculo que no existe → mismo mensaje',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), gen_random_uuid(), true, true)$q$,
  'No se encontró la invitación.');
select pruebas.falla('3.4 aceptar sin p_comparte_historial → error',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, null)$q$,
  'Elegí si compartís el historial.');
select pruebas.falla('3.5 sin indicar si acepta → error',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), null, true)$q$,
  'Indicá si aceptás o rechazás');
select pruebas.anda('3.6 aceptar A → N1 con false',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, false)$q$);
select pruebas.anda('3.7 aceptar A → N2 con true',
  $q$select public.tutor_responder_invitacion(pruebas.id('N2'), pruebas.vinculo('A', 'N2'), true, true)$q$);
select pruebas.anda('3.8 rechazar B → N2 (sin elección de historial)',
  $q$select public.tutor_responder_invitacion(pruebas.id('N2'), pruebas.vinculo('B', 'N2'), false, null)$q$);
select pruebas.falla('3.9 responder una invitación que ya no está pendiente → error',
  $q$select public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, true)$q$,
  'ya no está pendiente');
select pruebas.sesion('postgres');

select pruebas.ok('3.10 A → N1 quedó activa, con fecha de vinculación y comparte_historial = false',
  (select estado = 'activa' and fecha_afiliacion is not null and comparte_historial = false
   from public.profesional_nino where id = pruebas.vinculo('A', 'N1')));
select pruebas.ok('3.11 A → N2 quedó activa con comparte_historial = true',
  (select estado = 'activa' and comparte_historial = true
   from public.profesional_nino where id = pruebas.vinculo('A', 'N2')));
select pruebas.ok('3.12 rechazar borró la fila B → N2',
  pruebas.vinculo('B', 'N2') is null);
select pruebas.falla('3.13 el check impide un vínculo activo sin comparte_historial',
  $q$update public.profesional_nino set comparte_historial = null where id = pruebas.vinculo('A', 'N1')$q$,
  'profesional_nino_comparte_historial_check');


-- =====================================================================
-- 2. La sesión del niño
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('2.1 no puede llamar a responder_invitacion (ya no existe)',
  $q$select public.responder_invitacion(pruebas.vinculo('B', 'N1'), true)$q$, 'does not exist');
select pruebas.falla('2.2 no puede dar de baja su vínculo con desvincular',
  $q$select public.desvincular(pruebas.vinculo('A', 'N1'))$q$, 'No se encontró el vínculo.');
select pruebas.falla('2.3 no puede hacer UPDATE de ninos.etapa_escolar',
  $q$update public.ninos set etapa_escolar = 'primero' where profile_id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.anda('2.4 sí puede actualizar tutor_telefono',
  $q$update public.ninos set tutor_telefono = '2222' where profile_id = pruebas.id('N1')$q$);
select pruebas.falla('2.5 no puede escribir profesional_nino directamente',
  $q$update public.profesional_nino set estado = 'inactiva' where nino_id = pruebas.id('N1')$q$, 'permission denied');
select pruebas.sesion('postgres');

select pruebas.ok('2.6 el teléfono se guardó, la etapa no cambió y el vínculo sigue activo',
  (select tutor_telefono = '2222' and etapa_escolar = 'sala_5' from public.ninos where profile_id = pruebas.id('N1'))
  and (select estado from public.profesional_nino where id = pruebas.vinculo('A', 'N1')) = 'activa');


-- =====================================================================
-- 4. Compartir el historial
-- =====================================================================
-- Estado: A → N1 activa con false; B → N1 pendiente.
-- Evaluaciones de N1: tA (A, 10/01), tB (B, 10/02), tX (sin profesional, 10/03).
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('4.1 con false, A ve solo su evaluación',
  (select array_agg(id) from public.test where nino_id = pruebas.id('N1')) = array[pruebas.id('tA')]);
select pruebas.ok('4.2 con false, A ve solo los bloques de su evaluación',
  (select count(*) from public.test_bloque_resultado) = 2
  and not exists (select 1 from public.test_bloque_resultado where test_id in (pruebas.id('tB'), pruebas.id('tX'))));
select pruebas.ok('4.3 con false, ninos_para_test() muestra la última visible (la de A, 40 %)',
  (select fecha_ultimo_test::date = '2026-01-10' and porcentaje_ultimo_test = 40
   from public.ninos_para_test() where nino_id = pruebas.id('N1')));

select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.ok('4.4 B con vínculo pendiente no ve ninguna evaluación ni bloque',
  (select count(*) from public.test where nino_id = pruebas.id('N1')) = 0
  and (select count(*) from public.test_bloque_resultado) = 0);
select pruebas.ok('4.5 B con vínculo pendiente no tiene a N1 en ninos_para_test()',
  not exists (select 1 from public.ninos_para_test() where nino_id = pruebas.id('N1')));

select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.ok('4.6 el niño no ve sus evaluaciones (S10)',
  (select count(*) from public.test) = 0);

-- El tutor da de baja a A.
select pruebas.sesion('service_role');
select pruebas.anda('4.7 tutor_desvincular A → N1',
  $q$select public.tutor_desvincular(pruebas.id('N1'), pruebas.vinculo('A', 'N1'))$q$);
select pruebas.sesion('postgres');
select pruebas.ok('4.8 la baja dejó el vínculo inactivo y conservó comparte_historial = false',
  (select estado = 'inactiva' and fecha_baja is not null and comparte_historial = false
   from public.profesional_nino where id = pruebas.vinculo('A', 'N1')));

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('4.9 A con vínculo inactivo no ve ninguna evaluación, ni la suya',
  (select count(*) from public.test where nino_id = pruebas.id('N1')) = 0
  and (select count(*) from public.test_bloque_resultado) = 0
  and not exists (select 1 from public.ninos_para_test() where nino_id = pruebas.id('N1')));

-- A vuelve a invitar: reutiliza la fila y reinicia la elección.
select from public.invitar_nino('nino_uno');
select pruebas.sesion('postgres');
select pruebas.ok('4.10 al volver a invitar, comparte_historial vuelve a null',
  (select estado = 'pendiente' and comparte_historial is null and fecha_baja is null
   from public.profesional_nino where id = pruebas.vinculo('A', 'N1')));

select pruebas.sesion('service_role');
select from public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, true);
select from public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('B', 'N1'), true, false);

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('4.11 con true, A ve las tres evaluaciones (incluida la de profesional_id null)',
  (select count(*) from public.test where nino_id = pruebas.id('N1')) = 3);
select pruebas.ok('4.12 con true, A ve los bloques de las tres',
  (select count(*) from public.test_bloque_resultado) = 6);
select pruebas.ok('4.13 con true, ninos_para_test() muestra la más reciente de cualquiera (80 %)',
  (select fecha_ultimo_test::date = '2026-03-10' and porcentaje_ultimo_test = 80
   from public.ninos_para_test() where nino_id = pruebas.id('N1')));

select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.ok('4.14 B activo con false ve solo la suya, y su última es la de 60 %',
  (select array_agg(id) from public.test where nino_id = pruebas.id('N1')) = array[pruebas.id('tB')]
  and (select porcentaje_ultimo_test from public.ninos_para_test() where nino_id = pruebas.id('N1')) = 60);

-- Nueva baja y nueva vinculación de A, ahora sin compartir.
select pruebas.sesion('service_role');
select from public.tutor_desvincular(pruebas.id('N1'), pruebas.vinculo('A', 'N1'));
select pruebas.sesion('authenticated', pruebas.id('A'));
select from public.invitar_nino('nino_uno');
select pruebas.sesion('service_role');
select from public.tutor_responder_invitacion(pruebas.id('N1'), pruebas.vinculo('A', 'N1'), true, false);

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('4.15 después de la baja y una nueva vinculación (false), A vuelve a ver la suya',
  (select array_agg(id) from public.test where nino_id = pruebas.id('N1')) = array[pruebas.id('tA')]
  and (select porcentaje_ultimo_test from public.ninos_para_test() where nino_id = pruebas.id('N1')) = 40);
select pruebas.ok('4.16 profesional_puede_ver_registro: suya sí, de otro no, sin autor no',
  public.profesional_puede_ver_registro(pruebas.id('N1'), pruebas.id('A'))
  and not public.profesional_puede_ver_registro(pruebas.id('N1'), pruebas.id('B'))
  and not public.profesional_puede_ver_registro(pruebas.id('N1'), null));

select pruebas.sesion('authenticated', pruebas.id('N2'));
select pruebas.ok('4.17 otro niño (N2) no ve las evaluaciones de N1',
  (select count(*) from public.test where nino_id = pruebas.id('N1')) = 0);
select pruebas.sesion('postgres');


-- =====================================================================
-- 5. tutor_desvincular y desvincular
-- =====================================================================
select pruebas.sesion('service_role');
select pruebas.falla('5.1 tutor_desvincular con el vínculo de otro niño → no encontrado',
  $q$select public.tutor_desvincular(pruebas.id('N2'), pruebas.vinculo('A', 'N1'))$q$, 'No se encontró el vínculo.');
select pruebas.falla('5.2 tutor_desvincular con un p_nino_id de profesional → no encontrado',
  $q$select public.tutor_desvincular(pruebas.id('A'), pruebas.vinculo('A', 'N1'))$q$, 'No se encontró el vínculo.');

select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.falla('5.3 un profesional no puede dar de baja el vínculo de otro',
  $q$select public.desvincular(pruebas.vinculo('A', 'N2'))$q$, 'No se encontró el vínculo.');

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.anda('5.4 el profesional sigue pudiendo usar desvincular',
  $q$select public.desvincular(pruebas.vinculo('A', 'N2'))$q$);
select pruebas.sesion('postgres');
select pruebas.ok('5.5 la baja del profesional dejó A → N2 inactiva y conservó comparte_historial',
  (select estado = 'inactiva' and comparte_historial = true
   from public.profesional_nino where id = pruebas.vinculo('A', 'N2')));

select pruebas.sesion('service_role');
select pruebas.falla('5.6 tutor_desvincular de un vínculo inactivo → error',
  $q$select public.tutor_desvincular(pruebas.id('N2'), pruebas.vinculo('A', 'N2'))$q$, 'no está activo');
select pruebas.sesion('postgres');


-- =====================================================================
-- 6. tutor_cambiar_etapa
-- =====================================================================
select pruebas.sesion('service_role');
select pruebas.falla('6.1 con un valor inválido → error',
  $q$select public.tutor_cambiar_etapa(pruebas.id('N1'), 'cuarto')$q$, 'La etapa escolar no es válida.');
select pruebas.falla('6.2 sin valor → error',
  $q$select public.tutor_cambiar_etapa(pruebas.id('N1'), null)$q$, 'La etapa escolar no es válida.');
select pruebas.falla('6.3 con un p_nino_id de profesional → no encontrado',
  $q$select public.tutor_cambiar_etapa(pruebas.id('A'), 'primero')$q$, 'No se encontró la cuenta del niño.');
select pruebas.falla('6.4 con un p_nino_id que no existe → no encontrado',
  $q$select public.tutor_cambiar_etapa(gen_random_uuid(), 'primero')$q$, 'No se encontró la cuenta del niño.');
select pruebas.anda('6.5 con un valor válido → actualiza',
  $q$select public.tutor_cambiar_etapa(pruebas.id('N1'), 'primero')$q$);
select pruebas.sesion('postgres');
select pruebas.ok('6.6 N1 quedó en primero',
  (select etapa_escolar from public.ninos where profile_id = pruebas.id('N1')) = 'primero');


-- =====================================================================
-- 7. Compromiso de uso responsable
-- =====================================================================
select pruebas.ok('7.1 handle_new_user lo guarda con fecha si viene en la metadata (A)',
  (select acepta_compromiso and fecha_aceptacion_compromiso is not null
   from public.profiles where id = pruebas.id('A')));
select pruebas.ok('7.2 handle_new_user no falla si falta (alta con Google): queda en false',
  (select rol = 'profesional' and not acepta_compromiso and fecha_aceptacion_compromiso is null
   from public.profiles where id = pruebas.id('G')));
select pruebas.ok('7.3 un profesional sin compromiso en la metadata queda en false (C)',
  (select not acepta_compromiso and fecha_aceptacion_compromiso is null
   from public.profiles where id = pruebas.id('C')));
select pruebas.ok('7.4 un niño con acepta_compromiso en la metadata queda en false',
  (select not acepta_compromiso and fecha_aceptacion_compromiso is null
   from public.profiles where id = pruebas.id('N1')));

select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.falla('7.5 un niño no puede poner acepta_compromiso en true',
  $q$update public.profiles set acepta_compromiso = true where id = pruebas.id('N1')$q$, 'Solo un profesional');

select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.falla('7.6 la aceptación no se puede revertir',
  $q$update public.profiles set acepta_compromiso = false where id = pruebas.id('A')$q$, 'no se puede revertir');

select pruebas.sesion('authenticated', pruebas.id('C'));
select pruebas.falla('7.7 invitar_nino falla sin compromiso',
  $q$select public.invitar_nino('nino_tres')$q$, 'compromiso de uso responsable');
select pruebas.falla('7.8 el cliente no puede escribir la fecha del compromiso',
  $q$update public.profiles set fecha_aceptacion_compromiso = '2000-01-01' where id = pruebas.id('C')$q$, 'permission denied');
select pruebas.anda('7.9 el profesional acepta el compromiso (como en /completar-perfil)',
  $q$update public.profiles set acepta_compromiso = true where id = pruebas.id('C')$q$);
select pruebas.sesion('postgres');
select pruebas.ok('7.10 la fecha la puso la base al aceptar',
  (select acepta_compromiso and fecha_aceptacion_compromiso = now()
   from public.profiles where id = pruebas.id('C')));

-- Aunque alguien mande otra fecha por una vía con permisos, el trigger la ignora.
update public.profiles
set fecha_aceptacion_compromiso = '2000-01-01', nombre = 'Ana'
where id = pruebas.id('A');
select pruebas.ok('7.11 la fecha la pone la base aunque se mande otra',
  (select fecha_aceptacion_compromiso <> '2000-01-01'::timestamptz
   from public.profiles where id = pruebas.id('A')));

select pruebas.sesion('authenticated', pruebas.id('C'));
select pruebas.anda('7.12 con el compromiso aceptado, invitar_nino anda',
  $q$select public.invitar_nino('nino_tres')$q$);
select pruebas.sesion('postgres');


-- =====================================================================
-- 8. Eliminación de la cuenta del niño
-- =====================================================================
-- N3: vínculo activo con A, invitación pendiente de C (7.12), una
-- evaluación con bloques y un entrenamiento.
select pruebas.sesion('authenticated', pruebas.id('A'));
select from public.invitar_nino('nino_tres');
select pruebas.sesion('service_role');
select from public.tutor_responder_invitacion(pruebas.id('N3'), pruebas.vinculo('A', 'N3'), true, true);
select pruebas.sesion('postgres');

insert into public.test (id, nino_id, profesional_id, nivel, puntaje_total, porcentaje_total)
values (pruebas.id('tN3'), pruebas.id('N3'), pruebas.id('A'), 'primario', 5, 50);
insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total)
values (pruebas.id('tN3'), 'discriminacion_auditiva', 1, 3, 5);
-- Desde la 0008 la tabla entrenamientos se reemplazó por entrenamiento_partida.
insert into public.entrenamiento_partida (nino_id, juego, nivel, grado, origen, correctas, total)
values (pruebas.id('N3'), 'rima', 'primario', 1, 'practica', 5, 8);

select pruebas.ok('8.0 antes de borrar, N3 tiene datos en todas las tablas',
  exists (select 1 from public.profiles where id = pruebas.id('N3'))
  and exists (select 1 from public.ninos where profile_id = pruebas.id('N3'))
  and (select count(*) from public.profesional_nino where nino_id = pruebas.id('N3')) = 2
  and exists (select 1 from public.test_bloque_resultado where test_id = pruebas.id('tN3'))
  and exists (select 1 from public.entrenamiento_partida where nino_id = pruebas.id('N3')));

-- Lo mismo que hace auth.admin.deleteUser.
delete from auth.users where id = pruebas.id('N3');

select pruebas.ok('8.1 no quedan filas en profiles',
  not exists (select 1 from public.profiles where id = pruebas.id('N3')));
select pruebas.ok('8.2 no quedan filas en ninos',
  not exists (select 1 from public.ninos where profile_id = pruebas.id('N3')));
select pruebas.ok('8.3 no quedan filas en profesional_nino',
  not exists (select 1 from public.profesional_nino where nino_id = pruebas.id('N3')));
select pruebas.ok('8.4 no quedan filas en test',
  not exists (select 1 from public.test where nino_id = pruebas.id('N3')));
select pruebas.ok('8.5 no quedan filas en test_bloque_resultado',
  not exists (select 1 from public.test_bloque_resultado where test_id = pruebas.id('tN3')));
select pruebas.ok('8.6 no quedan partidas del entrenamiento',
  not exists (select 1 from public.entrenamiento_partida where nino_id = pruebas.id('N3')));
select pruebas.ok('8.7 los profesionales y los demás niños siguen intactos',
  (select count(*) from public.profiles where id in (pruebas.id('A'), pruebas.id('C'), pruebas.id('N1'))) = 3);


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
