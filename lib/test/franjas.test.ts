import { describe, expect, it } from "vitest"

import { BLOQUES_POR_NIVEL, ETAPAS_ESCOLARES, type BloqueCodigo, type Nivel } from "@/lib/test/bloques"
import {
  CORTES,
  FRANJA_LABEL,
  SIN_FRANJA_LABEL,
  dependeDelGrado,
  franjaDeBloque,
  franjasDeEvaluacion,
  gradoParaFranja,
  recomendacion,
  recomendacionParaNino,
  textoGradoFranjas,
  ultimaEvaluacion,
  type BloqueParaFranja,
  type Franja,
  type GradoFranja,
} from "@/lib/test/franjas"

/** Resultado de un bloque para las pruebas. */
function bloque(codigo: BloqueCodigo, orden: number, correctas: number, total: number): BloqueParaFranja {
  return { bloque_codigo: codigo, orden, correctas, total }
}

/** Denominación rápida del primario (total 100) con tiempo y errores. */
function denominacion(tiempoMs: number | null, errores: number | null, orden = 9): BloqueParaFranja {
  return {
    bloque_codigo: "denominacion_rapida",
    orden,
    correctas: 100 - (errores ?? 0),
    total: 100,
    tiempo_ms: tiempoMs,
    errores,
  }
}

const codigos = (bloques: { bloque_codigo: BloqueCodigo }[]) => bloques.map((b) => b.bloque_codigo)

/*
 * Bordes de cada bloque por aciertos: [nivel, bloque, total, correcto desde,
 * intermedio desde]. Es la tabla de la sección 1 del prompt de S11 escrita a
 * mano, para que un cambio en CORTES no pase sin que falle una prueba.
 */
const TABLA_ACIERTOS: [Nivel, BloqueCodigo, number, number, number][] = [
  ["inicial", "discriminacion_auditiva", 6, 4, 3],
  ["inicial", "conciencia_fonologica", 3, 2, 1],
  ["inicial", "conciencia_silabica", 7, 4, 3],
  ["inicial", "memoria_fonologica", 4, 3, 2],
  ["primario", "discriminacion_auditiva", 5, 4, 3],
  ["primario", "conciencia_fonologica", 7, 5, 4],
  ["primario", "conciencia_silabica", 6, 4, 3],
  ["primario", "memoria_fonologica", 6, 5, 4],
  ["primario", "comprension_lectora", 3, 3, 2],
  ["primario", "reconocimiento_visual", 2, 2, 1],
  ["primario", "lectura_pseudopalabras", 7, 5, 4],
]

describe("franjaDeBloque: bloques por aciertos, en sus dos bordes", () => {
  it.each(TABLA_ACIERTOS)("%s · %s (total %i): correcto desde %i, intermedio desde %i", (nivel, codigo, total, correcto, intermedio) => {
    const franja = (correctas: number) => franjaDeBloque(nivel, bloque(codigo, 1, correctas, total), null)
    // Borde superior: el total y el primero de correcto; el último de intermedio.
    expect(franja(total)).toBe("correcto")
    expect(franja(correcto)).toBe("correcto")
    expect(franja(correcto - 1)).toBe("intermedio")
    // Borde inferior: el primero de intermedio y el último de a observar.
    expect(franja(intermedio)).toBe("intermedio")
    expect(franja(intermedio - 1)).toBe("a_observar")
    expect(franja(0)).toBe("a_observar")
  })

  it("conciencia fonológica de primario: 5 es correcto, 4 es intermedio y no correcto, 3 es a observar", () => {
    const franja = (correctas: number) => franjaDeBloque("primario", bloque("conciencia_fonologica", 2, correctas, 7), null)
    expect(franja(5)).toBe("correcto")
    expect(franja(4)).toBe("intermedio")
    expect(franja(4)).not.toBe("correcto")
    expect(franja(3)).toBe("a_observar")
  })

  it("los bloques por aciertos no dependen del grado", () => {
    const b = bloque("conciencia_silabica", 3, 3, 6)
    expect(franjaDeBloque("primario", b, null)).toBe("intermedio")
    expect(franjaDeBloque("primario", b, "primero")).toBe("intermedio")
    expect(franjaDeBloque("primario", b, "tercero")).toBe("intermedio")
  })
})

