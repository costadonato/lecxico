import { describe, expect, it } from "vitest"

import {
  BLOQUE_CODIGOS,
  BLOQUE_NOMBRES,
  BLOQUES_POR_NIVEL,
  ETAPAS_ESCOLARES,
  bloqueCodigoPorOrden,
  nivelParaEtapa,
  rutaDelTest,
  type Nivel,
} from "@/lib/test/bloques"

const NIVELES: Nivel[] = ["inicial", "primario"]

describe("BLOQUES_POR_NIVEL", () => {
  it("inicial: 5 bloques, denominación rápida al final", () => {
    expect(BLOQUES_POR_NIVEL.inicial).toEqual([
      "discriminacion_auditiva",
      "conciencia_fonologica",
      "conciencia_silabica",
      "memoria_fonologica",
      "denominacion_rapida",
    ])
  })

  it("primario: 9 bloques; los 8 de antes de S9 en su orden y denominación rápida al final", () => {
    expect(BLOQUES_POR_NIVEL.primario).toEqual([
      "discriminacion_auditiva",
      "conciencia_fonologica",
      "conciencia_silabica",
      "memoria_fonologica",
      "comprension_lectora",
      "correspondencia_sonido_letra",
      "reconocimiento_visual",
      "lectura_pseudopalabras",
      "denominacion_rapida",
    ])
  })

  it("en los dos niveles denominación rápida es el último bloque y no se repite ninguno", () => {
    for (const nivel of NIVELES) {
      const bloques = BLOQUES_POR_NIVEL[nivel]
      expect(bloques.at(-1)).toBe("denominacion_rapida")
      expect(new Set(bloques).size).toBe(bloques.length)
    }
  })

  it("solo usa códigos válidos, cada uno con su nombre visible", () => {
    for (const nivel of NIVELES) {
      for (const codigo of BLOQUES_POR_NIVEL[nivel]) {
        expect(BLOQUE_CODIGOS).toContain(codigo)
        expect(BLOQUE_NOMBRES[codigo]).toBeTruthy()
      }
    }
  })
})

describe("bloqueCodigoPorOrden", () => {
  it("el orden (1-based) de cada bloque devuelve su código, igual que BLOQUES_POR_NIVEL", () => {
    for (const nivel of NIVELES) {
      BLOQUES_POR_NIVEL[nivel].forEach((codigo, i) => {
        expect(bloqueCodigoPorOrden(nivel, i + 1)).toBe(codigo)
      })
    }
  })

  it("denominación rápida se guarda con orden 5 en inicial y 9 en primario", () => {
    expect(bloqueCodigoPorOrden("inicial", 5)).toBe("denominacion_rapida")
    expect(bloqueCodigoPorOrden("primario", 9)).toBe("denominacion_rapida")
    expect(bloqueCodigoPorOrden("primario", 5)).toBe("comprension_lectora")
  })

  it("falla con un orden fuera del nivel", () => {
    expect(() => bloqueCodigoPorOrden("inicial", 6)).toThrow("no tiene un bloque 6")
    expect(() => bloqueCodigoPorOrden("primario", 0)).toThrow("no tiene un bloque 0")
    expect(() => bloqueCodigoPorOrden("primario", 10)).toThrow("no tiene un bloque 10")
  })
})

describe("nivelParaEtapa", () => {
  it("sala de 4 y 5 → inicial; 1.º a 3.er grado → primario", () => {
    expect(ETAPAS_ESCOLARES.map((e) => nivelParaEtapa(e.valor))).toEqual([
      "inicial",
      "inicial",
      "primario",
      "primario",
      "primario",
    ])
  })
})

describe("rutaDelTest", () => {
  it("lleva a la página de cada nivel con el niño codificado", () => {
    expect(rutaDelTest("inicial", "abc")).toBe("/test/inicial?nino=abc")
    expect(rutaDelTest("primario", "a b")).toBe("/test/primaria?nino=a%20b")
  })
})
