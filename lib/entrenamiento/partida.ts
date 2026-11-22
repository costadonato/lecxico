/*
 * ARMADO DE UNA PARTIDA (S13b)
 * ------------------------------------------------------------------
 * El marco de juego arma la partida al tocar "Comenzar" con armarPartida:
 *   - Los juegos con banco por grado (Detective, Rima, Palmas, Rompe y une,
 *     Palabras de otro planeta…) mezclan el banco y toman los ítems de la
 *     partida (elegirPartida).
 *   - Memotono, Nombrá rápido y ¡Rápido, tocalo! no tienen banco por
 *     grado: generan su contenido.
 *   - Memopalabras arma sus conjuntos desde el banco del grado; Ojo de lince
 *     genera sus cuadrículas; Lluvia elige sus 3 lluvias (S14b).
 *   - Leé y descubrí toma 2 historias del banco y las aplana en preguntas:
 *     la ronda es la pregunta (lib/entrenamiento/lee.ts).
 * Una lista vacía significa "Este grado todavía no tiene contenido". Cada
 * ítem lleva un id estable y legible, que va al detalle de la partida.
 */

import { elegirPartida, itemsDe } from "@/lib/entrenamiento/bancos"
import { generarNombra } from "@/lib/entrenamiento/denominacion-entrenamiento"
import { JUEGOS, type CodigoJuego, type Grado, type Nivel } from "@/lib/entrenamiento/juegos"
import { aplanarLee } from "@/lib/entrenamiento/lee"
import { generarLluvias } from "@/lib/entrenamiento/lluvia"
import { generarMemopalabras } from "@/lib/entrenamiento/memopalabras"
import { generarMemotono } from "@/lib/entrenamiento/memotono"
import { generarOjoLince } from "@/lib/entrenamiento/ojo-lince"
import { generarTocalo } from "@/lib/entrenamiento/tocalo"

export interface ItemPartida {
  id: string
}

/** Juegos que generan su contenido en lugar de tomarlo de un banco por grado. */
export const JUEGOS_GENERADOS: readonly CodigoJuego[] = ["memotono", "nombra", "tocalo", "memopalabras", "ojo_lince", "lluvia"]

export function armarPartida(juego: CodigoJuego, nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemPartida[] {
  const ficha = JUEGOS[juego].niveles[nivel]
  if (!ficha) return []
  if (juego === "memotono") return generarMemotono(nivel, grado, azar)
  if (juego === "nombra") return generarNombra(nivel, grado, azar)
  if (juego === "tocalo") return generarTocalo(nivel, grado, azar)
  if (juego === "memopalabras") return generarMemopalabras(grado, azar)
  if (juego === "ojo_lince") return generarOjoLince(nivel, grado, azar)
  if (juego === "lluvia") return generarLluvias(nivel, grado, azar)
  if (juego === "lee") return aplanarLee(elegirPartida(itemsDe("lee", nivel, grado), ficha.partida[grado], azar))
  return elegirPartida(itemsDe(juego, nivel, grado), ficha.partida[grado], azar)
}
