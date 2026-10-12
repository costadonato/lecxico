"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { Square, Volume2 } from "lucide-react"
import { ANIMACIONES, type NombreAnimacion } from "@/components/personajes/animaciones"
import { RESORTE } from "@/components/motion/transiciones"
import { useVoz } from "@/lib/hooks/use-voz"
import { obtenerPose, PERSONAJES, type NombrePersonaje, type Pose, type PoseDe } from "@/lib/personajes"
import { cn } from "@/lib/utils"

type LadoGlobo = "derecha" | "izquierda" | "arriba" | "abajo"

const DIRECCION: Record<LadoGlobo, string> = {
  derecha: "flex-row",
  izquierda: "flex-row-reverse",
  arriba: "flex-col-reverse",
  abajo: "flex-col",
}

const QUIETO = { y: 0, rotate: 0, scale: 1, scaleY: 1 }

/**
 * Lex o Lumo con una pose del mapa central (lib/personajes.ts), una animación
 * en bucle (components/personajes/animaciones.ts) y, si se pasa `mensaje`, un
 * globo de diálogo cuyo texto aparece letra por letra y se puede escuchar.
 *
 *   <Personaje personaje="lex" mensaje="¡Hola!" claseImagen="w-40" conVoz />
 *
 * El ancho de la imagen se controla con `claseImagen`; el alto sale de la pose.
 * Con reduced-motion no flota y el texto aparece completo de una vez.
 */
