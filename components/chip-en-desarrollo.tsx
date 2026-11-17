import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Marca una función que todavía no está disponible (landing y /dislexia). */
export function ChipEnDesarrollo({ className }: { className?: string }) {
  return (
    <Badge variant="sol" className={cn("px-2.5 py-1 text-xs", className)}>
      En desarrollo
    </Badge>
  )
}
