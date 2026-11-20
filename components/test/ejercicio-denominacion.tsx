"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react"
import { Info, Play, RotateCcw, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dibujo } from "@/components/entrenamiento/dibujo"
import type { LetraEntrenamiento } from "@/lib/entrenamiento/partidas"
import {
  COLORES_ESTIMULO,
  buscarEstimulo,
  type ColorEstimulo,
  type ConfigDenominacion,
  type EjercicioDenominacion as Ejercicio,
} from "@/lib/test/denominacion-config"
import { resultadoEjercicio, type ResultadoEjercicio } from "@/lib/test/denominacion"
import { cn } from "@/lib/utils"

type Fase = "practica" | "preparado" | "en-curso" | "errores"

/** "Terminar" no responde antes de este tiempo: evita terminar por un doble clic en "Comenzar". */
const TIEMPO_MINIMO_MS = 1000

/**
 * Un ejercicio (una cuadrícula) del bloque Denominación Rápida. Lo maneja el
 * profesional, en la misma tarjeta:
 * 1. Práctica (solo en el primer ejercicio del bloque): fila con un
 *    estímulo de cada categoría. Es el único momento en que se corrige.
 * 2. Preparado: consigna para leer y cuadrícula tapada. "Comenzar" la
 *    muestra y empieza a medir (performance.now()).
 * 3. En curso: solo la cuadrícula y "Terminar". No se muestra ningún tiempo.
 * 4. Errores: el profesional carga la cantidad de errores. "Repetir
 *    ejercicio" descarta el tiempo; "Confirmar" entrega el resultado.
 *
 * Teclado: al cambiar de fase el foco va al contenedor de la fase (no a un
 * botón), así Enter o la barra espaciadora no comienzan ni terminan nada por
 * accidente; los botones se alcanzan con Tab.
 *
 * Lo reusa Nombrá rápido (entrenamiento, S13b) con `letra`: las letras de
 * la cuadrícula siguen el switch "A a" en lugar de ir siempre en mayúscula.
 * Sin `letra` (la evaluación), todo queda como antes.
 */
