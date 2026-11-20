import { describe, expect, it } from "vitest"

import { tieneDibujo } from "@/lib/entrenamiento/bancos"
import {
  CATEGORIAS_POR_GRADO,
  CUADRICULAS_POR_PARTIDA,
  DIBUJOS_DENOMINACION,
  TAMANOS_NOMBRA,
  estimulosNombra,
  generarConfigNombra,
  generarNombra,
  generarSecuencia,
  nombreCategorias,
  subsecuenciaPareja,
  textoPracticaNombra,
} from "@/lib/entrenamiento/denominacion-entrenamiento"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import { validarSecuencia } from "@/lib/test/denominacion"
import { DENOMINACION_POR_NIVEL, TEXTOS_DENOMINACION, buscarEstimulo } from "@/lib/test/denominacion-config"

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

describe("estímulos de Nombrá rápido", () => {
  it("son los de la evaluación, más los dibujos de inicial; en inicial no hay números", () => {
    const ini = estimulosNombra("inicial")
    expect(ini.color).toEqual(DENOMINACION_POR_NIVEL.inicial.estimulos.color)
    expect(ini.letra!.map((e) => e.valor)).toEqual(["A", "E", "I", "O", "U"])
    expect(ini.numero).toBeUndefined()
    expect(ini.dibujo!.map((e) => e.valor)).toEqual(["flor", "tren", "globo", "llave", "oso"])
    const pri = estimulosNombra("primario")
    expect(pri.letra!.map((e) => e.valor)).toEqual(["A", "E", "S", "D", "P"])
    expect(pri.numero!.map((e) => e.valor)).toEqual(["2", "4", "6", "7", "9"])
    expect(pri.dibujo).toBeUndefined()
  })

  it("los dibujos están en bancos.json", () => {
    for (const d of DIBUJOS_DENOMINACION) expect(tieneDibujo(d.valor), d.valor).toBe(true)
  })
})

describe("textos", () => {
  it("nombra las categorías del grado", () => {
    expect(nombreCategorias("inicial", ["color"])).toBe("colores")
    expect(nombreCategorias("inicial", ["color", "letra"])).toBe("colores y vocales")
    expect(nombreCategorias("inicial", ["color", "letra", "dibujo"])).toBe("colores, vocales y dibujos")
    expect(nombreCategorias("primario", ["letra", "numero", "color"])).toBe("letras, números y colores")
  })

  it("práctica del grado; consigna y criterio de error de la evaluación", () => {
    expect(textoPracticaNombra("primario", 2)).toBe("Vamos a jugar con letras y números. Decime el nombre de cada uno.")
    const config = generarConfigNombra("inicial", 3, semilla(1))
    expect(config.textos.practica).toBe("Vamos a jugar con colores, vocales y dibujos. Decime el nombre de cada uno.")
    expect(config.textos.consigna).toBe(TEXTOS_DENOMINACION.consigna)
    expect(config.textos.criterioError).toBe(TEXTOS_DENOMINACION.criterioError)
  })
})

describe("generarConfigNombra", () => {
  for (const nivel of NIVELES) {
    for (const grado of GRADOS) {
      it(`${nivel}, grado ${grado}: 2 cuadrículas válidas, distintas y del tamaño del grado`, () => {
        const { filas, columnas } = TAMANOS_NOMBRA[nivel][grado]
        const categorias = CATEGORIAS_POR_GRADO[nivel][grado]
        for (const s of SEMILLAS) {
          const config = generarConfigNombra(nivel, grado, semilla(s))
          expect(config.ciclo).toEqual(categorias)
          expect(Object.keys(config.estimulos).sort()).toEqual([...categorias].sort())
          expect(config.ejercicios).toHaveLength(CUADRICULAS_POR_PARTIDA)
          // La práctica: un estímulo de cada categoría, en el orden del ciclo.
          expect(config.practica.map((v) => buscarEstimulo(config, v)?.categoria)).toEqual(categorias)
          for (const e of config.ejercicios) {
            expect([e.filas, e.columnas]).toEqual([filas, columnas])
            expect(e.secuencia).toHaveLength(filas * columnas)
            expect(validarSecuencia(config, e), `semilla ${s}`).toEqual([])
            // Una sola categoría: sin dos celdas iguales seguidas.
            if (categorias.length === 1) {
              e.secuencia.forEach((v, i) => i > 0 && expect(v).not.toBe(e.secuencia[i - 1]))
            }
          }
          expect(config.ejercicios[0].secuencia.join()).not.toBe(config.ejercicios[1].secuencia.join())
        }
      })
    }
  }

  it("ids y nombres de cada cuadrícula", () => {
    const config = generarConfigNombra("primario", 3, semilla(3))
    expect(config.ejercicios.map((e) => [e.id, e.nombre])).toEqual([
      ["NOM-primario-3-1", "Cuadrícula 1"],
      ["NOM-primario-3-2", "Cuadrícula 2"],
    ])
  })
})

describe("generarNombra", () => {
  it("un ítem por cuadrícula, con su configuración", () => {
    const items = generarNombra("inicial", 2, semilla(5))
    expect(items.map((i) => i.id)).toEqual(["NOM-inicial-2-1", "NOM-inicial-2-2"])
    expect(items[0].config).toBe(items[1].config)
    expect(items[1].ejercicio).toBe(items[0].config.ejercicios[1])
  })

  it("si no logra dos cuadrículas distintas, devuelve una lista vacía", () => {
    // Con un azar fijo las dos cuadrículas salen iguales.
    expect(generarNombra("primario", 1, () => 0)).toEqual([])
  })

  it("funciona con el azar por defecto", () => {
    expect(generarNombra("primario", 3)).toHaveLength(2)
  })
})

describe("subsecuenciaPareja y generarSecuencia", () => {
  const colores = DENOMINACION_POR_NIVEL.primario.estimulos.color!

  it("usos parejos y sin dos iguales seguidos", () => {
    for (const s of SEMILLAS) {
      const sub = subsecuenciaPareja(colores, 13, semilla(s))
      expect(sub).toHaveLength(13)
      const usos = colores.map((c) => sub.filter((v) => v === c.valor).length)
      expect(Math.max(...usos) - Math.min(...usos)).toBeLessThanOrEqual(1)
      sub.forEach((v, i) => i > 0 && expect(v).not.toBe(sub[i - 1]))
    }
  })

  it("con un solo estímulo no puede evitar repetidos y devuelve vacío", () => {
    expect(subsecuenciaPareja(colores.slice(0, 1), 2, semilla(1))).toEqual([])
    expect(subsecuenciaPareja(colores.slice(0, 1), 1, semilla(1))).toEqual(["rojo"])
  })

  it("intercala las categorías en el orden del ciclo", () => {
    const sec = generarSecuencia(estimulosNombra("primario"), ["letra", "numero", "color"], 7, semilla(2))
    const config = DENOMINACION_POR_NIVEL.primario
    expect(sec.map((v) => buscarEstimulo(config, v)?.categoria)).toEqual([
      "letra",
      "numero",
      "color",
      "letra",
      "numero",
      "color",
      "letra",
    ])
  })

  it("una categoría que no alcanza deja celdas vacías (y validarSecuencia las rechaza)", () => {
    const sec = generarSecuencia({ color: colores.slice(0, 1) }, ["color"], 2, semilla(1))
    expect(sec).toEqual(["", ""])
  })
})
