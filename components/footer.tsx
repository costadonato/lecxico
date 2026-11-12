import Link from "next/link"
import { LogoLecxico } from "@/components/logo-lecxico"

const claseLink =
  "inline-flex items-center rounded text-pantalla-foreground/75 transition-colors duration-200 hover:text-celeste focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste/60"

const COLUMNAS = [
  {
    titulo: "Plataforma",
    links: [
      { href: "/#how-it-works", texto: "Cómo funciona" },
      { href: "/dislexia", texto: "Qué es la dislexia" },
    ],
  },
  {
    titulo: "Cuenta",
    links: [
      { href: "/login", texto: "Iniciar sesión" },
      { href: "/register", texto: "Crear cuenta" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { href: "/terminos", texto: "Términos" },
      { href: "/privacidad", texto: "Privacidad" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative bg-pantalla text-pantalla-foreground" role="contentinfo">
      {/* Onda que une el footer con la página */}
      <svg
        aria-hidden="true"
        className="absolute bottom-[calc(100%-1px)] left-0 h-10 w-full text-pantalla"
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
      >
        <path d="M0 40 C 240 0, 480 0, 720 20 S 1200 40, 1440 8 V40 Z" fill="currentColor" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-[10%] size-64 rounded-full bg-celeste/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Logo y descripción */}
          <div className="space-y-5 lg:col-span-2">
            <Link href="/" className="group inline-block rounded-lg" aria-label="Lecxico - Inicio">
              <LogoLecxico titulo="" className="h-7 text-white transition-transform group-hover:scale-105" />
            </Link>
            <p className="max-w-sm leading-relaxed text-pantalla-foreground/75">
              <span className="font-semibold text-pantalla-foreground">Lecxico</span> — Plataforma para profesionales:
              evaluación de indicadores de dislexia y entrenamiento lector para niños de 4 a 8 años.
            </p>
          </div>

          {COLUMNAS.map((col) => (
            <div key={col.titulo} className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{col.titulo}</h3>
              <nav aria-label={col.titulo}>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={claseLink}>
                        {l.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-pantalla-foreground/70">
            © 2026 Lecxico · Trabajo Final de Ingeniería en Informática, FTyCA-UNCa
          </p>
        </div>
      </div>
    </footer>
  )
}
