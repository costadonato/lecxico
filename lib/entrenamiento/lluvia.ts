/*
 * LLUVIA: PLAN DE CADA LLUVIA, RELOJ Y PUNTAJE (S14b)
 * ------------------------------------------------------------------
 * Durante 30 segundos caen elementos por carriles y el niño toca solo los
 * iguales a la muestra. Toda la lógica que no es dibujar va acá, pura y con
 * pruebas: qué cae, cuándo y por qué carril (planLluvia), qué se ve en cada
 * momento (gotasVisibles), un reloj que se puede pausar (crearReloj, con el
 * "ahora" inyectable) y el puntaje (resultadoLluvia).
 *
 * Banco: bancos.lluvia[nivel][grado], 9 ítems por grado, con
 * { id, categoria, objetivo, distractores }. En inicial la categoría es
 * colores, objetos (emojis) o vocales y el objetivo es un texto; en
 * primario, palabras, y el objetivo es una lista (dos palabras en el grado 3).
 *
 * Partida: 3 lluvias. En inicial, una de cada categoría en orden al azar;
 * en primario, 3 ítems al azar.
 *
 * Reglas del plan:
 *   - Cae un elemento cada `intervaloMs` (los últimos salen al menos 1 s
 *     antes del final, así se llegan a ver).
 *   - Cerca del 35 % son objetivos, con al menos 6 por lluvia.
 *   - Sin superponerse: dos elementos del mismo carril salen separados al
 *     menos `altoGota` de la caída (todos caen a la misma velocidad, así
 *     que nunca se alcanzan). Si no hay carril libre, el elemento espera.
 *   - `fila` es la casilla fija que usa el modo sin movimiento: en cada
 *     carril, la primera libre mientras el elemento está a la vista.
 */

import datos from "@/lib/entrenamiento/bancos.json"
import { elegirPartida, mezclar } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import type { ResultadoRondas } from "@/lib/entrenamiento/rondas"
import { COLORES_ESTIMULO } from "@/lib/test/denominacion-config"

export type CategoriaLluvia = "colores" | "objetos" | "vocales" | "palabras"

export interface ItemLluviaBanco {
  id: string
  categoria: CategoriaLluvia
  objetivo: string | string[]
  distractores: string[]
}

/** Una lluvia de la partida. */
export interface ItemLluvia {
  /** Id del ítem del banco ("LLU-I2-04"). */
  id: string
  categoria: CategoriaLluvia
  /** Uno o dos objetivos. */
  objetivos: string[]
  distractores: string[]
}

/** Parámetros para ajustar probando. La caída es el tiempo en recorrer la zona de juego. */
export const PARAMETROS_LLUVIA = {
  duracionMs: 30_000,
  /** Los últimos elementos salen al menos este tiempo antes del final. */
  margenFinalMs: 1_000,
  proporcionObjetivo: 0.35,
  minObjetivos: 6,
  carriles: { inicial: 4, primario: 5 } as Record<Nivel, number>,
  /** Alto de un elemento como fracción del recorrido: separación mínima en un carril. */
  altoGota: 0.26,
  /** Ancho mínimo de un carril en pantalla (px): si no entran todos, se usan menos. */
  anchoMinCarril: { inicial: 64, primario: 104 } as Record<Nivel, number>,
  ritmo: {
    inicial: {
      1: { caidaMs: 7_000, intervaloMs: 1_300 },
      2: { caidaMs: 6_500, intervaloMs: 1_000 },
      3: { caidaMs: 5_000, intervaloMs: 1_000 },
    },
    primario: {
      1: { caidaMs: 7_000, intervaloMs: 900 },
      2: { caidaMs: 6_500, intervaloMs: 850 },
      3: { caidaMs: 6_000, intervaloMs: 800 },
    },
  } as Record<Nivel, Record<Grado, { caidaMs: number; intervaloMs: number }>>,
}

/** Colores de Lluvia: los de la evaluación más los distractores del grado 3 de inicial. */
export const COLORES_LLUVIA: Record<string, string> = {
  ...COLORES_ESTIMULO,
  naranja: "#f97316",
  rosa: "#ec4899",
  celeste: "#38bdf8",
  violeta: "#8b5cf6",
  dorado: "#d4a017",
}

