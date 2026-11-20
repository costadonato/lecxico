import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  MARGEN_CORTE_MS,
  decir,
  decirSecuencia,
  detener,
  duracionMaxima,
  elegirVoz,
  obtenerEstado,
  obtenerEstadoServidor,
} from "@/lib/entrenamiento/audio"

const voz = (lang: string, name = lang) => ({ lang, name })

describe("elegirVoz", () => {
  it("prefiere es-AR", () => {
    expect(elegirVoz([voz("es-ES"), voz("es-MX"), voz("es-AR"), voz("es-US")])?.lang).toBe("es-AR")
  })

  it("sigue el orden es-US, es-419, es-MX", () => {
    expect(elegirVoz([voz("es-MX"), voz("es-US")])?.lang).toBe("es-US")
    expect(elegirVoz([voz("es-MX"), voz("es-419")])?.lang).toBe("es-419")
    expect(elegirVoz([voz("es-ES"), voz("es-MX")])?.lang).toBe("es-MX")
  })

  it("acepta guion bajo y mayúsculas (Android)", () => {
    expect(elegirVoz([voz("es_ES"), voz("ES_ar")])?.lang).toBe("ES_ar")
  })

  it("si no hay ninguna preferida, usa cualquier español", () => {
    expect(elegirVoz([voz("en-US"), voz("es-ES")])?.lang).toBe("es-ES")
  })

  it("sin español devuelve null", () => {
    expect(elegirVoz([voz("en-US")])).toBeNull()
    expect(elegirVoz([])).toBeNull()
  })
})

describe("duracionMaxima", () => {
  it("da al menos 7 segundos y crece con el texto", () => {
    expect(duracionMaxima("vaca")).toBe(7000)
    expect(duracionMaxima("a".repeat(100), 1)).toBe(18000)
    expect(duracionMaxima("a".repeat(100), 0.5)).toBe(33000)
  })
})

