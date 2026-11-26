import { describe, expect, it } from "vitest"

import { porcentajeBloque } from "@/lib/test/analisis"
import { BLOQUES_POR_NIVEL, type BloqueCodigo, type Nivel } from "@/lib/test/bloques"
import { CORTES, franjaDeBloque, type BloqueParaFranja, type GradoFranja } from "@/lib/test/franjas"
import {
  bandaDe,
  bandasDeFranja,
  nivelInicialSeguimiento,
  nivelesConEvaluaciones,
  resumenBloque,
  resumenDenominacion,
  serieDeBloque,
  serieDenominacion,
  serieEvaluaciones,
  textoFranja,
  type EvaluacionParaSerie,
} from "@/lib/seguimiento/evaluaciones"

const b = (codigo: BloqueCodigo, orden: number, correctas: number, total: number): BloqueParaFranja => ({
  bloque_codigo: codigo,
  orden,
  correctas,
  total,
})

const dr = (tiempoMs: number | null, errores: number | null, total = 100): BloqueParaFranja => ({
  bloque_codigo: "denominacion_rapida",
  orden: 9,
  correctas: total - (errores ?? 0),
  total,
  tiempo_ms: tiempoMs,
  errores,
})

function evaluacion(
  id: string,
  nivel: Nivel,
  fecha: string,
  bloques: BloqueParaFranja[],
  created_at = `${fecha}T12:00:00Z`,
): EvaluacionParaSerie {
  return { id, nivel, fecha, created_at, bloques }
}

describe("nivelesConEvaluaciones y nivelInicialSeguimiento", () => {
  const ini = evaluacion("a", "inicial", "2026-03-01", [])
  const pri = evaluacion("b", "primario", "2026-09-01", [])

  it("devuelve los niveles con evaluaciones, inicial antes que primario", () => {
    expect(nivelesConEvaluaciones([pri, ini])).toEqual(["inicial", "primario"])
    expect(nivelesConEvaluaciones([pri])).toEqual(["primario"])
    expect(nivelesConEvaluaciones([])).toEqual([])
  })

  it("elige el nivel actual si tiene evaluaciones; si no, el otro; si no hay ninguna, el actual", () => {
    expect(nivelInicialSeguimiento([ini, pri], "primario")).toBe("primario")
    expect(nivelInicialSeguimiento([ini], "primario")).toBe("inicial")
    expect(nivelInicialSeguimiento([], "inicial")).toBe("inicial")
  })
})

describe("serieEvaluaciones", () => {
  const tests = [
    evaluacion("t3", "primario", "2026-10-20", [b("conciencia_silabica", 3, 5, 6)]),
    evaluacion("t1", "primario", "2026-08-01", [b("conciencia_silabica", 3, 3, 6), b("discriminacion_auditiva", 1, 2, 5)]),
    evaluacion("ti", "inicial", "2026-02-01", [b("conciencia_silabica", 3, 7, 7)]),
    // Misma fecha que t3, creada antes: va antes.
    evaluacion("t2", "primario", "2026-10-20", [b("conciencia_silabica", 3, 4, 6)], "2026-10-20T09:00:00Z"),
  ]

  it("toma solo las del nivel, de la más vieja a la más nueva (desempata por created_at)", () => {
    const serie = serieEvaluaciones(tests, "primario", "segundo")
    expect(serie.map((p) => p.testId)).toEqual(["t1", "t2", "t3"])
    expect(serieEvaluaciones(tests, "inicial", null).map((p) => p.testId)).toEqual(["ti"])
  })

  it("cada bloque lleva correctas, total, porcentaje y franja", () => {
    const [primero] = serieEvaluaciones(tests, "primario", "segundo")
    expect(primero.fecha).toBe("2026-08-01")
    expect(primero.bloques.conciencia_silabica).toEqual({ correctas: 3, total: 6, porcentaje: 50, franja: "intermedio" })
    expect(primero.bloques.discriminacion_auditiva).toEqual({ correctas: 2, total: 5, porcentaje: 40, franja: "a_observar" })
    expect(primero.bloques.memoria_fonologica).toBeUndefined()
  })

  it("usa el grado para los bloques que dependen de él", () => {
    const t = [evaluacion("x", "primario", "2026-01-01", [b("correspondencia_sonido_letra", 6, 5, 6)])]
    expect(serieEvaluaciones(t, "primario", "primero")[0].bloques.correspondencia_sonido_letra?.franja).toBe("correcto")
    expect(serieEvaluaciones(t, "primario", "tercero")[0].bloques.correspondencia_sonido_letra?.franja).toBe("intermedio")
    expect(serieEvaluaciones(t, "primario", null)[0].bloques.correspondencia_sonido_letra?.franja).toBeNull()
  })

  it("una fecha ilegible va al principio", () => {
    const t = [evaluacion("ok", "inicial", "2026-01-01", []), evaluacion("mal", "inicial", "x", [], "x")]
    expect(serieEvaluaciones(t, "inicial", null).map((p) => p.testId)).toEqual(["mal", "ok"])
  })
})

