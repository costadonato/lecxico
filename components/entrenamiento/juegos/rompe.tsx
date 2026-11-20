"use client"

import { useRef, useState } from "react"
import { LayoutGroup, motion, type PanInfo } from "motion/react"
import { Check, Eraser } from "lucide-react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Dibujo } from "@/components/entrenamiento/dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { mezclar, type ItemRompe } from "@/lib/entrenamiento/bancos"
import { cn } from "@/lib/utils"

interface Ficha {
  /** Las sílabas repetidas (HI-PO-PO-TA-MO) son fichas distintas: se identifican por índice. */
  indice: number
  texto: string
}

/**
 * Rompe y une (conciencia silábica, primario). Arriba, el dibujo y
 * "Escuchar" (sin límite); la palabra no se muestra escrita. Abajo, un
 * casillero por sílaba y una bandeja con las sílabas correctas y las de
 * relleno, mezcladas.
 *
 * Dos formas de jugar (WCAG 2.5.7):
 *   - Toque (la principal): una ficha de la bandeja va al primer casillero
 *     libre; una ficha puesta vuelve a la bandeja. Con teclado, Enter o
 *     Espacio sobre la ficha hacen lo mismo.
 *   - Arrastre (mouse y touch, con `drag` de Motion): una ficha va al
 *     casillero donde se suelta; si estaba ocupado, la que estaba vuelve a
 *     la bandeja. Soltada fuera de un casillero, vuelve a su lugar.
 * Las fichas se mueven con una animación compartida (layoutId). "Listo"
 * compara el orden de los textos con el reintento de rondas.ts.
 */
export function Rompe({ items, onRonda }: PropsJuego<ItemRompe>) {
  const r = useRondas(items, onRonda)
  if (!r.item) return null
  return <RondaRompe key={r.estado.actual} item={r.item} ronda={r} />
}

