import type React from "react"
import { cn } from "@/lib/utils"

const SELECCIONADA = {
  rojo: "border-rojo bg-rojo-suave text-rojo-fuerte",
  menta: "border-menta bg-menta-suave text-menta-fuerte",
}

/**
 * Opción de respuesta de la evaluación: botón grande tipo tarjeta. Al elegirla
 * toma el borde y el fondo de `tono`; con `orden` muestra arriba a la derecha
 * el número de orden (ejercicios de "marcá en el orden que escuchaste").
 * El tamaño (relleno y letra) se ajusta con `className`.
 */
export function BotonOpcion({
  seleccionada = false,
  tono = "rojo",
  orden,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "type"> & {
  seleccionada?: boolean
  /** Color del estado seleccionado. */
  tono?: keyof typeof SELECCIONADA
  /** Posición (1, 2, 3…) en que se eligió esta opción. */
  orden?: number
}) {
  return (
    <button
      type="button"
      aria-pressed={seleccionada}
      className={cn(
        "relative flex min-h-11 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-6 py-5 text-lg font-bold outline-none transition-colors duration-200",
        "focus-visible:ring-4 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40",
        seleccionada
          ? SELECCIONADA[tono]
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted",
        className,
      )}
      {...props}
    >
      {orden !== undefined && (
        <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
          {orden}°
        </span>
      )}
      {children}
    </button>
  )
}
