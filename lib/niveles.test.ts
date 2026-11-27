import { describe, expect, it } from "vitest"
import { ESTILO_NIVEL, estiloNivel, nivelDePorcentaje } from "./niveles"

describe("nivelDePorcentaje", () => {
  it("ubica un porcentaje en cada nivel", () => {
    expect(nivelDePorcentaje(95)).toBe("alto")
    expect(nivelDePorcentaje(70)).toBe("medio")
    expect(nivelDePorcentaje(50)).toBe("bajo")
    expect(nivelDePorcentaje(20)).toBe("critico")
  })

  it("los cortes 80, 60 y 40 entran en el nivel de arriba", () => {
    expect(nivelDePorcentaje(80)).toBe("alto")
    expect(nivelDePorcentaje(79.99)).toBe("medio")
    expect(nivelDePorcentaje(60)).toBe("medio")
    expect(nivelDePorcentaje(59.99)).toBe("bajo")
    expect(nivelDePorcentaje(40)).toBe("bajo")
    expect(nivelDePorcentaje(39.99)).toBe("critico")
  })

  it("los extremos del rango: 0 es crítico y 100 es alto", () => {
    expect(nivelDePorcentaje(0)).toBe("critico")
    expect(nivelDePorcentaje(100)).toBe("alto")
  })

  it("fuera de rango no falla: negativo es crítico, más de 100 es alto", () => {
    expect(nivelDePorcentaje(-5)).toBe("critico")
    expect(nivelDePorcentaje(120)).toBe("alto")
  })

  it("NaN cae en crítico (ninguna comparación es verdadera)", () => {
    expect(nivelDePorcentaje(Number.NaN)).toBe("critico")
  })
})

describe("ESTILO_NIVEL y estiloNivel", () => {
  it("cada nivel tiene sus cuatro clases completas", () => {
    for (const estilo of Object.values(ESTILO_NIVEL)) {
      expect(estilo.barra).toMatch(/^bg-/)
      expect(estilo.trazo).toMatch(/^stroke-/)
      expect(estilo.texto).toMatch(/^text-/)
      expect(estilo.suave).toMatch(/^bg-.+-suave$/)
    }
  })

  it("estiloNivel devuelve el estilo del nivel del porcentaje", () => {
    expect(estiloNivel(85)).toBe(ESTILO_NIVEL.alto)
    expect(estiloNivel(60)).toBe(ESTILO_NIVEL.medio)
    expect(estiloNivel(45)).toBe(ESTILO_NIVEL.bajo)
    expect(estiloNivel(10)).toBe(ESTILO_NIVEL.critico)
    expect(estiloNivel(85).barra).toBe("bg-nivel-alto")
  })
})
