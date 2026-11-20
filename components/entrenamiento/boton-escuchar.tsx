"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Volume2, VolumeX } from "lucide-react"
import { useAudio } from "@/lib/entrenamiento/use-audio"
import { cn } from "@/lib/utils"

/**
 * Botón grande para escuchar un audio. Solo suena al tocarlo (nada suena
 * solo) y usa el reproductor único: tocar otro audio corta este.
 *
 * Con `max`, el rótulo dice cuántas veces queda ("Escuchar (2)") y al
 * llegar a cero pasa a "Sin más reproducciones". Los audios con límite
 * tienen una reproducción más que en el mockup, porque ya no hay
 * reproducción automática. Para reiniciar el contador en cada ronda, el
 * padre le cambia la `key`.
 *
 * Mientras suena se anima (ondas y barras); con reducir movimiento, solo
 * cambia el color.
 */
export function BotonEscuchar({
  texto,
  etiqueta = "Escuchar",
  etiquetaAccesible,
  max,
  velocidad = 0.85,
  tamano = "grande",
  deshabilitado = false,
  className,
}: {
  /** Lo que se dice (o la clave del manifiesto de audios). */
  texto: string
  etiqueta?: string
  /** aria-label, si el rótulo visible no alcanza (por ejemplo, en el modo icono). */
  etiquetaAccesible?: string
  /** Cantidad máxima de reproducciones. Sin max, no hay límite. */
  max?: number
  velocidad?: number
  /** "grande": píldora con rótulo; "chico": píldora compacta; "icono": solo el parlante. */
  tamano?: "grande" | "chico" | "icono"
  deshabilitado?: boolean
  className?: string
}) {
  const { decir, hablando } = useAudio()
  const [usadas, setUsadas] = useState(0)
  const restantes = max === undefined ? null : Math.max(0, max - usadas)
  const agotado = restantes === 0
  const inactivo = deshabilitado || agotado

  const rotulo = agotado ? "Sin más reproducciones" : restantes !== null ? `${etiqueta} (${restantes})` : etiqueta

  const tocar = () => {
    // Mientras suena su propio audio, otro toque no lo repite ni gasta una reproducción.
    if (inactivo || hablando) return
    setUsadas((u) => u + 1)
    decir(texto, { velocidad })
  }

  return (
    <button
      type="button"
      onClick={tocar}
      disabled={inactivo}
      aria-label={tamano === "icono" || etiquetaAccesible ? (etiquetaAccesible ?? rotulo) : undefined}
      data-sonando={hablando || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-bold outline-none transition-[background-color,color,box-shadow,transform] duration-200",
        "focus-visible:ring-4 focus-visible:ring-celeste/50 active:scale-[0.97] motion-reduce:active:scale-100",
        tamano === "grande" && "min-h-14 px-6 text-lg sm:min-h-16 sm:px-8 sm:text-xl",
        tamano === "chico" && "min-h-11 px-4 text-base",
        tamano === "icono" && "size-11",
        inactivo
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : hablando
            ? "bg-celeste text-pantalla shadow-brillo-celeste"
            : "bg-celeste-suave text-celeste-fuerte shadow-suave hover:bg-celeste/30",
        className,
      )}
    >
      {hablando && !inactivo && <Ondas />}
      <span className="relative grid place-items-center">
        {agotado ? (
          <VolumeX className={tamano === "grande" ? "size-6" : "size-5"} aria-hidden="true" />
        ) : hablando ? (
          <Barras grande={tamano === "grande"} />
        ) : (
          <Volume2 className={tamano === "grande" ? "size-6" : "size-5"} aria-hidden="true" />
        )}
      </span>
      {tamano !== "icono" && <span className="relative">{rotulo}</span>}
    </button>
  )
}

/** Ondas que salen del botón mientras suena. */
function Ondas() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {[0, 0.6].map((retraso) => (
        <motion.span
          key={retraso}
          className="absolute inset-0 rounded-full border-2 border-celeste"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 1.2, repeat: Infinity, delay: retraso, ease: "easeOut" }}
        />
      ))}
    </span>
  )
}

/** Tres barras de ecualizador en lugar del parlante. */
function Barras({ grande }: { grande: boolean }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center gap-[3px]", grande ? "h-6 w-6" : "h-5 w-5")}>
      {[0, 0.15, 0.3].map((retraso) => (
        <motion.span
          key={retraso}
          className="w-1.5 flex-1 rounded-full bg-current"
          style={{ height: "100%", originY: 0.5 }}
          initial={{ scaleY: 0.4 }}
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: retraso, ease: "easeInOut" }}
        />
      ))}
    </span>
  )
}
