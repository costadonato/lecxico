"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Cargando } from "@/components/estados"
import { MarcoJuego, type PropsMarcoJuego } from "@/components/entrenamiento/marco-juego"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { createClient } from "@/lib/supabase/client"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import type { CodigoJuego } from "@/lib/entrenamiento/juegos"
import { gradoDe, gradosHabilitados } from "@/lib/entrenamiento/partidas"
import { jugadaValida, leerGrado, rutaConsulta } from "@/lib/entrenamiento/presentacion"
import { cargarNinoParaEntrenar } from "@/lib/ninos/detalle"
import { nivelParaEtapa } from "@/lib/test/bloques"

type Carga = { estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "listo"; props: PropsMarcoJuego }

/**
 * /ninos/[id]/entrenamiento/[juego]?grado=N: el marco de juego con origen
 * consulta. Sin vínculo activo vuelve a /ninos; un juego o grado inválido,
 * a los juegos del niño.
 */
export default function JugarEnConsultaPage() {
  return (
    <Suspense fallback={<Cargando pantallaCompleta />}>
      <JugarEnConsulta />
    </Suspense>
  )
}

function JugarEnConsulta() {
  const router = useRouter()
  const { id, juego } = useParams<{ id: string; juego: string }>()
  const grado = leerGrado(useSearchParams().get("grado"))
  const pagina = usePerfilPagina("profesional")
  const perfilListo = pagina.estado === "listo"
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })

  useEffect(() => {
    if (!perfilListo) return
    let cancelado = false
    cargarNinoParaEntrenar(id)
      .then(async (r) => {
        if (cancelado) return
        if (r.estado === "sin-acceso") return router.replace("/ninos")
        const { perfil, nino } = r.datos
        const nivel = nivelParaEtapa(nino.etapa_escolar)
        if (!jugadaValida({ juego, nivel, grado, modo: "profesional" })) return router.replace(rutaConsulta(id))
        const grados = await gradosHabilitados(createClient(), id)
        if (cancelado) return
        setCarga({
          estado: "listo",
          props: {
            juego: juego as CodigoJuego,
            nivel,
            grado: grado!,
            origen: "consulta",
            nino: perfil,
            letraInicial: nino.letra_entrenamiento ?? "mayuscula",
            habilitado: gradoDe(grados, juego as CodigoJuego),
            volverA: rutaConsulta(id),
            modo: "profesional",
          },
        })
      })
      .catch((e: Error) => {
        console.error("juego en consulta:", e)
        if (!cancelado) setCarga({ estado: "error", mensaje: "No se pudo cargar el juego. Recargá la página." })
      })
    return () => {
      cancelado = true
    }
  }, [perfilListo, id, juego, grado, router])

  if (pagina.estado === "error" || carga.estado === "error") {
    return (
      <div className="fondo-profesional flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <MensajeAlerta tipo="error" texto={pagina.estado === "error" ? pagina.mensaje : (carga as { mensaje: string }).mensaje} />
        </div>
      </div>
    )
  }
  if (carga.estado === "cargando") return <Cargando pantallaCompleta texto="Preparando el juego…" />
  return <MarcoJuego {...carga.props} />
}
