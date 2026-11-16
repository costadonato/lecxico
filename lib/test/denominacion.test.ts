import { describe, expect, it } from "vitest"

import type { Nivel } from "@/lib/test/bloques"
import {
  DENOMINACION_POR_NIVEL,
  buscarEstimulo,
  type ConfigDenominacion,
  type EjercicioDenominacion,
} from "@/lib/test/denominacion-config"
import {
  formatearTiempo,
  resultadoBloqueDenominacion,
  resultadoEjercicio,
  validarSecuencia,
} from "@/lib/test/denominacion"

const NIVELES: Nivel[] = ["inicial", "primario"]

/** Configuración chica para probar cada regla por separado: 2 estímulos por categoría. */
const CONFIG: ConfigDenominacion = {
  estimulos: {
    letra: [
      { categoria: "letra", valor: "A", nombre: "a" },
      { categoria: "letra", valor: "E", nombre: "e" },
    ],
    numero: [
      { categoria: "numero", valor: "2", nombre: "dos" },
      { categoria: "numero", valor: "4", nombre: "cuatro" },
    ],
    color: [
      { categoria: "color", valor: "rojo", nombre: "rojo" },
      { categoria: "color", valor: "azul", nombre: "azul" },
    ],
  },
  ejercicios: [],
  practica: ["A", "2", "rojo"],
  textos: DENOMINACION_POR_NIVEL.primario.textos,
}

const ejercicio = (secuencia: string[], filas = 2, columnas = 3): EjercicioDenominacion => ({
  id: "prueba",
  nombre: "Prueba",
  filas,
  columnas,
  secuencia,
})

describe("resultadoEjercicio", () => {
  it("calcula correctas = total - errores", () => {
    expect(resultadoEjercicio({ ejercicio: "e1", tiempoMs: 48_000, errores: 3, total: 50 })).toEqual({
      ejercicio: "e1",
      tiempoMs: 48_000,
      errores: 3,
      correctas: 47,
      total: 50,
    })
  })

  it("con más errores que estímulos, deja correctas en 0", () => {
    const r = resultadoEjercicio({ ejercicio: "e1", tiempoMs: 1000, errores: 60, total: 50 })
    expect(r.errores).toBe(50)
    expect(r.correctas).toBe(0)
  })

  it("con errores negativos, deja correctas en el total", () => {
    const r = resultadoEjercicio({ ejercicio: "e1", tiempoMs: 1000, errores: -2, total: 24 })
    expect(r.errores).toBe(0)
    expect(r.correctas).toBe(24)
  })

  it("redondea errores y tiempo a enteros", () => {
    const r = resultadoEjercicio({ ejercicio: "e1", tiempoMs: 12_345.6, errores: 2.4, total: 24 })
    expect(r.tiempoMs).toBe(12_346)
    expect(r.errores).toBe(2)
    expect(r.correctas).toBe(22)
  })
})

describe("resultadoBloqueDenominacion", () => {
  it("suma los ejercicios y guarda el detalle de cada uno", () => {
    const e1 = resultadoEjercicio({ ejercicio: "primario-1", tiempoMs: 50_000, errores: 2, total: 50 })
    const e2 = resultadoEjercicio({ ejercicio: "primario-2", tiempoMs: 45_000, errores: 1, total: 50 })
    expect(resultadoBloqueDenominacion([e1, e2])).toEqual({
      tiempoMs: 95_000,
      errores: 3,
      correctas: 97,
      total: 100,
      detalle: [
        { ejercicio: "primario-1", tiempo_ms: 50_000, errores: 2, correctas: 48, total: 50 },
        { ejercicio: "primario-2", tiempo_ms: 45_000, errores: 1, correctas: 49, total: 50 },
      ],
    })
  })

  it("sin ejercicios devuelve todo en 0", () => {
    expect(resultadoBloqueDenominacion([])).toEqual({ tiempoMs: 0, errores: 0, correctas: 0, total: 0, detalle: [] })
  })
})

describe("formatearTiempo", () => {
  it("muestra minutos y segundos con dos dígitos", () => {
    expect(formatearTiempo(65_000)).toBe("1:05")
    expect(formatearTiempo(125_000)).toBe("2:05")
  })

  it("con menos de un minuto empieza en 0", () => {
    expect(formatearTiempo(48_000)).toBe("0:48")
    expect(formatearTiempo(0)).toBe("0:00")
  })

  it("redondea al segundo más cercano", () => {
    expect(formatearTiempo(59_600)).toBe("1:00")
    expect(formatearTiempo(48_400)).toBe("0:48")
  })

  it("un tiempo negativo se muestra como 0:00", () => {
    expect(formatearTiempo(-500)).toBe("0:00")
  })
})

