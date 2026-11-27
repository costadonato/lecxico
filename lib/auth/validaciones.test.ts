import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  emailValido,
  errorPassword,
  fechaNacimientoValida,
  hoyISO,
  NOMBRE_USUARIO_RE,
  nombreUsuarioValido,
  normalizarNombreUsuario,
  PASSWORD_MIN,
  REGLA_NOMBRE_USUARIO,
} from "./validaciones"

describe("normalizarNombreUsuario", () => {
  it("saca los espacios de alrededor y pasa a minúsculas", () => {
    expect(normalizarNombreUsuario("  Ana.Perez  ")).toBe("ana.perez")
  })

  it("no toca los espacios del medio ni un texto vacío", () => {
    expect(normalizarNombreUsuario("ana perez")).toBe("ana perez")
    expect(normalizarNombreUsuario("")).toBe("")
  })
})

describe("nombreUsuarioValido", () => {
  it("acepta letras, números, punto y guion bajo", () => {
    expect(nombreUsuarioValido("ana.perez_2")).toBe(true)
  })

  it("normaliza antes de validar: mayúsculas y espacios de alrededor no lo invalidan", () => {
    expect(nombreUsuarioValido("  Ana.Perez ")).toBe(true)
  })

  it("largo: 3 y 30 caracteres valen; 2 y 31, no", () => {
    expect(nombreUsuarioValido("abc")).toBe(true)
    expect(nombreUsuarioValido("a".repeat(30))).toBe(true)
    expect(nombreUsuarioValido("ab")).toBe(false)
    expect(nombreUsuarioValido("a".repeat(31))).toBe(false)
    expect(nombreUsuarioValido("")).toBe(false)
  })

  it("caracteres: rechaza acentos, ñ, guion, espacios internos y arroba", () => {
    expect(nombreUsuarioValido("josé")).toBe(false)
    expect(nombreUsuarioValido("nono_ñ")).toBe(false)
    expect(nombreUsuarioValido("ana-perez")).toBe(false)
    expect(nombreUsuarioValido("ana perez")).toBe(false)
    expect(nombreUsuarioValido("ana@perez")).toBe(false)
  })

  it("la expresión y la regla visible dicen lo mismo (3 a 30)", () => {
    expect(NOMBRE_USUARIO_RE.source).toContain("{3,30}")
    expect(REGLA_NOMBRE_USUARIO).toContain("Entre 3 y 30 caracteres")
  })
})

describe("emailValido", () => {
  it("acepta un correo común, con espacios alrededor", () => {
    expect(emailValido("tutor@ejemplo.com")).toBe(true)
    expect(emailValido("  tutor.uno+lecxico@ejemplo.com.ar ")).toBe(true)
  })

  it("rechaza sin arroba, con dos arrobas o con espacios internos", () => {
    expect(emailValido("tutorejemplo.com")).toBe(false)
    expect(emailValido("tutor@@ejemplo.com")).toBe(false)
    expect(emailValido("tu tor@ejemplo.com")).toBe(false)
  })

  it("rechaza sin dominio, sin punto o con terminación de una letra", () => {
    expect(emailValido("tutor@")).toBe(false)
    expect(emailValido("tutor@ejemplo")).toBe(false)
    expect(emailValido("tutor@ejemplo.c")).toBe(false)
    expect(emailValido("tutor@ejemplo.co")).toBe(true)
  })

  it("rechaza un texto vacío", () => {
    expect(emailValido("")).toBe(false)
    expect(emailValido("   ")).toBe(false)
  })
})

