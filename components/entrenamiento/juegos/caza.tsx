"use client"

import { useMemo, useRef, useState } from "react"
import { motion } from "motion/react"
import { Check, Search, X } from "lucide-react"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Emoji } from "@/components/entrenamiento/dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import type { ItemCaza } from "@/lib/entrenamiento/bancos"
import { objetivosCaza, partirOracion, textoCantidadErrores } from "@/lib/entrenamiento/caza"
import {
  puntajeSeleccion,
  resultadoSeleccion,
  seleccionPerfecta,
  type PuntajeSeleccion,
} from "@/lib/entrenamiento/seleccion"
import { cn } from "@/lib/utils"

/**
 * Caza errores (reconocimiento visual, primario). Arriba, cuántas palabras
 * mal escritas tiene la oración; abajo, la oración con cada palabra como
 * botón. Tocar una palabra la marca (subrayado ondulado y fondo suave) y
 * tocarla otra vez la desmarca. "Listo" siempre está habilitado.
 *
 * Sin reintento: se corrige al tocar "Listo" (resolver). La ronda es un
 * acierto solo si encontró todo sin marcas equivocadas; el puntaje de la
 * partida suma, con puntajeSeleccion, las palabras con error encontradas
 * sobre las palabras con error más las bien escritas que marcó.
 */
export function Caza({ items, onRonda }: PropsJuego<ItemCaza>) {
  const selecciones = useRef<{ marcados: number[]; puntaje: PuntajeSeleccion }[]>([])
  const r = useRondas(items, onRonda, { completar: (res) => resultadoSeleccion(res, selecciones.current) })
  if (!r.item) return null
  const ronda = r.estado.actual
  return (
    <RondaCaza
      key={ronda}
      item={r.item}
      ronda={r}
      onCorregir={(marcados, puntaje) => {
        selecciones.current[ronda] = { marcados, puntaje }
      }}
    />
  )
}

type EstadoPalabra = "normal" | "marcada" | "encontrada" | "omitida" | "equivocada"

const ESTILO: Record<EstadoPalabra, string> = {
  normal: "border-transparent bg-transparent hover:bg-celeste-suave/70",
  marcada: "border-celeste-fuerte/40 bg-celeste-suave underline decoration-rojo decoration-wavy decoration-2 underline-offset-[0.3em]",
  encontrada: "border-menta bg-menta-suave text-menta-fuerte",
  omitida: "border-sol-fuerte/60 bg-sol-suave text-sol-fuerte",
  equivocada: "border-rojo/60 bg-rojo-suave text-rojo-fuerte",
}

