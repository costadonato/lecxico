import { describe, expect, it } from "vitest"

import {
  aciertoEnReintento,
  iniciarRondas,
  reducirRondas,
  resultadoRondas,
  type AccionRonda,
  type EstadoRondas,
} from "@/lib/entrenamiento/rondas"

const BIEN: AccionRonda = { tipo: "responder", correcta: true }
const MAL: AccionRonda = { tipo: "responder", correcta: false }
const SIGUIENTE: AccionRonda = { tipo: "siguiente" }

const jugar = (estado: EstadoRondas, ...acciones: AccionRonda[]) => acciones.reduce(reducirRondas, estado)

describe("iniciarRondas", () => {
  it("arranca esperando la primera ronda", () => {
    const e = iniciarRondas(["a", "b"])
    expect(e).toEqual({ items: ["a", "b"], actual: 0, fase: "esperando", detalle: [] })
  })

  it("sin ítems queda terminada", () => {
    expect(iniciarRondas([]).fase).toBe("terminada")
  })

  it("copia la lista de ítems", () => {
    const items = ["a"]
    const e = iniciarRondas(items)
    items.push("b")
    expect(e.items).toEqual(["a"])
  })
})

describe("primer intento", () => {
  it("correcto: la ronda cuenta como correcta, con 1 intento", () => {
    const e = jugar(iniciarRondas(["a", "b"]), BIEN)
    expect(e.fase).toBe("acierto")
    expect(e.detalle).toEqual([{ item: "a", correcta: true, intentos: 1 }])
    expect(aciertoEnReintento(e)).toBe(false)
  })

  it("incorrecto: avisa y permite reintentar, sin registrar todavía la ronda", () => {
    const e = jugar(iniciarRondas(["a", "b"]), MAL)
    expect(e.fase).toBe("reintento")
    expect(e.detalle).toEqual([])
    expect(e.actual).toBe(0)
  })
})

describe("reintento", () => {
  it("si acierta, la ronda cuenta como error con 2 intentos", () => {
    const e = jugar(iniciarRondas(["a", "b"]), MAL, BIEN)
    expect(e.fase).toBe("acierto")
    expect(e.detalle).toEqual([{ item: "a", correcta: false, intentos: 2 }])
    expect(aciertoEnReintento(e)).toBe(true)
  })

  it("si vuelve a fallar, se muestra la respuesta y cuenta como error", () => {
    const e = jugar(iniciarRondas(["a", "b"]), MAL, MAL)
    expect(e.fase).toBe("respuesta")
    expect(e.detalle).toEqual([{ item: "a", correcta: false, intentos: 2 }])
    expect(aciertoEnReintento(e)).toBe(false)
  })

  it("permite un solo reintento: un tercer toque se ignora", () => {
    const e = jugar(iniciarRondas(["a", "b"]), MAL, MAL, BIEN)
    expect(e.fase).toBe("respuesta")
    expect(e.detalle).toHaveLength(1)
  })
})

describe("siguiente", () => {
  it("después de un acierto pasa a la ronda siguiente", () => {
    const e = jugar(iniciarRondas(["a", "b"]), BIEN, SIGUIENTE)
    expect(e.actual).toBe(1)
    expect(e.fase).toBe("esperando")
  })

  it("después de mostrar la respuesta también pasa de ronda", () => {
    const e = jugar(iniciarRondas(["a", "b"]), MAL, MAL, SIGUIENTE)
    expect(e.actual).toBe(1)
    expect(e.fase).toBe("esperando")
  })

  it("se ignora mientras la ronda no está resuelta", () => {
    const inicio = iniciarRondas(["a", "b"])
    expect(reducirRondas(inicio, SIGUIENTE)).toBe(inicio)
    const reintento = jugar(inicio, MAL)
    expect(reducirRondas(reintento, SIGUIENTE)).toBe(reintento)
  })

  it("después de la última ronda la partida queda terminada", () => {
    const e = jugar(iniciarRondas(["a"]), BIEN, SIGUIENTE)
    expect(e.fase).toBe("terminada")
    expect(e.actual).toBe(1)
  })

  it("una partida terminada ignora todo", () => {
    const fin = jugar(iniciarRondas(["a"]), BIEN, SIGUIENTE)
    expect(reducirRondas(fin, BIEN)).toBe(fin)
    expect(reducirRondas(fin, SIGUIENTE)).toBe(fin)
  })
})

describe("doble toque", () => {
  it("una respuesta sobre una ronda ya resuelta se ignora", () => {
    const acierto = jugar(iniciarRondas(["a", "b"]), BIEN)
    expect(reducirRondas(acierto, MAL)).toBe(acierto)
  })
})

describe("resultadoRondas", () => {
  it("suma las correctas, el total y el detalle de una partida completa", () => {
    const fin = jugar(
      iniciarRondas(["a", "b", "c", "d"]),
      BIEN, SIGUIENTE, // a: correcta
      MAL, BIEN, SIGUIENTE, // b: error (acertó en el reintento)
      MAL, MAL, SIGUIENTE, // c: error (se mostró la respuesta)
      BIEN, SIGUIENTE, // d: correcta
    )
    expect(fin.fase).toBe("terminada")
    expect(resultadoRondas(fin)).toEqual({
      correctas: 2,
      total: 4,
      detalle: [
        { item: "a", correcta: true, intentos: 1 },
        { item: "b", correcta: false, intentos: 2 },
        { item: "c", correcta: false, intentos: 2 },
        { item: "d", correcta: true, intentos: 1 },
      ],
    })
  })

  it("con 7 de 8 llega al 80 % (desbloquea)", () => {
    const acciones: AccionRonda[] = [MAL, MAL, SIGUIENTE]
    for (let i = 0; i < 7; i++) acciones.push(BIEN, SIGUIENTE)
    const fin = jugar(iniciarRondas(["1", "2", "3", "4", "5", "6", "7", "8"]), ...acciones)
    const r = resultadoRondas(fin)
    expect([r.correctas, r.total]).toEqual([7, 8])
  })
})
