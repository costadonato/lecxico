import type { SupabaseClient } from "@supabase/supabase-js"
import { describe, expect, it, vi } from "vitest"
import {
  ACTIVIDADES_EN_PANEL,
  cargarActividadReciente,
  contarRecientes,
  diasDesde,
  fechaRelativa,
  filasActividad,
  mezclarActividad,
  nombreCorto,
  textoActividad,
  textoInsignia,
  type Actividad,
  type FilaEvaluacion,
  type FilaPartida,
} from "@/lib/inicio/actividad"

/* Fechas en hora local: las pruebas no dependen del huso horario. */
const local = (d: number, h = 12, min = 0) => new Date(2026, 10, d, h, min).toISOString()
const AHORA = new Date(2026, 10, 22, 15, 0)

const evaluacion = (id: string, fecha: string, nino = "n1", nivel: FilaEvaluacion["nivel"] = "primario"): FilaEvaluacion => ({
  id,
  nino_id: nino,
  nivel,
  fecha,
})

const partida = (id: string, fecha: string, extra: Partial<FilaPartida> = {}): FilaPartida => ({
  id,
  nino_id: "n1",
  juego: "memotono",
  grado: 2,
  origen: "practica",
  created_at: fecha,
  ...extra,
})

describe("mezclarActividad", () => {
  it("mezcla las dos fuentes de la más nueva a la más vieja", () => {
    const r = mezclarActividad(
      [evaluacion("e1", local(20)), evaluacion("e2", local(22, 9))],
      [partida("p1", local(21)), partida("p2", local(22, 10))],
    )
    expect(r.map((a) => a.id)).toEqual(["p2", "e2", "p1", "e1"])
    expect(r[0]).toMatchObject({ tipo: "partida", ninoId: "n1", juego: "memotono", grado: 2, origen: "practica" })
    expect(r[1]).toMatchObject({ tipo: "evaluacion", nivel: "primario" })
  })

  it("se queda con las 10 más recientes", () => {
    const evaluaciones = Array.from({ length: 10 }, (_, i) => evaluacion(`e${i}`, local(1 + i)))
    const partidas = Array.from({ length: 10 }, (_, i) => partida(`p${i}`, local(11 + i)))
    const r = mezclarActividad(evaluaciones, partidas)
    expect(r).toHaveLength(ACTIVIDADES_EN_PANEL)
    expect(r[0].id).toBe("p9")
    expect(r.at(-1)?.id).toBe("p0")
  })

  it("con la misma fecha conserva el orden de llegada (evaluación primero)", () => {
    const r = mezclarActividad([evaluacion("e1", local(22))], [partida("p1", local(22))])
    expect(r.map((a) => a.id)).toEqual(["e1", "p1"])
  })

  it("respeta un límite distinto y listas vacías", () => {
    expect(mezclarActividad([], [])).toEqual([])
    expect(mezclarActividad([evaluacion("e1", local(1)), evaluacion("e2", local(2))], [], 1).map((a) => a.id)).toEqual(["e2"])
  })

  it("acota el grado de la partida entre 1 y 3", () => {
    const r = mezclarActividad([], [partida("a", local(3), { grado: 0 }), partida("b", local(2), { grado: 7 }), partida("c", local(1), { grado: 2 })])
    expect(r.map((a) => (a.tipo === "partida" ? a.grado : null))).toEqual([1, 3, 2])
  })
})

describe("textos de cada fila", () => {
  it("nombre e inicial del apellido", () => {
    expect(nombreCorto("Juan", "Pérez")).toBe("Juan P.")
    expect(nombreCorto(" Ana ", "de la Fuente")).toBe("Ana D.")
    expect(nombreCorto("Sol", "")).toBe("Sol")
  })

  it("evaluación de cada nivel", () => {
    const base = { tipo: "evaluacion", id: "e", ninoId: "n", fecha: local(1) } as const
    expect(textoActividad({ ...base, nivel: "primario" })).toBe("Evaluación de primaria")
    expect(textoActividad({ ...base, nivel: "inicial" })).toBe("Evaluación de inicial")
  })

  it("partida con los tres orígenes", () => {
    const base = { tipo: "partida", id: "p", ninoId: "n", fecha: local(1), juego: "memotono", grado: 2 } as const
    expect(textoActividad({ ...base, origen: "practica" })).toBe("Memotono · grado 2 · Práctica")
    expect(textoActividad({ ...base, origen: "consulta" })).toBe("Memotono · grado 2 · Consulta")
    expect(textoActividad({ ...base, origen: "tarea", juego: "rima", grado: 1 })).toBe("Rima · grado 1 · Tarea")
  })

  it("un juego que ya no está en el catálogo muestra su código", () => {
    const a: Actividad = { tipo: "partida", id: "p", ninoId: "n", fecha: local(1), juego: "viejo", grado: 3, origen: "practica" }
    expect(textoActividad(a)).toBe("viejo · grado 3 · Práctica")
  })
})

