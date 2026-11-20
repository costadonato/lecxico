import { describe, expect, it } from "vitest"

import { tieneDibujo } from "@/lib/entrenamiento/bancos"
import { CATEGORIAS_POR_GRADO } from "@/lib/entrenamiento/denominacion-entrenamiento"
import { JUEGOS, type Grado, type Nivel } from "@/lib/entrenamiento/juegos"
import { iniciarRondas, reducirRondas, resultadoRondas } from "@/lib/entrenamiento/rondas"
import {
  ESTIMULOS_POR_CUADRICULA,
  LETRAS_TOCALO,
  REGLAS_TOCALO,
  celdasTocalo,
  estimulosTocalo,
  generarTocalo,
  resultadoTocalo,
} from "@/lib/entrenamiento/tocalo"

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

describe("estímulos", () => {
  it("letras de primario con sus nombres; en inicial, sin números", () => {
    expect(LETRAS_TOCALO.map((l) => `${l.valor}:${l.nombre}`)).toEqual([
      "A:a",
      "E:e",
      "S:ese",
      "D:de",
      "P:pe",
      "M:eme",
      "L:ele",
      "T:te",
    ])
    expect(estimulosTocalo("inicial").numero).toBeUndefined()
    expect(estimulosTocalo("inicial").dibujo!.every((d) => tieneDibujo(d.valor))).toBe(true)
    expect(estimulosTocalo("primario").numero!.map((n) => n.valor)).toEqual(["2", "4", "6", "7", "9"])
  })

  it("tiempos límite de la tabla", () => {
    expect([1, 2, 3].map((g) => REGLAS_TOCALO.inicial[g as Grado].limiteMs)).toEqual([null, 4000, 3000])
    expect([1, 2, 3].map((g) => REGLAS_TOCALO.primario[g as Grado].limiteMs)).toEqual([null, 3000, 2000])
  })
})

describe("generarTocalo", () => {
  for (const nivel of NIVELES) {
    for (const grado of GRADOS) {
      it(`${nivel}, grado ${grado}: celdas únicas, reparto parejo y objetivo en la cuadrícula`, () => {
        const regla = REGLAS_TOCALO[nivel][grado]
        const categorias = CATEGORIAS_POR_GRADO[nivel][grado]
        const total = JUEGOS.tocalo.niveles[nivel]!.partida[grado]
        for (const s of SEMILLAS) {
          const items = generarTocalo(nivel, grado, semilla(s))
          expect(items).toHaveLength(total)
          expect(new Set(items.map((i) => i.id)).size).toBe(total)
          items.forEach((item, i) => {
            expect(item.celdas).toHaveLength(regla.filas * regla.columnas)
            expect([item.filas, item.columnas, item.limiteMs]).toEqual([regla.filas, regla.columnas, regla.limiteMs])
            expect(new Set(item.celdas.map((c) => c.valor)).size).toBe(item.celdas.length)
            expect(item.celdas.map((c) => c.valor)).toContain(item.objetivo.valor)
            expect(item.cuadricula).toBe(Math.floor(i / ESTIMULOS_POR_CUADRICULA))
            // Misma cuadrícula durante 4 estímulos.
            if (i % ESTIMULOS_POR_CUADRICULA !== 0) expect(item.celdas).toBe(items[i - 1].celdas)
            // Sin repetir el objetivo anterior.
            if (i > 0) expect(item.objetivo.valor).not.toBe(items[i - 1].objetivo.valor)
            // Reparto entre categorías: solo las del grado, con diferencia máxima de 1.
            const conteos = categorias.map((c) => item.celdas.filter((x) => x.categoria === c).length)
            expect(conteos.reduce((a, b) => a + b, 0)).toBe(item.celdas.length)
            expect(Math.max(...conteos) - Math.min(...conteos)).toBeLessThanOrEqual(1)
          })
        }
      })
    }
  }

  it("3 cuadrículas en inicial y 5 en primario", () => {
    expect(new Set(generarTocalo("inicial", 2, semilla(1)).map((i) => i.cuadricula)).size).toBe(3)
    expect(new Set(generarTocalo("primario", 2, semilla(1)).map((i) => i.cuadricula)).size).toBe(5)
  })

  it("ids legibles", () => {
    const items = generarTocalo("inicial", 1, semilla(2))
    expect(items[0].id).toBe(`TOC-01-${items[0].objetivo.valor}`)
    expect(items[11].id).toBe(`TOC-12-${items[11].objetivo.valor}`)
  })

  it("funciona con el azar por defecto", () => {
    expect(generarTocalo("primario", 3)).toHaveLength(20)
    expect(celdasTocalo("inicial", 3)).toHaveLength(9)
  })
})

describe("resultadoTocalo", () => {
  const rondas = (...correctas: boolean[]) =>
    resultadoRondas(
      correctas.reduce(
        (e, c) => reducirRondas(reducirRondas(e, { tipo: "resolver", correcta: c }), { tipo: "siguiente" }),
        iniciarRondas(correctas.map((_, i) => `T${i}`)),
      ),
    )

  it("promedia el tiempo de los toques correctos y cuenta los errores", () => {
    const r = resultadoTocalo(rondas(true, false, true, false), [1000, 300, 2001, null])
    expect(r.correctas).toBe(2)
    expect(r.total).toBe(4)
    expect(r.tiempoMs).toBe(1501) // (1000 + 2001) / 2 = 1500,5
    expect(r.errores).toBe(2)
    expect(r.detalle).toEqual([
      { item: "T0", correcta: true, intentos: 1, ms: 1000 },
      { item: "T1", correcta: false, intentos: 1, ms: 300 },
      { item: "T2", correcta: true, intentos: 1, ms: 2001 },
      { item: "T3", correcta: false, intentos: 1, ms: null },
    ])
  })

  it("un toque correcto antes de que termine el audio es acierto, pero no entra en el promedio", () => {
    // T1 y T3 son correctos sin tiempo válido (tocó antes de que terminara el audio).
    const r = resultadoTocalo(rondas(true, true, false, true), [800, null, null, 1200])
    expect(r.correctas).toBe(3)
    expect(r.tiempoMs).toBe(1000) // (800 + 1200) / 2: T1 no cuenta
    expect(r.errores).toBe(1)
    expect(r.detalle.map((d) => [d.correcta, d.ms])).toEqual([
      [true, 800],
      [true, null],
      [false, null],
      [true, 1200],
    ])
  })

  it("si ningún toque correcto tiene tiempo válido, tiempo y errores van en null aunque haya aciertos", () => {
    const r = resultadoTocalo(rondas(true, false, true), [null, 400, null])
    expect(r.correctas).toBe(2)
    expect(r.total).toBe(3)
    expect(r.tiempoMs).toBeNull()
    expect(r.errores).toBeNull()
  })

  it("sin ningún toque correcto, tiempo y errores van en null", () => {
    const r = resultadoTocalo(rondas(false, false), [500])
    expect(r.tiempoMs).toBeNull()
    expect(r.errores).toBeNull()
    expect(r.detalle.map((d) => d.ms)).toEqual([500, null])
  })

  it("un toque justo al terminar el audio cuenta como 1 ms (la base exige tiempo > 0)", () => {
    expect(resultadoTocalo(rondas(true), [0]).tiempoMs).toBe(1)
  })
})
