-- =====================================================================
-- Lecxico · S8 — Contraseña y acciones del tutor
-- =====================================================================
--
-- Requiere la 0001 a la 0004 aplicadas. Se aplica ANTES que la 0006 (S9
-- y S10): la 0006 parte de la test_select definida acá.
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos (ADD COLUMN IF
-- NOT EXISTS, DROP ... IF EXISTS, CREATE OR REPLACE, REVOKE/GRANT y un
-- UPDATE que solo toca filas sin completar).
--
-- Por qué: las acciones del tutor (aceptar o rechazar invitaciones,
-- desvincular, cambiar la etapa escolar, eliminar la cuenta) tienen que
-- exigir la contraseña de la cuenta. Pedirla solo en la interfaz no
-- alcanza: con la sesión del niño abierta se podía llamar a
-- responder_invitacion y desvincular, o hacer un UPDATE de
-- ninos.etapa_escolar. Ahora esas escrituras pasan por funciones que solo
-- puede ejecutar service_role, y service_role solo lo usa el servidor de
-- Next.js después de verificar la contraseña (lib/tutor/acciones.ts).
--
-- Cambios:
--   1.  profesional_nino.comparte_historial (+ backfill y check).
--   2.  profiles.acepta_compromiso y fecha_aceptacion_compromiso.
--   3.  handle_new_user: guarda el compromiso del profesional.
--   4.  proteger_campos_profile: el compromiso no se revierte, la fecha la
--       fija la base y un niño no lo puede aceptar.
--   5.  Permisos por columna: + profiles.acepta_compromiso,
--       − ninos.etapa_escolar.
--   6.  profesional_puede_ver_registro(): qué registros de un niño ve el
--       profesional según su vínculo y lo que eligió el tutor.
--   7.  Políticas test_select y test_bloque_resultado_select.
--   8.  ninos_para_test(): la última evaluación, solo entre las visibles.
--   9.  invitar_nino: exige el compromiso y reinicia comparte_historial.
--   10. desvincular: queda solo para el profesional.
--   11. responder_invitacion: se elimina.
--   12. Funciones del tutor (solo service_role): tutor_responder_invitacion,
--       tutor_desvincular, tutor_cambiar_etapa.
--
-- La eliminación de la cuenta del niño no necesita cambios: borrar la fila
-- de auth.users borra en cascada profiles → ninos, profesional_nino, test
-- → test_bloque_resultado, y entrenamientos (FK a auth.users, 0002).
-- Toda tabla nueva con datos del niño (S12, S17) tiene que borrarse en
-- cascada de la misma forma.
-- =====================================================================

begin;


-- ---------------------------------------------------------------------
-- 1. profesional_nino.comparte_historial
-- ---------------------------------------------------------------------
-- Lo elige el tutor al aceptar la invitación:
--   true  → el profesional ve también lo que registraron los demás
--           profesionales del niño (antes y después de vincularse).
--   false → ve solo lo que registró él.
-- Es null mientras el vínculo está 'pendiente', obligatorio en 'activa' y
-- se conserva al pasar a 'inactiva'. Ninguna función lo cambia con el
-- vínculo activo: para cambiarlo hay que dar de baja el vínculo y recibir
-- una invitación nueva (invitar_nino lo vuelve a null).
alter table public.profesional_nino
  add column if not exists comparte_historial boolean;

comment on column public.profesional_nino.comparte_historial is
  'Elección del tutor al aceptar: true = el profesional ve lo registrado por los demás profesionales. Null mientras está pendiente.';

-- Los vínculos activos que ya existen quedan sin compartir (la opción más
-- restrictiva). Va antes del check para que el check no falle.
update public.profesional_nino
set comparte_historial = false
where estado = 'activa'
  and comparte_historial is null;

alter table public.profesional_nino
  drop constraint if exists profesional_nino_comparte_historial_check;
alter table public.profesional_nino
  add constraint profesional_nino_comparte_historial_check
  check (estado <> 'activa' or comparte_historial is not null);


-- ---------------------------------------------------------------------
-- 2. profiles: compromiso de uso responsable de los datos
-- ---------------------------------------------------------------------
-- Lo acepta el profesional al registrarse (o en /completar-perfil si entró
-- con Google o ya tenía cuenta). El texto está en lib/compromiso.ts.
alter table public.profiles
  add column if not exists acepta_compromiso boolean not null default false;
alter table public.profiles
  add column if not exists fecha_aceptacion_compromiso timestamptz;

