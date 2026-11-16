import { describe, expect, it } from "vitest"
import { avisoCambioNivel, cambioDeNivel } from "./etapa"

describe("cambioDeNivel", () => {
  it("dentro del mismo nivel no hay cambio", () => {
    expect(cambioDeNivel("sala_4", "sala_5")).toBeNull()
    expect(cambioDeNivel("primero", "tercero")).toBeNull()
    expect(cambioDeNivel("segundo", "segundo")).toBeNull()
  })

  it("de inicial a primario", () => {
    expect(cambioDeNivel("sala_5", "primero")).toEqual({ anterior: "inicial", nuevo: "primario" })
  })

  it("de primario a inicial", () => {
    expect(cambioDeNivel("tercero", "sala_4")).toEqual({ anterior: "primario", nuevo: "inicial" })
  })
})

describe("avisoCambioNivel", () => {
  it("sin cambio de nivel no hay aviso", () => {
    expect(avisoCambioNivel("sala_4", "sala_5")).toBeNull()
  })

  it("con cambio de nivel avisa con los nombres de los niveles", () => {
    expect(avisoCambioNivel("sala_5", "primero")).toBe("Con este cambio, la evaluación pasa de Inicial a Primario.")
    expect(avisoCambioNivel("primero", "sala_5")).toBe("Con este cambio, la evaluación pasa de Primario a Inicial.")
  })
})
