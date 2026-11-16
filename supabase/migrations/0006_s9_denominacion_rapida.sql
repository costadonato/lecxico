-- =====================================================================
-- Lecxico · S9 — Denominación rápida: tiempo, errores y detalle por ejercicio
-- =====================================================================
--
-- Requiere la 0001 a la 0004 aplicadas. No depende de la 0005 (S8).
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos (ADD COLUMN IF
-- NOT EXISTS, DROP CONSTRAINT IF EXISTS + ADD, CREATE OR REPLACE y
-- REVOKE/GRANT).
--
-- Cambios:
--   1. test_bloque_resultado: columnas tiempo_ms, errores y detalle, todas
--      nullables (las evaluaciones anteriores no las tienen), con sus
--      constraints.
--   2. guardar_test(): misma firma (conserva los permisos); lee también
--      tiempo_ms, errores y detalle de cada bloque. En denominacion_rapida
--      los exige y verifica que correctas = total - errores; en cualquier
--      otro bloque los rechaza. Los mensajes dejan de decir "test".
--   3. Se repiten revoke/grant de guardar_test.
--
-- Formato nuevo de denominación rápida (definido con las especialistas):
-- el niño nombra una cuadrícula de letras, números y colores; el
-- profesional mide el tiempo y carga los errores. Cada bloque tiene 2
-- ejercicios (cuadrículas). En la fila del bloque:
--   total     = estímulos de las dos cuadrículas
--   errores   = suma de los errores de las dos cuadrículas
--   correctas = total - errores
--   tiempo_ms = suma de los tiempos de las dos cuadrículas
--   detalle   = [{ejercicio, tiempo_ms, errores, correctas, total}, ...]
-- Espejo en TypeScript: lib/test/denominacion.ts y lib/test/guardar-test.ts.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Columnas nuevas de test_bloque_resultado
-- ---------------------------------------------------------------------
alter table public.test_bloque_resultado
  add column if not exists tiempo_ms int,
  add column if not exists errores   int,
  add column if not exists detalle   jsonb;

comment on column public.test_bloque_resultado.tiempo_ms is
  'Solo denominacion_rapida (S9): tiempo total del bloque en milisegundos. Null en los demás bloques y en evaluaciones anteriores.';
comment on column public.test_bloque_resultado.errores is
  'Solo denominacion_rapida (S9): errores totales que cargó el profesional. correctas = total - errores.';
comment on column public.test_bloque_resultado.detalle is
  'Solo denominacion_rapida (S9): arreglo con tiempo_ms, errores, correctas y total de cada ejercicio.';

-- El tiempo, si está, es positivo.
alter table public.test_bloque_resultado
  drop constraint if exists test_bloque_resultado_tiempo_ms_check;
alter table public.test_bloque_resultado
  add constraint test_bloque_resultado_tiempo_ms_check
  check (tiempo_ms is null or tiempo_ms > 0);

-- Los errores, si están, van de 0 al total y definen las correctas.
alter table public.test_bloque_resultado
  drop constraint if exists test_bloque_resultado_errores_check;
alter table public.test_bloque_resultado
  add constraint test_bloque_resultado_errores_check
  check (errores is null or (errores >= 0 and errores <= total and correctas = total - errores));

-- Tiempo y errores van juntos: los dos o ninguno.
alter table public.test_bloque_resultado
  drop constraint if exists test_bloque_resultado_tiempo_errores_check;
alter table public.test_bloque_resultado
  add constraint test_bloque_resultado_tiempo_errores_check
  check ((tiempo_ms is null) = (errores is null));

-- El detalle, si está, es un arreglo JSON.
alter table public.test_bloque_resultado
  drop constraint if exists test_bloque_resultado_detalle_check;
alter table public.test_bloque_resultado
  add constraint test_bloque_resultado_detalle_check
  check (detalle is null or jsonb_typeof(detalle) = 'array');

-- Las tres columnas son null en cualquier bloque que no sea denominación rápida.
alter table public.test_bloque_resultado
  drop constraint if exists test_bloque_resultado_medicion_bloque_check;
alter table public.test_bloque_resultado
  add constraint test_bloque_resultado_medicion_bloque_check
  check (
    bloque_codigo = 'denominacion_rapida'
    or (tiempo_ms is null and errores is null and detalle is null)
  );


