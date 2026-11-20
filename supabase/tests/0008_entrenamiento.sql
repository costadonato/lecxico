-- =====================================================================
-- Lecxico · Escenarios de la 0008 (S12, datos del entrenamiento)
-- =====================================================================
--
-- Requiere 00_simular_supabase.sql y las migraciones 0001 a 0008
-- aplicadas en un Postgres local (ver supabase/tests/README.md).
--
-- Qué se prueba: desbloqueo del 80 % en el servidor, quién registra cada
-- origen (consulta, tarea, práctica), juegos de solo consulta y de otro
-- nivel, visibilidad de partidas y tareas, la letra del entrenamiento y el
-- borrado en cascada.
--
-- Todo corre en UNA transacción que termina en ROLLBACK.
--
-- Usuarios: A (profesional, comparte el historial de N1), B (profesional,
-- no comparte), E (profesional sin vínculo), N1 (sala de 5, inicial),
-- N2 (primer grado, primario, vinculado con A).
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


-- Partidas que ve la sesión actual (no es security definer: corre con la RLS de la sesión).
create function pruebas.partidas_visibles() returns bigint
language sql stable as $$ select count(*) from public.entrenamiento_partida; $$;

-- Guarda un id con alias desde cualquier sesión.
create function pruebas.guardar_id(p_alias text, p_id uuid) returns uuid
language sql security definer set search_path = pruebas as $$
  insert into pruebas.ids (alias, id) values (p_alias, p_id) returning id;
$$;

create function pruebas.habilitado(p_nino uuid, p_juego text) returns int
language sql as $$ select grado from public.grados_habilitados(p_nino) where juego = p_juego; $$;


-- ---------------------------------------------------------------------
-- Preparación (como superusuario)
-- ---------------------------------------------------------------------
insert into pruebas.ids (alias) values ('A'), ('B'), ('E'), ('N1'), ('N2'), ('M1');

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

-- A comparte el historial de N1; B no. A también está vinculado con N2.
insert into public.profesional_nino (profesional_id, nino_id, estado, fecha_afiliacion, comparte_historial) values
  (pruebas.id('A'), pruebas.id('N1'), 'activa', now(), true),
  (pruebas.id('B'), pruebas.id('N1'), 'activa', now(), false),
  (pruebas.id('A'), pruebas.id('N2'), 'activa', now(), false);


-- =====================================================================
-- 1. Estructura
-- =====================================================================
select pruebas.ok('1.1 la tabla heredada entrenamientos ya no existe', to_regclass('public.entrenamientos') is null);
select pruebas.ok('1.2 el catálogo tiene los 14 juegos', (select count(*) from public.entrenamiento_juego) = 14);
select pruebas.ok('1.3 solo Nombrá rápido es de consulta',
  (select array_agg(codigo) from public.entrenamiento_juego where solo_consulta) = array['nombra']);
select pruebas.ok('1.4 la letra arranca en mayúscula',
  (select letra_entrenamiento from public.ninos where profile_id = pruebas.id('N1')) = 'mayuscula');
select pruebas.ok('1.5 las cuatro tablas tienen RLS',
  (select bool_and(relrowsecurity) from pg_class where relname in
   ('entrenamiento_juego', 'entrenamiento_tarea', 'entrenamiento_tarea_item', 'entrenamiento_partida')));


-- =====================================================================
-- 2. Práctica en casa (cuenta del niño N1, nivel inicial)
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.ok('2.1 al empezar, todos los juegos de inicial están en grado 1',
  (select bool_and(grado = 1) and count(*) = 8 from public.grados_habilitados(pruebas.id('N1'))));
select pruebas.ok('2.2 los juegos de inicial no incluyen Rompe y une',
  not exists (select 1 from public.grados_habilitados(pruebas.id('N1')) where juego = 'rompe'));
select pruebas.ok('2.3 guarda una práctica en grado 1 con 50 %',
  (public.guardar_partida(pruebas.id('N1'), 'detective', 1, 'practica', 4, 8)) ->> 'grado_habilitado' = '1');
select pruebas.falla('2.4 rechaza el grado 2 sin desbloquear',
  $q$select public.guardar_partida(pruebas.id('N1'), 'detective', 2, 'practica', 8, 8)$q$, 'no está desbloqueado');
select pruebas.ok('2.5 una partida de 80 % en grado 1 habilita el grado 2',
  (public.guardar_partida(pruebas.id('N1'), 'detective', 1, 'practica', 7, 8,
     p_detalle => '[{"item":1,"correcta":true,"intentos":1}]')) ->> 'grado_habilitado' = '2');
select pruebas.ok('2.6 ahora acepta el grado 2', (public.guardar_partida(pruebas.id('N1'), 'detective', 2, 'practica', 5, 8)) ? 'partida');
select pruebas.ok('2.7 una misión con 100 % en grado 2 no desbloquea el 3',
  (public.guardar_partida(pruebas.id('N1'), 'detective', 2, 'practica', 1, 1, p_mision => gen_random_uuid())) ->> 'grado_habilitado' = '2');