/** Nombre de cada emoji de Lluvia, para el lector de pantalla. */
export const NOMBRES_EMOJI: Record<string, string> = {
  "🍌": "banana",
  "🚆": "tren",
  "🐙": "pulpo",
  "⭐": "estrella",
  "🧀": "queso",
  "🦁": "león",
  "🎈": "globo",
  "🔑": "llave",
  "🐢": "tortuga",
  "🍇": "uvas",
  "🍓": "frutilla",
  "🍋": "limón",
  "🥝": "kiwi",
  "🐒": "mono",
  "🐻": "oso",
  "🐼": "panda",
  "🐯": "tigre",
  "🚌": "colectivo",
  "🚚": "camión",
  "🚕": "taxi",
  "🏍️": "moto",
  "🥚": "huevo",
  "🍊": "naranja",
  "🥔": "papa",
  "🌸": "flor rosada",
  "🌺": "flor roja",
  "🌼": "margarita",
  "🌷": "tulipán",
  "🌟": "estrella brillante",
  "✨": "brillitos",
  "❄️": "copo de nieve",
}

/** Nombre accesible de un elemento según su categoría. */
export function nombreElemento(categoria: CategoriaLluvia, valor: string): string {
  if (categoria === "objetos") return NOMBRES_EMOJI[valor] ?? "dibujo"
  if (categoria === "vocales") return `letra ${valor.toLowerCase()}`
  return valor
}

type BancoLluvia = Record<Nivel, Record<string, ItemLluviaBanco[]>>
const BANCO = datos.bancos.lluvia as unknown as BancoLluvia

export function bancoLluvia(nivel: Nivel, grado: Grado): ItemLluviaBanco[] {
  return BANCO[nivel]?.[String(grado)] ?? []
}

const aItem = (b: ItemLluviaBanco): ItemLluvia => ({
  id: b.id,
  categoria: b.categoria,
  objetivos: Array.isArray(b.objetivo) ? [...b.objetivo] : [b.objetivo],
  distractores: [...b.distractores],
})

export const LLUVIAS_POR_PARTIDA = 3

