import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { calcularEdad, formatearFecha, formatearFechaCorta, formatearFechaHora, textoEdad, tiempoRelativo } from "./fechas"

// Los timestamps se arman con el constructor local (new Date(año, mes, día, ...))
// y se pasan a ISO, así las pruebas dan lo mismo en cualquier zona horaria.
const iso = (anio: number, mes: number, dia: number, h = 12, min = 0) => new Date(anio, mes - 1, dia, h, min).toISOString()

describe("formatearFecha", () => {
  it("una fecha sin hora se lee tal cual, sin correrse un día", () => {
    expect(formatearFecha("2019-05-10")).toBe("10/05/2019")
    expect(formatearFecha("2026-01-01")).toBe("01/01/2026")
    expect(formatearFecha("2025-12-31")).toBe("31/12/2025")
  })

  it("un timestamp se muestra en la fecha local como dd/mm/aaaa", () => {
    expect(formatearFecha(iso(2026, 11, 27, 15, 30))).toBe("27/11/2026")
  })

  it("en el cambio de mes y de año usa el día local", () => {
    expect(formatearFecha(iso(2026, 11, 30, 23, 59))).toBe("30/11/2026")
    expect(formatearFecha(iso(2026, 12, 1, 0, 1))).toBe("01/12/2026")
    expect(formatearFecha(iso(2025, 12, 31, 23, 59))).toBe("31/12/2025")
    expect(formatearFecha(iso(2026, 1, 1, 0, 0))).toBe("01/01/2026")
  })

  it("sin fecha devuelve una cadena vacía", () => {
    expect(formatearFecha(null)).toBe("")
    expect(formatearFecha(undefined)).toBe("")
    expect(formatearFecha("")).toBe("")
  })

  // POSIBLE ERROR (no se corrige acá; ver el resumen de proceso-bloque-b):
  // la función promete "cadena vacía si no hay fecha", pero un texto que no es
  // fecha devuelve "Invalid Date", y una fecha sin hora no se valida (mes 13).
  it("hoy, un texto que no es fecha da 'Invalid Date' y un mes 13 se muestra igual", () => {
    expect(formatearFecha("no es fecha")).toBe("Invalid Date")
    expect(formatearFecha("2026-13-45")).toBe("45/13/2026")
  })
})

describe("formatearFechaCorta", () => {
  it("devuelve dd/mm", () => {
    expect(formatearFechaCorta("2026-11-27")).toBe("27/11")
    expect(formatearFechaCorta(iso(2026, 1, 1, 0, 0))).toBe("01/01")
  })

  it("sin fecha devuelve una cadena vacía", () => {
    expect(formatearFechaCorta(null)).toBe("")
    expect(formatearFechaCorta(undefined)).toBe("")
  })

  // POSIBLE ERROR: hereda el caso anterior y recorta "Invalid Date".
  it("hoy, un texto que no es fecha da 'Inval'", () => {
    expect(formatearFechaCorta("no es fecha")).toBe("Inval")
  })
})

describe("calcularEdad", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 27, 10, 0)) // 27/11/2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("cuenta los años cumplidos", () => {
    expect(calcularEdad("2020-05-10")).toBe(6)
  })

  it("el día del cumpleaños ya los cumplió; el día antes, no", () => {
    expect(calcularEdad("2020-11-27")).toBe(6)
    expect(calcularEdad("2020-11-28")).toBe(5)
    expect(calcularEdad("2020-12-01")).toBe(5)
    expect(calcularEdad("2020-10-31")).toBe(6)
  })

  it("en el cambio de año: el 31/12 todavía no cumplió quien nació el 01/01", () => {
    vi.setSystemTime(new Date(2025, 11, 31, 10, 0))
    expect(calcularEdad("2019-01-01")).toBe(6)
    expect(calcularEdad("2019-12-31")).toBe(6)
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0))
    expect(calcularEdad("2019-01-01")).toBe(7)
  })

  it("nacido hoy tiene 0 años; una fecha futura da null", () => {
    expect(calcularEdad("2026-11-27")).toBe(0)
    expect(calcularEdad("2026-11-28")).toBeNull()
    expect(calcularEdad("2030-01-01")).toBeNull()
  })

  it("sin fecha o con otro formato da null", () => {
    expect(calcularEdad(null)).toBeNull()
    expect(calcularEdad(undefined)).toBeNull()
    expect(calcularEdad("")).toBeNull()
    expect(calcularEdad("10/05/2020")).toBeNull()
    expect(calcularEdad("2020-05-10T00:00:00Z")).toBeNull()
  })

  // POSIBLE ERROR (no se corrige acá; ver el resumen de proceso-bloque-b):
  // la función promete "null si no es válida", pero solo revisa el formato.
  // Un mes 13 resta un año (como si no hubiera llegado el cumpleaños).
  it("hoy, una fecha con formato correcto pero imposible devuelve un número", () => {
    expect(calcularEdad("2020-13-01")).toBe(5)
    expect(calcularEdad("2020-02-30")).toBe(6)
  })
})

describe("textoEdad", () => {
  it("singular y plural", () => {
    expect(textoEdad(1)).toBe("1 año")
    expect(textoEdad(6)).toBe("6 años")
    expect(textoEdad(0)).toBe("0 años")
  })

  it("sin edad devuelve una cadena vacía", () => {
    expect(textoEdad(null)).toBe("")
  })
})

