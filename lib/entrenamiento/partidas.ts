/*
 * DATOS DEL ENTRENAMIENTO EN LA BASE (0008)
 * ------------------------------------------------------------------
 * Envoltorios tipados de las funciones de la 0008 y de las lecturas que
 * necesitan las áreas. Reciben el cliente de Supabase (como
 * lib/auth/perfil.ts), así se pueden probar sin red.
 *
 *   guardar_partida             → guardarPartida
 *   grados_habilitados          → gradosHabilitados
 *   cambiar_letra_entrenamiento → cambiarLetraEntrenamiento
 *   entrenamiento_tarea (+item) → tareasPendientes
 *
 * Los errores se lanzan como ErrorEntrenamiento, con un mensaje para
 * mostrar al usuario que no revela si algo existe.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { esCodigoJuego } from "@/lib/entrenamiento/presentacion"
import type { CodigoJuego, Grado, Origen } from "@/lib/entrenamiento/juegos"
import type { DetalleRonda } from "@/lib/entrenamiento/rondas"

export type LetraEntrenamiento = "mayuscula" | "minuscula"

export class ErrorEntrenamiento extends Error {
  constructor(mensaje: string, readonly original?: unknown) {
    super(mensaje)
    this.name = "ErrorEntrenamiento"
  }
}

/** Mensajes de las funciones de la 0008 que se pueden mostrar tal cual. */
const MENSAJES_CONOCIDOS: [fragmento: string, mensaje: string][] = [
  ["Hace falta iniciar sesión", "Tu sesión se cerró. Volvé a iniciar sesión."],
  ["todavía no está desbloqueado", "Ese grado todavía no está desbloqueado."],
  ["solo para la consulta", "Este juego se juega solo en la consulta."],
  ["La tarea no existe o ya está hecha", "Esa tarea ya no está pendiente."],
  ["no es parte de la tarea", "Ese juego no es parte de la tarea."],
  ["no corresponde al nivel", "Este juego no corresponde al nivel del niño."],
]

/** Traduce un error de Supabase (o de red) a un mensaje para el usuario. */
export function mensajeErrorEntrenamiento(error: unknown, generico: string): string {
  const texto =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : ""
  for (const [fragmento, mensaje] of MENSAJES_CONOCIDOS) {
    if (texto.includes(fragmento)) return mensaje
  }
  if (/fetch|network|conexi/i.test(texto)) return "No se pudo conectar. Revisá tu conexión y probá de nuevo."
  // El resto (sin vínculo, niño que no existe, datos inválidos) no se detalla.
  return generico
}

function fallar(error: unknown, generico: string): never {
  throw new ErrorEntrenamiento(mensajeErrorEntrenamiento(error, generico), error)
}

export interface PartidaParaGuardar {
  ninoId: string
  juego: CodigoJuego
  grado: Grado
  origen: Origen
  correctas: number
  total: number
  detalle: DetalleRonda[]
  /** Solo con origen "tarea". */
  tareaId?: string | null
  /** Solo los juegos que miden tiempo y errores (Nombrá rápido, S13b). */
  tiempoMs?: number
  errores?: number
}

export interface PartidaGuardada {
  partida: string
  porcentaje: number
  /** Grado habilitado en casa para ese juego, después de esta partida. */
  gradoHabilitado: Grado
}

const aGrado = (n: unknown): Grado => (n === 2 || n === 3 ? n : 1)

export async function guardarPartida(supabase: SupabaseClient, p: PartidaParaGuardar): Promise<PartidaGuardada> {
  const { data, error } = await supabase.rpc("guardar_partida", {
    p_nino: p.ninoId,
    p_juego: p.juego,
    p_grado: p.grado,
    p_origen: p.origen,
    p_correctas: p.correctas,
    p_total: p.total,
    p_tiempo_ms: p.tiempoMs ?? null,
    p_errores: p.errores ?? null,
    p_detalle: p.detalle,
    p_tarea: p.origen === "tarea" ? (p.tareaId ?? null) : null,
  })
  if (error || !data) fallar(error, "No se pudo guardar la partida. Probá de nuevo.")
  const r = data as { partida: string; porcentaje: number; grado_habilitado: number }
  return { partida: r.partida, porcentaje: Number(r.porcentaje), gradoHabilitado: aGrado(r.grado_habilitado) }
}

export type GradosHabilitados = Partial<Record<CodigoJuego, Grado>>

