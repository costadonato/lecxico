import { describe, expect, it } from "vitest"

import { objetivosCaza, partirOracion, textoCantidadErrores } from "@/lib/entrenamiento/caza"

describe("partirOracion", () => {
  it("la puntuación queda pegada pero fuera de la palabra", () => {
    expect(partirOracion("¿Viene mañana, a la tarde?")).toEqual([
      { palabra: "Viene", antes: "¿", despues: "" },
      { palabra: "mañana", antes: "", despues: "," },
      { palabra: "a", antes: "", despues: "" },
      { palabra: "la", antes: "", despues: "" },
      { palabra: "tarde", antes: "", despues: "?" },
    ])
  })

  it("ignora espacios de más", () => {
    expect(partirOracion("  El  sol. ").map((p) => p.palabra)).toEqual(["El", "sol"])
  })
})

describe("objetivosCaza", () => {
  it("índices de las palabras con error, en orden", () => {
    const palabras = partirOracion("El ternero blanco corre por el pardo verde tobas las mañanas.")
    expect(objetivosCaza(palabras, { tobas: "todas", pardo: "prado" })).toEqual([6, 8])
  })

  it("una palabra repetida cuenta solo la primera vez; una que no está, nunca", () => {
    const palabras = partirOracion("la cara y la cara")
    expect(objetivosCaza(palabras, { cara: "casa", nube: "luna" })).toEqual([1])
  })
})

describe("textoCantidadErrores", () => {
  it("singular y plural", () => {
    expect(textoCantidadErrores(1)).toBe("En esta oración hay 1 palabra mal escrita")
    expect(textoCantidadErrores(2)).toBe("En esta oración hay 2 palabras mal escritas")
  })
})