describe("errorPassword", () => {
  it("con 8 o más caracteres y la confirmación igual no hay error", () => {
    expect(PASSWORD_MIN).toBe(8)
    expect(errorPassword("12345678", "12345678")).toBeNull()
    expect(errorPassword("una contraseña larga", "una contraseña larga")).toBeNull()
  })

  it("con menos de 8 caracteres avisa el mínimo", () => {
    expect(errorPassword("1234567", "1234567")).toBe("La contraseña debe tener al menos 8 caracteres.")
    expect(errorPassword("", "")).toBe("La contraseña debe tener al menos 8 caracteres.")
  })

  it("si la confirmación no coincide lo avisa", () => {
    expect(errorPassword("12345678", "12345679")).toBe("Las contraseñas no coinciden.")
    expect(errorPassword("12345678", "")).toBe("Las contraseñas no coinciden.")
  })

  it("el largo se revisa antes que la confirmación", () => {
    expect(errorPassword("123", "456")).toBe("La contraseña debe tener al menos 8 caracteres.")
  })
})

describe("hoyISO y fechaNacimientoValida", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Las fechas se arman con el constructor local, así las pruebas no dependen de la zona horaria.
  const fijarHoy = (anio: number, mes: number, dia: number) => vi.setSystemTime(new Date(anio, mes - 1, dia, 10, 0))

  it("hoyISO devuelve la fecha local como YYYY-MM-DD, con ceros a la izquierda", () => {
    fijarHoy(2026, 11, 27)
    expect(hoyISO()).toBe("2026-11-27")
    fijarHoy(2026, 3, 5)
    expect(hoyISO()).toBe("2026-03-05")
  })

  it("hoyISO usa la hora local también cerca de la medianoche", () => {
    vi.setSystemTime(new Date(2026, 0, 1, 0, 5))
    expect(hoyISO()).toBe("2026-01-01")
    vi.setSystemTime(new Date(2025, 11, 31, 23, 55))
    expect(hoyISO()).toBe("2025-12-31")
  })

  it("acepta una fecha real anterior a hoy", () => {
    fijarHoy(2026, 11, 27)
    expect(fechaNacimientoValida("2020-05-10")).toBe(true)
  })

  it("hoy no vale; ayer sí (también en el cambio de mes y de año)", () => {
    fijarHoy(2026, 11, 27)
    expect(fechaNacimientoValida("2026-11-27")).toBe(false)
    expect(fechaNacimientoValida("2026-11-26")).toBe(true)
    fijarHoy(2026, 3, 1)
    expect(fechaNacimientoValida("2026-02-28")).toBe(true)
    expect(fechaNacimientoValida("2026-03-01")).toBe(false)
    fijarHoy(2026, 1, 1)
    expect(fechaNacimientoValida("2025-12-31")).toBe(true)
    expect(fechaNacimientoValida("2026-01-01")).toBe(false)
  })

  it("rechaza una fecha futura", () => {
    fijarHoy(2026, 11, 27)
    expect(fechaNacimientoValida("2027-01-01")).toBe(false)
  })

  it("el límite inferior es 1900: 01/01/1900 vale y 31/12/1899 no", () => {
    fijarHoy(2026, 11, 27)
    expect(fechaNacimientoValida("1900-01-01")).toBe(true)
    expect(fechaNacimientoValida("1899-12-31")).toBe(false)
  })

  it("rechaza días que no existen y respeta los años bisiestos", () => {
    fijarHoy(2026, 11, 27)
    expect(fechaNacimientoValida("2020-02-30")).toBe(false)
    expect(fechaNacimientoValida("2021-02-29")).toBe(false)
    expect(fechaNacimientoValida("2020-02-29")).toBe(true)
    expect(fechaNacimientoValida("2020-04-31")).toBe(false)
    expect(fechaNacimientoValida("2020-13-01")).toBe(false)
    expect(fechaNacimientoValida("2020-00-10")).toBe(false)
  })

  it("rechaza otros formatos y el texto vacío", () => {
    fijarHoy(2026, 11, 27)
    expect(fechaNacimientoValida("10/05/2020")).toBe(false)
    expect(fechaNacimientoValida("2020-5-10")).toBe(false)
    expect(fechaNacimientoValida("2020-05-10T00:00:00")).toBe(false)
    expect(fechaNacimientoValida("")).toBe(false)
  })
})