describe("franjaDeBloque: correspondencia sonido-letra (depende del grado)", () => {
  const csl = (correctas: number) => bloque("correspondencia_sonido_letra", 6, correctas, 6)

  it("con 5 aciertos es correcto en 1.º e intermedio en 2.º y 3.º", () => {
    expect(franjaDeBloque("primario", csl(5), "primero")).toBe("correcto")
    expect(franjaDeBloque("primario", csl(5), "segundo")).toBe("intermedio")
    expect(franjaDeBloque("primario", csl(5), "tercero")).toBe("intermedio")
  })

  it("con 4 aciertos es intermedio en 1.º y a observar en 2.º y 3.º", () => {
    expect(franjaDeBloque("primario", csl(4), "primero")).toBe("intermedio")
    expect(franjaDeBloque("primario", csl(4), "segundo")).toBe("a_observar")
    expect(franjaDeBloque("primario", csl(4), "tercero")).toBe("a_observar")
  })

  it("con 6 es correcto en todos los grados y con 3 es a observar en 1.º", () => {
    for (const g of ["primero", "segundo", "tercero"] as const) expect(franjaDeBloque("primario", csl(6), g)).toBe("correcto")
    expect(franjaDeBloque("primario", csl(3), "primero")).toBe("a_observar")
  })

  it("sin grado queda sin franja", () => {
    expect(franjaDeBloque("primario", csl(6), null)).toBeNull()
  })
})

describe("franjaDeBloque: denominación rápida del primario", () => {
  /** [grado, correcto hasta (s), intermedio hasta (s)] */
  const TIEMPOS: [GradoFranja, number, number][] = [
    ["primero", 137, 146],
    ["segundo", 121, 131],
    ["tercero", 101, 109],
  ]

  it.each(TIEMPOS)("por tiempo en %s: correcto hasta %i s, intermedio hasta %i s", (grado, correcto, intermedio) => {
    const franja = (segundos: number) => franjaDeBloque("primario", denominacion(segundos * 1000, 0), grado)
    expect(franja(correcto)).toBe("correcto")
    expect(franja(correcto + 1)).toBe("intermedio")
    expect(franja(intermedio)).toBe("intermedio")
    expect(franja(intermedio + 1)).toBe("a_observar")
  })

  it("137 s es correcto y 138 s es intermedio en 1.º", () => {
    expect(franjaDeBloque("primario", denominacion(137_000, 0), "primero")).toBe("correcto")
    expect(franjaDeBloque("primario", denominacion(138_000, 0), "primero")).toBe("intermedio")
  })

  it("redondea al segundo como formatearTiempo: 137 499 ms es correcto y 137 500 ms es intermedio", () => {
    expect(franjaDeBloque("primario", denominacion(137_499, 0), "primero")).toBe("correcto")
    expect(franjaDeBloque("primario", denominacion(137_500, 0), "primero")).toBe("intermedio")
  })

  it("por errores (con tiempo correcto): 1 es correcto, 2 es intermedio y 3 es a observar", () => {
    const franja = (errores: number) => franjaDeBloque("primario", denominacion(90_000, errores), "segundo")
    expect(franja(0)).toBe("correcto")
    expect(franja(1)).toBe("correcto")
    expect(franja(2)).toBe("intermedio")
    expect(franja(3)).toBe("a_observar")
    expect(franja(10)).toBe("a_observar")
  })

  it("combina tomando la franja más baja", () => {
    // Tiempo correcto con 3 errores: a observar.
    expect(franjaDeBloque("primario", denominacion(100_000, 3), "primero")).toBe("a_observar")
    // Tiempo a observar con 0 errores: a observar.
    expect(franjaDeBloque("primario", denominacion(150_000, 0), "primero")).toBe("a_observar")
    // Tiempo intermedio con 1 error: intermedio.
    expect(franjaDeBloque("primario", denominacion(140_000, 1), "primero")).toBe("intermedio")
    // Tiempo correcto con 2 errores: intermedio (los errores bajan la franja).
    expect(franjaDeBloque("primario", denominacion(100_000, 2), "primero")).toBe("intermedio")
    // Tiempo intermedio con 3 errores: a observar.
    expect(franjaDeBloque("primario", denominacion(140_000, 3), "primero")).toBe("a_observar")
  })

  it("un tiempo mayor nunca sube la franja", () => {
    const orden: Record<Franja, number> = { correcto: 0, intermedio: 1, a_observar: 2 }
    let anterior = 0
    for (let s = 90; s <= 160; s++) {
      const f = franjaDeBloque("primario", denominacion(s * 1000, 1), "primero")!
      expect(orden[f]).toBeGreaterThanOrEqual(anterior)
      anterior = orden[f]
    }
  })
})

