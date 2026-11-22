"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { Eye } from "lucide-react"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import {
  ANIMACION_SELECCION,
  BotonFinalizar,
  ESTILO_TARJETA,
  InsigniaSeleccion,
  ResumenSeleccion,
  estadoSeleccion,
  type TextosResumen,
} from "@/components/entrenamiento/seleccion"
import type { EventoRonda, PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { conLectura, objetivosMemopalabras, type ItemMemopalabras } from "@/lib/entrenamiento/memopalabras"
import { puntajeSeleccion, resultadoSeleccion, seleccionPerfecta, type PuntajeSeleccion } from "@/lib/entrenamiento/seleccion"
import { cn } from "@/lib/utils"

const TEXTOS_RESUMEN: TextosResumen = {
  encontrados: ["encontrada", "encontradas"],
  omitidos: ["sin encontrar", "sin encontrar"],
  equivocados: ["no estaba", "no estaban"],
}

/**
 * Memopalabras (complementario de reconocimiento visual, primario).
 *   1. Para leer: las palabras en tarjetas grandes y "Ya las leí", sin
 *      límite de tiempo (el tiempo de lectura va al detalle).
 *   2. Para marcar: las leídas y los distractores, mezclados; tocar marca y
 *      tocar otra vez desmarca. "Finalizar" siempre habilitado. La pantalla
 *      para leer ya no se puede ver.
 * Sin reintento: se corrige al finalizar (resolver), y la partida suma los
 * puntajes de selección.
 */
export function Memopalabras({ items, onRonda }: PropsJuego<ItemMemopalabras>) {
  const selecciones = useRef<{ marcados: number[]; puntaje: PuntajeSeleccion }[]>([])
  const lecturas = useRef<(number | undefined)[]>([])
  const r = useRondas(items, onRonda, {
    completar: (res) => {
      const base = resultadoSeleccion(res, selecciones.current)
      return { ...base, detalle: conLectura(base.detalle, lecturas.current) }
    },
  })
  if (!r.item) return null
  const ronda = r.estado.actual
  return (
    <RondaMemopalabras
      key={ronda}
      item={r.item}
      ronda={r}
      avisar={onRonda}
      onLeida={(ms) => {
        lecturas.current[ronda] = ms
      }}
      onCorregir={(marcados, puntaje) => {
        selecciones.current[ronda] = { marcados, puntaje }
      }}
    />
  )
}

function RondaMemopalabras({
  item,
  ronda: r,
  avisar,
  onLeida,
  onCorregir,
}: {
  item: ItemMemopalabras
  ronda: ReturnType<typeof useRondas<ItemMemopalabras>>
  avisar: (e: EventoRonda) => void
  onLeida: (ms: number) => void
  onCorregir: (marcados: number[], puntaje: PuntajeSeleccion) => void
}) {
  const [leidas, setLeidas] = useState(false)
  const [marcados, setMarcados] = useState<number[]>([])
  const [puntaje, setPuntaje] = useState<PuntajeSeleccion | null>(null)
  const inicio = useRef(0)
  const avisarRef = useRef(avisar)
  avisarRef.current = avisar
  const objetivos = objetivosMemopalabras(item)
  const corregida = puntaje !== null

  useEffect(() => {
    inicio.current = performance.now()
    avisarRef.current({ tipo: "momento", momento: "lectura" })
  }, [])

  const yaLasLei = () => {
    onLeida(performance.now() - inicio.current)
    setLeidas(true)
    avisar({ tipo: "momento", momento: "pensando" })
    // El foco va a la consigna de marcar.
    requestAnimationFrame(() => r.refRonda.current?.focus({ preventScroll: true }))
  }

  const alternar = (i: number) => {
    if (!r.puedeResponder || corregida) return
    setMarcados((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))
  }

  const finalizar = () => {
    if (!r.puedeResponder) return
    const p = puntajeSeleccion({ objetivos, marcados })
    setPuntaje(p)
    onCorregir(marcados, p)
    r.resolver(seleccionPerfecta(p))
  }

  if (!leidas) {
    return (
      <div className="flex flex-col items-center gap-6 sm:gap-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-celeste-fuerte px-5 py-2 text-base font-bold text-white shadow-media sm:text-lg">
          <Eye className="size-5" aria-hidden="true" />
          Leé estas palabras
        </p>
        <ul className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {item.leer.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, y: 14, rotate: i % 2 ? 1.5 : -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ ...RESORTE, delay: i * 0.08 }}
              className="grid min-h-24 place-items-center rounded-[1.75rem] border-[3px] border-celeste-fuerte/25 bg-white px-4 py-6 text-center text-3xl font-bold tracking-wide text-foreground shadow-media sm:min-h-28 sm:text-4xl"
            >
              {p}
            </motion.li>
          ))}
        </ul>
        <motion.button
          type="button"
          onClick={yaLasLei}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-celeste-fuerte px-10 text-xl font-bold text-white shadow-boton outline-none focus-visible:ring-4 focus-visible:ring-celeste/60 sm:text-2xl"
        >
          <Eye className="size-7" aria-hidden="true" />
          Ya las leí
        </motion.button>
      </div>
    )
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-7">
      <p className="rounded-full bg-celeste-suave px-5 py-2 text-center text-lg font-bold text-celeste-fuerte sm:text-xl">
        Marcá las {item.leer.length} palabras que leíste
      </p>
      <div role="group" aria-label="Palabras" className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {item.panel.map((p, i) => {
          const estado = estadoSeleccion(objetivos.includes(i), marcados.includes(i), corregida)
          const sufijo =
            estado === "encontrada" ? ", la leíste y la encontraste" : estado === "omitida" ? ", la leíste" : estado === "equivocada" ? ", no estaba" : ""
          return (
            <motion.button
              key={p}
              type="button"
              onClick={() => alternar(i)}
              disabled={!r.puedeResponder}
              aria-pressed={corregida ? undefined : marcados.includes(i)}
              aria-label={`${p}${sufijo}`}
              animate={ANIMACION_SELECCION[estado]}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={cn(
                "relative grid min-h-20 place-items-center rounded-3xl border-[3px] px-2 py-4 text-center text-xl font-bold tracking-wide text-foreground shadow-suave outline-none transition-[background-color,border-color,box-shadow] duration-200 sm:text-2xl",
                "focus-visible:ring-4 focus-visible:ring-ring/50 disabled:cursor-default",
                ESTILO_TARJETA[estado],
              )}
            >
              <span className="max-w-full break-words">{p}</span>
              <InsigniaSeleccion estado={estado} />
            </motion.button>
          )
        })}
      </div>

      {corregida ? (
        <ResumenSeleccion puntaje={puntaje} textos={TEXTOS_RESUMEN} />
      ) : (
        <p role="status" className="text-center text-lg font-semibold text-muted-foreground">
          {marcados.length === 0 ? "Tocá las que leíste." : `Marcaste ${marcados.length}.`}
        </p>
      )}

      {r.puedeResponder && <BotonFinalizar onClick={finalizar} />}
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}
