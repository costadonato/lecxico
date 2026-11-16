"use client"

import { Info } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarraPorcentaje } from "@/components/motion/barra-porcentaje"
import { NumeroAnimado } from "@/components/motion/numero-animado"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { estiloNivel } from "@/lib/niveles"
import { porcentajeBloque, resumenPorcentual, type BloqueResultado } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, NIVEL_LABEL, type Nivel } from "@/lib/test/bloques"
import { formatearTiempo } from "@/lib/test/denominacion"
import { cn } from "@/lib/utils"

/**
 * Resultados de una evaluación: porcentaje general, respuestas correctas y
 * tabla por bloque. Solo usa datos que se guardan en la base (test +
 * test_bloque_resultado), así que sirve igual para la pantalla final de la
 * evaluación (components/test/final-evaluacion.tsx) y para una evaluación
 * del historial (detalle del profesional y del niño). "X de Y respuestas
 * correctas" sale de sumar correctas y total de los bloques porcentuales
 * (todos menos denominación rápida; ver lib/test/analisis.ts).
 *
 * No muestra la conclusión (indicadores sí/no): se sigue guardando en
 * test.conclusion, pero en pantalla solo va una aclaración neutra.
 * Es sobrio a propósito: sin festejos.
 *
 * Denominación rápida (desde S9) guarda además tiempo y errores: en su fila
 * se muestran en lugar de la barra de porcentaje. Las evaluaciones
 * anteriores (sin tiempo) se muestran como cualquier otro bloque.
 */
export type BloqueConMedicion = BloqueResultado & {
  /** Solo denominación rápida; null o ausente en el resto y en evaluaciones viejas. */
  tiempo_ms?: number | null
  errores?: number | null
}

/** La fila tiene tiempo y errores para mostrar (denominación rápida desde S9). */
const tieneMedicion = (b: BloqueConMedicion): b is BloqueConMedicion & { tiempo_ms: number; errores: number } =>
  b.tiempo_ms != null && b.errores != null

export function ResultadosEvaluacion({
  nivel,
  porcentajeTotal,
  bloques,
}: {
  nivel: Nivel
  porcentajeTotal: number
  bloques: BloqueConMedicion[]
}) {
  const filas = [...bloques].sort((a, b) => a.orden - b.orden)
  // "X de Y respuestas correctas" sin denominación rápida (se mide por tiempo y errores).
  const { correctas, total } = resumenPorcentual(filas)
  const conMedicion = filas.some(tieneMedicion)

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-celeste/15 blur-2xl" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <AnilloPorcentaje valor={porcentajeTotal} />
          <div className="space-y-3">
            <Badge variant="celeste" className="text-sm">Nivel {NIVEL_LABEL[nivel]}</Badge>
            <p className="text-xl font-semibold text-foreground sm:text-2xl">
              {correctas} de {total} respuestas correctas
            </p>
          </div>
        </div>
      </Card>

      {/* Tabla por bloque */}
      <Card className="overflow-hidden py-0 max-md:border-0 max-md:bg-transparent max-md:shadow-none">
        <Table tarjetasEnCelular aria-label={`Resultados por bloque · Nivel ${NIVEL_LABEL[nivel]}`}>
          <TableHeader>
            <TableRow>
              <TableHead>Bloque</TableHead>
              <TableHead className="text-center">Correctas</TableHead>
              <TableHead>{conMedicion ? "Resultado" : "Porcentaje"}</TableHead>
            </TableRow>
          </TableHeader>
          <CuerpoTablaAnimado>
            {filas.map((b) => {
              const pct = porcentajeBloque(b.correctas, b.total)
              return (
                <FilaTablaAnimada key={b.bloque_codigo}>
                  <TableCell data-label="Bloque" className="whitespace-normal font-semibold">
                    {BLOQUE_NOMBRES[b.bloque_codigo]}
                  </TableCell>
                  <TableCell data-label="Correctas" className="text-center tabular-nums text-muted-foreground">
                    {b.correctas} / {b.total}
                  </TableCell>
                  {tieneMedicion(b) ? (
                    <TableCell data-label="Tiempo y errores">
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold max-md:justify-end">
                        <span>
                          <span className="font-normal text-muted-foreground">Tiempo </span>
                          <span className="tabular-nums">{formatearTiempo(b.tiempo_ms)}</span>
                        </span>
                        <span>
                          <span className="font-normal text-muted-foreground">Errores </span>
                          <span className="tabular-nums">{b.errores}</span>
                        </span>
                      </span>
                    </TableCell>
                  ) : (
                    <TableCell data-label="Porcentaje">
                      <span className="flex items-center gap-3 max-md:justify-end">
                        <NumeroAnimado
                          valor={pct}
                          sufijo="%"
                          className={cn("inline-block min-w-12 text-right font-bold", estiloNivel(pct).texto)}
                        />
                        <BarraPorcentaje valor={pct} className="w-28 max-md:w-20" />
                      </span>
                    </TableCell>
                  )}
                </FilaTablaAnimada>
              )
            })}
          </CuerpoTablaAnimado>
        </Table>
      </Card>

      <p className="flex items-start justify-center gap-2 rounded-2xl bg-muted/70 px-4 py-3 text-center text-base text-muted-foreground">
        <Info className="mt-1 size-4 shrink-0" />
        Esta evaluación es orientativa y no reemplaza un diagnóstico profesional.
      </p>
    </div>
  )
}

/** Anillo que se completa hasta el porcentaje, con el número en el centro. */
function AnilloPorcentaje({ valor }: { valor: number }) {
  const reducir = useReducedMotion()
  const pct = Math.max(0, Math.min(100, valor))
  const estilo = estiloNivel(pct)

  return (
    <div className="relative grid size-40 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={60} cy={60} r={50} fill="none" strokeWidth={12} className="stroke-muted" />
        <motion.circle
          cx={60}
          cy={60}
          r={50}
          fill="none"
          strokeWidth={12}
          strokeLinecap="round"
          className={estilo.trazo}
          style={{ opacity: pct === 0 ? 0 : 1 }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={reducir ? { duration: 0 } : { duration: 1.2, ease: EASE_SUAVE, delay: 0.2 }}
        />
      </svg>
      <NumeroAnimado valor={pct} sufijo="%" className={cn("text-4xl font-extrabold", estilo.texto)} />
    </div>
  )
}
