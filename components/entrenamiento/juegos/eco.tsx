"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { Check, Delete } from "lucide-react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import type { ItemEco } from "@/lib/entrenamiento/bancos"
import {
  ABECEDARIO,
  LETRAS_DE_MAS,
  QWERTY,
  detalleEco,
  esLetraDelTeclado,
  escritaIgual,
  letrasQueCambian,
  suenaIgual,
} from "@/lib/entrenamiento/eco"
import { cn } from "@/lib/utils"

/** Reproducciones por palabra: 2 + 1 por la regla de los audios con límite. */
const MAX_ESCUCHAR = 3

type Distribucion = "qwerty" | "abc"
const CLAVE_DISTRIBUCION = "lecxico.teclado-eco"

/**
 * La distribución del teclado, recordada en el dispositivo. No es un dato
 * del niño: es una preferencia del aparato (como el volumen). Si el
 * almacenamiento no está disponible, queda QWERTY.
 */
function useDistribucion(): [Distribucion, (d: Distribucion) => void] {
  const [distribucion, setDistribucion] = useState<Distribucion>("qwerty")
  useEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE_DISTRIBUCION) === "abc") setDistribucion("abc")
    } catch {
      // Sin almacenamiento: QWERTY.
    }
  }, [])
  const cambiar = useCallback((d: Distribucion) => {
    setDistribucion(d)
    try {
      window.localStorage.setItem(CLAVE_DISTRIBUCION, d)
    } catch {
      // No se pudo recordar: vale solo para esta pantalla.
    }
  }, [])
  return [distribucion, cambiar]
}

/**
 * Eco de palabras (correspondencia sonido-letra, primario). El niño
 * escucha una palabra (3 reproducciones) y la escribe con el teclado en
 * pantalla (QWERTY español o alfabético) o con el teclado físico. La
 * palabra no se muestra hasta corregir.
 *
 * Corrección fonológica (lib/entrenamiento/eco.ts): cuenta como bien lo que
 * suena igual (bentana, kamiza); reintento de rondas.ts. Siempre se muestra
 * cómo se escribe. El detalle guarda lo que escribió en cada intento.
 */
export function Eco({ items, onRonda }: PropsJuego<ItemEco>) {
  const escritos = useRef<string[][]>([])
  const r = useRondas(items, onRonda, {
    completar: (res) => ({ ...res, detalle: detalleEco(res.detalle, escritos.current) }),
  })
  const [distribucion, setDistribucion] = useDistribucion()
  if (!r.item) return null
  return (
    <RondaEco
      key={r.estado.actual}
      item={r.item}
      ronda={r}
      distribucion={distribucion}
      onDistribucion={setDistribucion}
      onIntento={(texto) => {
        const i = r.estado.actual
        escritos.current[i] = [...(escritos.current[i] ?? []), texto]
      }}
    />
  )
}