describe("franjaDeBloque: sin franja de referencia", () => {
  it("denominación rápida de inicial, siempre", () => {
    const b = { ...bloque("denominacion_rapida", 5, 46, 48), tiempo_ms: 40_000, errores: 2 }
    expect(franjaDeBloque("inicial", b, null)).toBeNull()
    expect(franjaDeBloque("inicial", b, "primero")).toBeNull()
  })

  it("denominación rápida de primario sin tiempo o sin errores (anteriores a S9)", () => {
    expect(franjaDeBloque("primario", denominacion(null, 0), "primero")).toBeNull()
    expect(franjaDeBloque("primario", denominacion(100_000, null), "primero")).toBeNull()
    expect(franjaDeBloque("primario", bloque("denominacion_rapida", 9, 98, 100), "primero")).toBeNull()
  })

  it("denominación rápida de primario sin grado", () => {
    expect(franjaDeBloque("primario", denominacion(100_000, 0), null)).toBeNull()
  })

  it("un total distinto al del corte", () => {
    expect(franjaDeBloque("primario", bloque("conciencia_fonologica", 2, 5, 8), null)).toBeNull()
    expect(franjaDeBloque("primario", bloque("correspondencia_sonido_letra", 6, 5, 5), "primero")).toBeNull()
    expect(franjaDeBloque("primario", { ...denominacion(100_000, 0), total: 50, correctas: 50 }, "primero")).toBeNull()
    // Denominación rápida vieja de inicial (10 ítems).
    expect(franjaDeBloque("inicial", bloque("denominacion_rapida", 5, 8, 10), null)).toBeNull()
  })

  it("un bloque sin ejercicios (total 0)", () => {
    expect(franjaDeBloque("inicial", bloque("discriminacion_auditiva", 1, 0, 0), null)).toBeNull()
  })

  it("un bloque que no tiene corte en ese nivel", () => {
    expect(franjaDeBloque("inicial", bloque("comprension_lectora", 5, 3, 3), null)).toBeNull()
  })
})

describe("gradoParaFranja", () => {
  it("en primario usa la etapa si es 1.º, 2.º o 3.º", () => {
    expect(gradoParaFranja("primario", "primero")).toBe("primero")
    expect(gradoParaFranja("primario", "segundo")).toBe("segundo")
    expect(gradoParaFranja("primario", "tercero")).toBe("tercero")
  })

  it("en cualquier otro caso el grado es desconocido", () => {
    expect(gradoParaFranja("primario", "sala_5")).toBeNull()
    expect(gradoParaFranja("primario", null)).toBeNull()
    expect(gradoParaFranja("primario", undefined)).toBeNull()
    expect(gradoParaFranja("inicial", "primero")).toBeNull()
    expect(gradoParaFranja("inicial", "sala_4")).toBeNull()
  })
})

describe("dependeDelGrado", () => {
  it("solo correspondencia sonido-letra y denominación rápida del primario", () => {
    expect(dependeDelGrado("primario", "correspondencia_sonido_letra")).toBe(true)
    expect(dependeDelGrado("primario", "denominacion_rapida")).toBe(true)
    expect(dependeDelGrado("primario", "conciencia_fonologica")).toBe(false)
    expect(dependeDelGrado("inicial", "denominacion_rapida")).toBe(false)
    expect(dependeDelGrado("inicial", "comprension_lectora")).toBe(false)
  })
})

