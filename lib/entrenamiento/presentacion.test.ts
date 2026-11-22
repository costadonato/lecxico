import { describe, expect, it } from "vitest"

import {
  FRASES,
  ORIGEN_CORTO,
  ORIGEN_LABEL,
  esCodigoJuego,
  fraseDe,
  juegoConPersonaje,
  juegoDisponible,
  juegosPorBloque,
  jugadaValida,
  leerGrado,
  nombreJuego,
  partidaConReintento,
  rutaConsulta,
  rutaJugar,
  textoGradoBloqueado,
  textoProgreso,
  unidadSingular,
} from "@/lib/entrenamiento/presentacion"
import { JUEGOS } from "@/lib/entrenamiento/juegos"
import { BLOQUES_POR_NIVEL } from "@/lib/test/bloques"

describe("juegosPorBloque", () => {
  it("inicial sin solo consulta: bloques en el orden de la evaluación, principal primero, sin Nombrá rápido", () => {
    const grupos = juegosPorBloque("inicial", { incluirSoloConsulta: false })
    expect(grupos.map((g) => g.bloque)).toEqual(BLOQUES_POR_NIVEL.inicial)
    const denominacion = grupos.find((g) => g.bloque === "denominacion_rapida")!
    expect(denominacion.juegos.map((j) => j.codigo)).toEqual(["tocalo", "ojo_lince", "lluvia"])
    expect(grupos[0].juegos.map((j) => j.codigo)).toEqual(["detective"])
  })

  it("con solo consulta, Nombrá rápido va primero en denominación rápida", () => {
    const grupos = juegosPorBloque("inicial", { incluirSoloConsulta: true })
    const denominacion = grupos.find((g) => g.bloque === "denominacion_rapida")!
    expect(denominacion.juegos[0].codigo).toBe("nombra")
  })

  it("primario: el principal va antes que el complementario en reconocimiento visual", () => {
    const grupos = juegosPorBloque("primario", { incluirSoloConsulta: false })
    const visual = grupos.find((g) => g.bloque === "reconocimiento_visual")!
    expect(visual.juegos.map((j) => j.codigo)).toEqual(["caza", "memopalabras", "lluvia"])
    expect(grupos.map((g) => g.bloque)).toEqual(BLOQUES_POR_NIVEL.primario)
  })
})

describe("unidadSingular y textoProgreso", () => {
  it("pasa la unidad del catálogo a singular", () => {
    expect(unidadSingular("palabras")).toBe("Palabra")
    expect(unidadSingular("oraciones")).toBe("Oración")
    expect(unidadSingular("lluvias de 30 segundos")).toBe("Lluvia")
    expect(unidadSingular("otra cosa")).toBe("Ronda")
  })

  it("arma el texto de la barra", () => {
    expect(textoProgreso("palabras", 2, 8)).toBe("Palabra 3 de 8")
    expect(textoProgreso("palabras", 8, 8)).toBe("Palabra 8 de 8")
  })
})

describe("fraseDe", () => {
  it("varía según n y da la vuelta", () => {
    const n = FRASES.acierto.length
    expect(fraseDe("acierto", 0)).toBe(FRASES.acierto[0])
    expect(fraseDe("acierto", 1)).toBe(FRASES.acierto[1])
    expect(fraseDe("acierto", n)).toBe(FRASES.acierto[0])
    expect(fraseDe("acierto", -1)).toBe(FRASES.acierto[n - 1])
  })

  it("las frases de aviso no muestran la respuesta", () => {
    for (const f of FRASES.reintento) expect(f).toMatch(/otra vez|de nuevo/i)
  })
})

