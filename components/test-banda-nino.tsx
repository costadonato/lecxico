import { Badge } from "@/components/ui/badge"
import { CaraPersonaje } from "@/components/personajes/personaje"
import { NIVEL_LABEL, type Nivel } from "@/lib/test/bloques"

/** Píldora bajo el header durante la evaluación: "Evaluación de Juan Pérez" y el nivel. */
export function TestBandaNino({ nino, nivel }: { nino: { nombre: string; apellido: string }; nivel: Nivel }) {
  const nombre = `${nino.nombre} ${nino.apellido}`.trim()
  return (
    <div className="shrink-0 px-4 pt-3">
      <p className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-3xl border border-border/70 bg-card/80 py-1 pl-1 pr-3 text-sm font-semibold text-foreground shadow-suave backdrop-blur-md sm:text-base">
        <CaraPersonaje personaje="lex" tamano={32} className="bg-rojo-suave ring-2 ring-card" />
        <span className="min-w-0 leading-tight">Evaluación de {nombre || "el niño"}</span>
        <Badge variant="celeste">Nivel {NIVEL_LABEL[nivel]}</Badge>
      </p>
    </div>
  )
}
