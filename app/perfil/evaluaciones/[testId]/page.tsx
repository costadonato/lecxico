"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginaApp } from "@/components/pagina-app"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { AvisoSinAcceso, CargandoSeccion } from "@/components/ninos/piezas-detalle"
import { ResultadosTest } from "@/components/test/resultados-test"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { cargarTestDeNino, type TestDeNino } from "@/lib/ninos/detalle"
import { NIVEL_LABEL } from "@/lib/test/bloques"

type Carga = { estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "no-encontrada" } | { estado: "listo"; datos: TestDeNino }

/** Detalle de una evaluación propia, para la cuenta del niño (sin recomendación). */
export default function EvaluacionPropiaPage() {
  const { testId } = useParams<{ testId: string }>()
  const pagina = usePerfilPagina("nino")
  const userId = pagina.estado === "listo" ? pagina.actual.user.id : null
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })

  useEffect(() => {
    if (!userId) return
    let cancelado = false
    // Se busca la evaluación dentro de las del propio niño (nino_id = usuario
    // actual); la RLS ya lo restringe, pero se vuelve a comprobar acá.
    cargarTestDeNino(userId, testId)
      .then((r) => {
        if (cancelado) return
        setCarga(r.estado === "listo" && r.datos.test.nino_id === userId ? r : { estado: "no-encontrada" })
      })
      .catch((e) => {
        console.error("evaluación propia:", e)
        if (!cancelado) setCarga({ estado: "error", mensaje: "No se pudo cargar la evaluación. Recargá la página." })
      })
    return () => { cancelado = true }
  }, [userId, testId])

  const datos = carga.estado === "listo" ? carga.datos : null

  return (
    <PaginaApp
      pagina={pagina}
      titulo={
        datos
          ? `Evaluación de ${datos.perfil.nombre} ${datos.perfil.apellido} · Nivel ${NIVEL_LABEL[datos.test.nivel]} · ${formatearFecha(datos.test.fecha)}`
          : "Detalle de la evaluación"
      }
      acciones={
        datos ? (
          <Button variant="outline" asChild>
            <Link href="/perfil">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mi perfil
            </Link>
          </Button>
        ) : undefined
      }
      volverA="/perfil"
    >
      {() =>
        carga.estado === "cargando" ? (
          <CargandoSeccion />
        ) : carga.estado === "error" ? (
          <MensajeAlerta tipo="error" texto={carga.mensaje} />
        ) : carga.estado === "no-encontrada" ? (
          <AvisoSinAcceso mensaje="No encontramos esta evaluación." volverA="/perfil" textoVolver="Volver a mi perfil" />
        ) : (
          <div className="max-w-2xl">
            <ResultadosTest
              tema="claro"
              nivel={carga.datos.test.nivel}
              porcentajeTotal={carga.datos.test.porcentaje_total}
              bloques={carga.datos.test.bloques}
            />
          </div>
        )
      }
    </PaginaApp>
  )
}
