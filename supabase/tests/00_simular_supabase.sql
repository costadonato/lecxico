-- =====================================================================
-- Lecxico · Simulación mínima de Supabase para un Postgres local
-- =====================================================================
--
-- Crea lo que las migraciones de supabase/migrations/ dan por hecho en
-- Supabase, para poder aplicarlas en orden (0001, 0002, ...) en una base
-- vacía y probar cada sesión. Se corre UNA vez, antes de las migraciones,
-- como superusuario. Ver supabase/tests/README.md.
--
-- NO es para Supabase: allá todo esto ya existe.
--
-- Qué simula:
--   * Roles anon, authenticated y service_role (este último con BYPASSRLS,
--     como en Supabase).
--   * Los permisos por defecto de Supabase: cada tabla y función nueva de
--     public queda con todos los permisos para anon, authenticated y
--     service_role. Así los REVOKE de las migraciones prueban algo.
--   * El esquema auth con auth.users (solo las columnas que usan los
--     triggers), auth.uid() y auth.jwt() leyendo request.jwt.claims.
--   * public.entrenamientos, que en Supabase existía antes de la 0001.
--
-- Cómo simular una sesión (igual que en el SQL Editor):
--   set local role authenticated;
--   select set_config('request.jwt.claims',
--     json_build_object('sub', '<UID>', 'role', 'authenticated')::text, true);
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Roles de la API
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;

-- Permisos por defecto de Supabase sobre lo que se cree en public.
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;


-- ---------------------------------------------------------------------
-- 2. Esquema auth
-- ---------------------------------------------------------------------
create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

-- Solo las columnas que usan handle_new_user y sincronizar_tutor_email.
create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  raw_user_meta_data jsonb,
  created_at         timestamptz not null default now()
);

-- Igual que en Supabase: el id del usuario de la sesión (claim "sub").
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb;
$$;

grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function auth.jwt() to anon, authenticated, service_role;


-- ---------------------------------------------------------------------
-- 3. public.entrenamientos (existía en Supabase antes de la 0001)
-- ---------------------------------------------------------------------
-- La 0002 le reemplaza la FK por una con ON DELETE CASCADE.
create table if not exists public.entrenamientos (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id),
  juego      text        not null,
  puntaje    int         not null default 0,
  created_at timestamptz not null default now()
);

commit;
