import type { SupabaseClient } from "@supabase/supabase-js"
import { describe, expect, it, vi } from "vitest"

import {
  ErrorEntrenamiento,
  cambiarLetraEntrenamiento,
  gradoDe,
  gradosHabilitados,
  guardarPartida,
  mensajeErrorEntrenamiento,
  tareaIncluye,
  tareasPendientes,
  ultimasPartidas,
  type TareaPendiente,
} from "@/lib/entrenamiento/partidas"

type Respuesta = { data: unknown; error: unknown }

/** Cliente falso: rpc devuelve `rpc`; las consultas encadenadas terminan en `consulta`. */
function cliente({ rpc, consulta }: { rpc?: Respuesta; consulta?: Respuesta } = {}) {
  const llamadas = { rpc: vi.fn(), eq: vi.fn() }
  const cadena = {
    select: () => cadena,
    eq: (...a: unknown[]) => {
      llamadas.eq(...a)
      return cadena
    },
    order: () => Promise.resolve(consulta ?? { data: [], error: null }),
  }
  const supabase = {
    rpc: (...a: unknown[]) => {
      llamadas.rpc(...a)
      return Promise.resolve(rpc ?? { data: null, error: null })
    },
    from: () => cadena,
  } as unknown as SupabaseClient
  return { supabase, llamadas }
}

describe("mensajeErrorEntrenamiento", () => {
  const GEN = "genérico"

  it("traduce los mensajes conocidos de la 0008", () => {
    expect(mensajeErrorEntrenamiento({ message: "Ese grado todavía no está desbloqueado." }, GEN)).toBe(
      "Ese grado todavía no está desbloqueado.",
    )
    expect(mensajeErrorEntrenamiento(new Error("La tarea no existe o ya está hecha."), GEN)).toBe(
      "Esa tarea ya no está pendiente.",
    )
    expect(mensajeErrorEntrenamiento({ message: "Hace falta iniciar sesión." }, GEN)).toMatch(/sesión/)
  })

  it("los errores de red piden revisar la conexión", () => {
    expect(mensajeErrorEntrenamiento(new TypeError("Failed to fetch"), GEN)).toMatch(/conexión/)
  })

  it("lo demás (sin vínculo, niño inexistente) no se detalla", () => {
    expect(mensajeErrorEntrenamiento({ message: "Solo un profesional con vínculo activo puede…" }, GEN)).toBe(GEN)
    expect(mensajeErrorEntrenamiento({ message: "El niño no existe." }, GEN)).toBe(GEN)
    expect(mensajeErrorEntrenamiento(null, GEN)).toBe(GEN)
    expect(mensajeErrorEntrenamiento("texto", GEN)).toBe(GEN)
  })
})