describe("franjasDeEvaluacion", () => {
  it("devuelve todos los bloques en el orden del test, con su franja", () => {
    const bloques = [
      bloque("memoria_fonologica", 4, 1, 4),
      bloque("discriminacion_auditiva", 1, 6, 6),
      { ...bloque("denominacion_rapida", 5, 46, 48), tiempo_ms: 40_000, errores: 2 },
      bloque("conciencia_silabica", 3, 3, 7),
      bloque("conciencia_fonologica", 2, 2, 3),
    ]
    const resultado = franjasDeEvaluacion("inicial", bloques, null)
    expect(codigos(resultado)).toEqual(BLOQUES_POR_NIVEL.inicial)
    expect(resultado.map((b) => b.franja)).toEqual(["correcto", "correcto", "intermedio", "a_observar", null])
  })

  it("no modifica el arreglo recibido", () => {
    const bloques = [bloque("conciencia_fonologica", 2, 1, 3), bloque("discriminacion_auditiva", 1, 6, 6)]
    const copia = structuredClone(bloques)
    franjasDeEvaluacion("inicial", bloques, null)
    expect(bloques).toEqual(copia)
  })
})

describe("recomendacion", () => {
  it("todos en correcto: lista vacía", () => {
    const bloques = [
      bloque("discriminacion_auditiva", 1, 6, 6),
      bloque("conciencia_fonologica", 2, 2, 3),
      bloque("conciencia_silabica", 3, 4, 7),
      bloque("memoria_fonologica", 4, 3, 4),
    ]
    expect(recomendacion("inicial", bloques, null)).toEqual({ recomendados: [], sinFranja: [] })
  })

  it("salen en el orden del test, aunque el bloque en «a observar» venga después de uno en «intermedio»", () => {
    const bloques = [
      bloque("lectura_pseudopalabras", 8, 0, 7), // a observar
      bloque("conciencia_silabica", 3, 6, 6), // correcto
      bloque("discriminacion_auditiva", 1, 3, 5), // intermedio
      bloque("memoria_fonologica", 4, 1, 6), // a observar
      bloque("comprension_lectora", 5, 2, 3), // intermedio
    ]
    const { recomendados } = recomendacion("primario", bloques, "segundo")
    expect(codigos(recomendados)).toEqual([
      "discriminacion_auditiva",
      "memoria_fonologica",
      "comprension_lectora",
      "lectura_pseudopalabras",
    ])
    expect(recomendados.map((b) => b.franja)).toEqual(["intermedio", "a_observar", "intermedio", "a_observar"])
  })

  it("los bloques sin franja no entran nunca: van aparte", () => {
    const bloques = [
      bloque("discriminacion_auditiva", 1, 0, 6), // a observar
      bloque("conciencia_fonologica", 2, 0, 4), // total distinto: sin franja
      bloque("memoria_fonologica", 4, 0, 0), // sin ejercicios: sin franja
      { ...bloque("denominacion_rapida", 5, 10, 48), tiempo_ms: 200_000, errores: 38 }, // sin referencia
    ]
    const { recomendados, sinFranja } = recomendacion("inicial", bloques, null)
    expect(codigos(recomendados)).toEqual(["discriminacion_auditiva"])
    expect(codigos(sinFranja)).toEqual(["conciencia_fonologica", "memoria_fonologica", "denominacion_rapida"])
  })

  it("sin grado, correspondencia sonido-letra y denominación rápida quedan sin franja y fuera", () => {
    const bloques = [bloque("correspondencia_sonido_letra", 6, 0, 6), denominacion(300_000, 20)]
    const { recomendados, sinFranja } = recomendacion("primario", bloques, null)
    expect(recomendados).toEqual([])
    expect(codigos(sinFranja)).toEqual(["correspondencia_sonido_letra", "denominacion_rapida"])
  })
})

