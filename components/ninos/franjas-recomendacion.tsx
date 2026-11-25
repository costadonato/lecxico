"use client"

import { Badge } from "@/components/ui/badge"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { ChipFranja, LeyendasFranjas, estiloFranja } from "@/components/test/franja"
import { juegosPorBloque } from "@/lib/entrenamiento/presentacion"
import { formatearFecha } from "@/lib/fechas"
import type { TestConBloques } from "@/lib/ninos/detalle"
import { BLOQUE_NOMBRES, NIVEL_LABEL, type EtapaEscolar } from "@/lib/test/bloques"
import { formatearTiempo } from "@/lib/test/denominacion"
import { franjasDeEvaluacion, gradoParaFranja, recomendacion } from "@/lib/test/franjas"
import { cn } from "@/lib/utils"

/*
 * Contenido de "Franjas y recomendación" en /ninos/[id] (S11): la última
 * evaluación visible con la franja de cada bloque y los juegos para
 * practicar los que quedaron en "intermedio" o "a observar". Solo lo ve el
 * profesional.
 */

/** "correctas / total" o, en denominación rápida con tiempo, "Tiempo m:ss · Errores N". */
function ResultadoBloque({ bloque }: { bloque: TestConBloques["bloques"][number] }) {
  if (bloque.tiempo_ms != null && bloque.errores != null) {
    return (
      <span className="flex flex-wrap gap-x-3 font-semibold tabular-nums">
        <span>
          <span className="font-normal text-muted-foreground">Tiempo </span>
          {formatearTiempo(bloque.tiempo_ms)}
        </span>
        <span>
          <span className="font-normal text-muted-foreground">Errores </span>
          {bloque.errores}
        </span>
      </span>
    )
  }
  return (
    <span className="font-semibold tabular-nums">
      {bloque.correctas} / {bloque.total} <span className="font-normal text-muted-foreground">correctas</span>
    </span>
  )
}

/**
 * Todos los bloques de la última evaluación en el orden del test, con su
 * franja. Los que quedaron en "intermedio" o "a observar" (la recomendación)
 * se destacan y muestran los juegos vinculados a ese bloque y nivel. No se
 * comparan bloques entre sí: no hay orden por gravedad.
 */
export function FranjasRecomendacion({ test, etapa }: { test: TestConBloques; etapa: EtapaEscolar }) {
  const grado = gradoParaFranja(test.nivel, etapa)
  const bloques = franjasDeEvaluacion(test.nivel, test.bloques, grado)
  const { recomendados } = recomendacion(test.nivel, test.bloques, grado)
  // El principal primero, e incluye los de solo consulta (Nombrá rápido).
  const juegos = new Map(juegosPorBloque(test.nivel, { incluirSoloConsulta: true }).map((g) => [g.bloque, g.juegos]))

  return (
    <div className="space-y-4">
      <p className="text-base text-muted-foreground">
        Según la evaluación del {formatearFecha(test.fecha)} (Nivel {NIVEL_LABEL[test.nivel]}).
      </p>
      <ListaCascada as="ul" className="space-y-3">
        {bloques.map((b) => {
          const destacado = b.franja === "intermedio" || b.franja === "a_observar"
          const juegosBloque = destacado ? (juegos.get(b.bloque_codigo) ?? []) : []
          return (
            <ItemCascada
              as="li"
              key={b.bloque_codigo}
              className={cn(
                "rounded-2xl border p-4",
                destacado ? estiloFranja(b.franja).destacado : "border-border/80 bg-background/60",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  {BLOQUE_NOMBRES[b.bloque_codigo]}
                  <ChipFranja franja={b.franja} className="text-sm" />
                </span>
                <ResultadoBloque bloque={b} />
              </div>
              {juegosBloque.length > 0 && (
                // S15: enlazar cada juego y armar tareas desde acá. Por ahora, solo los nombres.
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">Juegos para practicar</span>
                  <ul className="flex flex-wrap gap-2" aria-label={`Juegos para practicar ${BLOQUE_NOMBRES[b.bloque_codigo]}`}>
                    {juegosBloque.map((j) => (
                      <li key={j.codigo}>
                        <Badge variant="outline" className="text-sm font-medium">
                          {j.nombre}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ItemCascada>
          )
        })}
      </ListaCascada>
      {recomendados.length === 0 && (
        <p className="text-base text-muted-foreground">
          En esa evaluación todos los bloques con franja quedaron en «Correcto». No hay una recomendación específica.
        </p>
      )}
      <LeyendasFranjas nivel={test.nivel} bloques={bloques} grado={grado} />
      <p className="text-sm text-muted-foreground">
        Es una orientación a partir de la última evaluación: vos decidís qué trabajar con el niño.
      </p>
    </div>
  )
}
