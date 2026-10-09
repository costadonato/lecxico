-- =====================================================================
-- Lecxico · Slice 2 — Registro por rol y autenticación
-- =====================================================================
--
-- Requiere la 0001 aplicada.
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos (CREATE OR
-- REPLACE, DROP ... IF EXISTS, REVOKE/GRANT y FK recreada).
--
-- Cambios:
--   1. nombre_usuario_disponible(): chequeo previo al alta (anon y authenticated).
--   2. handle_new_user: el tutor_email del niño es el email de la cuenta.
--   3. Trigger que mantiene ninos.tutor_email = auth.users.email.
--   4. profiles: fecha_aceptacion_tyc la fija el servidor; acepta_tyc no vuelve a false.
--   5. UPDATE por columnas en profiles y ninos.
--   6. entrenamientos.user_id → auth.users ON DELETE CASCADE.
-- =====================================================================

begin;


-- ---------------------------------------------------------------------
-- 1. nombre_usuario_disponible
-- ---------------------------------------------------------------------
-- La usa el formulario de registro (todavía sin sesión) para avisar antes
-- de llamar a signUp, porque Supabase Auth reemplaza cualquier error del
-- trigger de alta por "Database error saving new user".
-- Normaliza igual que handle_new_user (btrim + lower) y devuelve solo un
-- booleano: false si el formato es inválido o si ya existe.
create or replace function public.nombre_usuario_disponible(p_nombre text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    v.nombre ~ '^[a-z0-9._]{3,30}$'
      and not exists (select 1 from public.profiles p where p.nombre_usuario = v.nombre),
    false
  )
  from (select lower(btrim(p_nombre)) as nombre) v;
$$;

