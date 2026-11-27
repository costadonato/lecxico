import { describe, expect, it } from "vitest"
import { coincideRuta, RUTA_INICIO, RUTAS_PROTEGIDAS, RUTAS_SOLO_INVITADOS, rutaSegura } from "./rutas"

describe("constantes de rutas", () => {
  it("el inicio es /dashboard y está protegido", () => {
    expect(RUTA_INICIO).toBe("/dashboard")
    expect(RUTAS_PROTEGIDAS).toContain(RUTA_INICIO)
  })

  it("ninguna ruta es a la vez protegida y solo para invitados", () => {
    for (const ruta of RUTAS_SOLO_INVITADOS) expect(RUTAS_PROTEGIDAS).not.toContain(ruta)
  })
})

describe("coincideRuta", () => {
  it("coincide con la base exacta", () => {
    expect(coincideRuta("/test", "/test")).toBe(true)
  })

  it("coincide con las rutas debajo de la base", () => {
    expect(coincideRuta("/test/inicial", "/test")).toBe(true)
    expect(coincideRuta("/ninos/abc/tests/1", "/ninos")).toBe(true)
    expect(coincideRuta("/test/", "/test")).toBe(true)
  })

  it("no coincide con rutas que solo empiezan igual", () => {
    expect(coincideRuta("/testing", "/test")).toBe(false)
    expect(coincideRuta("/entrenamientos", "/entrenamiento")).toBe(false)
    expect(coincideRuta("/entrenar", "/entrenamiento")).toBe(false)
  })

  it("no coincide con otra ruta ni con una vacía", () => {
    expect(coincideRuta("/perfil", "/test")).toBe(false)
    expect(coincideRuta("", "/test")).toBe(false)
  })
})

describe("rutaSegura", () => {
  it("devuelve una ruta interna tal cual, con consulta incluida", () => {
    expect(rutaSegura("/ninos")).toBe("/ninos")
    expect(rutaSegura("/restablecer")).toBe("/restablecer")
    expect(rutaSegura("/ninos/abc?pestana=seguimiento")).toBe("/ninos/abc?pestana=seguimiento")
    expect(rutaSegura("/")).toBe("/")
  })

  it("sin next usa /dashboard", () => {
    expect(rutaSegura(null)).toBe("/dashboard")
    expect(rutaSegura(undefined)).toBe("/dashboard")
    expect(rutaSegura("")).toBe("/dashboard")
  })

  it("rechaza URLs absolutas y rutas relativas", () => {
    expect(rutaSegura("https://otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("javascript:alert(1)")).toBe("/dashboard")
    expect(rutaSegura("ninos")).toBe("/dashboard")
  })

  it("rechaza las rutas que el navegador lee como otro sitio (// y /\\)", () => {
    expect(rutaSegura("//otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("/\\otro-sitio.com")).toBe("/dashboard")
  })

  it("usa el valor por defecto que se le pase", () => {
    expect(rutaSegura(null, "/perfil")).toBe("/perfil")
    expect(rutaSegura("//otro-sitio.com", "/perfil")).toBe("/perfil")
    expect(rutaSegura("/ninos", "/perfil")).toBe("/ninos")
  })

  // POSIBLE ERROR (no se corrige acá; ver el resumen de proceso-bloque-b):
  // una tabulación o un salto de línea después de la primera barra pasan el
  // filtro, pero el parser de URL del navegador los descarta y "/\t/otro.com"
  // queda como "//otro.com", que apunta a otro sitio. En /login, router.push(next)
  // podría redirigir afuera. En /auth/callback no, porque antepone el origin.
  it("hoy deja pasar una tabulación o un salto de línea después de la barra", () => {
    expect(rutaSegura("/\t/otro-sitio.com")).toBe("/\t/otro-sitio.com")
    expect(rutaSegura("/\n/otro-sitio.com")).toBe("/\n/otro-sitio.com")
    expect(new URL("/\t/otro-sitio.com", "https://lecxico.test").host).toBe("otro-sitio.com")
  })
})
