/**
 * Seguimiento de las evaluaciones (S16): la evolución por bloque y la de
 * denominación rápida, para los gráficos de /ninos/[id] y para el informe
 * en PDF (S17). Funciones puras, sin React, sin recharts y sin base de datos.
 *
 * Las franjas se calculan como en S11 (franjaDeBloque), con el grado ACTUAL
 * del niño (gradoParaFranja). Las evaluaciones de un nivel nunca se mezclan
 * con las del otro: cada serie es de un solo nivel.
 */
import { porcentajeBloque } from "@/lib/test/analisis"
import { BLOQUES_POR_NIVEL, BLOQUE_NOMBRES, type BloqueCodigo, type Nivel } from "@/lib/test/bloques"
import {
  CORTES,
  FRANJA_LABEL,
  SIN_FRANJA_LABEL,
  franjaDeBloque,
  type BloqueParaFranja,
  type CorteHasta,
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

/** Una franja pintada de fondo: de `desde` a `hasta` en el eje del gráfico. `hasta` null = hasta arriba. */
export interface Banda {
  franja: Franja
  desde: number
  hasta: number | null
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

/** Los bloques de la grilla de evaluaciones, en el orden del test: todos menos denominación rápida. */
export function bloquesDeLaGrilla(nivel: Nivel): BloqueCodigo[] {
  return BLOQUES_POR_NIVEL[nivel].filter((b) => b !== "denominacion_rapida")
}

/** Porcentaje entero de un corte, con el mismo redondeo que el de los puntos (así un punto nunca cae en la banda equivocada). */
const pct = (aciertos: number, total: number) => porcentajeBloque(aciertos, total)

/**
 * Límites de las tres franjas de un bloque en porcentaje (0 a 100), de abajo
 * hacia arriba: a observar, intermedio y correcto. Se omiten las bandas sin
 * alto (por ejemplo, "correcto" desde 100 %). null si el bloque no tiene
 * referencia, si depende del grado y no se conoce, o si es denominación
 * rápida (ver bandasDenominacion).
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
  const intermedio = pct(limites.intermedioDesde, corte.total)
  const correcto = pct(limites.correctoDesde, corte.total)
  const bandas: Banda[] = [
    { franja: "a_observar", desde: 0, hasta: intermedio },
    { franja: "intermedio", desde: intermedio, hasta: correcto },
    { franja: "correcto", desde: correcto, hasta: 100 },
  ]
  return bandas.filter((b) => b.hasta === null || b.hasta > b.desde)
}

/* ------------------------------------------------------------------ */
/*  Denominación rápida                                                 */
/* ------------------------------------------------------------------ */

export interface PuntoDenominacion {
  fecha: string
  testId: string
  /** Tiempo del bloque en segundos (tiempo_ms / 1000, sin redondear). */
  segundos: number
  errores: number
  /** Franja del bloque (la más baja de tiempo y errores), o null sin corte. */
  franja: Franja | null
  /** Franja de cada medida por separado, para el punto de cada gráfico. null sin corte. */
  franjaTiempo: Franja | null
  franjaErrores: Franja | null
}

function franjaHasta(valor: number, corte: CorteHasta): Franja {
  if (valor <= corte.correctoHasta) return "correcto"
  if (valor <= corte.intermedioHasta) return "intermedio"
  return "a_observar"
}

/** Corte de denominación rápida para el nivel y el grado, o null si no hay (inicial, o grado desconocido). */
function corteDenominacion(nivel: Nivel, grado: GradoFranja | null) {
  const corte = CORTES[nivel].denominacion_rapida
  if (!grado || corte?.tipo !== "tiempo_y_errores") return null
  return { total: corte.total, segundos: corte.segundos[grado], errores: corte.errores }
}

/**
 * Por evaluación del nivel (de la más vieja a la más nueva), el tiempo del
 * bloque en segundos y los errores, con su franja si hay corte (solo en
 * primaria y con el grado conocido). Las evaluaciones sin tiempo o sin
 * errores (anteriores a S9) quedan fuera.
 */
export function serieDenominacion(
  tests: readonly EvaluacionParaSerie[],
  nivel: Nivel,
  grado: GradoFranja | null,
): PuntoDenominacion[] {
  const corte = corteDenominacion(nivel, grado)
  return cronologico(tests.filter((t) => t.nivel === nivel)).flatMap((t) => {
    const b = t.bloques.find((x) => x.bloque_codigo === "denominacion_rapida")
    if (!b || b.tiempo_ms == null || b.errores == null) return []
    // La franja de cada medida solo vale si el bloque tiene franja (mismo total que el corte).
    const franja = franjaDeBloque(nivel, b, grado)
    const conCorte = corte && franja !== null ? corte : null
    return [
      {
        fecha: t.fecha,
        testId: t.id,
        segundos: b.tiempo_ms / 1000,
        errores: b.errores,
        franja,
        // Segundos enteros, con el mismo redondeo que franjaDeBloque.
        franjaTiempo: conCorte ? franjaHasta(Math.round(b.tiempo_ms / 1000), conCorte.segundos) : null,
        franjaErrores: conCorte ? franjaHasta(b.errores, conCorte.errores) : null,
      },
    ]
  })
}

/**
 * Bandas "hasta" de una medida entera (segundos redondeados o errores):
 * correcto hasta `correctoHasta` inclusive, así que el límite que se dibuja
 * está a medio camino (correctoHasta + 0,5). Así un tiempo de 137,4 s, que
 * cuenta como 137, queda dentro de "correcto".
 */
function bandasHasta(corte: CorteHasta): Banda[] {
  return [
    { franja: "correcto", desde: 0, hasta: corte.correctoHasta + 0.5 },
    { franja: "intermedio", desde: corte.correctoHasta + 0.5, hasta: corte.intermedioHasta + 0.5 },
    { franja: "a_observar", desde: corte.intermedioHasta + 0.5, hasta: null },
  ]
}

/**
 * Bandas de corte de denominación rápida: tiempo (segundos) y errores. null
 * si no hay corte: en inicial, o en primaria si no se conoce el grado.
 */
export function bandasDenominacion(nivel: Nivel, grado: GradoFranja | null): { tiempo: Banda[]; errores: Banda[] } | null {
  const corte = corteDenominacion(nivel, grado)
  if (!corte) return null
  return { tiempo: bandasHasta(corte.segundos), errores: bandasHasta(corte.errores) }
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

/** Segundos con un decimal y coma ("131,4 s"); sin decimal si es entero ("130 s"). */
export function textoSegundos(segundos: number): string {
  const redondeado = Math.round(segundos * 10) / 10
  return `${Number.isInteger(redondeado) ? redondeado : redondeado.toFixed(1).replace(".", ",")} s`
}

const errores = (n: number) => (n === 1 ? "1 error" : `${n} errores`)

/**
 * "Tiempo: de 150 s a 130 s en 3 evaluaciones." / "Errores: de 4 a 2 en 3 evaluaciones."
 * La franja va aparte, en resumenFranjaDenominacion.
 */
export function resumenDenominacion(medida: "tiempo" | "errores", puntos: readonly PuntoDenominacion[]): string {
  const etiqueta = medida === "tiempo" ? "Tiempo" : "Errores"
  const valor = (p: PuntoDenominacion) => (medida === "tiempo" ? textoSegundos(p.segundos) : errores(p.errores))
  if (puntos.length === 0) return `${etiqueta}: sin evaluaciones con tiempo registrado.`
  const ultimo = puntos[puntos.length - 1]
  if (puntos.length === 1) return `${etiqueta}: ${valor(ultimo)} en 1 evaluación.`
  return `${etiqueta}: de ${valor(puntos[0])} a ${valor(ultimo)} en ${evaluaciones(puntos.length)}.`
}

/** "Última franja de denominación rápida: intermedio." (o "sin franja de referencia"). */
export function resumenFranjaDenominacion(puntos: readonly PuntoDenominacion[]): string {
  const ultimo = puntos[puntos.length - 1]
  return `Última franja de denominación rápida: ${textoFranja(ultimo?.franja ?? null)}.`
}
