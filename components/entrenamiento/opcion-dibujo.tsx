"use client"

import { motion } from "motion/react"
import { Check, X } from "lucide-react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { Dibujo } from "@/components/entrenamiento/dibujo"
import { cn } from "@/lib/utils"

export type EstadoOpcion = "normal" | "elegido" | "correcto" | "incorrecto"

const ESTILO: Record<EstadoOpcion, string> = {
  normal: "border-border bg-card hover:border-celeste hover:bg-celeste-suave/40",
  elegido: "border-celeste bg-celeste-suave ring-4 ring-celeste/30",
  correcto: "border-menta bg-menta-suave ring-4 ring-menta/30",
  incorrecto: "border-rojo/60 bg-rojo-suave",
}

/** Rebote corto al acertar y sacudida corta al fallar (con reducir movimiento, nada se desplaza). */
const ANIMACION: Record<EstadoOpcion, { scale?: number[]; x?: number[] }> = {
  normal: {},
  elegido: {},
  correcto: { scale: [1, 1.08, 0.98, 1] },
  incorrecto: { x: [0, -8, 8, -5, 5, 0] },
}

/**
 * Opción de respuesta con un dibujo (o, con `conDibujo={false}`, con la
 * palabra escrita). Si lleva audio, su botón va al lado (debajo), no
 * adentro, para no confundir "escuchar" con "elegir".
 *
 * Mide al menos 44 px de alto, tiene aria-label con la palabra y foco
 * visible. En los estados correcto e incorrecto suma un ícono (no depende
 * solo del color).
 */
export function OpcionDibujo({
  palabra,
  estado = "normal",
  onElegir,
  deshabilitada = false,
  conDibujo = true,
  conAudio = false,
  className,
}: {
  palabra: string
  estado?: EstadoOpcion
  onElegir: () => void
  deshabilitada?: boolean
  conDibujo?: boolean
  conAudio?: boolean
  className?: string
}) {
  const sufijo = estado === "correcto" ? ", correcta" : estado === "incorrecto" ? ", incorrecta" : ""

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.button
        type="button"
        onClick={onElegir}
        disabled={deshabilitada}
        aria-label={`${palabra}${sufijo}`}
        animate={ANIMACION[estado]}
        transition={{ duration: estado === "incorrecto" ? 0.45 : 0.5, ease: "easeOut" }}
        className={cn(
          "relative flex w-full min-h-11 flex-col items-center justify-center rounded-3xl border-[3px] p-3 shadow-suave outline-none transition-[background-color,border-color,box-shadow] duration-200",
          "focus-visible:ring-4 focus-visible:ring-ring/50 disabled:cursor-default",
          conDibujo ? "aspect-square sm:p-4" : "min-h-16 px-4 py-4 sm:min-h-20",
          ESTILO[estado],
          deshabilitada && estado === "normal" && "opacity-60",
        )}
      >
        {conDibujo ? (
          <Dibujo palabra={palabra} decorativo className="size-full max-h-32 max-w-32" />
        ) : (
          <span className="text-2xl font-bold tracking-wide text-foreground sm:text-3xl">{palabra}</span>
        )}
        {(estado === "correcto" || estado === "incorrecto") && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -right-2 -top-2 grid size-8 place-items-center rounded-full text-white shadow-suave",
              estado === "correcto" ? "bg-menta-fuerte" : "bg-rojo",
            )}
          >
            {estado === "correcto" ? <Check className="size-5" strokeWidth={3} /> : <X className="size-5" strokeWidth={3} />}
          </span>
        )}
      </motion.button>
      {conAudio && (
        <BotonEscuchar texto={palabra} tamano="icono" etiquetaAccesible={`Escuchar ${palabra}`} />
      )}
    </div>
  )
}
