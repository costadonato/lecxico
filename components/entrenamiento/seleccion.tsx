"use client"

import { motion } from "motion/react"
import { Check, Flag, Search, X } from "lucide-react"
import type { PuntajeSeleccion } from "@/lib/entrenamiento/seleccion"
import { cn } from "@/lib/utils"

/*
 * Piezas comunes de los juegos de selección (marcar varios y corregir al
 * final): Caza errores, Memopalabras, Ojo de lince y Lluvia. La corrección
 * se ve igual en todos: encontrados en verde, no encontrados en ámbar y
 * marcados por error en rojo con ícono (no depende solo del color).
 */

export type EstadoSeleccion = "normal" | "marcada" | "encontrada" | "omitida" | "equivocada"

/** Estado de un elemento: antes de corregir, marcado o no; después, según si era objetivo. */
export function estadoSeleccion(esObjetivo: boolean, marcada: boolean, corregida: boolean): EstadoSeleccion {
  if (!corregida) return marcada ? "marcada" : "normal"
  if (esObjetivo) return marcada ? "encontrada" : "omitida"
  return marcada ? "equivocada" : "normal"
}

/** Estilo de una tarjeta o celda seleccionable en cada estado. */
export const ESTILO_TARJETA: Record<EstadoSeleccion, string> = {
  normal: "border-border bg-card hover:border-celeste hover:bg-celeste-suave/40",
  marcada: "border-celeste-fuerte bg-celeste-suave ring-4 ring-celeste/40",
  encontrada: "border-menta bg-menta-suave ring-4 ring-menta/30",
  omitida: "border-sol-fuerte/70 bg-sol-suave ring-4 ring-sol/40",
  equivocada: "border-rojo/70 bg-rojo-suave",
}

/** Animación al marcar y al corregir (con reducir movimiento, MotionConfig deja solo los fundidos). */
export const ANIMACION_SELECCION: Record<EstadoSeleccion, { scale?: number[]; x?: number[] }> = {
  normal: {},
  marcada: { scale: [1, 1.06, 1] },
  encontrada: { scale: [1, 1.08, 1] },
  omitida: { scale: [1, 1.04, 1] },
  equivocada: { x: [0, -6, 6, -4, 4, 0] },
}

/** Ícono chico en la esquina de una tarjeta corregida (o marcada). */
export function InsigniaSeleccion({ estado }: { estado: EstadoSeleccion }) {
  if (estado === "normal") return null
  const Icono = estado === "equivocada" ? X : estado === "omitida" ? Search : Check
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full text-white shadow-suave sm:size-7",
        estado === "marcada" && "bg-celeste-fuerte",
        estado === "encontrada" && "bg-menta-fuerte",
        estado === "omitida" && "bg-sol-fuerte",
        estado === "equivocada" && "bg-rojo",
      )}
    >
      <Icono className="size-4" strokeWidth={3} />
    </span>
  )
}

/** Textos del resumen, en singular y plural. */
export interface TextosResumen {
  encontrados: [string, string]
  omitidos: [string, string]
  equivocados: [string, string]
}

/** Qué encontró, qué le faltó y qué marcó de más, con color e ícono. */
export function ResumenSeleccion({ puntaje, textos }: { puntaje: PuntajeSeleccion; textos: TextosResumen }) {
  const filas = [
    { n: puntaje.encontrados, texto: textos.encontrados, clase: "bg-menta-suave text-menta-fuerte", Icono: Check },
    { n: puntaje.omitidos, texto: textos.omitidos, clase: "bg-sol-suave text-sol-fuerte", Icono: Search },
    { n: puntaje.equivocados, texto: textos.equivocados, clase: "bg-rojo-suave text-rojo-fuerte", Icono: X },
  ].filter((f) => f.n > 0)
  return (
    <ul role="status" className="flex flex-wrap justify-center gap-2">
      {filas.map(({ n, texto, clase, Icono }) => (
        <motion.li
          key={texto[0]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-bold", clase)}
        >
          <Icono className="size-5" aria-hidden="true" strokeWidth={3} />
          {n} {n === 1 ? texto[0] : texto[1]}
        </motion.li>
      ))}
    </ul>
  )
}

/** "Finalizar": siempre habilitado (si no marcó nada, cuenta como 0 encontrados). */
export function BotonFinalizar({ onClick, texto = "Finalizar" }: { onClick: () => void; texto?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-14 items-center gap-2 rounded-full bg-menta-fuerte px-8 text-lg font-bold text-white shadow-boton outline-none transition-[filter] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-menta/50"
    >
      {texto === "Finalizar" ? (
        <Flag className="size-5" aria-hidden="true" strokeWidth={2.5} />
      ) : (
        <Check className="size-6" aria-hidden="true" strokeWidth={3} />
      )}
      {texto}
    </button>
  )
}
