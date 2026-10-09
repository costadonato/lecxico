import { cn } from "@/lib/utils"

const TONOS = [
  "bg-rojo-suave text-rojo-fuerte",
  "bg-celeste-suave text-celeste-fuerte",
  "bg-sol-suave text-sol-fuerte",
  "bg-menta-suave text-menta-fuerte",
  "bg-lavanda-suave text-lavanda-fuerte",
]

/** Mismo color siempre para la misma persona (según su usuario o nombre). */
function tonoPara(semilla: string) {
  let h = 0
  for (const c of semilla) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TONOS[h % TONOS.length]
}

/** Círculo con las iniciales de una persona (decorativo: el nombre está escrito al lado). */
export function Iniciales({
  nombre,
  apellido,
  semilla,
  className,
}: {
  nombre?: string | null
  apellido?: string | null
  /** Texto para elegir el color (p. ej. el nombre de usuario). */
  semilla?: string | null
  className?: string
}) {
  const letras = `${nombre?.trim()[0] ?? ""}${apellido?.trim()[0] ?? ""}`.toUpperCase() || "?"
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold",
        tonoPara(semilla || `${nombre}${apellido}`),
        className,
      )}
    >
      {letras}
    </span>
  )
}
