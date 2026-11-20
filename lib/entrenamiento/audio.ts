/*
 * REPRODUCTOR ÚNICO DE AUDIO
 * ------------------------------------------------------------------
 * Reglas de la validación con las especialistas (19/11):
 *   - Nada suena solo: este módulo solo reproduce cuando se lo pide un
 *     botón (decir). Ninguna pantalla lo llama al cargar.
 *   - Un segundo de silencio antes de cada audio (sin él, a veces se oía
 *     la palabra cortada).
 *   - Un audio a la vez: decir() corta lo que estaba sonando, y detener()
 *     corta todo (lo llaman el desmontaje y el cambio de ruta).
 *
 * Por ahora habla la voz del navegador (speechSynthesis), en español:
 * es-AR, es-US, es-419, es-MX y, si no, cualquier es. Si
 * public/audio/manifest.json tiene un archivo para el texto (texto →
 * ruta), se reproduce el archivo. Hoy el manifiesto está vacío: más adelante
 * se generan los audios con voces de Azure.
 *
 * Es un módulo con estado compartido (no React). Los componentes lo usan
 * con useAudio (lib/entrenamiento/use-audio.ts).
 */

export const SILENCIO_MS = 1000
export const PREFERENCIA_VOCES = ["es-AR", "es-US", "es-419", "es-MX"] as const
export const RUTA_MANIFIESTO = "/audio/manifest.json"

export interface EstadoAudio {
  /** Quién pidió el audio que suena (o espera su segundo de silencio); null si no suena nada. */
  dueno: string | null
  texto: string | null
}

export interface OpcionesDecir {
  /** Velocidad (1 = normal). */
  velocidad?: number
  /** Tono de la voz del navegador (1 = normal). */
  tono?: number
  /** Identifica al componente que lo pidió (para animar solo su botón). */
  dueno?: string
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

/** Corta lo que esté sonando (o esperando para sonar). */
export function detener(): void {
  turno += 1
  cortarTodo()
  if (estado.dueno !== null) cambiar(QUIETO)
}

/** Reproduce `texto` después de un segundo de silencio, cortando lo anterior. */
export function decir(texto: string, opciones: OpcionesDecir = {}): void {
  if (typeof window === "undefined" || !texto.trim()) return
  turno += 1
  const mio = turno
  cortarTodo()
  // El botón se anima desde el toque, también durante el segundo de silencio.
  cambiar({ dueno: opciones.dueno ?? "", texto })

  const terminar = () => {
    if (turno !== mio) return
    clearTimeout(seguro)
    elemento = null
    cambiar(QUIETO)
  }
  const silencio = new Promise<void>((resolver) => {
    espera = setTimeout(resolver, SILENCIO_MS)
  })

  void Promise.all([cargarManifiesto(), silencio]).then(([m]) => {
    if (turno !== mio) return
    seguro = setTimeout(terminar, duracionMaxima(texto, opciones.velocidad))
    const archivo = m[texto]
    if (archivo && typeof Audio !== "undefined") {
      elemento = new Audio(archivo)
      elemento.onended = terminar
      // Si el archivo no se puede reproducir, habla el navegador.
      elemento.onerror = () => turno === mio && hablar(texto, opciones, terminar)
      elemento.play().catch(() => turno === mio && hablar(texto, opciones, terminar))
      return
    }
    hablar(texto, opciones, terminar)
  })
}

function hablar(texto: string, { velocidad = 0.9, tono = 1 }: OpcionesDecir, terminar: () => void) {
  const synth = window.speechSynthesis
  if (!synth) return terminar()
  const enunciado = new SpeechSynthesisUtterance(texto)
  const voz = elegirVoz(synth.getVoices())
  if (voz) enunciado.voice = voz
  enunciado.lang = voz?.lang ?? "es-AR"
  enunciado.rate = velocidad
  enunciado.pitch = tono
  enunciado.onend = terminar
  enunciado.onerror = terminar
  synth.speak(enunciado)
}

// Algunos navegadores cargan las voces tarde: pedirlas temprano las deja listas.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices()
}