describe("fechaRelativa", () => {
  it("hoy, ayer y hace N días por días de calendario", () => {
    expect(fechaRelativa(local(22, 0, 5), AHORA)).toBe("hoy")
    expect(fechaRelativa(local(21, 23, 59), AHORA)).toBe("ayer")
    expect(fechaRelativa(local(19), AHORA)).toBe("hace 3 días")
    expect(fechaRelativa(local(16), AHORA)).toBe("hace 6 días")
  })

  it("desde los 7 días, la fecha corta", () => {
    expect(fechaRelativa(local(15), AHORA)).toBe("15/11/2026")
    expect(fechaRelativa(new Date(2026, 0, 3, 12).toISOString(), AHORA)).toBe("03/01/2026")
  })

  it("una fecha futura cuenta como hoy", () => {
    expect(diasDesde(local(24), AHORA)).toBe(0)
    expect(fechaRelativa(local(24), AHORA)).toBe("hoy")
  })

  it("usa el reloj real si no se inyecta", () => {
    expect(fechaRelativa(new Date().toISOString())).toBe("hoy")
  })
})

describe("contador de 7 días e insignia", () => {
  it("cuenta las de los últimos 7 días, hoy incluido", () => {
    const fechas = [local(22), local(20), local(16), local(15), local(1)].map((fecha) => ({ fecha }))
    expect(contarRecientes(fechas, AHORA)).toBe(3)
    expect(contarRecientes(fechas, AHORA, 1)).toBe(1)
    expect(contarRecientes([])).toBe(0)
  })

  it("se esconde sin actividad y muestra 9+ si pasa de 9", () => {
    expect(textoInsignia(0)).toBeNull()
    expect(textoInsignia(1)).toBe("1")
    expect(textoInsignia(9)).toBe("9")
    expect(textoInsignia(10)).toBe("9+")
  })
})

describe("filasActividad", () => {
  const ninos = [
    { nino_id: "n1", nombre: "Juan", apellido: "Pérez" },
    { nino_id: "n/2", nombre: "Ana", apellido: "Gómez" },
  ]

  it("arma cada fila con nombre, texto, fecha y enlace al detalle", () => {
    const acts = mezclarActividad([evaluacion("e1", local(21), "n/2")], [partida("p1", local(22))])
    expect(filasActividad(acts, ninos, AHORA)).toEqual([
      { clave: "partida-p1", tipo: "partida", nino: "Juan P.", texto: "Memotono · grado 2 · Práctica", fecha: "hoy", href: "/ninos/n1" },
      { clave: "evaluacion-e1", tipo: "evaluacion", nino: "Ana G.", texto: "Evaluación de primaria", fecha: "ayer", href: "/ninos/n%2F2" },
    ])
  })

  it("no muestra actividad de un niño que no está en la lista", () => {
    const acts = mezclarActividad([evaluacion("e1", local(21), "otro")], [])
    expect(filasActividad(acts, ninos, AHORA)).toEqual([])
    expect(filasActividad(acts, ninos)).toEqual([])
  })
})

describe("cargarActividadReciente", () => {
  type Respuesta = { data: unknown[] | null; error: { message: string } | null }

  function cliente(respuestas: Record<string, Respuesta>) {
    const llamadas: { tabla: string; in: unknown[]; order: unknown[]; limit: number }[] = []
    const supabase = {
      from: (tabla: string) => {
        const registro = { tabla, in: [] as unknown[], order: [] as unknown[], limit: 0 }
        llamadas.push(registro)
        const cadena = {
          select: () => cadena,
          in: (...args: unknown[]) => {
            registro.in = args
            return cadena
          },
          order: (...args: unknown[]) => {
            registro.order = args
            return cadena
          },
          limit: (n: number) => {
            registro.limit = n
            return Promise.resolve(respuestas[tabla])
          },
        }
        return cadena
      },
    }
    return { supabase: supabase as unknown as SupabaseClient, llamadas }
  }

  const ninos = [{ nino_id: "n1", nombre: "Juan", apellido: "Pérez" }]

  it("sin niños no consulta nada", async () => {
    const from = vi.fn()
    expect(await cargarActividadReciente({ from } as unknown as SupabaseClient, [])).toEqual([])
    expect(from).not.toHaveBeenCalled()
  })

  it("hace dos consultas limitadas a 10 y las mezcla", async () => {
    const { supabase, llamadas } = cliente({
      test: { data: [evaluacion("e1", local(20))], error: null },
      entrenamiento_partida: { data: [partida("p1", local(21))], error: null },
    })
    const r = await cargarActividadReciente(supabase, ninos)
    expect(r.map((a) => a.id)).toEqual(["p1", "e1"])
    expect(llamadas).toEqual([
      { tabla: "test", in: ["nino_id", ["n1"]], order: ["fecha", { ascending: false }], limit: 10 },
      { tabla: "entrenamiento_partida", in: ["nino_id", ["n1"]], order: ["created_at", { ascending: false }], limit: 10 },
    ])
  })

  it("tolera data null", async () => {
    const { supabase } = cliente({
      test: { data: null, error: null },
      entrenamiento_partida: { data: null, error: null },
    })
    expect(await cargarActividadReciente(supabase, ninos)).toEqual([])
  })

  it("si falla cualquiera de las dos consultas, lanza un mensaje corto", async () => {
    const falla = { data: null, error: { message: "permission denied" } }
    const ok = { data: [], error: null }
    await expect(
      cargarActividadReciente(cliente({ test: falla, entrenamiento_partida: ok }).supabase, ninos),
    ).rejects.toThrow("No se pudo cargar la actividad reciente.")
    await expect(
      cargarActividadReciente(cliente({ test: ok, entrenamiento_partida: falla }).supabase, ninos),
    ).rejects.toThrow("No se pudo cargar la actividad reciente.")
  })
})
