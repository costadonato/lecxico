-- =====================================================================
-- Lecxico · Datos de prueba del Slice 1 (SOLO desarrollo)
-- =====================================================================
--
-- Deja un profesional y un niño (sala_5) con un vínculo 'activa' entre
-- ambos, para probar guardar_test y las políticas RLS.
--
-- Pasos:
--   1. Correr antes supabase/migrations/0001_slice1_esquema_rls.sql.
--   2. En Supabase → Authentication → Users → "Add user" → "Create new user",
--      crear dos usuarios con email y contraseña (marcar "Auto Confirm User"):
--        - el profesional (ej. profesional@lecxico.test)
--        - el niño        (ej. nino@lecxico.test)
--      El trigger handle_new_user les crea un perfil 'profesional' vacío
--      (el panel no manda metadata). Este script lo reemplaza.
--   3. Copiar el "User UID" de cada uno y pegarlo abajo, en v_profesional
--      y v_nino (reemplazando los placeholders).
--   4. Pegar este archivo en el SQL Editor y ejecutarlo.
--   5. Probar: iniciar sesión como el profesional y abrir
--        /test/inicial?nino=<UUID del niño>
--
-- Se puede volver a correr. OJO: borra y recrea los perfiles de esos dos
-- usuarios, y con ellos (por cascada) sus vínculos y los tests del niño.
-- =====================================================================

do $$
declare
  -- >>> REEMPLAZAR por los UUID reales de Authentication → Users <<<
  v_profesional uuid := '00000000-0000-0000-0000-00000000000a';
  v_nino        uuid := '00000000-0000-0000-0000-00000000000b';
begin
  if v_profesional = '00000000-0000-0000-0000-00000000000a'
     or v_nino = '00000000-0000-0000-0000-00000000000b' then
    raise exception 'Reemplazá los UUID placeholder de v_profesional y v_nino antes de correr el seed.';
  end if;

  if not exists (select 1 from auth.users where id = v_profesional) then
    raise exception 'No existe en auth.users el profesional %.', v_profesional;
  end if;
  if not exists (select 1 from auth.users where id = v_nino) then
    raise exception 'No existe en auth.users el niño %.', v_nino;
  end if;

  -- El rol no se puede cambiar con UPDATE (trigger profiles_proteger_campos),
  -- así que se borran los perfiles creados por el trigger y se recrean.
  delete from public.profiles where id in (v_profesional, v_nino);

  insert into public.profiles (id, rol, nombre, apellido, nombre_usuario, acepta_tyc, fecha_aceptacion_tyc)
  values
    (v_profesional, 'profesional', 'Paula', 'Prueba', 'paula.prueba', true, now()),
    (v_nino,        'nino',        'Nico',  'Prueba', 'nico.prueba',  true, now());

  insert into public.ninos (profile_id, fecha_nacimiento, etapa_escolar, tutor_email, tutor_telefono)
  values (v_nino, date '2021-05-10', 'sala_5', 'tutor@lecxico.test', null);

  insert into public.profesional_nino (profesional_id, nino_id, estado, fecha_afiliacion)
  values (v_profesional, v_nino, 'activa', now());
end $$;

-- Verificación rápida
select p.id, p.rol, p.nombre, p.apellido, p.nombre_usuario, n.etapa_escolar
from public.profiles p
left join public.ninos n on n.profile_id = p.id
where p.nombre_usuario in ('paula.prueba', 'nico.prueba');

select * from public.profesional_nino
where profesional_id = (select id from public.profiles where nombre_usuario = 'paula.prueba');
