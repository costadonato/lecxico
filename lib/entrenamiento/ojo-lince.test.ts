import { describe, expect, it } from "vitest"

import { tieneDibujo } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import {
  CUADRICULAS_OJO,
  ELEMENTOS_INICIAL,
  LETRAS_ESPEJO,
  NOMBRE_LETRA,
  OBJETIVOS_POR_CELDAS,
  OBJETIVOS_PRIMARIO,
  PARECIDAS,
  TAMANOS_OJO,
  distractoresLetra,
  generarOjoLince,
  llenarCuadricula,
} from "@/lib/entrenamiento/ojo-lince"

const NIVELES: Nivel[] = ["inicial", "primario"]
const GRADOS: Grado[] = [1, 2, 3]
const SEMILLAS = Array.from({ length: 80 }, (_, i) => i + 1)

function semilla(n: number) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe("tablas de Ojo de lince", () => {
  it("cerca del 25 % de objetivos", () => {
    for (const [celdas, k] of Object.entries(OBJETIVOS_POR_CELDAS)) {
      expect(k / Number(celdas)).toBeGreaterThan(0.2)
      expect(k / Number(celdas)).toBeLessThan(0.26)
    }
  })

  it("los dibujos de inicial están en bancos.json", () => {
    for (const d of ELEMENTOS_INICIAL.dibujos) expect(tieneDibujo(d), d).toBe(true)
  })

  it("no se usa la v en ninguna parte", () => {
    const todas = [
      ...Object.keys(NOMBRE_LETRA),
      ...Object.values(PARECIDAS).flat(),
      ...GRADOS.flatMap((g) => OBJETIVOS_PRIMARIO[g].flatMap((o) => [o, ...distractoresLetra(g, o)])),
    ]
    expect(todas).not.toContain("v")
    for (const l of todas) expect(NOMBRE_LETRA[l], l).toBeTruthy()
  })

  it("distractores de la tabla, sin el objetivo", () => {
    expect(distractoresLetra(1, "s")).toEqual(["a", "e", "o", "u", "r", "c", "n", "i"])
    expect(distractoresLetra(1, "m")).toEqual(["a", "e", "o", "c", "i"]) // sin n, r, u (forma parecida)
    expect(distractoresLetra(1, "t")).toEqual(["a", "e", "o", "u", "r", "c", "n"]) // sin i
    expect(distractoresLetra(2, "b")).toEqual(["h", "l", "k"])
    expect(distractoresLetra(2, "e")).toEqual(["c", "o", "a"])
    expect(distractoresLetra(3, "q")).toEqual(["b", "d", "p"])
    for (const g of GRADOS) for (const o of OBJETIVOS_PRIMARIO[g]) expect(distractoresLetra(g, o)).not.toContain(o)
  })
})

describe("generarOjoLince", () => {
  for (const nivel of NIVELES) {
    for (const grado of GRADOS) {
      it(`${nivel}, grado ${grado}: tamaños, objetivos y distractores`, () => {
        const { filas, columnas } = TAMANOS_OJO[nivel][grado]
        const n = filas * columnas
        for (const s of SEMILLAS) {
          const items = generarOjoLince(nivel, grado, semilla(s))
          expect(items).toHaveLength(CUADRICULAS_OJO)
          // Un objetivo distinto por cuadrícula (en inicial, una categoría distinta).
          expect(new Set(items.map((i) => i.objetivo)).size).toBe(3)
          if (nivel === "inicial") expect(new Set(items.map((i) => i.categoria))).toEqual(new Set(["colores", "dibujos", "vocales"]))
          items.forEach((item, i) => {
            expect(item.id).toBe(`OJO-${i + 1}-${item.objetivo}`)
            expect(item.celdas).toHaveLength(n) // completa, sin celdas sobrantes
            expect(item.objetivos).toHaveLength(OBJETIVOS_POR_CELDAS[n])
            expect(item.celdas.flatMap((c, j) => (c === item.objetivo ? [j] : []))).toEqual(item.objetivos)
            const distractores = item.celdas.filter((c) => c !== item.objetivo)
            expect(distractores).not.toContain("v")
            if (nivel === "inicial") {
              for (const d of distractores) expect(ELEMENTOS_INICIAL[item.categoria as "colores"]).toContain(d)
              expect(item.muestraVisible).toBe(true)
            } else {
              const permitidos = distractoresLetra(grado, item.objetivo)
              for (const d of distractores) expect(permitidos).toContain(d)
              expect(OBJETIVOS_PRIMARIO[grado]).toContain(item.objetivo)
              expect(item.nombre).toBe(NOMBRE_LETRA[item.objetivo])
              expect(item.muestraVisible).toBe(grado === 1)
              expect(item.celdas.every((c) => c === c.toLowerCase())).toBe(true)
            }
          })
        }
      })
    }
  }

  it("primario grado 3: solo b, d, p y q", () => {
    for (const item of generarOjoLince("primario", 3, semilla(9))) {
      for (const c of item.celdas) expect(LETRAS_ESPEJO).toContain(c)
    }
  })

  it("funciona con el azar por defecto", () => {
    expect(generarOjoLince("primario", 1)).toHaveLength(3)
  })
})

describe("llenarCuadricula", () => {
  it("reparte los distractores parejo", () => {
    const { celdas, objetivos } = llenarCuadricula(12, 3, "b", ["h", "l", "k"], semilla(3))
    expect(objetivos).toHaveLength(3)
    for (const d of ["h", "l", "k"]) expect(celdas.filter((c) => c === d)).toHaveLength(3)
  })
})
