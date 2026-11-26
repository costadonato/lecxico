"use client"

import { useRef, useState, type ReactNode } from "react"
import { Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChipFranja } from "@/components/test/franja"
import { GraficoLinea } from "@/components/seguimiento/grafico-linea"
import { CajaTooltip, DatosEnTabla, TablaDatos } from "@/components/seguimiento/piezas"
import { formatearFecha } from "@/lib/fechas"
import {
  bandasDeFranja,
  resumenBloque,
  resumenDenominacion,
  serieDeBloque,
  type PuntoDeBloque,
  type PuntoDenominacion,
  type PuntoEvaluacion,
} from "@/lib/seguimiento/evaluaciones"
import { BLOQUES_POR_NIVEL, BLOQUE_NOMBRES, type BloqueCodigo, type Nivel } from "@/lib/test/bloques"
import { formatearTiempo } from "@/lib/test/denominacion"
import { FRANJA_LABEL, SIN_FRANJA_LABEL, type Franja, type GradoFranja } from "@/lib/test/franjas"
import { cn } from "@/lib/utils"

/*
 * Pestaña "Evaluaciones" del seguimiento (S16): un gráfico chico por bloque
 * (small multiples), en el orden del test. Denominación rápida va en su
 * lugar (en primaria, al final) con dos gráficos: tiempo y aciertos, sin
 * franjas de fondo. Tocar un gráfico, o su botón de ampliar, lo abre en
 * grande en un modal.
 */

type Tamano = "chico" | "grande"

const etiquetaFranja = (f: Franja | null) => (f ? FRANJA_LABEL[f] : SIN_FRANJA_LABEL)
const pct = (v: number) => `${v} %`
const MARCAS_PCT = [0, 25, 50, 75, 100]

