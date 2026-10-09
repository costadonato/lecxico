"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"
import { formatearFechaHora, tiempoRelativo } from "@/lib/fechas"
import {
  cancelarInvitacion,
  responderInvitacion,
  useRecargaVinculos,
  vinculosDelNino,
  vinculosDelProfesional,
} from "@/lib/vinculos"
import type { Rol, VinculoDelNino, VinculoDelProfesional } from "@/lib/types/database"

/**
 * Campanita de invitaciones pendientes.
 * - Niño: invitaciones recibidas, con Aceptar / Rechazar.
 * - Profesional: invitaciones enviadas sin responder, con Cancelar.
 * Se refresca al cargar, al recuperar el foco y después de cada acción.
 * Cada invitación muestra el tiempo transcurrido ("hace 5 minutos"), que se
 * recalcula cada minuto mientras el panel está abierto; la fecha y hora
 * exactas quedan en el title (al pasar el mouse).
 */
export function CampanitaInvitaciones({ rol }: { rol: Rol }) {
  const [recibidas, setRecibidas] = useState<VinculoDelNino[]>([])
  const [enviadas, setEnviadas] = useState<VinculoDelProfesional[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aceptando, setAceptando] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    if (!abierto) return
    setAhora(new Date())
    const intervalo = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(intervalo)
  }, [abierto])

  const recargar = useCallback(async () => {
    try {
      if (rol === "nino") setRecibidas(await vinculosDelNino("pendiente"))
      else setEnviadas((await vinculosDelProfesional()).filter((v) => v.estado === "pendiente"))
      setError(null)
    } catch (e) {
      console.error("campanita:", e)
      setError("No se pudieron cargar las invitaciones.")
    } finally {
      setCargando(false)
    }
  }, [rol])

  useRecargaVinculos(recargar)

  const cantidad = rol === "nino" ? recibidas.length : enviadas.length

  const aceptar = async (id: string) => {
    setAceptando(id)
    setError(null)
    try {
      await responderInvitacion(id, true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo aceptar la invitación.")
    } finally {
      setAceptando(null)
    }
  }

  const pedirRechazo = (v: VinculoDelNino) =>
    setConfirmacion({
      titulo: "¿Rechazar la invitación?",
      descripcion: `${nombreProfesional(v)} no va a quedar vinculado. Si más adelante querés vincularte, te tiene que invitar de nuevo.`,
      textoConfirmar: "Rechazar",
      accion: () => responderInvitacion(v.id, false),
    })

  const pedirCancelacion = (v: VinculoDelProfesional) =>
    setConfirmacion({
      titulo: "¿Cancelar la invitación?",
      descripcion: `La invitación a @${v.nombre_usuario} se va a borrar. Podés volver a enviarla cuando quieras.`,
      textoConfirmar: "Cancelar invitación",
      accion: () => cancelarInvitacion(v.vinculo_id),
    })

  return (
    <>
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative flex items-center justify-center w-10 h-10 rounded-lg text-white transition-colors duration-200 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={cantidad > 0 ? `Invitaciones pendientes: ${cantidad}` : "Invitaciones"}
          >
            <Bell className="w-5 h-5" />
            {cantidad > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-white text-red-600 text-xs font-bold flex items-center justify-center">
                {cantidad > 9 ? "9+" : cantidad}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
          <div className="px-4 py-3 border-b">
            <p className="font-semibold">{rol === "nino" ? "Invitaciones recibidas" : "Invitaciones enviadas"}</p>
            {rol === "profesional" && (
              <p className="text-xs text-muted-foreground">Esperando que el tutor las acepte.</p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : cantidad === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                {rol === "nino" ? "No tenés invitaciones pendientes." : "No hay invitaciones esperando respuesta."}
              </p>
            ) : rol === "nino" ? (
              <ul className="divide-y">
                {recibidas.map((v) => (
                  <li key={v.id} className="px-4 py-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">{nombreProfesional(v)}</span> quiere vincularse como tu profesional
                    </p>
                    <p className="text-xs text-muted-foreground" title={formatearFechaHora(v.fecha_invitacion)}>
                      {tiempoRelativo(v.fecha_invitacion, ahora)}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => aceptar(v.id)} disabled={aceptando !== null}>
                        {aceptando === v.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => pedirRechazo(v)} disabled={aceptando !== null}>
                        Rechazar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y">
                {enviadas.map((v) => (
                  <li key={v.vinculo_id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-semibold">@{v.nombre_usuario}</span>
                      <span className="text-muted-foreground" title={formatearFechaHora(v.fecha_invitacion)}>
                        {" "}· enviada {tiempoRelativo(v.fecha_invitacion, ahora)}
                      </span>
                    </p>
                    <Button size="sm" variant="outline" onClick={() => pedirCancelacion(v)}>
                      Cancelar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="px-4 py-2 border-t text-sm text-destructive">{error}</p>}
        </PopoverContent>
      </Popover>

      <ConfirmarDialog confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} />
    </>
  )
}

/** "Nombre Apellido (@usuario)" del profesional que invitó. */
function nombreProfesional(v: VinculoDelNino): string {
  const p = v.profesional
  if (!p) return "Un profesional"
  const nombre = `${p.nombre} ${p.apellido}`.trim()
  return nombre ? `${nombre} (@${p.nombre_usuario})` : `@${p.nombre_usuario}`
}
