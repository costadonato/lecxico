import { describe, expect, it } from "vitest"

import {
  HOY_EJEMPLO,
  OTRO_EJEMPLO,
  TESTS_EJEMPLO,
  USUARIO_EJEMPLO,
  datosEjemplo,
  opcionesEjemplo,
} from "@/lib/informes/ejemplo"
import {
  ACLARACION_PROFESIONAL,
  CONFIDENCIALIDAD,
  OTRO_PROFESIONAL,
  PIE,
  SIN_REGISTROS,
  construirInforme,
  nombreArchivoInforme,
  type TestInforme,
} from "@/lib/informes/modelo"
import type { OpcionesInforme } from "@/lib/informes/opciones"

const informe = (o: Partial<OpcionesInforme> = {}, d = datosEjemplo(), variante: "profesional" | "tutor" = "profesional") =>
  construirInforme(d, opcionesEjemplo(o), variante, HOY_EJEMPLO)

const [ULTIMA, DE_OTRO] = TESTS_EJEMPLO

/** Una evaluación de inicial (denominación rápida sin corte). */
const INICIAL: TestInforme = {
  id: "30000000-0000-4000-8000-000000000001",
  nivel: "inicial",
  fecha: "2026-03-10T10:00:00-03:00",
  created_at: "2026-03-10T10:00:00-03:00",
  profesional_id: USUARIO_EJEMPLO,
  bloques: [
    { bloque_codigo: "discriminacion_auditiva", orden: 1, correctas: 5, total: 6, tiempo_ms: null, errores: null },
    { bloque_codigo: "conciencia_fonologica", orden: 2, correctas: 1, total: 3, tiempo_ms: null, errores: null },
    { bloque_codigo: "denominacion_rapida", orden: 5, correctas: 46, total: 48, tiempo_ms: 95_000, errores: 2, detalle: null },
  ],
}

