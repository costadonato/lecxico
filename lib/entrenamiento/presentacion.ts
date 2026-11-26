/*
 * TEXTOS Y ORDEN DEL ENTRENAMIENTO EN PANTALLA
 * ------------------------------------------------------------------
 * Lógica pura que usan las áreas y el marco de juego: los juegos agrupados
 * por bloque, el nombre de cada ronda en singular ("Palabra 3 de 8"), las
 * frases del personaje y el texto de cada origen.
 */

import { JUEGOS, type CodigoJuego, type FichaJuego, type Grado, type Nivel, type Origen } from "@/lib/entrenamiento/juegos"
import { BLOQUES_POR_NIVEL, type BloqueCodigo } from "@/lib/test/bloques"
import type { Franja, FranjasPorBloque } from "@/lib/test/franjas"

export interface GrupoBloque {
  bloque: BloqueCodigo
  juegos: FichaJuego[]
}

/**
 * Los juegos de un nivel agrupados por bloque, en el orden de la evaluación
 * (BLOQUES_POR_NIVEL) y con el principal primero dentro de cada bloque.
 * Los bloques sin juegos no aparecen.
 */
export function juegosPorBloque(nivel: Nivel, opciones: { incluirSoloConsulta: boolean }): GrupoBloque[] {
  const juegos = Object.values(JUEGOS).filter(
    (j) => j.niveles[nivel] && (opciones.incluirSoloConsulta || !j.soloConsulta),
  )
  return BLOQUES_POR_NIVEL[nivel]
    .map((bloque) => ({
      bloque,
      juegos: juegos
        .filter((j) => j.niveles[nivel]?.bloque === bloque)
        // sort es estable: entre dos del mismo rol queda el orden del catálogo.
        .sort((a, b) => Number(a.niveles[nivel]?.rol !== "principal") - Number(b.niveles[nivel]?.rol !== "principal")),
    }))
    .filter((g) => g.juegos.length > 0)
}

/** Un juego con el bloque al que pertenece en ese nivel. */
export interface JuegoDeBloque {
  juego: FichaJuego
  bloque: BloqueCodigo
}

export interface GrupoFranja {
  /** null = "sin franja de referencia". */
  franja: Franja | null
  juegos: JuegoDeBloque[]
}

/** Orden fijo de los grupos: primero lo que más necesita práctica. */
export const ORDEN_GRUPOS_FRANJA: readonly (Franja | null)[] = ["a_observar", "intermedio", "correcto", null]

/**
 * Los juegos de un nivel agrupados según la franja de su bloque en una
 * evaluación (S11b; S15 lo reutiliza para armar tareas). `franjas` es la
 * franja de cada bloque (de `franjasDeEvaluacion`); un bloque del nivel que
 * no figura (por ejemplo, una evaluación vieja sin denominación rápida) cae
 * en "sin franja". Los grupos van en ORDEN_GRUPOS_FRANJA y, dentro de cada
 * uno, en el orden de juegosPorBloque (bloques en el orden del test y el
 * principal primero). Los grupos vacíos no se devuelven.
 */
export function juegosPorFranja(
  nivel: Nivel,
  franjas: FranjasPorBloque,
  opciones: { incluirSoloConsulta: boolean },
): GrupoFranja[] {
  const juegos = juegosPorBloque(nivel, opciones).flatMap((g) => g.juegos.map((juego) => ({ juego, bloque: g.bloque })))
  return ORDEN_GRUPOS_FRANJA.map((franja) => ({
    franja,
    juegos: juegos.filter((j) => (franjas[j.bloque] ?? null) === franja),
  })).filter((g) => g.juegos.length > 0)
}

const SINGULAR: Record<string, string> = {
  palabras: "Palabra",
  secuencias: "Secuencia",
  cuadrículas: "Cuadrícula",
  estímulos: "Estímulo",
  historias: "Historia",
  preguntas: "Pregunta",
  oraciones: "Oración",
  conjuntos: "Conjunto",
}

/** "palabras" → "Palabra"; "lluvias de 30 segundos" → "Lluvia". Lo desconocido es "Ronda". */
export function unidadSingular(unidad: string): string {
  if (SINGULAR[unidad]) return SINGULAR[unidad]
  if (unidad.startsWith("lluvias")) return "Lluvia"
  return "Ronda"
}

/** "Palabra 3 de 8" (actual empieza en 0). */
export function textoProgreso(unidad: string, actual: number, total: number): string {
  return `${unidadSingular(unidad)} ${Math.min(actual + 1, total)} de ${total}`
}

