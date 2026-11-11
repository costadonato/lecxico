"use client"

import type React from "react"
import { ArrowLeft } from "lucide-react"
import { FondoDecorado } from "@/components/fondo-decorado"
import { LogoLecxico } from "@/components/logo-lecxico"
import { TestBandaNino } from "@/components/test-banda-nino"
import type { Nivel } from "@/lib/test/bloques"

/**
 * Marco de las pantallas de la evaluación: fondo del niño, header en píldora
 * (logo, nombre del bloque y "Volver") y, si se pasa `nino`, la banda con su
 * nombre y nivel. Solo presentación: lo que hace "Volver" lo decide la página.
 *
 * El header se parece a AppHeader pero sin campanita ni cerrar sesión (sin
 * notificaciones mientras se evalúa). Durante las preguntas no lleva formas
 * flotantes (distraen en una evaluación de dislexia); `decorado` las agrega,
 * pensado para la pantalla de resultados.
 */
export function MarcoEvaluacion({
  etiqueta,
  onVolver,
  nino,
  nivel,
  decorado = false,
  children,
}: {
  /** Texto a la derecha del header (nombre del bloque); oculto en celular. */
  etiqueta?: string
  onVolver: () => void
  nino?: { nombre: string; apellido: string }
  nivel?: Nivel
  /** Agrega las formas flotantes de FondoDecorado (variante "nino"). */
  decorado?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="fondo-nino relative isolate flex min-h-screen flex-col">
      {decorado && <FondoDecorado variante="nino" />}

      <header className="sticky top-0 z-30 shrink-0 px-3 pt-3 sm:px-4">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-full border border-border/70 bg-card/80 pl-5 pr-2 shadow-media backdrop-blur-md sm:pl-6">
          <h1 className="py-2">
            <LogoLecxico className="h-5 sm:h-6" />
          </h1>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {etiqueta && (
              <span className="hidden min-w-0 truncate font-semibold text-muted-foreground sm:inline">{etiqueta}</span>
            )}
            <button
              type="button"
              onClick={onVolver}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-foreground outline-none transition-colors duration-200 hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40"
            >
              <ArrowLeft className="size-4" />
              Volver
            </button>
          </div>
        </div>
      </header>

      {nino && nivel && <TestBandaNino nino={nino} nivel={nivel} />}

      {children}
    </div>
  )
}
