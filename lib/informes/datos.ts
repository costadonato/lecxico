/**
 * Datos del informe en PDF del profesional (S17a). Todo sale de consultas
 * con la RLS de siempre: el PDF se arma en el navegador con lo que el
 * profesional ya puede leer, sin subir nada a ningún servicio.
 *
 * - Niño, vínculo y evaluaciones: cargarDetalleNino (o el detalle ya cargado).
 * - Partidas: cargarPartidasSeguimiento (S16), todas las visibles.
 * - Grado habilitado en casa: gradosHabilitados (0008).
 * - Tareas: entrenamiento_tarea con sus ítems (RLS de la 0008: las propias, o
 *   todas si el tutor compartió el historial).
 * - Quién emite: el propio perfil.
 * - Nombres de otros profesionales: solo los que la RLS deja leer; los demás
 *   salen como "Otro profesional". No se agrega ningún permiso.
 */
import type { SupabaseClient } from "@supabase/supabase-js"
import { gradosHabilitados } from "@/lib/entrenamiento/partidas"
import type { DatosInforme, TareaInforme } from "@/lib/informes/modelo"
import { cargarDetalleNino, type DetalleNino } from "@/lib/ninos/detalle"
import { cargarPartidasSeguimiento } from "@/lib/seguimiento/datos"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/database"

export type CargaDatosInforme = { estado: "sin-acceso" } | { estado: "listo"; detalle: DetalleNino; datos: DatosInforme }

interface FilaTarea extends Omit<TareaInforme, "items"> {
  entrenamiento_tarea_item: TareaInforme["items"] | null
}

function lanzar(error: { message: string } | null, mensaje: string) {
  if (error) throw new Error(error.message || mensaje)
}

/** Las tareas visibles del niño (pendientes y hechas), con sus juegos. */
export async function cargarTareasInforme(supabase: SupabaseClient, ninoId: string): Promise<TareaInforme[]> {
  const { data, error } = await supabase
    .from("entrenamiento_tarea")
    .select(
      "id, nombre, es_mision, estado, created_at, completada_at, profesional_id, entrenamiento_tarea_item (orden, juego, grado)",
    )
    .eq("nino_id", ninoId)
    .order("created_at", { ascending: true })
  lanzar(error, "No se pudieron cargar las tareas.")
  return ((data ?? []) as FilaTarea[]).map(({ entrenamiento_tarea_item, ...t }) => ({
    ...t,
    items: entrenamiento_tarea_item ?? [],
  }))
}

/**
 * "Nombre Apellido" de cada profesional que la RLS deja leer. Hoy un
 * profesional solo lee su propio perfil (y los de niños vinculados), así
 * que los demás quedan afuera y el modelo los muestra como "Otro profesional".
 */
export async function cargarNombresProfesionales(
  supabase: SupabaseClient,
  ids: readonly string[],
): Promise<Record<string, string>> {
  const unicos = [...new Set(ids)]
  if (unicos.length === 0) return {}
  const { data, error } = await supabase.from("profiles").select("id, nombre, apellido, rol").in("id", unicos)
  lanzar(error, "No se pudieron cargar los nombres.")
  const nombres: Record<string, string> = {}
  for (const p of (data ?? []) as Pick<Profile, "id" | "nombre" | "apellido" | "rol">[]) {
    if (p.rol === "profesional") nombres[p.id] = `${p.nombre} ${p.apellido}`.trim()
  }
  return nombres
}

/**
 * Todo lo que necesita construirInforme para un niño. Si ya se tiene el
 * detalle (/ninos/[id]), se reutiliza; si no (detalle de una evaluación), se
 * carga. "sin-acceso" si no hay sesión o vínculo activo, sin decir por qué.
 */
export async function cargarDatosInforme(ninoId: string, detalleCargado?: DetalleNino): Promise<CargaDatosInforme> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { estado: "sin-acceso" }

  let detalle = detalleCargado
  if (!detalle) {
    const carga = await cargarDetalleNino(ninoId)
    if (carga.estado !== "listo") return { estado: "sin-acceso" }
    detalle = carga.datos
  }

  const [partidas, habilitados, tareas] = await Promise.all([
    cargarPartidasSeguimiento(supabase, ninoId),
    gradosHabilitados(supabase, ninoId),
    cargarTareasInforme(supabase, ninoId),
  ])

  const autores = [
    user.id,
    ...detalle.tests.map((t) => t.profesional_id),
    ...partidas.map((p) => p.profesional_id),
    ...tareas.map((t) => t.profesional_id),
  ].filter((id): id is string => !!id)
  const nombresProfesionales = await cargarNombresProfesionales(supabase, autores)

  return {
    estado: "listo",
    detalle,
    datos: {
      nino: {
        nombre: detalle.perfil.nombre,
        apellido: detalle.perfil.apellido,
        fecha_nacimiento: detalle.nino.fecha_nacimiento,
        etapa_escolar: detalle.nino.etapa_escolar,
      },
      vinculadoDesde: detalle.vinculo.fecha_afiliacion,
      comparteHistorial: detalle.vinculo.comparte_historial,
      usuarioId: user.id,
      emisor: nombresProfesionales[user.id] ?? null,
      tests: detalle.tests,
      partidas,
      habilitados,
      tareas,
      nombresProfesionales,
    },
  }
}
