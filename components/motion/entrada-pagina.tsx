"use client"

import type React from "react"
import { motion } from "motion/react"
import { EASE_SUAVE } from "@/components/motion/transiciones"

/**
 * Entrada suave de una página o bloque: aparece y sube unos píxeles.
 * Con reduced-motion solo se desvanece (sin desplazamiento).
 */
export function EntradaPagina({
  children,
  className,
  retraso = 0,
  desplazamiento = 18,
}: {
  children: React.ReactNode
  className?: string
  /** Segundos antes de empezar. */
  retraso?: number
  /** Píxeles que sube al entrar. */
  desplazamiento?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: desplazamiento }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_SUAVE, delay: retraso }}
    >
      {children}
    </motion.div>
  )
}
