"use client"

import { useId, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDown, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Banda } from "@/lib/seguimiento/evaluaciones"
import type { Franja } from "@/lib/test/franjas"
import { cn } from "@/lib/utils"

/*
 * Piezas compartidas de los gráficos de seguimiento (S16). Los gráficos son
 * de recharts; acá van los colores, el foco, la tabla accesible y el
 * selector de opciones. La lógica de los datos está en lib/seguimiento.
 */

/** Fondo de cada franja: los tokens --nivel-* en tono suave. El color nunca va solo: hay chip, tooltip y tabla. */
export const FONDO_BANDA: Record<Franja, { fill: string; opacidad: number }> = {
  correcto: { fill: "var(--nivel-alto)", opacidad: 0.18 },
  intermedio: { fill: "var(--nivel-medio)", opacidad: 0.24 },
  a_observar: { fill: "var(--nivel-critico)", opacidad: 0.1 },
}

/** Color de la línea y los puntos de las series (contraste alto sobre las bandas). */
export const COLOR_SERIE = "var(--celeste-fuerte)"

/**
 * Clases para el contenedor del gráfico: alto fijo (sin la proporción de
 * video de shadcn) y foco visible en el SVG, que con `accessibilityLayer`
 * se maneja con Tab y las flechas.
 */
export const CLASE_GRAFICO =
  "aspect-auto w-full [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-solid [&_.recharts-surface:focus-visible]:outline-offset-2 [&_.recharts-surface:focus-visible]:outline-ring [&_.recharts-surface:focus-visible]:rounded-md"

/** false si el sistema pide reducir el movimiento: los gráficos aparecen sin animación. */
export function useAnimarGraficos(): boolean {
  return !useReducedMotion()
}

/** Las bandas que se pintan, con el techo resuelto (una banda "hasta arriba" llega hasta `techo`). */
export function bandasConTecho(bandas: readonly Banda[] | null, techo: number) {
  return (bandas ?? []).map((b) => ({ ...b, hasta: b.hasta ?? techo }))
}

/** Caja del tooltip de los gráficos. */
export function CajaTooltip({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-w-[10rem] gap-1 rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-lg">
      {children}
    </div>
  )
}

/**
 * "Ver datos en tabla": muestra debajo del gráfico los mismos datos en una
 * tabla (WCAG 1.1.1). El botón indica si está abierta (aria-expanded) y qué
 * controla (aria-controls).
 */
export function DatosEnTabla({ children, className }: { children: ReactNode; className?: string }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()
  const reducir = useReducedMotion()
  return (
    <div className={className}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => setAbierta((a) => !a)}
        className="-ml-2 text-muted-foreground"
      >
        <Table2 className="size-4" aria-hidden="true" />
        {abierta ? "Ocultar la tabla" : "Ver datos en tabla"}
        <ChevronDown className={cn("size-4 transition-transform", abierta && "rotate-180")} aria-hidden="true" />
      </Button>
      <div id={id}>
        <AnimatePresence initial={false}>
          {abierta && (
            <motion.div
              initial={reducir ? { opacity: 0 } : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-2 overflow-x-auto rounded-xl border border-border/80 bg-background/70"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Tabla simple y accesible para DatosEnTabla: encabezados con scope y celdas numéricas alineadas. */
export function TablaDatos({
  titulo,
  columnas,
  filas,
  compacta = false,
}: {
  /** Letra más chica, para que entre sin desplazarse en las tarjetas de la grilla. */
  compacta?: boolean
  /** Leyenda de la tabla (caption), para el lector de pantalla. */
  titulo: string
  columnas: readonly string[]
  filas: readonly (readonly ReactNode[])[]
}) {
  return (
    <table className={cn("w-full", compacta ? "text-xs [&_td]:px-1.5 [&_th]:px-1.5" : "text-sm")}>
      <caption className="sr-only">{titulo}</caption>
      <thead className="bg-muted/70">
        <tr>
          {columnas.map((c, i) => (
            <th key={c} scope="col" className={cn("px-2 py-1.5 text-left font-semibold", i > 0 && "text-right")}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i} className="border-t border-border/60">
            {fila.map((celda, j) =>
              j === 0 ? (
                <th key={j} scope="row" className="whitespace-nowrap px-2 py-1.5 text-left font-medium tabular-nums">
                  {celda}
                </th>
              ) : (
                <td key={j} className="px-2 py-1.5 text-right tabular-nums">
                  {celda}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Selector de una opción (nivel, período) con el aspecto de las pestañas.
 * Es un grupo de botones con aria-pressed; se recorre con las flechas.
 */
export function SelectorOpciones<T extends string>({
  etiqueta,
  valor,
  opciones,
  onCambiar,
}: {
  etiqueta: string
  valor: T
  opciones: readonly { valor: T; texto: string }[]
  onCambiar: (v: T) => void
}) {
  return (
    <ToggleGroup
      type="single"
      aria-label={etiqueta}
      value={valor}
      // Radix permite des-seleccionar: se ignora, siempre queda una opción.
      onValueChange={(v) => v && onCambiar(v as T)}
      className="rounded-lg bg-muted p-1"
    >
      {opciones.map((o) => (
        <ToggleGroupItem
          key={o.valor}
          value={o.valor}
          className="h-8 flex-none rounded-md px-3 text-sm text-muted-foreground first:rounded-md last:rounded-md hover:bg-background/60 hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow"
        >
          {o.texto}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
