"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Info } from "lucide-react"
import { CatalogoJuegos } from "@/components/entrenamiento/catalogo-juegos"
import { JuegosPorFranja } from "@/components/entrenamiento/juegos-por-franja"
import { SwitchLetra } from "@/components/entrenamiento/switch-letra"
import { SwitchRecomendacion, useRecomendacionConsulta } from "@/components/entrenamiento/switch-recomendacion"
import { TarjetaJuego } from "@/components/entrenamiento/tarjeta-juego"
import { TestBandaNino } from "@/components/test-banda-nino"
import { gradoDe, type GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { juegosPorFranja, rutaConsulta } from "@/lib/entrenamiento/presentacion"
import type { NinoParaEntrenar, TestConBloques } from "@/lib/ninos/detalle"
import { NIVEL_LABEL, nivelParaEtapa } from "@/lib/test/bloques"
import type { DisponibilidadRecomendacion } from "@/lib/test/franjas"

/** La recomendación, o por qué no está disponible ("error": no se pudieron leer las evaluaciones). */
export type Recomendacion = DisponibilidadRecomendacion<TestConBloques> | { estado: "error" }

/** Por qué el switch está deshabilitado, o null si la recomendación está disponible. */
function motivoSinRecomendacion(r: Recomendacion): string | null {
  switch (r.estado) {
    case "disponible":
      return null
    case "sin_evaluaciones":
      return "Disponible después de la primera evaluación."
    case "otro_nivel":
      return `La última evaluación es de nivel ${NIVEL_LABEL[r.nivelEvaluacion]}. Tomá una de nivel ${NIVEL_LABEL[r.nivelNino]} para ver la recomendación.`
    case "error":
      return "No se pudo cargar la recomendación. Recargá la página para intentarlo de nuevo."
  }
}

/**
 * Contenido de Entrenar en consulta (/ninos/[id]/entrenamiento): banda del
 * niño, consigna con los switches "Tipo de letra" y "Recomendación" (S11b),
 * y los juegos. Apagada, la recomendación deja el catálogo por bloque de
 * siempre; prendida (y disponible), los juegos agrupados por franja. Va
 * dentro de <ProveedorLetra>.
 */
export function VistaConsulta({
  ninoId,
  datos,
  grados,
  recomendacion,
}: {
  ninoId: string
  datos: NinoParaEntrenar
  grados: GradosHabilitados
  recomendacion: Recomendacion
}) {
  const nivel = nivelParaEtapa(datos.nino.etapa_escolar)
  const [prendida, setPrendida] = useRecomendacionConsulta()
  const [anuncio, setAnuncio] = useState("")
  const motivo = motivoSinRecomendacion(recomendacion)
  const porFranja = prendida && recomendacion.estado === "disponible" ? recomendacion : null

  const cambiar = (valor: boolean) => {
    setPrendida(valor)
    setAnuncio(valor ? "Juegos ordenados según la recomendación." : "Juegos agrupados por bloque.")
  }

  return (
    <div className="space-y-8">
      <div className="-mx-4 -mt-2">
        <TestBandaNino nino={datos.perfil} nivel={nivel} prefijo="Entrenamiento de" />
      </div>
      <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card px-5 py-4 shadow-suave sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-base">
          <Info className="mt-0.5 size-5 shrink-0 text-celeste-fuerte" aria-hidden="true" />
          <span>
            Elegí un juego y un grado para jugar con el niño. Las partidas quedan en su historial como «Consulta» y,
            con 80 % o más, desbloquean el grado siguiente en casa.
          </span>
        </p>
        <div className="grid shrink-0 grid-cols-[auto_auto] items-center gap-x-4 gap-y-2 self-end sm:max-w-72 sm:self-auto">
          <span className="text-sm font-semibold text-muted-foreground">Tipo de letra</span>
          <SwitchLetra />
          <label htmlFor="switch-recomendacion" className="text-sm font-semibold text-muted-foreground">
            Recomendación
          </label>
          <div className="flex h-11 items-center">
            <SwitchRecomendacion
              id="switch-recomendacion"
              prendida={prendida}
              onCambiar={cambiar}
              deshabilitado={motivo !== null}
              idMotivo={motivo ? "motivo-recomendacion" : undefined}
            />
          </div>
          {motivo && (
            <p id="motivo-recomendacion" className="col-span-2 text-sm text-muted-foreground">
              {motivo}
            </p>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>

      {/* Solo un fundido: con reducir movimiento tampoco se desplaza nada. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={porFranja ? "franja" : "bloque"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {porFranja ? (
            <JuegosPorFranja
              grupos={juegosPorFranja(nivel, porFranja.franjas, { incluirSoloConsulta: true })}
              fechaEvaluacion={porFranja.test.fecha}
              renderJuego={(juego) => (
                <TarjetaJuego
                  juego={juego}
                  nivel={nivel}
                  modo="profesional"
                  habilitado={gradoDe(grados, juego.codigo)}
                  hrefGrado={(g) => rutaConsulta(ninoId, juego.codigo, g)}
                  mostrarBloque
                />
              )}
            />
          ) : (
            <CatalogoJuegos
              nivel={nivel}
              modo="profesional"
              grados={grados}
              hrefGrado={(juego, grado) => rutaConsulta(ninoId, juego, grado)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
