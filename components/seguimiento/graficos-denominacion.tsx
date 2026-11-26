"use client"

import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { EstadoVacio } from "@/components/estados"
import { ChipFranja } from "@/components/test/franja"
import {
  CLASE_GRAFICO,
  COLOR_SERIE,
  CajaTooltip,
  DatosEnTabla,
  FONDO_BANDA,
  TablaDatos,
  bandasConTecho,
  useAnimarGraficos,
} from "@/components/seguimiento/piezas"
import { formatearFecha, formatearFechaCorta } from "@/lib/fechas"
import {
  bandasDenominacion,
  resumenDenominacion,
  resumenFranjaDenominacion,
  textoSegundos,
  type Banda,
  type PuntoDenominacion,
} from "@/lib/seguimiento/evaluaciones"
import type { Nivel } from "@/lib/test/bloques"
import { FRANJA_LABEL, SIN_FRANJA_LABEL, type Franja, type GradoFranja } from "@/lib/test/franjas"

/*
 * Pestaña "Denominación rápida" del seguimiento (S16): el tiempo del bloque
 * y los errores de cada evaluación. En primaria, con las bandas de corte de
 * fondo; en inicial no hay corte.
 */

const etiquetaFranja = (f: Franja | null) => (f ? FRANJA_LABEL[f] : SIN_FRANJA_LABEL)

/** Techo del eje: lo más alto entre los datos y el último límite, con un margen, redondeado a `paso` (al menos un paso). */
function techo(valores: number[], bandas: readonly Banda[] | null, paso: number): number {
  const limite = Math.max(0, ...valores, ...(bandas ?? []).map((b) => b.hasta ?? 0))
  return Math.max(paso, Math.ceil((limite * 1.15) / paso) * paso)
}

export function GraficosDenominacion({
  puntos,
  nivel,
  grado,
}: {
  puntos: readonly PuntoDenominacion[]
  nivel: Nivel
  grado: GradoFranja | null
}) {
  if (puntos.length === 0) {
    return (
      <EstadoVacio
        compacto
        descripcion="Todavía no hay evaluaciones de este nivel con el tiempo de denominación rápida registrado."
      />
    )
  }

  const bandas = bandasDenominacion(nivel, grado)
  const ultimo = puntos.at(-1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-base">
        <span className="text-muted-foreground">Última franja:</span>
        <ChipFranja franja={ultimo?.franja ?? null} className="text-sm" />
      </div>
      {puntos.length === 1 && (
        <p className="rounded-2xl border border-border/80 bg-background/60 px-4 py-3 text-base text-muted-foreground">
          Con dos evaluaciones o más vas a ver la evolución.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GraficoMedida medida="tiempo" puntos={puntos} bandas={bandas?.tiempo ?? null} />
        <GraficoMedida medida="errores" puntos={puntos} bandas={bandas?.errores ?? null} />
      </div>
      <p className="text-sm text-muted-foreground">
        {bandas
          ? "Más tiempo o más errores ubican el resultado en una franja más baja. La franja del bloque es la más baja de las dos."
          : `${SIN_FRANJA_LABEL}: no hay valores de la bibliografía para comparar este resultado.`}{" "}
        <span className="sr-only">{resumenFranjaDenominacion(puntos)}</span>
      </p>
    </div>
  )
}

const TEXTO_MEDIDA = {
  tiempo: { titulo: "Tiempo del bloque", columna: "Tiempo", clave: "segundos" },
  errores: { titulo: "Errores", columna: "Errores", clave: "errores" },
} as const

function GraficoMedida({
  medida,
  puntos,
  bandas,
}: {
  medida: "tiempo" | "errores"
  puntos: readonly PuntoDenominacion[]
  bandas: Banda[] | null
}) {
  const animar = useAnimarGraficos()
  const { titulo, columna, clave } = TEXTO_MEDIDA[medida]
  const esTiempo = medida === "tiempo"
  const valores = puntos.map((p) => (esTiempo ? p.segundos : p.errores))
  // Techo múltiplo de 4 pasos: las cinco marcas del eje quedan en números redondos (cada 10 s o cada error entero).
  const maximo = esTiempo ? techo(valores, bandas, 40) : techo(valores, bandas, 4)
  const marcas = [0, 1, 2, 3, 4].map((k) => (maximo * k) / 4)
  const resumen = resumenDenominacion(medida, puntos)
  const etiqueta = new Map(puntos.map((p) => [p.testId, formatearFechaCorta(p.fecha)]))
  const config = { [clave]: { label: columna, color: COLOR_SERIE } } satisfies ChartConfig

  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/70 p-4">
      <h3 className="text-base font-semibold">{titulo}</h3>
      <ChartContainer config={config} className={`${CLASE_GRAFICO} h-52`}>
        <LineChart data={[...puntos]} margin={{ top: 8, right: 12, bottom: 0, left: 4 }} accessibilityLayer title={resumen}>
          {bandasConTecho(bandas, maximo).map((b) => (
            <ReferenceArea
              key={b.franja}
              y1={b.desde}
              y2={Math.min(b.hasta, maximo)}
              fill={FONDO_BANDA[b.franja].fill}
              fillOpacity={FONDO_BANDA[b.franja].opacidad}
              stroke="none"
              ifOverflow="hidden"
            />
          ))}
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="testId"
            tickFormatter={(id: string) => etiqueta.get(id) ?? ""}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            domain={[0, maximo]}
            ticks={marcas}
            tickFormatter={(v: number) => (esTiempo ? `${v} s` : String(v))}
            tickLine={false}
            axisLine={false}
            width={esTiempo ? 52 : 36}
          />
          <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<TooltipDenominacion medida={medida} />} />
          <Line
            dataKey={clave}
            type="linear"
            stroke={`var(--color-${clave})`}
            strokeWidth={2.5}
            dot={{ r: 4, fill: "white", stroke: `var(--color-${clave})`, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: `var(--color-${clave})` }}
            isAnimationActive={animar}
          />
        </LineChart>
      </ChartContainer>
      <figcaption className="text-sm text-muted-foreground">{resumen}</figcaption>
      <DatosEnTabla className="mt-auto">
        <TablaDatos
          titulo={`${titulo} de denominación rápida en cada evaluación`}
          columnas={["Fecha", columna, "Franja"]}
          filas={puntos.map((p) => [
            formatearFecha(p.fecha),
            esTiempo ? textoSegundos(p.segundos) : p.errores,
            etiquetaFranja(esTiempo ? p.franjaTiempo : p.franjaErrores),
          ])}
        />
      </DatosEnTabla>
    </figure>
  )
}

function TooltipDenominacion({
  medida,
  active,
  payload,
}: {
  medida: "tiempo" | "errores"
  active?: boolean
  payload?: { payload: PuntoDenominacion }[]
}) {
  const p = active ? payload?.[0]?.payload : undefined
  if (!p) return null
  const franja = medida === "tiempo" ? p.franjaTiempo : p.franjaErrores
  return (
    <CajaTooltip>
      <span className="font-semibold">{formatearFecha(p.fecha)}</span>
      <span>
        {medida === "tiempo" ? `Tiempo: ${textoSegundos(p.segundos)}` : `Errores: ${p.errores}`}
      </span>
      <span className="text-muted-foreground">
        Franja: <span className="font-medium text-foreground">{etiquetaFranja(franja)}</span>
      </span>
    </CajaTooltip>
  )
}