export function Personaje<P extends NombrePersonaje>({
  personaje,
  pose,
  animacion = "flotar",
  mensaje,
  ladoGlobo = "derecha",
  conVoz = false,
  className,
  claseImagen = "w-40",
  claseGlobo,
  prioridad = false,
  decorativo = false,
  sombra = true,
  retraso = 0,
}: {
  personaje: P
  pose?: PoseDe<P>
  animacion?: NombreAnimacion | "ninguna"
  /** Texto del globo de diálogo. */
  mensaje?: string
  ladoGlobo?: LadoGlobo
  /** Muestra el botón para escuchar el globo en voz alta. */
  conVoz?: boolean
  className?: string
  /** Ancho de la imagen (p. ej. "w-32 md:w-48"). */
  claseImagen?: string
  claseGlobo?: string
  /** Carga la imagen con prioridad (para la primera pantalla). */
  prioridad?: boolean
  /** Si es true, la imagen no tiene texto alternativo (el personaje es solo decoración). */
  decorativo?: boolean
  /** Sombra en el piso que acompaña la flotación. */
  sombra?: boolean
  /** Segundos antes de aparecer. */
  retraso?: number
}) {
  const reducir = useReducedMotion()
  const datosPose = obtenerPose(personaje, pose)
  const bucle = animacion !== "ninguna" && !reducir ? ANIMACIONES[animacion] : null
  const flota = animacion === "flotar" || animacion === "flotarSuave"

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", DIRECCION[ladoGlobo], className)}>
      <motion.div
        className={cn("relative shrink-0", claseImagen)}
        initial={{ opacity: 0, scale: 0.85, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...RESORTE, delay: retraso }}
      >
        <motion.div
          style={{ transformOrigin: "50% 100%" }}
          initial={QUIETO}
          animate={bucle ? bucle.animate : QUIETO}
          transition={bucle?.transition}
        >
          <ImagenPose pose={datosPose} alt={decorativo ? "" : datosPose.alt} prioridad={prioridad} />
        </motion.div>
        {sombra && (
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-3 left-1/2 h-4 w-3/5 -translate-x-1/2 rounded-[50%] bg-pantalla/15 blur-[6px]"
            initial={{ scaleX: 1, opacity: 0.7 }}
            animate={bucle && flota ? { scaleX: [1, 0.8, 1], opacity: [0.7, 0.4, 0.7] } : { scaleX: 1, opacity: 0.7 }}
            transition={bucle?.transition}
          />
        )}
      </motion.div>

      {mensaje && (
        <GloboDialogo
          texto={mensaje}
          personaje={personaje}
          lado={ladoGlobo}
          retraso={retraso}
          conVoz={conVoz}
          className={claseGlobo}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Imagen de la pose (recortada según su encuadre)                     */
/* ------------------------------------------------------------------ */
function ImagenPose({ pose, alt, prioridad }: { pose: Pose; alt: string; prioridad: boolean }) {
  const e = pose.encuadre ?? { x: 0, y: 0, ancho: pose.ancho, alto: pose.alto }
  return (
    // overflow-hidden: los márgenes transparentes de la imagen no ocupan lugar
    // ni generan scroll; la sombra va en el contenedor para no recortarse.
    <div
      className="relative w-full overflow-hidden drop-shadow-[0_16px_20px_rgb(74_52_30/0.16)]"
      style={{ aspectRatio: `${e.ancho} / ${e.alto}` }}
    >
      <Image
        src={pose.src}
        alt={alt}
        width={pose.ancho}
        height={pose.alto}
        priority={prioridad}
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: `${(pose.ancho / e.ancho) * 100}%`,
          height: "auto",
          left: `${(-e.x / e.ancho) * 100}%`,
          top: `${(-e.y / e.alto) * 100}%`,
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Globo de diálogo                                                    */
/* ------------------------------------------------------------------ */
const COLA: Record<LadoGlobo, string> = {
  derecha: "-left-[9px] top-1/2 -translate-y-1/2 border-l border-b",
  izquierda: "-right-[9px] top-1/2 -translate-y-1/2 border-r border-t",
  arriba: "-bottom-[9px] left-1/2 -translate-x-1/2 border-r border-b",
  abajo: "-top-[9px] left-1/2 -translate-x-1/2 border-l border-t",
}

const ORIGEN_GLOBO: Record<LadoGlobo, string> = {
  derecha: "0% 50%",
  izquierda: "100% 50%",
  arriba: "50% 100%",
  abajo: "50% 0%",
}

/**
 * Globo de diálogo con texto que aparece letra por letra y botón opcional
 * para escucharlo con la voz del personaje. Se puede usar suelto (p. ej.
 * junto a <LumoCara>); `lado` indica dónde está el globo respecto de quien habla.
 */
export function GloboDialogo({
  texto,
  personaje = "lumo",
  lado = "derecha",
  retraso = 0,
  conVoz = false,
  className,
}: {
  texto: string
  personaje?: NombrePersonaje
  lado?: LadoGlobo
  retraso?: number
  conVoz?: boolean
  className?: string
}) {
  const reducir = useReducedMotion()
  const { voz, nombre } = PERSONAJES[personaje]
  const visibles = useTextoProgresivo(texto, !!reducir, retraso + 0.45)
  const { hablar, detener, hablando, disponible } = useVoz(voz)

  return (
    <motion.div
      className={cn(
        "relative max-w-xs rounded-3xl border border-border/80 bg-card px-5 py-4 text-lg font-medium leading-relaxed text-foreground shadow-media",
        className,
      )}
      style={{ transformOrigin: ORIGEN_GLOBO[lado] }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...RESORTE, delay: retraso + 0.3 }}
    >
      <span aria-hidden="true" className={cn("absolute size-4 rotate-45 border-border/80 bg-card", COLA[lado])} />
      <p className="relative">
        <span aria-hidden="true">
          {texto.slice(0, visibles)}
          <span className="invisible">{texto.slice(visibles)}</span>
        </span>
        <span className="sr-only">{texto}</span>
      </p>
      {conVoz && disponible && (
        <button
          type="button"
          onClick={() => (hablando ? detener() : hablar(texto))}
          className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-celeste-suave px-3 py-1 text-sm font-semibold text-celeste-fuerte transition-colors hover:bg-celeste/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-celeste/40"
          aria-label={hablando ? "Dejar de escuchar" : `Escuchar a ${nombre}`}
        >
          {hablando ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-4" />}
          {hablando ? "Detener" : "Escuchar"}
        </button>
      )}
    </motion.div>
  )
}

/** Cantidad de letras visibles: avanza de a una (o todas juntas con reduced-motion). */
function useTextoProgresivo(texto: string, instantaneo: boolean, retraso: number) {
  const [visibles, setVisibles] = useState(0)

  useEffect(() => {
    if (instantaneo) {
      setVisibles(texto.length)
      return
    }
    setVisibles(0)
    let i = 0
    let intervalo: ReturnType<typeof setInterval> | undefined
    const inicio = setTimeout(() => {
      intervalo = setInterval(() => {
        i += 1
        setVisibles(i)
        if (i >= texto.length) clearInterval(intervalo)
      }, 30)
    }, retraso * 1000)
    return () => {
      clearTimeout(inicio)
      clearInterval(intervalo)
    }
  }, [texto, instantaneo, retraso])

  return visibles
}

/* ------------------------------------------------------------------ */
/*  Avatar redondo con la cara del personaje                            */
/* ------------------------------------------------------------------ */
export function CaraPersonaje<P extends NombrePersonaje>({
  personaje,
  pose,
  tamano = 40,
  className,
  decorativo = true,
}: {
  personaje: P
  pose?: PoseDe<P>
  /** Diámetro en píxeles. */
  tamano?: number
  className?: string
  decorativo?: boolean
}) {
  const p = obtenerPose(personaje, pose)
  const cara = p.cara ?? { x: p.ancho / 2, y: p.alto / 2, diametro: Math.min(p.ancho, p.alto) }
  const escala = tamano / cara.diametro

  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: tamano, height: tamano }}
    >
      <Image
        src={p.src}
        alt={decorativo ? "" : PERSONAJES[personaje].nombre}
        width={p.ancho}
        height={p.alto}
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: p.ancho * escala,
          height: p.alto * escala,
          left: tamano / 2 - cara.x * escala,
          top: tamano / 2 - cara.y * escala,
        }}
      />
    </span>
  )
}
