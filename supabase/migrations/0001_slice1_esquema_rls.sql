-- =====================================================================
-- Lecxico · Slice 1 — Esquema de datos, RLS y persistencia del test
-- =====================================================================
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos.
--   * profiles se recrea SOLO si todavía tiene la forma vieja (sin la
--     columna `rol`). Los datos viejos de profiles son de prueba.
--   * El resto usa IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS.
--
-- No toca auth.users (solo le cuelga el trigger de alta) ni borra
-- test_resultados / test_resultados_primaria: quedan como legacy, sin
-- uso y cerradas por RLS, hasta una limpieza posterior.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------
-- Si profiles tiene la forma vieja (nivel_academico, diagnostico_previo,
-- fecha_nacimiento, sin rol) se descarta y se recrea.
do $$
begin
  if to_regclass('public.profiles') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'profiles' and column_name = 'rol'
     )
  then
    drop table public.profiles cascade;
  end if;
end $$;

create table if not exists public.profiles (
  id                   uuid        primary key references auth.users (id) on delete cascade,
  rol                  text        not null,
  nombre               text        not null,
  apellido             text        not null,
  -- Único en toda la tabla (profesionales y niños comparten el espacio de
  -- nombres), siempre en minúsculas. Nullable SOLO para el alta por Google,
  -- que se completa en el slice 2. UNIQUE admite varios NULL.
  nombre_usuario       text,
  acepta_tyc           boolean     not null default false,
  fecha_aceptacion_tyc timestamptz,
  created_at           timestamptz not null default now(),

  constraint profiles_rol_check
    check (rol in ('profesional', 'nino')),
  constraint profiles_nombre_usuario_key
    unique (nombre_usuario),
  constraint profiles_nombre_usuario_formato_check
    check (nombre_usuario ~ '^[a-z0-9._]{3,30}$')
);

comment on table  public.profiles is 'Perfil de cada usuario de auth.users. Lo crea el trigger handle_new_user.';
comment on column public.profiles.nombre_usuario is 'Minúsculas, ^[a-z0-9._]{3,30}$. Null solo mientras un alta por Google no lo completó.';


-- ---------------------------------------------------------------------
-- 2. ninos (1 a 1 con profiles)
-- ---------------------------------------------------------------------
create table if not exists public.ninos (
  profile_id           uuid        primary key references public.profiles (id) on delete cascade,
  fecha_nacimiento     date        not null,
  etapa_escolar        text        not null,
  tutor_email          text        not null,
  tutor_telefono       text,
  ultima_conexion      timestamptz,
  ultimo_entrenamiento timestamptz,
  ultima_prueba        timestamptz,

  constraint ninos_etapa_escolar_check
    check (etapa_escolar in ('sala_4', 'sala_5', 'primero', 'segundo', 'tercero'))
);

comment on table public.ninos is 'Datos propios de los perfiles con rol nino.';


-- ---------------------------------------------------------------------
-- 3. profesional_nino (vínculo M:N; también representa la invitación)
-- ---------------------------------------------------------------------
create table if not exists public.profesional_nino (
  id               uuid        primary key default gen_random_uuid(),
  profesional_id   uuid        not null references public.profiles (id) on delete cascade,
  nino_id          uuid        not null references public.profiles (id) on delete cascade,
  estado           text        not null default 'pendiente',
  fecha_invitacion timestamptz not null default now(),
  fecha_afiliacion timestamptz, -- = fecha de aceptación de la invitación
  fecha_baja       timestamptz,

  constraint profesional_nino_estado_check
    check (estado in ('pendiente', 'activa', 'inactiva')),
  constraint profesional_nino_profesional_nino_key
    unique (profesional_id, nino_id),
  constraint profesional_nino_distintos_check
    check (profesional_id <> nino_id)
);

-- (profesional_id, nino_id) ya está indexado por el UNIQUE; igual se deja
-- un índice simple por cada lado para las búsquedas típicas.
create index if not exists profesional_nino_profesional_id_idx on public.profesional_nino (profesional_id);
create index if not exists profesional_nino_nino_id_idx        on public.profesional_nino (nino_id);


-- ---------------------------------------------------------------------
-- 4. test (cabecera; reemplaza test_resultados y test_resultados_primaria)
-- ---------------------------------------------------------------------
create table if not exists public.test (
  id               uuid        primary key default gen_random_uuid(),
  nino_id          uuid        not null references public.profiles (id) on delete cascade,
  -- El test pertenece al niño aunque el profesional borre su cuenta.
  profesional_id   uuid        references public.profiles (id) on delete set null,
  nivel            text        not null,
  fecha            timestamptz not null default now(),
  puntaje_total    int         not null,
  porcentaje_total int         not null,
  conclusion       text,
  created_at       timestamptz not null default now(),

  constraint test_nivel_check
    check (nivel in ('inicial', 'primario')),
  constraint test_porcentaje_total_check
    check (porcentaje_total between 0 and 100)
);

