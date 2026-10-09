"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Dumbbell, Lightbulb, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaginaApp } from "@/components/pagina-app"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { CargandoSeccion, SinAccesoNino } from "@/components/ninos/piezas-detalle"
import { Seccion } from "@/components/seccion"
import { HistorialEvaluaciones } from "@/components/test/historial-evaluaciones"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { calcularEdad, formatearFecha, textoEdad } from "@/lib/fechas"
import { getGameById } from "@/lib/games-catalog"
import { cargarDetalleNino, type DetalleNino, type TestConBloques } from "@/lib/ninos/detalle"
import { bloquesMasDebiles, ordenRecomendacion, porcentajeBloque } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, ETAPAS_ESCOLARES, NIVEL_LABEL, nivelParaEtapa, rutaDelTest } from "@/lib/test/bloques"
import { desvincular } from "@/lib/vinculos"

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
    ["Última evaluación", oGuion(nino.ultima_prueba)],
  ]

  return (
    <Seccion icono={<User className="w-5 h-5" />} colorIcono="bg-purple-100 text-purple-600" titulo="Información general">
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {campos.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-sm text-gray-500">{etiqueta}</dt>
            <dd className="font-medium break-words">{valor}</dd>
          </div>
        ))}
      </dl>
    </Seccion>
  )
}

/* ------------------------------------------------------------------ */
/*  Recomendación (última evaluación, de cualquier profesional)         */
/* ------------------------------------------------------------------ */
const colorBarra = (pct: number) =>
  pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500"

function Recomendacion({ datos }: { datos: DetalleNino }) {
  const ultimo = datos.tests[0]

  return (
    <Seccion icono={<Lightbulb className="w-5 h-5" />} colorIcono="bg-amber-100 text-amber-600" titulo="Recomendación">
      {!ultimo ? (
        <div className="text-center py-6 space-y-4">
          <p className="text-gray-500">La recomendación va a aparecer después de la primera evaluación.</p>
          <Button asChild>
            <Link href={rutaDelTest(nivelParaEtapa(datos.nino.etapa_escolar), datos.perfil.id)}>Tomar evaluación</Link>
          </Button>
        </div>
      ) : (
        <ListaRecomendacion test={ultimo} />
      )}
    </Seccion>
  )
}

function ListaRecomendacion({ test }: { test: TestConBloques }) {
  const ordenados = ordenRecomendacion(test.bloques)
  const prioritarios = new Set(bloquesMasDebiles(test.bloques).map((b) => b.bloque_codigo))

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Según la evaluación del {formatearFecha(test.fecha)} (Nivel {NIVEL_LABEL[test.nivel]}). Los bloques van de menor a
        mayor porcentaje de acierto.
      </p>
      <ul className="space-y-3">
        {ordenados.map((b) => {
          const pct = porcentajeBloque(b.correctas, b.total)
          const primero = prioritarios.has(b.bloque_codigo)
          return (
            <li
              key={b.bloque_codigo}
              className={`rounded-lg border p-3 ${primero ? "border-red-300 bg-red-50" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-medium flex flex-wrap items-center gap-2">
                  {BLOQUE_NOMBRES[b.bloque_codigo]}
                  {primero && (
                    <span className="text-xs font-semibold uppercase tracking-wide rounded-full bg-red-600 text-white px-2 py-0.5">
                      Practicar primero
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden" aria-hidden="true">
                <div className={`h-full rounded-full ${colorBarra(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
      {prioritarios.size === 0 && <p className="text-sm text-gray-600">En esa evaluación respondió bien todos los bloques.</p>}
      <p className="text-xs text-gray-500">
        Es una orientación a partir de la última evaluación: vos decidís qué trabajar con el niño.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Historial de entrenamientos                                         */
/* ------------------------------------------------------------------ */
function HistorialEntrenamientos({ datos }: { datos: DetalleNino }) {
  return (
    <Seccion
      icono={<Dumbbell className="w-5 h-5" />}
      colorIcono="bg-green-100 text-green-600"
      titulo="Historial de entrenamientos"
    >
      {datos.entrenamientos.length === 0 ? (
        <p className="text-center text-gray-500 py-6">Todavía no hay entrenamientos registrados.</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-2 font-semibold">Fecha</th>
                <th className="px-4 py-2 font-semibold">Juego</th>
                <th className="px-4 py-2 font-semibold text-right">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {datos.entrenamientos.map((e) => (
                <tr key={e.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{formatearFecha(e.created_at)}</td>
                  <td className="px-4 py-2">{getGameById(e.juego)?.title ?? e.juego}</td>
                  <td className="px-4 py-2 text-right font-medium">{e.puntaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Seccion>
  )
}
