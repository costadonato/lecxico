"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * Preferencia del profesional en Entrenar en consulta (S11b): ver los
 * juegos agrupados según la recomendación. Es una preferencia de pantalla,
 * global del profesional (no por niño) y no un dato del niño, así que va en
 * localStorage y no en la base. Leer y escribir puede fallar (modo privado,
 * almacenamiento bloqueado): en ese caso arranca apagada y no se recuerda.
 */
const CLAVE = "lecxico:recomendacion-consulta"

export function useRecomendacionConsulta(): [boolean, (valor: boolean) => void] {
  const [prendida, setPrendida] = useState(false)

  // Se lee después de montar: en el servidor no hay localStorage.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE) === "1") setPrendida(true)
    } catch {
      // Sin acceso al almacenamiento: queda apagada.
    }
  }, [])

  const cambiar = (valor: boolean) => {
    setPrendida(valor)
    try {
      window.localStorage.setItem(CLAVE, valor ? "1" : "0")
    } catch {
      // No se pudo guardar: vale solo para esta visita.
    }
  }

  return [prendida, cambiar]
}

/**
 * Switch "Recomendación", con el estilo de SwitchLetra (lavanda prendido,
 * foco visible). La pista mide 28 px, pero el área táctil llega a 44 px con
 * un pseudo-elemento. `id` lo asocia con su <label>; `idMotivo`, con el
 * texto que explica por qué está deshabilitado.
 */
export function SwitchRecomendacion({
  id,
  prendida,
  onCambiar,
  deshabilitado,
  idMotivo,
  className,
}: {
  id: string
  prendida: boolean
  onCambiar: (valor: boolean) => void
  deshabilitado: boolean
  idMotivo?: string
  className?: string
}) {
  return (
    <Switch
      id={id}
      checked={prendida && !deshabilitado}
      onCheckedChange={onCambiar}
      disabled={deshabilitado}
      aria-describedby={idMotivo}
      className={cn(
        "relative h-7 w-12 border-border shadow-none outline-none hover:border-lavanda focus-visible:ring-4 focus-visible:ring-ring/40",
        "data-[state=checked]:border-lavanda-fuerte data-[state=checked]:bg-lavanda-fuerte data-[state=unchecked]:bg-muted",
        "after:absolute after:-inset-x-1 after:-inset-y-2 after:content-['']",
        "[&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:shadow-suave",
        "[&_[data-slot=switch-thumb][data-state=unchecked]]:translate-x-[2px] [&_[data-slot=switch-thumb][data-state=checked]]:translate-x-[24px]",
        className,
      )}
    />
  )
}
