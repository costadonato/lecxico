-- =====================================================================
-- Lecxico · S10 — Perfil del niño sin resultados
-- =====================================================================
--
-- Requiere la 0001 a la 0006 aplicadas (parte de las políticas de la 0005).
--
-- Cómo correrla: pegar el archivo completo en el SQL Editor de Supabase
-- y ejecutarlo. Está envuelta en BEGIN/COMMIT: si algo falla, no queda
-- nada a medias.
--
-- Idempotencia: se puede volver a correr sin perder datos (DROP POLICY
-- IF EXISTS + CREATE POLICY).
--
-- Por qué: según la propuesta V8 (tabla 5), la cuenta del niño la
-- comparten el niño y su tutor, y el perfil del niño no muestra
-- resultados de evaluaciones. Solo el profesional con vínculo activo ve
-- las evaluaciones y su desglose. El tutor va a recibir esa información
-- con un informe a pedido (S17). Sacarlo solo de la interfaz no alcanza:
-- con la sesión del niño se podía consultar test y test_bloque_resultado
-- directamente.
--
-- Cambios:
--   1. test_select: se saca la cláusula nino_id = auth.uid(). Queda solo
--      profesional_puede_ver_registro(nino_id, profesional_id) (0005).
--   2. test_bloque_resultado_select: lo mismo sobre el test del bloque.
--
-- Funciones SECURITY DEFINER revisadas: ninguna le devuelve al niño
-- resultados de evaluaciones. ninos_para_test() exige que el usuario sea
-- un profesional con vínculo activo; guardar_test() solo la ejecuta un
-- profesional y devuelve el id; profesional_puede_ver_registro() da
-- false para la sesión del niño (no es profesional de ningún vínculo).
-- El niño sigue leyendo ninos.ultima_prueba (solo la fecha de la última
-- evaluación, sin resultados).
--
-- No se toca entrenamientos: la tabla se reemplaza en S12 (0008), que
-- aplica la misma regla. Hasta entonces el niño la puede leer.
-- =====================================================================

begin;


-- ---------------------------------------------------------------------
-- 1. test_select (reemplaza la versión de la 0005)
-- ---------------------------------------------------------------------
-- Lee una evaluación solo el profesional con vínculo ACTIVO con el niño:
-- las que tomó él, o las de todos si el tutor compartió el historial.
-- El niño (y su tutor, que usa la misma cuenta) no lee ninguna, ni las
-- suyas. Sin políticas para anon: una sesión anónima no ve nada.
drop policy if exists test_select on public.test;
create policy test_select on public.test
  for select to authenticated
  using (
    public.profesional_puede_ver_registro(nino_id, profesional_id)
  );


-- ---------------------------------------------------------------------
-- 2. test_bloque_resultado_select (reemplaza la versión de la 0005)
-- ---------------------------------------------------------------------
-- Un bloque se ve si se puede ver su evaluación, con la misma regla.
drop policy if exists test_bloque_resultado_select on public.test_bloque_resultado;
create policy test_bloque_resultado_select on public.test_bloque_resultado
  for select to authenticated
  using (
    exists (
      select 1
      from public.test t
      where t.id = test_bloque_resultado.test_id
        and public.profesional_puede_ver_registro(t.nino_id, t.profesional_id)
    )
  );

commit;
