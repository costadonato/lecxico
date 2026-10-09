import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Cargando, EstadoVacio } from "@/components/estados"

/**
 * Aviso de "no se puede ver" con un botón para volver. Se usa el mismo texto
 * cuando algo no existe y cuando no se tiene acceso: no se revela cuál es.
 */
export function AvisoSinAcceso({ mensaje, volverA, textoVolver }: { mensaje: string; volverA: string; textoVolver: string }) {
  return (
    <EstadoVacio
      titulo={
        <span className="inline-flex items-center gap-2">
          <Lock className="size-5 text-muted-foreground" />
          {mensaje}
        </span>
      }
      accion={
        <Button asChild variant="outline">
          <Link href={volverA}>{textoVolver}</Link>
        </Button>
      }
    />
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
  return <Cargando />
}
