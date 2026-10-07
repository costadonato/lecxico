import { NIVEL_LABEL, type Nivel } from "@/lib/test/bloques"

/** Franja bajo el navbar del test: "Test de Juan Pérez · Nivel Inicial". */
export function TestBandaNino({ nino, nivel }: { nino: { nombre: string; apellido: string }; nivel: Nivel }) {
  const nombre = `${nino.nombre} ${nino.apellido}`.trim()
  return (
    <div className="relative z-10 bg-black/30 border-b border-white/10 shrink-0">
      <p className="container mx-auto px-4 py-2 text-center text-sm sm:text-base font-semibold text-white">
        Test de {nombre || "el niño"} <span className="text-white/60">·</span> Nivel {NIVEL_LABEL[nivel]}
      </p>
    </div>
  )
}
