"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, Loader2 } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"
import { Iniciales } from "@/components/iniciales"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { RESORTE } from "@/components/motion/transiciones"
import { LumoCara } from "@/components/personajes/lumo-cara"
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
  const reducir = useReducedMotion()

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
            className="relative flex size-11 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 data-[state=open]:bg-muted"
            aria-label={cantidad > 0 ? `Invitaciones pendientes: ${cantidad}` : "Invitaciones"}
          >
            {/* La campanita se sacude cuando llegan invitaciones nuevas. */}
            <motion.span
              key={cantidad}
              className="flex"
              style={{ transformOrigin: "50% 10%" }}
              initial={{ rotate: 0 }}
              animate={cantidad > 0 && !reducir ? { rotate: [0, -16, 13, -9, 6, 0] } : { rotate: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut", delay: 0.4 }}
            >
              <Bell className="size-5" />
            </motion.span>
            <AnimatePresence>
              {cantidad > 0 && (
                <motion.span
                  key="contador"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={RESORTE}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground ring-2 ring-card"
                >
                  {cantidad > 9 ? "9+" : cantidad}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={10} className="w-[23rem] max-w-[calc(100vw-1.5rem)] overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-border/70 bg-muted/50 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rojo-suave text-rojo-fuerte">
              <Bell className="size-4" />
            </span>
            <div>
              <p className="font-bold">{rol === "nino" ? "Invitaciones recibidas" : "Invitaciones enviadas"}</p>
              {rol === "profesional" && (
                <p className="text-sm text-muted-foreground">Esperando que el tutor las acepte.</p>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <div className="flex justify-center py-6" role="status" aria-label="Cargando invitaciones">
                <LumoCara estado="pensando" tamano={64} />
              </div>
            ) : cantidad === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <LumoCara estado="dormido" tamano={72} />
                <p className="text-base text-muted-foreground">
                  {rol === "nino" ? "No tenés invitaciones pendientes." : "No hay invitaciones esperando respuesta."}
                </p>
              </div>
            ) : rol === "nino" ? (
              <ListaCascada as="ul" className="divide-y divide-border/70">
                {recibidas.map((v) => (
                  <ItemCascada as="li" key={v.id} className="flex gap-3 px-4 py-4">
                    <Iniciales nombre={v.profesional?.nombre} apellido={v.profesional?.apellido} semilla={v.profesional?.nombre_usuario} />
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-base leading-snug">
                        <span className="font-semibold">{nombreProfesional(v)}</span> quiere vincularse como tu profesional
                      </p>
                      <p className="text-sm text-muted-foreground" title={formatearFechaHora(v.fecha_invitacion)}>
                        {tiempoRelativo(v.fecha_invitacion, ahora)}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => aceptar(v.id)} disabled={aceptando !== null}>
                          {aceptando === v.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          Aceptar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => pedirRechazo(v)} disabled={aceptando !== null}>
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </ItemCascada>
                ))}
              </ListaCascada>
            ) : (
              <ListaCascada as="ul" className="divide-y divide-border/70">
                {enviadas.map((v) => (
                  <ItemCascada as="li" key={v.vinculo_id} className="flex items-center gap-3 px-4 py-3">
                    <Iniciales nombre={v.nombre_usuario} semilla={v.nombre_usuario} className="size-9" />
                    <p className="min-w-0 flex-1 text-base leading-snug">
                      <span className="font-semibold">@{v.nombre_usuario}</span>
                      <span className="block text-sm text-muted-foreground" title={formatearFechaHora(v.fecha_invitacion)}>
                        enviada {tiempoRelativo(v.fecha_invitacion, ahora)}
                      </span>
                    </p>
                    <Button size="sm" variant="outline" onClick={() => pedirCancelacion(v)}>
                      Cancelar
                    </Button>
                  </ItemCascada>
                ))}
              </ListaCascada>
            )}
          </div>

          {error && <p className="border-t border-border/70 bg-rojo-suave/50 px-4 py-2 text-sm text-destructive">{error}</p>}
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
