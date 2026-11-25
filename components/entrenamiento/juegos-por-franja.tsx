"use client"

import type { ReactNode } from "react"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { ChipFranja, estiloFranja } from "@/components/test/franja"
import type { FichaJuego } from "@/lib/entrenamiento/juegos"
import type { GrupoFranja } from "@/lib/entrenamiento/presentacion"
import { formatearFecha } from "@/lib/fechas"
import type { BloqueCodigo } from "@/lib/test/bloques"
import type { Franja } from "@/lib/test/franjas"
import { cn } from "@/lib/utils"

/** Misma cuadrícula que el catálogo (catalogo-juegos.tsx). */
const CUADRICULA = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"

const TITULO_GRUPO: Record<Franja | "sin_franja", string> = {
  a_observar: "Mayor prioridad",
  intermedio: "Prioridad media",
  correcto: "Menor prioridad",
  sin_franja: "Sin franja de referencia",
}

/**
 * Juegos agrupados según la franja de su bloque en la última evaluación
 * (grupos de `juegosPorFranja`), solo para el profesional. Un recuadro sutil
 * por grupo (colores en ESTILO_FRANJA.contenedor) y, adentro, todos los
 * juegos del grupo en una sola cuadrícula, sin título por bloque: cada
 * tarjeta lleva el chip de su bloque.
 *
 * Es una pieza reutilizable: la usa Entrenar en consulta (S11b) y la va a
 * usar S15 al armar tareas, con otra tarjeta. Por eso cada juego lo dibuja
 * `renderJuego`.
 */
export function JuegosPorFranja({
  grupos,
  fechaEvaluacion,
  renderJuego,
  nivelTitulo = "h2",
}: {
  grupos: GrupoFranja[]
  /** Fecha de la evaluación de la que salen las franjas (aaaa-mm-dd). */
  fechaEvaluacion: string
  renderJuego: (juego: FichaJuego, bloque: BloqueCodigo) => ReactNode
  /** Encabezado de cada grupo, según la jerarquía de la página (las tarjetas usan h3). */
  nivelTitulo?: "h2" | "h3"
}) {
  const Titulo = nivelTitulo
  const sinRecomendacion = !grupos.some((g) => g.franja === "a_observar" || g.franja === "intermedio")

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground">
        Según la evaluación del {formatearFecha(fechaEvaluacion)}.
        {sinRecomendacion && (
          <> Todos los bloques con franja quedaron en «Correcto»: no hay una recomendación específica.</>
        )}
      </p>

      {grupos.map((g) => {
        const clave = g.franja ?? "sin_franja"
        const id = `grupo-franja-${clave}`
        return (
          <section
            key={clave}
            aria-labelledby={id}
            className={cn("space-y-4 rounded-[2rem] border p-4 sm:p-5", estiloFranja(g.franja).contenedor)}
          >
            <div className="space-y-1">
              <Titulo id={id} className="flex flex-wrap items-center gap-3 text-xl font-bold text-foreground sm:text-2xl">
                {TITULO_GRUPO[clave]}
                {g.franja && <ChipFranja franja={g.franja} className="text-sm" />}
              </Titulo>
              {g.franja === null && (
                <p className="text-sm text-muted-foreground">
                  No hay valores de la bibliografía para comparar este bloque. Su interpretación queda a cargo del
                  profesional.
                </p>
              )}
            </div>
            <ListaCascada as="ul" className={CUADRICULA}>
              {g.juegos.map(({ juego, bloque }) => (
                <ItemCascada as="li" key={juego.codigo} className="h-full">
                  {renderJuego(juego, bloque)}
                </ItemCascada>
              ))}
            </ListaCascada>
          </section>
        )
      })}
    </div>
  )
}
