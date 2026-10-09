"use client"

import { useCallback, useState } from "react"
import { AlertCircle, CalendarHeart, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cargando, EstadoVacio } from "@/components/estados"
import { Iniciales } from "@/components/iniciales"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
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
    return <Cargando />
  }

  return (
    <>
      {vinculos.length === 0 ? (
        <EstadoVacio
          personaje="lex"
          descripcion={
            <p>Todavía no tenés profesionales vinculados. Cuando uno te invite, vas a ver la invitación en la campanita.</p>
          }
        />
      ) : (
        <ListaCascada as="ul" className="grid gap-5 sm:grid-cols-2">
          {vinculos.map((v) => (
            <ItemCascada
              as="li"
              key={v.id}
              elevar="suave"
              className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border-2 border-white bg-card p-6 shadow-media"
            >
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-celeste/20 blur-xl" />
              <div className="relative flex items-center gap-4">
                <Iniciales
                  nombre={v.profesional?.nombre}
                  apellido={v.profesional?.apellido}
                  semilla={v.profesional?.nombre_usuario}
                  className="size-14 text-lg"
                />
                <div className="min-w-0">
                  <p className="text-xl font-bold leading-snug">
                    {v.profesional?.nombre} {v.profesional?.apellido}
                  </p>
                  {v.profesional?.nombre_usuario && (
                    <p className="truncate text-base text-muted-foreground">
                      @{v.profesional.nombre_usuario}
                    </p>
                  )}
                </div>
                <span className="ml-auto grid size-10 shrink-0 place-items-center rounded-2xl bg-celeste-suave text-celeste-fuerte">
                  <Stethoscope className="size-5" />
                </span>
              </div>
              <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                <p className="flex items-center gap-2 text-base">
                  <CalendarHeart className="size-5 text-rojo-fuerte" />
                  <span className="text-muted-foreground">Vinculado desde</span>
                  <span className="font-semibold tabular-nums">{formatearFecha(v.fecha_afiliacion)}</span>
                </p>
                <Button size="sm" variant="outline" onClick={() => pedirDesvinculo(v)}>
                  Desvincular
                </Button>
              </div>
            </ItemCascada>
          ))}
        </ListaCascada>
      )}

      <ConfirmarDialog confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} />
    </>
  )
}