describe("guardarPartida", () => {
  const partida = {
    ninoId: "n1",
    juego: "detective" as const,
    grado: 1 as const,
    correctas: 7,
    total: 8,
    detalle: [{ item: "DET-I1-01", correcta: true, intentos: 1 as const }],
  }

  it("envía los parámetros de guardar_partida y devuelve el grado habilitado", async () => {
    const { supabase, llamadas } = cliente({
      rpc: { data: { partida: "p1", porcentaje: 88, grado_habilitado: 2 }, error: null },
    })
    const r = await guardarPartida(supabase, { ...partida, origen: "practica" })
    expect(r).toEqual({ partida: "p1", porcentaje: 88, gradoHabilitado: 2 })
    expect(llamadas.rpc).toHaveBeenCalledWith("guardar_partida", {
      p_nino: "n1",
      p_juego: "detective",
      p_grado: 1,
      p_origen: "practica",
      p_correctas: 7,
      p_total: 8,
      p_tiempo_ms: null,
      p_errores: null,
      p_detalle: partida.detalle,
      p_tarea: null,
    })
  })

  it("solo envía la tarea con origen tarea", async () => {
    const { supabase, llamadas } = cliente({ rpc: { data: { partida: "p", porcentaje: 50, grado_habilitado: 1 }, error: null } })
    await guardarPartida(supabase, { ...partida, origen: "consulta", tareaId: "t1" })
    expect(llamadas.rpc.mock.calls[0][1]).toMatchObject({ p_tarea: null })
    await guardarPartida(supabase, { ...partida, origen: "tarea", tareaId: "t1", tiempoMs: 10, errores: 1 })
    expect(llamadas.rpc.mock.calls[1][1]).toMatchObject({ p_tarea: "t1", p_tiempo_ms: 10, p_errores: 1 })
    await guardarPartida(supabase, { ...partida, origen: "tarea" })
    expect(llamadas.rpc.mock.calls[2][1]).toMatchObject({ p_tarea: null })
  })

  it("un grado habilitado raro se toma como 1", async () => {
    const { supabase } = cliente({ rpc: { data: { partida: "p", porcentaje: 50, grado_habilitado: null }, error: null } })
    expect((await guardarPartida(supabase, { ...partida, origen: "practica" })).gradoHabilitado).toBe(1)
  })

  it("si falla, lanza ErrorEntrenamiento con un mensaje para mostrar", async () => {
    const { supabase } = cliente({ rpc: { data: null, error: { message: "Ese grado todavía no está desbloqueado." } } })
    await expect(guardarPartida(supabase, { ...partida, origen: "practica" })).rejects.toThrow(ErrorEntrenamiento)
    await expect(guardarPartida(supabase, { ...partida, origen: "practica" })).rejects.toThrow("todavía no está desbloqueado")
  })

  it("sin datos ni error también falla", async () => {
    const { supabase } = cliente()
    await expect(guardarPartida(supabase, { ...partida, origen: "practica" })).rejects.toThrow("No se pudo guardar")
  })
})

describe("gradosHabilitados", () => {
  it("arma el mapa por juego e ignora códigos desconocidos", async () => {
    const { supabase } = cliente({
      rpc: {
        data: [
          { juego: "detective", grado: 2 },
          { juego: "rima", grado: 3 },
          { juego: "viejo", grado: 2 },
        ],
        error: null,
      },
    })
    const grados = await gradosHabilitados(supabase, "n1")
    expect(grados).toEqual({ detective: 2, rima: 3 })
    expect(gradoDe(grados, "detective")).toBe(2)
    expect(gradoDe(grados, "palmas")).toBe(1)
  })

  it("sin filas devuelve un mapa vacío", async () => {
    const { supabase } = cliente({ rpc: { data: null, error: null } })
    expect(await gradosHabilitados(supabase, "n1")).toEqual({})
  })

  it("si falla, lanza", async () => {
    const { supabase } = cliente({ rpc: { data: null, error: { message: "No tenés acceso" } } })
    await expect(gradosHabilitados(supabase, "n1")).rejects.toThrow("No se pudo cargar el entrenamiento")
  })
})

describe("cambiarLetraEntrenamiento", () => {
  it("llama a la función con el niño y la letra", async () => {
    const { supabase, llamadas } = cliente()
    await cambiarLetraEntrenamiento(supabase, "n1", "minuscula")
    expect(llamadas.rpc).toHaveBeenCalledWith("cambiar_letra_entrenamiento", { p_nino: "n1", p_letra: "minuscula" })
  })

  it("si falla, lanza", async () => {
    const { supabase } = cliente({ rpc: { data: null, error: { message: "x" } } })
    await expect(cambiarLetraEntrenamiento(supabase, "n1", "mayuscula")).rejects.toThrow("tipo de letra")
  })
})

