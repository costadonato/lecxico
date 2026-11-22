import { describe, expect, it } from "vitest"

import { itemsCrudos } from "@/lib/entrenamiento/bancos"
import {
  ABECEDARIO,
  QWERTY,
  detalleEco,
  esLetraDelTeclado,
  escritaIgual,
  letrasQueCambian,
  normalizarSonido,
  suenaIgual,
} from "@/lib/entrenamiento/eco"
import type { Grado } from "@/lib/entrenamiento/juegos"

const GRADOS: Grado[] = [1, 2, 3]
const PALABRAS = GRADOS.flatMap((g) => itemsCrudos("eco", "primario", g).map((i) => i.palabra as string))

describe("suenaIgual: cuenta como bien lo que suena igual", () => {
  it.each([
    ["bentana", "ventana"],
    ["kamiza", "camisa"],
    ["jirafa", "jirafa"],
    ["girafa", "jirafa"],
    ["jelatina", "gelatina"],
    ["sabado", "sábado"],
    ["SÁBADO", "sábado"],
    ["boske", "bosque"],
    ["sirko", "circo"],
    ["mantekiya", "mantequilla"],
    ["amburguesa", "hamburguesa"],
    ["ipopotamo", "hipopótamo"],
    ["benta", "venta"],
    ["embiar", "enviar"],
    ["ombligo", "onbligo"],
    ["rei", "rey"],
    ["calle", "caye"],
    ["zapato", "sapato"],
    ["cielo", "sielo"],
    ["kilo", "quilo"],
    ["sirco", "circo"],
    ["gerra", "jerra"],
    ["pingüino", "pingüino"],
    ["chancho", "chancho"],
    ["serbiyeta", "servilleta"],
    ["teléfono", "telefono"],
  ])("%s suena como %s", (escrita, palabra) => {
    expect(suenaIgual(escrita, palabra)).toBe(true)
  })

  it("todas las palabras del banco suenan igual que sí mismas (y sin tildes)", () => {
    expect(PALABRAS).toHaveLength(45)
    for (const p of PALABRAS) {
      expect(suenaIgual(p, p), p).toBe(true)
      expect(suenaIgual(p.normalize("NFD").replace(/[̀-ͯ]/g, ""), p), p).toBe(true)
    }
  })
})

describe("suenaIgual: cuenta como error lo que cambia el sonido", () => {
  it.each([
    ["betana", "ventana"], // omisión
    ["ventanas", "ventana"], // agregado
    ["vetnana", "ventana"], // inversión
    ["trotuga", "tortuga"], // inversión
    ["pero", "perro"], // r por rr en el medio
    ["perro", "pero"],
    ["ventama", "ventana"], // cambio de letra
    ["dandera", "bandera"], // letra espejo
    ["chanco", "chancho"], // ch no es c
    ["pinguino", "pingüino"], // gui no es güi
    ["guelatina", "gelatina"], // gue es g dura
    ["gitarra", "guitarra"], // gi es j
    ["sirso", "circo"], // co no es so
    ["giso", "guiso"], // gi es j, gui es g dura
    ["", "circo"], // nada escrito
    ["   ", "circo"],
  ])("%s no suena como %s", (escrita, palabra) => {
    expect(suenaIgual(escrita, palabra)).toBe(false)
  })
})

describe("normalizarSonido", () => {
  it("aplica las reglas en orden", () => {
    expect(normalizarSonido("Hamburguesa")).toBe("amburgesa")
    expect(normalizarSonido("chocolate")).toBe("chokolate")
    expect(normalizarSonido("mantequilla")).toBe("mantekiya")
    expect(normalizarSonido("gelatina")).toBe("jelatina")
    expect(normalizarSonido("circo")).toBe("sirko")
    expect(normalizarSonido("enviar")).toBe("embiar")
    expect(normalizarSonido("rey")).toBe("rei")
    expect(normalizarSonido("pingüino")).not.toBe(normalizarSonido("pinguino"))
    expect(normalizarSonido("acción")).toBe("aksion")
  })

  it("la diéresis fuera de güe/güi se ignora", () => {
    expect(normalizarSonido("üna")).toBe("una")
  })
})

describe("escritaIgual", () => {
  it("igual sin distinguir mayúsculas; la tilde sí cuenta", () => {
    expect(escritaIgual("VENTANA", "ventana")).toBe(true)
    expect(escritaIgual("sabado", "sábado")).toBe(false)
    expect(escritaIgual("bentana", "ventana")).toBe(false)
  })
})

describe("letrasQueCambian", () => {
  it("marca las letras de la palabra que se escribieron distinto", () => {
    expect(letrasQueCambian("bentana", "ventana")).toEqual([true, false, false, false, false, false, false])
    expect(letrasQueCambian("sabado", "sábado")).toEqual([false, true, false, false, false, false])
    expect(letrasQueCambian("kamiza", "camisa")).toEqual([true, false, false, false, true, false])
    expect(letrasQueCambian("ipopotamo", "hipopótamo")).toEqual([
      true, false, false, false, false, true, false, false, false, false,
    ])
  })

  it("igual no marca nada; vacío marca todo", () => {
    expect(letrasQueCambian("CIRCO", "circo")).toEqual([false, false, false, false, false])
    expect(letrasQueCambian("", "sol")).toEqual([true, true, true])
  })
})

describe("teclado y detalle", () => {
  it("27 letras con la Ñ, en QWERTY y en orden alfabético", () => {
    expect(QWERTY.flat()).toHaveLength(27)
    expect(new Set(QWERTY.flat())).toEqual(new Set(ABECEDARIO))
    expect(ABECEDARIO).toHaveLength(27)
    expect(ABECEDARIO.indexOf("Ñ")).toBe(ABECEDARIO.indexOf("N") + 1)
  })

  it("teclas físicas aceptadas", () => {
    expect(esLetraDelTeclado("a")).toBe(true)
    expect(esLetraDelTeclado("Ñ")).toBe(true)
    expect(esLetraDelTeclado("á")).toBe(false)
    expect(esLetraDelTeclado("Enter")).toBe(false)
    expect(esLetraDelTeclado("1")).toBe(false)
  })

  it("detalleEco suma lo escrito en cada intento", () => {
    const detalle = [
      { item: "ECO-1-01", correcta: true, intentos: 1 as const },
      { item: "ECO-1-02", correcta: false, intentos: 2 as const },
    ]
    expect(detalleEco(detalle, [["chancho"], ["salo", "salto"]])).toEqual([
      { item: "ECO-1-01", correcta: true, intentos: 1, escrito: ["chancho"] },
      { item: "ECO-1-02", correcta: false, intentos: 2, escrito: ["salo", "salto"] },
    ])
    expect(detalleEco(detalle, [])[1].escrito).toEqual([])
  })
})
