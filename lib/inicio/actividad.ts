/*
 * ACTIVIDAD RECIENTE DEL INICIO DEL PROFESIONAL
 * ------------------------------------------------------------------
 * Las últimas evaluaciones y partidas de los niños vinculados, mezcladas
 * de la más nueva a la más vieja. Qué filas se ven lo decide la RLS: las
 * evaluaciones según `profesional_puede_ver_registro` (0005/0007) y las
 * partidas según la 0008 (la práctica, siempre; consulta y tareas, según
 * el historial compartido). Acá no se agrega ningún filtro que muestre de
 * más ni se usa la clave de servicio.
 *
 * La lógica es pura (mezcla, textos, fechas relativas, contador) y tiene
 * pruebas; `cargarActividadReciente` es la única que consulta la base y
 * recibe el cliente.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Grado, Origen } from "@/lib/entrenamiento/juegos"
import { nombreJuego, ORIGEN_CORTO } from "@/lib/entrenamiento/presentacion"
import { formatearFecha } from "@/lib/fechas"
import type { Nivel } from "@/lib/test/bloques"

/** Cuántas actividades muestra el panel (y cuántas se piden de cada fuente). */
export const ACTIVIDADES_EN_PANEL = 10

/** Días que cuenta la insignia del botón. */
export const DIAS_INSIGNIA = 7

/** Una evaluación tal como la trae la consulta. */
export interface FilaEvaluacion {
  id: string
  nino_id: string
  nivel: Nivel
  fecha: string
}

/** Una partida tal como la trae la consulta. */
export interface FilaPartida {
  id: string
  nino_id: string
  juego: string
  grado: number
  origen: Origen
  created_at: string
}

/** Un niño vinculado, con lo necesario para nombrarlo. */
export interface NinoNombrado {
  nino_id: string
  nombre: string
  apellido: string
}

export type Actividad =
  | { tipo: "evaluacion"; id: string; ninoId: string; fecha: string; nivel: Nivel }
  | { tipo: "partida"; id: string; ninoId: string; fecha: string; juego: string; grado: Grado; origen: Origen }

/** Una fila del panel, ya con los textos. */
export interface FilaActividad {
  /** Clave única entre las dos fuentes ("evaluacion-<id>", "partida-<id>"). */
  clave: string
  tipo: Actividad["tipo"]
  nino: string
  texto: string
  fecha: string
  href: string
}

const aGrado = (g: number): Grado => (g >= 3 ? 3 : g <= 1 ? 1 : 2)

/**
 * Mezcla las dos fuentes, ordena de la más nueva a la más vieja y se queda
 * con las primeras `limite`. Con la misma fecha, la evaluación va primero.
 */
export function mezclarActividad(
  evaluaciones: readonly FilaEvaluacion[],
  partidas: readonly FilaPartida[],
  limite = ACTIVIDADES_EN_PANEL,
): Actividad[] {
  const todas: Actividad[] = [
    ...evaluaciones.map(
      (e): Actividad => ({ tipo: "evaluacion", id: e.id, ninoId: e.nino_id, fecha: e.fecha, nivel: e.nivel }),
    ),
    ...partidas.map(
      (p): Actividad => ({
        tipo: "partida",
        id: p.id,
        ninoId: p.nino_id,
        fecha: p.created_at,
        juego: p.juego,
        grado: aGrado(p.grado),
        origen: p.origen,
      }),
    ),
  ]
  return todas
    .map((a, i) => ({ a, t: new Date(a.fecha).getTime(), i }))
    .sort((x, y) => y.t - x.t || x.i - y.i)
    .slice(0, limite)
    .map(({ a }) => a)
}

/** "Juan P.": nombre e inicial del apellido (solo el nombre si no hay apellido). */
export function nombreCorto(nombre: string, apellido: string): string {
  const n = nombre.trim()
  const inicial = apellido.trim().charAt(0).toUpperCase()
  return inicial ? `${n} ${inicial}.` : n
}

