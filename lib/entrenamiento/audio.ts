/*
 * REPRODUCTOR ÚNICO DE AUDIO
 * ------------------------------------------------------------------
 * Reglas de la validación con las especialistas (19/11):
 *   - Nada suena solo: este módulo solo reproduce cuando se lo pide un
 *     botón (decir, decirSecuencia). Ninguna pantalla lo llama al cargar.
 *     La única excepción es ¡Rápido, tocalo!, que encadena los estímulos
 *     después de que el niño toca "¡Listo, empezá!": es la mecánica del juego.
 *   - Un audio a la vez: decir() o decirSecuencia() cortan lo que estaba
 *     sonando, y detener() corta todo (lo llaman el desmontaje y el cambio
 *     de ruta).
 *
 * Sin espera: el audio arranca apenas se toca el botón (o apenas carga el
 * manifiesto, la primera vez). La regla del segundo de silencio antes de
 * cada audio se dejó sin efecto el 20/11: se sentía lento y no dejaba jugar
 * a ¡Rápido, tocalo! ni a Memotono.
 *
 * Margen técnico (MARGEN_CORTE_MS): Chrome a veces se come el comienzo de
 * una frase cuando speak() va justo después de cancel(). Por eso, SOLO
 * cuando el audio nuevo corta a uno que estaba sonando, se espera un margen
 * mínimo (80 ms, por debajo del máximo de 100 ms acordado). Si no se cortó
 * nada, no hay ninguna espera.
 *
 * Por ahora habla la voz del navegador (speechSynthesis), en español:
 * es-AR, es-US, es-419, es-MX y, si no, cualquier es. Si
 * public/audio/manifest.json tiene un archivo para el texto (texto →
 * ruta), se reproduce el archivo. Hoy el manifiesto está vacío: más adelante
 * se generan los audios con voces de Azure. En una secuencia, cada texto
 * busca su propio archivo.
 *
 * Es un módulo con estado compartido (no React). Los componentes lo usan
 * con useAudio (lib/entrenamiento/use-audio.ts).
 */

export const MARGEN_CORTE_MS = 80
export const PREFERENCIA_VOCES = ["es-AR", "es-US", "es-419", "es-MX"] as const
export const RUTA_MANIFIESTO = "/audio/manifest.json"

export interface EstadoAudio {
  /** Quién pidió el audio que suena (o la secuencia en curso); null si no suena nada. */
  dueno: string | null
  /** El texto que suena (en una secuencia, todos los textos unidos por " · "). */
  texto: string | null
}

export interface OpcionesDecir {
  /** Velocidad (1 = normal). */
  velocidad?: number
  /** Tono de la voz del navegador (1 = normal). */
  tono?: number
  /** Identifica al componente que lo pidió (para animar solo su botón). */
  dueno?: string
  /**
   * Se llama cuando el audio termina solo (fin del audio o seguro de
   * duración). No se llama si se cortó con detener() o con otro decir().
   */
  alTerminar?: () => void
}

export interface OpcionesSecuencia extends OpcionesDecir {
  /** Silencio entre un texto y el siguiente. */
  pausaMs?: number
}

type VozMinima = Pick<SpeechSynthesisVoice, "lang" | "name">

/** Normaliza "es_AR" o "ES-ar" a "es-ar" para comparar. */
const normalizar = (lang: string) => lang.replace(/_/g, "-").toLowerCase()

/** La voz en español preferida, o null si no hay ninguna. */
export function elegirVoz<V extends VozMinima>(voces: readonly V[]): V | null {
  for (const preferida of PREFERENCIA_VOCES) {
    const voz = voces.find((v) => normalizar(v.lang) === preferida.toLowerCase())
    if (voz) return voz
  }
  return voces.find((v) => normalizar(v.lang).startsWith("es")) ?? null
}

/** Duración máxima esperable de un texto, por si el navegador no avisa que terminó. */
export function duracionMaxima(texto: string, velocidad = 1): number {
  return Math.max(4000, (texto.length * 150) / Math.max(0.3, velocidad)) + 3000
}

/* ------------------------------------------------------------------ */
/*  Estado compartido                                                   */
/* ------------------------------------------------------------------ */
const QUIETO: EstadoAudio = { dueno: null, texto: null }
let estado: EstadoAudio = QUIETO
const oyentes = new Set<() => void>()
/** Cada decir() o detener() abre un turno nuevo; lo que llega de un turno viejo se ignora. */
let turno = 0
/** Margen después de un corte o pausa entre los textos de una secuencia. */
let espera: ReturnType<typeof setTimeout> | undefined
let seguro: ReturnType<typeof setTimeout> | undefined
let elemento: HTMLAudioElement | null = null
let manifiesto: Record<string, string> | null = null
let cargandoManifiesto: Promise<Record<string, string>> | null = null

function cambiar(nuevo: EstadoAudio) {
  estado = nuevo
  oyentes.forEach((o) => o())
}

export function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

export function obtenerEstado(): EstadoAudio {
  return estado
}

export function obtenerEstadoServidor(): EstadoAudio {
  return QUIETO
}

export function audioDisponible(): boolean {
  return typeof window !== "undefined" && ("speechSynthesis" in window || typeof Audio !== "undefined")
}