describe("encabezado y datos del niño", () => {
  it("título según el contenido elegido", () => {
    expect(informe().titulo).toBe("Informe de evaluación y seguimiento")
    expect(informe({ seguimiento: false }).titulo).toBe("Informe de evaluación")
    expect(informe({ evaluacion: false }).titulo).toBe("Informe de seguimiento")
  })

  it("cada combinación de contenido arma solo lo elegido", () => {
    const soloEvaluacion = informe({ seguimiento: false })
    expect(soloEvaluacion.evaluacion).not.toBeNull()
    expect(soloEvaluacion.seguimiento).toBeNull()
    expect(soloEvaluacion.periodo).toBeNull()

    const soloSeguimiento = informe({ evaluacion: false })
    expect(soloSeguimiento.evaluacion).toBeNull()
    expect(soloSeguimiento.seguimiento).not.toBeNull()

    const ambos = informe()
    expect(ambos.evaluacion).not.toBeNull()
    expect(ambos.seguimiento).not.toBeNull()
  })

  it("emisor, fecha de emisión, período, aclaración, confidencialidad y pie", () => {
    const m = informe({ periodo: "ultimos_3_meses" })
    expect(m.emisor).toBe("Laura Gómez")
    expect(m.fechaEmision).toBe("27/11/2026")
    expect(m.periodo).toBe("27/08/2026 al 27/11/2026")
    expect(m.aclaracion).toBe(ACLARACION_PROFESIONAL)
    expect(m.confidencialidad).toBe(CONFIDENCIALIDAD)
    expect(m.pie).toBe(PIE)
    expect(informe({ periodo: "todo" }).periodo).toBe("Todo el historial (hasta el 27/11/2026)")
  })

  it("datos del niño: nombre, nacimiento con edad, etapa, nivel y vinculado desde", () => {
    expect(informe().nino).toEqual([
      { etiqueta: "Nombre y apellido", valor: "Martina Fernández" },
      { etiqueta: "Fecha de nacimiento", valor: "14/03/2019 (7 años)" },
      { etiqueta: "Etapa escolar", valor: "2do grado" },
      { etiqueta: "Nivel", valor: "Primario" },
      { etiqueta: "Vinculado desde", valor: "20/08/2026" },
    ])
  })

  it("la edad cuenta si ya cumplió años; sin vínculo ni fecha válida, guion o sin edad", () => {
    const d = datosEjemplo({ vinculadoDesde: null, nino: { ...datosEjemplo().nino, fecha_nacimiento: "2019-11-28" } })
    const filas = construirInforme(d, opcionesEjemplo(), "profesional", HOY_EJEMPLO).nino
    expect(filas[1].valor).toBe("28/11/2019 (6 años)")
    expect(filas[4].valor).toBe("—")
    const sinFecha = datosEjemplo({ nino: { ...datosEjemplo().nino, fecha_nacimiento: "x" } })
    expect(construirInforme(sinFecha, opcionesEjemplo(), "profesional", HOY_EJEMPLO).nino[1].valor).toBe("—")
    const futura = datosEjemplo({ nino: { ...datosEjemplo().nino, fecha_nacimiento: "2030-01-01" } })
    expect(construirInforme(futura, opcionesEjemplo(), "profesional", HOY_EJEMPLO).nino[1].valor).toBe("01/01/2030")
  })

  it("nombre del archivo sin tildes ni espacios", () => {
    expect(informe().nombreArchivo).toBe("Informe-Lecxico_Fernandez-Martina_2026-11-27.pdf")
    expect(nombreArchivoInforme({ nombre: "José María", apellido: "Núñez de la Peña" }, "2026-01-02")).toBe(
      "Informe-Lecxico_Nunez-de-la-Pena-Jose-Maria_2026-01-02.pdf",
    )
    expect(nombreArchivoInforme({ nombre: "", apellido: "!!" }, "2026-01-02")).toBe("Informe-Lecxico_Nino-Nino_2026-01-02.pdf")
  })

  it("observaciones recortadas; vacías no salen", () => {
    expect(informe({ observaciones: "  Texto  " }).observaciones).toBe("Texto")
    expect(informe({ observaciones: "   " }).observaciones).toBeNull()
  })

  it("con fechas inválidas (no debería pasar) toma todo el historial", () => {
    const m = informe({ periodo: "elegir", desde: "", hasta: "" })
    expect(m.periodo).toContain("Todo el historial")
  })

  it("'hoy' por defecto es el momento actual", () => {
    expect(construirInforme(datosEjemplo(), opcionesEjemplo(), "profesional").fechaEmision).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

describe("sección Evaluación", () => {
  it("tabla de bloques con aciertos, total, porcentaje y franja", () => {
    const ev = informe().evaluacion!
    expect(ev.subtitulo).toBe("Evaluación del 05/11/2026 · Nivel Primario")
    expect(ev.registradoPor).toBeNull()
    expect(ev.filas[0]).toEqual({
      bloque: "Discriminación Auditiva",
      aciertos: 5,
      total: 5,
      porcentaje: "100 %",
      franja: { clave: "correcto", texto: "Correcto" },
      detalle: [],
    })
    expect(ev.filas.map((f) => f.franja?.clave)).toContain("a_observar")
  })

  it("denominación rápida de primaria: sin porcentaje, con tiempo, errores, detalle por ejercicio y franja", () => {
    const fila = informe().evaluacion!.filas.at(-1)!
    expect(fila.bloque).toBe("Denominación Rápida")
    expect(fila.porcentaje).toBe("—")
    expect(fila.detalle).toEqual([
      "Tiempo 2:05 y 2 errores.",
      "Ejercicio 1: 1:03, 1 error (49 / 50).",
      "Ejercicio 2: 1:03, 1 error (49 / 50).",
    ])
    // 2.º grado: 125 s ≤ 131 (intermedio) y 2 errores (intermedio).
    expect(fila.franja).toEqual({ clave: "intermedio", texto: "Intermedio" })
  })

  it("denominación rápida de inicial: sin franja de referencia, y sin tiempo en las viejas", () => {
    const viejo: TestInforme = {
      ...INICIAL,
      id: "viejo",
      bloques: [{ bloque_codigo: "denominacion_rapida", orden: 5, correctas: 8, total: 10, tiempo_ms: null, errores: null }],
    }
    const d = datosEjemplo({ tests: [INICIAL, viejo] })
    const ev = construirInforme(d, opcionesEjemplo({ testId: INICIAL.id }), "profesional", HOY_EJEMPLO).evaluacion!
    const den = ev.filas.at(-1)!
    expect(den.franja).toEqual({ clave: "sin_franja", texto: "Sin franja de referencia" })
    expect(den.detalle).toEqual(["Tiempo 1:35 y 2 errores."])
    expect(ev.leyendas).toContain(
      "Sin franja de referencia: no hay valores de la bibliografía para comparar este resultado. Su interpretación queda a cargo del profesional.",
    )
    const evViejo = construirInforme(d, opcionesEjemplo({ testId: "viejo" }), "profesional", HOY_EJEMPLO).evaluacion!
    expect(evViejo.filas[0].detalle).toEqual(["Sin tiempo registrado."])
  })

  it("un bloque con otro total que el del corte queda sin franja de referencia", () => {
    const raro: TestInforme = {
      ...INICIAL,
      id: "raro",
      bloques: [{ bloque_codigo: "discriminacion_auditiva", orden: 1, correctas: 3, total: 4, tiempo_ms: null, errores: null }],
    }
    const ev = construirInforme(datosEjemplo({ tests: [raro] }), opcionesEjemplo({ testId: "raro" }), "profesional", HOY_EJEMPLO).evaluacion!
    expect(ev.filas[0].franja?.clave).toBe("sin_franja")
    expect(ev.recomendacion?.vacio).toContain("No hay una recomendación específica")
  })

  it("leyendas: qué son las franjas y el grado usado; sin 'sin franja' si todos tienen", () => {
    const ev = informe().evaluacion!
    expect(ev.leyendas?.[0]).toContain("Las franjas comparan cada bloque")
    expect(ev.leyendas?.some((l) => l.startsWith("Sin franja"))).toBe(false)
    expect(ev.leyendas?.at(-1)).toBe(
      "La franja de correspondencia sonido-letra y la de denominación rápida usan el grado actual del niño (2do grado).",
    )
  })

  it("recomendación: bloques en intermedio y a observar con sus juegos; se puede omitir", () => {
    const rec = informe().evaluacion!.recomendacion!
    expect(rec.vacio).toBeNull()
    expect(rec.bloques.map((b) => b.franja.clave).every((c) => c === "intermedio" || c === "a_observar")).toBe(true)
    expect(rec.bloques.length).toBeGreaterThan(0)
    for (const b of rec.bloques) expect(b.juegos.length).toBeGreaterThan(0)
    expect(rec.nota).toContain("lo decide el profesional")
    expect(informe({ incluirRecomendacion: false }).evaluacion!.recomendacion).toBeUndefined()
  })

  it("una evaluación de otro profesional lleva quién la registró (nombre o 'Otro profesional')", () => {
    expect(informe({ testId: DE_OTRO.id }).evaluacion!.registradoPor).toBe(OTRO_PROFESIONAL)
    const conNombre = datosEjemplo({ nombresProfesionales: { [OTRO_EJEMPLO]: "Sofía Ruiz" } })
    expect(informe({ testId: DE_OTRO.id }, conNombre).evaluacion!.registradoPor).toBe("Sofía Ruiz")
  })

  it("sin lo de otros profesionales, la evaluación de otro no está disponible", () => {
    const ev = informe({ testId: DE_OTRO.id, incluirOtrosProfesionales: false }).evaluacion!
    expect(ev.vacio).toBe("La evaluación elegida no está disponible.")
    expect(ev.filas).toEqual([])
  })

  it("un niño sin evaluaciones", () => {
    const m = informe({ testId: null }, datosEjemplo({ tests: [] }))
    expect(m.evaluacion?.vacio).toBe("Todavía no hay evaluaciones registradas.")
    expect(m.seguimiento?.evolucion?.vacio).toBe(SIN_REGISTROS)
    expect(m.seguimiento?.denominacion?.vacio).toBe(SIN_REGISTROS)
  })
})

describe("sección Seguimiento", () => {
  it("evolución: un gráfico por bloque (sin denominación rápida), con bandas, franja y resumen", () => {
    const evo = informe().seguimiento!.evolucion!
    expect(evo.vacio).toBeNull()
    expect(evo.niveles).toHaveLength(1)
    const graficos = evo.niveles[0].graficos
    expect(graficos.map((g) => g.bloque)).not.toContain("Denominación Rápida")
    expect(graficos).toHaveLength(8)
    const primero = graficos[0]
    expect(primero.puntos.map((p) => p.etiqueta)).toEqual(["28/08", "18/09", "05/11"])
    expect(primero.puntos[0]).toMatchObject({ fecha: "28/08/2026", valor: 60, franja: "intermedio" })
    expect(primero.bandas?.map((b) => b.franja)).toEqual(["a_observar", "intermedio", "correcto"])
    expect(primero.ultimaFranja).toEqual({ clave: "correcto", texto: "Correcto" })
    expect(primero.resumen).toBe("Discriminación Auditiva: de 60 % a 100 % en 3 evaluaciones; última franja: correcto.")
    expect(evo.leyendas?.[0]).toContain("con las franjas de fondo")
  })

  it("evolución: lista de evaluaciones del período con 'Registrado por' si hay de otros", () => {
    const evo = informe().seguimiento!.evolucion!
    expect(evo.evaluaciones?.columnas.map((c) => c.titulo)).toEqual(["Fecha", "Nivel", "Registrado por"])
    expect(evo.evaluaciones?.filas).toEqual([
      ["28/08/2026", "Primario", "Laura Gómez"],
      ["18/09/2026", "Primario", OTRO_PROFESIONAL],
      ["05/11/2026", "Primario", "Laura Gómez"],
    ])
    const propias = informe({ incluirOtrosProfesionales: false }).seguimiento!.evolucion!
    expect(propias.evaluaciones?.columnas.map((c) => c.titulo)).toEqual(["Fecha", "Nivel"])
    expect(propias.evaluaciones?.filas).toHaveLength(2)
  })

  it("evolución con los dos niveles: el actual primero; inicial sin bandas en denominación", () => {
    const d = datosEjemplo({ tests: [...TESTS_EJEMPLO, INICIAL] })
    const m = construirInforme(d, opcionesEjemplo(), "profesional", HOY_EJEMPLO)
    expect(m.seguimiento!.evolucion!.niveles.map((n) => n.nivel)).toEqual(["Nivel Primario", "Nivel Inicial"])
    const den = m.seguimiento!.denominacion!
    expect(den.niveles.map((n) => n.nivel)).toEqual(["Nivel Primario", "Nivel Inicial"])
    const inicial = den.niveles[1]
    expect(inicial.ultimaFranja).toEqual({ clave: "sin_franja", texto: "Sin franja de referencia" })
    expect(inicial.puntos[0]).toMatchObject({ tiempo: "1:35", errores: 2, aciertosPorcentaje: 96, franja: "sin_franja" })
  })

  it("un bloque sin referencia en la evolución va sin bandas y lo aclara", () => {
    const raro: TestInforme = {
      ...INICIAL,
      bloques: [{ bloque_codigo: "discriminacion_auditiva", orden: 1, correctas: 3, total: 6, tiempo_ms: null, errores: null }],
    }
    const conGrado = datosEjemplo({ tests: [raro], nino: { ...datosEjemplo().nino, etapa_escolar: "sala_5" } })
    const sinGrado = construirInforme(conGrado, opcionesEjemplo(), "profesional", HOY_EJEMPLO).seguimiento!.evolucion!
    expect(sinGrado.niveles[0].graficos[0].bandas).not.toBeNull()

    // Correspondencia sonido-letra depende del grado: con etapa de inicial no se conoce.
    const csl: TestInforme = { ...TESTS_EJEMPLO[0], id: "csl" }
    const d = datosEjemplo({ tests: [csl], nino: { ...datosEjemplo().nino, etapa_escolar: "sala_5" } })
    const evo = construirInforme(d, opcionesEjemplo(), "profesional", HOY_EJEMPLO).seguimiento!.evolucion!
    const grafico = evo.niveles[0].graficos.find((g) => g.bloque === "Correspondencia Sonido-Letra")!
    expect(grafico.bandas).toBeNull()
    expect(grafico.ultimaFranja?.clave).toBe("sin_franja")
    expect(evo.leyendas).toContain("Sin franja de referencia: el gráfico va sin franjas de fondo.")
  })

  it("denominación rápida de primaria: tiempo, errores, aciertos, franja, resumen y tabla", () => {
    const den = informe().seguimiento!.denominacion!
    expect(den.nota).toContain("Menos tiempo es mejor")
    const primaria = den.niveles[0]
    expect(primaria.puntos.map((p) => p.tiempo)).toEqual(["2:31", "2:18", "2:05"])
    expect(primaria.puntos[0].segundos).toBe(151)
    expect(primaria.resumen).toContain("tiempo de 2:31 a 2:05")
    expect(primaria.tabla.columnas.map((c) => c.titulo)).toEqual(["Fecha", "Tiempo", "Errores", "Aciertos", "Franja"])
    expect(primaria.tabla.filas[2]).toEqual(["05/11/2026", "2:05", "2", "98 %", { clave: "intermedio", texto: "Intermedio" }])
    expect(primaria.vacio).toBeNull()
  })

  it("denominación rápida sin tiempo (anteriores a S9) o sin el bloque", () => {
    const viejo: TestInforme = {
      ...INICIAL,
      bloques: [{ bloque_codigo: "denominacion_rapida", orden: 5, correctas: 8, total: 10, tiempo_ms: null, errores: null }],
    }
    const sinTiempo = construirInforme(datosEjemplo({ tests: [viejo] }), opcionesEjemplo(), "profesional", HOY_EJEMPLO)
    const nivel = sinTiempo.seguimiento!.denominacion!.niveles[0]
    expect(nivel.vacio).toBe("Sin tiempo registrado en las evaluaciones del período.")
    expect(nivel.ultimaFranja).toBeUndefined()

    const sinBloque: TestInforme = { ...INICIAL, bloques: INICIAL.bloques.slice(0, 2) }
    const m = construirInforme(datosEjemplo({ tests: [sinBloque] }), opcionesEjemplo(), "profesional", HOY_EJEMPLO)
    expect(m.seguimiento!.denominacion!.vacio).toBe("Las evaluaciones del período no tienen denominación rápida.")
  })

  it("entrenamiento: semanas apiladas por origen y tabla por juego con 'Registrado por'", () => {
    const ent = informe({ periodo: "elegir", desde: "2026-11-01", hasta: "2026-11-27" }).seguimiento!.entrenamiento!
    expect(ent.vacio).toBeNull()
    // Semanas del lunes 26/10 al lunes 23/11.
    expect(ent.semanas.map((s) => s.etiqueta)).toEqual(["26/10", "02/11", "09/11", "16/11", "23/11"])
    expect(ent.semanas.at(-1)).toEqual({ etiqueta: "23/11", consulta: 0, tarea: 2, practica: 1, total: 3 })
    expect(ent.maximo).toBe(3)
    expect(ent.resumenSemanas).toBe("8 partidas en 5 semanas: 3 en consulta, 2 de tareas y 3 de práctica en casa.")
    expect(ent.porJuego?.columnas.map((c) => c.titulo)).not.toContain("Registrado por")
    const rima = ent.porJuego!.filas.find((f) => String(f[0]).startsWith("Rima"))!
    expect(rima).toEqual(["Rima\nHasta grado 2", "Grado 3", "0", "1", "2", "88 %\n26/11/2026", "100 %"])

    const todo = informe().seguimiento!.entrenamiento!
    const columnas = todo.porJuego!.columnas.map((c) => c.titulo)
    expect(columnas.at(-1)).toBe("Registrado por")
    const rompe = todo.porJuego!.filas.find((f) => String(f[0]).startsWith("Rompe"))!
    expect(rompe.at(-1)).toBe(OTRO_PROFESIONAL)
    const memotono = todo.porJuego!.filas.find((f) => String(f[0]).startsWith("Memotono"))!
    expect(memotono.at(-1)).toBe("—")
    const detective = todo.porJuego!.filas.find((f) => String(f[0]).startsWith("Detective"))!
    expect(detective.at(-1)).toBe(`Laura Gómez, ${OTRO_PROFESIONAL}`)
  })

  it("un juego de solo consulta dice que no se juega en casa", () => {
    const nombra = {
      ...datosEjemplo().partidas[0],
      juego: "nombra",
      origen: "consulta" as const,
      profesional_id: USUARIO_EJEMPLO,
    }
    const m = informe({}, datosEjemplo({ partidas: [nombra] }))
    expect(m.seguimiento!.entrenamiento!.porJuego!.filas[0][1]).toBe("No se juega en casa")
  })

  it("tareas del período con estado y fecha de realización", () => {
    const t = informe().seguimiento!.tareas!
    expect(t.resumen).toBe("2 tareas asignadas en el período; 1 hecha.")
    expect(t.tabla?.columnas.map((c) => c.titulo)).toEqual(["Tarea", "Juegos", "Asignada", "Estado", "Realizada", "Registrado por"])
    expect(t.tabla?.filas).toEqual([
      ["Rimas y sonidos", "Rima (grado 2)\nDetective de sonidos (grado 2)", "20/11/2026", "Hecha", "24/11/2026", "Laura Gómez"],
      ["Sílabas", "Rompe y une (grado 2)", "25/11/2026", "Pendiente", "—", OTRO_PROFESIONAL],
    ])
  })

  it("tareas sin nombre: 'Misión' o 'Tarea'; sin juegos, guion", () => {
    const base = datosEjemplo().tareas[0]
    const d = datosEjemplo({
      tareas: [
        { ...base, id: "m", nombre: null, es_mision: true, items: [] },
        { ...base, id: "t", nombre: "  ", created_at: "2026-11-21T10:00:00-03:00" },
      ],
    })
    const filas = informe({ incluirOtrosProfesionales: false }, d).seguimiento!.tareas!.tabla!.filas
    expect(filas.map((f) => f[0])).toEqual(["Misión", "Tarea"])
    expect(filas[0][1]).toBe("—")
    expect(filas[0]).toHaveLength(5)
    const una = informe({}, datosEjemplo({ tareas: [{ ...base, estado: "pendiente", completada_at: null }] }))
    expect(una.seguimiento!.tareas!.resumen).toBe("1 tarea asignada en el período; 0 hechas.")
  })

  it("práctica en casa: partidas y juegos del período", () => {
    const p = informe().seguimiento!.practica!
    expect(p.resumen).toBe("6 partidas de práctica en casa en el período, en 4 juegos.")
    expect(p.tabla?.columnas.map((c) => c.titulo)).toEqual(["Juego", "Partidas", "Grado más alto", "Última partida"])
    expect(p.tabla?.filas[0]).toEqual(["Memotono", "2", "1", "15/11/2026"])
    expect(p.tabla?.filas.find((f) => f[0] === "Rima")).toEqual(["Rima", "2", "2", "26/11/2026"])
    const una = informe({}, datosEjemplo({ partidas: [datosEjemplo().partidas[0]] })).seguimiento!.practica!
    expect(una.resumen).toBe("1 partida de práctica en casa en el período, en 1 juego.")
  })

  it("filtro de autoría: salen evaluaciones, partidas y tareas de otros; la práctica queda", () => {
    const todo = informe()
    const propio = informe({ incluirOtrosProfesionales: false })
    const total = (m: typeof todo) =>
      m.seguimiento!.entrenamiento!.porJuego!.filas.reduce((s, f) => s + Number(f[2]) + Number(f[3]) + Number(f[4]), 0)
    expect(total(todo)).toBe(16)
    expect(total(propio)).toBe(13) // salen 3 partidas de otro: rompe (tarea), detective y rima (consulta)
    expect(propio.seguimiento!.practica!.resumen).toBe(todo.seguimiento!.practica!.resumen)
    expect(propio.seguimiento!.tareas!.tabla!.filas).toHaveLength(1)
    expect(propio.seguimiento!.denominacion!.niveles[0].puntos).toHaveLength(2)
  })

  it("período vacío: cada sección dice 'Sin registros en el período.'", () => {
    const m = informe({ periodo: "elegir", desde: "2020-01-01", hasta: "2020-01-31" })
    const s = m.seguimiento!
    expect(m.periodo).toBe("01/01/2020 al 31/01/2020")
    for (const seccion of [s.evolucion, s.denominacion, s.entrenamiento, s.tareas, s.practica]) {
      expect(seccion?.vacio).toBe(SIN_REGISTROS)
    }
    expect(s.entrenamiento?.semanas).toEqual([])
    expect(s.tareas?.tabla).toBeNull()
  })

  it("solo las secciones elegidas", () => {
    const secciones = { evolucion: false, denominacion: true, entrenamiento: false, tareas: true, practica: false }
    const s = informe({ secciones }).seguimiento!
    expect(s.evolucion).toBeNull()
    expect(s.entrenamiento).toBeNull()
    expect(s.practica).toBeNull()
    expect(s.denominacion).not.toBeNull()
    expect(s.tareas).not.toBeNull()
  })
})

/** Todas las claves y los textos del objeto, recorriéndolo entero. */
function recorrer(valor: unknown, claves: string[] = [], textos: string[] = []) {
  if (typeof valor === "string") textos.push(valor)
  else if (Array.isArray(valor)) valor.forEach((v) => recorrer(v, claves, textos))
  else if (valor && typeof valor === "object") {
    for (const [k, v] of Object.entries(valor)) {
      claves.push(k)
      recorrer(v, claves, textos)
    }
  }
  return { claves, textos }
}

describe("variante tutor", () => {
  const d = datosEjemplo({ tests: [...TESTS_EJEMPLO, INICIAL], emisor: null })
  const m = construirInforme(d, opcionesEjemplo(), "tutor", HOY_EJEMPLO)

  it("no tiene ningún campo de franja, bandas, leyendas ni recomendación", () => {
    const { claves, textos } = recorrer(m)
    expect(claves.filter((k) => /franja|banda|recomendacion|leyenda/i.test(k))).toEqual([])
    expect(textos.filter((t) => /franja|recomendaci|a observar|intermedio|correcto/i.test(t))).toEqual([])
  })

  it("título y aclaración del tutor, sin observaciones ni 'vinculado desde'", () => {
    expect(m.titulo).toBe("Informe de evaluaciones y entrenamiento")
    expect(m.aclaracion).toBe(
      "Este informe no es un diagnóstico. Si tenés dudas sobre los resultados, consultá con el profesional que acompaña a Martina.",
    )
    expect(m.observaciones).toBeNull()
    expect(m.emisor).toBeNull()
    expect(m.nino.map((f) => f.etiqueta)).not.toContain("Vinculado desde")
  })

  it("igual muestra los datos: aciertos, tiempos y resúmenes en texto", () => {
    expect(m.evaluacion?.filas[0]).toEqual({ bloque: "Discriminación Auditiva", aciertos: 5, total: 5, porcentaje: "100 %", detalle: [] })
    expect(m.seguimiento?.evolucion?.niveles[0].graficos[0].resumen).toBe("Discriminación Auditiva: de 60 % a 100 % en 3 evaluaciones.")
    expect(m.seguimiento?.denominacion?.niveles[0].resumen).toBe("Tiempo de 2:31 a 2:05 en 3 evaluaciones.")
    expect(m.seguimiento?.denominacion?.niveles[0].tabla.columnas).toHaveLength(4)
  })

  it("resúmenes del tutor con una sola evaluación y sin tiempo", () => {
    const viejo: TestInforme = {
      ...INICIAL,
      bloques: [
        INICIAL.bloques[0],
        { bloque_codigo: "denominacion_rapida", orden: 5, correctas: 8, total: 10, tiempo_ms: null, errores: null },
      ],
    }
    const una = construirInforme(datosEjemplo({ tests: [viejo] }), opcionesEjemplo(), "tutor", HOY_EJEMPLO)
    expect(una.seguimiento?.evolucion?.niveles[0].graficos[0].resumen).toBe("Discriminación Auditiva: 83 % en 1 evaluación.")
    expect(una.seguimiento?.denominacion?.niveles[0].resumen).toBe("Sin tiempo registrado en estas evaluaciones.")
  })
})

describe("evaluación elegida por id", () => {
  it("toma la elegida aunque no sea la última", () => {
    expect(informe({ testId: TESTS_EJEMPLO[2].id }).evaluacion?.subtitulo).toBe("Evaluación del 28/08/2026 · Nivel Primario")
    expect(informe({ testId: ULTIMA.id }).evaluacion?.subtitulo).toContain("05/11/2026")
  })
})