select pruebas.falla('2.8 Nombrá rápido no se juega en casa',
  $q$select public.guardar_partida(pruebas.id('N1'), 'nombra', 1, 'practica', 20, 24, 30000, 4)$q$, 'solo para la consulta');
select pruebas.falla('2.9 un juego de otro nivel se rechaza',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rompe', 1, 'practica', 5, 8)$q$, 'nivel');
select pruebas.falla('2.10 un juego que no existe se rechaza',
  $q$select public.guardar_partida(pruebas.id('N1'), 'inventado', 1, 'practica', 5, 8)$q$, 'no existe');
select pruebas.falla('2.11 el niño no registra partidas en consulta',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'consulta', 5, 8)$q$, 'vínculo activo');
select pruebas.falla('2.12 el niño no registra partidas de otro niño',
  $q$select public.guardar_partida(pruebas.id('N2'), 'rima', 1, 'practica', 5, 8)$q$, 'cuenta del niño');
select pruebas.falla('2.13 rechaza más correctas que el total',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'practica', 9, 8)$q$, 'no es válido');
select pruebas.falla('2.14 tiempo sin errores se rechaza',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'practica', 5, 8, 1000)$q$, 'van juntos');
select pruebas.ok('2.15 el niño no lee partidas, ni las suyas', pruebas.partidas_visibles() = 0);
select pruebas.falla('2.16 el niño no inserta partidas directamente',
  $q$insert into public.entrenamiento_partida (nino_id, juego, nivel, grado, origen, correctas, total)
     values (pruebas.id('N1'), 'rima', 'inicial', 3, 'practica', 8, 8)$q$, 'permission denied');
select pruebas.falla('2.17 el niño no ve el entrenamiento de otro niño',
  $q$select * from public.grados_habilitados(pruebas.id('N2'))$q$, 'No tenés acceso');
select pruebas.sesion('postgres');
select pruebas.ok('2.18 la práctica no tiene autor y actualiza ultimo_entrenamiento',
  (select bool_and(profesional_id is null) from public.entrenamiento_partida where origen = 'practica')
  and (select ultimo_entrenamiento is not null from public.ninos where profile_id = pruebas.id('N1')));


-- =====================================================================
-- 3. Consulta (cuenta del profesional)
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('3.1 A juega Nombrá rápido en consulta con tiempo y errores',
  (public.guardar_partida(pruebas.id('N1'), 'nombra', 1, 'consulta', 20, 24, 41000, 4)) ? 'partida');
select pruebas.ok('3.2 A elige el grado 3 sin desbloquear',
  (public.guardar_partida(pruebas.id('N1'), 'rima', 3, 'consulta', 4, 8)) ? 'partida');
select pruebas.ok('3.3 una consulta de 90 % en grado 2 habilita el 3 en casa',
  (public.guardar_partida(pruebas.id('N1'), 'palmas', 2, 'consulta', 9, 10)) ->> 'grado_habilitado' = '3');
select pruebas.falla('3.4 el profesional no registra práctica en casa',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'practica', 5, 8)$q$, 'cuenta del niño');
select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.ok('3.5 B también juega en consulta', (public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'consulta', 6, 8)) ? 'partida');
select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.falla('3.6 E, sin vínculo, no registra partidas',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'consulta', 6, 8)$q$, 'vínculo activo');
select pruebas.falla('3.7 E no ve los grados de N1',
  $q$select * from public.grados_habilitados(pruebas.id('N1'))$q$, 'No tenés acceso');
select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.ok('3.8 el niño ve palmas en grado 3 habilitado', pruebas.habilitado(pruebas.id('N1'), 'palmas') = 3);
select pruebas.sesion('postgres');


-- =====================================================================
-- 4. Visibilidad para los profesionales
-- =====================================================================
-- Hasta acá N1 tiene 4 prácticas, 3 consultas de A y 1 de B.
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.ok('4.1 A (comparte) ve las 4 prácticas, sus 3 consultas y la de B', pruebas.partidas_visibles() = 8);
select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.ok('4.2 B (no comparte) ve las prácticas y su consulta, no las de A', pruebas.partidas_visibles() = 5);
select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.ok('4.3 E no ve ninguna', pruebas.partidas_visibles() = 0);
select pruebas.sesion('anon');
select pruebas.falla('4.4 anon no lee partidas', $q$select count(*) from public.entrenamiento_partida$q$, 'permission denied');
select pruebas.sesion('postgres');


-- =====================================================================
-- 5. Tareas
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('A'));
select pruebas.guardar_id('T1', public.crear_tarea(pruebas.id('N1'), '[{"juego":"memotono","grado":2},{"juego":"tocalo","grado":1}]'));
select pruebas.ok('5.1 A crea una tarea de dos juegos', pruebas.id('T1') is not null);
select pruebas.falla('5.2 una misión necesita 3 juegos distintos',
  $q$select public.crear_tarea(pruebas.id('N1'), '[{"juego":"rima","grado":1},{"juego":"rima","grado":2},{"juego":"palmas","grado":1}]', 'Misión', true)$q$, '3 juegos distintos');
