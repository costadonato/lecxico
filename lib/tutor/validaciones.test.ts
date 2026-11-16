import { describe, expect, it } from "vitest"
import { esContrasena, esEleccionHistorial, esEtapaEscolar, esUuid } from "./validaciones"

describe("esUuid", () => {
  it("acepta un uuid, en minúsculas o mayúsculas", () => {
    expect(esUuid("3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b")).toBe(true)
    expect(esUuid("3F2A1B4C-5D6E-4F70-8A9B-0C1D2E3F4A5B")).toBe(true)
  })

  it("rechaza textos que no son uuid y otros tipos", () => {
    expect(esUuid("")).toBe(false)
    expect(esUuid("abc")).toBe(false)
    expect(esUuid("3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b; drop table")).toBe(false)
    expect(esUuid(null)).toBe(false)
    expect(esUuid(42)).toBe(false)
  })
})

describe("esEtapaEscolar", () => {
  it("acepta las cinco etapas", () => {
    for (const etapa of ["sala_4", "sala_5", "primero", "segundo", "tercero"]) expect(esEtapaEscolar(etapa)).toBe(true)
  })

  it("rechaza otros valores", () => {
    expect(esEtapaEscolar("cuarto")).toBe(false)
    expect(esEtapaEscolar("")).toBe(false)
    expect(esEtapaEscolar(undefined)).toBe(false)
    expect(esEtapaEscolar(1)).toBe(false)
  })
})

describe("esContrasena", () => {
  it("acepta cualquier texto no vacío, con espacios incluidos", () => {
    expect(esContrasena("secreta123")).toBe(true)
    expect(esContrasena(" ")).toBe(true)
  })

  it("rechaza vacío y otros tipos", () => {
    expect(esContrasena("")).toBe(false)
    expect(esContrasena(undefined)).toBe(false)
    expect(esContrasena(12345678)).toBe(false)
  })
})

describe("esEleccionHistorial", () => {
  it("acepta true, false y null", () => {
    expect(esEleccionHistorial(true)).toBe(true)
    expect(esEleccionHistorial(false)).toBe(true)
    expect(esEleccionHistorial(null)).toBe(true)
  })

  it("rechaza undefined y otros tipos", () => {
    expect(esEleccionHistorial(undefined)).toBe(false)
    expect(esEleccionHistorial("true")).toBe(false)
    expect(esEleccionHistorial(1)).toBe(false)
  })
})