comment on column public.profiles.acepta_compromiso is
  'Solo profesionales. Compromiso de uso responsable de los datos (lib/compromiso.ts). No se revierte.';
comment on column public.profiles.fecha_aceptacion_compromiso is
  'La fija la base (handle_new_user o proteger_campos_profile), nunca el cliente.';


-- ---------------------------------------------------------------------
-- 3. handle_new_user (reemplaza la versión de la 0002)
-- ---------------------------------------------------------------------
-- Igual que la 0002, más el compromiso del profesional.
-- Contrato de raw_user_meta_data (lo envía app/register):
--   rol, nombre, apellido, nombre_usuario, acepta_tyc
--   + si rol = 'profesional': acepta_compromiso (falta en el alta por
--     Google: queda en false y se completa en /completar-perfil)
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
  v_meta       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_rol        text  := coalesce(nullif(btrim(v_meta ->> 'rol'), ''), 'profesional');
  v_nombre     text;
  v_apellido   text;
  v_usuario    text  := nullif(lower(btrim(v_meta ->> 'nombre_usuario')), '');
  v_acepta     boolean := coalesce(lower(v_meta ->> 'acepta_tyc') = 'true', false);
  v_compromiso boolean := false;
  v_fecha      date;
  v_etapa      text;
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

  -- Compromiso de uso responsable: solo lo acepta un profesional. Si falta
  -- (alta con Google) no falla: queda en false.
  if v_rol = 'profesional' then
    v_compromiso := coalesce(lower(v_meta ->> 'acepta_compromiso') = 'true', false);
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

  insert into public.profiles (
    id, rol, nombre, apellido, nombre_usuario,
    acepta_tyc, fecha_aceptacion_tyc,
    acepta_compromiso, fecha_aceptacion_compromiso
  )
  values (
    new.id, v_rol, v_nombre, v_apellido, v_usuario,
    v_acepta, case when v_acepta then now() end,
    v_compromiso, case when v_compromiso then now() end
  );

  if v_rol = 'nino' then
    insert into public.ninos (profile_id, fecha_nacimiento, etapa_escolar, tutor_email, tutor_telefono)
    values (new.id, v_fecha, v_etapa, new.email, nullif(btrim(v_meta ->> 'tutor_telefono'), ''));
  end if;

  return new;
end;
$$;

-- El trigger on_auth_user_created de la 0001 sigue apuntando a esta función.
revoke all on function public.handle_new_user() from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. proteger_campos_profile (reemplaza la versión de la 0002)
-- ---------------------------------------------------------------------
-- Igual que la 0002, más las reglas del compromiso de uso responsable.
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

  -- Compromiso de uso responsable: solo de profesionales, no se revierte y
  -- la fecha la fija la base.
  if new.acepta_compromiso and new.rol <> 'profesional' then
    raise exception 'Solo un profesional puede aceptar el compromiso de uso responsable de los datos.';
  end if;

  if old.acepta_compromiso and not new.acepta_compromiso then
    raise exception 'La aceptación del compromiso de uso responsable no se puede revertir.';
  end if;

  if new.acepta_compromiso and not old.acepta_compromiso then
    new.fecha_aceptacion_compromiso := now();
  else
    new.fecha_aceptacion_compromiso := old.fecha_aceptacion_compromiso;
  end if;

  return new;
end;
$$;

-- El trigger profiles_proteger_campos de la 0001 sigue apuntando a esta función.
revoke all on function public.proteger_campos_profile() from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. Permisos por columna
-- ---------------------------------------------------------------------
-- /completar-perfil guarda la aceptación del compromiso (la fecha la pone
-- el trigger: no hay permiso sobre fecha_aceptacion_compromiso).
grant update (acepta_compromiso) on table public.profiles to authenticated;

-- La etapa escolar la cambia el tutor con su contraseña, por
-- tutor_cambiar_etapa. El niño sigue editando fecha_nacimiento,
-- tutor_telefono y ultima_conexion.
revoke update (etapa_escolar) on table public.ninos from authenticated;


