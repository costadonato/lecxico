import type React from "react"
import Link from "next/link"
import Image from "next/image"

/** Marco común de las pantallas de cuenta: header con logo y contenido centrado. */
export function AuthShell({
  titulo,
  accion,
  children,
}: {
  titulo?: string
  /** Link o botón a la derecha del header (p. ej. "Iniciar sesión"). */
  accion?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Lecxico - Inicio">
            <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={40} className="h-8 w-auto" />
          </Link>
          {accion ?? (titulo && <span className="text-lg font-semibold">{titulo}</span>)}
        </div>
      </header>

      <div className="container mx-auto px-4 mt-24 flex-1 flex items-start justify-center py-12">{children}</div>
    </div>
  )
}
