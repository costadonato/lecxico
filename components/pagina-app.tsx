"use client"

import type React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppHeader } from "@/components/app-header"
import type { PerfilPagina } from "@/lib/auth/use-perfil-pagina"
import type { PerfilActual } from "@/lib/auth/perfil"
import type { Profile } from "@/lib/types/database"

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
  children,
}: {
  pagina: PerfilPagina
  titulo: string
  acciones?: React.ReactNode
  /** Destino de la flecha de volver. */
  volverA?: string
  children: (actual: PerfilActual & { profile: Profile }) => React.ReactNode
}) {
  if (pagina.estado === "cargando") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (pagina.estado === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{pagina.mensaje}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <AppHeader profile={pagina.actual.profile} />
      <main className="container mx-auto px-4 mt-8 max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={volverA}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-primary">{titulo}</h1>
          </div>
          {acciones}
        </div>
        {children(pagina.actual)}
      </main>
    </div>
  )
}
