/**
 * Seguimiento de las evaluaciones (S16): la evolución por bloque, incluida
 * denominación rápida, para los gráficos de /ninos/[id] y para el informe en
 * PDF (S17). Funciones puras, sin React, sin recharts y sin base de datos.
 *
 * Las franjas se calculan como en S11 (franjaDeBloque), con el grado ACTUAL
 * del niño (gradoParaFranja). Las evaluaciones de un nivel nunca se mezclan
 * con las del otro: cada serie es de un solo nivel.
 */
import { porcentajeBloque } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, type BloqueCodigo, type Nivel } from "@/lib/test/bloques"
import { formatearTiempo } from "@/lib/test/denominacion"
import {
  CORTES,
  FRANJA_LABEL,
  SIN_FRANJA_LABEL,
  franjaDeBloque,
  type BloqueParaFranja,
  type Franja,
  type GradoFranja,
} from "@/lib/test/franjas"

/** Lo que necesita una evaluación para entrar en una serie (TestConBloques cumple). */
export interface EvaluacionParaSerie {
  id: string
  nivel: Nivel
  fecha: string
  created_at: string
  bloques: readonly BloqueParaFranja[]
}

export interface PuntoBloque {
  correctas: number
  total: number
  /** Porcentaje redondeado a entero, como en el desglose (porcentajeBloque). */
  porcentaje: number
  franja: Franja | null
}

export interface PuntoEvaluacion {
  fecha: string
  testId: string
  /** Solo los bloques que tiene esa evaluación. */
  bloques: Partial<Record<BloqueCodigo, PuntoBloque>>
}

/** Un punto de la serie de un solo bloque. */
export type PuntoDeBloque = PuntoBloque & { fecha: string; testId: string }

/** Una franja pintada de fondo, de `desde` a `hasta` en porcentaje (0 a 100). */
export interface Banda {
  franja: Franja
  desde: number
  hasta: number
}

const momento = (iso: string) => Date.parse(iso) || 0

/** De la más vieja a la más nueva, por `fecha` y, si empatan, por `created_at`. */
function cronologico<T extends { fecha: string; created_at: string }>(tests: readonly T[]): T[] {
  return [...tests].sort(
    (a, b) => momento(a.fecha) - momento(b.fecha) || momento(a.created_at) - momento(b.created_at),
  )
}

/** Los niveles que tienen al menos una evaluación, en el orden inicial → primario. */
export function nivelesConEvaluaciones(tests: readonly Pick<EvaluacionParaSerie, "nivel">[]): Nivel[] {
  return (["inicial", "primario"] as const).filter((n) => tests.some((t) => t.nivel === n))
}

/**
 * Nivel que se muestra al abrir el seguimiento: el actual del niño si tiene
 * evaluaciones de ese nivel; si no, el otro que tenga; si no tiene ninguna,
 * el actual.
 */
export function nivelInicialSeguimiento(
  tests: readonly Pick<EvaluacionParaSerie, "nivel">[],
  nivelActual: Nivel,
): Nivel {
  const niveles = nivelesConEvaluaciones(tests)
  return niveles.includes(nivelActual) ? nivelActual : (niveles[0] ?? nivelActual)
}

/**
 * Las evaluaciones del nivel, de la más vieja a la más nueva, con cada
 * bloque como punto (correctas, total, porcentaje y franja). Las de otro
 * nivel no entran.
 */
export function serieEvaluaciones(
  tests: readonly EvaluacionParaSerie[],
  nivel: Nivel,
  grado: GradoFranja | null,
): PuntoEvaluacion[] {
  return cronologico(tests.filter((t) => t.nivel === nivel)).map((t) => {
    const bloques: PuntoEvaluacion["bloques"] = {}
    for (const b of t.bloques) {
      bloques[b.bloque_codigo] = {
        correctas: b.correctas,
        total: b.total,
        porcentaje: porcentajeBloque(b.correctas, b.total),
        franja: franjaDeBloque(nivel, b, grado),
      }
    }
    return { fecha: t.fecha, testId: t.id, bloques }
  })
}

/** Los puntos de un bloque (las evaluaciones que no lo tienen quedan afuera). */
export function serieDeBloque(serie: readonly PuntoEvaluacion[], bloque: BloqueCodigo): PuntoDeBloque[] {
  return serie.flatMap((p) => {
    const punto = p.bloques[bloque]
    return punto ? [{ ...punto, fecha: p.fecha, testId: p.testId }] : []
  })
}

/**
 * Borde entre dos franjas en porcentaje: los aciertos posibles son enteros
 * (k / total), así que el borde va a mitad de camino entre el último valor
 * de la franja de abajo (desde − 1) y el primero de la de arriba (desde).
 * Nunca baja de 0 %.
 */
const borde = (desde: number, total: number) => Math.max(0, ((desde - 0.5) / total) * 100)

/**
 * Las tres franjas de un bloque en porcentaje, de abajo hacia arriba: a
 * observar, intermedio y correcto, con los bordes a mitad de camino entre
 * valores posibles. Así se ven siempre las tres, aunque "correcto" empiece
 * en 100 % (2 de 2), y cada punto cae dentro del color de su franja. Solo se
 * omite una banda sin alto (si el corte empieza en 0 aciertos). null si el
 * bloque no tiene referencia, si depende del grado y no se conoce, o si es
 * denominación rápida (se mide por tiempo y errores: sus gráficos van sin
 * bandas).
 */
