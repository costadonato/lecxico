import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Marca una función que todavía no está disponible: "En desarrollo" en la
 * landing y /dislexia, "Próximamente" en los juegos del entrenamiento que
 * llegan en S13b y S14.
 */
export function ChipEnDesarrollo({ texto = "En desarrollo", className }: { texto?: string; className?: string }) {
  return (
    <Badge variant="sol" className={cn("px-2.5 py-1 text-xs", className)}>
      {texto}
    </Badge>
  )
}