create index if not exists test_nino_id_fecha_idx on public.test (nino_id, fecha desc);


-- ---------------------------------------------------------------------
-- 5. test_bloque_resultado (detalle: una fila por bloque)
-- ---------------------------------------------------------------------
create table if not exists public.test_bloque_resultado (
  id            uuid primary key default gen_random_uuid(),
  test_id       uuid not null references public.test (id) on delete cascade,
  bloque_codigo text not null,
  orden         int  not null,
  correctas     int  not null,
  total         int  not null,

  constraint test_bloque_resultado_bloque_codigo_check
    check (bloque_codigo in (
      'discriminacion_auditiva',
      'conciencia_fonologica',
      'conciencia_silabica',
      'memoria_fonologica',
      'denominacion_rapida',
      'comprension_lectora',
      'correspondencia_sonido_letra',
      'reconocimiento_visual',
      'lectura_pseudopalabras'
    )),
  constraint test_bloque_resultado_total_check
    check (total > 0),
  constraint test_bloque_resultado_correctas_check
    check (correctas between 0 and total),
  constraint test_bloque_resultado_test_bloque_key
    unique (test_id, bloque_codigo)
);


-- ---------------------------------------------------------------------
-- 6. Funciones auxiliares
-- ---------------------------------------------------------------------

-- 6.1 Nivel del test que corresponde a una etapa escolar.
--     Espejo en TypeScript: lib/test/bloques.ts → nivelParaEtapa().
create or replace function public.nivel_para_etapa(etapa text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when etapa in ('sala_4', 'sala_5')                then 'inicial'
    when etapa in ('primero', 'segundo', 'tercero')   then 'primario'
    else null
  end;
$$;

-- 6.2 ¿El usuario actual es profesional con vínculo ACTIVO con p_nino?
--     SECURITY DEFINER: lee profesional_nino sin pasar por su RLS, así las
--     políticas de otras tablas pueden usarla sin recursión.
create or replace function public.es_profesional_vinculado(p_nino uuid)
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
  );
$$;

-- 6.3 ¿p_profesional invitó (pendiente) o está vinculado (activa) con el
--     niño actual? Permite al niño ver el perfil de esos profesionales.
create or replace function public.es_profesional_del_nino_actual(p_profesional uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profesional_nino pn
    where pn.nino_id        = auth.uid()
      and pn.profesional_id = p_profesional
      and pn.estado in ('pendiente', 'activa')
  );
$$;