describe("estado inicial", () => {
  it("sin audio sonando, en el cliente y en el servidor", () => {
    expect(obtenerEstado()).toEqual({ dueno: null, texto: null })
    expect(obtenerEstadoServidor()).toEqual({ dueno: null, texto: null })
  })

  it("en el servidor (sin window) no hace nada", () => {
    decir("vaca", { dueno: "a" })
    decirSecuencia(["vaca", "mono"], { dueno: "a" })
    expect(obtenerEstado().dueno).toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/*  Reproductor con una voz del navegador simulada                      */
/* ------------------------------------------------------------------ */
interface EnunciadoFalso {
  text: string
  rate: number
  onend: (() => void) | null
  onerror: (() => void) | null
}

describe("reproductor", () => {
  let dichos: EnunciadoFalso[]
  let cancelados: number
  let manifiesto: Record<string, string>
  let audios: { src: string; onended: (() => void) | null; onerror: (() => void) | null; falla: boolean }[]

  /** Termina, por su onend, el último enunciado que se dijo. */
  const terminarUltimo = () => dichos[dichos.length - 1].onend?.()

  beforeEach(() => {
    vi.useFakeTimers()
    dichos = []
    cancelados = 0
    manifiesto = {}
    audios = []
    const synth = {
      speaking: false,
      speak: (u: EnunciadoFalso) => dichos.push(u),
      cancel: () => {
        cancelados += 1
      },
      getVoices: () => [voz("es-AR")],
    }
    vi.stubGlobal("window", { speechSynthesis: synth })
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        text: string
        rate = 1
        pitch = 1
        lang = ""
        voice: unknown = null
        onend: (() => void) | null = null
        onerror: (() => void) | null = null
        constructor(text: string) {
          this.text = text
        }
      },
    )
    vi.stubGlobal(
      "Audio",
      class {
        src: string
        onended: (() => void) | null = null
        onerror: (() => void) | null = null
        falla = false
        constructor(src: string) {
          this.src = src
          audios.push(this)
        }
        play() {
          return this.src.includes("roto") ? Promise.reject(new Error("no")) : Promise.resolve()
        }
        pause() {}
      },
    )
    vi.stubGlobal("fetch", () => Promise.resolve({ ok: true, json: () => Promise.resolve(manifiesto) }))
  })

  afterEach(() => {
    detener()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("arranca enseguida, sin el segundo de silencio", async () => {
    decir("vaca", { dueno: "a" })
    await vi.advanceTimersByTimeAsync(0)
    expect(dichos.map((d) => d.text)).toEqual(["vaca"])
    expect(obtenerEstado()).toEqual({ dueno: "a", texto: "vaca" })
  })

  it("ignora los textos vacíos", async () => {
    decir("   ", { dueno: "a" })
    decirSecuencia([], { dueno: "a" })
    await vi.advanceTimersByTimeAsync(0)
    expect(dichos).toEqual([])
    expect(obtenerEstado().dueno).toBeNull()
  })

  it("alTerminar se llama cuando el audio termina solo (onend)", async () => {
    const alTerminar = vi.fn()
    decir("vaca", { dueno: "a", alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    terminarUltimo()
    terminarUltimo() // un segundo aviso no lo repite
    expect(alTerminar).toHaveBeenCalledTimes(1)
    expect(obtenerEstado().dueno).toBeNull()
  })

  it("alTerminar se llama por el seguro de duración si el navegador no avisa", async () => {
    const alTerminar = vi.fn()
    decir("vaca", { dueno: "a", alTerminar })
    await vi.advanceTimersByTimeAsync(duracionMaxima("vaca") + 10)
    expect(alTerminar).toHaveBeenCalledTimes(1)
    expect(obtenerEstado().dueno).toBeNull()
  })

  it("alTerminar no se llama si se cortó con detener()", async () => {
    const alTerminar = vi.fn()
    decir("vaca", { dueno: "a", alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    const viejo = dichos[0]
    detener()
    viejo.onend?.()
    viejo.onerror?.()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(alTerminar).not.toHaveBeenCalled()
    expect(obtenerEstado().dueno).toBeNull()
  })

  it("un decir() corta al anterior: el viejo no avisa y el nuevo espera solo el margen técnico", async () => {
    const primero = vi.fn()
    const segundo = vi.fn()
    decir("vaca", { dueno: "a", alTerminar: primero })
    await vi.advanceTimersByTimeAsync(0)
    const viejo = dichos[0]
    decir("mono", { dueno: "b", alTerminar: segundo })
    expect(cancelados).toBeGreaterThan(0)
    expect(obtenerEstado()).toEqual({ dueno: "b", texto: "mono" })
    viejo.onend?.()
    expect(primero).not.toHaveBeenCalled()
    // Cortó a otro: espera el margen (menos de 100 ms) y recién ahí habla.
    expect(dichos).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(MARGEN_CORTE_MS)
    expect(MARGEN_CORTE_MS).toBeLessThanOrEqual(100)
    expect(dichos.map((d) => d.text)).toEqual(["vaca", "mono"])
    terminarUltimo()
    expect(segundo).toHaveBeenCalledTimes(1)
  })

  it("la secuencia dice cada texto en orden, con la pausa entre uno y otro", async () => {
    const alTerminar = vi.fn()
    decirSecuencia(["bota", "mono", "ojo"], { dueno: "a", pausaMs: 700, alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    expect(dichos.map((d) => d.text)).toEqual(["bota"])
    expect(obtenerEstado()).toEqual({ dueno: "a", texto: "bota · mono · ojo" })

    terminarUltimo()
    await vi.advanceTimersByTimeAsync(699)
    expect(dichos).toHaveLength(1) // todavía en la pausa
    expect(obtenerEstado().dueno).toBe("a") // la pausa es parte del turno
    await vi.advanceTimersByTimeAsync(1)
    expect(dichos.map((d) => d.text)).toEqual(["bota", "mono"])

    terminarUltimo()
    await vi.advanceTimersByTimeAsync(700)
    expect(dichos.map((d) => d.text)).toEqual(["bota", "mono", "ojo"])
    expect(alTerminar).not.toHaveBeenCalled()

    terminarUltimo()
    expect(alTerminar).toHaveBeenCalledTimes(1)
    expect(obtenerEstado().dueno).toBeNull()
  })

  it("sin pausaMs, encadena los textos sin silencio", async () => {
    decirSecuencia(["bota", "mono"], { dueno: "a" })
    await vi.advanceTimersByTimeAsync(0)
    terminarUltimo()
    await vi.advanceTimersByTimeAsync(0)
    expect(dichos.map((d) => d.text)).toEqual(["bota", "mono"])
  })

  it("un decir() durante la pausa corta la secuencia entera", async () => {
    const alTerminar = vi.fn()
    decirSecuencia(["bota", "mono", "ojo"], { dueno: "a", pausaMs: 700, alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    terminarUltimo()
    decir("vaca", { dueno: "b" })
    await vi.advanceTimersByTimeAsync(5000)
    expect(dichos.map((d) => d.text)).toEqual(["bota", "vaca"])
    expect(alTerminar).not.toHaveBeenCalled()
  })

  it("detener() a mitad de la secuencia la corta y no avisa", async () => {
    const alTerminar = vi.fn()
    decirSecuencia(["bota", "mono"], { dueno: "a", pausaMs: 500, alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    detener()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(dichos.map((d) => d.text)).toEqual(["bota"])
    expect(alTerminar).not.toHaveBeenCalled()
    expect(obtenerEstado().dueno).toBeNull()
  })

  it("cada texto de la secuencia busca su archivo en el manifiesto", async () => {
    // El manifiesto se carga una sola vez por módulo: este caso usa el que ya está en memoria,
    // así que se prueba con un módulo nuevo.
    vi.resetModules()
    manifiesto = { mono: "/audio/mono.mp3", roto: "/audio/roto.mp3" }
    const audio = await import("@/lib/entrenamiento/audio")
    const alTerminar = vi.fn()
    audio.decirSecuencia(["bota", "mono", "roto"], { dueno: "a", alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    expect(dichos.map((d) => d.text)).toEqual(["bota"]) // sin archivo: voz del navegador
    terminarUltimo()
    await vi.advanceTimersByTimeAsync(0)
    expect(audios.map((a) => a.src)).toEqual(["/audio/mono.mp3"]) // con archivo: el archivo
    audios[0].onended?.()
    await vi.advanceTimersByTimeAsync(0)
    // El archivo roto no se puede reproducir: habla el navegador.
    expect(audios.map((a) => a.src)).toEqual(["/audio/mono.mp3", "/audio/roto.mp3"])
    expect(dichos.map((d) => d.text)).toEqual(["bota", "roto"])
    terminarUltimo()
    expect(alTerminar).toHaveBeenCalledTimes(1)
    audio.detener()
  })

  it("sin voz del navegador, termina enseguida", async () => {
    vi.stubGlobal("window", {})
    const alTerminar = vi.fn()
    decir("vaca", { dueno: "a", alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    expect(alTerminar).toHaveBeenCalledTimes(1)
  })
})

describe("suscripción, disponibilidad y manifiesto", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("avisa a los suscriptores y deja de avisar al desuscribirse", async () => {
    vi.useFakeTimers()
    vi.stubGlobal("window", { speechSynthesis: { speaking: false, speak: () => {}, cancel: () => {}, getVoices: () => [] } })
    vi.stubGlobal("SpeechSynthesisUtterance", class {})
    vi.stubGlobal("fetch", () => Promise.resolve({ ok: false }))
    const audio = await import("@/lib/entrenamiento/audio")
    const oyente = vi.fn()
    const desuscribir = audio.suscribir(oyente)
    audio.decir("vaca", { dueno: "a" })
    expect(oyente).toHaveBeenCalledTimes(1)
    desuscribir()
    audio.detener()
    expect(oyente).toHaveBeenCalledTimes(1)
    expect(audio.audioDisponible()).toBe(true)
  })

  it("sin window no hay audio disponible", async () => {
    const audio = await import("@/lib/entrenamiento/audio")
    expect(audio.audioDisponible()).toBe(false)
  })

  it("si el manifiesto no está, o la red falla, queda vacío", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve({ ok: false }))
    expect(await (await import("@/lib/entrenamiento/audio")).cargarManifiesto()).toEqual({})
    vi.resetModules()
    vi.stubGlobal("fetch", () => Promise.reject(new Error("sin red")))
    expect(await (await import("@/lib/entrenamiento/audio")).cargarManifiesto()).toEqual({})
    vi.resetModules()
    vi.stubGlobal("fetch", () => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }))
    const audio = await import("@/lib/entrenamiento/audio")
    expect(await audio.cargarManifiesto()).toEqual({})
    // Ya cargado, no lo vuelve a pedir.
    expect(await audio.cargarManifiesto()).toEqual({})
  })

  it("sin fetch, el manifiesto es vacío", async () => {
    vi.stubGlobal("fetch", undefined)
    expect(await (await import("@/lib/entrenamiento/audio")).cargarManifiesto()).toEqual({})
  })
})

describe("cortar un archivo de audio", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("detener() pausa el archivo y no avisa alTerminar", async () => {
    vi.useFakeTimers()
    const pausados: string[] = []
    let ultimo: { onended: (() => void) | null } | null = null
    vi.stubGlobal("window", { speechSynthesis: { speaking: false, speak: () => {}, cancel: () => {}, getVoices: () => [] } })
    vi.stubGlobal(
      "Audio",
      class {
        onended: (() => void) | null = null
        onerror: (() => void) | null = null
        constructor(readonly src: string) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          ultimo = this
        }
        play() {
          return Promise.resolve()
        }
        pause() {
          pausados.push(this.src)
        }
      },
    )
    vi.stubGlobal("fetch", () => Promise.resolve({ ok: true, json: () => Promise.resolve({ vaca: "/audio/vaca.mp3" }) }))
    const audio = await import("@/lib/entrenamiento/audio")
    const alTerminar = vi.fn()
    audio.decir("vaca", { dueno: "a", alTerminar })
    await vi.advanceTimersByTimeAsync(0)
    const cortado = ultimo as { onended: (() => void) | null } | null
    audio.detener()
    expect(pausados).toEqual(["/audio/vaca.mp3"])
    expect(cortado?.onended).toBeNull()
    expect(alTerminar).not.toHaveBeenCalled()
  })
})
