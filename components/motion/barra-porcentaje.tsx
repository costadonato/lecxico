"use client"

import { motion, useReducedMotion } from "motion/react"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { estiloNivel } from "@/lib/niveles"
import { cn } from "@/lib/utils"

/**
 * Barra de porcentaje que se llena al aparecer en pantalla. Es decorativa
 * (aria-hidden): el porcentaje tiene que estar escrito al lado.
 */
export function BarraPorcentaje({
  valor,
  className,
  claseRelleno,
  retraso = 0,
}: {
  /** 0 a 100. */
  valor: number
  className?: string
  /** Color del relleno; por defecto, el del nivel del porcentaje. */
  claseRelleno?: string
  retraso?: number
}) {
  const reducir = useReducedMotion()
  const pct = Math.max(0, Math.min(100, valor))

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)} aria-hidden="true">
      <motion.div
        className={cn("h-full rounded-full", claseRelleno ?? estiloNivel(pct).barra)}
        initial={{ width: "0%" }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={reducir ? { duration: 0 } : { duration: 1.1, ease: EASE_SUAVE, delay: retraso }}
      />
    </div>
  )
}
