"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { CatalogoJuegos } from "@/components/entrenamiento/catalogo-juegos"
import { ProveedorLetra } from "@/components/entrenamiento/proveedor-letra"
import { SwitchLetra } from "@/components/entrenamiento/switch-letra"
import { Cargando } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { PaginaApp } from "@/components/pagina-app"
import { TestBandaNino } from "@/components/test-banda-nino"
import { createClient } from "@/lib/supabase/client"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { gradosHabilitados, type GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { rutaConsulta } from "@/lib/entrenamiento/presentacion"
import { cargarNinoParaEntrenar, type NinoParaEntrenar } from "@/lib/ninos/detalle"
import { nivelParaEtapa } from "@/lib/test/bloques"

type Carga = { estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "listo"; datos: NinoParaEntrenar; grados: GradosHabilitados }

/**
 * Modo en consulta (profesional): todos los juegos del nivel del niño,
 * incluido Nombrá rápido, con el grado libre. Solo con vínculo activo; si
 * no, vuelve a /ninos.
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
        const grados = await gradosHabilitados(createClient(), id)
        if (!cancelado) setCarga({ estado: "listo", datos: r.datos, grados })
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
            <div className="space-y-8">
              <div className="-mx-4 -mt-2">
                <TestBandaNino nino={carga.datos.perfil} nivel={nivelParaEtapa(carga.datos.nino.etapa_escolar)} prefijo="Entrenamiento de" />
              </div>
              <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card px-5 py-4 shadow-suave sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-3 text-base">
                  <Info className="mt-0.5 size-5 shrink-0 text-celeste-fuerte" aria-hidden="true" />
                  <span>
                    Elegí un juego y un grado para jugar con el niño. Las partidas quedan en su historial como
                    «Consulta» y, con 80 % o más, desbloquean el grado siguiente en casa.
                  </span>
                </p>
                <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
                  <span className="text-sm font-semibold text-muted-foreground">Tipo de letra</span>
                  <SwitchLetra />
                </div>
              </div>
              <CatalogoJuegos
                nivel={nivelParaEtapa(carga.datos.nino.etapa_escolar)}
                modo="profesional"
                grados={carga.grados}
                hrefGrado={(juego, grado) => rutaConsulta(id, juego, grado)}
              />
            </div>
          </ProveedorLetra>
        )
      }
    </PaginaApp>
  )
}
