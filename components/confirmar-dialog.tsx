"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export interface Confirmacion {
  titulo: string
  descripcion: React.ReactNode
  textoConfirmar: string
  /** Acción a ejecutar; si lanza, el mensaje se muestra en el diálogo. */
  accion: () => Promise<void>
}

/**
 * Diálogo de confirmación controlado: abierto mientras `confirmacion` no
 * sea null. Se renderiza fuera de popovers/menús para que no se cierre
 * junto con ellos.
 */
export function ConfirmarDialog({
  confirmacion,
  onCerrar,
}: {
  confirmacion: Confirmacion | null
  onCerrar: () => void
}) {
  const [ejecutando, setEjecutando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cerrar = () => {
    if (ejecutando) return
    setError(null)
    onCerrar()
  }

  const confirmar = async () => {
    if (!confirmacion) return
    setEjecutando(true)
    setError(null)
    try {
      await confirmacion.accion()
      setEjecutando(false)
      onCerrar()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado. Probá de nuevo.")
      setEjecutando(false)
    }
  }

  return (
    <AlertDialog open={confirmacion !== null} onOpenChange={(abierto) => !abierto && cerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmacion?.titulo}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{confirmacion?.descripcion}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={ejecutando}>Volver</AlertDialogCancel>
          {/* Button común (no AlertDialogAction) para que el diálogo no se cierre antes de terminar. */}
          <Button variant="destructive" onClick={confirmar} disabled={ejecutando}>
            {ejecutando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmacion?.textoConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