/** Las 3 lluvias de una partida. */
export function generarLluvias(nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemLluvia[] {
  const banco = bancoLluvia(nivel, grado)
  if (nivel === "primario") return elegirPartida(banco, LLUVIAS_POR_PARTIDA, azar).map(aItem)
  const categorias = mezclar(["colores", "objetos", "vocales"] as const, azar)
  return categorias.flatMap((c) => {
    const opciones = banco.filter((i) => i.categoria === c)
    return opciones.length ? [aItem(opciones[Math.floor(azar() * opciones.length)])] : []
  })
}

/* ------------------------------------------------------------------ */
/*  Plan de una lluvia                                                  */
/* ------------------------------------------------------------------ */
export interface Gota {
  /** Orden de salida (desde 0): también es su índice para el puntaje. */
  id: number
  valor: string
  esObjetivo: boolean
  carril: number
  inicioMs: number
  caidaMs: number
  /** Casilla del modo sin movimiento, dentro del carril. */
  fila: number
}

export interface PlanLluvia {
  gotas: Gota[]
  carriles: number
  /** Casillas por carril que usa el modo sin movimiento. */
  filas: number
  duracionMs: number
}

/** Cuántos carriles entran en `ancho` px (entre 1 y los del nivel). */
export function carrilesQueEntran(nivel: Nivel, ancho: number): number {
  const max = PARAMETROS_LLUVIA.carriles[nivel]
  return Math.max(1, Math.min(max, Math.floor(ancho / PARAMETROS_LLUVIA.anchoMinCarril[nivel])))
}

export function planLluvia(
  item: ItemLluvia,
  nivel: Nivel,
  grado: Grado,
  { carriles = PARAMETROS_LLUVIA.carriles[nivel], azar = Math.random }: { carriles?: number; azar?: () => number } = {},
): PlanLluvia {
  const P = PARAMETROS_LLUVIA
  const { caidaMs, intervaloMs } = P.ritmo[nivel][grado]
  const n = Math.ceil((P.duracionMs - P.margenFinalMs) / intervaloMs)
  const nObjetivos = Math.min(n, Math.max(P.minObjetivos, Math.round(n * P.proporcionObjetivo)))
  const sonObjetivo = new Set(mezclar(Array.from({ length: n }, (_, i) => i), azar).slice(0, nObjetivos))
  // Con dos objetivos, se reparten parejo.
  const valoresObjetivo = mezclar(
    Array.from({ length: nObjetivos }, (_, i) => item.objetivos[i % item.objetivos.length]),
    azar,
  )

  const separacion = caidaMs * P.altoGota
  const ultimoEnCarril: number[] = Array.from({ length: carriles }, () => -Infinity)
  /** Por carril, hasta cuándo está ocupada cada fila del modo sin movimiento. */
  const filasOcupadas: number[][] = Array.from({ length: carriles }, () => [])
  const gotas: Gota[] = []
  let carrilAnterior = -1
  let distractorAnterior = ""
  let objetivosUsados = 0

  for (let i = 0; i < n; i++) {
    let inicio = i * intervaloMs
    let libres = [...ultimoEnCarril.keys()].filter((c) => inicio - ultimoEnCarril[c] >= separacion)
    if (libres.length === 0) {
      // Espera al primer carril que se libere.
      inicio = Math.min(...ultimoEnCarril) + separacion
      libres = [...ultimoEnCarril.keys()].filter((c) => inicio - ultimoEnCarril[c] >= separacion)
    }
    const preferidos = libres.length > 1 ? libres.filter((c) => c !== carrilAnterior) : libres
    const carril = preferidos[Math.floor(azar() * preferidos.length)]
    ultimoEnCarril[carril] = inicio
    carrilAnterior = carril

    const filas = filasOcupadas[carril]
    let fila = filas.findIndex((hasta) => hasta <= inicio)
    if (fila === -1) fila = filas.length
    filas[fila] = inicio + caidaMs

    const esObjetivo = sonObjetivo.has(i)
    let valor: string
    if (esObjetivo) {
      valor = valoresObjetivo[objetivosUsados++]
    } else {
      const opciones = item.distractores.length > 1 ? item.distractores.filter((d) => d !== distractorAnterior) : item.distractores
      valor = opciones[Math.floor(azar() * opciones.length)]
      distractorAnterior = valor
    }
    gotas.push({ id: i, valor, esObjetivo, carril, inicioMs: inicio, caidaMs, fila })
  }

  return {
    gotas,
    carriles,
    filas: Math.max(1, ...filasOcupadas.map((f) => f.length)),
    duracionMs: P.duracionMs,
  }
}

/** Las gotas a la vista en el instante `t`, con su avance (0 arriba, 1 abajo). */
export function gotasVisibles(plan: PlanLluvia, t: number): { gota: Gota; progreso: number }[] {
  if (t >= plan.duracionMs) return []
  return plan.gotas
    .filter((g) => g.inicioMs <= t && t < g.inicioMs + g.caidaMs)
    .map((gota) => ({ gota, progreso: (t - gota.inicioMs) / gota.caidaMs }))
}

/** Índices (ids) de las gotas objetivo que salieron antes del final. */
export function objetivosAparecidos(plan: PlanLluvia): number[] {
  return plan.gotas.filter((g) => g.esObjetivo && g.inicioMs < plan.duracionMs).map((g) => g.id)
}

/* ------------------------------------------------------------------ */
/*  Reloj pausable                                                      */
/* ------------------------------------------------------------------ */
export interface Reloj {
  /** Tiempo corrido, sin contar las pausas. */
  transcurrido(): number
  pausar(): void
  reanudar(): void
  readonly pausado: boolean
}

/** Un reloj que arranca en 0 y no cuenta el tiempo en pausa. `ahora` se inyecta en las pruebas. */
export function crearReloj(ahora: () => number = () => performance.now()): Reloj {
  let inicio = ahora()
  let pausadoEn: number | null = null
  return {
    transcurrido: () => (pausadoEn ?? ahora()) - inicio,
    pausar() {
      if (pausadoEn === null) pausadoEn = ahora()
    },
    reanudar() {
      if (pausadoEn === null) return
      inicio += ahora() - pausadoEn
      pausadoEn = null
    },
    get pausado() {
      return pausadoEn !== null
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Puntaje                                                             */
/* ------------------------------------------------------------------ */
export interface ConteoLluvia {
  /** Objetivos que cayeron. */
  aparecieron: number
  /** Objetivos tocados. */
  tocados: number
  /** Distractores tocados. */
  equivocados: number
}

/**
 * Resultado de la partida: correctas = objetivos tocados y total =
 * objetivos que aparecieron + distractores tocados, sumados en las 3
 * lluvias (como puntajeSeleccion). El detalle suma el conteo de cada una.
 */
export function resultadoLluvia(
  rondas: ResultadoRondas,
  conteos: readonly ConteoLluvia[],
): ResultadoRondas<ResultadoRondas["detalle"][number] & ConteoLluvia> {
  const vacio: ConteoLluvia = { aparecieron: 0, tocados: 0, equivocados: 0 }
  const detalle = rondas.detalle.map((d, i) => ({ ...d, ...(conteos[i] ?? vacio) }))
  return {
    correctas: conteos.reduce((a, c) => a + c.tocados, 0),
    total: conteos.reduce((a, c) => a + c.aparecieron + c.equivocados, 0),
    detalle,
  }
}