/** Momento del juego que define la pose y la frase del personaje. */
export type Momento = "consigna" | "lectura" | "pensando" | "acierto" | "reintento" | "respuesta" | "final"

/** Momentos con frases fijas. La del final depende del resultado (fraseFinal). */
export type MomentoConFrases = Exclude<Momento, "final">

export const FRASES: Record<MomentoConFrases, readonly string[]> = {
  consigna: ["¡Hola! Te explico cómo se juega.", "¡Vamos a jugar juntos!", "Escuchá bien y tocá «Comenzar»."],
  lectura: ["Leé con calma.", "Tomate tu tiempo.", "Leé despacito. Después te pregunto.", "Sin apuro: leé hasta el final."],
  pensando: ["Tomate tu tiempo.", "¿Cuál será?", "Pensalo con calma.", "Escuchá con atención."],
  acierto: ["¡Muy bien!", "¡Eso es!", "¡Genial!", "¡Bien hecho!", "¡Excelente!"],
  reintento: ["Casi. Probá otra vez.", "¡Uy! Probá de nuevo.", "Mmm, casi. ¡Otra vez!"],
  respuesta: ["Era esta. ¡Seguimos!", "Mirá, era esta. ¡Vamos con otra!", "Era esta. ¡La próxima sale!"],
}

/** Frase del momento; `n` (por ejemplo, el número de ronda) hace que varíe sin azar. */
export function fraseDe(momento: MomentoConFrases, n: number): string {
  const lista = FRASES[momento]
  return lista[((n % lista.length) + lista.length) % lista.length]
}

export interface FinalPartida {
  frase: string
  pose: "festejando" | "alentando"
  animacion: "saltar" | "flotarSuave"
}

/**
 * Lo que dice y hace el personaje al terminar la partida, según el
 * porcentaje (porcentaje() de juegos.ts, entero de 0 a 100). El niño no ve
 * el número: solo se usa para elegir la frase.
 * - 80 o más: "¡Lo hiciste genial!", festejando y saltando.
 * - De 40 a 79: "¡Lo hiciste bien!", festejando y flotando.
 * - Menos de 40: "¡Podés hacerlo mejor!", alentando y flotando.
 */
export function fraseFinal(porcentaje: number): FinalPartida {
  if (porcentaje >= 80) return { frase: "¡Lo hiciste genial!", pose: "festejando", animacion: "saltar" }
  if (porcentaje >= 40) return { frase: "¡Lo hiciste bien!", pose: "festejando", animacion: "flotarSuave" }
  return { frase: "¡Podés hacerlo mejor!", pose: "alentando", animacion: "flotarSuave" }
}

export const ORIGEN_LABEL: Record<Origen, string> = {
  consulta: "En consulta",
  tarea: "Tarea",
  practica: "Práctica",
}

/** Texto corto del origen para el historial ("Consulta", "Tarea", "Práctica"). */
export const ORIGEN_CORTO: Record<Origen, string> = {
  consulta: "Consulta",
  tarea: "Tarea",
  practica: "Práctica",
}

/**
 * Tono de cada origen (variante del chip y color de las barras del
 * seguimiento, S16): consulta en celeste, tarea en lavanda y práctica en menta.
 */
export const TONO_ORIGEN: Record<Origen, "celeste" | "lavanda" | "menta"> = {
  consulta: "celeste",
  tarea: "lavanda",
  practica: "menta",
}

/**
 * Cartelito de un grado bloqueado, para el niño. Nunca menciona el 80 % ni
 * ningún porcentaje: el desbloqueo es un cálculo interno.
 */
export function textoGradoBloqueado(grado: Grado): string {
  return `¡Jugá bien el grado ${Math.max(1, grado - 1)} para desbloquear este!`
}

/** Lee el grado de la URL ("1", "2" o "3"); cualquier otra cosa es null. */
export function leerGrado(valor: string | null | undefined): Grado | null {
  return valor === "1" || valor === "2" || valor === "3" ? (Number(valor) as Grado) : null
}

/** true si el texto es un código de juego del catálogo. */
export function esCodigoJuego(valor: string): valor is CodigoJuego {
  return Object.prototype.hasOwnProperty.call(JUEGOS, valor)
}

