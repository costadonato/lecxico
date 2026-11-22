"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "motion/react"
import { BookOpenCheck } from "lucide-react"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Emoji } from "@/components/entrenamiento/dibujo"
import { OpcionDibujo, type EstadoOpcion } from "@/components/entrenamiento/opcion-dibujo"
import type { EventoRonda, PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { mezclar } from "@/lib/entrenamiento/bancos"
import { resultadoLee, type ItemLee } from "@/lib/entrenamiento/lee"
import { cn } from "@/lib/utils"

/**
 * Leé y descubrí (comprensión lectora, primario). La partida son 2
 * historias, aplanadas en preguntas (lib/entrenamiento/lee.ts): la ronda es
 * la pregunta.
 *
 * Antes de la primera pregunta de cada historia, la pantalla de lectura:
 * título, "Historia 1 de 2" y los párrafos en una tarjeta cómoda para leer
 * (letra grande, interlineado amplio, unos 60 caracteres por línea), con
 * "Ya la leí". Sin audio de la historia y sin tiempo límite (validación del
 * 19/11). Después, las preguntas, sin poder volver a la historia: 3
 * opciones en orden al azar fijo, con el reintento de rondas.ts.
 *
 * El detalle suma el tiempo de lectura de cada historia (no cuenta para el
 * puntaje).
 */
export function Lee({ items, onRonda }: PropsJuego<ItemLee>) {
  const lecturas = useRef<Record<string, number>>({})
  const r = useRondas(items, onRonda, { completar: (res) => resultadoLee(res, items, lecturas.current) })
  const [leidas, setLeidas] = useState<string[]>([])
  // El orden de las opciones se fija una vez por partida.
  const opciones = useMemo(() => items.map((i) => mezclar([i.pregunta.correcta, ...i.pregunta.otras])), [items])
  if (!r.item) return null
  const item = r.item

  if (item.esPrimera && !leidas.includes(item.historia.id)) {
    return (
      <Lectura
        key={item.historia.id}
        item={item}
        avisar={onRonda}
        onLeida={(ms) => {
          lecturas.current[item.historia.id] = ms
          setLeidas((l) => [...l, item.historia.id])
          onRonda({ tipo: "momento", momento: "pensando" })
        }}
      />
    )
  }

  return <RondaLee key={r.estado.actual} item={item} opciones={opciones[r.estado.actual]} ronda={r} />
}

/** La historia para leer. Mide el tiempo desde que se muestra hasta "Ya la leí". */
function Lectura({
  item,
  avisar,
  onLeida,
}: {
  item: ItemLee
  avisar: (e: EventoRonda) => void
  onLeida: (ms: number) => void
}) {
  const inicio = useRef(0)
  const refTitulo = useRef<HTMLHeadingElement>(null)
  const avisarRef = useRef(avisar)
  avisarRef.current = avisar

  useEffect(() => {
    inicio.current = performance.now()
    avisarRef.current({ tipo: "momento", momento: "lectura" })
    refTitulo.current?.focus({ preventScroll: true })
  }, [])

  const { historia } = item

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={RESORTE}
      aria-labelledby="titulo-historia"
      className="flex flex-col items-center gap-6"
    >
      <div className="-mx-2 w-[calc(100%+1rem)] max-w-[44rem] overflow-hidden rounded-[2rem] border-2 border-sol/40 bg-white shadow-elevada sm:mx-0 sm:w-full">
        <header className="flex items-center gap-3 bg-sol-suave px-4 py-4 sm:gap-4 sm:px-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-suave sm:size-14">
            <Emoji char="📖" className="size-9 sm:size-10" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-sol-fuerte">
              Historia {item.numeroHistoria} de {item.totalHistorias}
            </p>
            <h2
              id="titulo-historia"
              ref={refTitulo}
              tabIndex={-1}
              className="text-balance text-2xl font-bold text-foreground outline-none sm:text-3xl"
            >
              {historia.titulo}
            </h2>
          </div>
        </header>
        {/* Unos 60 caracteres por línea, letra grande e interlineado amplio. */}
        <div className="space-y-5 px-4 py-6 sm:px-10 sm:py-8">
          {historia.parrafos.map((p, i) => (
            <p key={i} className="max-w-[60ch] text-xl leading-[1.9] tracking-wide text-foreground sm:text-2xl sm:leading-[1.85]">
              {p}
            </p>
          ))}
        </div>
      </div>
      <motion.button
        type="button"
        onClick={() => onLeida(performance.now() - inicio.current)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-sol-fuerte px-10 text-xl font-bold text-white shadow-boton outline-none focus-visible:ring-4 focus-visible:ring-sol/60 sm:text-2xl"
      >
        <BookOpenCheck className="size-7" aria-hidden="true" />
        Ya la leí
      </motion.button>
    </motion.article>
  )
}

function RondaLee({
  item,
  opciones,
  ronda: r,
}: {
  item: ItemLee
  opciones: string[]
  ronda: ReturnType<typeof useRondas<ItemLee>>
}) {
  const [tocadas, setTocadas] = useState<string[]>([])
  const { pregunta } = item
  const numero = item.historia.preguntas.indexOf(pregunta) + 1

  // Al venir de la lectura, el foco va a la pregunta.
  const { refRonda } = r
  useEffect(() => {
    if (item.esPrimera) refRonda.current?.focus({ preventScroll: true })
  }, [item.esPrimera, refRonda])

  const elegir = (opcion: string) => {
    if (!r.puedeResponder || tocadas.includes(opcion)) return
    setTocadas((t) => [...t, opcion])
    r.responder(opcion === pregunta.correcta)
  }

  const estadoDe = (opcion: string): EstadoOpcion => {
    if (opcion === pregunta.correcta && (tocadas.includes(opcion) || r.estado.fase === "respuesta")) return "correcto"
    if (tocadas.includes(opcion)) return "incorrecto"
    return "normal"
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-6 outline-none sm:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={RESORTE}
        className="w-full max-w-2xl rounded-[2rem] border-[3px] border-sol/50 bg-sol-suave px-5 py-5 text-center shadow-suave sm:px-8"
      >
        <p className="text-sm font-bold text-sol-fuerte">
          {item.historia.titulo} · Pregunta {numero} de {item.historia.preguntas.length}
        </p>
        <h2 className="mt-2 text-balance text-2xl font-bold leading-snug text-foreground sm:text-3xl">{pregunta.pregunta}</h2>
      </motion.div>

      <div className="grid w-full max-w-xl grid-cols-1 gap-3">
        {opciones.map((o) => (
          <OpcionDibujo
            key={o}
            palabra={o}
            conDibujo={false}
            estado={estadoDe(o)}
            onElegir={() => elegir(o)}
            deshabilitada={!r.puedeResponder || tocadas.includes(o)}
            className={cn("[&_button]:min-h-16 [&_span]:text-xl sm:[&_span]:text-2xl")}
          />
        ))}
      </div>
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}