function RondaEco({
  item,
  ronda: r,
  distribucion,
  onDistribucion,
  onIntento,
}: {
  item: ItemEco
  ronda: ReturnType<typeof useRondas<ItemEco>>
  distribucion: Distribucion
  onDistribucion: (d: Distribucion) => void
  onIntento: (texto: string) => void
}) {
  const [texto, setTexto] = useState("")
  /** Lo que escribió en el último intento corregido. */
  const [ultimo, setUltimo] = useState("")
  const [usadas, setUsadas] = useState(0)
  const [extra, setExtra] = useState(0)
  const [sacudir, setSacudir] = useState(0)
  const max = item.palabra.length + LETRAS_DE_MAS
  const fase = r.estado.fase
  const puede = r.puedeResponder

  const escribir = useCallback(
    (letra: string) => {
      if (!puede) return
      setTexto((t) => (t.length >= max ? t : t + letra.toLowerCase()))
    },
    [puede, max],
  )
  const borrar = useCallback(() => {
    if (puede) setTexto((t) => t.slice(0, -1))
  }, [puede])
  const listo = useCallback(() => {
    if (!puede || !texto) return
    const enPrimerIntento = fase === "esperando"
    const correcta = suenaIgual(texto, item.palabra)
    onIntento(texto)
    setUltimo(texto)
    r.responder(correcta)
    if (!correcta && enPrimerIntento) {
      // Reintento: se borra lo escrito y, si no le quedan reproducciones, se le suma una.
      setTexto("")
      setSacudir((s) => s + 1)
      if (usadas >= MAX_ESCUCHAR + extra) setExtra((e) => e + 1)
    }
  }, [puede, texto, fase, item.palabra, onIntento, r, usadas, extra])

  // Teclado físico: letras, Retroceso y Enter ("Listo").
  const acciones = useRef({ escribir, borrar, listo })
  acciones.current = { escribir, borrar, listo }
  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const destino = e.target as HTMLElement | null
      if (destino?.closest?.("[role=dialog], [role=alertdialog], input, textarea")) return
      if (e.key === "Enter") {
        // Enter sobre un botón hace lo de ese botón.
        if (destino?.closest?.("button")) return
        e.preventDefault()
        acciones.current.listo()
      } else if (e.key === "Backspace") {
        e.preventDefault()
        acciones.current.borrar()
      } else if (esLetraDelTeclado(e.key)) {
        e.preventDefault()
        acciones.current.escribir(e.key)
      }
    }
    window.addEventListener("keydown", alTecla)
    return () => window.removeEventListener("keydown", alTecla)
  }, [])

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-5 outline-none sm:gap-6">
      <BotonEscuchar
        texto={item.palabra}
        max={MAX_ESCUCHAR + extra}
        onReproducir={() => setUsadas((u) => u + 1)}
        deshabilitado={!puede}
        etiqueta="Escuchar"
        etiquetaAccesible={`Escuchar la palabra (${Math.max(0, MAX_ESCUCHAR + extra - usadas)})`}
      />

      {fase === "acierto" || fase === "respuesta" ? (
        <ComoSeEscribe palabra={item.palabra} escrito={ultimo} acerto={fase === "acierto"} />
      ) : (
        <Renglon texto={texto} sacudir={sacudir} reintento={fase === "reintento"} />
      )}

      {puede && (
        <Teclado
          distribucion={distribucion}
          onDistribucion={onDistribucion}
          onLetra={escribir}
          onBorrar={borrar}
          onListo={listo}
          lleno={texto.length >= max}
          vacio={texto.length === 0}
        />
      )}
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}

/** El renglón con lo que va escribiendo, letra por letra, y un cursor que titila. */
function Renglon({ texto, sacudir, reintento }: { texto: string; sacudir: number; reintento: boolean }) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-2">
      <motion.div
        key={sacudir}
        animate={sacudir > 0 ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex min-h-20 w-full flex-wrap items-center justify-center rounded-[1.75rem] border-[3px] border-rojo/30 bg-white px-4 py-3 shadow-media sm:min-h-24"
      >
        {/* Lo que lee el lector de pantalla al cambiar. */}
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {texto ? `Escribiste: ${texto.split("").join(" ")}` : "Todavía no escribiste nada."}
        </p>
        <span aria-hidden="true" className="flex flex-wrap items-center justify-center">
          <AnimatePresence initial={false}>
            {texto.split("").map((letra, i) => (
              <motion.span
                key={`${i}-${letra}`}
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={RESORTE}
                className="text-4xl font-bold tracking-wide text-foreground sm:text-5xl"
              >
                {letra}
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.span
            className="ml-1 inline-block h-10 w-1 rounded-full bg-rojo sm:h-12"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
      <p className="min-h-6 text-center text-base font-semibold text-muted-foreground sm:text-lg">
        {reintento ? "Escuchala otra vez y probá de nuevo." : "Escribí la palabra que escuchaste."}
      </p>
    </div>
  )
}

/** Después de corregir: siempre se muestra cómo se escribe. */
function ComoSeEscribe({ palabra, escrito, acerto }: { palabra: string; escrito: string; acerto: boolean }) {
  const igual = acerto && escritaIgual(escrito, palabra)
  const cambia = acerto && !igual ? letrasQueCambian(escrito, palabra) : null
  const titulo = igual ? "¡Bien!" : acerto ? "¡Bien! Se escribe así:" : "Se escribe así:"
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={RESORTE}
      role="status"
      className={cn(
        "flex w-full max-w-xl flex-col items-center gap-2 rounded-[1.75rem] border-[3px] px-5 py-5 shadow-media",
        acerto ? "border-menta bg-menta-suave" : "border-sol/60 bg-sol-suave",
      )}
    >
      <p className={cn("text-lg font-bold sm:text-xl", acerto ? "text-menta-fuerte" : "text-sol-fuerte")}>{titulo}</p>
      <p className="text-4xl font-bold tracking-wide sm:text-5xl">
        <span className="sr-only">{palabra}</span>
        {[...palabra].map((letra, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              cambia?.[i] ? "rounded-md bg-sol px-0.5 text-foreground underline decoration-4 underline-offset-8" : acerto ? "text-menta-fuerte" : "text-foreground",
            )}
          >
            {letra}
          </span>
        ))}
      </p>
      {cambia?.some(Boolean) && (
        <p className="text-sm font-semibold text-muted-foreground">Las letras marcadas son las que cambian.</p>
      )}
    </motion.div>
  )
}