export function bandasDeFranja(nivel: Nivel, bloque: BloqueCodigo, grado: GradoFranja | null): Banda[] | null {
  const corte = CORTES[nivel][bloque]
  if (!corte) return null
  let limites: { correctoDesde: number; intermedioDesde: number }
  switch (corte.tipo) {
    case "aciertos":
      limites = corte
      break
    case "aciertos_por_grado":
      if (!grado) return null
      limites = corte.porGrado[grado]
      break
    default:
      // sin_referencia y tiempo_y_errores (denominación rápida).
      return null
  }
  const intermedio = borde(limites.intermedioDesde, corte.total)
  const correcto = borde(limites.correctoDesde, corte.total)
  const bandas: Banda[] = [
    { franja: "a_observar", desde: 0, hasta: intermedio },
    { franja: "intermedio", desde: intermedio, hasta: correcto },
    { franja: "correcto", desde: correcto, hasta: 100 },
  ]
  return bandas.filter((b) => b.hasta > b.desde)
}

/** La banda que contiene un porcentaje (el borde pertenece a la de arriba), o null sin bandas. */
export function bandaDe(bandas: readonly Banda[] | null, porcentaje: number): Banda | null {
  return bandas?.find((b) => porcentaje >= b.desde && (porcentaje < b.hasta || b.hasta === 100)) ?? null
}

/* ------------------------------------------------------------------ */
/*  Denominación rápida                                                 */
/* ------------------------------------------------------------------ */

export interface PuntoDenominacion {
  fecha: string
  testId: string
  /** Tiempo del bloque en milisegundos (para mostrarlo en m:ss con formatearTiempo). */
  tiempoMs: number
  /** Tiempo del bloque en segundos (tiempo_ms / 1000, sin redondear): el eje del gráfico. */
  segundos: number
  errores: number
  total: number
  /** (total − errores) / total, en porcentaje entero (porcentajeBloque). */
  aciertosPorcentaje: number
  /** Franja del bloque (la más baja de tiempo y errores), o null sin corte. */
  franja: Franja | null
}

/**
 * Por evaluación del nivel (de la más vieja a la más nueva), el tiempo del
 * bloque, los errores y el porcentaje de aciertos, con la franja del bloque
 * (solo en primaria y con el grado conocido). Las evaluaciones sin tiempo o
 * sin errores (anteriores a S9) quedan fuera.
 */
export function serieDenominacion(
  tests: readonly EvaluacionParaSerie[],
  nivel: Nivel,
  grado: GradoFranja | null,
): PuntoDenominacion[] {
  return cronologico(tests.filter((t) => t.nivel === nivel)).flatMap((t) => {
    const b = t.bloques.find((x) => x.bloque_codigo === "denominacion_rapida")
    if (!b || b.tiempo_ms == null || b.errores == null) return []
    return [
      {
        fecha: t.fecha,
        testId: t.id,
        tiempoMs: b.tiempo_ms,
        segundos: b.tiempo_ms / 1000,
        errores: b.errores,
        total: b.total,
        aciertosPorcentaje: porcentajeBloque(b.total - b.errores, b.total),
        franja: franjaDeBloque(nivel, b, grado),
      },
    ]
  })
}

/* ------------------------------------------------------------------ */
/*  Resúmenes en texto (lector de pantalla y PDF)                       */
/* ------------------------------------------------------------------ */

/** "correcto", "intermedio", "a observar" o "sin franja de referencia". */
export function textoFranja(franja: Franja | null): string {
  return (franja ? FRANJA_LABEL[franja] : SIN_FRANJA_LABEL).toLowerCase()
}

const evaluaciones = (n: number) => (n === 1 ? "1 evaluación" : `${n} evaluaciones`)

/**
 * "Conciencia Silábica: de 50 % a 83 % en 3 evaluaciones; última franja: correcto."
 * Con una sola: "Conciencia Silábica: 50 % en 1 evaluación; franja: intermedio."
 */
export function resumenBloque(bloque: BloqueCodigo, puntos: readonly PuntoDeBloque[]): string {
  const nombre = BLOQUE_NOMBRES[bloque]
  if (puntos.length === 0) return `${nombre}: sin evaluaciones.`
  const ultimo = puntos[puntos.length - 1]
  if (puntos.length === 1) {
    return `${nombre}: ${ultimo.porcentaje} % en 1 evaluación; franja: ${textoFranja(ultimo.franja)}.`
  }
  return `${nombre}: de ${puntos[0].porcentaje} % a ${ultimo.porcentaje} % en ${evaluaciones(puntos.length)}; última franja: ${textoFranja(ultimo.franja)}.`
}

/**
 * "Denominación Rápida: tiempo de 2:31 a 2:05 y aciertos de 92 % a 98 % en 3
 * evaluaciones; última franja: correcto." El tiempo va en m:ss (formatearTiempo).
 */
export function resumenDenominacion(puntos: readonly PuntoDenominacion[]): string {
  const nombre = BLOQUE_NOMBRES.denominacion_rapida
  if (puntos.length === 0) return `${nombre}: sin tiempo registrado en estas evaluaciones.`
  const primero = puntos[0]
  const ultimo = puntos[puntos.length - 1]
  if (puntos.length === 1) {
    return `${nombre}: tiempo ${formatearTiempo(ultimo.tiempoMs)} y aciertos ${ultimo.aciertosPorcentaje} % en 1 evaluación; franja: ${textoFranja(ultimo.franja)}.`
  }
  return `${nombre}: tiempo de ${formatearTiempo(primero.tiempoMs)} a ${formatearTiempo(ultimo.tiempoMs)} y aciertos de ${primero.aciertosPorcentaje} % a ${ultimo.aciertosPorcentaje} % en ${evaluaciones(puntos.length)}; última franja: ${textoFranja(ultimo.franja)}.`
}
