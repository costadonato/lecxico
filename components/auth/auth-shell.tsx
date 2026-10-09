import type React from "react"
import Link from "next/link"
import { FondoDecorado } from "@/components/fondo-decorado"
import { LogoLecxico } from "@/components/logo-lecxico"
import { EntradaPagina } from "@/components/motion/entrada-pagina"
import { Personaje } from "@/components/personajes/personaje"
import { cn } from "@/lib/utils"

/**
 * Marco común de las pantallas de cuenta: header con logo y el contenido
 * centrado. Si se pasa `mensaje`, un personaje da la bienvenida (al costado
 * en escritorio, arriba en celular); sin mensaje (términos, privacidad) el
 * contenido usa todo el ancho.
 */
export function AuthShell({
  titulo,
  accion,
  personaje = "lumo",
  mensaje,
  children,
}: {
  titulo?: string
  /** Link o botón a la derecha del header (p. ej. "Iniciar sesión"). */
  accion?: React.ReactNode
  /** Quién da la bienvenida. */
  personaje?: "lex" | "lumo"
  /** Lo que dice el personaje en su globo. */
  mensaje?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <FondoDecorado variante="auth" />
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-full border border-border/70 bg-card/80 pl-5 pr-2 shadow-media backdrop-blur-md sm:pl-6">
          <Link
            href="/"
            aria-label="Lecxico - Inicio"
            className="rounded-lg py-2 outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
          >
            <LogoLecxico titulo="" className="h-5 sm:h-6" />
          </Link>
          {accion ?? (titulo && <span className="pr-4 text-base font-semibold sm:text-lg">{titulo}</span>)}
        </div>
      </header>

      <main
        className={cn(
          "container mx-auto flex flex-1 justify-center px-4 py-8 md:py-12",
          mensaje ? "items-start lg:items-center" : "items-start",
        )}
      >
        <div className={cn("grid w-full max-w-6xl items-center gap-6", mensaje && "lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12")}>
          {mensaje && (
            <>
              {/* Escritorio: personaje grande al costado */}
              <div className="relative hidden flex-col items-center justify-center lg:flex">
                <div aria-hidden="true" className="absolute size-72 rounded-full bg-sol-suave/80" />
                <div aria-hidden="true" className="absolute size-56 translate-y-10 rounded-full bg-celeste-suave" />
                <Personaje
                  personaje={personaje}
                  mensaje={mensaje}
                  ladoGlobo="arriba"
                  conVoz
                  prioridad
                  claseImagen={personaje === "lex" ? "w-56" : "w-44"}
                  claseGlobo="text-center"
                  className="relative"
                />
              </div>

              {/* Celular y tablet: personaje chico arriba del formulario */}
              <Personaje
                personaje={personaje}
                mensaje={mensaje}
                ladoGlobo="derecha"
                conVoz
                claseImagen={personaje === "lex" ? "w-24" : "w-20"}
                claseGlobo="text-base py-3 px-4"
                sombra={false}
                decorativo
                className="mx-auto lg:hidden"
              />
            </>
          )}

          <EntradaPagina className="flex w-full justify-center" retraso={0.1}>
            {children}
          </EntradaPagina>
        </div>
      </main>
    </div>
  )
}
