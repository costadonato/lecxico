"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { RotateCcw, Zap } from "lucide-react"
import { Dibujo } from "@/components/entrenamiento/dibujo"
import type { EventoRonda, PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { useAudio } from "@/lib/entrenamiento/use-audio"
import type { ResultadoRondas } from "@/lib/entrenamiento/rondas"
import { resultadoTocalo, type ItemTocalo } from "@/lib/entrenamiento/tocalo"
import { COLORES_ESTIMULO, type ColorEstimulo, type Estimulo } from "@/lib/test/denominacion-config"
import { cn } from "@/lib/utils"

/** Cuánto se ve el brillo verde de un acierto antes de pasar al siguiente estímulo. */
const PASO_ACIERTO_MS = 500
/** Cuánto se ilumina la celda correcta después de un error o de que se acabe el tiempo. */
const PASO_ERROR_MS = 800

/**
 * ¡Rápido, tocalo! (denominación rápida, inicial y primario). Lumo nombra
 * un estímulo de una cuadrícula chica y el niño lo toca lo más rápido que
 * puede.
 *
 * Nada suena hasta "¡Listo, empezá!". Desde ese toque, Lumo dice cada
 * estímulo solo, uno tras otro: es la única excepción a "nada suena solo",
 * porque es la mecánica del juego.
 *
 * El tiempo se mide desde que termina el audio (alTerminar) hasta el toque,
 * con performance.now(); "Escuchar otra vez" no lo reinicia. Un toque
 * correcto antes de que termine el audio es un acierto, pero sin tiempo
 * válido: no entra en el promedio (lib/entrenamiento/tocalo.ts). El primer
 * toque decide (resolver, sin reintento). En los grados 2 y 3 hay un tiempo
 * límite por estímulo (excepción 2.2.1 de WCAG: es esencial a la
 * actividad); no se muestra como cuenta regresiva, solo una barrita fina que
 * se vacía. En el grado 1, Lumo espera el toque.
 */
export function Tocalo({ items, onRonda }: PropsJuego<ItemTocalo>) {
  /** Tiempo de cada toque, en el orden de las rondas (null si se acabó el tiempo). */
  const tiempos = useRef<(number | null)[]>([])
  const alRonda = useCallback(
    (e: EventoRonda) =>
      onRonda(e.tipo === "fin" ? { tipo: "fin", resultado: resultadoTocalo(e.resultado as ResultadoRondas, tiempos.current) } : e),
    [onRonda],
  )
  const r = useRondas(items, alRonda)
  const { decir, hablando } = useAudio()
  const [empezado, setEmpezado] = useState(false)
  /** Ronda cuyo tiempo ya empezó a correr (terminó su audio). */
  const [corriendo, setCorriendo] = useState<number | null>(null)
  const inicio = useRef<{ ronda: number; t: number } | null>(null)
  /** Lo que pasó en la ronda: la celda tocada, o null si se acabó el tiempo. */
  const [toque, setToque] = useState<{ ronda: number; valor: string | null } | null>(null)

  const actual = r.estado.actual
  const item = r.item

  const nombrar = useCallback(
    (ronda: number) => {
      const objetivo = items[ronda]?.objetivo
      if (!objetivo) return
      decir(objetivo.nombre, {
        velocidad: 0.95,
        alTerminar: () => {
          // "Escuchar otra vez" no reinicia el tiempo.
          if (inicio.current?.ronda === ronda) return
          inicio.current = { ronda, t: performance.now() }
          setCorriendo(ronda)
        },
      })
    },
    [items, decir],
  )

  const empezar = () => {
    setEmpezado(true)
    // Dentro del toque, así el navegador deja sonar el primer audio.
    nombrar(0)
  }

  // Desde el segundo estímulo, Lumo lo dice solo apenas empieza la ronda.
  useEffect(() => {
    if (empezado && actual > 0 && actual < items.length) nombrar(actual)
  }, [empezado, actual, items.length, nombrar])

  const resolver = useRef(r.resolver)
  resolver.current = r.resolver
  const siguiente = useRef(r.siguiente)
  siguiente.current = r.siguiente

  // Tiempo límite (grados 2 y 3): corre desde que terminó el audio.
  const limite = item?.limiteMs ?? null
  useEffect(() => {
    if (limite === null || corriendo !== actual || !r.puedeResponder || !inicio.current) return
    const resta = Math.max(0, limite - (performance.now() - inicio.current.t))
    const t = setTimeout(() => {
      tiempos.current[actual] = null
      setToque({ ronda: actual, valor: null })
      resolver.current(false)
    }, resta)
    return () => clearTimeout(t)
  }, [limite, corriendo, actual, r.puedeResponder])

  // Resuelta la ronda, pasa sola al siguiente estímulo.
  const fase = r.estado.fase
  useEffect(() => {
    if (fase !== "acierto" && fase !== "respuesta") return
    const t = setTimeout(() => siguiente.current(), fase === "acierto" ? PASO_ACIERTO_MS : PASO_ERROR_MS)
    return () => clearTimeout(t)
  }, [fase, actual])

  if (!item) return null

  const tocar = (celda: Estimulo) => {
    if (!empezado || !r.puedeResponder) return
    // Antes de que termine el audio todavía no corre el tiempo: el toque vale, pero sin tiempo válido.
    const ms = inicio.current?.ronda === actual ? performance.now() - inicio.current.t : null
    const aTiempo = limite === null || ms === null || ms <= limite
    tiempos.current[actual] = ms === null ? null : Math.round(ms)
    setToque({ ronda: actual, valor: celda.valor })
    r.resolver(celda.valor === item.objetivo.valor && aTiempo)
  }

  const toqueActual = toque?.ronda === actual ? toque : null
  const resuelta = r.resuelta

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-6">
      {!empezado ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-md text-lg font-semibold text-muted-foreground sm:text-xl">
            Lumo va a nombrar algo de la cuadrícula. ¡Tocalo lo más rápido que puedas!
          </p>
          <motion.button
            type="button"
            onClick={empezar}
            autoFocus
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-sol-fuerte px-8 text-xl font-bold text-white shadow-boton outline-none focus-visible:ring-4 focus-visible:ring-sol/60 sm:min-h-20 sm:px-10 sm:text-2xl"
          >
            <Zap className="size-7 fill-current" aria-hidden="true" />
            ¡Listo, empezá!
          </motion.button>
        </div>
      ) : (
        <div className="flex min-h-12 items-center gap-3">
          <button
            type="button"
            onClick={() => nombrar(actual)}
            disabled={!r.puedeResponder || hablando}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-celeste-suave px-4 text-base font-bold text-celeste-fuerte shadow-suave outline-none transition-colors hover:bg-celeste/30 focus-visible:ring-4 focus-visible:ring-celeste/50 disabled:opacity-50"
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Escuchar otra vez
          </button>
        </div>
      )}

      {/* Pista del tiempo límite: una barrita fina que se vacía, sin números. */}
      <div aria-hidden="true" className="h-2 w-full max-w-md overflow-hidden rounded-full bg-border/50">
        {limite !== null && corriendo === actual && r.puedeResponder && (
          <motion.div
            key={`barra-${actual}`}
            className="h-full rounded-full bg-sol"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: limite / 1000, ease: "linear" }}
          />
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`cuadricula-${item.cuadricula}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: empezado ? 1 : 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          role="group"
          aria-label="Cuadrícula"
          className="grid w-full gap-3 sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${item.columnas}, minmax(0, 8.5rem))`, justifyContent: "center" }}
        >
          {item.celdas.map((celda) => {
            const esObjetivo = celda.valor === item.objetivo.valor
            const tocada = toqueActual?.valor === celda.valor
            const estado: EstadoCelda = !resuelta
              ? "normal"
              : tocada && esObjetivo && fase === "acierto"
                ? "acierto"
                : tocada
                  ? "error"
                  : esObjetivo
                    ? "era"
                    : "normal"
            return (
              <Celda
                key={celda.valor}
                celda={celda}
                estado={estado}
                deshabilitada={!empezado || !r.puedeResponder}
                onTocar={() => tocar(celda)}
              />
            )
          })}
        </motion.div>
      </AnimatePresence>

      <p role="status" className="sr-only">
        {resuelta ? (fase === "acierto" ? "¡Bien!" : `Era ${item.objetivo.nombre}.`) : ""}
      </p>
    </div>
  )
}

