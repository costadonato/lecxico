import { describe, expect, it } from "vitest"

import {
  partidasPorSemana,
  rangoDelPeriodo,
  resumenPorJuego,
  resumenSemanas,
  semanaDe,
  totalesPorOrigen,
  type PartidaSeguimiento,
} from "@/lib/seguimiento/entrenamiento"

function partida(p: Partial<PartidaSeguimiento> & Pick<PartidaSeguimiento, "created_at">): PartidaSeguimiento {
  return {
    juego: "detective",
    grado: 1,
    origen: "practica",
    correctas: 4,
    total: 8,
    porcentaje: 50,
    tiempo_ms: null,
    errores: null,
    profesional_id: null,
    ...p,
  }
}

describe("semanaDe (lunes, hora de Argentina)", () => {
  it("un miércoles cae en el lunes de esa semana", () => {
    expect(semanaDe("2026-11-25T15:00:00Z")).toBe("2026-11-23")
  })

  it("el lunes 00:30 de Argentina (03:30 UTC) es de esa semana", () => {
    expect(semanaDe("2026-11-23T03:30:00Z")).toBe("2026-11-23")
  })

  it("el lunes 01:00 UTC todavía es domingo en Argentina: semana anterior", () => {
    expect(semanaDe("2026-11-23T01:00:00Z")).toBe("2026-11-16")
  })

  it("el domingo a la noche es de la semana que empezó el lunes anterior", () => {
    expect(semanaDe("2026-11-29T23:59:00-03:00")).toBe("2026-11-23")
  })

  it("acepta un Date", () => {
    expect(semanaDe(new Date("2026-11-26T12:00:00Z"))).toBe("2026-11-23")
  })
})

describe("partidasPorSemana", () => {
  it("sin partidas: las semanas del rango con 0", () => {
    const semanas = partidasPorSemana([], { desde: "2026-11-10T12:00:00Z", hasta: "2026-11-26T12:00:00Z" })
    expect(semanas.map((s) => s.semana)).toEqual(["2026-11-09", "2026-11-16", "2026-11-23"])
    expect(semanas.every((s) => s.total === 0 && s.consulta === 0 && s.tarea === 0 && s.practica === 0)).toBe(true)
    expect(semanas[0].hasta).toBe("2026-11-15")
  })

  it("una sola semana, contando por origen", () => {
    const partidas = [
      partida({ origen: "consulta", created_at: "2026-11-23T14:00:00Z" }),
      partida({ origen: "practica", created_at: "2026-11-24T14:00:00Z" }),
      partida({ origen: "practica", created_at: "2026-11-25T14:00:00Z" }),
      partida({ origen: "tarea", created_at: "2026-11-26T14:00:00Z" }),
    ]
    expect(partidasPorSemana(partidas, { desde: "2026-11-26T12:00:00Z", hasta: "2026-11-26T12:00:00Z" })).toEqual([
      { semana: "2026-11-23", hasta: "2026-11-29", consulta: 1, tarea: 1, practica: 2, total: 4 },
    ])
  })

  it("incluye las semanas vacías del medio y no cuenta lo que queda fuera del rango", () => {
    const partidas = [
      partida({ created_at: "2026-11-02T14:00:00Z" }), // fuera (antes)
      partida({ origen: "consulta", created_at: "2026-11-10T14:00:00Z" }),
      partida({ origen: "tarea", created_at: "2026-11-25T14:00:00Z" }),
      partida({ created_at: "2026-12-01T14:00:00Z" }), // fuera (después)
    ]
    const semanas = partidasPorSemana(partidas, { desde: "2026-11-09T12:00:00Z", hasta: "2026-11-29T12:00:00Z" })
    expect(semanas.map((s) => [s.semana, s.total])).toEqual([
      ["2026-11-09", 1],
      ["2026-11-16", 0],
      ["2026-11-23", 1],
    ])
  })

  it("cruza el cambio de año (la semana del 28/12/2026 termina el 03/01/2027)", () => {
    const partidas = [
      partida({ created_at: "2026-12-31T20:00:00Z" }),
      partida({ origen: "consulta", created_at: "2027-01-02T20:00:00Z" }),
      partida({ origen: "tarea", created_at: "2027-01-05T20:00:00Z" }),
    ]
    expect(partidasPorSemana(partidas, { desde: "2026-12-29T12:00:00Z", hasta: "2027-01-06T12:00:00Z" })).toEqual([
      { semana: "2026-12-28", hasta: "2027-01-03", consulta: 1, tarea: 0, practica: 1, total: 2 },
      { semana: "2027-01-04", hasta: "2027-01-10", consulta: 0, tarea: 1, practica: 0, total: 1 },
    ])
  })

  it("cuenta las partidas con tiempo y errores (denominación) junto con las demás", () => {
    const partidas = [
      partida({ juego: "nombra", origen: "consulta", tiempo_ms: 95_000, errores: 3, created_at: "2026-11-24T14:00:00Z" }),
      partida({ juego: "tocalo", tiempo_ms: 1_800, errores: 1, created_at: "2026-11-24T15:00:00Z" }),
      partida({ juego: "rima", created_at: "2026-11-24T16:00:00Z" }),
    ]
    const [s] = partidasPorSemana(partidas, { desde: "2026-11-24T00:00:00Z", hasta: "2026-11-24T23:00:00Z" })
    expect(s).toMatchObject({ consulta: 1, practica: 2, total: 3 })
  })

  it("desde posterior a hasta: lista vacía", () => {
    expect(partidasPorSemana([], { desde: "2026-12-01T12:00:00Z", hasta: "2026-11-01T12:00:00Z" })).toEqual([])
  })
})

