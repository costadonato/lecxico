"use client"

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react"
import { FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Cargando } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { formatearFecha } from "@/lib/fechas"
import { cargarDatosInforme } from "@/lib/informes/datos"
import { OTRO_PROFESIONAL, construirInforme, type DatosInforme } from "@/lib/informes/modelo"
import {
  MAX_OBSERVACIONES,
  SECCIONES_SEGUIMIENTO,
  evaluacionesElegibles,
  opcionesPorDefecto,
  validarOpciones,
  type CampoOpciones,
  type OpcionesInforme,
} from "@/lib/informes/opciones"
import { PERIODOS_INFORME, diaArgentina, type PeriodoInforme } from "@/lib/informes/periodo"
import type { DetalleNino } from "@/lib/ninos/detalle"
import { NIVEL_LABEL } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

/*
 * Diálogo "Generar informe" del profesional (S17a): elige qué va en el PDF
 * y lo descarga. Los datos se cargan al abrir (con la RLS de siempre) y el
 * PDF se arma en el navegador: react-pdf se carga con import() recién al
 * tocar "Generar PDF". Las observaciones no se guardan en ningún lado.
 */

type Carga =
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "sin-acceso" }
  | { estado: "listo"; datos: DatosInforme; detalle: DetalleNino }

interface PropsDialogo {
  ninoId: string
  /** El detalle ya cargado (/ninos/[id]); si falta, se carga al abrir. */
  detalle?: DetalleNino
  /** La evaluación elegida al abrir (atajo desde su detalle); si falta, la última. */
  testId?: string
  abierto: boolean
  onCambiarAbierto: (abierto: boolean) => void
  /** Adónde vuelve el foco al cerrar (el botón que lo abrió). */
  devolverFocoA?: RefObject<HTMLElement | null>
}

/** Botón que abre el diálogo: "Generar informe" en /ninos/[id], "Descargar informe" en una evaluación. */
export function BotonInforme({
  texto = "Generar informe",
  variant = "secondary",
  ...props
}: Omit<PropsDialogo, "abierto" | "onCambiarAbierto"> & {
  texto?: string
  variant?: "secondary" | "outline"
}) {
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Button ref={boton} variant={variant} onClick={() => setAbierto(true)}>
        <FileText className="mr-2 size-4" aria-hidden="true" />
        {texto}
      </Button>
      <DialogoInforme {...props} abierto={abierto} onCambiarAbierto={setAbierto} devolverFocoA={boton} />
    </>
  )
}

