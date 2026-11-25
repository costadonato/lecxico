"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProveedorLetra } from "@/components/entrenamiento/proveedor-letra"
import { VistaConsulta, type Recomendacion } from "@/components/entrenamiento/vista-consulta"
import { Cargando } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { PaginaApp } from "@/components/pagina-app"
import { createClient } from "@/lib/supabase/client"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { gradosHabilitados, type GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { cargarNinoParaEntrenar, cargarTestsConBloques, type NinoParaEntrenar } from "@/lib/ninos/detalle"
import { recomendacionParaNino } from "@/lib/test/franjas"

type Carga =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; datos: NinoParaEntrenar; grados: GradosHabilitados; recomendacion: Recomendacion }

/**
 * Evaluaciones visibles del niño (misma RLS que el detalle: las del
 * profesional, o las de todos si el tutor compartió el historial) y la
 * recomendación de la última. Si falla, el entrenamiento sigue sin ella.
 */
async function cargarRecomendacion(ninoId: string, datos: NinoParaEntrenar): Promise<Recomendacion> {
  try {
    const tests = await cargarTestsConBloques(createClient(), ninoId)
    return recomendacionParaNino(tests, datos.nino.etapa_escolar)
  } catch (e) {
    console.error("recomendación en consulta:", e)
    return { estado: "error" }
  }
}

/**
 * Modo en consulta (profesional): todos los juegos del nivel del niño,
 * incluido Nombrá rápido, con el grado libre. Solo con vínculo activo; si
 * no, vuelve a /ninos. El switch "Recomendación" (S11b) reagrupa los juegos
 * según la franja de su bloque en la última evaluación.
 */
export default function EntrenamientoConsultaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
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
        const [grados, recomendacion] = await Promise.all([
          gradosHabilitados(createClient(), id),
          cargarRecomendacion(id, r.datos),
        ])
        if (!cancelado) setCarga({ estado: "listo", datos: r.datos, grados, recomendacion })
      })
      .catch((e: Error) => {
        console.error("entrenamiento en consulta:", e)
        if (!cancelado) setCarga({ estado: "error", mensaje: "No se pudo cargar el entrenamiento. Recargá la página." })
      })
    return () => {
      cancelado = true
    }
  }, [perfilListo, id, router])

  return (
    <PaginaApp pagina={pagina} titulo="Entrenar en consulta" volverA={`/ninos/${id}`} ancho="max-w-6xl">
      {() =>
        carga.estado === "cargando" ? (
          <Cargando />
        ) : carga.estado === "error" ? (
          <MensajeAlerta tipo="error" texto={carga.mensaje} />
        ) : (
          <ProveedorLetra ninoId={id} inicial={carga.datos.nino.letra_entrenamiento ?? "mayuscula"}>
            <VistaConsulta ninoId={id} datos={carga.datos} grados={carga.grados} recomendacion={carga.recomendacion} />
          </ProveedorLetra>
        )
      }
    </PaginaApp>
  )
}