describe("rangoDelPeriodo", () => {
  const ahora = new Date("2026-11-26T12:00:00Z")

  it("últimas 12 semanas: 12 semanas que terminan en la actual", () => {
    const rango = rangoDelPeriodo("ultimas_12", [], ahora)
    const semanas = partidasPorSemana([], rango)
    expect(semanas).toHaveLength(12)
    expect(semanas[0].semana).toBe("2026-09-07")
    expect(semanas.at(-1)?.semana).toBe("2026-11-23")
  })

  it("todo: desde la semana de la primera partida; sin partidas, solo la semana actual", () => {
    const partidas = [
      partida({ created_at: "2026-10-01T12:00:00Z" }),
      partida({ created_at: "2026-06-15T12:00:00Z" }),
      partida({ created_at: "fecha-ilegible" }),
    ]
    const rango = rangoDelPeriodo("todo", partidas, ahora)
    expect(rango.desde.toISOString()).toBe("2026-06-15T12:00:00.000Z")
    expect(rango.hasta).toEqual(ahora)
    expect(partidasPorSemana([], rangoDelPeriodo("todo", [], ahora)).map((s) => s.semana)).toEqual(["2026-11-23"])
  })

  it("una partida con el reloj adelantado corre el final del rango", () => {
    const rango = rangoDelPeriodo("todo", [partida({ created_at: "2026-12-02T12:00:00Z" })], ahora)
    expect(rango.hasta.toISOString()).toBe("2026-12-02T12:00:00.000Z")
  })

  it("usa la fecha actual si no se pasa", () => {
    const antes = Date.now()
    expect(rangoDelPeriodo("ultimas_12", []).hasta.getTime()).toBeGreaterThanOrEqual(antes)
  })
})

describe("totalesPorOrigen y resumenSemanas", () => {
  const semanas = [
    { semana: "2026-11-16", hasta: "2026-11-22", consulta: 2, tarea: 1, practica: 0, total: 3 },
    { semana: "2026-11-23", hasta: "2026-11-29", consulta: 3, tarea: 3, practica: 3, total: 9 },
  ]

  it("suma por origen", () => {
    expect(totalesPorOrigen(semanas)).toEqual({ consulta: 5, tarea: 4, practica: 3, total: 12 })
  })

  it("arma el texto con el período", () => {
    expect(resumenSemanas(semanas)).toBe("12 partidas en 2 semanas: 5 en consulta, 4 de tareas y 3 de práctica en casa.")
    expect(resumenSemanas([{ ...semanas[0], consulta: 1, tarea: 0, total: 1 }])).toBe(
      "1 partida en 1 semana: 1 en consulta, 0 de tareas y 0 de práctica en casa.",
    )
    expect(resumenSemanas([{ ...semanas[0], consulta: 0, tarea: 0, total: 0 }])).toBe("No hay partidas en 1 semana.")
  })
})

