"use client"

import type React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppHeader } from "@/components/app-header"
import { Cargando } from "@/components/estados"
import { FondoDecorado } from "@/components/fondo-decorado"
import { EntradaPagina } from "@/components/motion/entrada-pagina"
import type { PerfilPagina } from "@/lib/auth/use-perfil-pagina"
import type { PerfilActual } from "@/lib/auth/perfil"
import type { Profile } from "@/lib/types/database"
import { cn } from "@/lib/utils"

/**
 * Marco de las páginas de gestión (/ninos, /mis-profesionales, /test...):
 * AppHeader, flecha para volver (por defecto al inicio), título y acciones.
 * Muestra carga o error mientras el perfil no está listo; `children` recibe
 * el perfil ya resuelto.
 */
export function PaginaApp({
  pagina,
  titulo,
  acciones,
  volverA = "/dashboard",
  ancho,
  children,
}: {
  pagina: PerfilPagina
  titulo: string
  acciones?: React.ReactNode
  /** Destino de la flecha de volver. */
  volverA?: string
  /** Ancho máximo del contenido (clase de Tailwind); por defecto max-w-5xl. */
  ancho?: string
  children: (actual: PerfilActual & { profile: Profile }) => React.ReactNode
}) {
  if (pagina.estado === "cargando") {
    return <Cargando pantallaCompleta />
  }

  if (pagina.estado === "error") {
    return (
      <div className="fondo-profesional flex min-h-screen items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{pagina.mensaje}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <MarcoPagina profile={pagina.actual.profile} titulo={titulo} acciones={acciones} volverA={volverA} ancho={ancho}>
      {children(pagina.actual)}
    </MarcoPagina>
  )
}

/**
 * Parte visual del marco: fondo según el rol (festivo para el niño, sereno
 * para el profesional), header, botón de volver, título y acciones.
 */
export function MarcoPagina({
  profile,
  titulo,
  acciones,
  volverA = "/dashboard",
  etiquetaVolver = "Volver",
  ancho = "max-w-5xl",
  children,
}: {
  profile: Pick<Profile, "nombre" | "rol"> | null
  titulo: React.ReactNode
  acciones?: React.ReactNode
  volverA?: string
  etiquetaVolver?: string
  /** Ancho máximo del contenido (clase de Tailwind). */
  ancho?: string
  children: React.ReactNode
}) {
  const nino = profile?.rol === "nino"

  return (
    <div className={cn("relative isolate min-h-screen pb-16", nino ? "fondo-nino" : "fondo-profesional")}>
      <FondoDecorado variante={nino ? "nino" : "profesional"} />
      {profile && <AppHeader profile={profile} />}
      <main className={cn("container mx-auto mt-8 px-4 sm:mt-10", ancho)}>
        <EntradaPagina className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={volverA}
                className="group grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-suave transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
                aria-label={etiquetaVolver}
              >
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
              </Link>
              <h1 className="min-w-0 text-balance text-2xl font-bold leading-tight text-foreground sm:text-3xl">{titulo}</h1>
            </div>
            {acciones}
          </div>
          {children}
        </EntradaPagina>
      </main>
    </div>
  )
}
