import { describe, expect, it } from "vitest"

import { iniciarRondas, reducirRondas, resultadoRondas } from "@/lib/entrenamiento/rondas"
import { puntajeSeleccion, resultadoSeleccion, seleccionPerfecta } from "@/lib/entrenamiento/seleccion"

describe("puntajeSeleccion", () => {
  it("todo encontrado y nada de más: perfecta", () => {
    const p = puntajeSeleccion({ objetivos: [2, 5], marcados: [5, 2] })
    expect(p).toEqual({ encontrados: 2, equivocados: 0, omitidos: 0, correctas: 2, total: 2 })
    expect(seleccionPerfecta(p)).toBe(true)
  })

  it("marcar todo no da 100 %: cada marca equivocada suma al total", () => {
    const p = puntajeSeleccion({ objetivos: [1], marcados: [0, 1, 2, 3, 4] })
    expect(p).toEqual({ encontrados: 1, equivocados: 4, omitidos: 0, correctas: 1, total: 5 })
    expect(seleccionPerfecta(p)).toBe(false)
  })

  it("sin marcar nada: 0 encontradas", () => {
    const p = puntajeSeleccion({ objetivos: [3, 4], marcados: [] })
    expect(p).toEqual({ encontrados: 0, equivocados: 0, omitidos: 2, correctas: 0, total: 2 })
    expect(seleccionPerfecta(p)).toBe(false)
  })

  it("se identifica por índice: dos palabras iguales son distintas", () => {
    // "el" en 0 y en 4; solo la de 4 es objetivo.
    expect(puntajeSeleccion({ objetivos: [4], marcados: [0] })).toMatchObject({ encontrados: 0, equivocados: 1, omitidos: 1 })
  })

  it("los repetidos no cuentan dos veces", () => {
    expect(puntajeSeleccion({ objetivos: [1, 1], marcados: [1, 1] }).total).toBe(1)
  })
})

describe("resultadoSeleccion", () => {
  it("suma los puntajes de cada ronda (no las rondas perfectas) y guarda lo marcado", () => {
    let e = iniciarRondas(["a", "b"])
    e = reducirRondas(e, { tipo: "resolver", correcta: true })
    e = reducirRondas(e, { tipo: "siguiente" })
    e = reducirRondas(e, { tipo: "resolver", correcta: false })
    e = reducirRondas(e, { tipo: "siguiente" })
    const r = resultadoSeleccion(resultadoRondas(e), [
      { marcados: [3], puntaje: puntajeSeleccion({ objetivos: [3], marcados: [3] }) },
      { marcados: [5, 1], puntaje: puntajeSeleccion({ objetivos: [1, 2], marcados: [5, 1] }) },
    ])
    expect(r.correctas).toBe(2) // 1 + 1
    expect(r.total).toBe(4) // 1 + (2 objetivos + 1 equivocado)
    expect(r.detalle).toEqual([
      { item: "a", correcta: true, intentos: 1, marcados: [3], encontrados: 1, equivocados: 0, omitidos: 0 },
      { item: "b", correcta: false, intentos: 1, marcados: [1, 5], encontrados: 1, equivocados: 1, omitidos: 1 },
    ])
  })

  it("una ronda sin selección registrada queda vacía", () => {
    let e = iniciarRondas(["a"])
    e = reducirRondas(e, { tipo: "resolver", correcta: false })
    const r = resultadoSeleccion(resultadoRondas(e), [])
    expect(r.detalle[0]).toMatchObject({ marcados: [], encontrados: 0 })
    expect([r.correctas, r.total]).toEqual([0, 0])
  })
})
