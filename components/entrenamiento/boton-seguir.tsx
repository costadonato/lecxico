"use client"

import { motion } from "motion/react"
import { ArrowRight, Flag } from "lucide-react"
import { RESORTE } from "@/components/motion/transiciones"
import { cn } from "@/lib/utils"

/**
 * "Seguir" (o "Terminar" en la última ronda): aparece cuando la ronda
 * está resuelta y se lleva el foco, así con teclado se sigue con Enter.
 */
export function BotonSeguir({ ultima, onClick, className }: { ultima: boolean; onClick: () => void; className?: string }) {
  return (
    <motion.button
      type="button"
      autoFocus
      onClick={onClick}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={RESORTE}
      className={cn(
        "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground shadow-boton outline-none transition-[box-shadow,transform] hover:brightness-105 focus-visible:ring-4 focus-visible:ring-ring/50 active:translate-y-0.5 active:shadow-boton-presionado motion-reduce:active:translate-y-0",
        className,
      )}
    >
      {ultima ? "Terminar" : "Seguir"}
      {ultima ? <Flag className="size-5" aria-hidden="true" /> : <ArrowRight className="size-5" aria-hidden="true" />}
    </motion.button>
  )
}
