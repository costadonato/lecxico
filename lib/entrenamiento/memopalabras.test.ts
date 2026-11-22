import { describe, expect, it } from "vitest"

import type { Grado } from "@/lib/entrenamiento/juegos"
import {
  REGLAS_MEMOPALABRAS,
  bancoMemopalabras,
  conLectura,
  generarMemopalabras,
  objetivosMemopalabras,
} from "@/lib/entrenamiento/memopalabras"

const GRADOS: Grado[] = [1, 2, 3]
const SEMILLAS = Array.from({ length: 80 }, (_, i) => i + 1)

function semilla(n: number) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe("banco de Memopalabras", () => {
  it("20, 26 y 20 ítems; parecida null en el grado 1 y distinta de la palabra en los otros", () => {
    expect(GRADOS.map((g) => bancoMemopalabras(g).length)).toEqual([20, 26, 20])
    for (const p of bancoMemopalabras(1)) expect(p.parecida).toBeNull()
    for (const g of [2, 3] as const) {
      for (const p of bancoMemopalabras(g)) {
        expect(p.parecida, p.id).toBeTruthy()
        expect(p.parecida, p.id).not.toBe(p.palabra)
      }
    }
  })

  it("el grado 2 suma los 6 ítems nuevos, que comparten la primera sílaba", () => {
    const nuevos = bancoMemopalabras(2).slice(-6)
    expect(nuevos.map((p) => p.id)).toEqual(["MPA-2-21", "MPA-2-22", "MPA-2-23", "MPA-2-24", "MPA-2-25", "MPA-2-26"])
    for (const p of nuevos) expect(p.parecida!.slice(0, 3), p.id).toBe(p.palabra.slice(0, 3))
  })

  it("ninguna parecida es una palabra del grado (así no choca con una palabra para leer)", () => {
    for (const g of GRADOS) {
      const palabras = new Set(bancoMemopalabras(g).map((p) => p.palabra))
      for (const p of bancoMemopalabras(g)) if (p.parecida) expect(palabras.has(p.parecida), p.id).toBe(false)
    }
  })

  it("los ids no se repiten", () => {
    const ids = GRADOS.flatMap((g) => bancoMemopalabras(g).map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("generarMemopalabras", () => {
  for (const grado of GRADOS) {
    it(`grado ${grado}: tamaños, sin repetidos y distractores del grado`, () => {
      const { conjuntos, leer } = REGLAS_MEMOPALABRAS[grado]
      const banco = bancoMemopalabras(grado)
      const parecidaDe = new Map(banco.map((p) => [p.palabra, p.parecida]))
      for (const s of SEMILLAS) {
        const items = generarMemopalabras(grado, semilla(s))
        expect(items, `semilla ${s}`).toHaveLength(conjuntos)
        const todasLeidas = items.flatMap((i) => i.leer)
        expect(new Set(todasLeidas).size).toBe(todasLeidas.length) // no se repiten en la partida
        const vistas = new Set<string>()
        for (const item of items) {
          expect(item.leer).toHaveLength(leer)
          expect(item.distractores).toHaveLength(leer)
          expect(item.panel).toHaveLength(2 * leer)
          expect(new Set(item.panel).size).toBe(item.panel.length)
          expect(item.id).toBe(`MPA-${grado}-${item.leer.join("-")}`)
          for (const d of item.distractores) expect(item.leer).not.toContain(d)
          if (grado === 1) {
            // Otras palabras del grado 1; primero las que todavía no aparecieron.
            for (const d of item.distractores) expect(parecidaDe.has(d)).toBe(true)
            const nuevasDisponibles = banco.filter((p) => !item.leer.includes(p.palabra) && !vistas.has(p.palabra)).length
            const nuevasUsadas = item.distractores.filter((d) => !vistas.has(d)).length
            expect(nuevasUsadas).toBe(Math.min(leer, nuevasDisponibles))
          } else {
            expect(item.distractores).toEqual(item.leer.map((p) => parecidaDe.get(p)))
          }
          for (const p of item.panel) vistas.add(p)
        }
      }
    })
  }

  it("objetivos: los índices del panel que son palabras para leer", () => {
    expect(objetivosMemopalabras({ leer: ["lobo", "nido"], panel: ["rosa", "nido", "lobo", "dedo"] })).toEqual([1, 2])
  })

  it("funciona con el azar por defecto", () => {
    expect(generarMemopalabras(3)).toHaveLength(4)
  })

  it("un grado sin banco no arma la partida", () => {
    expect(generarMemopalabras(4 as Grado)).toEqual([])
  })
})

describe("conLectura", () => {
  it("agrega el tiempo de lectura redondeado a cada conjunto que lo tiene", () => {
    expect(conLectura([{ item: "a" }, { item: "b" }], [1234.4])).toEqual([{ item: "a", lecturaMs: 1234 }, { item: "b" }])
  })
})
