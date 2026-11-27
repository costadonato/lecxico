import { describe, expect, it } from "vitest"

import {
  PERIODOS_INFORME,
  diaArgentina,
  enRango,
  esDiaValido,
  formatearDia,
  instanteDelDia,
  rangoDelPeriodo,
} from "@/lib/informes/periodo"

const HOY = new Date("2026-11-27T15:00:00-03:00")

describe("diaArgentina", () => {
  it("usa el día de calendario de Argentina, no el de UTC", () => {
    // 23:30 del 31/10 en Buenos Aires = 02:30 del 1/11 en UTC.
    expect(diaArgentina("2026-11-01T02:30:00Z")).toBe("2026-10-31")
    expect(diaArgentina("2026-11-01T03:00:00Z")).toBe("2026-11-01")
    expect(diaArgentina(new Date("2026-11-27T15:00:00-03:00"))).toBe("2026-11-27")
  })

  it("toma tal cual una fecha sin hora y rechaza lo que no es fecha", () => {
    expect(diaArgentina("2019-05-10")).toBe("2019-05-10")
    expect(diaArgentina("2026-02-30")).toBeNull()
    expect(diaArgentina("no es fecha")).toBeNull()
  })
})

describe("esDiaValido", () => {
  it("acepta días que existen y rechaza los demás", () => {
    expect(esDiaValido("2024-02-29")).toBe(true)
    expect(esDiaValido("2026-02-29")).toBe(false)
    expect(esDiaValido("2026-13-01")).toBe(false)
    expect(esDiaValido("27/11/2026")).toBe(false)
    expect(esDiaValido("")).toBe(false)
  })
})

describe("rangoDelPeriodo", () => {
  it("último mes: del mismo día del mes anterior a hoy", () => {
    expect(rangoDelPeriodo("ultimo_mes", HOY)).toEqual({ desde: "2026-10-27", hasta: "2026-11-27" })
  })

  it("últimos 3 meses: del mismo día de tres meses atrás a hoy", () => {
    expect(rangoDelPeriodo("ultimos_3_meses", HOY)).toEqual({ desde: "2026-08-27", hasta: "2026-11-27" })
  })

  it("si el mes de destino es más corto, usa su último día; cruza el año", () => {
    expect(rangoDelPeriodo("ultimos_3_meses", new Date("2026-05-31T12:00:00-03:00"))?.desde).toBe("2026-02-28")
    expect(rangoDelPeriodo("ultimos_3_meses", new Date("2028-05-31T12:00:00-03:00"))?.desde).toBe("2028-02-29")
    expect(rangoDelPeriodo("ultimo_mes", new Date("2026-01-15T12:00:00-03:00"))?.desde).toBe("2025-12-15")
  })

  it("'hoy' es el día de Argentina aunque en UTC ya sea mañana", () => {
    expect(rangoDelPeriodo("ultimo_mes", new Date("2026-12-01T01:00:00Z"))).toEqual({
      desde: "2026-10-30",
      hasta: "2026-11-30",
    })
  })

  it("todo: sin límites", () => {
    expect(rangoDelPeriodo("todo", HOY)).toEqual({ desde: null, hasta: null })
  })

  it("elegir fechas: las dos incluidas; null si faltan, no existen o están invertidas", () => {
    expect(rangoDelPeriodo("elegir", HOY, { desde: "2026-09-01", hasta: "2026-09-30" })).toEqual({
      desde: "2026-09-01",
      hasta: "2026-09-30",
    })
    expect(rangoDelPeriodo("elegir", HOY, { desde: "2026-09-30", hasta: "2026-09-30" })).not.toBeNull()
    expect(rangoDelPeriodo("elegir", HOY)).toBeNull()
    expect(rangoDelPeriodo("elegir", HOY, { desde: "2026-09-01", hasta: "2026-02-30" })).toBeNull()
    expect(rangoDelPeriodo("elegir", HOY, { desde: "2026-10-01", hasta: "2026-09-30" })).toBeNull()
  })

  it("null si 'hoy' no es una fecha", () => {
    expect(rangoDelPeriodo("ultimo_mes", new Date("x"))).toBeNull()
  })

  it("las opciones visibles son las cuatro del diseño", () => {
    expect(PERIODOS_INFORME.map((p) => p.texto)).toEqual(["Último mes", "Últimos 3 meses", "Todo", "Elegir fechas"])
  })
})

describe("enRango", () => {
  const septiembre = { desde: "2026-09-01", hasta: "2026-09-30" }

  it("incluye el día 'hasta' completo y el 'desde' desde la medianoche, en hora de Argentina", () => {
    expect(enRango("2026-09-30T23:59:00-03:00", septiembre)).toBe(true)
    expect(enRango("2026-10-01T00:00:00-03:00", septiembre)).toBe(false)
    expect(enRango("2026-09-01T00:00:00-03:00", septiembre)).toBe(true)
    expect(enRango("2026-08-31T23:59:00-03:00", septiembre)).toBe(false)
  })

  it("sin límites entra todo; una fecha ilegible nunca entra", () => {
    expect(enRango("2001-01-01T00:00:00Z", { desde: null, hasta: null })).toBe(true)
    expect(enRango("x", { desde: null, hasta: null })).toBe(false)
  })

  it("con un solo límite, compara solo ese", () => {
    expect(enRango("2026-01-01", { desde: null, hasta: "2026-09-30" })).toBe(true)
    expect(enRango("2027-01-01", { desde: "2026-09-01", hasta: null })).toBe(true)
  })
})

describe("formatearDia e instanteDelDia", () => {
  it("dd/mm/aaaa", () => {
    expect(formatearDia("2026-09-05")).toBe("05/09/2026")
  })

  it("el instante cae en ese día de Argentina", () => {
    expect(diaArgentina(instanteDelDia("2026-09-05"))).toBe("2026-09-05")
  })
})
