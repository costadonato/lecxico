"use client"

import type React from "react"
import { motion } from "motion/react"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { Personaje } from "@/components/personajes/personaje"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { cn } from "@/lib/utils"

/**
 * Estado de carga: Lumo pensando y un texto. `pantallaCompleta` lo centra en
 * toda la ventana (mientras se carga el perfil).
 */
export function Cargando({
  texto = "Cargando…",
  tamano = 96,
  pantallaCompleta = false,
  className,
}: {
  texto?: string
  tamano?: number
  pantallaCompleta?: boolean
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        pantallaCompleta ? "min-h-screen fondo-profesional" : "py-12",
        className,
      )}
    >
      <LumoCara estado="pensando" tamano={tamano} />
      <p className="text-base font-medium text-muted-foreground">{texto}</p>
    </div>
  )
}

/**
 * Estado vacío: un personaje (Lumo dormido por defecto), un título, una
 * explicación y una acción opcional.
 */
export function EstadoVacio({
  titulo,
  descripcion,
  accion,
  personaje = "lumo-dormido",
  compacto = false,
  className,
}: {
  titulo?: React.ReactNode
  descripcion?: React.ReactNode
  accion?: React.ReactNode
  /** "lumo-dormido" (LumoCara) o un personaje completo. */
  personaje?: "lumo-dormido" | "lex" | "lumo"
  /** Versión chica, sin borde, para usar dentro de una sección. */
  compacto?: boolean
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_SUAVE }}
      className={cn(
        "flex flex-col items-center gap-4 text-center",
        compacto ? "py-4" : "rounded-3xl border-2 border-dashed border-border bg-card/70 px-6 py-10",
        className,
      )}
    >
      {personaje === "lumo-dormido" ? (
        <LumoCara estado="dormido" tamano={compacto ? 76 : 104} />
      ) : (
        <Personaje
          personaje={personaje}
          claseImagen={compacto ? "w-20" : personaje === "lex" ? "w-28" : "w-24"}
          animacion="flotarSuave"
          decorativo
        />
      )}
      <div className="max-w-md space-y-2">
        {titulo && <p className="text-lg font-bold text-foreground">{titulo}</p>}
        {descripcion && <div className="text-base text-muted-foreground">{descripcion}</div>}
      </div>
      {accion}
    </motion.div>
  )
}
