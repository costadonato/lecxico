import { describe, expect, it } from "vitest"

import {
  bloquesMasDebiles,
  ordenRecomendacion,
  porcentajeBloque,
  type BloqueResultado,
} from "@/lib/test/analisis"
import type { BloqueCodigo } from "@/lib/test/bloques"

/** Resultado de un bloque para las pruebas. */
function bloque(codigo: BloqueCodigo, orden: number, correctas: number, total: number): BloqueResultado {
  return { bloque_codigo: codigo, orden, correctas, total }
}

/** Códigos de una lista de bloques, para comparar el orden de un vistazo. */
const codigos = (bloques: BloqueResultado[]) => bloques.map((b) => b.bloque_codigo)

describe("porcentajeBloque", () => {
  it("calcula el porcentaje de acierto", () => {
    expect(porcentajeBloque(7, 10)).toBe(70)
  })

  it("redondea al entero más cercano", () => {
    expect(porcentajeBloque(2, 3)).toBe(67)
    expect(porcentajeBloque(1, 3)).toBe(33)
  })

  it("devuelve 0 si el bloque no tiene ejercicios, sin dividir por cero", () => {
    expect(porcentajeBloque(0, 0)).toBe(0)
    expect(porcentajeBloque(3, 0)).toBe(0)
  })

  it("devuelve 0 sin aciertos y 100 con todos", () => {
    expect(porcentajeBloque(0, 5)).toBe(0)
    expect(porcentajeBloque(5, 5)).toBe(100)
  })
})

describe("bloquesMasDebiles", () => {
  it("devuelve una lista vacía si no hay bloques", () => {
    expect(bloquesMasDebiles([])).toEqual([])
  })

  it("devuelve una lista vacía si todos los bloques están al 100 %", () => {
    const bloques = [
      bloque("discriminacion_auditiva", 1, 4, 4),
      bloque("conciencia_fonologica", 2, 6, 6),
      bloque("conciencia_silabica", 3, 1, 1),
    ]
    expect(bloquesMasDebiles(bloques)).toEqual([])
  })

  it("devuelve el único bloque con el menor acierto", () => {
    const masDebil = bloque("conciencia_fonologica", 2, 1, 5)
    const bloques = [
      bloque("discriminacion_auditiva", 1, 4, 5),
      masDebil,
      bloque("conciencia_silabica", 3, 5, 5),
    ]
    expect(bloquesMasDebiles(bloques)).toEqual([masDebil])
  })

  it("devuelve el más débil aunque sea el primero de la lista", () => {
    const masDebil = bloque("discriminacion_auditiva", 1, 0, 4)
    const bloques = [masDebil, bloque("conciencia_fonologica", 2, 3, 4), bloque("conciencia_silabica", 3, 4, 4)]
    expect(bloquesMasDebiles(bloques)).toEqual([masDebil])
  })

  it("devuelve todos los empatados en el mínimo, en el orden del test", () => {
    // 1/2 y 3/6 son el mismo 50 % con distinta cantidad de ejercicios.
    const bloques = [
      bloque("memoria_fonologica", 4, 3, 6),
      bloque("conciencia_silabica", 3, 5, 5),
      bloque("discriminacion_auditiva", 1, 1, 2),
      bloque("conciencia_fonologica", 2, 4, 5),
    ]
    expect(codigos(bloquesMasDebiles(bloques))).toEqual(["discriminacion_auditiva", "memoria_fonologica"])
  })

  it("compara sin redondear: 2/3 es más débil que 67/100", () => {
    // Los dos redondean a 67 %, pero 2/3 es 66,67 %.
    const dosTercios = bloque("discriminacion_auditiva", 1, 2, 3)
    const sesentaYSiete = bloque("conciencia_fonologica", 2, 67, 100)
    expect(porcentajeBloque(2, 3)).toBe(porcentajeBloque(67, 100))
    expect(bloquesMasDebiles([dosTercios, sesentaYSiete])).toEqual([dosTercios])
    expect(bloquesMasDebiles([sesentaYSiete, dosTercios])).toEqual([dosTercios])
  })

  it("ignora los bloques sin ejercicios en vez de contarlos como 0 %", () => {
    const masDebil = bloque("conciencia_fonologica", 2, 3, 4)
    const bloques = [
      bloque("discriminacion_auditiva", 1, 0, 0),
      masDebil,
      bloque("conciencia_silabica", 3, 4, 4),
    ]
    expect(bloquesMasDebiles(bloques)).toEqual([masDebil])
  })

  it("devuelve una lista vacía si solo hay bloques sin ejercicios", () => {
    const bloques = [bloque("discriminacion_auditiva", 1, 0, 0), bloque("conciencia_fonologica", 2, 0, 0)]
    expect(bloquesMasDebiles(bloques)).toEqual([])
  })

  it("no modifica el arreglo recibido", () => {
    const bloques = [
      bloque("memoria_fonologica", 4, 1, 2),
      bloque("discriminacion_auditiva", 1, 1, 2),
      bloque("conciencia_fonologica", 2, 2, 2),
    ]
    const copia = structuredClone(bloques)
    bloquesMasDebiles(bloques)
    expect(bloques).toEqual(copia)
  })
})