revoke all     on function public.nombre_usuario_disponible(text) from public;
grant  execute on function public.nombre_usuario_disponible(text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. handle_new_user (reemplaza la versión de la 0001)
-- ---------------------------------------------------------------------
-- Contrato de raw_user_meta_data (lo envía app/register):
--   rol, nombre, apellido, nombre_usuario, acepta_tyc
--   + si rol = 'nino': fecha_nacimiento, etapa_escolar, tutor_telefono (opcional)
-- La cuenta del niño la usa el tutor con SU email: ninos.tutor_email se
-- toma de NEW.email, no de la metadata.
-- Sin rol se asume 'profesional' (alta por Google, que solo usan profesionales).
-- Para profesionales, ningún dato opcional faltante hace fallar el alta.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_rol      text  := coalesce(nullif(btrim(v_meta ->> 'rol'), ''), 'profesional');
  v_nombre   text;
  v_apellido text;
  v_usuario  text  := nullif(lower(btrim(v_meta ->> 'nombre_usuario')), '');
  v_acepta   boolean := coalesce(lower(v_meta ->> 'acepta_tyc') = 'true', false);
  v_fecha    date;
  v_etapa    text;
begin
  if v_rol not in ('profesional', 'nino') then
    raise exception 'Rol inválido en el alta: %.', v_rol;
  end if;

  -- nombre / apellido: formulario → formulario viejo → Google → ''.
  v_nombre := coalesce(
    nullif(btrim(v_meta ->> 'nombre'), ''),
    nullif(btrim(v_meta ->> 'first_name'), ''),
    nullif(btrim(v_meta ->> 'given_name'), ''),
    ''
  );
  v_apellido := coalesce(
    nullif(btrim(v_meta ->> 'apellido'), ''),
    nullif(btrim(v_meta ->> 'last_name'), ''),
    nullif(btrim(v_meta ->> 'family_name'), ''),
    ''
  );

  -- nombre_usuario: un formato inválido no frena el alta de un profesional
  -- (queda null y se completa en /completar-perfil); para un niño es obligatorio.
  if v_usuario is not null and v_usuario !~ '^[a-z0-9._]{3,30}$' then
    if v_rol = 'nino' then
      raise exception 'El nombre de usuario debe tener entre 3 y 30 caracteres: letras minúsculas, números, punto o guion bajo.';
    end if;
    v_usuario := null;
  end if;

  if v_usuario is not null and exists (select 1 from public.profiles where nombre_usuario = v_usuario) then
    raise exception 'El nombre de usuario "%" ya está en uso.', v_usuario;
  end if;

  if v_rol = 'nino' then
    if v_usuario is null then
      raise exception 'Falta el nombre de usuario del niño.';
    end if;

    begin
      v_fecha := nullif(btrim(v_meta ->> 'fecha_nacimiento'), '')::date;
    exception when others then
      raise exception 'La fecha de nacimiento del niño es inválida.';
    end;
    if v_fecha is null then
      raise exception 'Falta la fecha de nacimiento del niño.';
    end if;

    v_etapa := nullif(btrim(v_meta ->> 'etapa_escolar'), '');
    if v_etapa is null or v_etapa not in ('sala_4', 'sala_5', 'primero', 'segundo', 'tercero') then
      raise exception 'La etapa escolar del niño es inválida o falta.';
    end if;

    if not v_acepta then
      raise exception 'El tutor debe aceptar los Términos y Condiciones para crear la cuenta del niño.';
    end if;

    if nullif(btrim(new.email), '') is null then
      raise exception 'La cuenta del niño necesita el email del tutor.';
    end if;
  end if;

  insert into public.profiles (id, rol, nombre, apellido, nombre_usuario, acepta_tyc, fecha_aceptacion_tyc)
  values (
    new.id, v_rol, v_nombre, v_apellido, v_usuario, v_acepta,
    case when v_acepta then now() end
  );

  if v_rol = 'nino' then
    insert into public.ninos (profile_id, fecha_nacimiento, etapa_escolar, tutor_email, tutor_telefono)
    values (new.id, v_fecha, v_etapa, new.email, nullif(btrim(v_meta ->> 'tutor_telefono'), ''));
  end if;

  return new;
end;
$$;

-- El trigger on_auth_user_created de la 0001 sigue apuntando a esta función.


-- ---------------------------------------------------------------------
-- 3. Sincronizar ninos.tutor_email con auth.users.email
-- ---------------------------------------------------------------------
-- Supabase solo cambia auth.users.email cuando el cambio de email quedó
-- confirmado, así que tutor_email siempre refleja el email vigente.
-- El WHEN evita que corra en los UPDATE de Auth que no tocan el email.
create or replace function public.sincronizar_tutor_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is not null then
    update public.ninos
    set tutor_email = new.email
    where profile_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.sincronizar_tutor_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sincronizar_tutor_email();


-- ---------------------------------------------------------------------
-- 4. Trigger BEFORE UPDATE en profiles (reemplaza la versión de la 0001)
-- ---------------------------------------------------------------------
create or replace function public.proteger_campos_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'No se puede modificar el id de un perfil.';
  end if;

  if new.rol is distinct from old.rol then
    raise exception 'No se puede modificar el rol de un perfil.';
  end if;

  -- Mantiene la convención de minúsculas también en las ediciones.
  new.nombre_usuario := lower(new.nombre_usuario);

  -- Una vez elegido, el nombre de usuario no puede volver a quedar vacío.
  if old.nombre_usuario is not null and new.nombre_usuario is null then
    raise exception 'El nombre de usuario no puede quedar vacío.';
  end if;

  -- Términos y Condiciones: la aceptación no se revoca desde la app y la
  -- fecha la fija el servidor, nunca el cliente.
  if old.acepta_tyc and not new.acepta_tyc then
    raise exception 'La aceptación de los Términos y Condiciones no se puede revertir.';
  end if;

  if new.acepta_tyc and not old.acepta_tyc then
    new.fecha_aceptacion_tyc := now();
  else
    new.fecha_aceptacion_tyc := old.fecha_aceptacion_tyc;
  end if;

  return new;
end;
$$;

-- El trigger profiles_proteger_campos de la 0001 sigue apuntando a esta función.
revoke all on function public.proteger_campos_profile() from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. UPDATE por columnas
-- ---------------------------------------------------------------------
-- La 0001 dio UPDATE sobre toda la tabla. Se reemplaza por UPDATE solo
-- sobre las columnas que el usuario edita. El resto lo escriben procesos
-- del sistema (funciones/trigger SECURITY DEFINER):
--   profiles.rol / id            → inmutables
--   profiles.fecha_aceptacion_tyc → trigger proteger_campos_profile
--   ninos.tutor_email            → trigger sincronizar_tutor_email
--   ninos.ultima_prueba          → guardar_test
--   ninos.ultimo_entrenamiento   → se resuelve en el slice 6
-- REVOKE a nivel tabla también quita los permisos por columna previos, así
-- que el bloque es repetible. Las políticas RLS de UPDATE (fila propia)
-- no cambian.
revoke update on table public.profiles from authenticated;
revoke update on table public.ninos    from authenticated;

grant update (nombre, apellido, nombre_usuario, acepta_tyc)
  on table public.profiles to authenticated;

grant update (fecha_nacimiento, etapa_escolar, tutor_telefono, ultima_conexion)
  on table public.ninos to authenticated;


-- ---------------------------------------------------------------------
-- 6. entrenamientos.user_id → auth.users ON DELETE CASCADE
-- ---------------------------------------------------------------------
-- Sin CASCADE, borrar la cuenta de un niño con entrenamientos fallaría.
-- El nombre de la FK original no está versionado: se borran todas las FK
-- de entrenamientos hacia auth.users y se crea una con nombre conocido.
do $$
declare
  v_fk record;
begin
  for v_fk in
    select conname
    from pg_constraint
    where conrelid  = 'public.entrenamientos'::regclass
      and confrelid = 'auth.users'::regclass
      and contype   = 'f'
  loop
    execute format('alter table public.entrenamientos drop constraint %I', v_fk.conname);
  end loop;
end $$;

alter table public.entrenamientos
  add constraint entrenamientos_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

commit;
