/*
 * ¡RÁPIDO, TOCALO!: GENERADOR DE LA PARTIDA Y RESULTADO (S13b)
 * ------------------------------------------------------------------
 * Lumo nombra un estímulo de una cuadrícula chica y el niño lo toca lo más
 * rápido que puede. La partida es de 12 estímulos en inicial y 20 en
 * primario; cada 4 estímulos se arma una cuadrícula nueva.
 *
 *   Grado | Inicial                           | Primario                         | Tiempo por estímulo
 *   1     | Colores, 2 × 2                    | Letras, 2 × 3                    | Sin límite
 *   2     | Colores y vocales, 2 × 3          | Letras y números, 3 × 3          | Inicial 4 s · primario 3 s
 *   3     | Colores, vocales y dibujos, 3 × 3 | Letras, números y colores, 3 × 4 | Inicial 3 s · primario 2 s
 *
 * Celdas: todas distintas y repartidas parejo entre las categorías del
 * grado. Objetivo: al azar entre las celdas de la cuadrícula actual, sin
 * repetir el anterior. Las letras de primario son A E S D P M L T (8,
 * porque el grado 1 necesita 6 distintas); los demás estímulos son los de
 * Nombrá rápido (lib/entrenamiento/denominacion-entrenamiento.ts).
 *
 * Resultado: correctas = toques correctos dentro del tiempo; tiempoMs = el
 * promedio del tiempo de respuesta de los toques correctos con tiempo
 * válido (desde que terminó el audio); errores = total − correctas.
 *
 * Un toque correcto antes de que termine el audio cuenta como acierto, pero
 * no tiene tiempo válido (ms: null) y no entra en el promedio. Si ningún
 * toque correcto tiene tiempo válido, tiempoMs y errores van en null (la
 * 0008 los exige juntos).
 */

import { mezclar } from "@/lib/entrenamiento/bancos"
import {
  CATEGORIAS_POR_GRADO,
  COLORES_DENOMINACION,
  DIBUJOS_DENOMINACION,
  NUMEROS_DENOMINACION,
  VOCALES_DENOMINACION,
} from "@/lib/entrenamiento/denominacion-entrenamiento"
import { JUEGOS, type Grado, type Nivel } from "@/lib/entrenamiento/juegos"
import type { DetalleRonda, ResultadoRondas } from "@/lib/entrenamiento/rondas"
import type { CategoriaEstimulo, Estimulo } from "@/lib/test/denominacion-config"

const letra = (valor: string, nombre: string): Estimulo => ({ categoria: "letra", valor, nombre })

/** Letras de primario y lo que dice Lumo de cada una. */
export const LETRAS_TOCALO: readonly Estimulo[] = [
  letra("A", "a"),
  letra("E", "e"),
  letra("S", "ese"),
  letra("D", "de"),
  letra("P", "pe"),
  letra("M", "eme"),
  letra("L", "ele"),
  letra("T", "te"),
]

export interface ReglaTocalo {
  filas: number
  columnas: number
  /** Tiempo para tocar cada estímulo; null = sin límite (Lumo espera el toque). */
  limiteMs: number | null
}

export const REGLAS_TOCALO: Record<Nivel, Record<Grado, ReglaTocalo>> = {
  inicial: {
    1: { filas: 2, columnas: 2, limiteMs: null },
    2: { filas: 2, columnas: 3, limiteMs: 4000 },
    3: { filas: 3, columnas: 3, limiteMs: 3000 },
  },
  primario: {
    1: { filas: 2, columnas: 3, limiteMs: null },
    2: { filas: 3, columnas: 3, limiteMs: 3000 },
    3: { filas: 3, columnas: 4, limiteMs: 2000 },
  },
}

/** Estímulos que se nombran con la misma cuadrícula. */
export const ESTIMULOS_POR_CUADRICULA = 4