function RondaCaza({
  item,
  ronda: r,
  onCorregir,
}: {
  item: ItemCaza
  ronda: ReturnType<typeof useRondas<ItemCaza>>
  onCorregir: (marcados: number[], puntaje: PuntajeSeleccion) => void
}) {
  const palabras = useMemo(() => partirOracion(item.oracion), [item.oracion])
  const objetivos = useMemo(() => objetivosCaza(palabras, item.errores), [palabras, item.errores])
  const [marcados, setMarcados] = useState<number[]>([])
  const [puntaje, setPuntaje] = useState<PuntajeSeleccion | null>(null)
  const corregida = puntaje !== null

  const alternar = (i: number) => {
    if (!r.puedeResponder) return
    setMarcados((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))
  }

  const listo = () => {
    if (!r.puedeResponder) return
    const p = puntajeSeleccion({ objetivos, marcados })
    setPuntaje(p)
    onCorregir(marcados, p)
    r.resolver(seleccionPerfecta(p))
  }

  const estadoDe = (i: number): EstadoPalabra => {
    const esObjetivo = objetivos.includes(i)
    const marcada = marcados.includes(i)
    if (!corregida) return marcada ? "marcada" : "normal"
    if (esObjetivo) return marcada ? "encontrada" : "omitida"
    return marcada ? "equivocada" : "normal"
  }

  const etiquetaDe = (i: number, estado: EstadoPalabra): string => {
    const p = palabras[i].palabra
    const correccion = item.errores[p]
    if (estado === "encontrada") return `${p}: la encontraste, se escribe ${correccion}`
    if (estado === "omitida") return `${p}: estaba mal escrita, se escribe ${correccion}`
    if (estado === "equivocada") return `${p}: estaba bien escrita`
    return p
  }

  const n = objetivos.length

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-7">
      <div className="flex items-center gap-3 rounded-full bg-celeste-fuerte py-2 pl-2 pr-5 text-white shadow-media sm:pr-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white">
          <Emoji char="🔎" className="size-8" />
        </span>
        <p className="text-base font-bold sm:text-lg">{textoCantidadErrores(n)}</p>
      </div>

      {/* La oración: cada palabra es un botón; la puntuación queda pegada, fuera del botón. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={RESORTE}
        role="group"
        aria-label="La oración: tocá las palabras mal escritas"
        className="flex w-full max-w-3xl flex-wrap items-start justify-center gap-x-1 gap-y-3 rounded-[2rem] border-[3px] border-celeste-fuerte/25 bg-white px-3 py-6 shadow-media sm:gap-x-2 sm:px-8 sm:py-8"
      >
        {palabras.map((p, i) => {
          const estado = estadoDe(i)
          const correccion = item.errores[p.palabra]
          const conEtiqueta = (estado === "encontrada" || estado === "omitida") && correccion
          return (
            <span key={i} className="inline-flex flex-col items-center">
              <span className="inline-flex items-center text-2xl font-semibold text-foreground sm:text-3xl">
                {p.antes && <span aria-hidden="true" className="-mr-1">{p.antes}</span>}
                <motion.button
                  type="button"
                  onClick={() => alternar(i)}
                  disabled={!r.puedeResponder}
                  aria-pressed={corregida ? undefined : marcados.includes(i)}
                  aria-label={corregida ? etiquetaDe(i, estado) : undefined}
                  animate={
                    estado === "marcada"
                      ? { scale: [1, 1.08, 1] }
                      : estado === "equivocada"
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : estado === "encontrada"
                          ? { scale: [1, 1.1, 1] }
                          : {}
                  }
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={cn(
                    "relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl border-2 px-1.5 py-1 outline-none transition-colors duration-200",
                    "focus-visible:ring-4 focus-visible:ring-celeste-fuerte/40 disabled:cursor-default",
                    ESTILO[estado],
                  )}
                >
                  {p.palabra}
                  {estado === "equivocada" && <X className="size-5 shrink-0" aria-hidden="true" strokeWidth={3} />}
                  {estado === "encontrada" && <Check className="size-5 shrink-0" aria-hidden="true" strokeWidth={3} />}
                  {estado === "omitida" && <Search className="size-5 shrink-0" aria-hidden="true" strokeWidth={3} />}
                </motion.button>
                {p.despues && <span aria-hidden="true" className="-ml-1">{p.despues}</span>}
              </span>
              {conEtiqueta && (
                <motion.span
                  aria-hidden="true"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...RESORTE, delay: 0.1 }}
                  className={cn(
                    "mt-1 whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-bold",
                    estado === "encontrada" ? "bg-menta-fuerte text-white" : "bg-sol-fuerte text-white",
                  )}
                >
                  {p.palabra} → {correccion}
                </motion.span>
              )}
            </span>
          )
        })}
      </motion.div>

      {corregida ? (
        <Resumen puntaje={puntaje} />
      ) : (
        <p className="text-center text-lg font-semibold text-muted-foreground" role="status">
          {marcados.length === 0
            ? "Tocá las palabras mal escritas."
            : `Marcaste ${marcados.length} ${marcados.length === 1 ? "palabra" : "palabras"}.`}
        </p>
      )}

      {r.puedeResponder && (
        <button
          type="button"
          onClick={listo}
          className="inline-flex min-h-14 items-center gap-2 rounded-full bg-menta-fuerte px-8 text-lg font-bold text-white shadow-boton outline-none transition-[filter] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-menta/50"
        >
          <Check className="size-6" aria-hidden="true" strokeWidth={3} />
          Listo
        </button>
      )}
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}

/** Qué encontró, qué le faltó y qué marcó de más, con color e ícono. */
function Resumen({ puntaje }: { puntaje: PuntajeSeleccion }) {
  const filas = [
    { n: puntaje.encontrados, texto: puntaje.encontrados === 1 ? "encontrada" : "encontradas", clase: "bg-menta-suave text-menta-fuerte", Icono: Check },
    { n: puntaje.omitidos, texto: puntaje.omitidos === 1 ? "sin encontrar" : "sin encontrar", clase: "bg-sol-suave text-sol-fuerte", Icono: Search },
    { n: puntaje.equivocados, texto: puntaje.equivocados === 1 ? "estaba bien escrita" : "estaban bien escritas", clase: "bg-rojo-suave text-rojo-fuerte", Icono: X },
  ].filter((f) => f.n > 0)
  return (
    <ul role="status" className="flex flex-wrap justify-center gap-2">
      {filas.map(({ n, texto, clase, Icono }) => (
        <li key={texto} className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-bold", clase)}>
          <Icono className="size-5" aria-hidden="true" strokeWidth={3} />
          {n} {texto}
        </li>
      ))}
    </ul>
  )
}
