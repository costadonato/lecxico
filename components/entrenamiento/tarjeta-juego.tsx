"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Home, Lock, Play, Star } from "lucide-react"
import { ChipEnDesarrollo } from "@/components/chip-en-desarrollo"
import { Bloqueado } from "@/components/entrenamiento/bloqueado"
import { COLOR_BLOQUE } from "@/components/entrenamiento/colores-bloque"
import { Emoji } from "@/components/entrenamiento/dibujo"
import { Destello, Estrella } from "@/components/fondo-decorado"
import { RESORTE } from "@/components/motion/transiciones"
import type { FichaJuego, Grado, Nivel } from "@/lib/entrenamiento/juegos"
import { juegoDisponible, textoGradoBloqueado } from "@/lib/entrenamiento/presentacion"
import { BLOQUE_NOMBRES } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

const GRADOS: Grado[] = [1, 2, 3]

/**
 * Tarjeta de un juego en las áreas del entrenamiento: icono grande sobre el
 * color del bloque, nombre y los tres botones de grado. Por defecto no lleva
 * el nombre del bloque: el niño no lo ve, y en el catálogo del profesional
 * está en el título de la sección. Con `mostrarBloque` (solo profesional:
 * la vista por franja de la recomendación, S11b, y las tareas de S15, donde
 * se mezclan juegos de varios bloques) suma un chip con el nombre del bloque
 * arriba del nombre del juego.
 *
 * - Niño: los grados no habilitados tienen candado y no inician el juego;
 *   en lugar de prohibir, un cartelito explica cómo desbloquearlos. El
 *   grado alcanzado se ve con estrellas (nunca con porcentajes).
 * - Profesional: los tres grados están libres y una línea dice qué grado
 *   tiene habilitado el niño en casa.
 *
 * Un juego que todavía no existe se ve apagado, con "Próximamente".
 */
export function TarjetaJuego({
  juego,
  nivel,
  modo,
  habilitado,
  hrefGrado,
  mostrarBloque = false,
}: {
  juego: FichaJuego
  nivel: Nivel
  modo: "nino" | "profesional"
  /** Grado habilitado en casa. */
  habilitado: Grado
  hrefGrado: (grado: Grado) => string
  /** Chip con el nombre del bloque arriba del nombre (apagado por defecto; nunca para el niño). */
  mostrarBloque?: boolean
}) {
  const ficha = juego.niveles[nivel]
  if (!ficha) return null
  const color = COLOR_BLOQUE[ficha.bloque]
  const disponible = juegoDisponible(juego.codigo)
  const idTitulo = `juego-${juego.codigo}`

  return (
    <motion.article
      aria-labelledby={idTitulo}
      initial="reposo"
      whileHover={disponible ? "activo" : undefined}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-white bg-card shadow-media transition-shadow",
        disponible ? "hover:shadow-elevada" : "opacity-75 saturate-50",
      )}
    >
      <div className={cn("relative grid h-32 place-items-center overflow-hidden sm:h-36", color.zona)}>
        <span aria-hidden="true" className="absolute -left-8 -top-10 size-32 rounded-full bg-white/20" />
        <span aria-hidden="true" className="absolute -bottom-14 -right-6 size-36 rounded-full bg-white/15" />
        <Estrella className="absolute right-5 top-4 size-5 text-white/70" />
        <Destello className="absolute bottom-4 left-6 size-4 text-white/80" />
        <motion.span
          variants={{
            reposo: { rotate: 0, scale: 1, transition: RESORTE },
            activo: { rotate: [0, -8, 6, 0], scale: 1.08, transition: { duration: 0.5, ease: "easeOut" } },
          }}
          className="relative grid size-24 place-items-center rounded-[1.75rem] bg-white shadow-media"
        >
          <Emoji char={juego.icono} className="size-16" />
        </motion.span>
        {!disponible && <ChipEnDesarrollo texto="Próximamente" className="absolute right-3 top-3 shadow-suave" />}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {mostrarBloque && (
          <span className={cn("-mb-1 w-fit rounded-full px-3 py-0.5 text-sm font-semibold", color.chip)}>
            {BLOQUE_NOMBRES[ficha.bloque]}
          </span>
        )}
        <h3 id={idTitulo} className="text-xl font-bold leading-snug text-foreground">
          {juego.nombre}
        </h3>

        {modo === "nino" && disponible && <Estrellas grado={habilitado} />}

        <div className="mt-auto space-y-2">
          {disponible ? (
            <>
            <p aria-hidden="true" className="text-sm font-semibold text-muted-foreground">
              Grado
            </p>
            <div role="group" aria-label={`Grados de ${juego.nombre}`} className="grid grid-cols-3 gap-2">
              {GRADOS.map((g) =>
                modo === "nino" && g > habilitado ? (
                  <Bloqueado
                    key={g}
                    etiqueta={`Grado ${g}, bloqueado`}
                    explicacion={textoGradoBloqueado(g)}
                    className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border-2 border-sol/60 bg-sol-suave/70 text-base font-bold text-sol-fuerte outline-none transition-colors hover:bg-sol-suave focus-visible:ring-4 focus-visible:ring-ring/40"
                  >
                    <Lock className="size-4" aria-hidden="true" />
                    {g}
                  </Bloqueado>
                ) : (
                  <Link
                    key={g}
                    href={hrefGrado(g)}
                    aria-label={`Jugar ${juego.nombre}, grado ${g}`}
                    className={cn(
                      "flex min-h-12 items-center justify-center gap-1 rounded-2xl border-2 text-base font-bold shadow-suave outline-none transition-[transform,background-color] duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/40 motion-reduce:hover:translate-y-0",
                      color.borde,
                      color.suave,
                      color.texto,
                    )}
                  >
                    <Play className="size-3.5 fill-current" aria-hidden="true" />
                    {g}
                  </Link>
                ),
              )}
            </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Este juego llega pronto.</p>
          )}
          {modo === "profesional" && disponible && !juego.soloConsulta && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Home className="size-4 shrink-0" aria-hidden="true" />
              En casa tiene habilitado hasta el grado {habilitado}.
            </p>
          )}
          {modo === "profesional" && juego.soloConsulta && (
            <p className="text-sm text-muted-foreground">Se juega solo en la consulta.</p>
          )}
        </div>
      </div>
    </motion.article>
  )
}

/** Grado alcanzado en estrellas: una por grado habilitado. */
function Estrellas({ grado }: { grado: Grado }) {
  return (
    <p className="flex items-center gap-1" role="img" aria-label={`Llegaste al grado ${grado} de 3`}>
      {GRADOS.map((g) => (
        <Star
          key={g}
          aria-hidden="true"
          className={cn("size-6", g <= grado ? "fill-sol text-sol-fuerte" : "fill-muted text-border")}
          strokeWidth={1.8}
        />
      ))}
    </p>
  )
}
