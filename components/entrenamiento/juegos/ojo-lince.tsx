"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Dibujo, Emoji } from "@/components/entrenamiento/dibujo"
import {
  ANIMACION_SELECCION,
  BotonFinalizar,
  ESTILO_TARJETA,
  InsigniaSeleccion,
  ResumenSeleccion,
  estadoSeleccion,
  type TextosResumen,
} from "@/components/entrenamiento/seleccion"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { LETRAS_ESPEJO, NOMBRE_LETRA, type CategoriaOjo, type ItemOjoLince } from "@/lib/entrenamiento/ojo-lince"
import { puntajeSeleccion, resultadoSeleccion, seleccionPerfecta, type PuntajeSeleccion } from "@/lib/entrenamiento/seleccion"
import { COLORES_ESTIMULO, type ColorEstimulo } from "@/lib/test/denominacion-config"
import { cn } from "@/lib/utils"

const TEXTOS_RESUMEN: TextosResumen = {
  encontrados: ["encontrado", "encontrados"],
  omitidos: ["sin encontrar", "sin encontrar"],
  equivocados: ["era distinto", "eran distintos"],
}

/**
 * Ojo de lince (inicial: complementario de denominación rápida; primario:
 * de correspondencia sonido-letra). Arriba la muestra; abajo una
 * cuadrícula completa en la que el niño marca todos los iguales y toca
 * "Finalizar". Sin reintento; el puntaje suma los de selección.
 *
 * Primario: Lumo dice la letra ("Escuchar", sin límite); en el grado 1 la
 * letra también se ve. Las letras van siempre en minúscula (el switch "A a"
 * no las cambia: las letras espejo solo existen en minúscula), y d, p y q
 * se dibujan con la misma b reflejada, así son espejos reales en cualquier
 * tipografía.
 */
export function OjoLince({ items, onRonda }: PropsJuego<ItemOjoLince>) {
  const selecciones = useRef<{ marcados: number[]; puntaje: PuntajeSeleccion }[]>([])
  const r = useRondas(items, onRonda, { completar: (res) => resultadoSeleccion(res, selecciones.current) })
  if (!r.item) return null
  const ronda = r.estado.actual
  return (
    <RondaOjo
      key={ronda}
      item={r.item}
      ronda={r}
      onCorregir={(marcados, puntaje) => {
        selecciones.current[ronda] = { marcados, puntaje }
      }}
    />
  )
}

