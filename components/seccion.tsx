import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type TonoSeccion = "rojo" | "celeste" | "sol" | "menta" | "lavanda"

const ICONO: Record<TonoSeccion, string> = {
  rojo: "bg-rojo-suave text-rojo-fuerte",
  celeste: "bg-celeste-suave text-celeste-fuerte",
  sol: "bg-sol-suave text-sol-fuerte",
  menta: "bg-menta-suave text-menta-fuerte",
  lavanda: "bg-lavanda-suave text-lavanda-fuerte",
}

const BRILLO: Record<TonoSeccion, string> = {
  rojo: "bg-rojo/10",
  celeste: "bg-celeste/20",
  sol: "bg-sol/25",
  menta: "bg-menta/20",
  lavanda: "bg-lavanda/20",
}

/**
 * Tarjeta de sección con ícono y título (estilo de /perfil y /ninos/[id]).
 * Cada sección tiene un color de apoyo: el ícono y un brillo suave en la esquina.
 */
export function Seccion({
  icono,
  tono,
  titulo,
  acciones,
  className,
  children,
}: {
  icono: React.ReactNode
  tono: TonoSeccion
  titulo: string
  /** Botones a la derecha del título. */
  acciones?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={cn("relative gap-5 overflow-hidden", className)}>
      <span aria-hidden="true" className={cn("pointer-events-none absolute -right-12 -top-16 size-44 rounded-full blur-2xl", BRILLO[tono])} />
      <CardHeader className="relative flex flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl [&_svg]:size-5", ICONO[tono])}>{icono}</div>
          <CardTitle className="text-xl">{titulo}</CardTitle>
        </div>
        {acciones}
      </CardHeader>
      <CardContent className="relative">{children}</CardContent>
    </Card>
  )
}