/**
 * Teclado en pantalla: 27 letras con la Ñ, en QWERTY español (por
 * defecto) o en orden alfabético, más "Borrar" y "Listo". Al cambiar de
 * distribución, las teclas se reacomodan con una animación de layout (con
 * reducir movimiento, un fundido) y lo escrito no se borra.
 *
 * Tamaño: en ABC, 7 teclas por fila de al menos 44 × 48 px también en
 * 375 px. En QWERTY, las filas de 10 no entran en 375 px con teclas de
 * 44 px de ancho: miden 48 px de alto y unos 30 px de ancho, con 4 px de
 * separación (cumple WCAG 2.5.8, 24 px); desde 480 px de ancho llegan a 44.
 */
function Teclado({
  distribucion,
  onDistribucion,
  onLetra,
  onBorrar,
  onListo,
  lleno,
  vacio,
}: {
  distribucion: Distribucion
  onDistribucion: (d: Distribucion) => void
  onLetra: (letra: string) => void
  onBorrar: () => void
  onListo: () => void
  lleno: boolean
  vacio: boolean
}) {
  const reducir = useReducedMotion()
  const filas: readonly (readonly string[])[] =
    distribucion === "qwerty" ? QWERTY : Array.from({ length: Math.ceil(ABECEDARIO.length / 7) }, (_, i) => ABECEDARIO.slice(i * 7, i * 7 + 7))

  return (
    <div className="-mx-4 flex w-[calc(100%+2rem)] max-w-2xl flex-col gap-2 rounded-[1.75rem] bg-rojo-suave/60 px-1 py-2 shadow-suave sm:mx-0 sm:w-full sm:p-3">
      <div role="group" aria-label="Distribución del teclado" className="flex justify-end gap-1 px-1 sm:px-0">
        {(["qwerty", "abc"] as const).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={distribucion === d}
            onClick={() => onDistribucion(d)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-rojo/40",
              distribucion === d ? "bg-rojo-fuerte text-white" : "bg-white text-rojo-fuerte hover:bg-rojo-suave",
            )}
          >
            {d === "qwerty" ? "QWERTY" : "ABC"}
          </button>
        ))}
      </div>

      <LayoutGroup>
        <motion.div
          key={reducir ? distribucion : "teclas"}
          initial={reducir ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          role="group"
          aria-label="Teclado"
          className="flex flex-col gap-1 sm:gap-1.5"
        >
          {filas.map((fila, f) => (
            <div key={f} className="flex justify-center gap-1 sm:gap-1.5">
              {fila.map((letra) => (
                <motion.button
                  key={letra}
                  layoutId={`tecla-${letra}`}
                  layout
                  transition={RESORTE}
                  type="button"
                  onClick={() => onLetra(letra)}
                  disabled={lleno}
                  whileTap={{ scale: 0.9 }}
                  // Todas las teclas del mismo ancho: una décima (QWERTY) o una séptima (ABC) de la fila.
                  style={{ width: distribucion === "qwerty" ? "calc((100% - 2.25rem) / 10)" : "calc((100% - 1.5rem) / 7)" }}
                  className={cn(
                    "grid min-h-12 min-w-0 shrink-0 place-items-center rounded-xl bg-white text-xl font-bold text-foreground shadow-suave outline-none transition-colors sm:min-h-14 sm:text-2xl",
                    distribucion === "abc" ? "max-w-16" : "max-w-14",
                    "hover:bg-rojo-suave focus-visible:ring-4 focus-visible:ring-rojo/40 disabled:opacity-50",
                  )}
                >
                  {letra}
                </motion.button>
              ))}
            </div>
          ))}
        </motion.div>
      </LayoutGroup>

      <div className="mt-1 grid grid-cols-2 gap-2 px-1 sm:px-0">
        <button
          type="button"
          onClick={onBorrar}
          disabled={vacio}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-5 text-base font-bold text-foreground shadow-suave outline-none transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-50"
        >
          <Delete className="size-5" aria-hidden="true" />
          Borrar
        </button>
        <button
          type="button"
          onClick={onListo}
          disabled={vacio}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-menta-fuerte px-6 text-base font-bold text-white shadow-boton outline-none transition-[filter] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-menta/50 disabled:opacity-50"
        >
          <Check className="size-5" aria-hidden="true" strokeWidth={3} />
          Listo
        </button>
      </div>
    </div>
  )
}
