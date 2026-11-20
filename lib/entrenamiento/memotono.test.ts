import { describe, expect, it } from "vitest"

import { tieneDibujo } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import {
  COLORES_MEMOTONO,
  PAUSA_MEMOTONO_MS,
  REGLAS_MEMOTONO,
  SECUENCIAS_POR_PARTIDA,
  generarMemotono,
  palabrasMemotono,
  secuenciaCorrecta,
} from "@/lib/entrenamiento/memotono"
import { COLORES_ESTIMULO } from "@/lib/test/denominacion-config"

const NIVELES: Nivel[] = ["inicial", "primario"]
const GRADOS: Grado[] = [1, 2, 3]
const SEMILLAS = Array.from({ length: 60 }, (_, i) => i + 1)

function semilla(n: number) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe("banco de Memotono", () => {
  it("cada nivel tiene palabras con dibujo y sus parecidas también son del nivel", () => {
    for (const nivel of NIVELES) {
      const lista = palabrasMemotono(nivel)
      expect(lista.length, nivel).toBeGreaterThan(20)
      const palabras = new Set(lista.map((p) => p.palabra))
      for (const p of lista) for (const q of p.parecidas) expect(palabras.has(q), `${nivel}: ${p.palabra} → ${q}`).toBe(true)
    }
  })

  it("los colores son los de la evaluación", () => {
    for (const c of COLORES_MEMOTONO) expect(Object.keys(COLORES_ESTIMULO)).toContain(c)
  })

  it("pausa de 900 ms en inicial y 700 ms en primario", () => {
    expect(PAUSA_MEMOTONO_MS).toEqual({ inicial: 900, primario: 700 })
  })
})

describe("generarMemotono", () => {
  for (const nivel of NIVELES) {
    for (const grado of GRADOS) {
      it(`${nivel}, grado ${grado}: reglas de la tabla con muchas semillas`, () => {
        const regla = REGLAS_MEMOTONO[grado]
        const lista = palabrasMemotono(nivel)
        const info = new Map(lista.map((p) => [p.palabra, p]))
        const parecen = (a: string, b: string) =>
          Boolean(info.get(a)?.parecidas.includes(b) || info.get(b)?.parecidas.includes(a))

        for (const s of SEMILLAS) {
          const items = generarMemotono(nivel, grado, semilla(s))
          expect(items, `semilla ${s}`).toHaveLength(SECUENCIAS_POR_PARTIDA)
          // No repite la misma secuencia dentro de la partida (los ids tampoco).
          expect(new Set(items.map((i) => i.id)).size).toBe(items.length)

          items.forEach((item, i) => {
            const esColor = nivel === "inicial" && grado === 1 && i % 2 === 1
            expect(item.tipo).toBe(esColor ? "colores" : "dibujos")
            expect(item.id).toBe(`MEM-${item.secuencia.join("-")}`)
            expect(item.reproducciones).toBe(regla.reproducciones)
            expect(item.secuencia).toHaveLength(regla.largo[nivel])
            // Sin palabras repetidas en el panel.
            expect(new Set(item.panel).size).toBe(item.panel.length)
            expect(item.panel).toHaveLength(regla.largo[nivel] + regla.distractores)
            for (const p of item.secuencia) expect(item.panel).toContain(p)
            const distractores = item.panel.filter((p) => !item.secuencia.includes(p))
            expect(distractores).toHaveLength(regla.distractores)

            if (item.tipo === "colores") {
              for (const p of item.panel) expect(COLORES_MEMOTONO).toContain(p)
              return
            }
            // Todo con dibujo, sin colores ni números.
            for (const p of item.panel) expect(tieneDibujo(p), p).toBe(true)
            for (const p of item.panel) expect(COLORES_MEMOTONO).not.toContain(p)
            // Sílabas en primario.
            if (nivel === "primario") {
              for (const p of item.secuencia) expect(regla.silabasPrimario).toContain(info.get(p)!.silabas)
            }
            // No junta palabras parecidas entre sí.
            for (const a of item.secuencia) for (const b of item.secuencia) if (a !== b) expect(parecen(a, b), `${a}/${b}`).toBe(false)
            // Cantidad y tipo de distractores parecidos.
            const parecidos = distractores.filter((d) => item.secuencia.some((p) => parecen(p, d))).length
            const esperados = regla.parecidos === "ninguno" ? 0 : regla.parecidos === "uno" ? 1 : regla.distractores
            expect(parecidos, item.id).toBe(esperados)
          })
        }
      })
    }
  }

  it("inicial, grado 1: 3 secuencias de dibujos y 3 de colores", () => {
    const items = generarMemotono("inicial", 1, semilla(7))
    expect(items.filter((i) => i.tipo === "colores")).toHaveLength(3)
    expect(items.filter((i) => i.tipo === "dibujos")).toHaveLength(3)
    // En los otros grados y en primario, solo dibujos.
    expect(generarMemotono("inicial", 2, semilla(7)).every((i) => i.tipo === "dibujos")).toBe(true)
    expect(generarMemotono("primario", 1, semilla(7)).every((i) => i.tipo === "dibujos")).toBe(true)
  })

  it("si no logra secuencias nuevas, devuelve una lista vacía", () => {
    // Con un azar fijo todas las mezclas salen iguales: la segunda secuencia repetiría la primera.
    expect(generarMemotono("primario", 2, () => 0)).toEqual([])
    expect(generarMemotono("inicial", 1, () => 0)).toEqual([])
  })

  it("funciona con el azar por defecto", () => {
    expect(generarMemotono("primario", 3)).toHaveLength(SECUENCIAS_POR_PARTIDA)
  })
})

describe("secuenciaCorrecta", () => {
  const item = { secuencia: ["bota", "mono", "ojo"] }
  it("completa y en orden", () => {
    expect(secuenciaCorrecta(item, ["bota", "mono", "ojo"])).toBe(true)
  })
  it("en otro orden o incompleta, no", () => {
    expect(secuenciaCorrecta(item, ["mono", "bota", "ojo"])).toBe(false)
    expect(secuenciaCorrecta(item, ["bota", "mono"])).toBe(false)
    expect(secuenciaCorrecta(item, ["bota", "mono", "ojo", "oso"])).toBe(false)
  })
})
