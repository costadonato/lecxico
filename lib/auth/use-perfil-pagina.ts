"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { obtenerPerfilActual, perfilIncompleto, type PerfilActual } from "@/lib/auth/perfil"
import type { Profile, Rol } from "@/lib/types/database"

export type PerfilPagina =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; actual: PerfilActual & { profile: Profile } }

/**
 * Carga el perfil para una página con sesión y resuelve las redirecciones:
 * sin sesión → /login; perfil incompleto → /completar-perfil; si se pasa
 * `rol` y no coincide → /dashboard. Mientras redirige, queda "cargando".
 */
export function usePerfilPagina(rol?: Rol): PerfilPagina {
  const router = useRouter()
  const [estado, setEstado] = useState<PerfilPagina>({ estado: "cargando" })

  useEffect(() => {
    let cancelado = false
    obtenerPerfilActual(createClient())
      .then((actual) => {
        if (cancelado) return
        if (!actual) return router.replace("/login")
        if (!actual.profile) {
          return setEstado({ estado: "error", mensaje: "Tu cuenta no tiene un perfil asociado. Contactá al equipo de Lecxico." })
        }
        if (perfilIncompleto(actual.profile)) return router.replace("/completar-perfil")
        if (rol && actual.profile.rol !== rol) return router.replace("/dashboard")
        setEstado({ estado: "listo", actual: { ...actual, profile: actual.profile } })
      })
      .catch((e) => {
        console.error("usePerfilPagina:", e)
        if (!cancelado) setEstado({ estado: "error", mensaje: "No se pudo cargar tu perfil. Recargá la página." })
      })
    return () => { cancelado = true }
  }, [router, rol])

  return estado
}
