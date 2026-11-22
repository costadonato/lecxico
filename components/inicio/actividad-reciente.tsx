"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { History } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  cargarActividadReciente,
  contarRecientes,
  DIAS_INSIGNIA,
  filasActividad,
  textoInsignia,
  type FilaActividad,
} from "@/lib/inicio/actividad"
import { createClient } from "@/lib/supabase/client"
import { ninosParaTest } from "@/lib/test/ninos-para-test"
import { cn } from "@/lib/utils"

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; filas: FilaActividad[]; recientes: number }

/*
 * Opacidad del panel. vidrio-fuerte (80 %) no llega a 4,5:1 con el texto
 * gris cuando el popover queda encima del cuadro oscuro de Lumo del panel
 * del saludo; al 92 % sí (medido: ver docs/estado-proyecto.md).
 */
const ALFA_PANEL = "[--vidrio-alfa:0.92]"

const DURACION = 0.18

/**
 * Botón circular del inicio del profesional con las últimas evaluaciones y
 * partidas de sus niños. Lleva una insignia con las de los últimos 7 días.
 * En escritorio abre un popover hacia abajo; en celular, un panel que sube
 * desde abajo. Se cierra con Escape, tocando afuera o con el mismo botón, y
 * el foco vuelve al botón.
 */
export function ActividadReciente({ className }: { className?: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" })
  const [abierto, setAbierto] = useState(false)
  const celular = useIsMobile()
  const reducir = useReducedMotion()
  const botonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const idPanel = useId()
  const idTitulo = useId()
  const idInsignia = useId()

  useEffect(() => {
    let vigente = true
    ;(async () => {
      try {
        const ninos = await ninosParaTest()
        const actividades = await cargarActividadReciente(createClient(), ninos)
        const ahora = new Date()
        if (vigente) {
          setEstado({
            tipo: "listo",
            filas: filasActividad(actividades, ninos, ahora),
            recientes: contarRecientes(actividades, ahora),
          })
        }
      } catch (e) {
        console.error("actividad reciente:", e)
        if (vigente) setEstado({ tipo: "error" })
      }
    })()
    return () => {
      vigente = false
    }
  }, [])

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false)
    if (devolverFoco) botonRef.current?.focus()
  }, [])

  // Al abrir, el foco va al título del panel.
  useEffect(() => {
    if (abierto) tituloRef.current?.focus()
  }, [abierto])

  // Escape y toque afuera.
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        cerrar()
      }
    }
    const alTocar = (e: PointerEvent) => {
      const destino = e.target as Node
      if (panelRef.current?.contains(destino) || botonRef.current?.contains(destino)) return
      // Si tocó otro control, el foco queda en ese control. Si no, vuelve al
      // botón después del mousedown del toque, que si no lo manda al <body>.
      const interactivo = destino instanceof Element && destino.closest("a, button, input, select, textarea")
      cerrar(false)
      if (!interactivo) window.setTimeout(() => botonRef.current?.focus(), 0)
    }
    document.addEventListener("keydown", alTeclear)
    document.addEventListener("pointerdown", alTocar)
    return () => {
      document.removeEventListener("keydown", alTeclear)
      document.removeEventListener("pointerdown", alTocar)
    }
  }, [abierto, cerrar])

  const insignia = estado.tipo === "listo" ? textoInsignia(estado.recientes) : null

  // Escritorio: escala y fundido desde la esquina del botón. Celular: sube
  // desde abajo. Con reducir movimiento, solo fundido.
  const animacion = reducir
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : celular
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
      : { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.94 } }

  return (
    <div className={cn("relative w-fit", className)}>
      <button
        ref={botonRef}
        type="button"
        aria-label="Actividad reciente"
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-describedby={insignia ? idInsignia : undefined}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        className="vidrio relative grid size-12 place-items-center rounded-full text-rojo-fuerte transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
      >
        <History className="size-[22px]" aria-hidden="true" />
        {insignia && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-rojo px-1 text-[0.6875rem] font-bold leading-none text-white"
          >
            {insignia}
          </span>
        )}
      </button>
      {insignia && (
        <span id={idInsignia} className="sr-only">
          {insignia === "9+"
            ? `Más de 9 actividades en los últimos ${DIAS_INSIGNIA} días`
            : `${insignia} ${insignia === "1" ? "actividad" : "actividades"} en los últimos ${DIAS_INSIGNIA} días`}
        </span>
      )}

      <AnimatePresence>
        {abierto && celular && (
          <motion.div
            key="velo"
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-pantalla/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURACION }}
          />
        )}
        {abierto && (
          <motion.div
            key="panel"
            ref={panelRef}
            id={idPanel}
            role="dialog"
            aria-labelledby={idTitulo}
            {...animacion}
            transition={{ duration: DURACION, ease: "easeOut" }}
            style={celular ? undefined : { transformOrigin: "top left" }}
            className={cn(
              "vidrio-fuerte flex flex-col",
              ALFA_PANEL,
              celular
                ? "fixed inset-x-0 bottom-0 z-50 max-h-[80vh] rounded-t-[2rem] pb-[max(1rem,env(safe-area-inset-bottom))]"
                : "absolute left-0 top-full z-20 mt-2 max-h-[min(32rem,70vh)] w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl",
            )}
          >
            {celular && <span aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-foreground/20" />}
            <h2
              ref={tituloRef}
              id={idTitulo}
              tabIndex={-1}
              className="px-5 pb-2 pt-4 text-lg font-bold text-foreground outline-none focus-visible:underline focus-visible:decoration-rojo focus-visible:decoration-2 focus-visible:underline-offset-4"
            >
              Actividad reciente
            </h2>
            <div className="min-h-0 overflow-y-auto px-2 pb-3">
              <ContenidoPanel estado={estado} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ContenidoPanel({ estado }: { estado: Estado }) {
  if (estado.tipo === "cargando") {
    return (
      <ul aria-label="Cargando la actividad" className="space-y-1">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="flex items-start gap-3 px-3 py-2.5">
            <span className="mt-2 size-2.5 shrink-0 animate-pulse rounded-full bg-muted" />
            <span className="flex-1 space-y-2">
              <span className="block h-4 w-24 animate-pulse rounded-full bg-muted" />
              <span className="block h-3.5 w-44 animate-pulse rounded-full bg-muted" />
            </span>
            <span className="h-3.5 w-10 animate-pulse rounded-full bg-muted" />
          </li>
        ))}
      </ul>
    )
  }

  if (estado.tipo === "error") {
    return <p className="px-3 py-2 text-base text-muted-foreground">No se pudo cargar la actividad. Probá más tarde.</p>
  }

  if (estado.filas.length === 0) {
    return (
      <p className="px-3 py-2 text-base text-muted-foreground">
        Todavía no hay actividad. Cuando evalúes o entrenes a un niño, va a aparecer acá.
      </p>
    )
  }

  return (
    <ul className="space-y-0.5">
      {estado.filas.map((f) => (
        <li key={f.clave}>
          <Link
            href={f.href}
            className="flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-rojo-suave/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
          >
            <span
              aria-hidden="true"
              className={cn("mt-2 size-2.5 shrink-0 rounded-full", f.tipo === "evaluacion" ? "bg-rojo" : "bg-mandarina")}
            />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug text-foreground">{f.nino}</span>
              <span className="block text-sm text-muted-foreground">{f.texto}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap pt-0.5 text-sm text-muted-foreground">{f.fecha}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