-- ---------------------------------------------------------------------
-- 7. guardar_test: única vía de escritura de test / test_bloque_resultado
-- ---------------------------------------------------------------------
-- p_bloques: array JSON de {bloque_codigo, orden, correctas, total}.
-- Todo corre en la transacción de la llamada: si algo falla no queda
-- ni cabecera ni detalle.
create or replace function public.guardar_test(
  p_nino_id          uuid,
  p_nivel            text,
  p_puntaje_total    int,
  p_porcentaje_total int,
  p_conclusion       text,
  p_bloques          jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_etapa   text;
  v_test_id uuid;
  v_bloque  record;
begin
  if v_uid is null then
    raise exception 'No hay una sesión iniciada.';
  end if;

  if not exists (select 1 from public.profiles where id = v_uid and rol = 'profesional') then
    raise exception 'Solo un profesional puede guardar un test.';
  end if;

  if p_nino_id is null then
    raise exception 'Falta indicar el niño al que corresponde el test.';
  end if;

  if not public.es_profesional_vinculado(p_nino_id) then
    raise exception 'No tenés un vínculo activo con este niño.';
  end if;

  select n.etapa_escolar into v_etapa
  from public.ninos n
  where n.profile_id = p_nino_id;

  if v_etapa is null then
    raise exception 'El niño no tiene cargada su etapa escolar.';
  end if;

  if p_nivel is distinct from public.nivel_para_etapa(v_etapa) then
    raise exception 'El nivel del test (%) no corresponde a la etapa escolar del niño (%).',
      coalesce(p_nivel, 'sin nivel'), v_etapa;
  end if;

  if p_puntaje_total is null or p_puntaje_total < 0 then
    raise exception 'El puntaje total es inválido.';
  end if;

  if p_porcentaje_total is null or p_porcentaje_total not between 0 and 100 then
    raise exception 'El porcentaje total debe estar entre 0 y 100.';
  end if;

  if p_bloques is null or jsonb_typeof(p_bloques) <> 'array' or jsonb_array_length(p_bloques) = 0 then
    raise exception 'El test debe incluir al menos un bloque de resultados.';
  end if;

  insert into public.test (nino_id, profesional_id, nivel, puntaje_total, porcentaje_total, conclusion)
  values (p_nino_id, v_uid, p_nivel, p_puntaje_total, p_porcentaje_total, p_conclusion)
  returning id into v_test_id;

  for v_bloque in
    select *
    from jsonb_to_recordset(p_bloques) as b(bloque_codigo text, orden int, correctas int, total int)
  loop
    -- Misma lista que test_bloque_resultado_bloque_codigo_check; se valida
    -- acá para devolver un mensaje claro en vez del error del constraint.
    if v_bloque.bloque_codigo is null or v_bloque.bloque_codigo not in (
      'discriminacion_auditiva', 'conciencia_fonologica', 'conciencia_silabica',
      'memoria_fonologica', 'denominacion_rapida', 'comprension_lectora',
      'correspondencia_sonido_letra', 'reconocimiento_visual', 'lectura_pseudopalabras'
    ) then
      raise exception 'Código de bloque inválido: %.', coalesce(v_bloque.bloque_codigo, 'vacío');
    end if;

    if v_bloque.orden is null then
      raise exception 'Falta el orden del bloque %.', v_bloque.bloque_codigo;
    end if;

    if v_bloque.total is null or v_bloque.total <= 0 then
      raise exception 'El bloque % debe tener un total mayor a 0.', v_bloque.bloque_codigo;
    end if;

    if v_bloque.correctas is null or v_bloque.correctas not between 0 and v_bloque.total then
      raise exception 'Las correctas del bloque % deben estar entre 0 y %.', v_bloque.bloque_codigo, v_bloque.total;
    end if;

    if exists (
      select 1 from public.test_bloque_resultado
      where test_id = v_test_id and bloque_codigo = v_bloque.bloque_codigo
    ) then
      raise exception 'El bloque % está repetido.', v_bloque.bloque_codigo;
    end if;

    insert into public.test_bloque_resultado (test_id, bloque_codigo, orden, correctas, total)
    values (v_test_id, v_bloque.bloque_codigo, v_bloque.orden, v_bloque.correctas, v_bloque.total);
  end loop;

  update public.ninos
  set ultima_prueba = now()
  where profile_id = p_nino_id;

  return v_test_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 8. Trigger de alta: auth.users → profiles (+ ninos)
-- ---------------------------------------------------------------------
-- Contrato de raw_user_meta_data (lo envía el formulario del slice 2):
--   rol, nombre, apellido, nombre_usuario, acepta_tyc
--   + si rol = 'nino': fecha_nacimiento, etapa_escolar, tutor_email, tutor_telefono
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
  v_tutor    text;
begin
  if v_rol not in ('profesional', 'nino') then
    raise exception 'Rol inválido en el alta: %.', v_rol;
  end if;

  -- nombre / apellido: formulario nuevo → formulario actual → Google → ''.
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
  -- (queda null y se completa después); para un niño es obligatorio.
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

    v_tutor := nullif(btrim(v_meta ->> 'tutor_email'), '');
    if v_tutor is null then
      raise exception 'Falta el email del tutor del niño.';
    end if;
  end if;

  insert into public.profiles (id, rol, nombre, apellido, nombre_usuario, acepta_tyc, fecha_aceptacion_tyc)
  values (
    new.id, v_rol, v_nombre, v_apellido, v_usuario, v_acepta,
    case when v_acepta then now() end
  );

  if v_rol = 'nino' then
    insert into public.ninos (profile_id, fecha_nacimiento, etapa_escolar, tutor_email, tutor_telefono)
    values (new.id, v_fecha, v_etapa, v_tutor, nullif(btrim(v_meta ->> 'tutor_telefono'), ''));
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 9. Trigger BEFORE UPDATE en profiles: id y rol son inmutables
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

  return new;
end;
$$;

drop trigger if exists profiles_proteger_campos on public.profiles;
create trigger profiles_proteger_campos
  before update on public.profiles
  for each row execute function public.proteger_campos_profile();


-- ---------------------------------------------------------------------
-- 10. Permisos sobre funciones
-- ---------------------------------------------------------------------
-- Supabase otorga EXECUTE a anon/authenticated por defecto: se restringe.
revoke all on function public.nivel_para_etapa(text)                          from public, anon;
revoke all on function public.es_profesional_vinculado(uuid)                  from public, anon;
revoke all on function public.es_profesional_del_nino_actual(uuid)            from public, anon;
revoke all on function public.guardar_test(uuid, text, int, int, text, jsonb) from public, anon;
grant execute on function public.nivel_para_etapa(text)                          to authenticated;
grant execute on function public.es_profesional_vinculado(uuid)                  to authenticated;
grant execute on function public.es_profesional_del_nino_actual(uuid)            to authenticated;
grant execute on function public.guardar_test(uuid, text, int, int, text, jsonb) to authenticated;

-- Funciones de trigger: nadie las llama directamente.
revoke all on function public.handle_new_user()         from public, anon, authenticated;
revoke all on function public.proteger_campos_profile() from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 11. Permisos sobre tablas (además de RLS, defensa en profundidad)
-- ---------------------------------------------------------------------
-- anon no accede a nada; authenticated solo a lo que las políticas usan.
-- Las escrituras de profiles/ninos (alta) y de test/test_bloque_resultado
-- las hacen funciones SECURITY DEFINER, que no dependen de estos grants.
revoke all on table public.profiles              from anon, authenticated;
revoke all on table public.ninos                 from anon, authenticated;
revoke all on table public.profesional_nino      from anon, authenticated;
revoke all on table public.test                  from anon, authenticated;
revoke all on table public.test_bloque_resultado from anon, authenticated;
revoke all on table public.entrenamientos        from anon, authenticated;

grant select, update on table public.profiles              to authenticated;
grant select, update on table public.ninos                 to authenticated;
grant select         on table public.profesional_nino      to authenticated;
grant select         on table public.test                  to authenticated;
grant select         on table public.test_bloque_resultado to authenticated;
grant select, insert on table public.entrenamientos        to authenticated;


-- ---------------------------------------------------------------------
-- 12. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles              enable row level security;
alter table public.ninos                 enable row level security;
alter table public.profesional_nino      enable row level security;
alter table public.test                  enable row level security;
alter table public.test_bloque_resultado enable row level security;
alter table public.entrenamientos        enable row level security;

-- Tablas legacy: RLS activa y sin políticas → cerradas para la API.
do $$
begin
  if to_regclass('public.test_resultados') is not null then
    execute 'alter table public.test_resultados enable row level security';
  end if;
  if to_regclass('public.test_resultados_primaria') is not null then
    execute 'alter table public.test_resultados_primaria enable row level security';
  end if;
end $$;

-- Nota: todo lo que depende de profesional_nino pasa por las funciones
-- SECURITY DEFINER de la sección 6, nunca por subconsultas directas.
-- `(select auth.uid())` se evalúa una vez por consulta en vez de por fila.

-- 12.1 profiles ---------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or public.es_profesional_vinculado(id)
    or public.es_profesional_del_nino_actual(id)
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using      (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- Sin INSERT ni DELETE: el alta la hace handle_new_user.

-- 12.2 ninos ------------------------------------------------------------
drop policy if exists ninos_select on public.ninos;
create policy ninos_select on public.ninos
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or public.es_profesional_vinculado(profile_id)
  );

drop policy if exists ninos_update on public.ninos;
create policy ninos_update on public.ninos
  for update to authenticated
  using      (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
-- El profesional no edita datos del niño. Sin INSERT ni DELETE directos.

-- 12.3 profesional_nino -------------------------------------------------
drop policy if exists profesional_nino_select on public.profesional_nino;
create policy profesional_nino_select on public.profesional_nino
  for select to authenticated
  using (
    profesional_id = (select auth.uid())
    or nino_id     = (select auth.uid())
  );
-- Sin INSERT/UPDATE/DELETE: invitar, aceptar, rechazar y desvincular
-- serán RPCs del slice 3.

-- 12.4 test -------------------------------------------------------------
drop policy if exists test_select on public.test;
create policy test_select on public.test
  for select to authenticated
  using (
    nino_id = (select auth.uid())
    or public.es_profesional_vinculado(nino_id)
  );
-- Sin escritura directa: solo vía guardar_test.

-- 12.5 test_bloque_resultado -------------------------------------------
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
          or public.es_profesional_vinculado(t.nino_id)
        )
    )
  );
-- Sin escritura directa: solo vía guardar_test.

-- 12.6 entrenamientos ---------------------------------------------------
drop policy if exists entrenamientos_select on public.entrenamientos;
create policy entrenamientos_select on public.entrenamientos
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.es_profesional_vinculado(user_id)
  );

drop policy if exists entrenamientos_insert on public.entrenamientos;
create policy entrenamientos_insert on public.entrenamientos
  for insert to authenticated
  with check (user_id = (select auth.uid()));
-- Sin UPDATE ni DELETE.

commit;