describe("serieDeBloque", () => {
  it("devuelve los puntos de un bloque con fecha y testId, salteando las evaluaciones que no lo tienen", () => {
    const serie = serieEvaluaciones(
      [
        evaluacion("a", "primario", "2026-01-01", [b("conciencia_silabica", 3, 3, 6)]),
        evaluacion("b", "primario", "2026-02-01", [b("discriminacion_auditiva", 1, 5, 5)]),
        evaluacion("c", "primario", "2026-03-01", [b("conciencia_silabica", 3, 6, 6)]),
      ],
      "primario",
      null,
    )
    expect(serieDeBloque(serie, "conciencia_silabica")).toEqual([
      { fecha: "2026-01-01", testId: "a", correctas: 3, total: 6, porcentaje: 50, franja: "intermedio" },
      { fecha: "2026-03-01", testId: "c", correctas: 6, total: 6, porcentaje: 100, franja: "correcto" },
    ])
    expect(serieDeBloque(serie, "lectura_pseudopalabras")).toEqual([])
  })
})

describe("bandasDeFranja", () => {
  /** Bandas con los bordes redondeados a 2 decimales, para comparar. */
  const redondeadas = (nivel: Nivel, bloque: BloqueCodigo, grado: GradoFranja | null) =>
    bandasDeFranja(nivel, bloque, grado)?.map((x) => ({
      ...x,
      desde: Math.round(x.desde * 100) / 100,
      hasta: Math.round(x.hasta * 100) / 100,
    }))

  it("reconocimiento visual (2 de 2): las tres franjas se ven, con bordes a mitad de camino", () => {
    expect(bandasDeFranja("primario", "reconocimiento_visual", null)).toEqual([
      { franja: "a_observar", desde: 0, hasta: 25 },
      { franja: "intermedio", desde: 25, hasta: 75 },
      { franja: "correcto", desde: 75, hasta: 100 },
    ])
  })

  it("comprensión lectora (3 de 3): correcto ya no queda sin alto", () => {
    expect(redondeadas("primario", "comprension_lectora", null)).toEqual([
      { franja: "a_observar", desde: 0, hasta: 50 },
      { franja: "intermedio", desde: 50, hasta: 83.33 },
      { franja: "correcto", desde: 83.33, hasta: 100 },
    ])
  })

  it("un corte normal (5 de 7)", () => {
    // Primario, conciencia fonológica: total 7, correcto desde 5, intermedio desde 4.
    expect(redondeadas("primario", "conciencia_fonologica", null)).toEqual([
      { franja: "a_observar", desde: 0, hasta: 50 },
      { franja: "intermedio", desde: 50, hasta: 64.29 },
      { franja: "correcto", desde: 64.29, hasta: 100 },
    ])
  })

  it("aciertos por grado: usa los del grado; sin grado, null", () => {
    expect(redondeadas("primario", "correspondencia_sonido_letra", "primero")).toEqual([
      { franja: "a_observar", desde: 0, hasta: 58.33 },
      { franja: "intermedio", desde: 58.33, hasta: 75 },
      { franja: "correcto", desde: 75, hasta: 100 },
    ])
    expect(redondeadas("primario", "correspondencia_sonido_letra", "segundo")).toEqual([
      { franja: "a_observar", desde: 0, hasta: 75 },
      { franja: "intermedio", desde: 75, hasta: 91.67 },
      { franja: "correcto", desde: 91.67, hasta: 100 },
    ])
    expect(bandasDeFranja("primario", "correspondencia_sonido_letra", null)).toBeNull()
  })

  it("null en denominación rápida, sin referencia y en un bloque sin corte", () => {
    expect(bandasDeFranja("primario", "denominacion_rapida", "segundo")).toBeNull()
    expect(bandasDeFranja("inicial", "denominacion_rapida", null)).toBeNull()
    // Comprensión lectora no es un bloque de inicial: no tiene corte.
    expect(bandasDeFranja("inicial", "comprension_lectora", null)).toBeNull()
  })

  it("en todos los bloques con corte, cada valor posible de aciertos cae en la banda de su franja", () => {
    let revisados = 0
    for (const nivel of ["inicial", "primario"] as const) {
      for (const bloque of BLOQUES_POR_NIVEL[nivel]) {
        for (const grado of ["primero", "segundo", "tercero"] as const) {
          const bandas = bandasDeFranja(nivel, bloque, grado)
          const corte = CORTES[nivel][bloque]
          if (!bandas || !corte || !("total" in corte)) continue
          // Las tres franjas se ven siempre.
          expect(bandas.map((x) => x.franja)).toEqual(["a_observar", "intermedio", "correcto"])
          for (let k = 0; k <= corte.total; k++) {
            const franja = franjaDeBloque(nivel, b(bloque, 1, k, corte.total), grado)
            expect(bandaDe(bandas, porcentajeBloque(k, corte.total))?.franja, `${nivel} ${bloque} ${grado} ${k}`).toBe(franja)
            revisados++
          }
        }
      }
    }
    // 12 bloques con corte por aciertos, 3 grados cada uno.
    expect(revisados).toBeGreaterThan(150)
  })
})

