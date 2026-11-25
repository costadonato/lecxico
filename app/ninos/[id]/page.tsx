"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Dumbbell, Gamepad2, History, Lightbulb, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EstadoVacio } from "@/components/estados"
import { Iniciales } from "@/components/iniciales"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { NumeroAnimado } from "@/components/motion/numero-animado"
import { PaginaApp } from "@/components/pagina-app"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { FranjasRecomendacion } from "@/components/ninos/franjas-recomendacion"
import { CargandoSeccion, SinAccesoNino } from "@/components/ninos/piezas-detalle"
import { Seccion } from "@/components/seccion"
import { HistorialEvaluaciones } from "@/components/test/historial-evaluaciones"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { calcularEdad, formatearFecha, textoEdad } from "@/lib/fechas"
import { ORIGEN_CORTO, nombreJuego } from "@/lib/entrenamiento/presentacion"
import { estiloNivel } from "@/lib/niveles"
import { cargarDetalleNino, type DetalleNino, type PartidaHistorial } from "@/lib/ninos/detalle"
import { ETAPAS_ESCOLARES, NIVEL_LABEL, nivelParaEtapa, rutaDelTest } from "@/lib/test/bloques"
import { ultimaEvaluacion } from "@/lib/test/franjas"
import { desvincular } from "@/lib/vinculos"
import { cn } from "@/lib/utils"

type Carga = { estado: "cargando" } | { estado: "error"; mensaje: string } | { estado: "sin-acceso" } | { estado: "listo"; datos: DetalleNino }

export default function DetalleNinoPage() {
  const { id } = useParams<{ id: string }>()
  const pagina = usePerfilPagina("profesional")
  const perfilListo = pagina.estado === "listo"
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })

  useEffect(() => {
    if (!perfilListo) return
    let cancelado = false
    cargarDetalleNino(id)
      .then((r) => { if (!cancelado) setCarga(r) })
      .catch((e) => {
        console.error("detalle niño:", e)
        if (!cancelado) setCarga({ estado: "error", mensaje: "No se pudo cargar la información del niño. Recargá la página." })
      })
    return () => { cancelado = true }
  }, [perfilListo, id])

  const datos = carga.estado === "listo" ? carga.datos : null

  return (
    <PaginaApp
      pagina={pagina}
      titulo={datos ? `${datos.perfil.nombre} ${datos.perfil.apellido}` : "Detalle del niño"}
      acciones={datos ? <AccionesEncabezado datos={datos} /> : undefined}
      volverA="/ninos"
    >
      {() =>
        carga.estado === "cargando" ? (
          <CargandoSeccion />
        ) : carga.estado === "error" ? (
          <MensajeAlerta tipo="error" texto={carga.mensaje} />
        ) : carga.estado === "sin-acceso" ? (
          <SinAccesoNino />
        ) : (
          <div className="space-y-6">
            <InformacionGeneral datos={carga.datos} />
            <Recomendacion datos={carga.datos} />
            <AlcanceHistorial comparte={carga.datos.vinculo.comparte_historial} />
            <HistorialEvaluaciones
              tests={carga.datos.tests}
              urlDetalle={(testId) => `/ninos/${carga.datos.perfil.id}/tests/${testId}`}
            />
            <HistorialEntrenamientos datos={carga.datos} />
          </div>
        )
      }
    </PaginaApp>
  )
}

