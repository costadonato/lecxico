import type { TargetAndTransition, Transition } from "motion/react"

/*
 * Animaciones de los personajes, independientes de la pose: cualquier pose
 * puede flotar, saltar o saludar. Para sumar una animación nueva, agregá una
 * entrada con su `animate` (valores en bucle) y su `transition`.
 *
 * Con reduced-motion, <Personaje> no aplica ninguna.
 */

export interface AnimacionPersonaje {
  animate: TargetAndTransition
  transition: Transition
}

export const ANIMACIONES = {
  /** Sube y baja despacio, como si flotara. */
  flotar: {
    animate: { y: [0, -14, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  /** Igual que flotar, más leve: para el tono profesional. */
  flotarSuave: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  /** Saltito con aplastamiento, cada tanto. */
  saltar: {
    animate: { y: [0, -22, 0, -6, 0], scaleY: [1, 1.04, 0.95, 1.01, 1] },
    transition: { duration: 1.4, repeat: Infinity, repeatDelay: 2.2, ease: "easeOut" },
  },
  /** Se balancea de un lado al otro, como saludando. */
  saludar: {
    animate: { rotate: [0, -5, 5, -3, 0] },
    transition: { duration: 1.6, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" },
  },
  /** Respira: crece apenas y vuelve. */
  respirar: {
    animate: { scale: [1, 1.025, 1] },
    transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
  },
} satisfies Record<string, AnimacionPersonaje>

export type NombreAnimacion = keyof typeof ANIMACIONES
