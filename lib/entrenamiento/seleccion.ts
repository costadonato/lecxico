/*
 * PUNTAJE DE LOS JUEGOS DE SELECCIÓN (S14a)
 * ------------------------------------------------------------------
 * Juegos en los que se marcan varios elementos y se corrige al tocar
 * "Listo": Caza errores (S14a) y Memopalabras, Ojo de lince y Lluvia (S14b).
 *
 * Los objetivos y los marcados se identifican por índice, no por texto:
 * una oración puede repetir una palabra.
 *
 *   encontrados = objetivos marcados
 *   equivocados = marcados que no eran objetivos
 *   omitidos    = objetivos sin marcar
 *   correctas   = encontrados
 *   total       = objetivos + equivocados
 *
 * Así, marcar todo no da 100 %: cada marca equivocada suma al total.
 */

import type { DetalleRonda, ResultadoRondas } from "@/lib/entrenamiento/rondas"

export interface PuntajeSeleccion {
  encontrados: number
  equivocados: number
  omitidos: number
  correctas: number
  total: number
}

export function puntajeSeleccion({
  objetivos,
  marcados,
}: {
  objetivos: Iterable<number>
  marcados: Iterable<number>
}): PuntajeSeleccion {
  const obj = new Set(objetivos)
  const mar = new Set(marcados)
  const encontrados = [...mar].filter((i) => obj.has(i)).length
  const equivocados = mar.size - encontrados
  const omitidos = obj.size - encontrados
  return { encontrados, equivocados, omitidos, correctas: encontrados, total: obj.size + equivocados }
}

/** true si encontró todos los objetivos sin ninguna marca equivocada. */
export function seleccionPerfecta(p: PuntajeSeleccion): boolean {
  return p.omitidos === 0 && p.equivocados === 0
}

/** Detalle de una ronda de selección: el de las rondas más lo que marcó y su puntaje. */
export interface DetalleSeleccion extends DetalleRonda {
  marcados: number[]
  encontrados: number
  equivocados: number
  omitidos: number
}

/**
 * Resultado de una partida de selección: correctas y total son la suma de
 * los puntajes de cada ronda (no la cuenta de rondas perfectas). `rondas`
 * trae una entrada por ronda resuelta, en orden; `seleccion`, lo marcado
 * y el puntaje de cada una.
 */
export function resultadoSeleccion(
  rondas: ResultadoRondas,
  seleccion: readonly { marcados: readonly number[]; puntaje: PuntajeSeleccion }[],
): ResultadoRondas<DetalleSeleccion> {
  const detalle = rondas.detalle.map((d, i) => {
    const s = seleccion[i] ?? { marcados: [], puntaje: puntajeSeleccion({ objetivos: [], marcados: [] }) }
    return {
      ...d,
      marcados: [...s.marcados].sort((a, b) => a - b),
      encontrados: s.puntaje.encontrados,
      equivocados: s.puntaje.equivocados,
      omitidos: s.puntaje.omitidos,
    }
  })
  const sumar = (campo: "correctas" | "total") => seleccion.reduce((acc, s) => acc + s.puntaje[campo], 0)
  return { correctas: sumar("correctas"), total: sumar("total"), detalle }
}
