"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { nombreUsuarioValido, normalizarNombreUsuario } from "@/lib/auth/validaciones"

export type EstadoNombreUsuario = "vacio" | "formato" | "verificando" | "disponible" | "ocupado" | "error"

const DEBOUNCE_MS = 400

/** Consulta la RPC nombre_usuario_disponible (no requiere sesión). */
async function consultarDisponible(nombre: string): Promise<boolean> {
  const { data, error } = await createClient().rpc("nombre_usuario_disponible", { p_nombre: nombre })
  if (error) throw error
  return data === true
}

/**
 * Estado de disponibilidad de un nombre de usuario, con debounce.
 * `propio`: el nombre que el usuario ya tiene (se considera disponible).
 * `verificarAhora()` hace el chequeo sin esperar el debounce; usarlo al
 * enviar el formulario para no confiar en un resultado viejo.
 */
export function useNombreUsuario(valor: string, propio?: string | null) {
  const nombre = normalizarNombreUsuario(valor)
  const [estado, setEstado] = useState<EstadoNombreUsuario>("vacio")

  const estadoLocal = (): EstadoNombreUsuario | null => {
    if (!nombre) return "vacio"
    if (!nombreUsuarioValido(nombre)) return "formato"
    if (propio && nombre === propio) return "disponible"
    return null
  }

  useEffect(() => {
    const local = estadoLocal()
    if (local) {
      setEstado(local)
      return
    }
    setEstado("verificando")
    let cancelado = false
    const t = setTimeout(() => {
      consultarDisponible(nombre)
        .then((ok) => { if (!cancelado) setEstado(ok ? "disponible" : "ocupado") })
        .catch(() => { if (!cancelado) setEstado("error") })
    }, DEBOUNCE_MS)
    return () => { cancelado = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, propio])

  const verificarAhora = useCallback(async (): Promise<EstadoNombreUsuario> => {
    const local = estadoLocal()
    if (local) {
      setEstado(local)
      return local
    }
    try {
      const nuevo: EstadoNombreUsuario = (await consultarDisponible(nombre)) ? "disponible" : "ocupado"
      setEstado(nuevo)
      return nuevo
    } catch {
      setEstado("error")
      return "error"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, propio])

  return { nombre, estado, verificarAhora }
}
