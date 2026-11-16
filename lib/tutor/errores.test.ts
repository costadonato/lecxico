import { describe, expect, it } from "vitest"
import {
  MENSAJE_CONTRASENA_INCORRECTA,
  MENSAJE_ERROR_ACCION,
  MENSAJE_MUCHOS_INTENTOS,
  mensajeErrorContrasena,
  mensajeErrorFuncion,
} from "./errores"

describe("mensajeErrorContrasena", () => {
  it("contraseña incorrecta (invalid_credentials)", () => {
    expect(mensajeErrorContrasena({ status: 400, code: "invalid_credentials" })).toBe(MENSAJE_CONTRASENA_INCORRECTA)
  })

  it("límite de intentos por status 429", () => {
    expect(mensajeErrorContrasena({ status: 429 })).toBe(MENSAJE_MUCHOS_INTENTOS)
  })

  it("límite de intentos por código, aunque no venga el status", () => {
    expect(mensajeErrorContrasena({ code: "over_request_rate_limit" })).toBe(MENSAJE_MUCHOS_INTENTOS)
  })

  it("el límite de intentos gana aunque el código sea invalid_credentials", () => {
    expect(mensajeErrorContrasena({ status: 429, code: "invalid_credentials" })).toBe(MENSAJE_MUCHOS_INTENTOS)
  })

  it("cualquier otro error → genérico", () => {
    expect(mensajeErrorContrasena({ status: 500, code: "unexpected_failure" })).toBe(MENSAJE_ERROR_ACCION)
    expect(mensajeErrorContrasena({ status: 400, code: "email_not_confirmed" })).toBe(MENSAJE_ERROR_ACCION)
    expect(mensajeErrorContrasena({})).toBe(MENSAJE_ERROR_ACCION)
  })

  it("sin error (no debería pasar) → genérico", () => {
    expect(mensajeErrorContrasena(null)).toBe(MENSAJE_ERROR_ACCION)
    expect(mensajeErrorContrasena(undefined)).toBe(MENSAJE_ERROR_ACCION)
  })

  it("los textos son los acordados", () => {
    expect(MENSAJE_CONTRASENA_INCORRECTA).toBe("La contraseña no es correcta.")
    expect(MENSAJE_MUCHOS_INTENTOS).toBe("Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.")
    expect(MENSAJE_ERROR_ACCION).toBe("No se pudo completar la acción. Probá de nuevo.")
  })
})

describe("mensajeErrorFuncion", () => {
  it("un raise exception (P0001) se muestra tal cual", () => {
    expect(mensajeErrorFuncion({ code: "P0001", message: "Esta invitación ya no está pendiente." })).toBe(
      "Esta invitación ya no está pendiente.",
    )
  })

  it("un P0001 sin mensaje → genérico", () => {
    expect(mensajeErrorFuncion({ code: "P0001", message: "   " })).toBe(MENSAJE_ERROR_ACCION)
    expect(mensajeErrorFuncion({ code: "P0001" })).toBe(MENSAJE_ERROR_ACCION)
  })

  it("otros errores (permisos, red, constraint) → genérico", () => {
    expect(mensajeErrorFuncion({ code: "42501", message: "permission denied for function" })).toBe(MENSAJE_ERROR_ACCION)
    expect(mensajeErrorFuncion({ message: "fetch failed" })).toBe(MENSAJE_ERROR_ACCION)
  })

  it("sin error → genérico", () => {
    expect(mensajeErrorFuncion(null)).toBe(MENSAJE_ERROR_ACCION)
    expect(mensajeErrorFuncion(undefined)).toBe(MENSAJE_ERROR_ACCION)
  })
})
