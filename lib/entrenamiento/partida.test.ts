import { describe, expect, it } from "vitest"

import { itemsDe } from "@/lib/entrenamiento/bancos"
import { JUEGOS } from "@/lib/entrenamiento/juegos"
import { JUEGOS_GENERADOS, armarPartida } from "@/lib/entrenamiento/partida"

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