/* ------------------------------------------------------------------ */
/*  Encabezado: Tomar evaluación / Dar de baja (sin editar)             */
/* ------------------------------------------------------------------ */
function AccionesEncabezado({ datos }: { datos: DetalleNino }) {
  const router = useRouter()
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const nombre = `${datos.perfil.nombre} ${datos.perfil.apellido}`

  const pedirBaja = () =>
    setConfirmacion({
      titulo: `¿Dar de baja a ${nombre}?`,
      descripcion:
        "Vas a dejar de ver su información (datos, evaluaciones y entrenamientos). Podés volver a invitarlo cuando quieras con su nombre de usuario.",
      textoConfirmar: "Dar de baja",
      accion: async () => {
        await desvincular(datos.vinculo.id)
        router.push("/ninos")
      },
    })

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <Link href={rutaDelTest(nivelParaEtapa(datos.nino.etapa_escolar), datos.perfil.id)}>Tomar evaluación</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href={`/ninos/${datos.perfil.id}/entrenamiento`}>
          <Gamepad2 className="mr-2 size-4" aria-hidden="true" />
          Entrenar en consulta
        </Link>
      </Button>
      <Button variant="outline" onClick={pedirBaja}>
        Dar de baja
      </Button>
      <ConfirmarDialog confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Información general                                                 */
/* ------------------------------------------------------------------ */
function InformacionGeneral({ datos }: { datos: DetalleNino }) {
  const { perfil, nino, vinculo } = datos
  const etapa = ETAPAS_ESCOLARES.find((e) => e.valor === nino.etapa_escolar)?.label ?? nino.etapa_escolar
  const edad = textoEdad(calcularEdad(nino.fecha_nacimiento))
  const oGuion = (iso: string | null) => formatearFecha(iso) || "—"

  const campos: [string, string][] = [
    ["Nombre", perfil.nombre],
    ["Apellido", perfil.apellido],
    ["Usuario", perfil.nombre_usuario ? `@${perfil.nombre_usuario}` : "—"],
    ["Fecha de nacimiento", `${formatearFecha(nino.fecha_nacimiento)}${edad ? ` (${edad})` : ""}`],
    ["Etapa escolar", etapa],
    ["Nivel de la evaluación", NIVEL_LABEL[nivelParaEtapa(nino.etapa_escolar)]],
    ["Mail del tutor", nino.tutor_email],
    ...(nino.tutor_telefono ? ([["Teléfono del tutor", nino.tutor_telefono]] as [string, string][]) : []),
    ["Vinculado con vos desde", oGuion(vinculo.fecha_afiliacion)],
    ["Última conexión", oGuion(nino.ultima_conexion)],
    ["Último entrenamiento", oGuion(nino.ultimo_entrenamiento)],
    // De la evaluación visible más reciente: ninos.ultima_prueba cuenta las
    // de cualquier profesional, aunque el tutor no haya compartido el historial.
    ["Última evaluación", oGuion(datos.tests[0]?.fecha ?? null)],
  ]

  const ultimo = datos.tests[0]
  const cifras: { etiqueta: string; valor: number | null; sufijo?: string; clase: string }[] = [
    { etiqueta: "Evaluaciones", valor: datos.tests.length, clase: "bg-celeste-suave text-celeste-fuerte" },
    {
      etiqueta: "Último porcentaje general",
      valor: ultimo ? ultimo.porcentaje_total : null,
      sufijo: "%",
      clase: ultimo ? cn(estiloNivel(ultimo.porcentaje_total).suave, estiloNivel(ultimo.porcentaje_total).texto) : "bg-muted text-muted-foreground",
    },
    { etiqueta: "Partidas del entrenamiento", valor: datos.totalPartidas, clase: "bg-menta-suave text-menta-fuerte" },
  ]

  return (
    <Seccion icono={<User />} tono="lavanda" titulo="Información general">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Iniciales nombre={perfil.nombre} apellido={perfil.apellido} semilla={perfil.nombre_usuario} className="size-16 text-xl" />
          <div className="min-w-0 space-y-1.5">
            <p className="text-2xl font-bold leading-tight">
              {perfil.nombre} {perfil.apellido}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {perfil.nombre_usuario && <span className="text-base text-muted-foreground">@{perfil.nombre_usuario}</span>}
              <Badge variant="lavanda">{etapa}</Badge>
              {edad && <Badge variant="neutro">{edad}</Badge>}
            </div>
          </div>
        </div>

        <ListaCascada as="dl" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cifras.map((c) => (
            <ItemCascada key={c.etiqueta} className={cn("rounded-2xl px-4 py-3", c.clase)}>
              <dt className="text-sm font-semibold">{c.etiqueta}</dt>
              <dd className="text-3xl font-bold">
                {c.valor === null ? "—" : <NumeroAnimado valor={c.valor} sufijo={c.sufijo} />}
              </dd>
            </ItemCascada>
          ))}
        </ListaCascada>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {campos.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="border-b border-border/60 py-3">
              <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
              <dd className="break-words font-semibold">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Seccion>
  )
}

/* ------------------------------------------------------------------ */
/*  Qué parte del historial ve el profesional (elección del tutor)      */
/* ------------------------------------------------------------------ */
function AlcanceHistorial({ comparte }: { comparte: boolean }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 text-base">
      <History className="mt-0.5 size-5 shrink-0 text-lavanda-fuerte" aria-hidden="true" />
      {comparte
        ? "El tutor compartió el historial completo: ves lo que registraron todos los profesionales del niño."
        : "El tutor eligió no compartir el historial: ves solo lo que registraste vos."}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/*  Franjas y recomendación (última evaluación visible, S11)            */
/* ------------------------------------------------------------------ */
function Recomendacion({ datos }: { datos: DetalleNino }) {
  const ultimo = ultimaEvaluacion(datos.tests)

  return (
    <Seccion icono={<Lightbulb />} tono="sol" titulo="Franjas y recomendación">
      {!ultimo ? (
        <EstadoVacio
          compacto
          descripcion="La recomendación va a aparecer después de la primera evaluación."
          accion={
            <Button asChild>
              <Link href={rutaDelTest(nivelParaEtapa(datos.nino.etapa_escolar), datos.perfil.id)}>Tomar evaluación</Link>
            </Button>
          }
        />
      ) : (
        <FranjasRecomendacion test={ultimo} etapa={datos.nino.etapa_escolar} />
      )}
    </Seccion>
  )
}

/* ------------------------------------------------------------------ */
/*  Historial de entrenamientos                                         */
/* ------------------------------------------------------------------ */
const TONO_ORIGEN: Record<PartidaHistorial["origen"], "celeste" | "lavanda" | "menta"> = {
  consulta: "celeste",
  tarea: "lavanda",
  practica: "menta",
}

function HistorialEntrenamientos({ datos }: { datos: DetalleNino }) {
  const { partidas, totalPartidas } = datos
  return (
    <Seccion
      icono={<Dumbbell />}
      tono="menta"
      titulo="Historial de entrenamientos"
      acciones={
        <Button asChild variant="outline" size="sm">
          <Link href={`/ninos/${datos.perfil.id}/entrenamiento`}>Entrenar en consulta</Link>
        </Button>
      }
    >
      {partidas.length === 0 ? (
        <EstadoVacio compacto descripcion="Todavía no hay partidas del entrenamiento registradas." />
      ) : (
        <div className="space-y-3">
          {totalPartidas > partidas.length && (
            <p className="text-sm text-muted-foreground">
              Se muestran las últimas {partidas.length} de {totalPartidas} partidas.
            </p>
          )}
          <div className="overflow-hidden rounded-2xl border border-border/80 max-md:rounded-none max-md:border-0">
            <Table tarjetasEnCelular>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Juego</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <CuerpoTablaAnimado>
                {partidas.map((p) => (
                  <FilaTablaAnimada key={p.id}>
                    <TableCell data-label="Fecha" className="tabular-nums">{formatearFecha(p.created_at)}</TableCell>
                    <TableCell data-label="Juego" className="whitespace-normal font-medium">
                      {nombreJuego(p.juego)}
                    </TableCell>
                    <TableCell data-label="Grado" className="tabular-nums">{p.grado}</TableCell>
                    <TableCell data-label="Origen">
                      <Badge variant={TONO_ORIGEN[p.origen]}>{ORIGEN_CORTO[p.origen]}</Badge>
                    </TableCell>
                    <TableCell data-label="Resultado" className="text-right tabular-nums">
                      <span className="font-semibold">
                        {p.correctas} / {p.total}
                      </span>{" "}
                      <span className={cn("font-bold", estiloNivel(p.porcentaje).texto)}>({p.porcentaje} %)</span>
                    </TableCell>
                  </FilaTablaAnimada>
                ))}
              </CuerpoTablaAnimado>
            </Table>
          </div>
        </div>
      )}
    </Seccion>
  )
}
