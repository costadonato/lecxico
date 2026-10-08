import type React from "react"
import Link from "next/link"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Mismo mensaje para "no existe" y "no está vinculado": no se revela cuál es. */
export function SinAccesoNino() {
  return (
    <Card className="border-2 shadow-sm">
      <CardContent className="py-12 text-center space-y-4">
        <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="font-semibold">No tenés acceso a la información de este niño.</p>
        <Button asChild variant="outline">
          <Link href="/ninos">Volver a Mis niños</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function CargandoSeccion() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )
}

/** Tarjeta de sección con ícono y título, en el estilo de /perfil y /ninos. */
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