type EstadoCelda = "normal" | "acierto" | "error" | "era"

const ESTILO_CELDA: Record<EstadoCelda, string> = {
  normal: "border-border bg-card hover:border-sol hover:bg-sol-suave/60",
  acierto: "border-menta bg-menta-suave ring-8 ring-menta/40 shadow-elevada",
  error: "border-rojo bg-rojo-suave ring-4 ring-rojo/30",
  era: "border-sol-fuerte bg-sol-suave ring-8 ring-sol/60",
}

const ANIMACION_CELDA: Record<EstadoCelda, { scale?: number[]; x?: number[] }> = {
  normal: {},
  acierto: { scale: [1, 1.1, 1] },
  error: { x: [0, -9, 9, -6, 6, 0] },
  era: { scale: [1, 1.06, 1, 1.06, 1] },
}

function nombreAccesible(celda: Estimulo): string {
  return celda.categoria === "letra" ? `letra ${celda.nombre}` : celda.nombre
}

function Celda({
  celda,
  estado,
  deshabilitada,
  onTocar,
}: {
  celda: Estimulo
  estado: EstadoCelda
  deshabilitada: boolean
  onTocar: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onTocar}
      disabled={deshabilitada}
      aria-label={nombreAccesible(celda)}
      animate={ANIMACION_CELDA[estado]}
      transition={estado === "normal" ? RESORTE : { duration: estado === "era" ? 0.8 : 0.45, ease: "easeOut" }}
      whileTap={deshabilitada ? undefined : { scale: 0.94 }}
      className={cn(
        "relative grid aspect-square min-h-11 place-items-center rounded-3xl border-[3px] p-2 shadow-suave outline-none transition-[background-color,border-color,box-shadow] duration-200 sm:p-3",
        "focus-visible:ring-4 focus-visible:ring-ring/50 disabled:cursor-default",
        ESTILO_CELDA[estado],
      )}
    >
      {celda.categoria === "color" ? (
        <span
          aria-hidden="true"
          className="block size-4/5 rounded-2xl border-2 border-foreground/20"
          style={{ backgroundColor: COLORES_ESTIMULO[celda.valor as ColorEstimulo] }}
        />
      ) : celda.categoria === "dibujo" ? (
        <Dibujo palabra={celda.valor} decorativo className="size-4/5" />
      ) : (
        <span aria-hidden="true" className="text-5xl font-bold leading-none text-foreground sm:text-6xl">
          {celda.valor}
        </span>
      )}
    </motion.button>
  )
}
