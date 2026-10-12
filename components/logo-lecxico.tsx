import { cn } from "@/lib/utils"

/**
 * Logo de Lecxico redibujado en SVG a partir del original: LECXICO en trazo
 * fino, con la E de tres barras sin columna. Toma el color de `currentColor`
 * (por defecto el rojo de marca); para fondos rojos usar "text-white".
 * El tamaño se controla con la altura: className="h-6 w-auto".
 */
export function LogoLecxico({
  className,
  titulo = "Lecxico",
  grosor = 2.2,
}: {
  className?: string
  /** Texto alternativo. Pasar "" si el logo está dentro de un link con aria-label. */
  titulo?: string
  /** Grosor del trazo (en unidades del dibujo: la altura de las letras es 40). */
  grosor?: number
}) {
  return (
    <svg
      viewBox="0 0 272 44"
      width={272}
      height={44}
      className={cn("h-6 w-auto text-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo || undefined}
    >
      {titulo && <title>{titulo}</title>}
      {/* L */}
      <path d="M2 2 V41.9 H27" />
      {/* E: tres barras */}
      <path d="M39 3.1 H65 M39 22 H65 M39 40.9 H65" />
      {/* C */}
      <path d="M112.6 9.5 A20 20 0 1 0 112.6 34.5" />
      {/* X */}
      <path d="M121.5 2 L154.5 42 M154.5 2 L121.5 42" />
      {/* I */}
      <path d="M167 2 V42" />
      {/* C */}
      <path d="M214.6 9.5 A20 20 0 1 0 214.6 34.5" />
      {/* O */}
      <circle cx={249} cy={22} r={19.9} />
    </svg>
  )
}