/**
 * Juegos que ya se pueden jugar: los tres de S13a (Detective de sonidos,
 * Rima y Palmas), los cinco de S13b (Memotono, Rompe y une, Palabras de
 * otro planeta, Nombrá rápido y ¡Rápido, tocalo!) y los tres principales
 * de S14a (Leé y descubrí, Eco de palabras y Caza errores), que cubren las
 * 14 combinaciones bloque-nivel, y los complementarios de S14b
 * (Memopalabras, Ojo de lince y Lluvia). Con S14b están los 14 juegos: ya
 * no queda ninguno en "Próximamente". La lista y juegoDisponible se
 * conservan por si se suma un juego nuevo al catálogo antes que su
 * componente. El componente de cada uno está en
 * components/entrenamiento/juegos/.
 */
export const JUEGOS_DISPONIBLES: readonly CodigoJuego[] = [
  "detective",
  "rima",
  "palmas",
  "memotono",
  "rompe",
  "planeta",
  "nombra",
  "tocalo",
  "lee",
  "eco",
  "caza",
  "memopalabras",
  "ojo_lince",
  "lluvia",
]

export function juegoDisponible(codigo: CodigoJuego): boolean {
  return JUEGOS_DISPONIBLES.includes(codigo)
}

/**
 * Juegos que se juegan sin la columna del personaje, a todo el ancho:
 * Nombrá rápido (la cuadrícula no debe tener distracciones) y Lluvia (todo
 * el ancho para la zona de juego; Lumo aparece en la tarjeta de antes de
 * cada lluvia).
 */
export const JUEGOS_SIN_PERSONAJE: readonly CodigoJuego[] = ["nombra", "lluvia"]

export function juegoConPersonaje(codigo: CodigoJuego): boolean {
  return !JUEGOS_SIN_PERSONAJE.includes(codigo)
}

/**
 * true si en la partida un error tiene reintento (rondas.ts). No lo tienen
 * Nombrá rápido, ¡Rápido, tocalo!, Caza errores (se corrige al tocar
 * "Listo", como las cuadrículas) ni Palabras de otro planeta en consulta
 * (el profesional marca Bien o Mal).
 */
/**
 * Juegos sin reintento: Nombrá rápido, ¡Rápido, tocalo! y los de selección,
 * que se corrigen al tocar "Listo" o "Finalizar" (Caza errores,
 * Memopalabras, Ojo de lince y Lluvia).
 */
export const JUEGOS_SIN_REINTENTO: readonly CodigoJuego[] = ["nombra", "tocalo", "caza", "memopalabras", "ojo_lince", "lluvia"]

export function partidaConReintento(codigo: CodigoJuego, origen: Origen): boolean {
  if (JUEGOS_SIN_REINTENTO.includes(codigo)) return false
  return !(codigo === "planeta" && origen === "consulta")
}

/**
 * Si se puede abrir un juego desde una URL. Lo que no pasa, vuelve al área.
 * - Siempre: juego del catálogo, ya construido, del nivel del niño y con grado 1, 2 o 3.
 * - Niño: nunca los de solo consulta. En la práctica (sin tarea), solo
 *   hasta el grado habilitado; en una tarea, el grado lo fija el profesional
 *   (la página comprueba aparte que la tarea lo incluya).
 * - Profesional (consulta): cualquier grado.
 */
export function jugadaValida(p: {
  juego: string
  nivel: Nivel
  grado: Grado | null
  modo: "nino" | "profesional"
  enTarea?: boolean
  habilitado?: Grado
}): boolean {
  if (!esCodigoJuego(p.juego) || !juegoDisponible(p.juego) || p.grado === null) return false
  const ficha = JUEGOS[p.juego]
  if (!ficha.niveles[p.nivel]) return false
  if (p.modo === "profesional") return true
  if (ficha.soloConsulta) return false
  return p.enTarea === true || p.grado <= (p.habilitado ?? 1)
}

/** Ruta para jugar desde el área del niño; con `tareaId`, como parte de esa tarea. */
export function rutaJugar(juego: string, grado: Grado, tareaId?: string): string {
  const q = new URLSearchParams({ grado: String(grado) })
  if (tareaId) q.set("tarea", tareaId)
  return `/entrenamiento/jugar/${encodeURIComponent(juego)}?${q}`
}

/** Ruta del modo en consulta: el profesional juega con el niño en su sesión. */
export function rutaConsulta(ninoId: string, juego?: string, grado?: Grado): string {
  const base = `/ninos/${encodeURIComponent(ninoId)}/entrenamiento`
  return juego ? `${base}/${encodeURIComponent(juego)}?grado=${grado ?? 1}` : base
}

/** Nombre del juego para el historial (o el código, si ya no está en el catálogo). */
export function nombreJuego(codigo: string): string {
  return esCodigoJuego(codigo) ? JUEGOS[codigo].nombre : codigo
}
