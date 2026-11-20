"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Cargando } from "@/components/estados"
import { MarcoJuego, type PropsMarcoJuego } from "@/components/entrenamiento/marco-juego"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { createClient } from "@/lib/supabase/client"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import type { CodigoJuego } from "@/lib/entrenamiento/juegos"
import { gradoDe, gradosHabilitados, tareaIncluye, tareasPendientes } from "@/lib/entrenamiento/partidas"
import { jugadaValida, leerGrado } from "@/lib/entrenamiento/presentacion"
import { nivelParaEtapa } from "@/lib/test/bloques"

type Carga = { estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "listo"; props: PropsMarcoJuego }

/**
 * /entrenamiento/jugar/[juego]?grado=N&tarea=<id> (niño, con el tutor).
 * Sin `tarea` es práctica: si el grado no está habilitado, vuelve a
 * /entrenamiento. Con `tarea`, juega el grado que fijó el profesional
 * (si la tarea no está pendiente o no incluye ese juego, también vuelve).
 */
export default function JugarPage() {
  return (
    <Suspense fallback={<Cargando pantallaCompleta />}>
      <Jugar />
    </Suspense>
  )
}

function Jugar() {
  const router = useRouter()
  const { juego } = useParams<{ juego: string }>()
  const parametros = useSearchParams()
  const grado = leerGrado(parametros.get("grado"))
  const tareaId = parametros.get("tarea")
  const pagina = usePerfilPagina("nino")
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })

  useEffect(() => {
    if (pagina.estado !== "listo") return
    const { profile, nino } = pagina.actual
    if (!nino) return setCarga({ estado: "error", mensaje: "No se encontraron los datos del niño. Recargá la página." })
    const nivel = nivelParaEtapa(nino.etapa_escolar)
    const volver = () => router.replace("/entrenamiento")
    let cancelado = false

    const supabase = createClient()
    Promise.all([gradosHabilitados(supabase, profile.id), tareaId ? tareasPendientes(supabase, profile.id) : Promise.resolve([])])
      .then(([grados, tareas]) => {
        if (cancelado) return
        const habilitado = gradoDe(grados, juego as CodigoJuego)
        const tarea = tareaId ? tareas.find((t) => t.id === tareaId) : undefined
        const valida =
          jugadaValida({ juego, nivel, grado, modo: "nino", enTarea: Boolean(tareaId), habilitado }) &&
          (!tareaId || (tarea !== undefined && tareaIncluye(tarea, juego as CodigoJuego, grado!)))
        if (!valida) return volver()

        setCarga({
          estado: "listo",
          props: {
            juego: juego as CodigoJuego,
            nivel,
            grado: grado!,
            origen: tareaId ? "tarea" : "practica",
            tareaId,
            nino: { id: profile.id, nombre: profile.nombre, apellido: profile.apellido },
            letraInicial: nino.letra_entrenamiento ?? "mayuscula",
            habilitado,
            volverA: "/entrenamiento",
            modo: "nino",
          },
        })
      })
      .catch((e: Error) => !cancelado && setCarga({ estado: "error", mensaje: e.message }))
    return () => {
      cancelado = true
    }
  }, [pagina, juego, grado, tareaId, router])

  if (pagina.estado === "error") {
    return (
      <div className="fondo-nino flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <MensajeAlerta tipo="error" texto={pagina.mensaje} />
        </div>
      </div>
    )
  }
  if (carga.estado === "error") {
    return (
      <div className="fondo-nino flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <MensajeAlerta tipo="error" texto={carga.mensaje} />
        </div>
      </div>
    )
  }
  if (carga.estado === "cargando") return <Cargando pantallaCompleta texto="Preparando el juego…" />
  return <MarcoJuego {...carga.props} />
}
