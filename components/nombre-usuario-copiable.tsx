"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * "@usuario" con un botón para copiarlo. Se copia sin la arroba: es lo que
 * el profesional escribe para invitar (invitar_nino busca el nombre exacto).
 * Si el portapapeles no está disponible, no hay botón y el texto sigue
 * visible y seleccionable.
 */
export function NombreUsuarioCopiable({ nombreUsuario }: { nombreUsuario: string }) {
  const [puedeCopiar, setPuedeCopiar] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Se decide en el navegador: en el servidor no hay navigator.
  useEffect(() => {
    setPuedeCopiar(typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function")
  }, [])

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 2500)
    return () => clearTimeout(t)
  }, [copiado])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(nombreUsuario)
      setCopiado(true)
    } catch {
      // Sin permiso o sin contexto seguro: queda el texto para seleccionar.
      setPuedeCopiar(false)
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="select-all break-all">@{nombreUsuario}</span>
      {puedeCopiar && (
        <Button type="button" size="sm" variant="outline" onClick={copiar} className="h-8 gap-1.5 px-3">
          {copiado ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          <span aria-live="polite">{copiado ? "Copiado" : "Copiar"}</span>
        </Button>
      )}
    </span>
  )
}
