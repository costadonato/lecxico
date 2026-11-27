/**
 * Período del informe en PDF (S17a): "Último mes", "Últimos 3 meses",
 * "Todo" o "Elegir fechas". Lógica pura, sin React ni base de datos.
 *
 * Todo se cuenta en días de calendario de Argentina (UTC−3 todo el año, sin
 * horario de verano desde 2009), como las semanas del seguimiento (S16): una
 * partida de las 23:30 del 31/10 en Buenos Aires es del 31/10, aunque en UTC
 * ya sea 1/11. Las fechas a elección incluyen el día "hasta" completo.
 */

export type PeriodoInforme = "ultimo_mes" | "ultimos_3_meses" | "todo" | "elegir"

export const PERIODOS_INFORME: readonly { valor: PeriodoInforme; texto: string }[] = [
  { valor: "ultimo_mes", texto: "Último mes" },
  { valor: "ultimos_3_meses", texto: "Últimos 3 meses" },
  { valor: "todo", texto: "Todo" },
  { valor: "elegir", texto: "Elegir fechas" },
]

/** Un rango de días "aaaa-mm-dd" (hora de Argentina), los dos extremos incluidos. */
export interface RangoInforme {
  /** Primer día incluido, o null sin límite ("Todo"). */
  desde: string | null
  /** Último día incluido (completo), o null sin límite ("Todo"). */
  hasta: string | null
}

const HORA = 60 * 60 * 1000
/** Argentina: UTC−3, sin horario de verano. */
const DESFASE_ARGENTINA = -3 * HORA

const dos = (n: number) => String(n).padStart(2, "0")
const DIA_RE = /^(\d{4})-(\d{2})-(\d{2})$/

/** "aaaa-mm-dd" del día de calendario de `fecha` en Argentina, o null si no es una fecha. */
export function diaArgentina(fecha: Date | string): string | null {
  if (typeof fecha === "string" && DIA_RE.test(fecha)) return esDiaValido(fecha) ? fecha : null
  const ms = new Date(fecha).getTime()
  if (Number.isNaN(ms)) return null
  const d = new Date(ms + DESFASE_ARGENTINA)
  return `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`
}

/** true si es "aaaa-mm-dd" y el día existe (rechaza 2026-02-30). */
export function esDiaValido(dia: string): boolean {
  const m = DIA_RE.exec(dia)
  if (!m) return false
  const [anio, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const fecha = new Date(Date.UTC(anio, mes - 1, d))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === d
}

/**
 * El mismo día `meses` meses antes; si ese mes es más corto, el último día
 * del mes (31/05 menos 3 meses = 28/02 o 29/02).
 */
function restarMeses(dia: string, meses: number): string {
  const [anio, mes, d] = dia.split("-").map(Number)
  const total = anio * 12 + (mes - 1) - meses
  const anioNuevo = Math.floor(total / 12)
  const mesNuevo = total % 12
  const ultimoDia = new Date(Date.UTC(anioNuevo, mesNuevo + 1, 0)).getUTCDate()
  return `${anioNuevo}-${dos(mesNuevo + 1)}-${dos(Math.min(d, ultimoDia))}`
}

/**
 * Rango de días del período, con `hoy` en hora de Argentina:
 * - "Último mes": del mismo día del mes anterior a hoy;
 * - "Últimos 3 meses": del mismo día de tres meses atrás a hoy;
 * - "Todo": sin límites;
 * - "Elegir fechas": de `desde` a `hasta`, con los dos días completos.
 *   null si alguna fecha no es válida o si `desde` es posterior a `hasta`.
 */
export function rangoDelPeriodo(
  periodo: PeriodoInforme,
  hoy: Date,
  elegidas: { desde: string; hasta: string } = { desde: "", hasta: "" },
): RangoInforme | null {
  const diaHoy = diaArgentina(hoy)
  if (!diaHoy) return null
  switch (periodo) {
    case "ultimo_mes":
      return { desde: restarMeses(diaHoy, 1), hasta: diaHoy }
    case "ultimos_3_meses":
      return { desde: restarMeses(diaHoy, 3), hasta: diaHoy }
    case "todo":
      return { desde: null, hasta: null }
    case "elegir":
      if (!esDiaValido(elegidas.desde) || !esDiaValido(elegidas.hasta)) return null
      if (elegidas.desde > elegidas.hasta) return null
      return { desde: elegidas.desde, hasta: elegidas.hasta }
  }
}

/** true si `fecha` (ISO o "aaaa-mm-dd") cae en un día del rango, en hora de Argentina. */
export function enRango(fecha: string, rango: RangoInforme): boolean {
  const dia = diaArgentina(fecha)
  if (!dia) return false
  if (rango.desde && dia < rango.desde) return false
  if (rango.hasta && dia > rango.hasta) return false
  return true
}

/** "dd/mm/aaaa" de un día "aaaa-mm-dd". */
export function formatearDia(dia: string): string {
  const [anio, mes, d] = dia.split("-")
  return `${d}/${mes}/${anio}`
}

/** Mediodía de Argentina de un día "aaaa-mm-dd", como instante (para partidasPorSemana). */
export function instanteDelDia(dia: string): Date {
  return new Date(`${dia}T12:00:00-03:00`)
}