select pruebas.falla('5.3 no se asigna un juego de solo consulta',
  $q$select public.crear_tarea(pruebas.id('N1'), '[{"juego":"nombra","grado":1}]')$q$, 'no se puede asignar');
select pruebas.falla('5.4 no se asigna un juego de otro nivel',
  $q$select public.crear_tarea(pruebas.id('N1'), '[{"juego":"lee","grado":1}]')$q$, 'no se puede asignar');
select pruebas.guardar_id('T2', public.crear_tarea(pruebas.id('N1'), '[{"juego":"rima","grado":2},{"juego":"palmas","grado":1},{"juego":"lluvia","grado":3}]', 'Misión del mar', true));
select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.falla('5.5 E no asigna tareas',
  $q$select public.crear_tarea(pruebas.id('N1'), '[{"juego":"rima","grado":1}]')$q$, 'vínculo activo');
select pruebas.sesion('authenticated', pruebas.id('B'));
select pruebas.ok('5.6 B (no comparte) no ve las tareas de A', (select count(*) from public.entrenamiento_tarea) = 0);
select pruebas.falla('5.7 B no cancela una tarea de A', $q$select public.cancelar_tarea(pruebas.id('T1'))$q$, 'No se puede cancelar');

select pruebas.sesion('authenticated', pruebas.id('N1'));
select pruebas.ok('5.8 el niño ve sus 2 tareas y sus 5 juegos',
  (select count(*) from public.entrenamiento_tarea) = 2 and (select count(*) from public.entrenamiento_tarea_item) = 5);
select pruebas.ok('5.9 juega memotono grado 2 de la tarea (grado no desbloqueado en casa)',
  (public.guardar_partida(pruebas.id('N1'), 'memotono', 2, 'tarea', 3, 6, p_tarea => pruebas.id('T1'))) ? 'partida');
select pruebas.ok('5.10 la tarea sigue pendiente', (select estado from public.entrenamiento_tarea where id = pruebas.id('T1')) = 'pendiente');
select pruebas.falla('5.11 un juego que no es de la tarea se rechaza',
  $q$select public.guardar_partida(pruebas.id('N1'), 'rima', 1, 'tarea', 3, 6, p_tarea => pruebas.id('T1'))$q$, 'no es parte de la tarea');
select public.guardar_partida(pruebas.id('N1'), 'tocalo', 1, 'tarea', 10, 12, p_tarea => pruebas.id('T1'));
-- (la verificación va en otra sentencia: la misma sentencia no ve lo que cambió la función)
select pruebas.ok('5.12 con el último juego la tarea queda hecha',
  (select estado from public.entrenamiento_tarea where id = pruebas.id('T1')) = 'hecha');
select pruebas.falla('5.13 una tarea hecha no recibe más partidas',
  $q$select public.guardar_partida(pruebas.id('N1'), 'tocalo', 1, 'tarea', 10, 12, p_tarea => pruebas.id('T1'))$q$, 'ya está hecha');
select pruebas.sesion('postgres');
select pruebas.ok('5.14 las partidas de la tarea tienen a A como autor',
  (select bool_and(profesional_id = pruebas.id('A')) from public.entrenamiento_partida where tarea_id = pruebas.id('T1')));
select pruebas.sesion('authenticated', pruebas.id('A'));
select public.cancelar_tarea(pruebas.id('T2'));
select pruebas.ok('5.15 A cancela la misión pendiente',
  not exists (select 1 from public.entrenamiento_tarea where id = pruebas.id('T2')));
select pruebas.sesion('postgres');


-- =====================================================================
-- 6. Letra del entrenamiento
-- =====================================================================
select pruebas.sesion('authenticated', pruebas.id('N1'));
select public.cambiar_letra_entrenamiento(pruebas.id('N1'), 'minuscula');
select pruebas.ok('6.1 el niño cambia su letra',
  (select letra_entrenamiento from public.ninos where profile_id = pruebas.id('N1')) = 'minuscula');
select pruebas.falla('6.2 un valor inválido se rechaza',
  $q$select public.cambiar_letra_entrenamiento(pruebas.id('N1'), 'cursiva')$q$, 'mayúscula o minúscula');
select pruebas.sesion('authenticated', pruebas.id('A'));
select public.cambiar_letra_entrenamiento(pruebas.id('N1'), 'mayuscula');
select pruebas.ok('6.3 el profesional vinculado la cambia en consulta',
  (select letra_entrenamiento from public.ninos where profile_id = pruebas.id('N1')) = 'mayuscula');
select pruebas.sesion('authenticated', pruebas.id('E'));
select pruebas.falla('6.4 E no la cambia',
  $q$select public.cambiar_letra_entrenamiento(pruebas.id('N1'), 'minuscula')$q$, 'No podés');
select pruebas.sesion('postgres');


-- =====================================================================
-- 7. Borrado en cascada
-- =====================================================================
delete from auth.users where id = pruebas.id('N1');
select pruebas.ok('7.1 al borrar la cuenta de N1 se borran sus partidas y tareas',
  not exists (select 1 from public.entrenamiento_partida where nino_id = pruebas.id('N1'))
  and not exists (select 1 from public.entrenamiento_tarea where nino_id = pruebas.id('N1')));


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
