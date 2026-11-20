"use client"

import { COLOR_BLOQUE } from "@/components/entrenamiento/colores-bloque"
import { TarjetaJuego } from "@/components/entrenamiento/tarjeta-juego"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import type { FichaJuego, Grado, Nivel } from "@/lib/entrenamiento/juegos"
import { gradoDe, type GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { juegosPorBloque } from "@/lib/entrenamiento/presentacion"
import { BLOQUE_NOMBRES } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

const CUADRICULA = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"

/**
 * Los juegos de un nivel, en el orden de los bloques de la evaluación y con
 * el principal de cada bloque primero.
 * - Niño: todos en una sola cuadrícula, sin nombres de bloque (hablarle de
 *   "discriminación auditiva" lo confunde) y sin los de solo consulta.
 * - Profesional: agrupados por bloque, con el nombre en el título de cada
 *   sección; incluye los de solo consulta.
 */
export function CatalogoJuegos({
  nivel,
  modo,
  grados,
  hrefGrado,
}: {
  nivel: Nivel
  modo: "nino" | "profesional"
  grados: GradosHabilitados
  hrefGrado: (juego: string, grado: Grado) => string
}) {
  const grupos = juegosPorBloque(nivel, { incluirSoloConsulta: modo === "profesional" })

  const cuadricula = (juegos: FichaJuego[], etiqueta?: string) => (
    <ListaCascada as="ul" enVista aria-label={etiqueta} className={CUADRICULA}>
      {juegos.map((j) => (
        <ItemCascada as="li" key={j.codigo} className="h-full">
          <TarjetaJuego
            juego={j}
            nivel={nivel}
            modo={modo}
            habilitado={gradoDe(grados, j.codigo)}
            hrefGrado={(g) => hrefGrado(j.codigo, g)}
          />
        </ItemCascada>
      ))}
    </ListaCascada>
  )

  if (modo === "nino") {
    return (
      <section aria-labelledby="titulo-juegos" className="space-y-4">
        <h2 id="titulo-juegos" className="text-xl font-bold text-foreground sm:text-2xl">
          Juegos
        </h2>
        {cuadricula(grupos.flatMap((g) => g.juegos))}
      </section>
    )
  }

  return (
    <div className="space-y-10">
      {grupos.map(({ bloque, juegos }) => {
        const id = `bloque-${bloque}`
        return (
          <section key={bloque} aria-labelledby={id} className="space-y-4">
            <h2 id={id} className="flex items-center gap-3 text-xl font-bold text-foreground sm:text-2xl">
              <span aria-hidden="true" className={cn("size-4 shrink-0 rounded-full ring-4 ring-white", COLOR_BLOQUE[bloque].zona)} />
              {BLOQUE_NOMBRES[bloque]}
            </h2>
            {cuadricula(juegos)}
          </section>
        )
      })}
    </div>
  )
}