/** Carga el manifiesto una sola vez; si no está o falla, queda vacío. */
export function cargarManifiesto(): Promise<Record<string, string>> {
  if (manifiesto) return Promise.resolve(manifiesto)
  if (typeof fetch === "undefined") return Promise.resolve({})
  cargandoManifiesto ??= fetch(RUTA_MANIFIESTO, { cache: "force-cache" })
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((m: unknown) => {
      manifiesto = m && typeof m === "object" ? (m as Record<string, string>) : {}
      return manifiesto
    })
  return cargandoManifiesto
}

function cortarTodo() {
  clearTimeout(espera)
  clearTimeout(seguro)
  if (typeof window !== "undefined") window.speechSynthesis?.cancel()
  if (elemento) {
    elemento.onended = null
    elemento.onerror = null
    elemento.pause()
    elemento = null
  }
}

/** Corta lo que esté sonando (o la secuencia en curso). */
export function detener(): void {
  turno += 1
  cortarTodo()
  if (estado.dueno !== null) cambiar(QUIETO)
}

/** Reproduce `texto` enseguida, cortando lo anterior. */
export function decir(texto: string, opciones: OpcionesDecir = {}): void {
  decirSecuencia([texto], opciones)
}

/**
 * Dice cada texto por separado, en orden y con `pausaMs` entre uno y otro.
 * Toda la secuencia es un solo turno: el estado queda con este dueño de
 * principio a fin, y un decir(), un detener() o un cambio de ruta la cortan
 * entera. `alTerminar` se llama una vez, cuando termina el último texto.
 */
export function decirSecuencia(textos: readonly string[], opciones: OpcionesSecuencia = {}): void {
  const lista = textos.filter((t) => t.trim())
  if (typeof window === "undefined" || lista.length === 0) return
  // Hubo un corte si algo sonaba (o esperaba su pausa) al momento del toque.
  const corta = estado.dueno !== null || Boolean(window.speechSynthesis?.speaking)
  turno += 1
  const mio = turno
  cortarTodo()
  cambiar({ dueno: opciones.dueno ?? "", texto: lista.join(" · ") })

  const vigente = () => turno === mio

  const terminarTodo = () => {
    if (!vigente()) return
    clearTimeout(seguro)
    elemento = null
    cambiar(QUIETO)
    opciones.alTerminar?.()
  }

  const decirDesde = (i: number, m: Record<string, string>) => {
    if (!vigente()) return
    const alFin = () => {
      if (!vigente()) return
      clearTimeout(seguro)
      elemento = null
      if (i >= lista.length - 1) return terminarTodo()
      espera = setTimeout(() => decirDesde(i + 1, m), Math.max(0, opciones.pausaMs ?? 0))
    }
    reproducir(lista[i], m[lista[i]], opciones, vigente, alFin)
  }

  const arrancar = (m: Record<string, string>) => decirDesde(0, m)

  // Sin margen y con el manifiesto ya cargado, arranca en el mismo toque
  // (algunos navegadores solo dejan sonar dentro del gesto del usuario).
  if (manifiesto && !corta) return arrancar(manifiesto)
  const margen = new Promise<void>((resolver) => {
    if (!corta) return resolver()
    espera = setTimeout(resolver, MARGEN_CORTE_MS)
  })
  void Promise.all([cargarManifiesto(), margen]).then(([m]) => vigente() && arrancar(m))
}

/** Reproduce un texto (archivo del manifiesto o voz del navegador) y llama a `alFin` cuando termina solo. */
function reproducir(
  texto: string,
  archivo: string | undefined,
  opciones: OpcionesDecir,
  vigente: () => boolean,
  alFin: () => void,
) {
  // Una sola llamada por texto, venga del fin del audio, de un error o del seguro.
  let listo = false
  const fin = () => {
    if (listo || !vigente()) return
    listo = true
    alFin()
  }
  seguro = setTimeout(fin, duracionMaxima(texto, opciones.velocidad))
  if (archivo && typeof Audio !== "undefined") {
    const audio = new Audio(archivo)
    elemento = audio
    audio.onended = fin
    // Si el archivo no se puede reproducir, habla el navegador.
    const respaldo = () => {
      if (!vigente() || elemento !== audio) return
      audio.onended = null
      audio.onerror = null
      elemento = null
      hablar(texto, opciones, fin)
    }
    audio.onerror = respaldo
    audio.play().catch(respaldo)
    return
  }
  hablar(texto, opciones, fin)
}

function hablar(texto: string, { velocidad = 0.9, tono = 1 }: OpcionesDecir, fin: () => void) {
  const synth = window.speechSynthesis
  if (!synth) return fin()
  const enunciado = new SpeechSynthesisUtterance(texto)
  const voz = elegirVoz(synth.getVoices())
  if (voz) enunciado.voice = voz
  enunciado.lang = voz?.lang ?? "es-AR"
  enunciado.rate = velocidad
  enunciado.pitch = tono
  enunciado.onend = fin
  enunciado.onerror = fin
  synth.speak(enunciado)
}

// Algunos navegadores cargan las voces tarde: pedirlas temprano las deja listas.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices()
}
