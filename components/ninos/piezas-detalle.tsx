import Link from "next/link"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Aviso de "no se puede ver" con un botón para volver. Se usa el mismo texto
 * cuando algo no existe y cuando no se tiene acceso: no se revela cuál es.
 */
export function AvisoSinAcceso({ mensaje, volverA, textoVolver }: { mensaje: string; volverA: string; textoVolver: string }) {
  return (
    <Card className="border-2 shadow-sm">
      <CardContent className="py-12 text-center space-y-4">
        <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="font-semibold">{mensaje}</p>
        <Button asChild variant="outline">
          <Link href={volverA}>{textoVolver}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/** Profesional sin vínculo activo (o niño inexistente). */
export function SinAccesoNino() {
  return (
    <AvisoSinAcceso
      mensaje="No tenés acceso a la información de este niño."
      volverA="/ninos"
      textoVolver="Volver a Mis niños"
    />
  )
}

export function CargandoSeccion() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )
}
