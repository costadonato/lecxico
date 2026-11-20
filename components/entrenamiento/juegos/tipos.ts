import type { ItemBanco } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import type { LetraEntrenamiento } from "@/lib/entrenamiento/partidas"
import type { ResultadoRondas } from "@/lib/entrenamiento/rondas"

/**
 * Lo que un juego le cuenta al marco. El marco no sabe nada de la
 * mecánica: con estos eventos mueve la barra de progreso, cambia la pose y
 * la frase del personaje y, al final, guarda la partida.
 */
export type EventoRonda =
  /** El niño respondió: acertó, puede reintentar o se mostró la respuesta. */
  | { tipo: "respuesta"; fase: "acierto" | "reintento" | "respuesta"; enReintento: boolean; ronda: number }
  /** Empezó la ronda `ronda` (desde 0). */
  | { tipo: "siguiente"; ronda: number }
  /** Terminó la última ronda. */
  | { tipo: "fin"; resultado: ResultadoRondas }

/** Props de todos los juegos (components/entrenamiento/juegos/). */
export interface PropsJuego<I extends { id: string } = ItemBanco> {
  nivel: Nivel
  grado: Grado
  /** Ítems de la partida, ya elegidos y en orden. */
  items: I[]
  onRonda: (evento: EventoRonda) => void
  letra: LetraEntrenamiento
}
