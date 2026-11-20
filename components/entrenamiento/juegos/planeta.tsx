"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "motion/react"
import { Check, Sparkles, X } from "lucide-react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Emoji } from "@/components/entrenamiento/dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { mezclar, type ItemPlaneta } from "@/lib/entrenamiento/bancos"
import { cn } from "@/lib/utils"

/** En consulta, la ronda resuelta pasa sola a la siguiente después de este tiempo. */
const PASO_AUTOMATICO_MS = 600

/**
 * Palabras de otro planeta (lectura de pseudopalabras, primario). La
 * pseudopalabra va grande, en una tarjeta lavanda "de otro planeta".
 *
 *   - Práctica y tareas: abajo, tres tarjetas "Audio 1/2/3" con su parlante
 *     (sin límite, a velocidad 0,8) y "¡Es esta!". Los audios son la
 *     palabra y sus dos distractores, en un orden al azar fijo por ronda.
 *     Escuchar no elige; elegir no reproduce. Reintento según rondas.ts.
 *   - Consulta (validación del 19/11): solo la palabra. El niño la lee en
 *     voz alta y el profesional marca Bien o Mal; se resuelve sin reintento
 *     y pasa sola a la siguiente.
 */
export function Planeta({ items, onRonda, origen }: PropsJuego<ItemPlaneta>) {
  const r = useRondas(items, onRonda)
  // El orden de los audios se fija una vez por partida.
  const audios = useMemo(() => items.map((i) => mezclar([i.palabra, ...i.distractores])), [items])
  if (!r.item) return null
  return origen === "consulta" ? (
    <RondaConsulta key={r.estado.actual} item={r.item} ronda={r} />
  ) : (
    <RondaAudios key={r.estado.actual} item={r.item} audios={audios[r.estado.actual]} ronda={r} />
  )
}

type Ronda = ReturnType<typeof useRondas<ItemPlaneta>>

/** La tarjeta con la pseudopalabra: fondo lavanda, el planeta y estrellitas. */
function TarjetaPlaneta({ palabra }: { palabra: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={RESORTE}
      className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border-4 border-white bg-lavanda-suave px-6 pb-8 pt-10 text-center shadow-elevada sm:px-10 sm:pb-10 sm:pt-12"
    >
      <span aria-hidden="true" className="absolute -right-4 -top-4 opacity-90">
        <Emoji char="🪐" className="size-16 sm:size-24" />
      </span>
      {[
        "left-5 top-5 size-4",
        "left-1/3 top-3 size-3",
        "bottom-4 right-8 size-5",
        "bottom-6 left-10 size-3",
        "right-1/3 bottom-3 size-2.5",
      ].map((pos, i) => (
        <motion.span
          key={pos}
          aria-hidden="true"
          className={cn("absolute text-lavanda", pos)}
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        >
          <Sparkles className="size-full" />
        </motion.span>
      ))}
      <p className="sr-only">La palabra de otro planeta:</p>
      {/* Nunca se parte: la letra se achica según el largo de la palabra y el ancho de la tarjeta. */}
      <div className="@container relative">
        <p
          className="whitespace-nowrap font-bold leading-tight tracking-[0.12em] text-lavanda-fuerte"
          style={{ fontSize: `min(${(88 / Math.max(4, palabra.length)).toFixed(1)}cqw, 4.5rem)` }}
        >
          {palabra}
        </p>
      </div>
    </motion.div>
  )
}

