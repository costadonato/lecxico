import type { ItemBanco } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel, Origen } from "@/lib/entrenamiento/juegos"
import type { LetraEntrenamiento } from "@/lib/entrenamiento/partidas"
import type { ResultadoRondas } from "@/lib/entrenamiento/rondas"

/**
 * Resultado de una partida. El detalle suele ser { item, correcta, intentos }
 * por ronda, pero puede tener otra forma (¡Rápido, tocalo! suma `ms`;
 * Nombrá rápido guarda uno por cuadrícula). `tiempoMs` y `errores` van los
 * dos o ninguno (lo exige la 0008).
 */
export type ResultadoJuego = ResultadoRondas<object>

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
  | { tipo: "fin"; resultado: ResultadoJuego }

/** Props de todos los juegos (components/entrenamiento/juegos/). */
export interface PropsJuego<I extends { id: string } = ItemBanco> {
  nivel: Nivel
  grado: Grado
  /** Ítems de la partida, ya elegidos y en orden. */
  items: I[]
  onRonda: (evento: EventoRonda) => void
  letra: LetraEntrenamiento
  /** De dónde viene la partida (Palabras de otro planeta cambia en consulta). */
  origen: Origen
  /** Quién tiene la sesión: el niño (con el tutor) o el profesional (en consulta). */
  modo: "nino" | "profesional"
}
