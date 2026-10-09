"use client"

import { useCallback, useState } from "react"
import { AlertCircle, Loader2, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaginaApp } from "@/components/pagina-app"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { desvincular, useRecargaVinculos, vinculosDelNino } from "@/lib/vinculos"
import type { VinculoDelNino } from "@/lib/types/database"

export default function MisProfesionalesPage() {
  const pagina = usePerfilPagina("nino")
  return (
    <PaginaApp pagina={pagina} titulo="Mis profesionales">
      {() => <TablaProfesionales />}
    </PaginaApp>
  )
}

function TablaProfesionales() {
  const [vinculos, setVinculos] = useState<VinculoDelNino[] | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)

  const recargar = useCallback(async () => {
    try {
      const activos = await vinculosDelNino("activa")
      const comparar = (a = "", b = "") => a.localeCompare(b, "es", { sensitivity: "base" })
      activos.sort(
        (a, b) =>
          comparar(a.profesional?.apellido, b.profesional?.apellido) || comparar(a.profesional?.nombre, b.profesional?.nombre),
      )
      setVinculos(activos)
      setErrorCarga(null)
    } catch (e) {
      console.error("mis-profesionales:", e)
      setErrorCarga("No se pudo cargar la lista de profesionales. Recargá la página.")
    }
  }, [])

  useRecargaVinculos(recargar)

  const pedirDesvinculo = (v: VinculoDelNino) => {
    const nombre = v.profesional ? `${v.profesional.nombre} ${v.profesional.apellido}`.trim() : "Este profesional"
    setConfirmacion({
      titulo: `¿Desvincular a ${nombre}?`,
      descripcion: (
        <>
          <p>
            {nombre} va a dejar de ver la información del niño: sus datos, los resultados de las evaluaciones y los
            entrenamientos.
          </p>
          <p className="mt-2">Para volver a vincularse, el profesional tiene que enviar una invitación nueva.</p>
        </>
      ),
      textoConfirmar: "Desvincular",
      accion: () => desvincular(v.id),
    })
  }

  if (errorCarga) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorCarga}</AlertDescription>
      </Alert>
    )
  }
  if (!vinculos) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      {vinculos.length === 0 ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Todavía no tenés profesionales vinculados. Cuando uno te invite, vas a ver la invitación en la campanita.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 shadow-sm overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-left">
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Apellido</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Vinculado desde</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vinculos.map((v) => (
                  <tr key={v.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{v.profesional?.nombre}</td>
                    <td className="px-4 py-3 font-medium">{v.profesional?.apellido}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {v.profesional?.nombre_usuario && `@${v.profesional.nombre_usuario}`}
                    </td>
                    <td className="px-4 py-3">{formatearFecha(v.fecha_afiliacion)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => pedirDesvinculo(v)}>
                        Desvincular
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmarDialog confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} />
    </>
  )
}