describe("tareasPendientes", () => {
  it("devuelve las tareas con sus juegos ordenados", async () => {
    const { supabase, llamadas } = cliente({
      consulta: {
        data: [
          {
            id: "t1",
            nombre: "Para el martes",
            es_mision: false,
            created_at: "2026-11-20T10:00:00Z",
            entrenamiento_tarea_item: [
              { orden: 2, juego: "rima", grado: 2 },
              { orden: 1, juego: "detective", grado: 1 },
              { orden: 3, juego: "borrado", grado: 1 },
            ],
          },
          { id: "t2", nombre: null, es_mision: true, created_at: "2026-11-21T10:00:00Z", entrenamiento_tarea_item: null },
        ],
        error: null,
      },
    })
    const tareas = await tareasPendientes(supabase, "n1")
    expect(llamadas.eq).toHaveBeenCalledWith("estado", "pendiente")
    expect(tareas).toEqual([
      {
        id: "t1",
        nombre: "Para el martes",
        esMision: false,
        creadaEl: "2026-11-20T10:00:00Z",
        items: [
          { orden: 1, juego: "detective", grado: 1 },
          { orden: 2, juego: "rima", grado: 2 },
        ],
      },
      { id: "t2", nombre: null, esMision: true, creadaEl: "2026-11-21T10:00:00Z", items: [] },
    ])
  })

  it("sin datos devuelve una lista vacía", async () => {
    const { supabase } = cliente({ consulta: { data: null, error: null } })
    expect(await tareasPendientes(supabase, "n1")).toEqual([])
  })

  it("si falla, lanza", async () => {
    const { supabase } = cliente({ consulta: { data: null, error: { message: "x" } } })
    await expect(tareasPendientes(supabase, "n1")).rejects.toThrow("tareas")
  })
})

describe("ultimasPartidas", () => {
  /** Cliente cuya consulta termina en order() con `respuesta`. */
  function clienteUltimas(respuesta: Respuesta) {
    const in_ = vi.fn()
    const cadena = {
      select: () => cadena,
      in: (...a: unknown[]) => {
        in_(...a)
        return cadena
      },
      order: () => Promise.resolve(respuesta),
    }
    return { supabase: { from: () => cadena } as unknown as SupabaseClient, in_ }
  }

  it("se queda con la más reciente de cada niño", async () => {
    const { supabase, in_ } = clienteUltimas({
      data: [
        { nino_id: "a", juego: "rima", grado: 2, created_at: "2026-11-20T12:00:00Z" },
        { nino_id: "b", juego: "palmas", grado: 1, created_at: "2026-11-19T12:00:00Z" },
        { nino_id: "a", juego: "detective", grado: 1, created_at: "2026-11-18T12:00:00Z" },
      ],
      error: null,
    })
    const ultimas = await ultimasPartidas(supabase, ["a", "b", "c"])
    expect(in_).toHaveBeenCalledWith("nino_id", ["a", "b", "c"])
    expect(ultimas.get("a")).toEqual({ ninoId: "a", juego: "rima", grado: 2, fecha: "2026-11-20T12:00:00Z" })
    expect(ultimas.get("b")?.juego).toBe("palmas")
    expect(ultimas.has("c")).toBe(false)
  })

  it("sin niños no consulta", async () => {
    const { supabase, in_ } = clienteUltimas({ data: [], error: null })
    expect((await ultimasPartidas(supabase, [])).size).toBe(0)
    expect(in_).not.toHaveBeenCalled()
  })

  it("sin datos devuelve un mapa vacío", async () => {
    const { supabase } = clienteUltimas({ data: null, error: null })
    expect((await ultimasPartidas(supabase, ["a"])).size).toBe(0)
  })

  it("si falla, lanza", async () => {
    const { supabase } = clienteUltimas({ data: null, error: { message: "x" } })
    await expect(ultimasPartidas(supabase, ["a"])).rejects.toThrow("último entrenamiento")
  })
})

describe("tareaIncluye", () => {
  const tarea: TareaPendiente = {
    id: "t",
    nombre: null,
    esMision: false,
    creadaEl: "",
    items: [{ orden: 1, juego: "rima", grado: 2 }],
  }

  it("busca el juego y el grado", () => {
    expect(tareaIncluye(tarea, "rima", 2)).toBe(true)
    expect(tareaIncluye(tarea, "rima", 1)).toBe(false)
    expect(tareaIncluye(tarea, "detective", 2)).toBe(false)
  })
})
