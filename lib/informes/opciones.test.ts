import { describe, expect, it } from "vitest"

import { OTRO_EJEMPLO, TESTS_EJEMPLO, USUARIO_EJEMPLO } from "@/lib/informes/ejemplo"
import {
  MAX_OBSERVACIONES,
  SECCIONES_SEGUIMIENTO,
  autoriaIncluida,
  evaluacionesElegibles,
  opcionesPorDefecto,
  validarOpciones,
  type OpcionesInforme,
} from "@/lib/informes/opciones"

const contexto = { tests: TESTS_EJEMPLO, usuarioId: USUARIO_EJEMPLO }
const [ULTIMA, DE_OTRO, PRIMERA] = TESTS_EJEMPLO

const base = (cambios: Partial<OpcionesInforme> = {}): OpcionesInforme => ({
  ...opcionesPorDefecto({ tests: TESTS_EJEMPLO }),
  ...cambios,
})

describe("opcionesPorDefecto", () => {
  it("los dos contenidos, la última evaluación, recomendación, 3 meses, todas las secciones y lo de otros", () => {
    const o = opcionesPorDefecto({ tests: [...TESTS_EJEMPLO].reverse() })
    expect(o).toMatchObject({
      evaluacion: true,
      seguimiento: true,
      testId: ULTIMA.id,
      incluirRecomendacion: true,
      periodo: "ultimos_3_meses",
      incluirOtrosProfesionales: true,
      observaciones: "",
    })
    expect(Object.values(o.secciones).every(Boolean)).toBe(true)
  })

  it("desde el detalle de una evaluación, esa queda elegida", () => {
    expect(opcionesPorDefecto({ tests: TESTS_EJEMPLO }, PRIMERA.id).testId).toBe(PRIMERA.id)
  })

  it("una evaluación pedida que no está visible cae en la última", () => {
    expect(opcionesPorDefecto({ tests: TESTS_EJEMPLO }, "otra").testId).toBe(ULTIMA.id)
  })

  it("sin evaluaciones: solo el seguimiento", () => {
    const o = opcionesPorDefecto({ tests: [] })
    expect(o.evaluacion).toBe(false)
    expect(o.seguimiento).toBe(true)
    expect(o.testId).toBeNull()
  })

  it("las secciones salen en el orden del diseño", () => {
    expect(SECCIONES_SEGUIMIENTO.map((s) => s.texto)).toEqual([
      "Evolución de las evaluaciones",
      "Denominación rápida",
      "Entrenamiento por juego",
      "Tareas",
      "Práctica en casa",
    ])
  })
})

describe("autoría", () => {
  it("lo propio entra siempre; lo de otros (y lo sin autor), solo si se incluye", () => {
    expect(autoriaIncluida(USUARIO_EJEMPLO, USUARIO_EJEMPLO, false)).toBe(true)
    expect(autoriaIncluida(OTRO_EJEMPLO, USUARIO_EJEMPLO, false)).toBe(false)
    expect(autoriaIncluida(null, USUARIO_EJEMPLO, false)).toBe(false)
    expect(autoriaIncluida(OTRO_EJEMPLO, USUARIO_EJEMPLO, true)).toBe(true)
  })

  it("evaluacionesElegibles ordena de la más reciente a la más vieja y filtra por autoría", () => {
    expect(evaluacionesElegibles([...TESTS_EJEMPLO].reverse(), USUARIO_EJEMPLO, true).map((t) => t.id)).toEqual(
      TESTS_EJEMPLO.map((t) => t.id),
    )
    expect(evaluacionesElegibles(TESTS_EJEMPLO, USUARIO_EJEMPLO, false).map((t) => t.id)).toEqual([ULTIMA.id, PRIMERA.id])
  })

  it("si empatan en fecha, va primero la creada después", () => {
    const a = { id: "a", fecha: "2026-11-01T10:00:00Z", created_at: "2026-11-01T10:00:00Z", profesional_id: null }
    const b = { ...a, id: "b", created_at: "2026-11-01T11:00:00Z" }
    expect(evaluacionesElegibles([a, b], "x", true).map((t) => t.id)).toEqual(["b", "a"])
  })
})

describe("validarOpciones", () => {
  it("las opciones por defecto son válidas", () => {
    expect(validarOpciones(base(), contexto)).toEqual([])
  })

  it("sin ningún contenido no se puede generar", () => {
    expect(validarOpciones(base({ evaluacion: false, seguimiento: false }), contexto)).toEqual([
      { campo: "contenido", mensaje: "Elegí al menos un contenido: evaluación o seguimiento." },
    ])
  })

  it("solo evaluación o solo seguimiento son válidos", () => {
    expect(validarOpciones(base({ seguimiento: false }), contexto)).toEqual([])
    expect(validarOpciones(base({ evaluacion: false }), contexto)).toEqual([])
  })

  it("la evaluación tiene que existir y respetar la autoría", () => {
    expect(validarOpciones(base({ testId: null }), contexto)[0]?.campo).toBe("evaluacion")
    expect(validarOpciones(base({ testId: DE_OTRO.id, incluirOtrosProfesionales: false }), contexto)[0]?.mensaje).toBe(
      "Elegí una evaluación.",
    )
    expect(validarOpciones(base({ testId: DE_OTRO.id }), contexto)).toEqual([])
  })

  it("sin evaluaciones elegibles, lo avisa", () => {
    expect(validarOpciones(base(), { tests: [], usuarioId: USUARIO_EJEMPLO })[0]?.mensaje).toBe(
      "No hay evaluaciones para incluir.",
    )
  })

  it("fechas a elección: completas y en orden; el mismo día vale", () => {
    const elegir = (desde: string, hasta: string) =>
      validarOpciones(base({ periodo: "elegir", desde, hasta }), contexto).map((p) => p.campo)
    expect(elegir("", "")).toEqual(["periodo"])
    expect(elegir("2026-09-01", "2026-02-30")).toEqual(["periodo"])
    expect(validarOpciones(base({ periodo: "elegir", desde: "2026-10-01", hasta: "2026-09-01" }), contexto)[0]?.mensaje).toContain(
      "anterior o igual",
    )
    expect(elegir("2026-09-01", "2026-09-01")).toEqual([])
  })

  it("las fechas no importan sin seguimiento", () => {
    expect(validarOpciones(base({ seguimiento: false, periodo: "elegir" }), contexto)).toEqual([])
  })

  it("con seguimiento hace falta al menos una sección", () => {
    const secciones = { evolucion: false, denominacion: false, entrenamiento: false, tareas: false, practica: false }
    expect(validarOpciones(base({ secciones }), contexto).map((p) => p.campo)).toEqual(["secciones"])
    expect(validarOpciones(base({ secciones, seguimiento: false }), contexto)).toEqual([])
  })

  it("observaciones de hasta 2000 caracteres", () => {
    expect(validarOpciones(base({ observaciones: "a".repeat(MAX_OBSERVACIONES) }), contexto)).toEqual([])
    expect(validarOpciones(base({ observaciones: "a".repeat(MAX_OBSERVACIONES + 1) }), contexto).map((p) => p.campo)).toEqual([
      "observaciones",
    ])
  })
})
