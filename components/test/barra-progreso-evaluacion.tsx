import { cn } from "@/lib/utils"

/**
 * Progreso de la evaluación: una línea con un punto por pregunta (completadas
 * en rojo, la actual destacada con anillo y su número, pendientes apagadas) y
 * debajo el nombre del bloque. Solo presentación.
 */
export function BarraProgresoEvaluacion({
  total,
  actual,
  etiqueta,
}: {
  /** Cantidad de preguntas. */
  total: number
  /** Índice (desde 0) de la pregunta actual. */
  actual: number
  /** Texto bajo la barra (nombre del bloque). */
  etiqueta: string
}) {
  return (
    <div className="w-full px-4 py-5 sm:py-6">
      <div
        role="progressbar"
        aria-label="Progreso de la evaluación"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={actual + 1}
        aria-valuetext={`Pregunta ${actual + 1} de ${total}`}
        className="relative mx-auto flex h-8 max-w-4xl items-center justify-between"
      >
        {/* Línea de fondo */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border" />
        {/* Línea completada */}
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(actual / (total - 1)) * 100}%` }}
        />
        {/* Puntos */}
        {Array.from({ length: total }, (_, idx) => {
          const completada = idx < actual
          const esActual = idx === actual
          return (
            <div
              key={idx}
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-all duration-300",
                esActual
                  ? "size-7 border-2 border-primary bg-card ring-4 ring-primary/25 sm:size-8"
                  : "size-1.5 sm:size-3 md:size-4",
                !esActual && (completada ? "bg-primary" : "border border-input/50 bg-muted"),
              )}
            >
              {esActual && <span className="text-xs font-bold text-primary">{idx + 1}</span>}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-muted-foreground">{etiqueta}</p>
    </div>
  )
}