describe("validarSecuencia: ejercicios configurados", () => {
  for (const nivel of NIVELES) {
    const config = DENOMINACION_POR_NIVEL[nivel]

    it(`${nivel}: tiene 2 ejercicios`, () => {
      expect(config.ejercicios).toHaveLength(2)
    })

    for (const ej of config.ejercicios) {
      it(`${nivel} / ${ej.id}: cumple todas las reglas`, () => {
        expect(validarSecuencia(config, ej)).toEqual([])
      })
    }

    it(`${nivel}: los dos ejercicios tienen secuencias distintas`, () => {
      const [a, b] = config.ejercicios
      expect(a.secuencia.join(",")).not.toBe(b.secuencia.join(","))
      expect(a.id).not.toBe(b.id)
    })

    it(`${nivel}: la práctica tiene un estímulo de cada categoría, en el orden del ciclo`, () => {
      expect(config.practica.map((v) => buscarEstimulo(config, v)?.categoria)).toEqual(["letra", "numero", "color"])
    })
  }

  it("primario: 5 × 10; inicial: solo vocales", () => {
    for (const ej of DENOMINACION_POR_NIVEL.primario.ejercicios) expect([ej.filas, ej.columnas]).toEqual([5, 10])
    expect(DENOMINACION_POR_NIVEL.inicial.estimulos.letra.map((e) => e.valor)).toEqual(["A", "E", "I", "O", "U"])
  })

  it("los valores son únicos dentro de cada nivel", () => {
    for (const nivel of NIVELES) {
      const c = DENOMINACION_POR_NIVEL[nivel].estimulos
      const valores = [...c.letra, ...c.numero, ...c.color].map((e) => e.valor)
      expect(new Set(valores).size).toBe(valores.length)
    }
  })
})

describe("validarSecuencia: cada regla", () => {
  it("acepta una secuencia correcta", () => {
    expect(validarSecuencia(CONFIG, ejercicio(["A", "2", "rojo", "E", "4", "azul"]))).toEqual([])
  })

  it("rechaza un largo distinto de filas × columnas", () => {
    const problemas = validarSecuencia(CONFIG, ejercicio(["A", "2", "rojo", "E", "4", "azul"], 3, 3))
    expect(problemas).toEqual(["Tiene 6 estímulos y debería tener 9."])
  })

  it("rechaza un estímulo que no es del nivel", () => {
    const problemas = validarSecuencia(CONFIG, ejercicio(["A", "2", "rojo", "S", "4", "azul"]))
    expect(problemas).toContain('Posición 4: "S" no es un estímulo del nivel.')
  })

  it("rechaza una secuencia que rompe el ciclo de categorías", () => {
    const problemas = validarSecuencia(CONFIG, ejercicio(["A", "rojo", "2", "E", "4", "azul"]))
    expect(problemas).toEqual([
      "Posición 2: se esperaba numero y hay color.",
      "Posición 3: se esperaba color y hay numero.",
    ])
  })

  it("rechaza un estímulo repetido seguido dentro de su categoría", () => {
    const problemas = validarSecuencia(
      CONFIG,
      ejercicio(["A", "2", "rojo", "A", "4", "azul", "E", "2", "rojo", "E", "4", "azul"], 2, 6),
    )
    expect(problemas).toEqual([
      'Posición 4: "A" se repite seguido dentro de su categoría.',
      'Posición 10: "E" se repite seguido dentro de su categoría.',
    ])
  })

  it("rechaza conteos dispares dentro de una categoría (incluido un estímulo que no aparece)", () => {
    // Las letras alternan A, E, A (2 y 1: parejo). Los colores usan solo rojo
    // (3 y 0) y además se repiten seguidos.
    const problemas = validarSecuencia(
      CONFIG,
      ejercicio(["A", "2", "rojo", "E", "4", "rojo", "A", "2", "rojo"], 3, 3),
    )
    expect(problemas).toContain("Los estímulos de color no aparecen una cantidad pareja de veces (3, 0).")
    expect(problemas.some((p) => p.includes("letra no aparecen"))).toBe(false)
  })
})