-- ---------------------------------------------------------------------
-- 6. profesional_puede_ver_registro
-- ---------------------------------------------------------------------
-- ¿El usuario actual (profesional) puede ver un registro del niño p_nino
-- cuyo autor es el profesional p_autor? Sí, si tiene vínculo ACTIVO con el
-- niño y además:
--   * el registro es suyo (p_autor = auth.uid()), incluidas las
--     evaluaciones que tomó en un vínculo anterior, o
--   * el tutor eligió compartir el historial en ese vínculo.
-- Un registro con autor null (de un profesional que borró su cuenta)
-- cuenta como "de los demás": solo se ve si se comparte el historial.
--
-- La usan test_select y test_bloque_resultado_select. S12 la va a usar
-- para las tareas: las tareas de otros profesionales solo se ven si el
-- tutor compartió el historial (tabla 5 de la propuesta). La práctica en
-- casa no tiene autor profesional y la ven todos los profesionales con
-- vínculo activo: para eso se usa es_profesional_vinculado(), no esta.
--
-- SECURITY DEFINER: lee profesional_nino sin pasar por su RLS, así las
-- políticas la pueden usar sin recursión (igual que es_profesional_vinculado).
create or replace function public.profesional_puede_ver_registro(p_nino uuid, p_autor uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profesional_nino pn
    where pn.profesional_id = auth.uid()
      and pn.nino_id        = p_nino
      and pn.estado         = 'activa'
      and (
        (p_autor is not null and p_autor = auth.uid())
        or pn.comparte_historial
      )
  );
$$;

revoke all     on function public.profesional_puede_ver_registro(uuid, uuid) from public, anon;
grant  execute on function public.profesional_puede_ver_registro(uuid, uuid) to authenticated;


-- ---------------------------------------------------------------------
-- 7. Políticas de lectura de test y test_bloque_resultado
-- ---------------------------------------------------------------------
-- La cláusula del niño (nino_id = auth.uid()) se mantiene: la saca S10 en
-- la 0006, que tiene que partir de esta versión y conservar
-- profesional_puede_ver_registro.
drop policy if exists test_select on public.test;
create policy test_select on public.test
  for select to authenticated
  using (
    nino_id = (select auth.uid())
    or public.profesional_puede_ver_registro(nino_id, profesional_id)
  );

drop policy if exists test_bloque_resultado_select on public.test_bloque_resultado;
create policy test_bloque_resultado_select on public.test_bloque_resultado
  for select to authenticated
  using (
    exists (
      select 1
      from public.test t
      where t.id = test_bloque_resultado.test_id
        and (
          t.nino_id = (select auth.uid())
          or public.profesional_puede_ver_registro(t.nino_id, t.profesional_id)
        )
    )
  );


