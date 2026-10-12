import type { Transition } from "motion/react"

/*
 * Curvas y resortes compartidos por todas las animaciones de la app, para que
 * se sientan de la misma familia. Con prefers-reduced-motion, MotionConfig
 * (ProveedorMovimiento) anula el movimiento y los componentes que tienen
 * bucles o conteos lo resuelven con useReducedMotion.
 */

/** Salida rápida y frenado largo: entradas suaves. */
export const EASE_SUAVE = [0.22, 1, 0.36, 1] as const

/** Resorte con un pequeño rebote: hover, tap y apariciones juguetonas. */
export const RESORTE: Transition = { type: "spring", stiffness: 320, damping: 22, mass: 0.8 }

/** Resorte sin rebote visible: elementos sobrios (profesional). */
export const RESORTE_SUAVE: Transition = { type: "spring", stiffness: 200, damping: 28 }

/** Separación entre elementos de una cascada. */
export const PASO_CASCADA = 0.07
