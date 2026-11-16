/**
 * Análisis de los resultados por bloque de un test. Funciones puras (sin
 * acceso a la base): las usan la pantalla final del test, el detalle del
 * niño y el detalle de un test.
 *
 * Siempre se compara por porcentaje de acierto (correctas / total), nunca
 * por cantidad de correctas: cada bloque tiene una cantidad distinta de
 * ejercicios. La comparación es exacta (productos cruzados), sin redondear,
 * para que 2/3 y 67/100 no cuenten como empate.
 *
 * Denominación rápida se mide por tiempo y errores, no por porcentaje: queda
 * fuera del porcentaje general, de "X de Y respuestas correctas", de los
 * bloques con más errores y de la recomendación. Se excluye por código de
 * bloque (no por tener tiempo), así vale igual para las evaluaciones
 * anteriores a S9. En la base se siguen guardando sus correctas y total.
 */
import type { BloqueCodigo } from "@/lib/test/bloques"

export interface BloqueResultado {
  bloque_codigo: BloqueCodigo
  /** Posición del bloque en el test (1-based). */
  orden: number
  correctas: number
  total: number
}

/** El bloque se mide por porcentaje de acierto (todos menos denominación rápida). */
export function esBloquePorcentual(b: Pick<BloqueResultado, "bloque_codigo">): boolean {
  return b.bloque_codigo !== "denominacion_rapida"
}

/** Solo los bloques que se miden por porcentaje, en el mismo orden. */
export function bloquesPorcentuales<T extends Pick<BloqueResultado, "bloque_codigo">>(bloques: readonly T[]): T[] {
  return bloques.filter(esBloquePorcentual)
}

/**
 * Correctas, total y porcentaje general de una evaluación, sumando solo los
 * bloques porcentuales. Es lo que se guarda como puntaje_total y
 * porcentaje_total, y el "X de Y respuestas correctas" de los resultados.
 */
export function resumenPorcentual(bloques: readonly BloqueResultado[]): {
  correctas: number
  total: number
  porcentaje: number
} {
  const lista = bloquesPorcentuales(bloques)
  const correctas = lista.reduce((acc, b) => acc + b.correctas, 0)
  const total = lista.reduce((acc, b) => acc + b.total, 0)
  return { correctas, total, porcentaje: porcentajeBloque(correctas, total) }
}

/** Porcentaje de acierto redondeado a entero (0 si el bloque no tiene ejercicios). */
export function porcentajeBloque(correctas: number, total: number): number {
  return total > 0 ? Math.round((correctas / total) * 100) : 0
}

/** <0 si `a` tiene menor acierto que `b`, 0 si es igual, >0 si es mayor. */
function compararAcierto(a: BloqueResultado, b: BloqueResultado): number {
  return a.correctas * b.total - b.correctas * a.total
}

/** Bloques evaluables: los porcentuales que tienen al menos un ejercicio. */
const evaluables = <T extends BloqueResultado>(bloques: T[]) => bloquesPorcentuales(bloques).filter((b) => b.total > 0)

/**
 * Bloques con el MENOR porcentaje de acierto (todos los empatados), en el
 * orden del test. Lista vacía si todos tienen 100 % (o si no hay bloques).
 * Sin denominación rápida.
 */
export function bloquesMasDebiles<T extends BloqueResultado>(bloques: T[]): T[] {
  const lista = evaluables(bloques)
  if (lista.length === 0 || lista.every((b) => b.correctas >= b.total)) return []
  const minimo = lista.reduce((min, b) => (compararAcierto(b, min) < 0 ? b : min))
  return lista.filter((b) => compararAcierto(b, minimo) === 0).sort((a, b) => a.orden - b.orden)
}

/**
 * Todos los bloques de menor a mayor porcentaje de acierto (primero lo que
 * más necesita práctica); los empates, por orden en el test. Sin
 * denominación rápida.
 */
export function ordenRecomendacion<T extends BloqueResultado>(bloques: T[]): T[] {
  return [...evaluables(bloques)].sort((a, b) => compararAcierto(a, b) || a.orden - b.orden)
}
