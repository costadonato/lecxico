import { describe, expect, it } from "vitest"

import type { BloqueCodigo, Nivel } from "@/lib/test/bloques"
import type { BloqueParaFranja } from "@/lib/test/franjas"
import {
  bandasDeFranja,
  bandasDenominacion,
  bloquesDeLaGrilla,
  nivelInicialSeguimiento,
  nivelesConEvaluaciones,
  resumenBloque,
  resumenDenominacion,
  resumenFranjaDenominacion,
  serieDeBloque,
  serieDenominacion,
  serieEvaluaciones,
  textoFranja,
  textoSegundos,
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

describe("bloquesDeLaGrilla", () => {
  it("son los del test en orden, sin denominación rápida", () => {
    expect(bloquesDeLaGrilla("inicial")).toEqual([
      "discriminacion_auditiva",
      "conciencia_fonologica",
      "conciencia_silabica",
      "memoria_fonologica",
    ])
    expect(bloquesDeLaGrilla("primario")).toHaveLength(8)
    expect(bloquesDeLaGrilla("primario")).not.toContain("denominacion_rapida")
  })
})

describe("bandasDeFranja", () => {
  it("aciertos: límites en porcentaje entero, de abajo hacia arriba", () => {
    // Primario, conciencia silábica: total 6, correcto desde 4, intermedio desde 3.
    expect(bandasDeFranja("primario", "conciencia_silabica", null)).toEqual([
      { franja: "a_observar", desde: 0, hasta: 50 },
      { franja: "intermedio", desde: 50, hasta: 67 },
      { franja: "correcto", desde: 67, hasta: 100 },
    ])
  })

  it("redondea igual que el porcentaje del punto: 1 de 3 (33 %) cae justo en el límite de intermedio", () => {
    // Inicial, conciencia fonológica: total 3, correcto desde 2, intermedio desde 1.
    const bandas = bandasDeFranja("inicial", "conciencia_fonologica", null)
    expect(bandas?.find((x) => x.franja === "intermedio")).toEqual({ franja: "intermedio", desde: 33, hasta: 67 })
  })

  it("omite la banda sin alto (correcto desde 100 %)", () => {
    // Comprensión lectora: total 3, correcto desde 3.
    expect(bandasDeFranja("primario", "comprension_lectora", null)).toEqual([
      { franja: "a_observar", desde: 0, hasta: 67 },
      { franja: "intermedio", desde: 67, hasta: 100 },
    ])
  })

  it("aciertos por grado: usa los del grado; sin grado, null", () => {
    expect(bandasDeFranja("primario", "correspondencia_sonido_letra", "primero")).toEqual([
      { franja: "a_observar", desde: 0, hasta: 67 },
      { franja: "intermedio", desde: 67, hasta: 83 },
      { franja: "correcto", desde: 83, hasta: 100 },
    ])
    expect(bandasDeFranja("primario", "correspondencia_sonido_letra", "segundo")?.at(-1)).toEqual({
      franja: "intermedio",
      desde: 83,
      hasta: 100,
    })
    expect(bandasDeFranja("primario", "correspondencia_sonido_letra", null)).toBeNull()
  })

  it("null en denominación rápida, sin referencia y en un bloque sin corte", () => {
    expect(bandasDeFranja("primario", "denominacion_rapida", "segundo")).toBeNull()
    expect(bandasDeFranja("inicial", "denominacion_rapida", null)).toBeNull()
    // Comprensión lectora no es un bloque de inicial: no tiene corte.
    expect(bandasDeFranja("inicial", "comprension_lectora", null)).toBeNull()
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

  it("primaria: tiempo en segundos, errores y franjas, de la más vieja a la más nueva; sin tiempo queda afuera", () => {
    expect(serieDenominacion(tests, "primario", "segundo")).toEqual([
      {
        fecha: "2026-08-01",
        testId: "media",
        segundos: 150,
        errores: 1,
        franja: "a_observar",
        franjaTiempo: "a_observar",
        franjaErrores: "correcto",
      },
      {
        fecha: "2026-10-01",
        testId: "nueva",
        segundos: 125.4,
        errores: 2,
        franja: "intermedio",
        franjaTiempo: "intermedio",
        franjaErrores: "intermedio",
      },
    ])
  })

  it("redondea los segundos como franjaDeBloque: 121,4 s cuenta como 121 (correcto en 2.º)", () => {
    const [p] = serieDenominacion([evaluacion("x", "primario", "2026-01-01", [dr(121_400, 0)])], "primario", "segundo")
    expect(p.franjaTiempo).toBe("correcto")
    expect(p.franja).toBe("correcto")
  })

  it("sin grado o con otro total, sin franjas", () => {
    expect(serieDenominacion(tests, "primario", null).every((p) => p.franja === null && p.franjaTiempo === null)).toBe(true)
    const otroTotal = [evaluacion("x", "primario", "2026-01-01", [dr(100_000, 1, 80)])]
    expect(serieDenominacion(otroTotal, "primario", "segundo")[0]).toMatchObject({
      franja: null,
      franjaTiempo: null,
      franjaErrores: null,
    })
  })

  it("inicial: hay puntos pero no hay corte", () => {
    expect(serieDenominacion(tests, "inicial", null)).toEqual([
      {
        fecha: "2026-01-01",
        testId: "ini",
        segundos: 90,
        errores: 3,
        franja: null,
        franjaTiempo: null,
        franjaErrores: null,
      },
    ])
  })

  it("deja afuera un bloque con tiempo pero sin errores", () => {
    expect(serieDenominacion([evaluacion("x", "primario", "2026-01-01", [dr(100_000, null)])], "primario", "segundo")).toEqual([])
  })
})

describe("bandasDenominacion", () => {
  it("primaria: límites a medio camino de los cortes enteros, por grado", () => {
    expect(bandasDenominacion("primario", "segundo")).toEqual({
      tiempo: [
        { franja: "correcto", desde: 0, hasta: 121.5 },
        { franja: "intermedio", desde: 121.5, hasta: 131.5 },
        { franja: "a_observar", desde: 131.5, hasta: null },
      ],
      errores: [
        { franja: "correcto", desde: 0, hasta: 1.5 },
        { franja: "intermedio", desde: 1.5, hasta: 2.5 },
        { franja: "a_observar", desde: 2.5, hasta: null },
      ],
    })
    expect(bandasDenominacion("primario", "primero")?.tiempo[0].hasta).toBe(137.5)
  })

  it("null en inicial y en primaria sin grado", () => {
    expect(bandasDenominacion("inicial", null)).toBeNull()
    expect(bandasDenominacion("inicial", "segundo")).toBeNull()
    expect(bandasDenominacion("primario", null)).toBeNull()
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

  it("textoSegundos: un decimal con coma, sin decimal si es entero", () => {
    expect(textoSegundos(131.44)).toBe("131,4 s")
    expect(textoSegundos(130)).toBe("130 s")
    expect(textoSegundos(129.96)).toBe("130 s")
  })

  const pd = (segundos: number, errores: number, franja: "correcto" | "intermedio" | null = null) => ({
    fecha: "2026-01-01",
    testId: "t",
    segundos,
    errores,
    franja,
    franjaTiempo: null,
    franjaErrores: null,
  })

  it("resumenDenominacion de tiempo y de errores", () => {
    expect(resumenDenominacion("tiempo", [pd(150, 4), pd(130.5, 2)])).toBe("Tiempo: de 150 s a 130,5 s en 2 evaluaciones.")
    expect(resumenDenominacion("errores", [pd(150, 4), pd(130, 1)])).toBe("Errores: de 4 errores a 1 error en 2 evaluaciones.")
    expect(resumenDenominacion("errores", [pd(150, 1)])).toBe("Errores: 1 error en 1 evaluación.")
    expect(resumenDenominacion("tiempo", [])).toBe("Tiempo: sin evaluaciones con tiempo registrado.")
  })

  it("resumenFranjaDenominacion toma la última", () => {
    expect(resumenFranjaDenominacion([pd(150, 4, "correcto"), pd(130, 1, "intermedio")])).toBe(
      "Última franja de denominación rápida: intermedio.",
    )
    expect(resumenFranjaDenominacion([])).toBe("Última franja de denominación rápida: sin franja de referencia.")
  })
})