describe("bandaDe", () => {
  const bandas = bandasDeFranja("primario", "reconocimiento_visual", null)

  it("el borde pertenece a la banda de arriba y 100 % a correcto", () => {
    expect(bandaDe(bandas, 0)?.franja).toBe("a_observar")
    expect(bandaDe(bandas, 25)?.franja).toBe("intermedio")
    expect(bandaDe(bandas, 100)?.franja).toBe("correcto")
  })

  it("null sin bandas", () => {
    expect(bandaDe(null, 50)).toBeNull()
  })
})

describe("serieDenominacion", () => {
  const tests = [
    evaluacion("nueva", "primario", "2026-10-01", [dr(125_400, 2)]),
    evaluacion("vieja", "primario", "2026-05-01", [b("denominacion_rapida", 9, 8, 10)]),
    evaluacion("media", "primario", "2026-08-01", [dr(150_000, 1)]),
    evaluacion("sin-dr", "primario", "2026-04-01", [b("conciencia_silabica", 3, 4, 6)]),
    evaluacion("ini", "inicial", "2026-01-01", [dr(90_000, 3, 48)]),
  ]

  it("primaria: tiempo, errores, aciertos y franja, de la más vieja a la más nueva; sin tiempo queda afuera", () => {
    expect(serieDenominacion(tests, "primario", "segundo")).toEqual([
      {
        fecha: "2026-08-01",
        testId: "media",
        tiempoMs: 150_000,
        segundos: 150,
        errores: 1,
        total: 100,
        aciertosPorcentaje: 99,
        franja: "a_observar",
      },
      {
        fecha: "2026-10-01",
        testId: "nueva",
        tiempoMs: 125_400,
        segundos: 125.4,
        errores: 2,
        total: 100,
        aciertosPorcentaje: 98,
        franja: "intermedio",
      },
    ])
  })

  it("sin grado, sin franja", () => {
    expect(serieDenominacion(tests, "primario", null).every((p) => p.franja === null)).toBe(true)
  })

  it("inicial: hay puntos pero no hay corte; aciertos sobre su total", () => {
    expect(serieDenominacion(tests, "inicial", null)).toEqual([
      {
        fecha: "2026-01-01",
        testId: "ini",
        tiempoMs: 90_000,
        segundos: 90,
        errores: 3,
        total: 48,
        aciertosPorcentaje: 94,
        franja: null,
      },
    ])
  })

  it("deja afuera un bloque con tiempo pero sin errores", () => {
    expect(serieDenominacion([evaluacion("x", "primario", "2026-01-01", [dr(100_000, null)])], "primario", "segundo")).toEqual([])
  })
})

describe("resúmenes en texto", () => {
  const punto = (porcentaje: number, franja: "correcto" | "intermedio" | null) => ({
    fecha: "2026-01-01",
    testId: "t",
    correctas: 0,
    total: 6,
    porcentaje,
    franja,
  })

  it("textoFranja", () => {
    expect(textoFranja("a_observar")).toBe("a observar")
    expect(textoFranja(null)).toBe("sin franja de referencia")
  })

  it("resumenBloque con varias, una y ninguna evaluación", () => {
    expect(resumenBloque("conciencia_silabica", [punto(50, "intermedio"), punto(67, "intermedio"), punto(83, "correcto")])).toBe(
      "Conciencia Silábica: de 50 % a 83 % en 3 evaluaciones; última franja: correcto.",
    )
    expect(resumenBloque("conciencia_silabica", [punto(50, null)])).toBe(
      "Conciencia Silábica: 50 % en 1 evaluación; franja: sin franja de referencia.",
    )
    expect(resumenBloque("conciencia_silabica", [])).toBe("Conciencia Silábica: sin evaluaciones.")
  })

  const pd = (tiempoMs: number, aciertosPorcentaje: number, franja: "correcto" | "intermedio" | null = null) => ({
    fecha: "2026-01-01",
    testId: "t",
    tiempoMs,
    segundos: tiempoMs / 1000,
    errores: 0,
    total: 100,
    aciertosPorcentaje,
    franja,
  })

  it("resumenDenominacion: tiempo en m:ss y aciertos, con varias, una y ninguna evaluación", () => {
    expect(resumenDenominacion([pd(151_000, 92), pd(140_000, 95), pd(125_000, 98, "correcto")])).toBe(
      "Denominación Rápida: tiempo de 2:31 a 2:05 y aciertos de 92 % a 98 % en 3 evaluaciones; última franja: correcto.",
    )
    expect(resumenDenominacion([pd(48_400, 90)])).toBe(
      "Denominación Rápida: tiempo 0:48 y aciertos 90 % en 1 evaluación; franja: sin franja de referencia.",
    )
    expect(resumenDenominacion([])).toBe("Denominación Rápida: sin tiempo registrado en estas evaluaciones.")
  })
})
