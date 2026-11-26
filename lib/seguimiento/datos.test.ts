import type { SupabaseClient } from "@supabase/supabase-js"
import { describe, expect, it, vi } from "vitest"

import { FILAS_POR_PAGINA, cargarPartidasSeguimiento } from "@/lib/seguimiento/datos"

type Respuesta = { data: unknown[] | null; error: { message: string } | null }

/** Cliente falso: cada llamada a range() devuelve la siguiente respuesta. */
function cliente(respuestas: Respuesta[]) {
  const llamadas = { from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), range: vi.fn() }
  let i = 0
  const consulta = {
    select: (...a: unknown[]) => (llamadas.select(...a), consulta),
    eq: (...a: unknown[]) => (llamadas.eq(...a), consulta),
    order: (...a: unknown[]) => (llamadas.order(...a), consulta),
    range: (...a: unknown[]) => {
      llamadas.range(...a)
      return Promise.resolve(respuestas[i++] ?? { data: [], error: null })
    },
  }
  const supabase = { from: (...a: unknown[]) => (llamadas.from(...a), consulta) } as unknown as SupabaseClient
  return { supabase, llamadas }
}

const filas = (n: number, desde = 0) => Array.from({ length: n }, (_, k) => ({ juego: "rima", n: desde + k }))

describe("cargarPartidasSeguimiento", () => {
  it("pide las columnas del niño, ordenadas, y corta con una página incompleta", async () => {
    const { supabase, llamadas } = cliente([{ data: filas(3), error: null }])
    const partidas = await cargarPartidasSeguimiento(supabase, "n1")
    expect(partidas).toHaveLength(3)
    expect(llamadas.from).toHaveBeenCalledWith("entrenamiento_partida")
    expect(llamadas.select).toHaveBeenCalledWith(
      "juego, grado, origen, correctas, total, porcentaje, tiempo_ms, errores, created_at",
    )
    // Sin filtros propios: solo el niño (la RLS decide el resto).
    expect(llamadas.eq).toHaveBeenCalledTimes(1)
    expect(llamadas.eq).toHaveBeenCalledWith("nino_id", "n1")
    expect(llamadas.order).toHaveBeenNthCalledWith(1, "created_at", { ascending: false })
    expect(llamadas.range).toHaveBeenCalledTimes(1)
    expect(llamadas.range).toHaveBeenCalledWith(0, FILAS_POR_PAGINA - 1)
  })

  it("pagina de a 1000 hasta agotar", async () => {
    const { supabase, llamadas } = cliente([
      { data: filas(1000), error: null },
      { data: filas(1000, 1000), error: null },
      { data: filas(5, 2000), error: null },
    ])
    const partidas = await cargarPartidasSeguimiento(supabase, "n1")
    expect(partidas).toHaveLength(2005)
    expect(llamadas.range.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ])
  })

  it("con exactamente 1000 pide una página más, que viene vacía", async () => {
    const { supabase, llamadas } = cliente([{ data: filas(1000), error: null }, { data: null, error: null }])
    expect(await cargarPartidasSeguimiento(supabase, "n1")).toHaveLength(1000)
    expect(llamadas.range).toHaveBeenCalledTimes(2)
  })

  it("lanza el error de la consulta (o uno genérico sin mensaje)", async () => {
    await expect(cargarPartidasSeguimiento(cliente([{ data: null, error: { message: "falló" } }]).supabase, "n1")).rejects.toThrow(
      "falló",
    )
    await expect(cargarPartidasSeguimiento(cliente([{ data: null, error: { message: "" } }]).supabase, "n1")).rejects.toThrow(
      "No se pudieron cargar las partidas.",
    )
  })

  it("no queda en un bucle sin fin si la API respondiera siempre llena", async () => {
    const { supabase, llamadas } = cliente(Array.from({ length: 200 }, () => ({ data: filas(1000), error: null })))
    expect(await cargarPartidasSeguimiento(supabase, "n1")).toHaveLength(100_000)
    expect(llamadas.range).toHaveBeenCalledTimes(100)
  })
})
