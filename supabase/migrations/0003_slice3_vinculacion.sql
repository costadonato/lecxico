-- =====================================================================
-- Lecxico · Slice 3 — Vinculación profesional–niño e invitaciones
-- =====================================================================
--
-- Requiere la 0001 y la 0002 aplicadas.
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos (CREATE OR
-- REPLACE, DROP ... IF EXISTS, REVOKE/GRANT).
--
-- profesional_nino sigue sin políticas INSERT/UPDATE/DELETE: toda
-- escritura pasa por estas funciones SECURITY DEFINER.
--
-- Ciclo de vida de un vínculo:
--   invitar_nino            → 'pendiente' (fila nueva, o reutiliza una 'inactiva')
--   responder_invitacion    → 'activa' (acepta) | fila borrada (rechaza)
--   cancelar_invitacion     → fila borrada (el profesional se arrepiente)
--   desvincular             → 'inactiva' (baja lógica, la pide cualquiera de los dos)
--
-- Cambios:
--   1. invitar_nino(nombre_usuario)
--   2. responder_invitacion(vinculo, aceptar)
--   3. cancelar_invitacion(vinculo)
--   4. desvincular(vinculo)
--   5. vinculos_del_profesional()
--   6. Borrado de test_resultados y test_resultados_primaria (legacy).
-- =====================================================================

begin;


-- ---------------------------------------------------------------------
-- 1. invitar_nino
-- ---------------------------------------------------------------------
-- Solo el profesional invita, y solo por coincidencia EXACTA del nombre
-- de usuario del niño (no hay forma de listar ni explorar usuarios).
-- Devuelve el id del vínculo.
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

  if v_perfil.nombre_usuario is null or not v_perfil.acepta_tyc then
    raise exception 'Completá tu perfil (nombre de usuario y aceptación de los Términos y Condiciones) antes de invitar a un niño.';
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
    set estado           = 'pendiente',
        fecha_invitacion = now(),
        fecha_afiliacion = null,
        fecha_baja       = null
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


-- ---------------------------------------------------------------------
-- 2. responder_invitacion
-- ---------------------------------------------------------------------
-- La responde el niño (la cuenta la maneja el tutor).
-- Aceptar: 'activa' + fecha_afiliacion. Rechazar: se borra la fila, sin registro.
create or replace function public.responder_invitacion(p_vinculo_id uuid, p_aceptar boolean)
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

  if p_aceptar is null then
    raise exception 'Indicá si aceptás o rechazás la invitación.';
  end if;

  select * into v_vinculo
  from public.profesional_nino
  where id = p_vinculo_id
  for update;

  -- Mismo mensaje si no existe o si es de otro niño.
  if not found or v_vinculo.nino_id <> v_uid then
    raise exception 'No se encontró la invitación.';
  end if;

  if v_vinculo.estado <> 'pendiente' then
    raise exception 'Esta invitación ya no está pendiente.';
  end if;

  if p_aceptar then
    update public.profesional_nino
    set estado = 'activa', fecha_afiliacion = now()
    where id = p_vinculo_id;
  else
    delete from public.profesional_nino where id = p_vinculo_id;
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. cancelar_invitacion
-- ---------------------------------------------------------------------
-- El profesional retira una invitación que todavía no fue respondida.
create or replace function public.cancelar_invitacion(p_vinculo_id uuid)
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
    raise exception 'No se encontró la invitación.';
  end if;

  if v_vinculo.estado <> 'pendiente' then
    raise exception 'Esta invitación ya no está pendiente.';
  end if;

  delete from public.profesional_nino where id = p_vinculo_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 4. desvincular
-- ---------------------------------------------------------------------
-- Baja lógica de un vínculo activo; la puede pedir el profesional o el niño.
-- Desde ese momento es_profesional_vinculado() da false y el profesional
-- deja de ver los datos del niño.
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

  if not found or v_uid not in (v_vinculo.profesional_id, v_vinculo.nino_id) then
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


-- ---------------------------------------------------------------------
-- 5. vinculos_del_profesional
-- ---------------------------------------------------------------------
-- Todos los vínculos del profesional actual, en cualquier estado.
-- Hace falta como RPC porque la RLS no deja al profesional leer el perfil
-- de un niño sin vínculo activo. Por eso mismo, nombre, apellido y
-- etapa_escolar solo se devuelven con estado 'activa'; nombre_usuario va
-- siempre (es el dato que el profesional escribió para invitar, y lo usan
-- la campanita y el botón "Reafiliar").
create or replace function public.vinculos_del_profesional()
returns table (
  vinculo_id       uuid,
  estado           text,
  nino_id          uuid,
  nombre_usuario   text,
  nombre           text,
  apellido         text,
  etapa_escolar    text,
  fecha_invitacion timestamptz,
  fecha_afiliacion timestamptz,
  fecha_baja       timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pn.id,
    pn.estado,
    pn.nino_id,
    p.nombre_usuario,
    case when pn.estado = 'activa' then p.nombre        end,
    case when pn.estado = 'activa' then p.apellido      end,
    case when pn.estado = 'activa' then n.etapa_escolar end,
    pn.fecha_invitacion,
    pn.fecha_afiliacion,
    pn.fecha_baja
  from public.profesional_nino pn
  join public.profiles p    on p.id = pn.nino_id
  left join public.ninos n  on n.profile_id = pn.nino_id
  where pn.profesional_id = auth.uid()
  order by pn.fecha_invitacion desc;
$$;


-- ---------------------------------------------------------------------
-- Permisos de las funciones nuevas
-- ---------------------------------------------------------------------
-- Supabase otorga EXECUTE a anon/authenticated por defecto: se restringe.
revoke all on function public.invitar_nino(text)                   from public, anon;
revoke all on function public.responder_invitacion(uuid, boolean)  from public, anon;
revoke all on function public.cancelar_invitacion(uuid)            from public, anon;
revoke all on function public.desvincular(uuid)                    from public, anon;
revoke all on function public.vinculos_del_profesional()           from public, anon;
grant execute on function public.invitar_nino(text)                   to authenticated;
grant execute on function public.responder_invitacion(uuid, boolean)  to authenticated;
grant execute on function public.cancelar_invitacion(uuid)            to authenticated;
grant execute on function public.desvincular(uuid)                    to authenticated;
grant execute on function public.vinculos_del_profesional()           to authenticated;


-- ---------------------------------------------------------------------
-- 6. Limpieza: tablas legacy del test
-- ---------------------------------------------------------------------
-- Reemplazadas por test / test_bloque_resultado en la 0001. Están vacías,
-- cerradas por RLS y ningún archivo de app/, components/ ni lib/ las usa.
-- Sin CASCADE: si algo dependiera de ellas, la migración falla en vez de
-- borrarlo en silencio.
drop table if exists public.test_resultados;
drop table if exists public.test_resultados_primaria;

commit;
