"use client"

import { Fragment, useId, useState } from "react"
import { Info, Minus, Plus } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableCell, TableHead, TableHeader, TableRow, claseFilaTabla } from "@/components/ui/table"
import { BarraPorcentaje } from "@/components/motion/barra-porcentaje"
import { NumeroAnimado } from "@/components/motion/numero-animado"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { ChipFranja, LeyendasFranjas, estiloFranja } from "@/components/test/franja"
import { estiloNivel } from "@/lib/niveles"
import { porcentajeBloque, resumenPorcentual, type BloqueResultado } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, NIVEL_LABEL, type EtapaEscolar, type Nivel } from "@/lib/test/bloques"
import { formatearTiempo } from "@/lib/test/denominacion"
import { franjasDeEvaluacion, gradoParaFranja, type Franja } from "@/lib/test/franjas"
import type { DetalleEjercicioDenominacion } from "@/lib/types/database"
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
 * se muestran en lugar de la barra de porcentaje, y un botón "+" despliega
 * una sub-fila por ejercicio (leída de `detalle`). Las evaluaciones
 * anteriores (sin tiempo ni detalle) se muestran como cualquier otro bloque.
 *
 * Franjas (S11): cada fila lleva el chip de su franja (lib/test/franjas.ts) y
 * el número y la barra toman el color de esa franja, no la escala general
 * 80/60/40 (si no, 2 de 3 en conciencia fonológica de inicial se vería en
 * amarillo y diría "Correcto"). El anillo del porcentaje general no cambia.
 * Los cortes que dependen del grado usan la etapa escolar ACTUAL del niño
 * (`etapaEscolar`): la tabla `test` no la guarda.
 */
export type BloqueConMedicion = BloqueResultado & {
  /** Solo denominación rápida; null o ausente en el resto y en evaluaciones viejas. */
  tiempo_ms?: number | null
  errores?: number | null
  detalle?: DetalleEjercicioDenominacion[] | null
}

/** La fila tiene tiempo y errores para mostrar (denominación rápida desde S9). */
const tieneMedicion = (b: BloqueConMedicion): b is BloqueConMedicion & { tiempo_ms: number; errores: number } =>
  b.tiempo_ms != null && b.errores != null

export function ResultadosEvaluacion({
  nivel,
  porcentajeTotal,
  bloques,
  etapaEscolar,
}: {
  nivel: Nivel
  porcentajeTotal: number
  bloques: BloqueConMedicion[]
  /** Etapa escolar actual del niño, para el grado de las franjas; sin ella esos bloques quedan sin franja. */
  etapaEscolar: EtapaEscolar | null
}) {
  const grado = gradoParaFranja(nivel, etapaEscolar)
  // En el orden del test, cada bloque con su franja (o null).
  const filas = franjasDeEvaluacion(nivel, bloques, grado)
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
      <Card className="overflow-hidden py-0 max-md:border-0 max-md:bg-transparent max-md:shadow-none max-md:[--filtro-tarjeta:none]">
        <Table tarjetasEnCelular aria-label={`Resultados por bloque · Nivel ${NIVEL_LABEL[nivel]}`}>
          <TableHeader>
            <TableRow>
              <TableHead>Bloque</TableHead>
              <TableHead className="text-center">Correctas</TableHead>
              <TableHead>{conMedicion ? "Resultado" : "Porcentaje"}</TableHead>
              <TableHead>Franja</TableHead>
            </TableRow>
          </TableHeader>
          <CuerpoTablaAnimado>
            {filas.map((b) => {
              if (tieneMedicion(b)) return <FilaDenominacion key={b.bloque_codigo} bloque={b} />
              const pct = porcentajeBloque(b.correctas, b.total)
              const estilo = estiloFranja(b.franja)
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
                        className={cn("inline-block min-w-12 text-right font-bold", estilo.texto)}
                      />
                      <BarraPorcentaje valor={pct} className="w-28 max-md:w-20" claseRelleno={estilo.barra} />
                    </span>
                  </TableCell>
                  <CeldaFranja franja={b.franja} />
                </FilaTablaAnimada>
              )
            })}
          </CuerpoTablaAnimado>
        </Table>
      </Card>

      <LeyendasFranjas nivel={nivel} bloques={filas} grado={grado} />

      <p className="flex items-start justify-center gap-2 rounded-2xl bg-muted/70 px-4 py-3 text-center text-base text-muted-foreground">
        <Info className="mt-1 size-4 shrink-0" />
        Esta evaluación es orientativa y no reemplaza un diagnóstico profesional.
      </p>
    </div>
  )
}