describe("textos y validaciones", () => {
  it("origen", () => {
    expect(ORIGEN_LABEL.consulta).toBe("En consulta")
    expect(ORIGEN_CORTO.practica).toBe("Práctica")
  })

  it("textoGradoBloqueado nombra el grado anterior y nunca un porcentaje", () => {
    expect(textoGradoBloqueado(2)).toBe("¡Jugá bien el grado 1 para desbloquear este!")
    expect(textoGradoBloqueado(3)).toBe("¡Jugá bien el grado 2 para desbloquear este!")
    expect(textoGradoBloqueado(1)).toContain("grado 1")
    for (const g of [1, 2, 3] as const) expect(textoGradoBloqueado(g)).not.toMatch(/%|80|porcentaje/)
  })

  it("leerGrado acepta solo 1, 2 y 3", () => {
    expect(leerGrado("1")).toBe(1)
    expect(leerGrado("3")).toBe(3)
    expect(leerGrado("4")).toBeNull()
    expect(leerGrado("")).toBeNull()
    expect(leerGrado(null)).toBeNull()
    expect(leerGrado(undefined)).toBeNull()
  })

  it("juegoDisponible: los tres de S13a y los cinco de S13b", () => {
    for (const j of ["detective", "rima", "palmas", "memotono", "rompe", "planeta", "nombra", "tocalo"] as const) {
      expect(juegoDisponible(j), j).toBe(true)
    }
    for (const j of ["lee", "eco", "caza"] as const) expect(juegoDisponible(j), j).toBe(true) // S14a
    for (const j of ["memopalabras", "ojo_lince", "lluvia"] as const) expect(juegoDisponible(j), j).toBe(true) // S14b
    // Están los 14: ya no queda ninguno en "Próximamente".
    expect(Object.values(JUEGOS).every((j) => juegoDisponible(j.codigo))).toBe(true)
  })

  it("Nombrá rápido y Lluvia se juegan sin personaje", () => {
    expect(juegoConPersonaje("nombra")).toBe(false)
    expect(juegoConPersonaje("lluvia")).toBe(false)
    expect(juegoConPersonaje("tocalo")).toBe(true)
  })

  it("partidaConReintento", () => {
    expect(partidaConReintento("detective", "practica")).toBe(true)
    expect(partidaConReintento("nombra", "consulta")).toBe(false)
    expect(partidaConReintento("tocalo", "practica")).toBe(false)
    expect(partidaConReintento("planeta", "consulta")).toBe(false)
    expect(partidaConReintento("planeta", "tarea")).toBe(true)
    expect(partidaConReintento("caza", "practica")).toBe(false)
    for (const j of ["memopalabras", "ojo_lince", "lluvia"] as const) expect(partidaConReintento(j, "practica"), j).toBe(false)
    expect(partidaConReintento("eco", "practica")).toBe(true)
  })

  it("jugadaValida: catálogo, disponibilidad, nivel y grado", () => {
    const base = { nivel: "inicial" as const, grado: 1 as const, modo: "nino" as const }
    expect(jugadaValida({ ...base, juego: "detective" })).toBe(true)
    expect(jugadaValida({ ...base, juego: "noexiste" })).toBe(false)
    expect(jugadaValida({ ...base, juego: "memotono" })).toBe(true)
    expect(jugadaValida({ ...base, juego: "eco", nivel: "primario" })).toBe(true)
    expect(jugadaValida({ ...base, juego: "lluvia", nivel: "primario" })).toBe(true)
    expect(jugadaValida({ ...base, juego: "memopalabras" })).toBe(false) // Memopalabras es solo de primario
    expect(jugadaValida({ ...base, juego: "detective", grado: null })).toBe(false)
    expect(jugadaValida({ ...base, nivel: "primario", juego: "palmas" })).toBe(false) // palmas es solo de inicial
  })

  it("jugadaValida: el niño en la práctica solo juega hasta el grado habilitado", () => {
    const base = { juego: "rima", nivel: "inicial" as const, modo: "nino" as const }
    expect(jugadaValida({ ...base, grado: 2 })).toBe(false)
    expect(jugadaValida({ ...base, grado: 2, habilitado: 2 })).toBe(true)
    expect(jugadaValida({ ...base, grado: 3, habilitado: 2 })).toBe(false)
    expect(jugadaValida({ ...base, grado: 3, habilitado: 1, enTarea: true })).toBe(true)
  })

  it("jugadaValida: el profesional juega cualquier grado", () => {
    expect(jugadaValida({ juego: "rima", nivel: "primario", grado: 3, modo: "profesional" })).toBe(true)
  })

  it("jugadaValida: el niño nunca abre Nombrá rápido (solo consulta); el profesional, sí", () => {
    expect(jugadaValida({ juego: "nombra", nivel: "inicial", grado: 1, modo: "nino" })).toBe(false)
    expect(jugadaValida({ juego: "nombra", nivel: "inicial", grado: 1, modo: "nino", enTarea: true, habilitado: 3 })).toBe(false)
    expect(jugadaValida({ juego: "nombra", nivel: "primario", grado: 3, modo: "profesional" })).toBe(true)
  })

  it("jugadaValida: el niño nunca abre un juego de solo consulta", () => {
    // Se simula también con otro juego del catálogo.
    const original = JUEGOS.detective.soloConsulta
    JUEGOS.detective.soloConsulta = true
    try {
      expect(jugadaValida({ juego: "detective", nivel: "inicial", grado: 1, modo: "nino", enTarea: true })).toBe(false)
      expect(jugadaValida({ juego: "detective", nivel: "inicial", grado: 1, modo: "profesional" })).toBe(true)
    } finally {
      JUEGOS.detective.soloConsulta = original
    }
  })

  it("rutaJugar y rutaConsulta", () => {
    expect(rutaJugar("rima", 2)).toBe("/entrenamiento/jugar/rima?grado=2")
    expect(rutaJugar("rima", 1, "t-1")).toBe("/entrenamiento/jugar/rima?grado=1&tarea=t-1")
    expect(rutaConsulta("n1")).toBe("/ninos/n1/entrenamiento")
    expect(rutaConsulta("n1", "palmas", 3)).toBe("/ninos/n1/entrenamiento/palmas?grado=3")
    expect(rutaConsulta("n1", "palmas")).toBe("/ninos/n1/entrenamiento/palmas?grado=1")
  })

  it("esCodigoJuego y nombreJuego", () => {
    expect(esCodigoJuego("detective")).toBe(true)
    expect(esCodigoJuego("toString")).toBe(false)
    expect(nombreJuego("rima")).toBe("Rima")
    expect(nombreJuego("viejo")).toBe("viejo")
  })
})

describe("S14a: progreso y frases de lectura", () => {
  it("la barra de Leé y descubrí cuenta preguntas", () => {
    expect(JUEGOS.lee.niveles.primario!.unidadProgreso).toBe("preguntas")
    expect(textoProgreso("preguntas", 2, 6)).toBe("Pregunta 3 de 6")
  })

  it("hay frases para la lectura", () => {
    expect(FRASES.lectura.length).toBeGreaterThan(0)
    expect(fraseDe("lectura", 0)).toBe("Leé con calma.")
  })
})
