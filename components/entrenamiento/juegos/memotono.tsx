"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Eraser, Headphones, VolumeX } from "lucide-react"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Dibujo } from "@/components/entrenamiento/dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { useAudio } from "@/lib/entrenamiento/use-audio"
import { PAUSA_MEMOTONO_MS, secuenciaCorrecta, type ItemMemotono } from "@/lib/entrenamiento/memotono"
import type { Nivel } from "@/lib/entrenamiento/juegos"
import { COLORES_ESTIMULO, type ColorEstimulo } from "@/lib/test/denominacion-config"
import { cn } from "@/lib/utils"

/** Columnas del panel según la cantidad de dibujos (de 4 a 9), sin desplazamiento horizontal en 375 px. */
const COLUMNAS_PANEL: Record<number, string> = {
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-3 sm:grid-cols-5",
  6: "grid-cols-3",
  7: "grid-cols-4",
  8: "grid-cols-4",
  9: "grid-cols-3",
}

/**
 * Memotono (memoria auditiva, inicial y primario). Lumo dice una secuencia
 * de palabras (o de colores, en inicial grado 1) con "Escuchar la
 * secuencia" y el niño toca los dibujos del panel en el mismo orden. Cada
 * toque pone una insignia con su número; "Borrar" vuelve a empezar y
 * "Listo" corrige con el reintento de rondas.ts.
 *
 * El panel queda deshabilitado hasta que termina la primera reproducción
 * (nada suena solo). En el reintento se borran las insignias y, si ya no
 * quedaban reproducciones, se suma una.
 */
export function Memotono({ nivel, items, onRonda }: PropsJuego<ItemMemotono>) {
  const r = useRondas(items, onRonda)
  if (!r.item) return null
  return <RondaMemotono key={r.estado.actual} nivel={nivel} item={r.item} ronda={r} />
}