/** Celda con el chip de la franja del bloque. */
function CeldaFranja({ franja }: { franja: Franja | null }) {
  return (
    <TableCell data-label="Franja">
      <ChipFranja franja={franja} className="text-sm" />
    </TableCell>
  )
}

/** Tiempo (m:ss) y errores, para la fila de denominación rápida y sus sub-filas. */
function TiempoYErrores({ tiempoMs, errores }: { tiempoMs: number; errores: number }) {
  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold max-md:justify-end">
      <span>
        <span className="font-normal text-muted-foreground">Tiempo </span>
        <span className="tabular-nums">{formatearTiempo(tiempoMs)}</span>
      </span>
      <span>
        <span className="font-normal text-muted-foreground">Errores </span>
        <span className="tabular-nums">{errores}</span>
      </span>
    </span>
  )
}

/**
 * Fila de denominación rápida: total del bloque (correctas / total, tiempo y
 * errores) y, si hay `detalle`, un botón "+" al final que despliega debajo
 * una sub-fila por ejercicio. Con reducir movimiento, MotionConfig
 * (ProveedorMovimiento) deja solo el fundido, sin desplazamiento.
 */
function FilaDenominacion({
  bloque,
}: {
  bloque: BloqueConMedicion & { tiempo_ms: number; errores: number; franja: Franja | null }
}) {
  const [abierto, setAbierto] = useState(false)
  const base = useId()
  const detalle = bloque.detalle ?? []
  const idFila = (i: number) => `${base}-ejercicio-${i + 1}`

  return (
    <Fragment>
      <FilaTablaAnimada>
        <TableCell data-label="Bloque" className="whitespace-normal font-semibold">
          {BLOQUE_NOMBRES[bloque.bloque_codigo]}
        </TableCell>
        <TableCell data-label="Correctas" className="text-center tabular-nums text-muted-foreground">
          {bloque.correctas} / {bloque.total}
        </TableCell>
        <TableCell data-label="Tiempo y errores">
          <span className="flex items-center justify-between gap-3 max-md:justify-end">
            <TiempoYErrores tiempoMs={bloque.tiempo_ms} errores={bloque.errores} />
            {detalle.length > 0 && (
              <button
                type="button"
                onClick={() => setAbierto((a) => !a)}
                aria-expanded={abierto}
                aria-controls={detalle.map((_, i) => idFila(i)).join(" ")}
                aria-label="Ver el detalle por ejercicio"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-foreground/30 bg-card text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
              >
                {abierto ? <Minus className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
              </button>
            )}
          </span>
        </TableCell>
        <CeldaFranja franja={bloque.franja} />
      </FilaTablaAnimada>

      <AnimatePresence initial={false}>
        {abierto &&
          detalle.map((e, i) => (
            <motion.tr
              key={e.ejercicio}
              id={idFila(i)}
              data-slot="table-row"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE_SUAVE, delay: i * 0.04 }}
              className={cn(claseFilaTabla, "bg-muted/50 text-sm max-md:ml-4 max-md:w-[calc(100%-1rem)]!")}
            >
              <TableCell data-label="Ejercicio" className="whitespace-normal pl-8 font-medium text-muted-foreground max-md:pl-0">
                Ejercicio {i + 1}
              </TableCell>
              <TableCell data-label="Correctas" className="text-center tabular-nums text-muted-foreground">
                {e.correctas} / {e.total}
              </TableCell>
              <TableCell data-label="Tiempo y errores">
                <TiempoYErrores tiempoMs={e.tiempo_ms} errores={e.errores} />
              </TableCell>
              {/* La sub-fila por ejercicio no lleva franja (vacía: en celular no se muestra). */}
              <TableCell />
            </motion.tr>
          ))}
      </AnimatePresence>
    </Fragment>
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
