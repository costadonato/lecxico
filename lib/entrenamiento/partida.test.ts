import { describe, expect, it } from "vitest"

import { itemsDe } from "@/lib/entrenamiento/bancos"
import { JUEGOS } from "@/lib/entrenamiento/juegos"
import { JUEGOS_GENERADOS, armarPartida } from "@/lib/entrenamiento/partida"
import type { ItemLee } from "@/lib/entrenamiento/lee"

function semilla(n: number) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe("armarPartida", () => {
  it("los juegos con banco toman los ítems de la partida del banco del grado", () => {
    const items = armarPartida("rompe", "primario", 3, semilla(1))
    expect(items).toHaveLength(JUEGOS.rompe.niveles.primario!.partida[3])
    const ids = new Set(itemsDe("rompe", "primario", 3).map((i) => i.id))
    for (const i of items) expect(ids.has(i.id)).toBe(true)
    expect(armarPartida("planeta", "primario", 1, semilla(1))).toHaveLength(8)
    expect(armarPartida("detective", "inicial", 2)).toHaveLength(8)
  })

  it("Memotono, Nombrá rápido y ¡Rápido, tocalo! generan su contenido", () => {
    expect(JUEGOS_GENERADOS).toEqual(["memotono", "nombra", "tocalo"])
    expect(armarPartida("memotono", "inicial", 1, semilla(2))[0].id).toMatch(/^MEM-/)
    expect(armarPartida("nombra", "primario", 2, semilla(2)).map((i) => i.id)).toEqual([
      "NOM-primario-2-1",
      "NOM-primario-2-2",
    ])
    expect(armarPartida("tocalo", "inicial", 3, semilla(2))).toHaveLength(12)
  })

  it("un juego que no es del nivel, o sin banco, devuelve una lista vacía", () => {
    expect(armarPartida("rompe", "inicial", 1)).toEqual([])
    expect(armarPartida("palmas", "primario", 1)).toEqual([])
  })
})

describe("armarPartida: Leé y descubrí", () => {
  it("toma 2 historias distintas y las aplana en preguntas", () => {
    for (const grado of [1, 2, 3] as const) {
      const items = armarPartida("lee", "primario", grado, semilla(grado)) as ItemLee[]
      const historias = [...new Set(items.map((i) => i.historia.id))]
      expect(historias).toHaveLength(2)
      expect(items).toHaveLength(grado === 3 ? 8 : 6)
      expect(items.filter((i) => i.esPrimera).map((i) => i.historia.id)).toEqual(historias)
      expect(items.map((i) => i.numeroHistoria)).toEqual(items.map((i) => (i.historia.id === historias[0] ? 1 : 2)))
      expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
    }
  })
})
