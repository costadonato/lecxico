import type { SupabaseClient } from "@supabase/supabase-js"
import { describe, expect, it, vi } from "vitest"

import { cargarNombresProfesionales, cargarTareasInforme } from "@/lib/informes/datos"

type Respuesta = { data: unknown[] | null; error: { message: string } | null }

/** Cliente falso: la consulta termina en order() o in() y devuelve `respuesta`. */
function cliente(respuesta: Respuesta) {
  const llamadas = { from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), in: vi.fn() }
  const fin = (nombre: "order" | "in") => (...a: unknown[]) => {
    llamadas[nombre](...a)
    return Promise.resolve(respuesta)
  }
  const consulta = {
    select: (...a: unknown[]) => (llamadas.select(...a), consulta),
    eq: (...a: unknown[]) => (llamadas.eq(...a), consulta),
    order: fin("order"),
    in: fin("in"),
  }
  const supabase = { from: (...a: unknown[]) => (llamadas.from(...a), consulta) } as unknown as SupabaseClient
  return { supabase, llamadas }
}

describe("cargarTareasInforme", () => {
  it("pide las tareas del niño con sus ítems y las aplana", async () => {
    const { supabase, llamadas } = cliente({
      data: [
        { id: "t1", nombre: "A", estado: "hecha", entrenamiento_tarea_item: [{ orden: 1, juego: "rima", grado: 2 }] },
        { id: "t2", nombre: null, estado: "pendiente", entrenamiento_tarea_item: null },
      ],
      error: null,
    })
    const tareas = await cargarTareasInforme(supabase, "n1")
    expect(llamadas.from).toHaveBeenCalledWith("entrenamiento_tarea")
    expect(llamadas.eq).toHaveBeenCalledWith("nino_id", "n1")
    expect(String(llamadas.select.mock.calls[0][0])).toContain("entrenamiento_tarea_item (orden, juego, grado)")
    expect(tareas).toEqual([
      { id: "t1", nombre: "A", estado: "hecha", items: [{ orden: 1, juego: "rima", grado: 2 }] },
      { id: "t2", nombre: null, estado: "pendiente", items: [] },
    ])
  })

  it("lanza el error de la base, o uno genérico", async () => {
    await expect(cargarTareasInforme(cliente({ data: null, error: { message: "x" } }).supabase, "n")).rejects.toThrow("x")
    await expect(cargarTareasInforme(cliente({ data: null, error: { message: "" } }).supabase, "n")).rejects.toThrow(
      "No se pudieron cargar las tareas.",
    )
  })

  it("sin datos, lista vacía", async () => {
    expect(await cargarTareasInforme(cliente({ data: null, error: null }).supabase, "n")).toEqual([])
  })
})

describe("cargarNombresProfesionales", () => {
  it("solo los profesionales que la RLS deja leer, sin repetir ids", async () => {
    const { supabase, llamadas } = cliente({
      data: [
        { id: "p1", nombre: "Laura", apellido: "Gómez", rol: "profesional" },
        { id: "n1", nombre: "Niño", apellido: "X", rol: "nino" },
      ],
      error: null,
    })
    expect(await cargarNombresProfesionales(supabase, ["p1", "p1", "p2"])).toEqual({ p1: "Laura Gómez" })
    expect(llamadas.in).toHaveBeenCalledWith("id", ["p1", "p2"])
  })

  it("sin ids no consulta", async () => {
    const { supabase, llamadas } = cliente({ data: [], error: null })
    expect(await cargarNombresProfesionales(supabase, [])).toEqual({})
    expect(llamadas.from).not.toHaveBeenCalled()
  })

  it("lanza si falla y tolera data null", async () => {
    await expect(cargarNombresProfesionales(cliente({ data: null, error: { message: "y" } }).supabase, ["p"])).rejects.toThrow("y")
    expect(await cargarNombresProfesionales(cliente({ data: null, error: null }).supabase, ["p"])).toEqual({})
  })
})
