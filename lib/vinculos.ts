"use client"

/**
 * Vínculos profesional–niño desde el cliente. Las escrituras pasan por las
 * RPC de supabase/migrations/0003; sus errores traen un mensaje en español
 * pensado para mostrarse tal cual, así que se relanzan como Error(message).
 */
import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { VinculoDelNino, VinculoDelProfesional } from "@/lib/types/database"

function lanzar(error: { message: string } | null) {
  if (error) throw new Error(error.message || "Ocurrió un error inesperado. Probá de nuevo.")
}

/* ------------------------------------------------------------------ */
/*  Profesional                                                        */
/* ------------------------------------------------------------------ */

/** Todos los vínculos del profesional actual (cualquier estado). */
export async function vinculosDelProfesional(): Promise<VinculoDelProfesional[]> {
  const { data, error } = await createClient().rpc("vinculos_del_profesional")
  lanzar(error)
  return (data ?? []) as VinculoDelProfesional[]
}

/** Invita (o re-invita) a un niño por su nombre de usuario exacto. */
export async function invitarNino(nombreUsuario: string): Promise<string> {
  const { data, error } = await createClient().rpc("invitar_nino", { p_nombre_usuario: nombreUsuario })
  lanzar(error)
  avisarCambioVinculos()
  return data as string
}

export async function cancelarInvitacion(vinculoId: string): Promise<void> {
  const { error } = await createClient().rpc("cancelar_invitacion", { p_vinculo_id: vinculoId })
  lanzar(error)
  avisarCambioVinculos()
}

/* ------------------------------------------------------------------ */
/*  Niño                                                               */
/* ------------------------------------------------------------------ */

/**
 * Vínculos del niño actual en un estado, con el perfil del profesional.
 * Lectura directa: la RLS deja al niño ver sus filas y el perfil de los
 * profesionales con vínculo pendiente o activo.
 */
export async function vinculosDelNino(estado: "pendiente" | "activa"): Promise<VinculoDelNino[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("profesional_nino")
    .select(
      "id, estado, fecha_invitacion, fecha_afiliacion, profesional:profiles!profesional_nino_profesional_id_fkey(nombre, apellido, nombre_usuario)",
    )
    .eq("nino_id", user.id)
    .eq("estado", estado)
    .order("fecha_invitacion", { ascending: false })
  lanzar(error)
  return (data ?? []) as unknown as VinculoDelNino[]
}

export async function responderInvitacion(vinculoId: string, aceptar: boolean): Promise<void> {
  const { error } = await createClient().rpc("responder_invitacion", { p_vinculo_id: vinculoId, p_aceptar: aceptar })
  lanzar(error)
  avisarCambioVinculos()
}

/* ------------------------------------------------------------------ */
/*  Ambos                                                              */
/* ------------------------------------------------------------------ */

/** Baja lógica de un vínculo activo (la puede pedir el profesional o el niño). */
export async function desvincular(vinculoId: string): Promise<void> {
  const { error } = await createClient().rpc("desvincular", { p_vinculo_id: vinculoId })
  lanzar(error)
  avisarCambioVinculos()
}

/* ------------------------------------------------------------------ */
/*  Refresco (sin Realtime)                                            */
/* ------------------------------------------------------------------ */

const EVENTO_CAMBIO = "lecxico:vinculos-cambiaron"

/** Avisa a la campanita y a las tablas abiertas que hubo un cambio. */
export function avisarCambioVinculos() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO_CAMBIO))
}

/**
 * Ejecuta `recargar` al montar, cuando la ventana recupera el foco y
 * después de cada acción sobre vínculos (avisarCambioVinculos).
 */
export function useRecargaVinculos(recargar: () => void) {
  const ref = useRef(recargar)
  ref.current = recargar

  useEffect(() => {
    const handler = () => ref.current()
    handler()
    window.addEventListener("focus", handler)
    window.addEventListener(EVENTO_CAMBIO, handler)
    return () => {
      window.removeEventListener("focus", handler)
      window.removeEventListener(EVENTO_CAMBIO, handler)
    }
  }, [])
}