function RondaRompe({ item, ronda: r }: { item: ItemRompe; ronda: ReturnType<typeof useRondas<ItemRompe>> }) {
  const [fichas] = useState<Ficha[]>(() => mezclar([...item.silabas, ...item.relleno]).map((texto, indice) => ({ indice, texto })))
  const [casilleros, setCasilleros] = useState<(number | null)[]>(() => item.silabas.map(() => null))
  const [sacudir, setSacudir] = useState(0)
  const idGrupo = useRef(`rompe-${item.id}`).current

  const fase = r.estado.fase
  const mostrarRespuesta = fase === "respuesta"
  const acerto = fase === "acierto"
  const llenos = casilleros.every((c) => c !== null)
  const puestaEn = (indice: number) => casilleros.indexOf(indice)

  /** Toque o teclado: de la bandeja al primer casillero libre, o del casillero a la bandeja. */
  const tocar = (indice: number) => {
    if (!r.puedeResponder) return
    setCasilleros((cs) => {
      const donde = cs.indexOf(indice)
      if (donde !== -1) return cs.map((c, i) => (i === donde ? null : c))
      const libre = cs.indexOf(null)
      return libre === -1 ? cs : cs.map((c, i) => (i === libre ? indice : c))
    })
  }

  /** Arrastre: la ficha va al casillero `destino`; la que estaba ahí vuelve a la bandeja. */
  const soltarEn = (indice: number, destino: number) => {
    if (!r.puedeResponder) return
    setCasilleros((cs) => cs.map((c, i) => (i === destino ? indice : c === indice ? null : c)))
  }

  const listo = () => {
    if (!r.puedeResponder || !llenos) return
    const correcta = casilleros.every((c, i) => fichas[c!].texto === item.silabas[i])
    r.responder(correcta)
    if (!correcta) {
      setSacudir((s) => s + 1)
      setCasilleros(item.silabas.map(() => null))
    }
  }

  const n = item.silabas.length

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-7">
      <div className="flex items-center gap-4 rounded-[2rem] border-[3px] border-mandarina/50 bg-mandarina-suave px-5 py-4 shadow-suave sm:gap-6 sm:px-8">
        <Dibujo palabra={item.palabra} decorativo className="size-24 sm:size-32" />
        <BotonEscuchar texto={item.palabra} tamano="chico" etiquetaAccesible="Escuchar la palabra" />
      </div>

      <LayoutGroup id={idGrupo}>
        {/* Casilleros */}
        <motion.ol
          key={sacudir}
          animate={sacudir > 0 ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
          transition={{ duration: 0.45, ease: "easeOut" }}
          aria-label={`La palabra, en ${n} casilleros`}
          className="grid w-full justify-center gap-1.5 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 5.5rem))` }}
        >
          {casilleros.map((indice, i) => {
            const ficha = indice === null ? null : fichas[indice]
            const textoRespuesta = mostrarRespuesta ? item.silabas[i] : null
            return (
              <li
                key={i}
                data-casillero={i}
                aria-label={
                  textoRespuesta
                    ? `Casillero ${i + 1}: ${textoRespuesta}`
                    : ficha
                      ? undefined
                      : `Casillero ${i + 1}, vacío`
                }
                className={cn(
                  "relative flex h-14 min-w-0 items-center justify-center rounded-2xl border-[3px] border-dashed transition-colors sm:h-16",
                  textoRespuesta || acerto ? "border-menta bg-menta-suave" : "border-mandarina bg-mandarina-suave/60",
                )}
              >
                {textoRespuesta ? (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...RESORTE, delay: i * 0.08 }}
                    className="grid size-full place-items-center rounded-xl bg-menta-fuerte text-lg font-bold text-white sm:text-2xl"
                  >
                    {textoRespuesta}
                  </motion.span>
                ) : ficha ? (
                  <FichaSilaba
                    ficha={ficha}
                    etiqueta={`${ficha.texto}, en el casillero ${i + 1}`}
                    enCasillero
                    verde={acerto}
                    deshabilitada={!r.puedeResponder}
                    onTocar={() => tocar(ficha.indice)}
                    onSoltar={(destino) => soltarEn(ficha.indice, destino)}
                  />
                ) : (
                  <span aria-hidden="true" className="text-xl font-bold text-mandarina-fuerte/40">
                    {i + 1}
                  </span>
                )}
              </li>
            )
          })}
        </motion.ol>

        {/* Bandeja: cada ficha conserva su lugar (queda un hueco cuando está puesta). */}
        {!mostrarRespuesta && (
          <ul aria-label="Sílabas" className="flex w-full max-w-xl flex-wrap justify-center gap-2 sm:gap-3">
            {fichas.map((ficha) => (
              <li key={ficha.indice} className="h-14 min-w-[3.25rem] sm:h-16 sm:min-w-16">
                {puestaEn(ficha.indice) === -1 ? (
                  <FichaSilaba
                    ficha={ficha}
                    etiqueta={ficha.texto}
                    deshabilitada={!r.puedeResponder}
                    onTocar={() => tocar(ficha.indice)}
                    onSoltar={(destino) => soltarEn(ficha.indice, destino)}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="block size-full rounded-2xl border-2 border-dashed border-border/80 bg-muted/40"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </LayoutGroup>

      <p role="status" className="min-h-7 text-center text-lg font-semibold text-muted-foreground">
        {mostrarRespuesta
          ? "Así se arma la palabra."
          : acerto
            ? "¡Armaste la palabra!"
            : llenos
              ? "Tocá «Listo»."
              : "Tocá las sílabas en orden."}
      </p>

      {r.puedeResponder && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCasilleros(item.silabas.map(() => null))}
            disabled={casilleros.every((c) => c === null)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-border bg-card px-5 text-base font-bold text-foreground shadow-suave outline-none transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-50"
          >
            <Eraser className="size-5" aria-hidden="true" />
            Borrar
          </button>
          <button
            type="button"
            onClick={listo}
            disabled={!llenos}
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

/** El casillero que está debajo del puntero al soltar (o null). */
function casilleroBajo(info: PanInfo): number | null {
  const x = info.point.x - window.scrollX
  const y = info.point.y - window.scrollY
  for (const el of document.elementsFromPoint(x, y)) {
    const valor = (el as HTMLElement).dataset?.casillero
    if (valor !== undefined) return Number(valor)
  }
  return null
}

/**
 * Una ficha con su sílaba: un botón grande (al menos 44 px) que se toca o
 * se arrastra. Sigue el switch "A a" (data-letra del área de juego).
 */
function FichaSilaba({
  ficha,
  etiqueta,
  enCasillero = false,
  verde = false,
  deshabilitada,
  onTocar,
  onSoltar,
}: {
  ficha: Ficha
  etiqueta: string
  enCasillero?: boolean
  verde?: boolean
  deshabilitada: boolean
  onTocar: () => void
  onSoltar: (casillero: number) => void
}) {
  // Un arrastre termina con un click: ese click no cuenta como toque.
  const arrastro = useRef(false)

  return (
    <motion.button
      type="button"
      layoutId={`ficha-${ficha.indice}`}
      transition={RESORTE}
      aria-label={etiqueta}
      disabled={deshabilitada}
      drag={!deshabilitada}
      dragSnapToOrigin
      dragElastic={0.9}
      dragMomentum={false}
      whileDrag={{ scale: 1.12, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      onDragStart={() => {
        arrastro.current = true
      }}
      onDragEnd={(_, info) => {
        const destino = casilleroBajo(info)
        if (destino !== null) onSoltar(destino)
        setTimeout(() => {
          arrastro.current = false
        }, 0)
      }}
      onClick={() => {
        if (arrastro.current) return
        onTocar()
      }}
      className={cn(
        "relative z-10 grid size-full touch-none select-none place-items-center rounded-2xl border-2 px-1.5 text-xl font-bold shadow-media outline-none sm:px-2 sm:text-2xl",
        "cursor-grab active:cursor-grabbing focus-visible:ring-4 focus-visible:ring-mandarina/50 disabled:cursor-default",
        verde
          ? "border-white bg-menta-fuerte text-white"
          : enCasillero
            ? "border-white bg-mandarina-fuerte text-white"
            : "border-mandarina/40 bg-card text-mandarina-fuerte hover:bg-mandarina-suave",
      )}
    >
      {ficha.texto}
    </motion.button>
  )
}
