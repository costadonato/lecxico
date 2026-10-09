import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Tarjeta de sección con ícono y título (estilo de /perfil y /ninos/[id]). */
export function Seccion({
  icono,
  colorIcono,
  titulo,
  children,
}: {
  icono: React.ReactNode
  /** Clases de fondo y color del ícono, p. ej. "bg-blue-100 text-blue-600". */
  colorIcono: string
  titulo: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-2 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorIcono}`}>{icono}</div>
          <CardTitle className="text-xl">{titulo}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
