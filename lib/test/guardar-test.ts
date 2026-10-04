import { createClient } from "@/lib/supabase/client"
import type { BloqueCodigo, Nivel } from "@/lib/test/bloques"
import type { ConclusionTest } from "@/lib/types/database"

export interface ResultadoBloque {
  bloqueCodigo: BloqueCodigo
  orden: number
  correctas: number
  total: number
}

export interface GuardarTestInput {
  ninoId: string
  nivel: Nivel
  bloques: ResultadoBloque[]
  puntajeTotal: number
  porcentajeTotal: number
  conclusion: ConclusionTest
}

/**
 * Guarda un test completo (cabecera + una fila por bloque) mediante la RPC
 * guardar_test. Los bloques sin preguntas (total = 0) no se envían.
 * Devuelve el id del test; si Supabase responde con error, lo lanza.
 */
export async function guardarTest(input: GuardarTestInput): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("guardar_test", {
    p_nino_id: input.ninoId,
    p_nivel: input.nivel,
    p_puntaje_total: input.puntajeTotal,
    p_porcentaje_total: input.porcentajeTotal,
    p_conclusion: input.conclusion,
    p_bloques: input.bloques
      .filter((b) => b.total > 0)
      .map((b) => ({
        bloque_codigo: b.bloqueCodigo,
        orden: b.orden,
        correctas: b.correctas,
        total: b.total,
      })),
  })

  if (error) throw error
  return data as string
}
