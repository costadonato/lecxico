"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { NIVEL_LABEL, nivelParaEtapa, type Nivel } from "@/lib/test/bloques"

export const MENSAJE_SOLO_PROFESIONAL =
  "La evaluación se inicia desde la cuenta de un profesional, seleccionando un niño."

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type AccesoTest =
  | { estado: "cargando" }
  | { estado: "permitido"; ninoId: string; nino: { nombre: string; apellido: string } }
  /** `elegirNino`: el usuario es profesional; se le ofrece volver a /test a elegir otro. */
  | { estado: "denegado"; motivo: string; elegirNino: boolean }

/**
 * Decide si se puede tomar el test `nivel` al niño del query param `nino`.
 * Requiere un usuario con rol 'profesional', vinculado (activo) con el niño,
 * y que la etapa escolar del niño corresponda a `nivel`.
 * Usa useSearchParams: el componente que lo llame debe estar dentro de <Suspense>.
 */
export function useAccesoTest(nivel: Nivel): AccesoTest {
  const ninoParam = useSearchParams().get("nino")
  const [acceso, setAcceso] = useState<AccesoTest>({ estado: "cargando" })

  useEffect(() => {
    let cancelado = false
    const resolver = (a: AccesoTest) => { if (!cancelado) setAcceso(a) }
    const denegar = (motivo: string, elegirNino: boolean) => resolver({ estado: "denegado", motivo, elegirNino })

    const verificar = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return denegar(MENSAJE_SOLO_PROFESIONAL, false)

      const { data: perfil, error: perfilError } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle()
      if (perfilError) return denegar(`No se pudo verificar tu cuenta: ${perfilError.message}`, false)
      if (perfil?.rol !== "profesional") return denegar(MENSAJE_SOLO_PROFESIONAL, false)

      if (!ninoParam || !UUID_RE.test(ninoParam)) return denegar(MENSAJE_SOLO_PROFESIONAL, true)

      // RLS solo deja ver la fila (y el perfil) de un niño con vínculo activo.
      const { data: nino, error: ninoError } = await supabase
        .from("ninos")
        .select("etapa_escolar, perfil:profiles!ninos_profile_id_fkey(nombre, apellido)")
        .eq("profile_id", ninoParam)
        .maybeSingle()
      if (ninoError) return denegar(`No se pudo verificar al niño: ${ninoError.message}`, true)
      if (!nino) return denegar("No tenés un vínculo activo con este niño.", true)

      const nivelDelNino = nivelParaEtapa(nino.etapa_escolar)
      if (nivelDelNino !== nivel) {
        return denegar(
          `Por su etapa escolar, a este niño le corresponde la evaluación de nivel ${NIVEL_LABEL[nivelDelNino]}.`,
          true,
        )
      }

      const perfilNino = nino.perfil as unknown as { nombre: string; apellido: string } | null
      resolver({
        estado: "permitido",
        ninoId: ninoParam,
        nino: { nombre: perfilNino?.nombre ?? "", apellido: perfilNino?.apellido ?? "" },
      })
    }

    verificar()
    return () => { cancelado = true }
  }, [ninoParam, nivel])

  return acceso
}
