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
  it("devuelve una ruta interna tal cual, con consulta y ancla", () => {
    expect(rutaSegura("/ninos")).toBe("/ninos")
    expect(rutaSegura("/restablecer")).toBe("/restablecer")
    expect(rutaSegura("/ninos/abc?pestana=seguimiento")).toBe("/ninos/abc?pestana=seguimiento")
    expect(rutaSegura("/ninos/abc?x=1#y")).toBe("/ninos/abc?x=1#y")
    expect(rutaSegura("/")).toBe("/")
  })

  it("sin next usa /dashboard", () => {
    expect(rutaSegura(null)).toBe("/dashboard")
    expect(rutaSegura(undefined)).toBe("/dashboard")
    expect(rutaSegura("")).toBe("/dashboard")
  })

  it("rechaza las rutas que no empiezan con /", () => {
    expect(rutaSegura("ninos")).toBe("/dashboard")
    expect(rutaSegura("?next=/ninos")).toBe("/dashboard")
  })

  it("rechaza esquemas: https:, javascript: y data:", () => {
    expect(rutaSegura("https://otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("javascript:alert(1)")).toBe("/dashboard")
    expect(rutaSegura("data:text/html,<script>alert(1)</script>")).toBe("/dashboard")
  })

  it("rechaza las que empiezan con //: apuntan a otro sitio o no se pueden leer", () => {
    expect(rutaSegura("//otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("///otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("//")).toBe("/dashboard")
  })

  it("rechaza la barra invertida", () => {
    expect(rutaSegura(String.raw`/\otro-sitio.com`)).toBe("/dashboard")
    expect(rutaSegura(String.raw`/ninos\abc`)).toBe("/dashboard")
  })

  it("rechaza tabulación, salto de línea y retorno de carro (el navegador los descarta)", () => {
    expect(rutaSegura("/\t/otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("/\n/otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("/\r/otro-sitio.com")).toBe("/dashboard")
  })

  it("rechaza los demás caracteres de control: 0x00, 0x1F y 0x7F", () => {
    expect(rutaSegura("/ninos\u0000")).toBe("/dashboard")
    expect(rutaSegura("/ninos\u001f")).toBe("/dashboard")
    expect(rutaSegura("/ninos\u007f")).toBe("/dashboard")
  })

  it("acepta caracteres que no son de control: espacio y 0x80", () => {
    expect(rutaSegura("/ninos abc")).toBe("/ninos abc")
    expect(rutaSegura("/ninos\u0080")).toBe("/ninos\u0080")
  })

  it("acepta rutas que, resueltas, siguen en el mismo sitio", () => {
    expect(rutaSegura("/%2F%2Fotro-sitio.com")).toBe("/%2F%2Fotro-sitio.com")
    expect(rutaSegura("/ninos/../perfil")).toBe("/ninos/../perfil")
  })

  it("rechaza las que, resueltas, dejan un pathname que empieza con //", () => {
    expect(new URL("/..//otro-sitio.com", "https://lecxico.test").pathname).toBe("//otro-sitio.com")
    expect(rutaSegura("/..//otro-sitio.com")).toBe("/dashboard")
    expect(rutaSegura("/.//otro-sitio.com")).toBe("/dashboard")
  })

  it("usa el valor por defecto que se le pase", () => {
    expect(rutaSegura(null, "/perfil")).toBe("/perfil")
    expect(rutaSegura("//otro-sitio.com", "/perfil")).toBe("/perfil")
    expect(rutaSegura("/\t/otro-sitio.com", "/perfil")).toBe("/perfil")
    expect(rutaSegura("/ninos", "/perfil")).toBe("/ninos")
  })
})
