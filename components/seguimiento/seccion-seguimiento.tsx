"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EstadoVacio } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { Seccion } from "@/components/seccion"
import { GraficosEntrenamiento } from "@/components/seguimiento/graficos-entrenamiento"
import { GraficosEvaluaciones } from "@/components/seguimiento/graficos-evaluaciones"
import { SelectorOpciones } from "@/components/seguimiento/piezas"
import { gradosHabilitados, type GradosHabilitados } from "@/lib/entrenamiento/partidas"
import type { DetalleNino } from "@/lib/ninos/detalle"
import { cargarPartidasSeguimiento } from "@/lib/seguimiento/datos"
import type { PartidaSeguimiento } from "@/lib/seguimiento/entrenamiento"
import {
  nivelInicialSeguimiento,
  nivelesConEvaluaciones,
  serieDenominacion,
  serieEvaluaciones,
} from "@/lib/seguimiento/evaluaciones"
import { createClient } from "@/lib/supabase/client"
import { NIVEL_LABEL, nivelParaEtapa, type Nivel } from "@/lib/test/bloques"
import { gradoParaFranja } from "@/lib/test/franjas"

/*
 * Sección "Seguimiento" de /ninos/[id] (S16), debajo de los historiales.
 * Solo la ve el profesional. Las evaluaciones ya vienen en el detalle; las
 * partidas (todas, no solo las 20 del historial) y el grado habilitado en
 * casa se cargan aparte, así una falla o una demora no traba el resto de la
 * página.
 */

type CargaEntrenamiento =
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "listo"; partidas: PartidaSeguimiento[]; habilitados: GradosHabilitados }

export function SeccionSeguimiento({ datos }: { datos: DetalleNino }) {
  const ninoId = datos.perfil.id
  const nivelActual = nivelParaEtapa(datos.nino.etapa_escolar)
  const niveles = nivelesConEvaluaciones(datos.tests)
  const [nivel, setNivel] = useState<Nivel>(() => nivelInicialSeguimiento(datos.tests, nivelActual))
  const grado = gradoParaFranja(nivel, datos.nino.etapa_escolar)

  const serie = useMemo(() => serieEvaluaciones(datos.tests, nivel, grado), [datos.tests, nivel, grado])
  const denominacion = useMemo(() => serieDenominacion(datos.tests, nivel, grado), [datos.tests, nivel, grado])

  const [carga, setCarga] = useState<CargaEntrenamiento>({ estado: "cargando" })
  useEffect(() => {
    let cancelado = false
    const supabase = createClient()
    Promise.all([cargarPartidasSeguimiento(supabase, ninoId), gradosHabilitados(supabase, ninoId)])
      .then(([partidas, habilitados]) => {
        if (!cancelado) setCarga({ estado: "listo", partidas, habilitados })
      })
      .catch((e) => {
        console.error("seguimiento del entrenamiento:", e)
        if (!cancelado) setCarga({ estado: "error" })
      })
    return () => {
      cancelado = true
    }
  }, [ninoId])

  const selectorNivel =
    niveles.length > 1 ? (
      <SelectorOpciones
        etiqueta="Nivel de las evaluaciones"
        valor={nivel}
        opciones={niveles.map((n) => ({ valor: n, texto: `Nivel ${NIVEL_LABEL[n]}` }))}
        onCambiar={setNivel}
      />
    ) : null

  return (
    <Seccion icono={<TrendingUp />} tono="celeste" titulo="Seguimiento">
      <Tabs defaultValue="evaluaciones" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:inline-flex sm:w-auto">
          <TabsTrigger value="evaluaciones" className="py-1.5">
            Evaluaciones
          </TabsTrigger>
          <TabsTrigger value="entrenamiento" className="py-1.5">
            Entrenamiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluaciones" className="space-y-4">
          {serie.length === 0 ? (
            <EstadoVacio compacto descripcion="La evolución va a aparecer después de la primera evaluación." />
          ) : (
            <>
              <EncabezadoNivel nivel={nivel} selector={selectorNivel} cantidad={serie.length} />
              <GraficosEvaluaciones serie={serie} denominacion={denominacion} nivel={nivel} grado={grado} />
            </>
          )}
        </TabsContent>

        <TabsContent value="entrenamiento">
          {carga.estado === "cargando" ? (
            <EsqueletoEntrenamiento />
          ) : carga.estado === "error" ? (
            <MensajeAlerta tipo="error" texto="No se pudo cargar el seguimiento del entrenamiento. Recargá la página." />
          ) : (
            <GraficosEntrenamiento
              partidas={carga.partidas}
              habilitados={carga.habilitados}
              nivel={nivelActual}
              ninoId={ninoId}
            />
          )}
        </TabsContent>
      </Tabs>
    </Seccion>
  )
}

function EncabezadoNivel({ nivel, selector, cantidad }: { nivel: Nivel; selector: ReactNode; cantidad: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-base text-muted-foreground">
        Nivel {NIVEL_LABEL[nivel]} · {cantidad === 1 ? "1 evaluación" : `${cantidad} evaluaciones`}
      </p>
      {selector}
    </div>
  )
}

function EsqueletoEntrenamiento() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Cargando el entrenamiento…</span>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
