"use client"

import type React from "react"
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { cambiarLetraEntrenamiento, type LetraEntrenamiento } from "@/lib/entrenamiento/partidas"
import { cn } from "@/lib/utils"

interface ContextoLetra {
  letra: LetraEntrenamiento
  cambiar: (letra: LetraEntrenamiento) => void
  /** Mensaje si no se pudo guardar el último cambio. */
  error: string | null
}

const Contexto = createContext<ContextoLetra | null>(null)

/**
 * Preferencia del switch "A a" (MAYÚSCULA o minúscula) de un niño. Arranca
 * con ninos.letra_entrenamiento y cada cambio se guarda con
 * cambiar_letra_entrenamiento (lo puede cambiar el niño o un profesional con
 * vínculo activo). El cambio se ve enseguida; si no se pudo guardar, queda
 * `error` y la letra elegida sigue en esta pantalla.
 */
export function ProveedorLetra({
  ninoId,
  inicial,
  children,
}: {
  ninoId: string
  inicial: LetraEntrenamiento
  children: React.ReactNode
}) {
  const [letra, setLetra] = useState<LetraEntrenamiento>(inicial)
  const [error, setError] = useState<string | null>(null)
  const ultimo = useRef(0)

  const cambiar = useCallback(
    (nueva: LetraEntrenamiento) => {
      setLetra(nueva)
      setError(null)
      const turno = ++ultimo.current
      cambiarLetraEntrenamiento(createClient(), ninoId, nueva).catch((e: Error) => {
        console.error("cambiar letra:", e)
        if (turno === ultimo.current) setError(e.message)
      })
    },
    [ninoId],
  )

  const valor = useMemo(() => ({ letra, cambiar, error }), [letra, cambiar, error])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useLetra(): ContextoLetra {
  const c = useContext(Contexto)
  if (!c) throw new Error("useLetra va dentro de <ProveedorLetra>")
  return c
}

/**
 * Contenedor cuyo texto se ve en la letra elegida (text-transform por
 * `data-letra`, ver app/globals.css). Va alrededor del área de juego.
 */
export function AreaLetra({
  className,
  children,
  as: Comp = "div",
}: {
  className?: string
  children: React.ReactNode
  as?: "div" | "main" | "section"
}) {
  const { letra } = useLetra()
  return (
    <Comp data-letra={letra} className={cn(className)}>
      {children}
    </Comp>
  )
}
