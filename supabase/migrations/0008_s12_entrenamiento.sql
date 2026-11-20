-- =====================================================================
-- Lecxico · 0008 · S12 Datos del entrenamiento
-- =====================================================================
--
-- Qué hace:
--   1. entrenamiento_juego: catálogo mínimo de juegos (código, niveles y si
--      es solo de consulta). El resto de la ficha de cada juego vive en el
--      código (lib/entrenamiento/juegos.ts).
--   2. entrenamiento_tarea y entrenamiento_tarea_item: tareas para la casa
--      que arma el profesional (uno o varios juegos, o una misión propia de
--      3 juegos distintos), cada juego con su grado.
--   3. entrenamiento_partida: cada partida terminada, con su origen
--      (consulta, tarea o práctica), su autor y su resultado.
--   4. ninos.letra_entrenamiento: preferencia del switch "A a" (mayúscula o
--      minúscula), por niño; arranca en mayúscula.
--   5. Funciones: grados_habilitados, guardar_partida, crear_tarea,
--      cancelar_tarea y cambiar_letra_entrenamiento.
--   6. Borra la tabla heredada entrenamientos (ningún juego la escribía).
--
-- Reglas (validación del 19/11 y banco de entrenamientos):
--   * Desbloqueo del 80 %: una partida de consulta, tarea o práctica con al
--     menos 80 % en el grado g habilita en casa hasta el grado g + 1
--     (máximo 3). El grado 1 está siempre habilitado. Las partidas de una
--     misión no desbloquean. Solo cuentan las partidas del nivel actual del
--     niño (el contenido de inicial y de primario es distinto).
--   * En la práctica en casa, el servidor rechaza un grado no habilitado y
--     los juegos de solo consulta. En consulta y en tareas el grado es libre.
--   * Autor: el profesional en consulta (quien juega) y en tarea (quien la
--     asignó). La práctica en casa no tiene autor.
--   * Visibilidad: la práctica la ve todo profesional con vínculo activo;
--     consulta y tareas siguen profesional_puede_ver_registro (0005). El
--     niño no lee partidas (ve solo el grado habilitado, por función), pero
--     sí sus tareas.
--   * Todo se borra en cascada con la cuenta del niño.
--
-- Orden: después de la 0007. Aplicarla el mismo día que se mergea el PR
-- que deja de leer la tabla entrenamientos (lib/ninos/detalle.ts).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Catálogo de juegos
-- ---------------------------------------------------------------------
create table if not exists public.entrenamiento_juego (
  codigo        text    primary key check (codigo ~ '^[a-z_]{3,30}$'),
  niveles       text[]  not null check (
                  cardinality(niveles) between 1 and 2
                  and niveles <@ array['inicial', 'primario']::text[]),
  solo_consulta boolean not null default false
);

insert into public.entrenamiento_juego (codigo, niveles, solo_consulta) values
  ('detective',    array['inicial', 'primario'], false),
  ('rima',         array['inicial', 'primario'], false),
  ('palmas',       array['inicial'],             false),
  ('memotono',     array['inicial', 'primario'], false),
  ('rompe',        array['primario'],            false),
  ('planeta',      array['primario'],            false),
  ('nombra',       array['inicial', 'primario'], true),
  ('tocalo',       array['inicial', 'primario'], false),
  ('lee',          array['primario'],            false),
  ('eco',          array['primario'],            false),
  ('caza',         array['primario'],            false),
  ('memopalabras', array['primario'],            false),
  ('ojo_lince',    array['inicial', 'primario'], false),
  ('lluvia',       array['inicial', 'primario'], false)
on conflict (codigo) do update
  set niveles = excluded.niveles, solo_consulta = excluded.solo_consulta;