export function estimulosTocalo(nivel: Nivel): Partial<Record<CategoriaEstimulo, readonly Estimulo[]>> {
  return nivel === "inicial"
    ? { color: COLORES_DENOMINACION, letra: VOCALES_DENOMINACION, dibujo: DIBUJOS_DENOMINACION }
    : { letra: LETRAS_TOCALO, numero: NUMEROS_DENOMINACION, color: COLORES_DENOMINACION }
}

export interface ItemTocalo {
  /** "TOC-03-rojo": número de estímulo y objetivo. */
  id: string
  objetivo: Estimulo
  /** Las celdas de la cuadrícula actual, de izquierda a derecha y fila por fila. */
  celdas: Estimulo[]
  /** Número de cuadrícula (desde 0): cambia cada 4 estímulos. */
  cuadricula: number
  filas: number
  columnas: number
  limiteMs: number | null
}

/** Las celdas de una cuadrícula nueva: distintas y repartidas parejo entre las categorías. */
export function celdasTocalo(nivel: Nivel, grado: Grado, azar: () => number = Math.random): Estimulo[] {
  const { filas, columnas } = REGLAS_TOCALO[nivel][grado]
  const categorias = CATEGORIAS_POR_GRADO[nivel][grado]
  const estimulos = estimulosTocalo(nivel)
  const n = filas * columnas
  const base = Math.floor(n / categorias.length)
  // Las categorías que llevan una celda más salen al azar.
  const conUnaMas = new Set(mezclar(categorias, azar).slice(0, n % categorias.length))
  const celdas = categorias.flatMap((c) => mezclar(estimulos[c]!, azar).slice(0, base + (conUnaMas.has(c) ? 1 : 0)))
  return mezclar(celdas, azar)
}

/** Los estímulos de una partida, con la cuadrícula de cada uno. */
export function generarTocalo(nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemTocalo[] {
  const regla = REGLAS_TOCALO[nivel][grado]
  const total = JUEGOS.tocalo.niveles[nivel]!.partida[grado]
  const items: ItemTocalo[] = []
  let celdas: Estimulo[] = []
  let anterior: string | null = null

  for (let i = 0; i < total; i++) {
    if (i % ESTIMULOS_POR_CUADRICULA === 0) celdas = celdasTocalo(nivel, grado, azar)
    const opciones = celdas.filter((c) => c.valor !== anterior)
    const objetivo = opciones[Math.floor(azar() * opciones.length)]
    anterior = objetivo.valor
    items.push({
      id: `TOC-${String(i + 1).padStart(2, "0")}-${objetivo.valor}`,
      objetivo,
      celdas,
      cuadricula: Math.floor(i / ESTIMULOS_POR_CUADRICULA),
      filas: regla.filas,
      columnas: regla.columnas,
      limiteMs: regla.limiteMs,
    })
  }
  return items
}

/**
 * Detalle de un estímulo: el de las rondas más el tiempo del toque. null si
 * se acabó el tiempo o si tocó antes de que terminara el audio.
 */
export interface DetalleToque extends DetalleRonda {
  ms: number | null
}

/**
 * Resultado de la partida a partir de las rondas y del tiempo de cada
 * toque (en el orden de las rondas). El promedio usa solo los toques
 * correctos con tiempo válido.
 */
export function resultadoTocalo(rondas: ResultadoRondas, ms: readonly (number | null)[]): ResultadoRondas<DetalleToque> {
  const detalle = rondas.detalle.map((d, i) => ({ ...d, ms: ms[i] ?? null }))
  const tiempos = detalle.filter((d) => d.correcta && d.ms !== null).map((d) => d.ms as number)
  if (tiempos.length === 0) {
    return { correctas: rondas.correctas, total: rondas.total, detalle, tiempoMs: null, errores: null }
  }
  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length
  return {
    correctas: rondas.correctas,
    total: rondas.total,
    detalle,
    // tiempo_ms > 0 en la base: un toque justo al terminar el audio cuenta como 1 ms.
    tiempoMs: Math.max(1, Math.round(promedio)),
    errores: rondas.total - rondas.correctas,
  }
}
