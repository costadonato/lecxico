"use client"

import { useCallback, useState } from "react"
import { AlertCircle, CalendarHeart, History, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cargando, EstadoVacio } from "@/components/estados"
import { Iniciales } from "@/components/iniciales"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { PaginaApp } from "@/components/pagina-app"
import { DialogoContrasenaTutor } from "@/components/tutor/dialogo-contrasena-tutor"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { desvincularComoTutor, useRecargaVinculos, vinculosDelNino } from "@/lib/vinculos"
import type { VinculoDelNino } from "@/lib/types/database"

export default function MisProfesionalesPage() {
  const pagina = usePerfilPagina("nino")
  return (
    <PaginaApp pagina={pagina} titulo="Mis profesionales">
      {({ profile }) => <TablaProfesionales nombreUsuario={profile.nombre_usuario} />}
    </PaginaApp>
  )
}

function TablaProfesionales({ nombreUsuario }: { nombreUsuario: string | null }) {
  const [vinculos, setVinculos] = useState<VinculoDelNino[] | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [desvinculando, setDesvinculando] = useState<VinculoDelNino | null>(null)

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
            <div className="space-y-2">
              <p>Todavía no tenés profesionales vinculados. Cuando uno te invite, vas a ver la invitación en la campanita.</p>
              {nombreUsuario && (
                <p>
                  Para que un profesional te invite, pasale tu nombre de usuario:{" "}
                  <span className="select-all font-semibold text-foreground">@{nombreUsuario}</span>.
                </p>
              )}
            </div>
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
              <p className="relative flex items-center gap-2 text-base">
                <History className="size-5 text-lavanda-fuerte" aria-hidden="true" />
                {v.comparte_historial ? "Comparte el historial" : "No comparte el historial"}
              </p>
              <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                <p className="flex items-center gap-2 text-base">
                  <CalendarHeart className="size-5 text-rojo-fuerte" />
                  <span className="text-muted-foreground">Vinculado desde</span>
                  <span className="font-semibold tabular-nums">{formatearFecha(v.fecha_afiliacion)}</span>
                </p>
                <Button size="sm" variant="outline" onClick={() => setDesvinculando(v)}>
                  Desvincular
                </Button>
              </div>
            </ItemCascada>
          ))}
        </ListaCascada>
      )}

      <DialogoContrasenaTutor
        abierto={desvinculando !== null}
        onCerrar={() => setDesvinculando(null)}
        titulo={`¿Desvincular a ${nombreDe(desvinculando)}?`}
        descripcion={
          <>
            <p>
              {conMayuscula(nombreDe(desvinculando))} va a dejar de ver la información del niño: sus datos, los resultados de las
              evaluaciones y los entrenamientos.
            </p>
            <p>Para volver a vincularse, el profesional tiene que enviar una invitación nueva.</p>
          </>
        }
        textoConfirmar="Desvincular"
        accion={(password) => desvincularComoTutor(desvinculando!.id, password)}
      />
    </>
  )
}

/** "Nombre Apellido" del profesional, o un texto neutro si no se pudo leer. */
function nombreDe(v: VinculoDelNino | null): string {
  const nombre = v?.profesional ? `${v.profesional.nombre} ${v.profesional.apellido}`.trim() : ""
  return nombre || "este profesional"
}

function conMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
