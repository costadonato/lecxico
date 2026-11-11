"use client"

import { Home, Loader2, RotateCcw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { EntradaPagina } from "@/components/motion/entrada-pagina"
import { ResultadosEvaluacion } from "@/components/test/resultados-evaluacion"
import type { BloqueResultado } from "@/lib/test/analisis"
import type { Nivel } from "@/lib/test/bloques"

/**
 * Pantalla final de la evaluación: resultados, estado del guardado (con
 * "Reintentar" si falló) y botones para seguir. Solo presentación: guardar,
 * repetir y navegar son callbacks de la página.
 */
export function FinalEvaluacion({
  nivel,
  porcentajeTotal,
  bloques,
  guardando,
  guardado,
  errorGuardado,
  onReintentar,
  onRepetir,
  onEvaluarOtro,
  onVolverInicio,
}: {
  nivel: Nivel
  porcentajeTotal: number
  bloques: BloqueResultado[]
  guardando: boolean
  guardado: boolean
  errorGuardado: string | null
  onReintentar: () => void
  onRepetir: () => void
  onEvaluarOtro: () => void
  onVolverInicio: () => void
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <EntradaPagina className="space-y-6">
        <h2 className="text-balance text-center text-2xl font-bold text-foreground sm:text-3xl">
          Resultados de la evaluación de indicadores de dislexia
        </h2>

        <ResultadosEvaluacion nivel={nivel} porcentajeTotal={porcentajeTotal} bloques={bloques} />

        {/* Estado del guardado */}
        {guardando && (
          <p role="status" className="flex items-center justify-center gap-2 text-base font-medium text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Guardando resultados...
          </p>
        )}
        {guardado && !guardando && <MensajeAlerta tipo="ok" texto="Resultados guardados" />}
        {errorGuardado && !guardando && (
          <div className="space-y-3">
            <MensajeAlerta tipo="error" texto={`No se pudieron guardar los resultados: ${errorGuardado}`} />
            <div className="flex justify-center">
              <Button variant="outline" onClick={onReintentar}>
                <RotateCcw /> Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3 pb-6 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={onRepetir}>
            <RotateCcw /> Repetir evaluación
          </Button>
          {guardado && (
            <Button className="flex-1" onClick={onEvaluarOtro}>
              <Users /> Evaluar a otro niño
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onVolverInicio}>
            <Home /> Volver al inicio
          </Button>
        </div>
      </EntradaPagina>
    </main>
  )
}
