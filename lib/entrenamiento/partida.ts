/*
 * ARMADO DE UNA PARTIDA (S13b)
 * ------------------------------------------------------------------
 * El marco de juego arma la partida al tocar "Comenzar" con armarPartida:
 *   - Los juegos con banco por grado (Detective, Rima, Palmas, Rompe y une,
 *     Palabras de otro planeta…) mezclan el banco y toman los ítems de la
 *     partida (elegirPartida).
 *   - Memotono, Nombrá rápido y ¡Rápido, tocalo! no tienen banco por
 *     grado: generan su contenido.
 * Una lista vacía significa "Este grado todavía no tiene contenido". Cada
 * ítem lleva un id estable y legible, que va al detalle de la partida.
 */

import { elegirPartida, itemsDe } from "@/lib/entrenamiento/bancos"
import { generarNombra } from "@/lib/entrenamiento/denominacion-entrenamiento"
import { JUEGOS, type CodigoJuego, type Grado, type Nivel } from "@/lib/entrenamiento/juegos"
import { generarMemotono } from "@/lib/entrenamiento/memotono"
import { generarTocalo } from "@/lib/entrenamiento/tocalo"

export interface ItemPartida {
  id: string
}

/** Juegos que generan su contenido en lugar de tomarlo de un banco por grado. */
export const JUEGOS_GENERADOS: readonly CodigoJuego[] = ["memotono", "nombra", "tocalo"]

export function armarPartida(juego: CodigoJuego, nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemPartida[] {
  const ficha = JUEGOS[juego].niveles[nivel]
  if (!ficha) return []
  if (juego === "memotono") return generarMemotono(nivel, grado, azar)
  if (juego === "nombra") return generarNombra(nivel, grado, azar)
  if (juego === "tocalo") return generarTocalo(nivel, grado, azar)
  return elegirPartida(itemsDe(juego, nivel, grado), ficha.partida[grado], azar)
}
