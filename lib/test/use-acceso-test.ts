"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { nivelParaEtapa, type Nivel } from "@/lib/test/bloques"

export const MENSAJE_SOLO_PROFESIONAL =
  "El test se inicia desde la cuenta de un profesional, seleccionando un niño."

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type AccesoTest =
  | { estado: "cargando" }
  | { estado: "permitido"; ninoId: string }
  | { estado: "denegado"; motivo: string }

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

    const verificar = async () => {
      if (!ninoParam || !UUID_RE.test(ninoParam)) {
        return resolver({ estado: "denegado", motivo: MENSAJE_SOLO_PROFESIONAL })
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return resolver({ estado: "denegado", motivo: MENSAJE_SOLO_PROFESIONAL })

      const { data: perfil, error: perfilError } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle()
      if (perfilError) {
        return resolver({ estado: "denegado", motivo: `No se pudo verificar tu cuenta: ${perfilError.message}` })
      }
      if (perfil?.rol !== "profesional") {
        return resolver({ estado: "denegado", motivo: MENSAJE_SOLO_PROFESIONAL })
      }

      // RLS solo deja ver la fila de un niño con vínculo activo.
      const { data: nino, error: ninoError } = await supabase
        .from("ninos")
        .select("etapa_escolar")
        .eq("profile_id", ninoParam)
        .maybeSingle()
      if (ninoError) {
        return resolver({ estado: "denegado", motivo: `No se pudo verificar al niño: ${ninoError.message}` })
      }
      if (!nino) {
        return resolver({ estado: "denegado", motivo: "No tenés un vínculo activo con este niño." })
      }
      const nivelDelNino = nivelParaEtapa(nino.etapa_escolar)
      if (nivelDelNino !== nivel) {
        return resolver({
          estado: "denegado",
          motivo: `Por su etapa escolar, a este niño le corresponde el test de nivel ${nivelDelNino}.`,
        })
      }

      resolver({ estado: "permitido", ninoId: ninoParam })
    }

    verificar()
    return () => { cancelado = true }
  }, [ninoParam, nivel])

  return acceso
}