function RondaOjo({
  item,
  ronda: r,
  onCorregir,
}: {
  item: ItemOjoLince
  ronda: ReturnType<typeof useRondas<ItemOjoLince>>
  onCorregir: (marcados: number[], puntaje: PuntajeSeleccion) => void
}) {
  const [marcados, setMarcados] = useState<number[]>([])
  const [puntaje, setPuntaje] = useState<PuntajeSeleccion | null>(null)
  const corregida = puntaje !== null
  const esLetra = item.categoria === "letras"

  const alternar = (i: number) => {
    if (!r.puedeResponder) return
    setMarcados((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]))
  }

  const finalizar = () => {
    if (!r.puedeResponder) return
    const p = puntajeSeleccion({ objetivos: item.objetivos, marcados })
    setPuntaje(p)
    onCorregir(marcados, p)
    r.resolver(seleccionPerfecta(p))
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-6">
      <Muestra item={item} />

      {/* Cuadrícula completa: las celdas se achican, pero cada una mide al menos 44 px. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={RESORTE}
        className={cn("@container w-full", esLetra && "-mx-3 w-[calc(100%+1.5rem)] sm:mx-0 sm:w-full")}
      >
        <div
          role="group"
          aria-label={`Cuadrícula de ${item.filas} filas y ${item.columnas} columnas`}
          className={cn("mx-auto grid justify-center", item.columnas >= 7 ? "gap-0.5 sm:gap-1.5" : "gap-1.5 sm:gap-3")}
          style={{
            gridTemplateColumns: `repeat(${item.columnas}, minmax(2.75rem, ${esLetra ? "4.5rem" : "6.5rem"}))`,
            fontSize: `min(${60 / item.columnas}cqw, ${esLetra ? "2.5rem" : "3rem"})`,
          }}
        >
          {item.celdas.map((valor, i) => {
            const estado = estadoSeleccion(item.objetivos.includes(i), marcados.includes(i), corregida)
            const nombre = nombreCelda(item.categoria, valor)
            const sufijo = estado === "encontrada" ? ", encontrado" : estado === "omitida" ? ", te faltó" : estado === "equivocada" ? ", era distinto" : ""
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => alternar(i)}
                disabled={!r.puedeResponder}
                aria-pressed={corregida ? undefined : marcados.includes(i)}
                aria-label={`${nombre}${sufijo}`}
                animate={ANIMACION_SELECCION[estado]}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "relative grid aspect-square min-h-11 min-w-11 place-items-center rounded-2xl border-[3px] shadow-suave outline-none transition-[background-color,border-color,box-shadow] duration-200",
                  "focus-visible:ring-4 focus-visible:ring-ring/50 disabled:cursor-default",
                  ESTILO_TARJETA[estado],
                )}
              >
                <Contenido categoria={item.categoria} valor={valor} />
                <InsigniaSeleccion estado={estado} />
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {corregida ? (
        <ResumenSeleccion puntaje={puntaje} textos={TEXTOS_RESUMEN} />
      ) : (
        <p role="status" className="text-center text-lg font-semibold text-muted-foreground">
          {marcados.length === 0 ? "Tocá todos los iguales." : `Marcaste ${marcados.length}.`}
        </p>
      )}

      {r.puedeResponder && <BotonFinalizar onClick={finalizar} />}
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}

function nombreCelda(categoria: CategoriaOjo, valor: string): string {
  if (categoria === "letras") return `letra ${NOMBRE_LETRA[valor]}`
  if (categoria === "vocales") return `letra ${valor.toLowerCase()}`
  return valor
}

/** La muestra: en inicial, el elemento grande; en primario, el audio (y en el grado 1, la letra). */
function Muestra({ item }: { item: ItemOjoLince }) {
  const esLetra = item.categoria === "letras"
  return (
    <div className="flex flex-col items-center gap-3 rounded-[2rem] border-[3px] border-white bg-gradient-to-b from-celeste-suave to-white px-6 py-4 text-center shadow-media sm:flex-row sm:gap-5 sm:px-8">
      <span aria-hidden="true" className="hidden sm:block">
        <Emoji char="🔍" className="size-12" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-bold text-foreground sm:text-xl">
          {esLetra ? "¿Qué letra dice Lumo?" : "Buscá todos los que son así"}
        </p>
        <div className="flex items-center gap-3">
          {item.muestraVisible && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={RESORTE}
              className="grid size-20 place-items-center rounded-2xl border-[3px] border-celeste-fuerte/40 bg-white text-5xl font-bold shadow-suave sm:size-24 sm:text-6xl"
            >
              <span className="sr-only">La muestra: {nombreCelda(item.categoria, item.objetivo)}</span>
              <span aria-hidden="true" className="grid size-full place-items-center p-2">
                <Contenido categoria={item.categoria} valor={item.objetivo} />
              </span>
            </motion.span>
          )}
          {esLetra && (
            <BotonEscuchar
              texto={item.nombre}
              tamano={item.muestraVisible ? "chico" : "grande"}
              velocidad={0.8}
              etiquetaAccesible="Escuchar la letra"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * d, p y q son la b reflejada: espejos reales en cualquier tipografía. El
 * reflejo vertical gira alrededor de la mitad de la altura de la x (no del
 * renglón), así la panza de las cuatro queda a la misma altura, como en un
 * texto: la b sube y la p baja.
 */
const REFLEJO: Record<string, string> = { d: "scaleX(-1)", p: "scaleY(-1)", q: "scale(-1, -1)" }
const EJE_X = "50% 0.55em"

function Contenido({ categoria, valor }: { categoria: CategoriaOjo; valor: string }) {
  if (categoria === "colores") {
    return (
      <span
        aria-hidden="true"
        className="block size-3/4 rounded-full border-[3px] border-white shadow-media"
        style={{ backgroundColor: COLORES_ESTIMULO[valor as ColorEstimulo] }}
      />
    )
  }
  if (categoria === "dibujos") return <Dibujo palabra={valor} decorativo className="size-4/5" />
  if (categoria === "vocales") {
    return (
      <span aria-hidden="true" className="font-bold leading-none text-foreground">
        {valor}
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      // Siempre en minúscula: el switch "A a" no cambia las letras de este juego.
      className="inline-block font-bold normal-case leading-none text-foreground"
      style={{ transform: REFLEJO[valor], transformOrigin: EJE_X }}
    >
      {LETRAS_ESPEJO.includes(valor) ? "b" : valor}
    </span>
  )
}