function RondaMemotono({
  nivel,
  item,
  ronda: r,
}: {
  nivel: Nivel
  item: ItemMemotono
  ronda: ReturnType<typeof useRondas<ItemMemotono>>
}) {
  const { decirSecuencia, hablando } = useAudio()
  const [restantes, setRestantes] = useState(item.reproducciones)
  const [escuchada, setEscuchada] = useState(false)
  const [tocadas, setTocadas] = useState<string[]>([])
  const [sacudir, setSacudir] = useState(0)

  const fase = r.estado.fase
  const mostrarRespuesta = fase === "respuesta"
  const resuelta = r.resuelta
  const panelActivo = escuchada && r.puedeResponder && !hablando
  const esColor = item.tipo === "colores"

  const escuchar = () => {
    if (restantes === 0 || hablando) return
    setRestantes((n) => n - 1)
    decirSecuencia(item.secuencia, { pausaMs: PAUSA_MEMOTONO_MS[nivel], alTerminar: () => setEscuchada(true) })
  }

  const tocar = (palabra: string) => {
    if (!panelActivo || tocadas.includes(palabra) || tocadas.length >= item.secuencia.length) return
    setTocadas((t) => [...t, palabra])
  }

  const listo = () => {
    if (!r.puedeResponder || tocadas.length !== item.secuencia.length) return
    const correcta = secuenciaCorrecta(item, tocadas)
    r.responder(correcta)
    if (!correcta) {
      setSacudir((s) => s + 1)
      setTocadas([])
      // Si ya no le quedan reproducciones, para el reintento se le suma una.
      setRestantes((n) => (n === 0 ? 1 : n))
    }
  }

  /** Número que se ve sobre cada dibujo (al mostrar la respuesta, el orden correcto). */
  const numeroDe = (palabra: string): number | null => {
    if (mostrarRespuesta) return item.secuencia.indexOf(palabra) + 1 || null
    const i = tocadas.indexOf(palabra)
    return i === -1 ? null : i + 1
  }

  const agotado = restantes === 0
  const rotuloEscuchar = agotado ? "Sin más reproducciones" : `Escuchar la secuencia (${restantes})`
  const nombre = (p: string) => (esColor ? `color ${p}` : p)

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-7">
      {/* Escuchar la secuencia */}
      <motion.button
        type="button"
        onClick={escuchar}
        disabled={agotado || resuelta}
        whileTap={{ scale: 0.96 }}
        data-sonando={hablando || undefined}
        className={cn(
          "relative inline-flex min-h-16 items-center justify-center gap-3 rounded-full px-7 text-lg font-bold outline-none transition-[background-color,color,box-shadow] duration-200 sm:px-9 sm:text-xl",
          "focus-visible:ring-4 focus-visible:ring-menta/50",
          agotado || resuelta
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : hablando
              ? "bg-menta text-pantalla shadow-elevada"
              : "bg-menta-suave text-menta-fuerte shadow-suave hover:bg-menta/30",
        )}
      >
        {hablando && <OndasSecuencia />}
        <span className="relative grid place-items-center">
          {agotado ? <VolumeX className="size-6" aria-hidden="true" /> : <Headphones className="size-6" aria-hidden="true" />}
        </span>
        <span className="relative">{hablando ? "Escuchando…" : rotuloEscuchar}</span>
      </motion.button>

      <p role="status" className="min-h-7 text-center text-lg font-semibold text-muted-foreground sm:text-xl">
        {mostrarRespuesta
          ? "Este era el orden."
          : !escuchada
            ? "Primero escuchá la secuencia."
            : hablando
              ? "Escuchá con atención…"
              : r.puedeResponder
                ? `Tocá ${esColor ? "los colores" : "los dibujos"} en el mismo orden (${tocadas.length} de ${item.secuencia.length}).`
                : "¡Muy bien!"}
      </p>

      {/* Panel */}
      <motion.div
        key={sacudir}
        animate={sacudir > 0 ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
        transition={{ duration: 0.45, ease: "easeOut" }}
        role="group"
        aria-label={esColor ? "Colores" : "Dibujos"}
        aria-disabled={!panelActivo || undefined}
        className={cn(
          "grid w-full max-w-2xl gap-3 transition-opacity duration-300 sm:gap-4",
          COLUMNAS_PANEL[item.panel.length] ?? "grid-cols-3",
          !escuchada && "opacity-50",
        )}
      >
        {item.panel.map((p) => {
          const numero = numeroDe(p)
          const verde = numero !== null && (mostrarRespuesta || fase === "acierto")
          return (
            <button
              key={p}
              type="button"
              onClick={() => tocar(p)}
              disabled={!panelActivo || tocadas.includes(p)}
              aria-label={numero !== null ? `${nombre(p)}, número ${numero}` : nombre(p)}
              className={cn(
                "relative flex aspect-square min-h-11 items-center justify-center rounded-3xl border-[3px] bg-card p-3 shadow-suave outline-none transition-[background-color,border-color,box-shadow] duration-200 sm:p-4",
                "focus-visible:ring-4 focus-visible:ring-ring/50 disabled:cursor-default",
                verde
                  ? "border-menta bg-menta-suave ring-4 ring-menta/30"
                  : numero !== null
                    ? "border-celeste bg-celeste-suave"
                    : "border-border hover:border-menta hover:bg-menta-suave/40",
              )}
            >
              {esColor ? (
                <span
                  aria-hidden="true"
                  className="block size-3/4 rounded-full border-4 border-white shadow-media"
                  style={{ backgroundColor: COLORES_ESTIMULO[p as ColorEstimulo] }}
                />
              ) : (
                <Dibujo palabra={p} decorativo className="size-full max-h-28 max-w-28" />
              )}
              <AnimatePresence>
                {numero !== null && (
                  <motion.span
                    key={`${p}-${numero}-${verde}`}
                    aria-hidden="true"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={RESORTE}
                    className={cn(
                      "absolute -right-2 -top-2 grid size-9 place-items-center rounded-full border-2 border-white text-lg font-bold text-white shadow-suave",
                      verde ? "bg-menta-fuerte" : "bg-celeste-fuerte",
                    )}
                  >
                    {numero}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </motion.div>

      {/* Al mostrar la respuesta: la secuencia en orden, en una tira chica */}
      {mostrarRespuesta && (
        <motion.ol
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={RESORTE}
          aria-label="La secuencia en orden"
          className="flex flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-menta/40 bg-menta-suave px-4 py-3"
        >
          {item.secuencia.map((p, i) => (
            <li key={p} className="flex items-center gap-1.5">
              <span className="grid size-7 place-items-center rounded-full bg-menta-fuerte text-sm font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              {esColor ? (
                <span
                  role="img"
                  aria-label={nombre(p)}
                  className="block size-9 rounded-full border-2 border-white shadow-suave"
                  style={{ backgroundColor: COLORES_ESTIMULO[p as ColorEstimulo] }}
                />
              ) : (
                <Dibujo palabra={p} className="size-10" />
              )}
            </li>
          ))}
        </motion.ol>
      )}

      {r.puedeResponder && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setTocadas([])}
            disabled={tocadas.length === 0}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-border bg-card px-5 text-base font-bold text-foreground shadow-suave outline-none transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-50"
          >
            <Eraser className="size-5" aria-hidden="true" />
            Borrar
          </button>
          <button
            type="button"
            onClick={listo}
            disabled={tocadas.length !== item.secuencia.length}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-menta-fuerte px-6 text-base font-bold text-white shadow-boton outline-none transition-[filter] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-menta/50 disabled:opacity-50"
          >
            <Check className="size-5" aria-hidden="true" strokeWidth={3} />
            Listo
          </button>
        </div>
      )}
      {resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}

/** Ondas que salen del botón mientras suena la secuencia. */
function OndasSecuencia() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {[0, 0.6].map((retraso) => (
        <motion.span
          key={retraso}
          className="absolute inset-0 rounded-full border-2 border-menta"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 1.2, repeat: Infinity, delay: retraso, ease: "easeOut" }}
        />
      ))}
    </span>
  )
}
