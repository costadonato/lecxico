import { describe, expect, it } from "vitest"

import { aplanarLee, resultadoLee, type HistoriaLee } from "@/lib/entrenamiento/lee"
import { iniciarRondas, reducirRondas, resultadoRondas, type AccionRonda } from "@/lib/entrenamiento/rondas"

const pregunta = (n: number) => ({ pregunta: `¿${n}?`, correcta: "sí", otras: ["no", "tal vez"] })
const historia = (id: string, n: number): HistoriaLee => ({
  id,
  titulo: id,
  parrafos: ["Había una vez."],
  preguntas: Array.from({ length: n }, (_, i) => pregunta(i + 1)),
})

describe("aplanarLee", () => {
  it("una pregunta por ronda, con su historia; la primera de cada historia va después de la lectura", () => {
    const items = aplanarLee([historia("LEE-2-03", 3), historia("LEE-2-05", 3)])
    expect(items.map((i) => i.id)).toEqual([
      "LEE-2-03-p1",
      "LEE-2-03-p2",
      "LEE-2-03-p3",
      "LEE-2-05-p1",
      "LEE-2-05-p2",
      "LEE-2-05-p3",
    ])
    expect(items.map((i) => i.esPrimera)).toEqual([true, false, false, true, false, false])
    expect(items.map((i) => i.numeroHistoria)).toEqual([1, 1, 1, 2, 2, 2])
    expect(items.every((i) => i.totalHistorias === 2)).toBe(true)
    expect(items[4].pregunta).toEqual(pregunta(2))
  })

  it("en el grado 3 son 4 preguntas por historia (8 rondas)", () => {
    expect(aplanarLee([historia("A", 4), historia("B", 4)])).toHaveLength(8)
  })
})

describe("resultadoLee", () => {
  it("suma a cada pregunta su historia y, en la primera, el tiempo de lectura", () => {
    const items = aplanarLee([historia("A", 2), historia("B", 2)])
    const acciones: AccionRonda[] = [
      { tipo: "responder", correcta: true },
      { tipo: "siguiente" },
      { tipo: "responder", correcta: false },
      { tipo: "responder", correcta: true },
      { tipo: "siguiente" },
      { tipo: "responder", correcta: true },
      { tipo: "siguiente" },
      { tipo: "responder", correcta: true },
      { tipo: "siguiente" },
    ]
    const fin = acciones.reduce(reducirRondas, iniciarRondas(items.map((i) => i.id)))
    const r = resultadoLee(resultadoRondas(fin), items, { A: 41234.6 })
    expect([r.correctas, r.total]).toEqual([3, 4])
    expect(r.detalle).toEqual([
      { item: "A-p1", correcta: true, intentos: 1, historia: "A", lecturaMs: 41235 },
      { item: "A-p2", correcta: false, intentos: 2, historia: "A" },
      // Sin tiempo registrado para B: la primera pregunta va sin lecturaMs.
      { item: "B-p1", correcta: true, intentos: 1, historia: "B" },
      { item: "B-p2", correcta: true, intentos: 1, historia: "B" },
    ])
  })
})