describe("ordenRecomendacion", () => {
  it("ordena de menor a mayor acierto", () => {
    const bloques = [
      bloque("discriminacion_auditiva", 1, 5, 5),
      bloque("conciencia_fonologica", 2, 1, 4),
      bloque("conciencia_silabica", 3, 3, 6),
      bloque("memoria_fonologica", 4, 0, 3),
    ]
    expect(codigos(ordenRecomendacion(bloques))).toEqual([
      "memoria_fonologica",
      "conciencia_fonologica",
      "conciencia_silabica",
      "discriminacion_auditiva",
    ])
  })

  it("compara por porcentaje y no por cantidad de correctas", () => {
    // 3/10 (30 %) tiene más correctas que 2/4 (50 %), pero menor acierto.
    const bloques = [bloque("discriminacion_auditiva", 1, 2, 4), bloque("conciencia_fonologica", 2, 3, 10)]
    expect(codigos(ordenRecomendacion(bloques))).toEqual(["conciencia_fonologica", "discriminacion_auditiva"])
  })

  it("desempata por el orden del test", () => {
    const bloques = [
      bloque("conciencia_silabica", 3, 2, 4),
      bloque("memoria_fonologica", 4, 4, 4),
      bloque("discriminacion_auditiva", 1, 3, 6),
      bloque("conciencia_fonologica", 2, 1, 2),
    ]
    expect(codigos(ordenRecomendacion(bloques))).toEqual([
      "discriminacion_auditiva",
      "conciencia_fonologica",
      "conciencia_silabica",
      "memoria_fonologica",
    ])
  })

  it("excluye los bloques sin ejercicios", () => {
    const bloques = [
      bloque("discriminacion_auditiva", 1, 0, 0),
      bloque("conciencia_fonologica", 2, 2, 4),
      bloque("conciencia_silabica", 3, 1, 4),
    ]
    expect(codigos(ordenRecomendacion(bloques))).toEqual(["conciencia_silabica", "conciencia_fonologica"])
  })

  it("devuelve una lista vacía si no hay bloques", () => {
    expect(ordenRecomendacion([])).toEqual([])
  })

  it("no modifica el arreglo recibido", () => {
    const bloques = [
      bloque("conciencia_silabica", 3, 4, 4),
      bloque("discriminacion_auditiva", 1, 0, 0),
      bloque("conciencia_fonologica", 2, 1, 4),
    ]
    const copia = structuredClone(bloques)
    const resultado = ordenRecomendacion(bloques)
    expect(bloques).toEqual(copia)
    expect(resultado).not.toBe(bloques)
  })
})
