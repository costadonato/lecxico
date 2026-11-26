"use client"

import type { ReactElement } from "react"
import { CartesianGrid, LabelList, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { useIsMobile } from "@/components/ui/use-mobile"
import { CLASE_GRAFICO, COLOR_SERIE, FONDO_BANDA, useAnimarGraficos } from "@/components/seguimiento/piezas"
import { formatearFecha, formatearFechaCorta } from "@/lib/fechas"
import type { Banda } from "@/lib/seguimiento/evaluaciones"
import { cn } from "@/lib/utils"

/*
 * Gráfico de línea de una medida por evaluación (S16), en dos tamaños: el
 * chico de la grilla y el grande del modal. Es el mismo componente con
 * `grande`: cambian el alto, las fechas del eje (dd/mm o dd/mm/aaaa,
 * inclinadas si no entran) y los valores escritos sobre cada punto.
 */

/** Más puntos que esto no se rotulan: los valores se pisarían (en celular entran menos). */
const MAX_PUNTOS_ROTULADOS = { escritorio: 12, celular: 5 }

export interface PropsGraficoLinea<T extends { testId: string; fecha: string }> {
  datos: readonly T[]
  /** Propiedad numérica de cada dato que se dibuja. */
  clave: keyof T & string
  /** Nombre de la medida (para la configuración del gráfico). */
  etiqueta: string
  dominio: [number, number]
  marcas: number[]
  formatoEje: (v: number) => string
  anchoEje: number
  /** Franjas de fondo; null o vacío, sin fondo. */
  bandas?: readonly Banda[] | null
  /** Contenido del tooltip (recibe `active` y `payload` de recharts). */
  tooltip: ReactElement
  /** Resumen en texto: nombre accesible del SVG. */
  titulo: string
  grande?: boolean
  /** Texto del valor escrito sobre cada punto (solo en grande). */
  formatoValor?: (v: number) => string
  /** Alto del gráfico (clase de Tailwind). */
  alto: string
  /** Tocar el gráfico abre el modal. Con el teclado se abre con el botón de ampliar. */
  onAmpliar?: (origen: HTMLElement) => void
}

export function GraficoLinea<T extends { testId: string; fecha: string }>({
  datos,
  clave,
  etiqueta,
  dominio,
  marcas,
  formatoEje,
  anchoEje,
  bandas,
  tooltip,
  titulo,
  grande = false,
  formatoValor,
  alto,
  onAmpliar,
}: PropsGraficoLinea<T>) {
  const animar = useAnimarGraficos()
  const celular = useIsMobile()
  const fechas = new Map(datos.map((d) => [d.testId, grande ? formatearFecha(d.fecha) : formatearFechaCorta(d.fecha)]))
  // dd/mm/aaaa ocupa unos 80 px: se inclinan si no entran todas.
  const inclinar = grande && datos.length > (celular ? 3 : 7)
  const rotular = grande && formatoValor && datos.length <= MAX_PUNTOS_ROTULADOS[celular ? "celular" : "escritorio"]
  const config = { [clave]: { label: etiqueta, color: COLOR_SERIE } } satisfies ChartConfig
  const color = `var(--color-${clave})`

  return (
    <div
      className={cn(onAmpliar && "cursor-zoom-in")}
      onClick={
        onAmpliar
          ? (e) => onAmpliar(e.currentTarget.querySelector<HTMLElement>(".recharts-surface") ?? e.currentTarget)
          : undefined
      }
    >
      <ChartContainer config={config} className={cn(CLASE_GRAFICO, alto)}>
        <LineChart
          data={[...datos]}
          margin={{ top: rotular ? 24 : 8, right: grande ? 40 : 12, bottom: 0, left: 4 }}
          accessibilityLayer
          title={titulo}
        >
          {(bandas ?? []).map((b) => (
            <ReferenceArea
              key={b.franja}
              y1={b.desde}
              y2={b.hasta}
              fill={FONDO_BANDA[b.franja].fill}
              fillOpacity={FONDO_BANDA[b.franja].opacidad}
              stroke="none"
              ifOverflow="hidden"
            />
          ))}
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="testId"
            tickFormatter={(id: string) => fechas.get(id) ?? ""}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            interval={inclinar ? 0 : "preserveStartEnd"}
            minTickGap={12}
            angle={inclinar ? -35 : 0}
            textAnchor={inclinar ? "end" : "middle"}
            height={inclinar ? 64 : 30}
            // En grande, aire a los costados: el valor del primer punto no se pisa con las marcas del eje Y.
            padding={grande ? { left: 24, right: 8 } : undefined}
          />
          <YAxis
            domain={dominio}
            ticks={marcas}
            tickFormatter={formatoEje}
            tickLine={false}
            axisLine={false}
            width={anchoEje}
          />
          <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={tooltip} />
          <Line
            dataKey={clave}
            type="linear"
            stroke={color}
            strokeWidth={grande ? 3 : 2.5}
            dot={{ r: grande ? 5 : 4, fill: "white", stroke: color, strokeWidth: 2 }}
            activeDot={{ r: grande ? 7 : 6, fill: color }}
            isAnimationActive={animar}
          >
            {rotular && (
              <LabelList
                dataKey={clave}
                position="top"
                offset={10}
                className="fill-foreground text-xs font-semibold"
                formatter={(v: number) => formatoValor(v)}
              />
            )}
          </Line>
        </LineChart>
      </ChartContainer>
    </div>
  )
}
