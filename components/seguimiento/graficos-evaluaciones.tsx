"use client"

import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
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
  bandasDeFranja,
  bloquesDeLaGrilla,
  resumenBloque,
  serieDeBloque,
  type PuntoDeBloque,
  type PuntoEvaluacion,
} from "@/lib/seguimiento/evaluaciones"
import { BLOQUE_NOMBRES, type BloqueCodigo, type Nivel } from "@/lib/test/bloques"
import { FRANJA_LABEL, SIN_FRANJA_LABEL, type GradoFranja } from "@/lib/test/franjas"

/*
 * Pestaña "Evaluaciones" del seguimiento (S16): un gráfico chico por bloque
 * (small multiples), en el orden del test y sin denominación rápida, que
 * tiene su pestaña.
 */

const config = { porcentaje: { label: "Porcentaje", color: COLOR_SERIE } } satisfies ChartConfig

export function GraficosEvaluaciones({
  serie,
  nivel,
  grado,
}: {
  serie: readonly PuntoEvaluacion[]
  nivel: Nivel
  grado: GradoFranja | null
}) {
  return (
    <div className="space-y-4">
      {serie.length === 1 && (
        <p className="rounded-2xl border border-border/80 bg-background/60 px-4 py-3 text-base text-muted-foreground">
          Con dos evaluaciones o más vas a ver la evolución.
        </p>
      )}
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bloquesDeLaGrilla(nivel).map((bloque) => (
          <li key={bloque}>
            <GraficoBloque bloque={bloque} puntos={serieDeBloque(serie, bloque)} nivel={nivel} grado={grado} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function GraficoBloque({
  bloque,
  puntos,
  nivel,
  grado,
}: {
  bloque: BloqueCodigo
  puntos: PuntoDeBloque[]
  nivel: Nivel
  grado: GradoFranja | null
}) {
  const animar = useAnimarGraficos()
  const nombre = BLOQUE_NOMBRES[bloque]
  const bandas = bandasDeFranja(nivel, bloque, grado)
  const ultimo = puntos.at(-1)
  const resumen = resumenBloque(bloque, puntos)
  const etiqueta = new Map(puntos.map((p) => [p.testId, formatearFechaCorta(p.fecha)]))

  return (
    <figure className="flex h-full flex-col gap-3 rounded-2xl border border-border/80 bg-background/70 p-4">
      <div className="flex flex-col items-start gap-1.5">
        <h3 className="text-base font-semibold">{nombre}</h3>
        {ultimo && <ChipFranja franja={ultimo.franja} className="text-xs" />}
      </div>

      {puntos.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Este bloque no está en las evaluaciones de este nivel.</p>
      ) : (
        <ChartContainer config={config} className={`${CLASE_GRAFICO} h-44`}>
          <LineChart data={puntos} margin={{ top: 8, right: 12, bottom: 0, left: 4 }} accessibilityLayer title={resumen}>
            {bandasConTecho(bandas, 100).map((b) => (
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
              tickFormatter={(id: string) => etiqueta.get(id) ?? ""}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v} %`}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<TooltipBloque />} />
            <Line
              dataKey="porcentaje"
              type="linear"
              stroke="var(--color-porcentaje)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "white", stroke: "var(--color-porcentaje)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "var(--color-porcentaje)" }}
              isAnimationActive={animar}
            />
          </LineChart>
        </ChartContainer>
      )}

      <figcaption className="text-sm text-muted-foreground">
        {resumen}
        {!bandas && puntos.length > 0 && <span className="block">{SIN_FRANJA_LABEL}.</span>}
      </figcaption>

      {puntos.length > 0 && (
        <DatosEnTabla className="mt-auto">
          <TablaDatos
            compacta
            titulo={`${nombre}: resultado de cada evaluación`}
            columnas={["Fecha", "Aciertos", "%", "Franja"]}
            filas={puntos.map((p) => [
              formatearFecha(p.fecha),
              `${p.correctas} / ${p.total}`,
              `${p.porcentaje} %`,
              p.franja ? FRANJA_LABEL[p.franja] : SIN_FRANJA_LABEL,
            ])}
          />
        </DatosEnTabla>
      )}
    </figure>
  )
}

function TooltipBloque({ active, payload }: { active?: boolean; payload?: { payload: PuntoDeBloque }[] }) {
  const p = active ? payload?.[0]?.payload : undefined
  if (!p) return null
  return (
    <CajaTooltip>
      <span className="font-semibold">{formatearFecha(p.fecha)}</span>
      <span>
        {p.correctas} / {p.total} correctas · {p.porcentaje} %
      </span>
      <span className="text-muted-foreground">
        Franja: <span className="font-medium text-foreground">{p.franja ? FRANJA_LABEL[p.franja] : SIN_FRANJA_LABEL}</span>
      </span>
    </CajaTooltip>
  )
}
