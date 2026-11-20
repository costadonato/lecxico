"use client"

import type React from "react"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Eraser } from "lucide-react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Dibujo, Emoji } from "@/components/entrenamiento/dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import type { ItemPalmas } from "@/lib/entrenamiento/bancos"
import { cn } from "@/lib/utils"

/** Golpes máximos (las palabras del banco tienen hasta 4 sílabas). */
const MAX_GOLPES = 8

/**
 * Palmas (conciencia silábica, inicial). Se ven el dibujo y "Escuchar". El
 * niño toca el tambor una vez por sílaba: cada toque suma un punto visible
 * y hace una animación de golpe. "Borrar" vuelve a cero y "Listo" compara
 * con `silabas`, con el reintento de rondas.ts. Con teclado: Enter o
 * Espacio sobre el tambor (mantener apretado no suma golpes).
 */
export function Palmas({ items, onRonda }: PropsJuego<ItemPalmas>) {
  const r = useRondas(items, onRonda)
  if (!r.item) return null
  return <RondaPalmas key={r.estado.actual} item={r.item} ronda={r} />
}

function RondaPalmas({ item, ronda: r }: { item: ItemPalmas; ronda: ReturnType<typeof useRondas<ItemPalmas>> }) {
  const [golpes, setGolpes] = useState(0)
  const mostrarRespuesta = r.estado.fase === "respuesta"
  const acerto = r.estado.fase === "acierto"

  const golpear = () => {
    if (!r.puedeResponder) return
    setGolpes((g) => Math.min(MAX_GOLPES, g + 1))
  }

  const listo = () => {
    if (!r.puedeResponder || golpes === 0) return
    const correcta = golpes === item.silabas
    r.responder(correcta)
    // En el reintento vuelve a empezar de cero.
    if (!correcta) setGolpes(0)
  }

  const sinRepetir = (e: React.KeyboardEvent) => {
    if (e.repeat && (e.key === "Enter" || e.key === " ")) e.preventDefault()
  }

  const puntos = mostrarRespuesta ? item.silabas : golpes

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-7">
      <div className="flex items-center gap-4 rounded-[2rem] border-[3px] border-mandarina/50 bg-mandarina-suave px-5 py-4 shadow-suave sm:gap-6 sm:px-8">
        <Dibujo palabra={item.palabra} className="size-24 sm:size-32" />
        <BotonEscuchar texto={item.palabra} tamano="chico" etiquetaAccesible="Escuchar la palabra" />
      </div>

      {/* Tambor */}
      <motion.button
        type="button"
        onClick={golpear}
        onKeyDown={sinRepetir}
        disabled={!r.puedeResponder}
        aria-label="Tambor: tocalo una vez por cada sílaba"
        whileTap={{ scale: 0.92 }}
        className={cn(
          "relative grid size-40 place-items-center rounded-full border-4 border-white bg-mandarina shadow-elevada outline-none transition-[filter] sm:size-48",
          "focus-visible:ring-8 focus-visible:ring-mandarina/40 disabled:cursor-default disabled:saturate-50",
        )}
      >
        <span aria-hidden="true" className="absolute inset-3 rounded-full border-4 border-dashed border-white/40" />
        <motion.span
          key={golpes}
          aria-hidden="true"
          initial={golpes > 0 ? { scale: 0.8, rotate: -8, opacity: 0.6 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={RESORTE}
          className="relative grid place-items-center"
        >
          <Emoji char="🥁" className="size-24 sm:size-28" />
        </motion.span>
        {/* Destello de cada golpe (con reducir movimiento queda solo el fundido) */}
        <AnimatePresence>
          {golpes > 0 && (
            <motion.span
              key={`onda-${golpes}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-4 border-sol"
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: 0, scale: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Puntos: uno por golpe (o, al mostrar la respuesta, uno por sílaba) */}
      <div className="flex min-h-10 flex-wrap items-center justify-center gap-2.5" aria-hidden="true">
        <AnimatePresence initial={false}>
          {Array.from({ length: puntos }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={RESORTE}
              className={cn(
                "size-8 rounded-full border-2 border-white shadow-suave",
                mostrarRespuesta || acerto ? "bg-menta" : "bg-sol",
              )}
            />
          ))}
        </AnimatePresence>
      </div>
      <p role="status" className="text-center text-lg font-semibold text-muted-foreground">
        {mostrarRespuesta
          ? `«${item.palabra}» tiene ${item.silabas} ${item.silabas === 1 ? "sílaba" : "sílabas"}.`
          : golpes === 0
            ? "Tocá el tambor."
            : `${golpes} ${golpes === 1 ? "golpe" : "golpes"}`}
      </p>

      {r.puedeResponder && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setGolpes(0)}
            disabled={golpes === 0}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-border bg-card px-5 text-base font-bold text-foreground shadow-suave outline-none transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-50"
          >
            <Eraser className="size-5" aria-hidden="true" />
            Borrar
          </button>
          <button
            type="button"
            onClick={listo}
            disabled={golpes === 0}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-menta-fuerte px-6 text-base font-bold text-white shadow-boton outline-none transition-[filter] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-menta/50 disabled:opacity-50"
          >
            <Check className="size-5" aria-hidden="true" strokeWidth={3} />
            Listo
          </button>
        </div>
      )}
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}
