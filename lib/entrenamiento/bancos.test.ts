import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import {
  PALABRAS_SIN_DIBUJO,
  VERSION_BANCOS,
  elegirPartida,
  itemsCrudos,
  itemsDe,
  mezclar,
  palabrasConDibujo,
  rutaDibujo,
  rutaEmoji,
  rutasDeImagenes,
  tieneDibujo,
  usaDibujos,
  type ItemPlaneta,
  type ItemRompe,
} from "@/lib/entrenamiento/bancos"
import { JUEGOS, type Grado, type Nivel } from "@/lib/entrenamiento/juegos"

const GRADOS: Grado[] = [1, 2, 3]

/** Generador determinista para las pruebas (congruencial lineal). */
function semilla(n: number) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe("dibujos", () => {
  it("cada palabra con dibujo y cada emoji tiene su archivo en public/", () => {
    const faltan = rutasDeImagenes().filter((r) => !existsSync(join(process.cwd(), "public", r)))
    expect(faltan).toEqual([])
  })

  it("tieneDibujo y rutaDibujo", () => {
    expect(tieneDibujo("vaca")).toBe(true)
    expect(rutaDibujo("vaca")).toMatch(/^\/emoji\/.+\.webp$/)
    expect(tieneDibujo("capa")).toBe(false)
    expect(rutaDibujo("capa")).toBeNull()
    // No confunde propiedades del objeto con palabras.
    expect(tieneDibujo("toString")).toBe(false)
  })

  it("las palabras de a_generar no tienen dibujo", () => {
    expect(PALABRAS_SIN_DIBUJO.length).toBeGreaterThan(0)
    for (const p of PALABRAS_SIN_DIBUJO) expect(tieneDibujo(p), p).toBe(false)
  })

  it("rutaEmoji encuentra el emoji con o sin selector de variante", () => {
    expect(rutaEmoji("🥁")).toMatch(/\.webp$/)
    expect(rutaEmoji("🌧️")).toBe(rutaEmoji("🌧"))
    expect(rutaEmoji("no-es-emoji")).toBeNull()
  })

  it("el icono de cada uno de los 14 juegos tiene su dibujo de Fluent (nunca el emoji del sistema)", () => {
    const juegos = Object.values(JUEGOS)
    expect(juegos).toHaveLength(14)
    const sinDibujo = juegos.filter((j) => rutaEmoji(j.icono) === null).map((j) => `${j.codigo} ${j.icono}`)
    expect(sinDibujo).toEqual([])
    for (const j of juegos) expect(existsSync(join(process.cwd(), "public", rutaEmoji(j.icono)!)), j.codigo).toBe(true)
  })

  it("tiene versión", () => {
    expect(VERSION_BANCOS).toMatch(/\d{4}-\d{2}-\d{2}/)
  })
})

describe("itemsDe", () => {
  it("descarta los ítems que usan una palabra sin dibujo", () => {
    for (const nivel of ["inicial", "primario"] as Nivel[]) {
      for (const g of GRADOS) {
        const crudos = itemsCrudos("detective", nivel, g)
        const jugables = itemsDe("detective", nivel, g)
        for (const i of jugables) {
          expect([i.palabra, ...i.distractores].every(tieneDibujo), i.id).toBe(true)
        }
        const descartados = crudos.filter((c) => !jugables.some((j) => j.id === c.id))
        for (const d of descartados) {
          const palabras = [d.palabra as string, ...(d.distractores as string[])]
          expect(palabras.some((p) => !tieneDibujo(p)), d.id as string).toBe(true)
        }
      }
    }
  })

  it("en Rima de primario (palabras escritas) no descarta nada", () => {
    expect(usaDibujos("rima", "primario")).toBe(false)
    expect(itemsDe("rima", "primario", 1)).toEqual(itemsCrudos("rima", "primario", 1))
  })

  it("Detective, Rima de inicial y Palmas usan dibujos", () => {
    expect(usaDibujos("detective", "inicial")).toBe(true)
    expect(usaDibujos("detective", "primario")).toBe(true)
    expect(usaDibujos("rima", "inicial")).toBe(true)
    expect(usaDibujos("palmas", "inicial")).toBe(true)
  })

  it("un juego sin banco por grado devuelve una lista vacía", () => {
    expect(itemsDe("nombra", "inicial", 1)).toEqual([])
    expect(itemsDe("palmas", "primario", 1)).toEqual([])
  })

  /** Grados que no llegan a una partida, contando solo los ítems con dibujo. */
  function gradosIncompletos(contarPendientes: boolean): string[] {
    const pendientes = new Set(PALABRAS_SIN_DIBUJO)
    const faltan: string[] = []
    for (const juego of Object.values(JUEGOS)) {
      for (const [nivel, ficha] of Object.entries(juego.niveles) as [Nivel, NonNullable<(typeof juego.niveles)[Nivel]>][]) {
        // Memotono arma sus secuencias con un banco de palabras sin grados;
        // Nombrá rápido, ¡Rápido, tocalo! y Ojo de lince generan sus cuadrículas.
        if (itemsCrudos(juego.codigo, nivel, 1).length === 0) continue
        for (const g of GRADOS) {
          // Con contarPendientes, cuenta también los ítems que solo esperan dibujos de a_generar.
          const n = contarPendientes
            ? itemsCrudos(juego.codigo, nivel, g).filter((i) =>
                palabrasConDibujo(juego.codigo, nivel, i).every((p) => tieneDibujo(p) || pendientes.has(p)),
              ).length
            : itemsDe(juego.codigo, nivel, g).length
          if (n < ficha.partida[g]) faltan.push(`${juego.codigo} ${nivel} grado ${g}: ${n} de ${ficha.partida[g]}`)
        }
      }
    }
    return faltan
  }

  /*
   * Detective de primario, grado 2: 11 de sus 17 ítems usan palabras que
   * todavía no tienen dibujo (nota, capa, tapa, tela, cono). Hasta que
   * lleguen, la partida se juega con los 6 que hay. Cuando estén los
   * dibujos, esta prueba falla para recordar sacar la excepción.
   */
  const FALTAN_DIBUJOS = ["detective primario grado 2: 6 de 8"]

  it("cada grado de cada juego tiene al menos los ítems de una partida (contando solo los que tienen dibujo)", () => {
    expect(gradosIncompletos(false)).toEqual(FALTAN_DIBUJOS)
  })

  it("con los dibujos de a_generar, todos los grados llegan a una partida", () => {
    expect(gradosIncompletos(true)).toEqual([])
  })

  it("los ids de cada banco no se repiten", () => {
    for (const juego of ["detective", "rima", "palmas"] as const) {
      for (const nivel of ["inicial", "primario"] as Nivel[]) {
        const ids = GRADOS.flatMap((g) => itemsCrudos(juego, nivel, g).map((i) => i.id))
        expect(new Set(ids).size, `${juego} ${nivel}`).toBe(ids.length)
      }
    }
  })
})