-- ---------------------------------------------------------------------
-- 2. Tareas para la casa
-- ---------------------------------------------------------------------
create table if not exists public.entrenamiento_tarea (
  id             uuid        primary key default gen_random_uuid(),
  nino_id        uuid        not null references public.profiles (id) on delete cascade,
  profesional_id uuid        references public.profiles (id) on delete set null,
  nombre         text        check (nombre is null or char_length(nombre) between 1 and 80),
  es_mision      boolean     not null default false,
  estado         text        not null default 'pendiente' check (estado in ('pendiente', 'hecha')),
  created_at     timestamptz not null default now(),
  completada_at  timestamptz,
  constraint entrenamiento_tarea_estado_fecha check ((estado = 'hecha') = (completada_at is not null))
);
create index if not exists entrenamiento_tarea_nino_idx on public.entrenamiento_tarea (nino_id, estado);

create table if not exists public.entrenamiento_tarea_item (
  tarea_id uuid     not null references public.entrenamiento_tarea (id) on delete cascade,
  orden    smallint not null check (orden between 1 and 10),
  juego    text     not null references public.entrenamiento_juego (codigo),
  grado    smallint not null check (grado between 1 and 3),
  primary key (tarea_id, orden),
  unique (tarea_id, juego, grado)
);


-- ---------------------------------------------------------------------
-- 3. Partidas
-- ---------------------------------------------------------------------
create table if not exists public.entrenamiento_partida (
  id             uuid        primary key default gen_random_uuid(),
  nino_id        uuid        not null references public.profiles (id) on delete cascade,
  profesional_id uuid        references public.profiles (id) on delete set null,
  juego          text        not null references public.entrenamiento_juego (codigo),
  nivel          text        not null check (nivel in ('inicial', 'primario')),
  grado          smallint    not null check (grado between 1 and 3),
  origen         text        not null check (origen in ('consulta', 'tarea', 'practica')),
  tarea_id       uuid        references public.entrenamiento_tarea (id) on delete set null,
  -- Agrupa los 3 desafíos de una misión. Las partidas de misión no desbloquean.
  mision         uuid,
  correctas      int         not null check (correctas >= 0),
  total          int         not null check (total between 1 and 200),
  porcentaje     smallint    generated always as ((round(100.0 * correctas / total))::smallint) stored,
  -- Solo los juegos que miden tiempo y errores (Nombrá rápido).
  tiempo_ms      int         check (tiempo_ms > 0),
  errores        int         check (errores >= 0),
  -- Un elemento por ítem: [{item, correcta, intentos, ...}]
  detalle        jsonb       check (detalle is null or jsonb_typeof(detalle) = 'array'),
  created_at     timestamptz not null default now(),
  constraint entrenamiento_partida_correctas check (correctas <= total),
  constraint entrenamiento_partida_tiempo_errores check ((tiempo_ms is null) = (errores is null)),
  constraint entrenamiento_partida_origen_tarea check (origen = 'tarea' or tarea_id is null)
);
create index if not exists entrenamiento_partida_nino_idx on public.entrenamiento_partida (nino_id, juego, created_at);
create index if not exists entrenamiento_partida_tarea_idx on public.entrenamiento_partida (tarea_id) where tarea_id is not null;


-- ---------------------------------------------------------------------
-- 4. Preferencia de letra del entrenamiento
-- ---------------------------------------------------------------------
alter table public.ninos
  add column if not exists letra_entrenamiento text not null default 'mayuscula'
  check (letra_entrenamiento in ('mayuscula', 'minuscula'));


-- ---------------------------------------------------------------------
-- 5. Funciones
-- ---------------------------------------------------------------------