/** Qué fue: "Evaluación de primaria" o "Memotono · grado 2 · Práctica". */
export function textoActividad(a: Actividad): string {
  if (a.tipo === "evaluacion") {
    return `Evaluación de ${a.nivel === "inicial" ? "inicial" : "primaria"}`
  }
  return `${nombreJuego(a.juego)} · grado ${a.grado} · ${ORIGEN_CORTO[a.origen]}`
}

/** Medianoche local del día de `d`, en milisegundos. */
const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** Días de calendario (hora local) entre `fecha` y `ahora`; nunca negativo. */
export function diasDesde(fecha: string | Date, ahora: Date): number {
  const dias = Math.round((inicioDelDia(ahora) - inicioDelDia(new Date(fecha))) / 86_400_000)
  return Math.max(0, dias)
}

/**
 * Fecha relativa por días de calendario: "hoy", "ayer", "hace 3 días" (hasta
 * 6) y, desde los 7 días, la fecha (dd/mm/aaaa). Una fecha futura (reloj
 * desfasado) cuenta como "hoy".
 */
export function fechaRelativa(fecha: string, ahora: Date = new Date()): string {
  const dias = diasDesde(fecha, ahora)
  if (dias === 0) return "hoy"
  if (dias === 1) return "ayer"
  if (dias < DIAS_INSIGNIA) return `hace ${dias} días`
  return formatearFecha(fecha)
}

/** Cuántas actividades son de los últimos `dias` días (hoy incluido). */
export function contarRecientes(
  actividades: readonly Pick<Actividad, "fecha">[],
  ahora: Date = new Date(),
  dias = DIAS_INSIGNIA,
): number {
  return actividades.filter((a) => diasDesde(a.fecha, ahora) < dias).length
}

/** Texto de la insignia: null si no hay ninguna (se esconde) y "9+" si pasa de 9. */
export function textoInsignia(cantidad: number): string | null {
  if (cantidad <= 0) return null
  return cantidad > 9 ? "9+" : String(cantidad)
}

/**
 * Las filas del panel: cada actividad con el nombre del niño, el texto, la
 * fecha relativa y el enlace al detalle. Una actividad de un niño que no
 * está en la lista de vinculados no se muestra.
 */
export function filasActividad(
  actividades: readonly Actividad[],
  ninos: readonly NinoNombrado[],
  ahora: Date = new Date(),
): FilaActividad[] {
  const nombres = new Map(ninos.map((n) => [n.nino_id, nombreCorto(n.nombre, n.apellido)]))
  return actividades.flatMap((a) => {
    const nino = nombres.get(a.ninoId)
    if (!nino) return []
    return [
      {
        clave: `${a.tipo}-${a.id}`,
        tipo: a.tipo,
        nino,
        texto: textoActividad(a),
        fecha: fechaRelativa(a.fecha, ahora),
        href: `/ninos/${encodeURIComponent(a.ninoId)}`,
      },
    ]
  })
}

/**
 * Las actividades más recientes que el profesional actual puede ver de sus
 * niños vinculados: dos consultas limitadas (las `ACTIVIDADES_EN_PANEL` más
 * recientes de cada fuente), mezcladas acá. Los niños salen de la lista de
 * vinculados (`ninos_para_test`); sin niños no se consulta nada.
 */
export async function cargarActividadReciente(
  supabase: SupabaseClient,
  ninos: readonly NinoNombrado[],
): Promise<Actividad[]> {
  const ids = ninos.map((n) => n.nino_id)
  if (ids.length === 0) return []

  const [evaluaciones, partidas] = await Promise.all([
    supabase
      .from("test")
      .select("id, nino_id, nivel, fecha")
      .in("nino_id", ids)
      .order("fecha", { ascending: false })
      .limit(ACTIVIDADES_EN_PANEL),
    supabase
      .from("entrenamiento_partida")
      .select("id, nino_id, juego, grado, origen, created_at")
      .in("nino_id", ids)
      .order("created_at", { ascending: false })
      .limit(ACTIVIDADES_EN_PANEL),
  ])
  if (evaluaciones.error || partidas.error) {
    throw new Error("No se pudo cargar la actividad reciente.")
  }
  return mezclarActividad(
    (evaluaciones.data ?? []) as FilaEvaluacion[],
    (partidas.data ?? []) as FilaPartida[],
  )
}
