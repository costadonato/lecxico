"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EstadoVacio } from "@/components/estados"
import {
  CLASE_GRAFICO,
  CajaTooltip,
  DatosEnTabla,
  SelectorOpciones,
  TablaDatos,
  useAnimarGraficos,
} from "@/components/seguimiento/piezas"
import type { GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { ORIGEN_CORTO, TONO_ORIGEN, rutaConsulta } from "@/lib/entrenamiento/presentacion"
import { formatearFecha, formatearFechaCorta } from "@/lib/fechas"
import { estiloNivel } from "@/lib/niveles"
import {
  ORIGENES,
  partidasPorSemana,
  rangoDelPeriodo,
  resumenPorJuego,
  resumenSemanas,
  type PartidaSeguimiento,
  type PeriodoEntrenamiento,
  type SemanaPartidas,
} from "@/lib/seguimiento/entrenamiento"
import type { Nivel } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

/*
 * Pestaña "Entrenamiento" del seguimiento (S16): barras apiladas de
 * partidas por semana y por origen, y la tabla "Por juego". Mismos tonos
 * que el historial de entrenamientos: consulta en celeste, tarea en
 * lavanda y práctica en menta.
 */

const config = {
  consulta: { label: "Consulta", color: `var(--${TONO_ORIGEN.consulta})` },
  tarea: { label: "Tarea", color: `var(--${TONO_ORIGEN.tarea})` },
  practica: { label: "Práctica en casa", color: `var(--${TONO_ORIGEN.practica})` },
} satisfies ChartConfig

const PERIODOS: readonly { valor: PeriodoEntrenamiento; texto: string }[] = [
  { valor: "ultimas_12", texto: "Últimas 12 semanas" },
  { valor: "todo", texto: "Todo" },
]

export function GraficosEntrenamiento({
  partidas,
  habilitados,
  nivel,
  ninoId,
}: {
  partidas: readonly PartidaSeguimiento[]
  habilitados: GradosHabilitados
  /** Nivel actual del niño: el grado habilitado en casa es de ese nivel. */
  nivel: Nivel
  ninoId: string
}) {
  const [periodo, setPeriodo] = useState<PeriodoEntrenamiento>("ultimas_12")
  const semanas = useMemo(() => partidasPorSemana(partidas, rangoDelPeriodo(periodo, partidas)), [partidas, periodo])
  const porJuego = useMemo(() => resumenPorJuego(partidas, habilitados, { nivel }), [partidas, habilitados, nivel])

  if (partidas.length === 0) {
    return (
      <EstadoVacio
        compacto
        descripcion="Todavía no hay partidas del entrenamiento registradas."
        accion={
          <Button asChild>
            <Link href={rutaConsulta(ninoId)}>Entrenar en consulta</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="titulo-partidas-semana" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="titulo-partidas-semana" className="text-base font-semibold">
            Partidas por semana
          </h3>
          <SelectorOpciones etiqueta="Período" valor={periodo} opciones={PERIODOS} onCambiar={setPeriodo} />
        </div>
        <BarrasSemanas semanas={semanas} />
      </section>

      <section aria-labelledby="titulo-por-juego" className="space-y-3">
        <h3 id="titulo-por-juego" className="text-base font-semibold">
          Por juego
        </h3>
        <TablaPorJuego filas={porJuego} />
      </section>
    </div>
  )
}

function BarrasSemanas({ semanas }: { semanas: SemanaPartidas[] }) {
  const animar = useAnimarGraficos()
  const resumen = resumenSemanas(semanas)
  return (
    <figure className="space-y-3 rounded-2xl border border-border/80 bg-background/70 p-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Referencias">
        {ORIGENES.map((o) => (
          <li key={o} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: config[o].color }} />
            {config[o].label}
          </li>
        ))}
      </ul>
      <ChartContainer config={config} className={`${CLASE_GRAFICO} h-60`}>
        <BarChart data={semanas} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} accessibilityLayer title={resumen}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="semana"
            tickFormatter={(s: string) => formatearFechaCorta(s)}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
          <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<TooltipSemana />} />
          {ORIGENES.map((o, i) => (
            <Bar
              key={o}
              dataKey={o}
              stackId="partidas"
              maxBarSize={56}
              fill={`var(--color-${o})`}
              // Borde en el tono fuerte: separa los tramos apilados (contraste de gráficos, WCAG 1.4.11).
              stroke={`var(--${TONO_ORIGEN[o]}-fuerte)`}
              strokeWidth={1}
              // Solo la de arriba lleva las esquinas redondeadas.
              radius={i === ORIGENES.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={animar}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <figcaption className="text-sm text-muted-foreground">{resumen}</figcaption>
      <DatosEnTabla>
        <TablaDatos
          titulo="Partidas por semana y por origen"
          columnas={["Semana", "Consulta", "Tarea", "Práctica", "Total"]}
          filas={semanas.map((s) => [
            `${formatearFecha(s.semana)} al ${formatearFecha(s.hasta)}`,
            s.consulta,
            s.tarea,
            s.practica,
            s.total,
          ])}
        />
      </DatosEnTabla>
    </figure>
  )
}

function TooltipSemana({ active, payload }: { active?: boolean; payload?: { payload: SemanaPartidas }[] }) {
  const s = active ? payload?.[0]?.payload : undefined
  if (!s) return null
  return (
    <CajaTooltip>
      <span className="font-semibold">
        Semana del {formatearFecha(s.semana)} al {formatearFecha(s.hasta)}
      </span>
      {ORIGENES.map((o) => (
        <span key={o} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: config[o].color }} />
            {config[o].label}
          </span>
          <span className="font-semibold tabular-nums">{s[o]}</span>
        </span>
      ))}
      <span className="flex justify-between gap-4 border-t border-border/60 pt-1">
        Total <span className="font-semibold tabular-nums">{s.total}</span>
      </span>
    </CajaTooltip>
  )
}

function TablaPorJuego({ filas }: { filas: ReturnType<typeof resumenPorJuego> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 max-md:rounded-none max-md:border-0">
      <Table tarjetasEnCelular>
        <TableHeader>
          <TableRow>
            <TableHead>Juego</TableHead>
            <TableHead>Grado habilitado en casa</TableHead>
            <TableHead>Partidas</TableHead>
            <TableHead>Último resultado</TableHead>
            <TableHead className="text-right">Mejor resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((f) => (
            <TableRow key={f.juego}>
              <TableCell data-label="Juego" className="whitespace-normal">
                {/* Un solo contenedor: en celular la celda es una fila "etiqueta · valor". */}
                <span>
                  <span className="block font-medium">{f.nombre}</span>
                  <span className="block text-sm text-muted-foreground">Grado más alto jugado: {f.gradoMaximo}</span>
                </span>
              </TableCell>
              <TableCell data-label="Grado habilitado en casa" className="tabular-nums">
                {f.gradoHabilitado ?? <span className="text-muted-foreground">No se juega en casa</span>}
              </TableCell>
              <TableCell data-label="Partidas" className="whitespace-normal">
                <span className="flex flex-wrap justify-end gap-1.5 md:justify-start">
                  {ORIGENES.filter((o) => f.partidas[o] > 0).map((o) => (
                    <Badge key={o} variant={TONO_ORIGEN[o]} className="tabular-nums">
                      {ORIGEN_CORTO[o]}: {f.partidas[o]}
                    </Badge>
                  ))}
                </span>
              </TableCell>
              <TableCell data-label="Último resultado" className="tabular-nums">
                <span className="whitespace-nowrap">
                  <span className={cn("font-bold", estiloNivel(f.ultimo.porcentaje).texto)}>{f.ultimo.porcentaje} %</span>{" "}
                  <span className="text-muted-foreground">({formatearFecha(f.ultimo.fecha)})</span>
                </span>
              </TableCell>
              <TableCell data-label="Mejor resultado" className="text-right tabular-nums">
                <span className={cn("font-bold", estiloNivel(f.mejorPorcentaje).texto)}>{f.mejorPorcentaje} %</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