-- ---------------------------------------------------------------------
-- 8. ninos_para_test (reemplaza la versión de la 0004)
-- ---------------------------------------------------------------------
-- Igual que la 0004, pero la última evaluación (fecha y porcentaje) sale
-- solo de las que el profesional puede ver: las suyas, o las de cualquiera
-- si el tutor compartió el historial. Misma regla que
-- profesional_puede_ver_registro, escrita sobre el vínculo ya filtrado.
create or replace function public.ninos_para_test()
returns table (
  nino_id                uuid,
  nombre                 text,
  apellido               text,
  nombre_usuario         text,
  etapa_escolar          text,
  nivel                  text,
  fecha_ultimo_test      timestamptz,
  porcentaje_ultimo_test int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.nombre,
    p.apellido,
    p.nombre_usuario,
    n.etapa_escolar,
    public.nivel_para_etapa(n.etapa_escolar),
    ultimo.fecha,
    ultimo.porcentaje_total
  from public.profesional_nino pn
  join public.profiles yo on yo.id = pn.profesional_id and yo.rol = 'profesional'
  join public.profiles p  on p.id = pn.nino_id
  join public.ninos n     on n.profile_id = pn.nino_id
  left join lateral (
    select t.fecha, t.porcentaje_total
    from public.test t
    where t.nino_id = pn.nino_id
      and (t.profesional_id = pn.profesional_id or pn.comparte_historial)
    order by t.fecha desc, t.created_at desc
    limit 1
  ) ultimo on true
  where pn.profesional_id = auth.uid()
    and pn.estado = 'activa'
  order by p.apellido collate "und-x-icu", p.nombre collate "und-x-icu";
$$;

revoke all     on function public.ninos_para_test() from public, anon;
grant  execute on function public.ninos_para_test() to authenticated;


-- ---------------------------------------------------------------------
-- 9. invitar_nino (reemplaza la versión de la 0003)
-- ---------------------------------------------------------------------
-- Igual que la 0003, más:
--   * exige el compromiso de uso responsable aceptado;
--   * al reutilizar una fila 'inactiva', comparte_historial vuelve a null:
--     el tutor elige de nuevo al aceptar.
create or replace function public.invitar_nino(p_nombre_usuario text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_perfil  public.profiles%rowtype;
  v_nino_id uuid;
  v_vinculo public.profesional_nino%rowtype;
  v_id      uuid;
begin
  if v_uid is null then
    raise exception 'No hay una sesión iniciada.';
  end if;

  select * into v_perfil from public.profiles where id = v_uid;

  if not found or v_perfil.rol <> 'profesional' then
    raise exception 'Solo un profesional puede invitar a un niño.';
  end if;

  if v_perfil.nombre_usuario is null or not v_perfil.acepta_tyc or not v_perfil.acepta_compromiso then
    raise exception 'Completá tu perfil (nombre de usuario, Términos y Condiciones y compromiso de uso responsable) antes de invitar a un niño.';
  end if;

  -- Mismo mensaje si no existe o si es de un profesional: no se revela el
  -- tipo de cuenta.
  select p.id into v_nino_id
  from public.profiles p
  where p.rol = 'nino'
    and p.nombre_usuario = lower(btrim(p_nombre_usuario));

  if v_nino_id is null then
    raise exception 'No existe una cuenta de niño con ese nombre de usuario.';
  end if;

  select * into v_vinculo
  from public.profesional_nino
  where profesional_id = v_uid and nino_id = v_nino_id
  for update;

  if found then
    if v_vinculo.estado = 'activa' then
      raise exception 'Ya estás vinculado con este niño.';
    elsif v_vinculo.estado = 'pendiente' then
      raise exception 'Ya enviaste una invitación a este niño y está pendiente.';
    end if;

    -- 'inactiva': re-vincular reutiliza la fila como una invitación nueva.
    update public.profesional_nino
    set estado             = 'pendiente',
        fecha_invitacion   = now(),
        fecha_afiliacion   = null,
        fecha_baja         = null,
        comparte_historial = null
    where id = v_vinculo.id
    returning id into v_id;
  else
    begin
      insert into public.profesional_nino (profesional_id, nino_id, estado)
      values (v_uid, v_nino_id, 'pendiente')
      returning id into v_id;
    exception when unique_violation then
      -- Dos invitaciones simultáneas al mismo niño: ganó la otra.
      raise exception 'Ya enviaste una invitación a este niño y está pendiente.';
    end;
  end if;

  -- TODO: avisar al tutor por email (ninos.tutor_email) cuando haya dominio
  -- propio y un servicio de envío. Se engancharía acá, después de crear o
  -- reactivar la invitación (por ejemplo, encolando el envío con v_id).

  return v_id;
end;
$$;

revoke all     on function public.invitar_nino(text) from public, anon;
grant  execute on function public.invitar_nino(text) to authenticated;


-- ---------------------------------------------------------------------
-- 10. desvincular (reemplaza la versión de la 0003)
-- ---------------------------------------------------------------------
-- Ahora solo la usa el profesional (sin contraseña: no es una acción del
-- tutor). La baja del lado del niño pasa por tutor_desvincular, después de
-- verificar la contraseña. Si quien llama no es el profesional del
-- vínculo, el mensaje es el mismo que si no existiera.
create or replace function public.desvincular(p_vinculo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_vinculo public.profesional_nino%rowtype;
begin
  if v_uid is null then
    raise exception 'No hay una sesión iniciada.';
  end if;

  select * into v_vinculo
  from public.profesional_nino
  where id = p_vinculo_id
  for update;

  if not found or v_vinculo.profesional_id <> v_uid then
    raise exception 'No se encontró el vínculo.';
  end if;

  if v_vinculo.estado <> 'activa' then
    raise exception 'Este vínculo no está activo.';
  end if;

  update public.profesional_nino
  set estado = 'inactiva', fecha_baja = now()
  where id = p_vinculo_id;
end;
$$;

revoke all     on function public.desvincular(uuid) from public, anon;
grant  execute on function public.desvincular(uuid) to authenticated;


-- ---------------------------------------------------------------------
-- 11. responder_invitacion: se elimina
-- ---------------------------------------------------------------------
-- La reemplaza tutor_responder_invitacion (solo service_role).
drop function if exists public.responder_invitacion(uuid, boolean);


-- ---------------------------------------------------------------------
-- 12. Funciones del tutor
-- ---------------------------------------------------------------------
-- Las llama SOLO el servidor de Next.js con la clave service_role, después
-- de verificar la contraseña de la cuenta (lib/tutor/acciones.ts). Por eso
-- no usan auth.uid(): reciben p_nino_id, que el servidor toma de la sesión
-- (nunca del formulario). Cada una valida que p_nino_id sea un perfil con
-- rol 'nino', con el mismo mensaje de "no encontrado" que si el registro
-- no existiera.

-- 12.1 Aceptar o rechazar una invitación.
--      Aceptar: 'activa' + fecha_afiliacion + comparte_historial (obligatorio).
--      Rechazar: se borra la fila, sin registro (p_comparte_historial se ignora).
create or replace function public.tutor_responder_invitacion(
  p_nino_id            uuid,
  p_vinculo_id         uuid,
  p_aceptar            boolean,
  p_comparte_historial boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vinculo public.profesional_nino%rowtype;
begin
  if p_nino_id is null
     or not exists (select 1 from public.profiles where id = p_nino_id and rol = 'nino') then
    raise exception 'No se encontró la invitación.';
  end if;

  if p_aceptar is null then
    raise exception 'Indicá si aceptás o rechazás la invitación.';
  end if;

  if p_aceptar and p_comparte_historial is null then
    raise exception 'Elegí si compartís el historial.';
  end if;

  select * into v_vinculo
  from public.profesional_nino
  where id = p_vinculo_id
  for update;

  -- Mismo mensaje si no existe o si es de otro niño.
  if not found or v_vinculo.nino_id <> p_nino_id then
    raise exception 'No se encontró la invitación.';
  end if;

  if v_vinculo.estado <> 'pendiente' then
    raise exception 'Esta invitación ya no está pendiente.';
  end if;

  if p_aceptar then
    update public.profesional_nino
    set estado             = 'activa',
        fecha_afiliacion   = now(),
        comparte_historial = p_comparte_historial
    where id = p_vinculo_id;
  else
    delete from public.profesional_nino where id = p_vinculo_id;
  end if;
end;
$$;

-- 12.2 Baja lógica de un vínculo activo del niño. comparte_historial se
--      conserva.
create or replace function public.tutor_desvincular(p_nino_id uuid, p_vinculo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vinculo public.profesional_nino%rowtype;
begin
  if p_nino_id is null
     or not exists (select 1 from public.profiles where id = p_nino_id and rol = 'nino') then
    raise exception 'No se encontró el vínculo.';
  end if;

  select * into v_vinculo
  from public.profesional_nino
  where id = p_vinculo_id
  for update;

  if not found or v_vinculo.nino_id <> p_nino_id then
    raise exception 'No se encontró el vínculo.';
  end if;

  if v_vinculo.estado <> 'activa' then
    raise exception 'Este vínculo no está activo.';
  end if;

  update public.profesional_nino
  set estado = 'inactiva', fecha_baja = now()
  where id = p_vinculo_id;
end;
$$;

-- 12.3 Cambiar la etapa escolar (y con ella, el nivel de la evaluación).
--      Mismos valores que ninos_etapa_escolar_check.
create or replace function public.tutor_cambiar_etapa(p_nino_id uuid, p_etapa text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_nino_id is null
     or not exists (select 1 from public.profiles where id = p_nino_id and rol = 'nino') then
    raise exception 'No se encontró la cuenta del niño.';
  end if;

  if p_etapa is null or p_etapa not in ('sala_4', 'sala_5', 'primero', 'segundo', 'tercero') then
    raise exception 'La etapa escolar no es válida.';
  end if;

  update public.ninos
  set etapa_escolar = p_etapa
  where profile_id = p_nino_id;

  if not found then
    raise exception 'No se encontró la cuenta del niño.';
  end if;
end;
$$;

-- Solo service_role. Supabase otorga EXECUTE a anon y authenticated por
-- defecto (y Postgres a PUBLIC): se quitan los tres.
revoke all on function public.tutor_responder_invitacion(uuid, uuid, boolean, boolean) from public, anon, authenticated;
revoke all on function public.tutor_desvincular(uuid, uuid)                            from public, anon, authenticated;
revoke all on function public.tutor_cambiar_etapa(uuid, text)                          from public, anon, authenticated;
grant execute on function public.tutor_responder_invitacion(uuid, uuid, boolean, boolean) to service_role;
grant execute on function public.tutor_desvincular(uuid, uuid)                            to service_role;
grant execute on function public.tutor_cambiar_etapa(uuid, text)                          to service_role;

commit;