-- ---------------------------------------------------------------------
-- 2. guardar_test: única vía de escritura de test / test_bloque_resultado
-- ---------------------------------------------------------------------
-- Misma firma que en la 0001. p_bloques: array JSON de
--   {bloque_codigo, orden, correctas, total[, tiempo_ms, errores, detalle]}
-- (las tres últimas, solo en denominacion_rapida).
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
    raise exception 'Solo un profesional puede guardar una evaluación.';
  end if;

  if p_nino_id is null then
    raise exception 'Falta indicar el niño al que corresponde la evaluación.';
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
    raise exception 'El nivel de la evaluación (%) no corresponde a la etapa escolar del niño (%).',
      coalesce(p_nivel, 'sin nivel'), v_etapa;
  end if;

  if p_puntaje_total is null or p_puntaje_total < 0 then
    raise exception 'El puntaje total es inválido.';
  end if;

  if p_porcentaje_total is null or p_porcentaje_total not between 0 and 100 then
    raise exception 'El porcentaje total debe estar entre 0 y 100.';
  end if;

  if p_bloques is null or jsonb_typeof(p_bloques) <> 'array' or jsonb_array_length(p_bloques) = 0 then
    raise exception 'La evaluación debe incluir al menos un bloque de resultados.';
  end if;

  insert into public.test (nino_id, profesional_id, nivel, puntaje_total, porcentaje_total, conclusion)
  values (p_nino_id, v_uid, p_nivel, p_puntaje_total, p_porcentaje_total, p_conclusion)
  returning id into v_test_id;

  for v_bloque in
    select *
    from jsonb_to_recordset(p_bloques) as b(
      bloque_codigo text, orden int, correctas int, total int,
      tiempo_ms int, errores int, detalle jsonb
    )
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

    -- Un "detalle": null en el JSON llega como el jsonb 'null', no como NULL.
    if v_bloque.detalle is not null and jsonb_typeof(v_bloque.detalle) = 'null' then
      v_bloque.detalle := null;
    end if;

    if v_bloque.bloque_codigo = 'denominacion_rapida' then
      if v_bloque.tiempo_ms is null or v_bloque.errores is null then
        raise exception 'Faltan el tiempo o los errores de denominación rápida.';
      end if;

      if v_bloque.tiempo_ms <= 0 then
        raise exception 'El tiempo de denominación rápida debe ser mayor a 0.';
      end if;

      if v_bloque.errores not between 0 and v_bloque.total then
        raise exception 'Los errores de denominación rápida deben estar entre 0 y %.', v_bloque.total;
      end if;

      if v_bloque.correctas <> v_bloque.total - v_bloque.errores then
        raise exception 'En denominación rápida, las correctas deben ser el total menos los errores.';
      end if;

      if v_bloque.detalle is null or jsonb_typeof(v_bloque.detalle) <> 'array' then
        raise exception 'Falta el detalle por ejercicio de denominación rápida.';
      end if;
    elsif v_bloque.tiempo_ms is not null or v_bloque.errores is not null or v_bloque.detalle is not null then
      raise exception 'El bloque % no lleva tiempo, errores ni detalle.', v_bloque.bloque_codigo;
    end if;

    if exists (
      select 1 from public.test_bloque_resultado
      where test_id = v_test_id and bloque_codigo = v_bloque.bloque_codigo
    ) then
      raise exception 'El bloque % está repetido.', v_bloque.bloque_codigo;
    end if;

    insert into public.test_bloque_resultado
      (test_id, bloque_codigo, orden, correctas, total, tiempo_ms, errores, detalle)
    values
      (v_test_id, v_bloque.bloque_codigo, v_bloque.orden, v_bloque.correctas, v_bloque.total,
       v_bloque.tiempo_ms, v_bloque.errores, v_bloque.detalle);
  end loop;

  update public.ninos
  set ultima_prueba = now()
  where profile_id = p_nino_id;

  return v_test_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. Permisos (create or replace los conserva; se repiten por las dudas)
-- ---------------------------------------------------------------------
revoke all on function public.guardar_test(uuid, text, int, int, text, jsonb) from public, anon;
grant execute on function public.guardar_test(uuid, text, int, int, text, jsonb) to authenticated;

commit;