describe("ultimaEvaluacion", () => {
  const ev = (id: string, fecha: string, created_at: string) => ({ id, fecha, created_at })

  it("sin evaluaciones devuelve null", () => {
    expect(ultimaEvaluacion([])).toBeNull()
  })

  it("elige la más reciente por fecha, con la lista desordenada", () => {
    const tests = [
      ev("a", "2026-10-02", "2026-10-02T10:00:00+00:00"),
      ev("c", "2026-11-20", "2026-11-20T09:00:00+00:00"),
      ev("b", "2026-11-03", "2026-11-25T09:00:00+00:00"), // cargada después, pero con fecha anterior
    ]
    expect(ultimaEvaluacion(tests)?.id).toBe("c")
    expect(ultimaEvaluacion([...tests].reverse())?.id).toBe("c")
  })

  it("con fechas iguales desempata por created_at", () => {
    const tests = [
      ev("manana", "2026-11-20", "2026-11-20T09:15:00.5+00:00"),
      ev("tarde", "2026-11-20", "2026-11-20T16:40:00.123456+00:00"),
      ev("mediodia", "2026-11-20", "2026-11-20T12:00:00+00:00"),
    ]
    expect(ultimaEvaluacion(tests)?.id).toBe("tarde")
    expect(ultimaEvaluacion([...tests].reverse())?.id).toBe("tarde")
  })

  it("una fecha ilegible cuenta como la más vieja", () => {
    const tests = [ev("rota", "no es una fecha", "tampoco"), ev("ok", "2026-01-01", "2026-01-01T00:00:00Z")]
    expect(ultimaEvaluacion(tests)?.id).toBe("ok")
    expect(ultimaEvaluacion([...tests].reverse())?.id).toBe("ok")
  })
})

describe("integridad de CORTES", () => {
  it("cada bloque de BLOQUES_POR_NIVEL tiene corte o está marcado sin referencia", () => {
    for (const nivel of ["inicial", "primario"] as const) {
      for (const codigo of BLOQUES_POR_NIVEL[nivel]) expect(CORTES[nivel][codigo], `${nivel} · ${codigo}`).toBeDefined()
    }
  })

  it("no hay cortes para bloques que el nivel no tiene", () => {
    for (const nivel of ["inicial", "primario"] as const) {
      for (const codigo of Object.keys(CORTES[nivel])) expect(BLOQUES_POR_NIVEL[nivel]).toContain(codigo)
    }
  })

  it("solo denominación rápida de inicial queda sin referencia", () => {
    const sinReferencia = (["inicial", "primario"] as const).flatMap((nivel) =>
      Object.entries(CORTES[nivel])
        .filter(([, c]) => c?.tipo === "sin_referencia")
        .map(([codigo]) => `${nivel}:${codigo}`),
    )
    expect(sinReferencia).toEqual(["inicial:denominacion_rapida"])
  })

  it("en todos, intermedio desde < correcto desde ≤ total (y correcto hasta < intermedio hasta)", () => {
    for (const nivel of ["inicial", "primario"] as const) {
      for (const [codigo, corte] of Object.entries(CORTES[nivel])) {
        const donde = `${nivel} · ${codigo}`
        if (!corte || corte.tipo === "sin_referencia") continue
        if (corte.tipo === "aciertos") {
          expect(corte.intermedioDesde, donde).toBeLessThan(corte.correctoDesde)
          expect(corte.correctoDesde, donde).toBeLessThanOrEqual(corte.total)
          expect(corte.intermedioDesde, donde).toBeGreaterThan(0)
        } else if (corte.tipo === "aciertos_por_grado") {
          for (const c of Object.values(corte.porGrado)) {
            expect(c.intermedioDesde, donde).toBeLessThan(c.correctoDesde)
            expect(c.correctoDesde, donde).toBeLessThanOrEqual(corte.total)
          }
        } else {
          for (const c of [...Object.values(corte.segundos), corte.errores]) {
            expect(c.correctoHasta, donde).toBeLessThan(c.intermedioHasta)
          }
        }
      }
    }
  })

  it("los totales coinciden con la cantidad de ítems de cada bloque", () => {
    // Contados en app/test/inicial y app/test/primaria (S11). Denominación
    // rápida del primario: 2 cuadrículas de 5 × 10 (denominacion-config.ts).
    const totales = (nivel: Nivel) =>
      Object.fromEntries(
        Object.entries(CORTES[nivel])
          .filter(([, c]) => c && c.tipo !== "sin_referencia")
          .map(([codigo, c]) => [codigo, (c as { total: number }).total]),
      )
    expect(totales("inicial")).toEqual({
      discriminacion_auditiva: 6,
      conciencia_fonologica: 3,
      conciencia_silabica: 7,
      memoria_fonologica: 4,
    })
    expect(totales("primario")).toEqual({
      discriminacion_auditiva: 5,
      conciencia_fonologica: 7,
      conciencia_silabica: 6,
      memoria_fonologica: 6,
      comprension_lectora: 3,
      correspondencia_sonido_letra: 6,
      reconocimiento_visual: 2,
      lectura_pseudopalabras: 7,
      denominacion_rapida: 100,
    })
  })
})

