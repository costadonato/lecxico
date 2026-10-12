import Link from "next/link"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoLecxico } from "@/components/logo-lecxico"

const claseNav =
  "rounded-full px-4 py-2 font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"

/** Encabezado de las páginas públicas (portada y /dislexia): píldora flotante y fija. */
export function EncabezadoPublico() {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 rounded-full border border-border/70 bg-card/80 pl-4 pr-2 shadow-media backdrop-blur-md sm:pl-6">
        <Link
          href="/"
          className="rounded-lg py-2 outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
          aria-label="Lecxico - Inicio"
        >
          <LogoLecxico titulo="" className="h-[18px] sm:h-6" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Navegación principal">
          <Link href="/#how-it-works" className={claseNav} aria-label="Conocer cómo funciona Lecxico">
            Cómo Funciona
          </Link>
          <Link href="/dislexia" className={claseNav} aria-label="Información sobre dislexia">
            Sobre la Dislexia
          </Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" className="max-sm:size-11 max-sm:px-0" asChild>
            <Link href="/login">
              <LogIn className="size-5 sm:hidden" />
              <span className="max-sm:sr-only">Iniciar Sesión</span>
            </Link>
          </Button>
          <Button className="max-sm:h-10 max-sm:px-4" asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
