-- =====================================================================
-- Lecxico · Slice 4 — Selección del niño para el test y formato de nombres
-- =====================================================================
--
-- Requiere la 0001, la 0002 y la 0003 aplicadas.
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos (CREATE OR
-- REPLACE, DROP ... IF EXISTS, REVOKE/GRANT y un UPDATE que solo toca
-- filas sin formatear).
--
-- Cambios:
--   1. ninos_para_test(): niños con vínculo activo + su último test.
--   2. formatear_nombre() + trigger en profiles + corrección de los datos
--      ya guardados ("juan PÉREZ" → "Juan Pérez").
--
-- ---------------------------------------------------------------------
-- COMPROBACIÓN PREVIA (correr en Supabase ANTES de aplicar la migración)
-- ---------------------------------------------------------------------
-- formatear_nombre() usa upper/lower con la collation ICU "und-x-icu" para
-- que las tildes y la ñ se conviertan bien sin depender de la configuración
-- regional (lc_ctype) de la base. Esta consulta aplica la MISMA técnica a
-- los casos de ejemplo, sin crear nada. La columna "ok" tiene que dar true
-- en todas las filas; "initcap_por_defecto" es solo para comparar.
-- Si da error "collation und-x-icu does not exist", NO apliques la
-- migración y avisá.
--
--   select v.entrada,
--          f.resultado,
--          f.resultado = v.esperado          as ok,
--          initcap(v.entrada)                as initcap_por_defecto
--   from (values
--     ('juan PÉREZ',        'Juan Pérez'),
--     ('maría josé',        'María José'),
--     ('ÑUÑEZ',             'Ñuñez'),
--     ('ana-lía',           'Ana-Lía'),
--     ('ángel',             'Ángel'),
--     ('  o''brien   DE la  fuente ', 'O''Brien De La Fuente')
--   ) as v(entrada, esperado)
--   cross join lateral (
--     select coalesce(string_agg(
--              case when m.tok[1] ~ '^[ ''’-]$' then m.tok[1]
--                   else upper(left(m.tok[1], 1) collate "und-x-icu")
--                        || lower(substr(m.tok[1], 2) collate "und-x-icu")
--              end, '' order by m.ord), '') as resultado
--     from regexp_matches(
--            regexp_replace(regexp_replace(normalize(v.entrada, NFC), '^\s+|\s+$', '', 'g'), '\s+', ' ', 'g'),
--            '[^ ''’-]+|[ ''’-]', 'g'
--          ) with ordinality as m(tok, ord)
--   ) f;
-- =====================================================================

begin;


-- ---------------------------------------------------------------------
-- 1. ninos_para_test
-- ---------------------------------------------------------------------
-- Lista de la pantalla /test: los niños con vínculo ACTIVO con el
-- profesional actual (nunca pendientes ni inactivos), con el nivel que les
-- corresponde y los datos del test más reciente, lo haya tomado quien lo
-- haya tomado. Si el usuario actual no es profesional, devuelve 0 filas.
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
-- 2. formatear_nombre
-- ---------------------------------------------------------------------
-- "juan PÉREZ" → "Juan Pérez", "ana-lía" → "Ana-Lía", "o'brien" → "O'Brien".
--   * Normaliza a NFC (una tilde "suelta" queda pegada a su letra).
--   * Quita espacios al principio y al final, y deja uno solo entre palabras.
--   * Corta en palabras por espacio, guion y apóstrofo (' y ’); cada palabra
--     queda con la primera letra en mayúscula y el resto en minúscula.
-- No usa initcap(): su forma de detectar palabras depende del proveedor de
-- la collation (con ICU, "o'brien" quedaría "O'brien"). upper/lower con
-- collate "und-x-icu" convierten bien tildes y ñ con cualquier lc_ctype.
-- '' devuelve '' (nombre y apellido son NOT NULL y el alta por Google puede
-- llegar sin ellos); null devuelve null.
create or replace function public.formatear_nombre(p_texto text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
  select case
    when p_texto is null then null
    else coalesce((
      select string_agg(
               case when m.tok[1] ~ '^[ ''’-]$' then m.tok[1]
                    else upper(left(m.tok[1], 1) collate "und-x-icu")
                         || lower(substr(m.tok[1], 2) collate "und-x-icu")
               end,
               '' order by m.ord)
      from regexp_matches(
             regexp_replace(regexp_replace(normalize(p_texto, NFC), '^\s+|\s+$', '', 'g'), '\s+', ' ', 'g'),
             '[^ ''’-]+|[ ''’-]',
             'g'
           ) with ordinality as m(tok, ord)
    ), '')
  end;
$$;

-- El trigger de abajo la llama con el rol del usuario que edita su perfil
-- (authenticated), así que necesita EXECUTE.
revoke all     on function public.formatear_nombre(text) from public, anon;
grant  execute on function public.formatear_nombre(text) to authenticated;


-- ---------------------------------------------------------------------
-- 3. Trigger: formato de nombre y apellido en profiles
-- ---------------------------------------------------------------------
-- Cubre todas las entradas: registro y alta por Google (INSERT desde
-- handle_new_user) y /completar-perfil (UPDATE del propio usuario).
-- Convive con profiles_proteger_campos (BEFORE UPDATE): tocan columnas
-- distintas, así que el orden entre ambos no cambia el resultado.
create or replace function public.formatear_nombres_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.nombre   := public.formatear_nombre(new.nombre);
  new.apellido := public.formatear_nombre(new.apellido);
  return new;
end;
$$;

revoke all on function public.formatear_nombres_profile() from public, anon, authenticated;

drop trigger if exists profiles_formatear_nombres on public.profiles;
create trigger profiles_formatear_nombres
  before insert or update of nombre, apellido on public.profiles
  for each row execute function public.formatear_nombres_profile();


-- ---------------------------------------------------------------------
-- 4. Corrección de los nombres ya guardados
-- ---------------------------------------------------------------------
-- Solo filas que todavía no tienen el formato (repetible sin efectos).
update public.profiles
set nombre   = public.formatear_nombre(nombre),
    apellido = public.formatear_nombre(apellido)
where nombre   is distinct from public.formatear_nombre(nombre)
   or apellido is distinct from public.formatear_nombre(apellido);

commit;