function RondaAudios({ item, audios, ronda: r }: { item: ItemPlaneta; audios: string[]; ronda: Ronda }) {
  const [elegidas, setElegidas] = useState<number[]>([])
  const mostrarRespuesta = r.estado.fase === "respuesta"

  const elegir = (i: number) => {
    if (!r.puedeResponder || elegidas.includes(i)) return
    setElegidas((e) => [...e, i])
    r.responder(audios[i] === item.palabra)
  }

  const estadoDe = (i: number): "normal" | "correcto" | "incorrecto" => {
    const esCorrecta = audios[i] === item.palabra
    if (esCorrecta && (elegidas.includes(i) || mostrarRespuesta)) return "correcto"
    if (elegidas.includes(i)) return "incorrecto"
    return "normal"
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-6 outline-none sm:gap-8">
      <TarjetaPlaneta palabra={item.palabra} />
      <p className="text-center text-lg font-semibold text-foreground sm:text-xl">¿Qué audio la dice bien?</p>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {audios.map((texto, i) => {
          const estado = estadoDe(i)
          return (
            <motion.div
              key={i}
              animate={estado === "incorrecto" ? { x: [0, -8, 8, -5, 5, 0] } : estado === "correcto" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={cn(
                "relative flex items-center justify-between gap-3 rounded-3xl border-[3px] px-4 py-3 shadow-suave transition-colors sm:flex-col sm:py-5",
                estado === "correcto"
                  ? "border-menta bg-menta-suave ring-4 ring-menta/30"
                  : estado === "incorrecto"
                    ? "border-rojo/60 bg-rojo-suave"
                    : "border-lavanda/40 bg-card",
              )}
            >
              <span className="whitespace-nowrap text-lg font-bold text-lavanda-fuerte">Audio {i + 1}</span>
              <div className="flex items-center gap-2">
                <BotonEscuchar texto={texto} tamano="icono" velocidad={0.8} etiquetaAccesible={`Escuchar el audio ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => elegir(i)}
                  disabled={!r.puedeResponder || elegidas.includes(i)}
                  aria-label={`¡Es esta! (audio ${i + 1})${estado === "correcto" ? ", correcta" : estado === "incorrecto" ? ", incorrecta" : ""}`}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-base font-bold shadow-suave outline-none transition-[filter,background-color] focus-visible:ring-4 focus-visible:ring-lavanda/50 disabled:cursor-default",
                    estado === "normal"
                      ? "bg-lavanda-fuerte text-white hover:brightness-110 disabled:opacity-50"
                      : estado === "correcto"
                        ? "bg-menta-fuerte text-white"
                        : "bg-rojo text-white",
                  )}
                >
                  {estado === "correcto" ? (
                    <Check className="size-4" aria-hidden="true" strokeWidth={3} />
                  ) : estado === "incorrecto" ? (
                    <X className="size-4" aria-hidden="true" strokeWidth={3} />
                  ) : null}
                  ¡Es esta!
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}

/** Consulta: el profesional marca Bien o Mal. Textos del profesional en normal-case. */
function RondaConsulta({ item, ronda: r }: { item: ItemPlaneta; ronda: Ronda }) {
  const [marca, setMarca] = useState<boolean | null>(null)
  const siguiente = useRef(r.siguiente)
  siguiente.current = r.siguiente

  // Resuelta la ronda, pasa sola a la siguiente (o termina), sin "Seguir".
  useEffect(() => {
    if (!r.resuelta) return
    const t = setTimeout(() => siguiente.current(), PASO_AUTOMATICO_MS)
    return () => clearTimeout(t)
  }, [r.resuelta])

  const marcar = (bien: boolean) => {
    if (!r.puedeResponder) return
    setMarca(bien)
    r.resolver(bien)
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-6 outline-none sm:gap-8">
      <TarjetaPlaneta palabra={item.palabra} />
      <div className="flex w-full max-w-xl flex-col items-center gap-3 normal-case [&_button]:normal-case">
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
          <BotonMarca bien onClick={() => marcar(true)} deshabilitado={!r.puedeResponder} elegido={marca === true} />
          <BotonMarca bien={false} onClick={() => marcar(false)} deshabilitado={!r.puedeResponder} elegido={marca === false} />
        </div>
        <p className="text-center text-sm text-muted-foreground">Marcá Bien si la leyó completa y sin cambiar ningún sonido.</p>
        <p role="status" className="sr-only">
          {marca === null ? "" : marca ? "Marcada bien." : "Marcada mal."}
        </p>
      </div>
    </div>
  )
}

function BotonMarca({
  bien,
  onClick,
  deshabilitado,
  elegido,
}: {
  bien: boolean
  onClick: () => void
  deshabilitado: boolean
  elegido: boolean
}) {
  const Icono = bien ? Check : X
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      whileTap={{ scale: 0.96 }}
      animate={elegido ? { scale: [1, 1.06, 1] } : {}}
      transition={{ duration: 0.35 }}
      className={cn(
        "inline-flex min-h-16 items-center justify-center gap-2 rounded-3xl text-xl font-bold text-white shadow-boton outline-none transition-[filter,opacity] focus-visible:ring-4 sm:min-h-20 sm:text-2xl",
        bien ? "bg-menta-fuerte focus-visible:ring-menta/50" : "bg-rojo-fuerte focus-visible:ring-rojo/40",
        !deshabilitado && "hover:brightness-110",
        deshabilitado && !elegido && "opacity-40",
        elegido && "ring-4 ring-offset-2 ring-offset-card " + (bien ? "ring-menta" : "ring-rojo"),
      )}
    >
      <Icono className="size-7" aria-hidden="true" strokeWidth={3} />
      {bien ? "Bien" : "Mal"}
    </motion.button>
  )
}