-- 5.1 Grado habilitado en casa por juego, para el nivel actual del niño.
--     La llaman el niño (para sí) y un profesional con vínculo activo.
create or replace function public.grados_habilitados(p_nino uuid)
returns table (juego text, grado smallint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_nivel text;
begin
  if auth.uid() is null or (auth.uid() <> p_nino and not public.es_profesional_vinculado(p_nino)) then
    raise exception 'No tenés acceso al entrenamiento de este niño.';
  end if;

  select public.nivel_para_etapa(n.etapa_escolar) into v_nivel
  from public.ninos n where n.profile_id = p_nino;

  return query
  select j.codigo,
         least(3, greatest(1, coalesce(max(p.grado) filter (where p.porcentaje >= 80 and p.mision is null) + 1, 1)))::smallint
  from public.entrenamiento_juego j
  left join public.entrenamiento_partida p
    on p.juego = j.codigo and p.nino_id = p_nino and p.nivel = v_nivel
  where v_nivel = any (j.niveles)
  group by j.codigo
  order by j.codigo;
end;
$$;


-- 5.2 Guarda una partida terminada y devuelve el grado habilitado del juego.
create or replace function public.guardar_partida(
  p_nino      uuid,
  p_juego     text,
  p_grado     int,
  p_origen    text,
  p_correctas int,
  p_total     int,
  p_tiempo_ms int   default null,
  p_errores   int   default null,
  p_detalle   jsonb default null,
  p_tarea     uuid  default null,
  p_mision    uuid  default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_nivel     text;
  v_juego     public.entrenamiento_juego%rowtype;
  v_autor     uuid;
  v_tarea     public.entrenamiento_tarea%rowtype;
  v_habil     smallint;
  v_id        uuid;
  v_faltan    int;
begin
  if v_uid is null then
    raise exception 'Hace falta iniciar sesión.';
  end if;

  select public.nivel_para_etapa(n.etapa_escolar) into v_nivel
  from public.ninos n where n.profile_id = p_nino;
  if not found or v_nivel is null then
    raise exception 'El niño no existe.';
  end if;

  select * into v_juego from public.entrenamiento_juego where codigo = p_juego;
  if not found then
    raise exception 'El juego % no existe.', p_juego;
  end if;
  if not (v_nivel = any (v_juego.niveles)) then
    raise exception 'El juego no corresponde al nivel del niño.';
  end if;
  if p_grado is null or p_grado not between 1 and 3 then
    raise exception 'El grado tiene que ser 1, 2 o 3.';
  end if;
  if p_total is null or p_correctas is null or p_total not between 1 and 200 or p_correctas not between 0 and p_total then
    raise exception 'El resultado de la partida no es válido.';
  end if;
  if (p_tiempo_ms is null) <> (p_errores is null) then
    raise exception 'El tiempo y los errores van juntos.';
  end if;
  if p_detalle is not null and jsonb_typeof(p_detalle) <> 'array' then
    raise exception 'El detalle tiene que ser una lista.';
  end if;

  if p_origen = 'consulta' then
    if not public.es_profesional_vinculado(p_nino) then
      raise exception 'Solo un profesional con vínculo activo puede registrar una partida en consulta.';
    end if;
    if p_tarea is not null then
      raise exception 'Una partida en consulta no pertenece a una tarea.';
    end if;
    v_autor := v_uid;

  elsif p_origen in ('practica', 'tarea') then
    if v_uid <> p_nino then
      raise exception 'La práctica y las tareas se registran desde la cuenta del niño.';
    end if;
    if v_juego.solo_consulta then
      raise exception 'Este juego es solo para la consulta.';
    end if;

    if p_origen = 'practica' then
      if p_tarea is not null then
        raise exception 'Una partida de práctica no pertenece a una tarea.';
      end if;
      select g.grado into v_habil from public.grados_habilitados(p_nino) g where g.juego = p_juego;
      if p_grado > coalesce(v_habil, 1) then
        raise exception 'Ese grado todavía no está desbloqueado.';
      end if;
      v_autor := null;
    else
      select * into v_tarea from public.entrenamiento_tarea
      where id = p_tarea and nino_id = p_nino and estado = 'pendiente'
      for update;
      if not found then
        raise exception 'La tarea no existe o ya está hecha.';
      end if;
      if not exists (select 1 from public.entrenamiento_tarea_item i
                     where i.tarea_id = p_tarea and i.juego = p_juego and i.grado = p_grado) then
        raise exception 'Ese juego no es parte de la tarea.';
      end if;
      v_autor := v_tarea.profesional_id;
    end if;

  else
    raise exception 'El origen de la partida no es válido.';
  end if;

  insert into public.entrenamiento_partida
    (nino_id, profesional_id, juego, nivel, grado, origen, tarea_id, mision,
     correctas, total, tiempo_ms, errores, detalle)
  values
    (p_nino, v_autor, p_juego, v_nivel, p_grado, p_origen, p_tarea, p_mision,
     p_correctas, p_total, p_tiempo_ms, p_errores, p_detalle)
  returning id into v_id;

  update public.ninos set ultimo_entrenamiento = now() where profile_id = p_nino;

  -- Una tarea queda hecha cuando todos sus juegos tienen al menos una partida.
  if p_origen = 'tarea' then
    select count(*) into v_faltan
    from public.entrenamiento_tarea_item i
    where i.tarea_id = p_tarea
      and not exists (select 1 from public.entrenamiento_partida p
                      where p.tarea_id = p_tarea and p.juego = i.juego and p.grado = i.grado);
    if v_faltan = 0 then
      update public.entrenamiento_tarea set estado = 'hecha', completada_at = now() where id = p_tarea;
    end if;
  end if;

  select g.grado into v_habil from public.grados_habilitados(p_nino) g where g.juego = p_juego;

  return jsonb_build_object(
    'partida', v_id,
    'porcentaje', round(100.0 * p_correctas / p_total),
    'grado_habilitado', v_habil
  );
end;
$$;


-- 5.3 El profesional arma una tarea: [{"juego":"rima","grado":2}, ...]
--     Una misión propia lleva exactamente 3 juegos distintos.
create or replace function public.crear_tarea(
  p_nino      uuid,
  p_items     jsonb,
  p_nombre    text    default null,
  p_es_mision boolean default false
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_nivel text;
  v_id    uuid;
  v_item  jsonb;
  v_orden int := 0;
  v_n     int;
begin
  if not public.es_profesional_vinculado(p_nino) then
    raise exception 'Solo un profesional con vínculo activo puede asignar tareas.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'La tarea necesita una lista de juegos.';
  end if;
  v_n := jsonb_array_length(p_items);
  if v_n not between 1 and 10 then
    raise exception 'La tarea tiene que tener entre 1 y 10 juegos.';
  end if;
  if p_es_mision and (v_n <> 3 or (select count(distinct x ->> 'juego') from jsonb_array_elements(p_items) x) <> 3) then
    raise exception 'Una misión lleva 3 juegos distintos.';
  end if;

  select public.nivel_para_etapa(n.etapa_escolar) into v_nivel from public.ninos n where n.profile_id = p_nino;

  insert into public.entrenamiento_tarea (nino_id, profesional_id, nombre, es_mision)
  values (p_nino, auth.uid(), nullif(btrim(p_nombre), ''), coalesce(p_es_mision, false))
  returning id into v_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_orden := v_orden + 1;
    if not exists (select 1 from public.entrenamiento_juego j
                   where j.codigo = v_item ->> 'juego' and v_nivel = any (j.niveles) and not j.solo_consulta) then
      raise exception 'El juego % no se puede asignar a este niño.', v_item ->> 'juego';
    end if;
    if (v_item ->> 'grado') is null or (v_item ->> 'grado')::int not between 1 and 3 then
      raise exception 'El grado tiene que ser 1, 2 o 3.';
    end if;
    insert into public.entrenamiento_tarea_item (tarea_id, orden, juego, grado)
    values (v_id, v_orden, v_item ->> 'juego', (v_item ->> 'grado')::smallint);
  end loop;

  return v_id;
end;
$$;


-- 5.4 El autor cancela una tarea pendiente (las partidas ya jugadas quedan).
create or replace function public.cancelar_tarea(p_tarea uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  delete from public.entrenamiento_tarea
  where id = p_tarea and profesional_id = auth.uid() and estado = 'pendiente'
    and public.es_profesional_vinculado(nino_id);
  if not found then
    raise exception 'No se puede cancelar esa tarea.';
  end if;
end;
$$;


-- 5.5 Switch "A a": lo cambian el niño (con el tutor) o un profesional con vínculo activo.
create or replace function public.cambiar_letra_entrenamiento(p_nino uuid, p_letra text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or (auth.uid() <> p_nino and not public.es_profesional_vinculado(p_nino)) then
    raise exception 'No podés cambiar la letra de este niño.';
  end if;
  if p_letra not in ('mayuscula', 'minuscula') then
    raise exception 'La letra tiene que ser mayúscula o minúscula.';
  end if;
  update public.ninos set letra_entrenamiento = p_letra where profile_id = p_nino;
end;
$$;

revoke all on function public.grados_habilitados(uuid) from public, anon;
revoke all on function public.guardar_partida(uuid, text, int, text, int, int, int, int, jsonb, uuid, uuid) from public, anon;
revoke all on function public.crear_tarea(uuid, jsonb, text, boolean) from public, anon;
revoke all on function public.cancelar_tarea(uuid) from public, anon;
revoke all on function public.cambiar_letra_entrenamiento(uuid, text) from public, anon;
grant execute on function public.grados_habilitados(uuid) to authenticated;
grant execute on function public.guardar_partida(uuid, text, int, text, int, int, int, int, jsonb, uuid, uuid) to authenticated;
grant execute on function public.crear_tarea(uuid, jsonb, text, boolean) to authenticated;
grant execute on function public.cancelar_tarea(uuid) to authenticated;
grant execute on function public.cambiar_letra_entrenamiento(uuid, text) to authenticated;


-- ---------------------------------------------------------------------
-- 6. Permisos y RLS (las escrituras van solo por las funciones)
-- ---------------------------------------------------------------------
revoke all on table public.entrenamiento_juego, public.entrenamiento_tarea,
                    public.entrenamiento_tarea_item, public.entrenamiento_partida from anon, authenticated;
grant select on table public.entrenamiento_juego, public.entrenamiento_tarea,
                      public.entrenamiento_tarea_item, public.entrenamiento_partida to authenticated;

alter table public.entrenamiento_juego      enable row level security;
alter table public.entrenamiento_tarea      enable row level security;
alter table public.entrenamiento_tarea_item enable row level security;
alter table public.entrenamiento_partida    enable row level security;

drop policy if exists entrenamiento_juego_select on public.entrenamiento_juego;
create policy entrenamiento_juego_select on public.entrenamiento_juego
  for select to authenticated using (true);

drop policy if exists entrenamiento_tarea_select on public.entrenamiento_tarea;
create policy entrenamiento_tarea_select on public.entrenamiento_tarea
  for select to authenticated
  using (nino_id = auth.uid() or public.profesional_puede_ver_registro(nino_id, profesional_id));

drop policy if exists entrenamiento_tarea_item_select on public.entrenamiento_tarea_item;
create policy entrenamiento_tarea_item_select on public.entrenamiento_tarea_item
  for select to authenticated
  using (exists (select 1 from public.entrenamiento_tarea t where t.id = entrenamiento_tarea_item.tarea_id));

drop policy if exists entrenamiento_partida_select on public.entrenamiento_partida;
create policy entrenamiento_partida_select on public.entrenamiento_partida
  for select to authenticated
  using (
    (origen = 'practica' and public.es_profesional_vinculado(nino_id))
    or (origen <> 'practica' and public.profesional_puede_ver_registro(nino_id, profesional_id))
  );


-- ---------------------------------------------------------------------
-- 7. La tabla heredada se reemplaza
-- ---------------------------------------------------------------------
drop table if exists public.entrenamientos;

commit;
