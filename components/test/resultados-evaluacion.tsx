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
import { porcentajeBloque, type BloqueResultado } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, NIVEL_LABEL, type Nivel } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

/**
 * Resultados de una evaluación ya guardada, para las páginas de gestión
 * (detalle desde el historial del profesional y del niño). Muestra los mismos
 * datos que ResultadosTest (porcentaje general, correctas y tabla por
 * bloque) con el estilo nuevo. Es sobrio a propósito: sin festejos.
 *
 * La pantalla final DURANTE la evaluación sigue usando ResultadosTest
 * (components/test/resultados-test.tsx), que no se modificó.
 */
export function ResultadosEvaluacion({
  nivel,
  porcentajeTotal,
  bloques,
}: {
  nivel: Nivel
  porcentajeTotal: number
  bloques: BloqueResultado[]
}) {
  const filas = [...bloques].sort((a, b) => a.orden - b.orden)
  const correctas = filas.reduce((acc, b) => acc + b.correctas, 0)
  const total = filas.reduce((acc, b) => acc + b.total, 0)

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
              <TableHead>Porcentaje</TableHead>
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