describe("resumenPorJuego", () => {
  it("sin partidas: sin filas", () => {
    expect(resumenPorJuego([], {})).toEqual([])
  })

  it("una fila por juego con partidas por origen, último, mejor y grado máximo, de la más reciente a la más vieja", () => {
    const partidas = [
      partida({ juego: "rima", origen: "consulta", grado: 2, porcentaje: 70, created_at: "2026-11-20T12:00:00Z" }),
      partida({ juego: "detective", origen: "practica", grado: 1, porcentaje: 90, created_at: "2026-11-10T12:00:00Z" }),
      partida({ juego: "rima", origen: "practica", grado: 3, porcentaje: 40, created_at: "2026-11-25T12:00:00Z" }),
      partida({ juego: "rima", origen: "tarea", grado: 1, porcentaje: 85, created_at: "2026-11-15T12:00:00Z" }),
    ]
    expect(resumenPorJuego(partidas, { rima: 3 })).toEqual([
      {
        juego: "rima",
        nombre: "Rima",
        gradoHabilitado: 3,
        partidas: { consulta: 1, tarea: 1, practica: 1 },
        total: 3,
        ultimo: { porcentaje: 40, fecha: "2026-11-25T12:00:00Z" },
        mejorPorcentaje: 85,
        gradoMaximo: 3,
      },
      {
        juego: "detective",
        nombre: "Detective de sonidos",
        // Sin dato de la base: el grado 1 está siempre habilitado.
        gradoHabilitado: 1,
        partidas: { consulta: 0, tarea: 0, practica: 1 },
        total: 1,
        ultimo: { porcentaje: 90, fecha: "2026-11-10T12:00:00Z" },
        mejorPorcentaje: 90,
        gradoMaximo: 1,
      },
    ])
  })

  it("no cambia el último si llega una partida más vieja después", () => {
    const filas = resumenPorJuego(
      [
        partida({ porcentaje: 60, created_at: "2026-11-25T12:00:00Z" }),
        partida({ porcentaje: 100, created_at: "2026-11-01T12:00:00Z" }),
      ],
      {},
    )
    expect(filas[0].ultimo).toEqual({ porcentaje: 60, fecha: "2026-11-25T12:00:00Z" })
    expect(filas[0].mejorPorcentaje).toBe(100)
  })

  it("mezcla juegos con tiempo y errores (denominación) con los demás", () => {
    const filas = resumenPorJuego(
      [
        partida({ juego: "nombra", origen: "consulta", tiempo_ms: 95_000, errores: 3, porcentaje: 94, created_at: "2026-11-24T14:00:00Z" }),
        partida({ juego: "tocalo", tiempo_ms: 1_800, errores: 1, porcentaje: 95, created_at: "2026-11-23T14:00:00Z" }),
        partida({ juego: "palmas", porcentaje: 50, created_at: "2026-11-22T14:00:00Z" }),
      ],
      { tocalo: 2 },
    )
    expect(filas.map((f) => [f.juego, f.total, f.ultimo.porcentaje])).toEqual([
      ["nombra", 1, 94],
      ["tocalo", 1, 95],
      ["palmas", 1, 50],
    ])
    // Nombrá rápido es de solo consulta: no tiene grado en casa.
    expect(filas[0].gradoHabilitado).toBeNull()
    expect(filas[1].gradoHabilitado).toBe(2)
  })

  it("sin grado en casa para un juego de otro nivel o que no está en el catálogo", () => {
    const filas = resumenPorJuego(
      [
        // Rompe y une es solo de primario.
        partida({ juego: "rompe", created_at: "2026-11-24T14:00:00Z" }),
        partida({ juego: "juego_retirado", created_at: "2026-11-23T14:00:00Z" }),
        partida({ juego: "detective", created_at: "2026-11-22T14:00:00Z" }),
      ],
      { rompe: 2, detective: 2 },
      { nivel: "inicial" },
    )
    expect(filas.map((f) => [f.juego, f.nombre, f.gradoHabilitado])).toEqual([
      ["rompe", "Rompe y une", null],
      ["juego_retirado", "juego_retirado", null],
      ["detective", "Detective de sonidos", 2],
    ])
  })
})
