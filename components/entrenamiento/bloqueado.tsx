"use client"

import type React from "react"
import { useId, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * Elemento bloqueado del área del niño: no hace nada, pero en lugar de
 * prohibir explica cómo desbloquearlo. Un cartelito aparece al pasar el
 * cursor, con el foco del teclado o con un toque en celular, y se cierra
 * con Escape, al salir del elemento o al tocar afuera.
 *
 * Se usa el Popover (el Tooltip de Radix no abre con un toque). El texto
 * también está en un aria-describedby fijo, así el lector de pantalla lo
 * lee junto con el rótulo aunque el cartelito esté cerrado.
 */
export function Bloqueado({
  etiqueta,
  explicacion,
  className,
  children,
}: {
  /** aria-label del elemento ("Grado 3, bloqueado"). */
  etiqueta: string
  /** Qué hay que hacer para desbloquearlo. */
  explicacion: string
  className?: string
  children: React.ReactNode
}) {
  const [abierto, setAbierto] = useState(false)
  const idTexto = useId()

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-disabled="true"
          aria-label={etiqueta}
          aria-describedby={idTexto}
          // Un toque o un clic siempre abre (no alterna): con el cursor ya estaba abierto.
          onClick={(e) => {
            e.preventDefault()
            setAbierto(true)
          }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setAbierto(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setAbierto(false)}
          // Solo el foco del teclado abre; el de un clic ya lo resolvió el cursor o el toque.
          onFocus={(e) => e.currentTarget.matches(":focus-visible") && setAbierto(true)}
          onBlur={() => setAbierto(false)}
          className={cn("cursor-help", className)}
        >
          {children}
        </button>
      </PopoverTrigger>
      <span id={idTexto} className="sr-only">
        {explicacion}
      </span>
      <PopoverContent
        role="tooltip"
        side="top"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-auto max-w-64 border-0 bg-pantalla px-4 py-2.5 text-center text-sm font-semibold normal-case leading-snug text-pantalla-foreground"
      >
        {explicacion}
      </PopoverContent>
    </Popover>
  )
}