/** Grado habilitado en casa por juego, para el nivel actual del niño. */
export async function gradosHabilitados(supabase: SupabaseClient, ninoId: string): Promise<GradosHabilitados> {
  const { data, error } = await supabase.rpc("grados_habilitados", { p_nino: ninoId })
  if (error) fallar(error, "No se pudo cargar el entrenamiento. Recargá la página.")
  const grados: GradosHabilitados = {}
  for (const fila of (data ?? []) as { juego: string; grado: number }[]) {
    if (esCodigoJuego(fila.juego)) grados[fila.juego] = aGrado(fila.grado)
  }
  return grados
}

/** Grado habilitado de un juego (el 1 está siempre habilitado). */
export function gradoDe(grados: GradosHabilitados, juego: CodigoJuego): Grado {
  return grados[juego] ?? 1
}

export async function cambiarLetraEntrenamiento(
  supabase: SupabaseClient,
  ninoId: string,
  letra: LetraEntrenamiento,
): Promise<void> {
  const { error } = await supabase.rpc("cambiar_letra_entrenamiento", { p_nino: ninoId, p_letra: letra })
  if (error) fallar(error, "No se pudo guardar el tipo de letra.")
}

export interface ItemTarea {
  orden: number
  juego: CodigoJuego
  grado: Grado
}

export interface TareaPendiente {
  id: string
  nombre: string | null
  esMision: boolean
  creadaEl: string
  items: ItemTarea[]
}

interface FilaTarea {
  id: string
  nombre: string | null
  es_mision: boolean
  created_at: string
  entrenamiento_tarea_item: { orden: number; juego: string; grado: number }[] | null
}

/**
 * Tareas pendientes del niño, de la más vieja a la más nueva, con sus
 * juegos en orden. La RLS deja leerlas al propio niño (0008).
 */
export async function tareasPendientes(supabase: SupabaseClient, ninoId: string): Promise<TareaPendiente[]> {
  const { data, error } = await supabase
    .from("entrenamiento_tarea")
    .select("id, nombre, es_mision, created_at, entrenamiento_tarea_item (orden, juego, grado)")
    .eq("nino_id", ninoId)
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true })
  if (error) fallar(error, "No se pudieron cargar las tareas.")
  return ((data ?? []) as FilaTarea[]).map((t) => ({
    id: t.id,
    nombre: t.nombre,
    esMision: t.es_mision,
    creadaEl: t.created_at,
    items: (t.entrenamiento_tarea_item ?? [])
      .filter((i) => esCodigoJuego(i.juego))
      .map((i) => ({ orden: i.orden, juego: i.juego as CodigoJuego, grado: aGrado(i.grado) }))
      .sort((a, b) => a.orden - b.orden),
  }))
}

/** La partida más reciente de un niño, para la tabla de /entrenar. */
export interface UltimaPartida {
  ninoId: string
  juego: string
  grado: Grado
  fecha: string
}

interface FilaUltima {
  nino_id: string
  juego: string
  grado: number
  created_at: string
}

/** De filas ordenadas de la más nueva a la más vieja, la primera de cada niño. */
export function primeraPorNino(filas: readonly FilaUltima[]): Map<string, UltimaPartida> {
  const ultimas = new Map<string, UltimaPartida>()
  for (const f of filas) {
    if (!ultimas.has(f.nino_id)) {
      ultimas.set(f.nino_id, { ninoId: f.nino_id, juego: f.juego, grado: aGrado(f.grado), fecha: f.created_at })
    }
  }
  return ultimas
}

/**
 * La partida más reciente que el profesional actual puede ver de cada niño
 * (RLS de la 0008: la práctica, siempre; consulta y tareas, según el
 * historial compartido). Un niño sin partidas visibles no aparece.
 */
export async function ultimasPartidas(supabase: SupabaseClient, ninoIds: string[]): Promise<Map<string, UltimaPartida>> {
  if (ninoIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from("entrenamiento_partida")
    .select("nino_id, juego, grado, created_at")
    .in("nino_id", ninoIds)
    .order("created_at", { ascending: false })
  if (error) fallar(error, "No se pudo cargar el último entrenamiento.")
  return primeraPorNino((data ?? []) as FilaUltima[])
}

/** true si la tarea pendiente incluye ese juego en ese grado. */
export function tareaIncluye(tarea: TareaPendiente, juego: CodigoJuego, grado: Grado): boolean {
  return tarea.items.some((i) => i.juego === juego && i.grado === grado)
}