describe("formatearFechaHora", () => {
  it("muestra dd/mm/aaaa hh:mm en 24 h y hora local", () => {
    expect(formatearFechaHora(iso(2026, 11, 27, 15, 7))).toBe("27/11/2026 15:07")
    expect(formatearFechaHora(iso(2026, 3, 5, 9, 0))).toBe("05/03/2026 09:00")
  })

  it("en el cambio de año y a la medianoche", () => {
    expect(formatearFechaHora(iso(2025, 12, 31, 23, 59))).toBe("31/12/2025 23:59")
    expect(formatearFechaHora(iso(2026, 1, 1, 0, 0))).toBe("01/01/2026 00:00")
  })

  it("sin fecha devuelve una cadena vacía", () => {
    expect(formatearFechaHora(null)).toBe("")
    expect(formatearFechaHora(undefined)).toBe("")
    expect(formatearFechaHora("")).toBe("")
  })

  // POSIBLE ERROR (no se corrige acá; ver el resumen de proceso-bloque-b):
  // un texto que no es fecha no da cadena vacía sino "NaN/NaN/NaN NaN:NaN".
  it("hoy, un texto que no es fecha da NaN", () => {
    expect(formatearFechaHora("no es fecha")).toBe("NaN/NaN/NaN NaN:NaN")
  })
})

describe("tiempoRelativo", () => {
  const ahora = new Date(2026, 10, 27, 12, 0) // 27/11/2026 12:00
  const menos = (ms: number) => new Date(ahora.getTime() - ms)
  const MIN = 60_000
  const HORA = 60 * MIN
  const DIA = 24 * HORA

  it("menos de 2 minutos (y una fecha futura) es 'hace 1 minuto'", () => {
    expect(tiempoRelativo(ahora, ahora)).toBe("hace 1 minuto")
    expect(tiempoRelativo(menos(119_999), ahora)).toBe("hace 1 minuto")
    expect(tiempoRelativo(new Date(ahora.getTime() + 5 * MIN), ahora)).toBe("hace 1 minuto")
  })

  it("minutos: de 2 a 59", () => {
    expect(tiempoRelativo(menos(2 * MIN), ahora)).toBe("hace 2 minutos")
    expect(tiempoRelativo(menos(59 * MIN), ahora)).toBe("hace 59 minutos")
  })

  it("horas: de 1 a 23, en singular y plural", () => {
    expect(tiempoRelativo(menos(60 * MIN), ahora)).toBe("hace 1 hora")
    expect(tiempoRelativo(menos(3 * HORA), ahora)).toBe("hace 3 horas")
    expect(tiempoRelativo(menos(23 * HORA + 59 * MIN), ahora)).toBe("hace 23 horas")
  })

  it("días: de 1 a 6", () => {
    expect(tiempoRelativo(menos(DIA), ahora)).toBe("hace 1 día")
    expect(tiempoRelativo(menos(6 * DIA), ahora)).toBe("hace 6 días")
  })

  it("semanas: de 7 a 29 días", () => {
    expect(tiempoRelativo(menos(7 * DIA), ahora)).toBe("hace 1 semana")
    expect(tiempoRelativo(menos(14 * DIA), ahora)).toBe("hace 2 semanas")
    expect(tiempoRelativo(menos(29 * DIA), ahora)).toBe("hace 4 semanas")
  })

  it("meses de calendario: 30 días ya es 'hace 1 mes'", () => {
    expect(tiempoRelativo(new Date(2026, 9, 28, 12, 0), ahora)).toBe("hace 1 mes") // 30 días, falta un día de calendario
    expect(tiempoRelativo(new Date(2026, 9, 27, 12, 0), ahora)).toBe("hace 1 mes")
    expect(tiempoRelativo(new Date(2026, 6, 27, 12, 0), ahora)).toBe("hace 4 meses")
    expect(tiempoRelativo(new Date(2026, 6, 28, 12, 0), ahora)).toBe("hace 3 meses")
  })

  it("en el cambio de mes: del 31/01 al 02/03 es 1 mes", () => {
    expect(tiempoRelativo(new Date(2026, 0, 31, 12, 0), new Date(2026, 2, 2, 12, 0))).toBe("hace 1 mes")
  })

  it("en el cambio de año cuenta los meses entre diciembre y enero", () => {
    expect(tiempoRelativo(new Date(2025, 11, 15, 12, 0), new Date(2026, 1, 20, 12, 0))).toBe("hace 2 meses")
    expect(tiempoRelativo(new Date(2025, 11, 31, 12, 0), new Date(2026, 1, 1, 12, 0))).toBe("hace 1 mes")
  })

  it("años: 12 meses de calendario o más", () => {
    expect(tiempoRelativo(new Date(2025, 10, 27, 12, 0), ahora)).toBe("hace 1 año")
    expect(tiempoRelativo(new Date(2025, 10, 28, 12, 0), ahora)).toBe("hace 11 meses")
    expect(tiempoRelativo(new Date(2023, 5, 1, 12, 0), ahora)).toBe("hace 3 años")
  })

  it("acepta un texto ISO", () => {
    expect(tiempoRelativo(menos(3 * HORA).toISOString(), ahora)).toBe("hace 3 horas")
  })

  it("sin 'ahora' usa la hora actual", () => {
    expect(tiempoRelativo(new Date())).toBe("hace 1 minuto")
  })

  // POSIBLE ERROR (no se corrige acá; ver el resumen de proceso-bloque-b):
  // una fecha que no se puede leer atraviesa todas las comparaciones con NaN.
  it("hoy, una fecha que no se puede leer da 'hace NaN años'", () => {
    expect(tiempoRelativo("no es fecha", ahora)).toBe("hace NaN años")
  })
})
