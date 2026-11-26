/**
 * Datos del seguimiento (S16). Reciben el cliente de Supabase, así se pueden
 * probar sin red (como lib/entrenamiento/partidas.ts) y los puede usar el
 * informe en PDF (S17).
 *
 * Qué partidas ve el profesional lo deciden las RLS de la 0008 (la práctica,
 * siempre; consulta y tareas, según el historial compartido): acá no se
 * agrega ningún filtro propio. Las evaluaciones ya llegan con sus bloques en
 * DetalleNino.tests, y el grado habilitado en casa sale de gradosHabilitados.
 */
import type { SupabaseClient } from "@supabase/supabase-js"
import type { PartidaSeguimiento } from "@/lib/seguimiento/entrenamiento"

/** Filas por página: el límite por defecto de PostgREST en Supabase. */
export const FILAS_POR_PAGINA = 1000

/** Tope de páginas, por las dudas (100 000 partidas): evita un bucle sin fin si la API respondiera siempre llena. */
const MAX_PAGINAS = 100

const COLUMNAS = "juego, grado, origen, correctas, total, porcentaje, tiempo_ms, errores, created_at"

/**
 * Todas las partidas visibles del niño, de la más reciente a la más vieja.
 * Pagina con `range` de a 1000 hasta que una página viene incompleta. El
 * orden incluye `id` para que la paginación sea estable si dos partidas
 * tienen el mismo `created_at`.
 */
export async function cargarPartidasSeguimiento(supabase: SupabaseClient, ninoId: string): Promise<PartidaSeguimiento[]> {
  const partidas: PartidaSeguimiento[] = []
  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    const desde = pagina * FILAS_POR_PAGINA
    const { data, error } = await supabase
      .from("entrenamiento_partida")
      .select(COLUMNAS)
      .eq("nino_id", ninoId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(desde, desde + FILAS_POR_PAGINA - 1)
    if (error) throw new Error(error.message || "No se pudieron cargar las partidas.")
    const filas = (data ?? []) as PartidaSeguimiento[]
    partidas.push(...filas)
    if (filas.length < FILAS_POR_PAGINA) break
  }
  return partidas
}
