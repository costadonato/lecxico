import type React from "react"
import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Botón "Escuchar" de la evaluación: píldora celeste con el ícono de volumen.
 * `activo` lo marca mientras suena el audio y `agotado` lo apaga cuando ya no
 * quedan reproducciones. Cuándo se habilita lo decide la página (`disabled`).
 */
export function BotonAudio({
  activo = false,
  agotado = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "type"> & {
  /** El audio está sonando. */
  activo?: boolean
  /** No quedan reproducciones. */
  agotado?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold outline-none transition-all",
        "focus-visible:ring-4 focus-visible:ring-celeste/50",
        activo
          ? "animate-pulse bg-celeste-suave text-celeste-fuerte ring-2 ring-celeste"
          : agotado
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "bg-celeste-suave text-celeste-fuerte hover:brightness-95",
        className,
      )}
      {...props}
    >
      <Volume2 className="size-5 shrink-0" />
      {children}
    </button>
  )
}
