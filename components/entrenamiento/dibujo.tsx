import Image from "next/image"
import { rutaDibujo, rutaEmoji } from "@/lib/entrenamiento/bancos"
import { cn } from "@/lib/utils"

/**
 * Dibujo de una palabra (Fluent Emoji 3D, public/emoji/):
 *   <Dibujo palabra="vaca" className="size-20" />
 * El tamaño se da con `className`. El texto alternativo es la palabra;
 * `decorativo` lo saca (las opciones ya tienen su aria-label).
 * Una palabra sin dibujo muestra la palabra escrita.
 */
export function Dibujo({
  palabra,
  className,
  decorativo = false,
  prioridad = false,
}: {
  palabra: string
  className?: string
  decorativo?: boolean
  prioridad?: boolean
}) {
  const src = rutaDibujo(palabra)
  if (!src) {
    return (
      <span className={cn("grid place-items-center text-center text-lg font-bold", className)} aria-hidden={decorativo || undefined}>
        {palabra}
      </span>
    )
  }
  return (
    <Image
      src={src}
      alt={decorativo ? "" : palabra}
      width={160}
      height={160}
      unoptimized
      priority={prioridad}
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  )
}

/**
 * Un emoji dibujado con Fluent: <Emoji char="🍌" />. Si el emoji no está
 * en el mapa de bancos.json, se muestra el del sistema.
 */
export function Emoji({
  char,
  etiqueta,
  className,
}: {
  char: string
  /** Texto alternativo; sin etiqueta es decorativo. */
  etiqueta?: string
  className?: string
}) {
  const src = rutaEmoji(char)
  if (!src) {
    // SVG: el emoji escala con el tamaño de la caja, igual que la imagen.
    return (
      <svg
        viewBox="0 0 100 100"
        role={etiqueta ? "img" : undefined}
        aria-label={etiqueta}
        aria-hidden={etiqueta ? undefined : true}
        className={cn("select-none", className)}
      >
        <text x="50" y="54" fontSize="78" textAnchor="middle" dominantBaseline="middle">
          {char}
        </text>
      </svg>
    )
  }
  return (
    <Image
      src={src}
      alt={etiqueta ?? ""}
      width={160}
      height={160}
      unoptimized
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  )
}