export function EjercicioDenominacion({
  config,
  ejercicio,
  numero,
  cantidad,
  conPractica,
  onConfirmar,
  letra,
}: {
  config: ConfigDenominacion
  ejercicio: Ejercicio
  /** Posición del ejercicio en el bloque (1-based). */
  numero: number
  /** Cantidad de ejercicios del bloque. */
  cantidad: number
  /** Mostrar la práctica antes de la cuadrícula (solo el primer ejercicio). */
  conPractica: boolean
  onConfirmar: (resultado: ResultadoEjercicio) => void
  /** Solo el entrenamiento: las letras siguen el switch "A a". Sin letra, van en mayúscula. */
  letra?: LetraEntrenamiento
}) {
  const [fase, setFase] = useState<Fase>(conPractica ? "practica" : "preparado")
  const [tiempoMs, setTiempoMs] = useState<number | null>(null)
  const [errores, setErrores] = useState("")
  const inicio = useRef(0)
  const refFase = useRef<HTMLDivElement>(null)
  const refErrores = useRef<HTMLInputElement>(null)

  const total = ejercicio.secuencia.length
  const textos = config.textos

  // En cada fase el foco va al contenedor (o al campo de errores), nunca a
  // un botón: así una tecla mantenida no dispara la fase siguiente. Al
  // comenzar, la cuadrícula se lleva al borde superior para que se vea entera.
  useEffect(() => {
    if (fase === "errores") refErrores.current?.focus({ preventScroll: true })
    else refFase.current?.focus({ preventScroll: true })
    if (fase === "en-curso") refFase.current?.scrollIntoView({ block: "start" })
  }, [fase])

  const comenzar = () => {
    inicio.current = performance.now()
    setTiempoMs(null)
    setFase("en-curso")
  }

  const terminar = () => {
    const transcurrido = performance.now() - inicio.current
    if (transcurrido < TIEMPO_MINIMO_MS) return
    setTiempoMs(transcurrido)
    setErrores("")
    setFase("errores")
  }

  const repetir = () => {
    setTiempoMs(null)
    setErrores("")
    setFase("preparado")
  }

  const erroresValidos = /^\d+$/.test(errores) && Number(errores) <= total
  const confirmar = (e: FormEvent) => {
    e.preventDefault()
    if (!erroresValidos || tiempoMs === null) return
    onConfirmar(resultadoEjercicio({ ejercicio: ejercicio.id, tiempoMs, errores: Number(errores), total }))
  }

  /** Durante la cuadrícula, la barra espaciadora no desplaza la página. */
  const evitarEspacio = (e: KeyboardEvent) => {
    if (e.key === " ") e.preventDefault()
  }

  const titulo = (
    <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">
      {fase === "practica" ? "Práctica" : `${ejercicio.nombre} de ${cantidad}`}
    </p>
  )

  return (
    <div
      ref={refFase}
      tabIndex={-1}
      onKeyDown={fase === "en-curso" ? evitarEspacio : undefined}
      className="flex flex-1 scroll-mt-24 flex-col outline-none"
      aria-label={fase === "en-curso" ? `Cuadrícula ${numero} en curso` : undefined}
    >
      {fase === "practica" && (
        <>
          {titulo}
          <TextoParaLeer>{textos.practica}</TextoParaLeer>
          <Cuadricula config={config} valores={config.practica} columnas={config.practica.length} letra={letra} className="mx-auto my-6 max-w-xs" />
          <NotaProfesional>{textos.notaPractica}</NotaProfesional>
          <div className="mt-auto flex justify-end pt-6">
            <Button size="lg" onClick={() => setFase("preparado")}>
              Listo, pasar a la cuadrícula
            </Button>
          </div>
        </>
      )}

      {fase === "preparado" && (
        <>
          {titulo}
          <TextoParaLeer>{textos.consigna}</TextoParaLeer>
          <Cuadricula config={config} valores={ejercicio.secuencia} columnas={ejercicio.columnas} letra={letra} tapada className="my-6" />
          <div className="mt-auto flex justify-end">
            <Button size="lg" onClick={comenzar}>
              <Play /> Comenzar
            </Button>
          </div>
        </>
      )}

      {fase === "en-curso" && (
        <>
          <Cuadricula config={config} valores={ejercicio.secuencia} columnas={ejercicio.columnas} letra={letra} className="mb-6" />
          <div className="mt-auto flex justify-end">
            <Button variant="outline" onClick={terminar}>
              <Square /> Terminar
            </Button>
          </div>
        </>
      )}

      {fase === "errores" && (
        <form onSubmit={confirmar} className="flex flex-1 flex-col" noValidate>
          {titulo}
          <h2 className="text-balance text-center text-xl font-bold text-foreground sm:text-2xl">
            ¿Cuántos errores contaste?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-base text-muted-foreground">{textos.criterioError}</p>

          <div className="mx-auto mt-6 w-full max-w-xs space-y-2">
            <Label htmlFor={`errores-${ejercicio.id}`} className="text-base">
              Cantidad de errores (de 0 a {total})
            </Label>
            <Input
              id={`errores-${ejercicio.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={total}
              step={1}
              autoComplete="off"
              ref={refErrores}
              value={errores}
              onChange={(e) => setErrores(e.target.value.trim())}
              aria-invalid={errores !== "" && !erroresValidos}
              aria-describedby={`errores-ayuda-${ejercicio.id}`}
              className="text-center text-2xl font-bold tabular-nums"
            />
            <p
              id={`errores-ayuda-${ejercicio.id}`}
              className={cn("text-sm", errores !== "" && !erroresValidos ? "text-destructive" : "text-muted-foreground")}
            >
              {errores !== "" && !erroresValidos
                ? `Escribí un número entero entre 0 y ${total}.`
                : "Si no hubo errores, escribí 0."}
            </p>
          </div>

          <div className="mt-auto flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={repetir}>
              <RotateCcw /> Repetir ejercicio
            </Button>
            <Button type="submit" size="lg" disabled={!erroresValidos}>
              Confirmar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

/**
 * Cuadrícula de estímulos. Letras y números en mayúscula y grandes (con
 * `letra`, las letras siguen el switch "A a"); los colores, cuadrados
 * llenos del mismo tamaño que el texto, sin palabras (el nombre del color va
 * solo en el aria-label); los dibujos (solo el entrenamiento), con
 * <Dibujo> y su nombre en el aria-label. El tamaño de letra depende del
 * ancho disponible (unidades cqw), así en celular las celdas se achican y no
 * hay desplazamiento horizontal. `tapada` muestra celdas vacías.
 */
function Cuadricula({
  config,
  valores,
  columnas,
  tapada = false,
  letra,
  className,
}: {
  config: ConfigDenominacion
  valores: readonly string[]
  columnas: number
  tapada?: boolean
  letra?: LetraEntrenamiento
  className?: string
}) {
  const filas = Math.ceil(valores.length / columnas)
  return (
    <div className={cn("@container w-full", className)}>
      <div
        role={tapada ? undefined : "group"}
        aria-hidden={tapada || undefined}
        aria-label={tapada ? undefined : `Cuadrícula de ${filas} ${filas === 1 ? "fila" : "filas"} y ${columnas} columnas`}
        className="grid select-none gap-y-[0.25em] font-bold leading-none text-foreground"
        style={{
          gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
          fontSize: `min(${64 / columnas}cqw, 2.75rem)`,
        }}
      >
        {valores.map((valor, i) => {
          const estimulo = buscarEstimulo(config, valor)
          return (
            <div key={i} className="flex h-[1.3em] items-center justify-center">
              {tapada ? (
                <span className="block size-[0.8em] rounded-[0.15em] bg-muted-foreground/15" />
              ) : estimulo?.categoria === "color" ? (
                <span
                  role="img"
                  aria-label={`color ${estimulo.nombre}`}
                  className="block size-[0.8em] rounded-[0.15em] border border-foreground/40"
                  style={{ backgroundColor: COLORES_ESTIMULO[valor as ColorEstimulo] }}
                />
              ) : estimulo?.categoria === "dibujo" ? (
                <span role="img" aria-label={estimulo.nombre} className="block size-[1.15em]">
                  <Dibujo palabra={valor} decorativo className="size-full" />
                </span>
              ) : (
                <span className={letra === "minuscula" ? "lowercase" : "uppercase"}>{valor}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Texto que el profesional lee en voz alta. */
function TextoParaLeer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/70 bg-muted px-5 py-4 text-center">
      <p className="text-sm font-semibold text-muted-foreground">Leé en voz alta:</p>
      <p className="mt-1 text-balance text-lg font-semibold text-foreground sm:text-xl">“{children}”</p>
    </div>
  )
}

/** Indicación para el profesional (no se lee al niño). */
function NotaProfesional({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto flex max-w-xl items-start gap-2 text-left text-base text-muted-foreground">
      <Info className="mt-1 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
