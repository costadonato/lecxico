-- =====================================================================
-- Lecxico · Simulación mínima de Supabase para probar las migraciones
-- en un Postgres local (NO correr en Supabase: allá esto ya existe).
-- =====================================================================
--
-- Crea lo que las migraciones de supabase/migrations/ esperan encontrar:
--   * roles anon, authenticated y service_role;
--   * esquema auth con auth.users y auth.uid() (lee request.jwt.claims,
--     como en Supabase);
--   * los permisos por defecto que Supabase da a anon y authenticated
--     (las migraciones los recortan con revoke);
--   * la collation "und-x-icu" si el Postgres local no tiene ICU (la usa
--     la 0004; con un alias a "C" las pruebas de acceso no cambian).
--
-- Orden para probar: este archivo → migraciones 0001, 0002, 0003, 0004
-- (y las siguientes que haya) → el archivo de pruebas de la migración.
-- Para simular un usuario dentro de una transacción:
--   select set_config('request.jwt.claims',
--     json_build_object('sub', '<UID>', 'role', 'authenticated')::text, true);
--   set local role authenticated;
-- =====================================================================

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

create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key,
  email              text,
  raw_user_meta_data jsonb,
  raw_app_meta_data  jsonb,
  email_confirmed_at timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select current_setting('request.jwt.claims', true)::jsonb ->> 'role';
$$;

grant usage on schema auth   to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;

-- Supabase da por defecto todos los permisos de public a estos roles.
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Tabla anterior a la 0001 (la creó el prototipo): la 0001 solo le pone RLS
-- y la 0002 le agrega la clave foránea a auth.users.
create table if not exists public.entrenamientos (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null,
  juego      text        not null,
  puntaje    int         not null default 0,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_collation where collname = 'und-x-icu') then
    create collation public."und-x-icu" from "C";
  end if;
end $$;