export function DialogoInforme({ ninoId, detalle, testId, abierto, onCambiarAbierto, devolverFocoA }: PropsDialogo) {
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })
  const [opciones, setOpciones] = useState<OpcionesInforme | null>(null)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titulo = useRef<HTMLHeadingElement>(null)

  // Al abrir: datos frescos y opciones por defecto.
  useEffect(() => {
    if (!abierto) return
    let cancelado = false
    setCarga({ estado: "cargando" })
    setOpciones(null)
    setError(null)
    cargarDatosInforme(ninoId, detalle)
      .then((r) => {
        if (cancelado) return
        if (r.estado !== "listo") return setCarga({ estado: "sin-acceso" })
        setCarga({ estado: "listo", datos: r.datos, detalle: r.detalle })
        setOpciones(opcionesPorDefecto(r.datos, testId))
      })
      .catch((e) => {
        console.error("informe:", e)
        if (!cancelado) setCarga({ estado: "error" })
      })
    return () => {
      cancelado = true
    }
  }, [abierto, ninoId, detalle, testId])

  const cambiarAbierto = (v: boolean) => {
    // Mientras se arma el PDF, el diálogo no se cierra.
    if (!v && generando) return
    onCambiarAbierto(v)
  }

  const datos = carga.estado === "listo" ? carga.datos : null
  const problemas = useMemo(
    () => (datos && opciones ? validarOpciones(opciones, { tests: datos.tests, usuarioId: datos.usuarioId }) : []),
    [datos, opciones],
  )

  const generar = async () => {
    if (!datos || !opciones || problemas.length > 0 || generando) return
    setGenerando(true)
    setError(null)
    try {
      const modelo = construirInforme(datos, opciones, "profesional")
      const { descargarInforme } = await import("@/components/informes/pdf/generar")
      await descargarInforme(modelo)
      setGenerando(false)
      onCambiarAbierto(false)
      toast.success("Informe descargado")
    } catch (e) {
      console.error("informe PDF:", e)
      setGenerando(false)
      setError("No se pudo generar el informe. Probá de nuevo.")
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={cambiarAbierto}>
      <DialogContent
        className="flex max-h-[92dvh] max-w-[calc(100%-1rem)] flex-col gap-0 p-0 sm:max-w-2xl sm:p-0"
        onOpenAutoFocus={(e) => {
          // El foco va al título: el lector de pantalla anuncia el diálogo antes de las opciones.
          e.preventDefault()
          titulo.current?.focus()
        }}
        onCloseAutoFocus={(e) => {
          if (!devolverFocoA?.current) return
          e.preventDefault()
          devolverFocoA.current.focus()
        }}
      >
        <DialogHeader className="border-b border-border/70 px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
          <DialogTitle ref={titulo} tabIndex={-1} className="outline-none">
            Generar informe
          </DialogTitle>
          <DialogDescription>
            Elegí qué incluir. El PDF se arma en tu navegador y se descarga: no queda guardado en Lecxico.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {carga.estado === "cargando" || (carga.estado === "listo" && !opciones) ? (
            <Cargando texto="Cargando los datos del informe…" tamano={72} />
          ) : carga.estado === "error" ? (
            <MensajeAlerta tipo="error" texto="No se pudieron cargar los datos del informe. Cerrá y probá de nuevo." />
          ) : carga.estado === "sin-acceso" ? (
            <MensajeAlerta tipo="error" texto="No tenés acceso a la información de este niño." />
          ) : (
            opciones &&
            datos && (
              <FormularioOpciones
                datos={datos}
                opciones={opciones}
                onCambiar={setOpciones}
                problemas={problemas}
                deshabilitado={generando}
              />
            )
          )}
        </div>

        <div className="space-y-3 border-t border-border/70 px-5 py-4 sm:px-7">
          {error && <MensajeAlerta tipo="error" texto={error} />}
          {datos && opciones && problemas.length > 0 && (
            <p id="motivo-generar" className="text-sm text-muted-foreground">
              {problemas[0].mensaje}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={generando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={generar}
              disabled={!datos || !opciones || problemas.length > 0 || generando}
              aria-describedby={problemas.length > 0 ? "motivo-generar" : undefined}
            >
              {generando ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Generando…
                </>
              ) : (
                "Generar PDF"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Opciones                                                            */
/* ------------------------------------------------------------------ */

function Grupo({ leyenda, children, className }: { leyenda: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="mb-2 text-base font-bold">{leyenda}</legend>
      {children}
    </fieldset>
  )
}

/** Casilla con su etiqueta (y una ayuda opcional, ligada con aria-describedby). */
function Casilla({
  etiqueta,
  ayuda,
  marcada,
  onCambiar,
  deshabilitada,
}: {
  etiqueta: string
  ayuda?: string
  marcada: boolean
  onCambiar: (v: boolean) => void
  deshabilitada?: boolean
}) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={marcada}
        onCheckedChange={(v) => onCambiar(v === true)}
        disabled={deshabilitada}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="mt-0.5 size-5"
      />
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base leading-snug font-medium">
          {etiqueta}
        </Label>
        {ayuda && (
          <p id={`${id}-ayuda`} className="text-sm text-muted-foreground">
            {ayuda}
          </p>
        )}
      </div>
    </div>
  )
}

function ErrorCampo({ problemas, campo }: { problemas: { campo: CampoOpciones; mensaje: string }[]; campo: CampoOpciones }) {
  const p = problemas.find((x) => x.campo === campo)
  return p ? <p className="text-sm font-medium text-rojo-fuerte">{p.mensaje}</p> : null
}

function FormularioOpciones({
  datos,
  opciones: o,
  onCambiar,
  problemas,
  deshabilitado,
}: {
  datos: DatosInforme
  opciones: OpcionesInforme
  onCambiar: (o: OpcionesInforme) => void
  problemas: { campo: CampoOpciones; mensaje: string }[]
  deshabilitado: boolean
}) {
  const ids = { evaluacion: useId(), desde: useId(), hasta: useId(), observaciones: useId(), contador: useId() }
  const cambiar = (cambios: Partial<OpcionesInforme>) => onCambiar({ ...o, ...cambios })
  const elegibles = evaluacionesElegibles(datos.tests, datos.usuarioId, o.incluirOtrosProfesionales)
  const hoy = diaArgentina(new Date()) ?? undefined
  const sinEvaluaciones = datos.tests.length === 0
  // Las fechas vacías no se marcan como error hasta que se carga alguna (el motivo igual se ve junto al botón).
  const errorFechas = (o.desde !== "" || o.hasta !== "") && problemas.some((p) => p.campo === "periodo")

  /** Al dejar afuera lo de otros, si la evaluación elegida es de otro, pasa a la última propia. */
  const cambiarAutoria = (incluir: boolean) => {
    const nuevas = evaluacionesElegibles(datos.tests, datos.usuarioId, incluir)
    const testId = nuevas.some((t) => t.id === o.testId) ? o.testId : (nuevas[0]?.id ?? null)
    cambiar({ incluirOtrosProfesionales: incluir, testId })
  }

  const textoEvaluacion = (t: (typeof datos.tests)[number]) => {
    const autor =
      t.profesional_id === datos.usuarioId
        ? ""
        : ` · ${(t.profesional_id && datos.nombresProfesionales[t.profesional_id]) || OTRO_PROFESIONAL}`
    return `${formatearFecha(t.fecha)} · Nivel ${NIVEL_LABEL[t.nivel]}${autor}`
  }

  return (
    <fieldset disabled={deshabilitado} className="space-y-7">
      <Grupo leyenda="Contenido">
        <Casilla
          etiqueta="Evaluación"
          ayuda={
            sinEvaluaciones
              ? "Todavía no hay evaluaciones."
              : "Resultado y franja de cada bloque de la evaluación que elijas."
          }
          marcada={o.evaluacion}
          onCambiar={(v) => cambiar({ evaluacion: v })}
          deshabilitada={sinEvaluaciones}
        />
        <Casilla
          etiqueta="Seguimiento"
          ayuda="Evolución, entrenamiento, tareas y práctica en casa en un período."
          marcada={o.seguimiento}
          onCambiar={(v) => cambiar({ seguimiento: v })}
        />
        {/* Sin contenido, el motivo ya se ve junto a "Generar PDF". */}
      </Grupo>

      {o.evaluacion && (
        <Grupo leyenda="Evaluación">
          <div className="space-y-2">
            <Label htmlFor={ids.evaluacion} className="text-base">
              Cuál
            </Label>
            <Select value={o.testId ?? ""} onValueChange={(v) => cambiar({ testId: v })}>
              <SelectTrigger id={ids.evaluacion} className="h-11 w-full text-base sm:w-96">
                <SelectValue placeholder="Elegí una evaluación" />
              </SelectTrigger>
              <SelectContent>
                {elegibles.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-base">
                    {textoEvaluacion(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorCampo problemas={problemas} campo="evaluacion" />
          </div>
          <Casilla
            etiqueta="Incluir recomendación"
            ayuda="Los bloques en «Intermedio» y «A observar», con sus juegos."
            marcada={o.incluirRecomendacion}
            onCambiar={(v) => cambiar({ incluirRecomendacion: v })}
          />
        </Grupo>
      )}

      {o.seguimiento && (
        <>
          <Grupo leyenda="Período del seguimiento">
            <RadioGroup
              value={o.periodo}
              onValueChange={(v) => cambiar({ periodo: v as PeriodoInforme })}
              className="grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {PERIODOS_INFORME.map((p) => (
                <div key={p.valor} className="flex items-center gap-3">
                  <RadioGroupItem value={p.valor} id={`${ids.desde}-${p.valor}`} className="size-5" />
                  <Label htmlFor={`${ids.desde}-${p.valor}`} className="text-base font-medium">
                    {p.texto}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {o.periodo === "elegir" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={ids.desde} className="text-base">
                    Desde
                  </Label>
                  <Input
                    id={ids.desde}
                    type="date"
                    value={o.desde}
                    max={o.hasta || hoy}
                    onChange={(e) => cambiar({ desde: e.target.value })}
                    aria-invalid={errorFechas || undefined}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={ids.hasta} className="text-base">
                    Hasta
                  </Label>
                  <Input
                    id={ids.hasta}
                    type="date"
                    value={o.hasta}
                    min={o.desde || undefined}
                    max={hoy}
                    onChange={(e) => cambiar({ hasta: e.target.value })}
                    aria-invalid={errorFechas || undefined}
                  />
                </div>
              </div>
            )}
            {errorFechas && <ErrorCampo problemas={problemas} campo="periodo" />}
          </Grupo>

          <Grupo leyenda="Secciones del seguimiento">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SECCIONES_SEGUIMIENTO.map((sec) => (
                <Casilla
                  key={sec.valor}
                  etiqueta={sec.texto}
                  marcada={o.secciones[sec.valor]}
                  onCambiar={(v) => cambiar({ secciones: { ...o.secciones, [sec.valor]: v } })}
                />
              ))}
            </div>
            <ErrorCampo problemas={problemas} campo="secciones" />
          </Grupo>
        </>
      )}

      {datos.comparteHistorial && (
        <Grupo leyenda="Autoría">
          <Casilla
            etiqueta="Incluir lo registrado por otros profesionales"
            ayuda="Evaluaciones, partidas en consulta y tareas de otros profesionales. La práctica en casa se incluye siempre."
            marcada={o.incluirOtrosProfesionales}
            onCambiar={cambiarAutoria}
          />
        </Grupo>
      )}

      <div className="space-y-2">
        <Label htmlFor={ids.observaciones} className="text-base font-bold">
          Observaciones del profesional
        </Label>
        <Textarea
          id={ids.observaciones}
          value={o.observaciones}
          maxLength={MAX_OBSERVACIONES}
          onChange={(e) => cambiar({ observaciones: e.target.value })}
          aria-describedby={ids.contador}
          rows={4}
          className="max-h-60 min-h-24 rounded-xl bg-white text-base md:text-base"
          placeholder="Opcional. Sale impreso al final del informe."
        />
        <p id={ids.contador} className="flex justify-between gap-3 text-sm text-muted-foreground">
          <span>No se guarda: solo sale en este PDF.</span>
          <span className="tabular-nums">
            {o.observaciones.length} / {MAX_OBSERVACIONES}
          </span>
        </p>
        <ErrorCampo problemas={problemas} campo="observaciones" />
      </div>
    </fieldset>
  )
}