export function GraficosEvaluaciones({
  serie,
  denominacion,
  nivel,
  grado,
}: {
  serie: readonly PuntoEvaluacion[]
  /** Serie de denominación rápida del mismo nivel (serieDenominacion). */
  denominacion: readonly PuntoDenominacion[]
  nivel: Nivel
  grado: GradoFranja | null
}) {
  return (
    <div className="space-y-4">
      {serie.length === 1 && (
        <p className="rounded-2xl border border-border/80 bg-background/60 px-4 py-3 text-base text-muted-foreground">
          Con dos evaluaciones o más vas a ver la evolución.
        </p>
      )}
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BLOQUES_POR_NIVEL[nivel].map((bloque) =>
          bloque === "denominacion_rapida" ? (
            // Más alta que las demás: en tableta y escritorio ocupa dos filas de la grilla.
            <li key={bloque} className="md:row-span-2">
              <TarjetaDenominacion puntos={denominacion} ultimoBloque={serieDeBloque(serie, bloque).at(-1)} />
            </li>
          ) : (
            <li key={bloque}>
              <TarjetaBloque bloque={bloque} puntos={serieDeBloque(serie, bloque)} nivel={nivel} grado={grado} />
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Marco común: tarjeta chica + modal con el mismo contenido en grande */
/* ------------------------------------------------------------------ */

function TarjetaGrafico({
  nombre,
  franja,
  resumen,
  graficos,
  tabla,
  pie,
}: {
  nombre: string
  /** Franja de la última evaluación; undefined si el bloque no está en ninguna (sin chip). */
  franja: Franja | null | undefined
  resumen: string
  /** Los gráficos, o null si no hay datos para dibujar (no se puede ampliar). */
  graficos: ((tamano: Tamano, onAmpliar?: (origen: HTMLElement) => void) => ReactNode) | null
  /** La tabla de datos (la misma en la tarjeta y en el modal). */
  tabla: (compacta: boolean) => ReactNode
  /** Notas debajo del resumen (por ejemplo, "Sin franja de referencia"). */
  pie?: ReactNode
}) {
  const [abierto, setAbierto] = useState(false)
  // El elemento que abrió el modal (el botón o el gráfico tocado): ahí vuelve el foco al cerrar.
  const origen = useRef<HTMLElement | null>(null)
  const abrir = (desde: HTMLElement) => {
    origen.current = desde
    setAbierto(true)
  }
  const chip = franja !== undefined && <ChipFranja franja={franja} className="text-xs" />

  return (
    <figure className="flex h-full flex-col gap-3 rounded-2xl border border-border/80 bg-background/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col items-start gap-1.5">
          <h3 className="text-base font-semibold">{nombre}</h3>
          {chip}
        </div>
        {graficos && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Ampliar el gráfico de ${nombre}`}
            title="Ampliar"
            onClick={(e) => abrir(e.currentTarget)}
            className="-mr-2 -mt-1 size-9 shrink-0 text-muted-foreground"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {graficos?.("chico", abrir)}

      <figcaption className="text-sm text-muted-foreground">
        {resumen}
        {pie}
      </figcaption>

      {graficos && <DatosEnTabla className="mt-auto">{tabla(true)}</DatosEnTabla>}

      {graficos && (
        <Dialog open={abierto} onOpenChange={setAbierto}>
          <DialogContent
            className="max-h-[92dvh] max-w-[calc(100%-1rem)] gap-4 overflow-y-auto p-4 focus-visible:outline-none sm:max-w-3xl sm:p-7"
            // Al abrir, el foco va al modal y no al gráfico (que mostraría el tooltip del primer punto).
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              ;(e.currentTarget as HTMLElement | null)?.focus()
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault()
              origen.current?.focus()
            }}
          >
            <DialogHeader className="flex-row flex-wrap items-center gap-2 pr-10 text-left">
              <DialogTitle className="text-xl">{nombre}</DialogTitle>
              {chip}
            </DialogHeader>
            {graficos("grande")}
            <DialogDescription className="text-base">
              {resumen}
              {pie}
            </DialogDescription>
            {/* En 375 px la tabla de denominación rápida no entra: se desplaza, y por eso se puede enfocar. */}
            <div
              tabIndex={0}
              role="region"
              aria-label="Datos en tabla"
              className="overflow-x-auto rounded-xl border border-border/80 bg-background/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {tabla(false)}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/*  Bloques que se miden por porcentaje de aciertos                     */
/* ------------------------------------------------------------------ */

function TarjetaBloque({
  bloque,
  puntos,
  nivel,
  grado,
}: {
  bloque: BloqueCodigo
  puntos: PuntoDeBloque[]
  nivel: Nivel
  grado: GradoFranja | null
}) {
  const nombre = BLOQUE_NOMBRES[bloque]
  const bandas = bandasDeFranja(nivel, bloque, grado)
  const resumen = resumenBloque(bloque, puntos)

  return (
    <TarjetaGrafico
      nombre={nombre}
      franja={puntos.at(-1)?.franja}
      resumen={resumen}
      pie={!bandas && puntos.length > 0 && <span className="block">{SIN_FRANJA_LABEL}.</span>}
      graficos={
        puntos.length === 0
          ? null
          : (tamano, onAmpliar) => (
              <GraficoLinea
                datos={puntos}
                clave="porcentaje"
                etiqueta="Porcentaje"
                dominio={[0, 100]}
                marcas={MARCAS_PCT}
                formatoEje={pct}
                anchoEje={48}
                bandas={bandas}
                tooltip={<TooltipBloque />}
                titulo={resumen}
                grande={tamano === "grande"}
                formatoValor={pct}
                alto={tamano === "grande" ? "h-80" : "h-44"}
                onAmpliar={onAmpliar}
              />
            )
      }
      tabla={(compacta) => (
        <TablaDatos
          compacta={compacta}
          titulo={`${nombre}: resultado de cada evaluación`}
          columnas={["Fecha", "Aciertos", "%", "Franja"]}
          filas={puntos.map((p) => [formatearFecha(p.fecha), `${p.correctas} / ${p.total}`, pct(p.porcentaje), etiquetaFranja(p.franja)])}
        />
      )}
    />
  )
}

function TooltipBloque({ active, payload }: { active?: boolean; payload?: { payload: PuntoDeBloque }[] }) {
  const p = active ? payload?.[0]?.payload : undefined
  if (!p) return null
  return (
    <CajaTooltip>
      <span className="font-semibold">{formatearFecha(p.fecha)}</span>
      <span>
        {p.correctas} / {p.total} correctas · {p.porcentaje} %
      </span>
      <span className="text-muted-foreground">
        Franja: <span className="font-medium text-foreground">{etiquetaFranja(p.franja)}</span>
      </span>
    </CajaTooltip>
  )
}

/* ------------------------------------------------------------------ */
/*  Denominación rápida: tiempo y aciertos, sin franjas de fondo        */
/* ------------------------------------------------------------------ */

/** Techo del eje de tiempo: múltiplo de 40 s con un margen, así las cinco marcas son números redondos. */
function techoTiempo(puntos: readonly PuntoDenominacion[]): number {
  const maximo = Math.max(0, ...puntos.map((p) => p.segundos))
  return Math.max(40, Math.ceil((maximo * 1.15) / 40) * 40)
}

const segundosEnteros = (v: number) => String(Math.round(v))

function TarjetaDenominacion({
  puntos,
  ultimoBloque,
}: {
  puntos: readonly PuntoDenominacion[]
  /** El bloque en la última evaluación que lo tiene (con o sin tiempo), para el chip. */
  ultimoBloque: PuntoDeBloque | undefined
}) {
  const nombre = BLOQUE_NOMBRES.denominacion_rapida
  const resumen = resumenDenominacion(puntos)
  const techo = techoTiempo(puntos)
  const marcasTiempo = [0, 1, 2, 3, 4].map((k) => (techo * k) / 4)

  return (
    <TarjetaGrafico
      nombre={nombre}
      // La franja de la última evaluación con el bloque (sin tiempo, "sin franja").
      franja={ultimoBloque?.franja}
      resumen={puntos.length === 0 ? "Sin tiempo registrado en estas evaluaciones." : resumen}
      pie={puntos.length > 0 && <span className="block">Menos tiempo es mejor.</span>}
      graficos={
        puntos.length === 0
          ? null
          : (tamano, onAmpliar) => {
              const grande = tamano === "grande"
              const alto = grande ? "h-64" : "h-32"
              const claseTitulo = cn("font-semibold text-muted-foreground", grande ? "text-base" : "text-sm")
              return (
                <div className={grande ? "space-y-5" : "space-y-3"}>
                  <div className="space-y-1">
                    <h4 className={claseTitulo}>Tiempo (segundos)</h4>
                    <GraficoLinea
                      datos={puntos}
                      clave="segundos"
                      etiqueta="Tiempo"
                      dominio={[0, techo]}
                      marcas={marcasTiempo}
                      formatoEje={segundosEnteros}
                      anchoEje={40}
                      tooltip={<TooltipDenominacion />}
                      titulo={`Tiempo de denominación rápida en cada evaluación. ${resumen}`}
                      grande={grande}
                      formatoValor={(v) => formatearTiempo(v * 1000)}
                      alto={alto}
                      onAmpliar={onAmpliar}
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className={claseTitulo}>Aciertos (%)</h4>
                    <GraficoLinea
                      datos={puntos}
                      clave="aciertosPorcentaje"
                      etiqueta="Aciertos"
                      dominio={[0, 100]}
                      marcas={MARCAS_PCT}
                      formatoEje={pct}
                      anchoEje={48}
                      tooltip={<TooltipDenominacion />}
                      titulo={`Aciertos de denominación rápida en cada evaluación. ${resumen}`}
                      grande={grande}
                      formatoValor={pct}
                      alto={alto}
                      onAmpliar={onAmpliar}
                    />
                  </div>
                </div>
              )
            }
      }
      tabla={(compacta) => (
        <TablaDatos
          compacta={compacta}
          titulo={`${nombre}: resultado de cada evaluación`}
          columnas={["Fecha", "Tiempo", "Errores", "Aciertos (%)", "Franja"]}
          filas={puntos.map((p) => [
            formatearFecha(p.fecha),
            formatearTiempo(p.tiempoMs),
            p.errores,
            pct(p.aciertosPorcentaje),
            etiquetaFranja(p.franja),
          ])}
        />
      )}
    />
  )
}

function TooltipDenominacion({ active, payload }: { active?: boolean; payload?: { payload: PuntoDenominacion }[] }) {
  const p = active ? payload?.[0]?.payload : undefined
  if (!p) return null
  return (
    <CajaTooltip>
      <span className="font-semibold">{formatearFecha(p.fecha)}</span>
      <span>Tiempo: {formatearTiempo(p.tiempoMs)}</span>
      <span>
        Errores: {p.errores} · Aciertos: {p.aciertosPorcentaje} %
      </span>
      <span className="text-muted-foreground">
        Franja: <span className="font-medium text-foreground">{etiquetaFranja(p.franja)}</span>
      </span>
    </CajaTooltip>
  )
}