describe("elegirPartida", () => {
  const items = Array.from({ length: 20 }, (_, i) => i)

  it("toma n ítems sin repetir", () => {
    const partida = elegirPartida(items, 8, semilla(1))
    expect(partida).toHaveLength(8)
    expect(new Set(partida).size).toBe(8)
    for (const x of partida) expect(items).toContain(x)
  })

  it("con menos ítems que n devuelve todos", () => {
    expect(elegirPartida([1, 2, 3], 8, semilla(2)).sort()).toEqual([1, 2, 3])
  })

  it("con n negativo no devuelve nada", () => {
    expect(elegirPartida(items, -1)).toEqual([])
  })

  it("no modifica la lista original", () => {
    const copia = [...items]
    elegirPartida(items, 5, semilla(3))
    expect(items).toEqual(copia)
  })

  it("mezcla (con distintas semillas sale distinto orden)", () => {
    expect(mezclar(items, semilla(4))).not.toEqual(mezclar(items, semilla(5)))
    expect([...mezclar(items, semilla(4))].sort((a, b) => a - b)).toEqual(items)
  })

  it("funciona con el azar por defecto", () => {
    expect(elegirPartida(items, 3)).toHaveLength(3)
  })
})

describe("banco de Rompe y une", () => {
  /** Sin tildes ni diéresis y en minúscula (la ñ se compara igual de los dos lados). */
  const plano = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

  for (const g of GRADOS) {
    it(`grado ${g}: las sílabas forman la palabra y el relleno tiene ${g} sílaba(s) que no están entre las correctas`, () => {
      const items = itemsCrudos("rompe", "primario", g) as unknown as ItemRompe[]
      expect(items.length).toBeGreaterThanOrEqual(JUEGOS.rompe.niveles.primario!.partida[g])
      for (const i of items) {
        expect(plano(i.silabas.join("")), i.id).toBe(plano(i.palabra))
        for (const s of [...i.silabas, ...i.relleno]) expect(s, i.id).toBe(s.toUpperCase())
        expect(i.relleno, i.id).toHaveLength(g)
        for (const r of i.relleno) expect(i.silabas, `${i.id}: ${r}`).not.toContain(r)
      }
    })
  }

  it("el grado 3 tiene hasta 5 casilleros y 8 fichas", () => {
    const items = itemsCrudos("rompe", "primario", 3) as unknown as ItemRompe[]
    expect(Math.max(...items.map((i) => i.silabas.length))).toBeLessThanOrEqual(5)
    expect(Math.max(...items.map((i) => i.silabas.length + i.relleno.length))).toBeLessThanOrEqual(8)
  })

  it("usa dibujos y los ids no se repiten", () => {
    expect(usaDibujos("rompe", "primario")).toBe(true)
    const ids = GRADOS.flatMap((g) => itemsCrudos("rompe", "primario", g).map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("banco de Palabras de otro planeta", () => {
  it("2 distractores por ítem, distintos de la palabra y entre sí", () => {
    for (const g of GRADOS) {
      const items = itemsCrudos("planeta", "primario", g) as unknown as ItemPlaneta[]
      expect(items.length).toBeGreaterThanOrEqual(JUEGOS.planeta.niveles.primario!.partida[g])
      for (const i of items) {
        expect(i.distractores, i.id).toHaveLength(2)
        expect(i.distractores, i.id).not.toContain(i.palabra)
        expect(i.distractores[0], i.id).not.toBe(i.distractores[1])
      }
    }
  })

  it("no usa dibujos y los ids no se repiten", () => {
    expect(usaDibujos("planeta", "primario")).toBe(false)
    const ids = GRADOS.flatMap((g) => itemsCrudos("planeta", "primario", g).map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
