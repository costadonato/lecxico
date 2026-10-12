"use client"

import type React from "react"
import { motion, useReducedMotion } from "motion/react"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { cn } from "@/lib/utils"

const TRAZO = {
  sol: "text-sol",
  celeste: "text-celeste",
  rojo: "text-rojo/60",
  lavanda: "text-lavanda",
}

/**
 * Palabra destacada en un título, con un subrayado ondulado que se dibuja
 * solo al aparecer (sin animación con reduced-motion).
 */
export function Resaltado({
  children,
  color = "sol",
  className,
  retraso = 0.5,
}: {
  children: React.ReactNode
  color?: keyof typeof TRAZO
  className?: string
  retraso?: number
}) {
  const reducir = useReducedMotion()
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        className={cn("absolute -bottom-1 left-0 h-[0.32em] w-full", TRAZO[color])}
      >
        <motion.path
          d="M3 11 C 40 3, 70 3, 100 9 S 160 15, 197 6"
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reducir ? { duration: 0 } : { duration: 0.9, ease: EASE_SUAVE, delay: retraso }}
        />
      </svg>
    </span>
  )
}
