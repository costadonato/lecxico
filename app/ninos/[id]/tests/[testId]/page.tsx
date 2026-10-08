"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginaApp } from "@/components/pagina-app"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { CargandoSeccion, SinAccesoNino } from "@/components/ninos/piezas-detalle"
import { ResultadosTest } from "@/components/test/resultados-test"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { cargarTestDeNino, type TestDeNino } from "@/lib/ninos/detalle"
import { NIVEL_LABEL } from "@/lib/test/bloques"

type Carga = { estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "sin-acceso" } | { estado: "listo"; datos: TestDeNino }

/** Un test del historial con el mismo desglose que la pantalla final del test. */
export default function DetalleTestPage() {
  const { id, testId } = useParams<{ id: string; testId: string }>()
  const pagina = usePerfilPagina("profesional")
  const perfilListo = pagina.estado === "listo"
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })

  useEffect(() => {
    if (!perfilListo) return
    let cancelado = false
    cargarTestDeNino(id, testId)
      .then((r) => { if (!cancelado) setCarga(r) })
      .catch((e) => {
        console.error("detalle test:", e)
        if (!cancelado) setCarga({ estado: "error", mensaje: "No se pudo cargar el test. Recargá la página." })
      })
    return () => { cancelado = true }
  }, [perfilListo, id, testId])

  const datos = carga.estado === "listo" ? carga.datos : null
  const volver = `/ninos/${id}`

  return (
    <PaginaApp
      pagina={pagina}
      titulo={
        datos
          ? `Test de ${datos.perfil.nombre} ${datos.perfil.apellido} · Nivel ${NIVEL_LABEL[datos.test.nivel]} · ${formatearFecha(datos.test.fecha)}`
          : "Detalle del test"
      }
      acciones={
        datos ? (
          <Button variant="outline" asChild>
            <Link href={volver}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al detalle del niño
            </Link>
          </Button>
        ) : undefined
      }
      volverA={datos ? volver : "/ninos"}
    >
      {() =>
        carga.estado === "cargando" ? (
          <CargandoSeccion />
        ) : carga.estado === "error" ? (
          <MensajeAlerta tipo="error" texto={carga.mensaje} />
        ) : carga.estado === "sin-acceso" ? (
          <SinAccesoNino />
        ) : (
          <div className="max-w-2xl">
            <ResultadosTest
              tema="claro"
              nivel={carga.datos.test.nivel}
              porcentajeTotal={carga.datos.test.porcentaje_total}
              conclusion={carga.datos.test.conclusion}
              bloques={carga.datos.test.bloques}
            />
          </div>
        )
      }
    </PaginaApp>
  )
}
