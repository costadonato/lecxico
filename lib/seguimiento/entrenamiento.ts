/**
 * Seguimiento del entrenamiento (S16): partidas por semana y por origen, y
 * el resumen por juego, para los gráficos de /ninos/[id] y para el informe
 * en PDF (S17). Funciones puras, sin React, sin recharts y sin base de datos.
 *
 * Las semanas van de lunes a domingo en hora de Argentina (UTC−3 todo el
 * año: Argentina no usa horario de verano desde 2009), sin depender de la
 * zona horaria del navegador ni del servidor.
 */
import { JUEGOS, type Grado, type Nivel, type Origen } from "@/lib/entrenamiento/juegos"
import type { GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { esCodigoJuego, nombreJuego } from "@/lib/entrenamiento/presentacion"
import type { EntrenamientoPartida } from "@/lib/types/database"

/**
 * Columnas de una partida que usa el seguimiento (cargarPartidasSeguimiento).
 * `profesional_id` (el autor; null en la práctica) lo usa el filtro de
 * autoría del informe en PDF (S17).
 */
export type PartidaSeguimiento = Pick<
  EntrenamientoPartida,
  | "juego"
  | "grado"
  | "origen"
  | "correctas"
  | "total"
  | "porcentaje"
  | "tiempo_ms"
  | "errores"
  | "created_at"
  | "profesional_id"
>

export const ORIGENES: readonly Origen[] = ["consulta", "tarea", "practica"]

export type ConteoPorOrigen = Record<Origen, number>

const conteoVacio = (): ConteoPorOrigen => ({ consulta: 0, tarea: 0, practica: 0 })

/* ------------------------------------------------------------------ */
/*  Semanas en hora de Argentina                                        */
/* ------------------------------------------------------------------ */

const HORA = 60 * 60 * 1000
const DIA = 24 * HORA
const SEMANA = 7 * DIA
/** Argentina: UTC−3, sin horario de verano. */
const DESFASE_ARGENTINA = -3 * HORA

const dos = (n: number) => String(n).padStart(2, "0")

/** "aaaa-mm-dd" de un instante expresado en UTC (medianoche). */
function claveUTC(ms: number): string {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`
}

/**
 * Medianoche (como instante UTC "de pared") del lunes de la semana de
 * `fecha` en hora de Argentina.
 */
function lunesDe(fecha: Date | string): number {
  const local = new Date(fecha).getTime() + DESFASE_ARGENTINA
  const dia = Math.floor(local / DIA) * DIA
  // getUTCDay: 0 = domingo … 6 = sábado. Días desde el lunes: (dow + 6) % 7.
  const desdeLunes = (new Date(dia).getUTCDay() + 6) % 7
  return dia - desdeLunes * DIA
}

/** "aaaa-mm-dd" del lunes de la semana de `fecha` (hora de Argentina). */
export function semanaDe(fecha: Date | string): string {
  return claveUTC(lunesDe(fecha))
}

export interface SemanaPartidas extends ConteoPorOrigen {
  /** Lunes de la semana, "aaaa-mm-dd". */
  semana: string
  /** Domingo de la semana, "aaaa-mm-dd". */
  hasta: string
  total: number
}

/**
 * Partidas por semana (lunes a domingo, hora de Argentina) y por origen,
 * desde la semana de `desde` hasta la de `hasta`, inclusive. Las semanas sin
 * partidas van con 0 y las partidas fuera del rango no se cuentan. Si
 * `desde` es posterior a `hasta`, lista vacía.
 */
export function partidasPorSemana(
  partidas: readonly Pick<PartidaSeguimiento, "origen" | "created_at">[],
  rango: { desde: Date | string; hasta: Date | string },
): SemanaPartidas[] {
  const primera = lunesDe(rango.desde)
  const ultima = lunesDe(rango.hasta)
  if (primera > ultima) return []

  const semanas = new Map<string, SemanaPartidas>()
  for (let ms = primera; ms <= ultima; ms += SEMANA) {
    const semana = claveUTC(ms)
    semanas.set(semana, { semana, hasta: claveUTC(ms + 6 * DIA), ...conteoVacio(), total: 0 })
  }
  for (const p of partidas) {
    const fila = semanas.get(semanaDe(p.created_at))
    if (!fila) continue
    fila[p.origen]++
    fila.total++
  }
  return [...semanas.values()]
}

export type PeriodoEntrenamiento = "ultimas_12" | "todo"

export const SEMANAS_DEL_PERIODO_CORTO = 12

/**
 * Rango del gráfico de barras: las últimas 12 semanas (la actual y las 11
 * anteriores) o "todo", desde la semana de la primera partida. Sin partidas,
 * "todo" es solo la semana actual.
 */
export function rangoDelPeriodo(
  periodo: PeriodoEntrenamiento,
  partidas: readonly Pick<PartidaSeguimiento, "created_at">[],
  ahora: Date = new Date(),
): { desde: Date; hasta: Date } {
  // Con un bucle y no con Math.min(...): puede haber miles de partidas.
  let primera = Infinity
  let ultima = ahora.getTime()
  for (const p of partidas) {
    const ms = Date.parse(p.created_at)
    if (Number.isNaN(ms)) continue
    if (ms < primera) primera = ms
    // Una partida con el reloj adelantado no queda afuera.
    if (ms > ultima) ultima = ms
  }
  const hasta = new Date(ultima)
  if (periodo === "ultimas_12") {
    return { desde: new Date(ultima - (SEMANAS_DEL_PERIODO_CORTO - 1) * SEMANA), hasta }
  }
  return { desde: new Date(Number.isFinite(primera) ? primera : ultima), hasta }
}

/** Partidas sumadas de varias semanas, por origen. */
export function totalesPorOrigen(semanas: readonly ConteoPorOrigen[]): ConteoPorOrigen & { total: number } {
  const t = { ...conteoVacio(), total: 0 }
  for (const s of semanas) {
    for (const o of ORIGENES) {
      t[o] += s[o]
      t.total += s[o]
    }
  }
  return t
}

const partidasTxt = (n: number) => (n === 1 ? "1 partida" : `${n} partidas`)

/**
 * "12 partidas en 12 semanas: 5 en consulta, 4 de tareas y 3 de práctica en casa."
 * Sin partidas: "No hay partidas en 12 semanas."
 */
export function resumenSemanas(semanas: readonly SemanaPartidas[]): string {
  const t = totalesPorOrigen(semanas)
  const periodo = semanas.length === 1 ? "1 semana" : `${semanas.length} semanas`
  if (t.total === 0) return `No hay partidas en ${periodo}.`
  return `${partidasTxt(t.total)} en ${periodo}: ${t.consulta} en consulta, ${t.tarea} de tareas y ${t.practica} de práctica en casa.`
}

/* ------------------------------------------------------------------ */
/*  Resumen por juego                                                   */
/* ------------------------------------------------------------------ */

export interface ResumenJuego {
  juego: string
  nombre: string
  /**
   * Grado habilitado en casa (1 a 3), o null si no aplica: juego de solo
   * consulta (Nombrá rápido), que no es del nivel actual o que ya no está en
   * el catálogo.
   */
  gradoHabilitado: Grado | null
  partidas: ConteoPorOrigen
  total: number
  /** La partida más reciente. */
  ultimo: { porcentaje: number; fecha: string }
  mejorPorcentaje: number
  gradoMaximo: Grado
}

/** Grado habilitado en casa de un juego, o null si no se juega en casa (ver ResumenJuego). */
function gradoEnCasa(juego: string, habilitados: GradosHabilitados, nivel: Nivel | undefined): Grado | null {
  if (!esCodigoJuego(juego)) return null
  const ficha = JUEGOS[juego]
  if (ficha.soloConsulta) return null
  if (nivel && !ficha.niveles[nivel]) return null
  return habilitados[juego] ?? 1
}

const momento = (iso: string) => Date.parse(iso) || 0

/**
 * Una fila por juego jugado: partidas por origen, último resultado,
 * mejor porcentaje, grado más alto jugado y grado habilitado en casa. Las
 * filas van de la última partida más reciente a la más vieja. `nivel` (el
 * actual del niño) deja sin grado en casa a los juegos de otro nivel, porque
 * `habilitados` es del nivel actual.
 */
export function resumenPorJuego(
  partidas: readonly PartidaSeguimiento[],
  habilitados: GradosHabilitados,
  opciones: { nivel?: Nivel } = {},
): ResumenJuego[] {
  const filas = new Map<string, ResumenJuego>()
  for (const p of partidas) {
    const fila = filas.get(p.juego)
    if (!fila) {
      filas.set(p.juego, {
        juego: p.juego,
        nombre: nombreJuego(p.juego),
        gradoHabilitado: gradoEnCasa(p.juego, habilitados, opciones.nivel),
        partidas: { ...conteoVacio(), [p.origen]: 1 },
        total: 1,
        ultimo: { porcentaje: p.porcentaje, fecha: p.created_at },
        mejorPorcentaje: p.porcentaje,
        gradoMaximo: p.grado,
      })
      continue
    }
    fila.partidas[p.origen]++
    fila.total++
    if (momento(p.created_at) > momento(fila.ultimo.fecha)) fila.ultimo = { porcentaje: p.porcentaje, fecha: p.created_at }
    fila.mejorPorcentaje = Math.max(fila.mejorPorcentaje, p.porcentaje)
    if (p.grado > fila.gradoMaximo) fila.gradoMaximo = p.grado
  }
  return [...filas.values()].sort((a, b) => momento(b.ultimo.fecha) - momento(a.ultimo.fecha))
}
