"use client"

import type React from "react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { cn } from "@/lib/utils"

/**
 * Tarjeta clara de una pregunta de la evaluación: arriba el bloque (y el botón
 * de audio general, si la pregunta lo tiene) y debajo el ejercicio. Para que
 * la entrada se repita en cada pregunta, la página le pasa una `key` distinta.
 * Con reduced-motion solo se desvanece (MotionConfig lo resuelve).
 */
export function TarjetaPregunta({
  bloque,
  audio,
  children,
}: {
  bloque: string
  /** Botón de audio junto al nombre del bloque. */
  audio?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_SUAVE }}
      className="flex min-h-[60vh] w-full max-w-2xl flex-col rounded-3xl border border-border/80 bg-card p-5 text-card-foreground shadow-suave sm:p-8"
    >
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        <Badge variant="neutro" className="px-3 py-1">
          {bloque}
        </Badge>
        {audio}
      </div>
      {children}
    </motion.div>
  )
}

/** Consigna de la pregunta. */
export function TituloConsigna({
  grande = false,
  className,
  children,
}: {
  /** Consignas que llevan toda la tarea: letra más grande. */
  grande?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <h2
      className={cn(
        "text-balance text-center font-bold text-foreground",
        grande ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
        className,
      )}
    >
      {children}
    </h2>
  )
}

/** Palabra, sílaba o letras estímulo dentro de un "chip" grande. El tamaño de letra va en `className`. */
export function ChipEstimulo({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-block rounded-2xl border border-border/70 bg-muted text-foreground", className)}>
      {children}
    </span>
  )
}
