import { describe, expect, it } from "vitest"

import { duracionMaxima, elegirVoz, obtenerEstado, obtenerEstadoServidor } from "@/lib/entrenamiento/audio"

const voz = (lang: string, name = lang) => ({ lang, name })

describe("elegirVoz", () => {
  it("prefiere es-AR", () => {
    expect(elegirVoz([voz("es-ES"), voz("es-MX"), voz("es-AR"), voz("es-US")])?.lang).toBe("es-AR")
  })

  it("sigue el orden es-US, es-419, es-MX", () => {
    expect(elegirVoz([voz("es-MX"), voz("es-US")])?.lang).toBe("es-US")
    expect(elegirVoz([voz("es-MX"), voz("es-419")])?.lang).toBe("es-419")
    expect(elegirVoz([voz("es-ES"), voz("es-MX")])?.lang).toBe("es-MX")
  })

  it("acepta guion bajo y mayúsculas (Android)", () => {
    expect(elegirVoz([voz("es_ES"), voz("ES_ar")])?.lang).toBe("ES_ar")
  })

  it("si no hay ninguna preferida, usa cualquier español", () => {
    expect(elegirVoz([voz("en-US"), voz("es-ES")])?.lang).toBe("es-ES")
  })

  it("sin español devuelve null", () => {
    expect(elegirVoz([voz("en-US")])).toBeNull()
    expect(elegirVoz([])).toBeNull()
  })
})

describe("duracionMaxima", () => {
  it("da al menos 7 segundos y crece con el texto", () => {
    expect(duracionMaxima("vaca")).toBe(7000)
    expect(duracionMaxima("a".repeat(100), 1)).toBe(18000)
    expect(duracionMaxima("a".repeat(100), 0.5)).toBe(33000)
  })
})

describe("estado inicial", () => {
  it("sin audio sonando, en el cliente y en el servidor", () => {
    expect(obtenerEstado()).toEqual({ dueno: null, texto: null })
    expect(obtenerEstadoServidor()).toEqual({ dueno: null, texto: null })
  })
})
