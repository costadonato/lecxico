/*
 * LEÉ Y DESCUBRÍ: PARTIDA APLANADA EN PREGUNTAS (S14a)
 * ------------------------------------------------------------------
 * Cada historia del banco trae { id, titulo, parrafos, preguntas }, y cada
 * pregunta { pregunta, correcta, otras[2] }. La partida son 2 historias,
 * pero la ronda es la PREGUNTA: armarPartida aplana las historias en una
 * lista de preguntas, así useRondas y el reintento funcionan sin cambios.
 * La primera pregunta de cada historia (esPrimera) va después de la
 * pantalla de lectura.
 *
 * El detalle de la partida suma, por historia, el tiempo de lectura
 * (desde que se muestra la historia hasta "Ya la leí"): va en la primera
 * pregunta de cada historia, con el id de la historia. No cuenta para el
 * puntaje.
 */

import type { DetalleRonda, ResultadoRondas } from "@/lib/entrenamiento/rondas"

export interface PreguntaLee {
  pregunta: string
  correcta: string
  otras: string[]
}

export interface HistoriaLee {
  id: string
  titulo: string
  parrafos: string[]
  preguntas: PreguntaLee[]
}

/** Un ítem de la partida: una pregunta con su historia. */
export interface ItemLee {
  /** "LEE-2-03-p2": la historia y el número de pregunta. */
  id: string
  historia: HistoriaLee
  pregunta: PreguntaLee
  /** La primera pregunta de su historia: antes va la lectura. */
  esPrimera: boolean
  /** Posición de la historia en la partida (desde 1) y cantidad de historias. */
  numeroHistoria: number
  totalHistorias: number
}

export function aplanarLee(historias: readonly HistoriaLee[]): ItemLee[] {
  return historias.flatMap((historia, h) =>
    historia.preguntas.map((pregunta, i) => ({
      id: `${historia.id}-p${i + 1}`,
      historia,
      pregunta,
      esPrimera: i === 0,
      numeroHistoria: h + 1,
      totalHistorias: historias.length,
    })),
  )
}

export interface DetalleLee extends DetalleRonda {
  historia: string
  /** Solo en la primera pregunta de cada historia. */
  lecturaMs?: number
}

/** Agrega a cada pregunta su historia y, en la primera, el tiempo de lectura. */
export function resultadoLee(
  rondas: ResultadoRondas,
  items: readonly ItemLee[],
  lecturas: Readonly<Record<string, number>>,
): ResultadoRondas<DetalleLee> {
  const detalle = rondas.detalle.map((d, i) => {
    const item = items[i]
    const lectura = item.esPrimera ? lecturas[item.historia.id] : undefined
    return lectura === undefined
      ? { ...d, historia: item.historia.id }
      : { ...d, historia: item.historia.id, lecturaMs: Math.round(lectura) }
  })
  return { ...rondas, detalle }
}