describe("textos visibles", () => {
  it("una etiqueta por franja y la de sin franja", () => {
    expect(FRANJA_LABEL).toEqual({ correcto: "Correcto", intermedio: "Intermedio", a_observar: "A observar" })
    expect(SIN_FRANJA_LABEL).toBe("Sin franja de referencia")
  })

  it("los grados de las franjas son etapas escolares existentes", () => {
    const etapas = ETAPAS_ESCOLARES.map((e) => e.valor)
    for (const g of ["primero", "segundo", "tercero"] as const) expect(etapas).toContain(g)
  })
})

describe("recomendacionParaNino", () => {
  const evaluacion = (nivel: Nivel, fecha: string, bloques: BloqueParaFranja[]) => ({
    fecha,
    created_at: `${fecha}T10:00:00Z`,
    nivel,
    bloques,
  })

  it("sin evaluaciones no está disponible", () => {
    expect(recomendacionParaNino([], "segundo")).toEqual({ estado: "sin_evaluaciones" })
  })

  it("si la última evaluación es de otro nivel no está disponible, aunque una anterior sea del nivel actual", () => {
    const tests = [
      evaluacion("primario", "2026-03-01", [bloque("discriminacion_auditiva", 1, 5, 5)]),
      evaluacion("inicial", "2026-10-01", [bloque("discriminacion_auditiva", 1, 6, 6)]),
    ]
    expect(recomendacionParaNino(tests, "primero")).toEqual({
      estado: "otro_nivel",
      nivelEvaluacion: "inicial",
      nivelNino: "primario",
    })
  })

  it("con la última del nivel actual, da la evaluación, el grado y la franja de cada bloque", () => {
    const vieja = evaluacion("primario", "2026-09-01", [bloque("discriminacion_auditiva", 1, 0, 5)])
    const ultima = evaluacion("primario", "2026-11-20", [
      bloque("discriminacion_auditiva", 1, 3, 5),
      bloque("correspondencia_sonido_letra", 6, 5, 6),
      denominacion(150_000, 0),
    ])
    const r = recomendacionParaNino([ultima, vieja], "primero")
    expect(r).toEqual({
      estado: "disponible",
      test: ultima,
      grado: "primero",
      franjas: {
        discriminacion_auditiva: "intermedio",
        correspondencia_sonido_letra: "correcto",
        denominacion_rapida: "a_observar",
      },
    })
  })

  it("en inicial no hay grado y denominación rápida queda sin franja", () => {
    const ultima = evaluacion("inicial", "2026-11-20", [
      bloque("discriminacion_auditiva", 1, 6, 6),
      { ...bloque("denominacion_rapida", 5, 22, 24), tiempo_ms: 38_000, errores: 2 },
    ])
    const r = recomendacionParaNino([ultima], "sala_5")
    expect(r).toMatchObject({ estado: "disponible", grado: null, franjas: { denominacion_rapida: null } })
  })
})

describe("textoGradoFranjas", () => {
  const csl = { bloque_codigo: "correspondencia_sonido_letra" as const, franja: "correcto" as const }
  const den = { bloque_codigo: "denominacion_rapida" as const, franja: "intermedio" as const }

  it("nombra los bloques que dependen del grado y tienen franja", () => {
    expect(textoGradoFranjas("primario", [csl], "primero")).toBe(
      "La franja de correspondencia sonido-letra usa el grado actual del niño (1er grado).",
    )
    expect(textoGradoFranjas("primario", [csl, den], "segundo")).toBe(
      "La franja de correspondencia sonido-letra y la de denominación rápida usan el grado actual del niño (2do grado).",
    )
  })

  it("null sin grado, sin bloques que dependan del grado o si esos quedaron sin franja", () => {
    expect(textoGradoFranjas("primario", [csl], null)).toBeNull()
    expect(textoGradoFranjas("primario", [{ bloque_codigo: "conciencia_silabica", franja: "correcto" }], "tercero")).toBeNull()
    expect(textoGradoFranjas("primario", [{ ...csl, franja: null }], "tercero")).toBeNull()
  })
})
