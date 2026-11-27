/**
 * Franjas orientativas de cada bloque de una evaluación (S11) y la
 * recomendación que sale de ellas. Funciones puras, sin acceso a la base:
 * las franjas no se guardan, se calculan al mostrar.
 *
 * Cada bloque cae en "correcto", "intermedio" o "a observar" según dos
 * valores de corte por bloque y nivel. Si no hay referencia (o no se puede
 * aplicar), el bloque queda SIN franja (null): se muestran sus datos y queda
 * fuera de la recomendación. No hay una cuarta franja.
 *
 * La recomendación señala los bloques en "intermedio" y "a observar" en el
 * orden del test, sin compararlos entre sí ni reordenarlos por gravedad.
 */
import type { BloqueResultado } from "@/lib/test/analisis"
import {
  BLOQUE_NOMBRES,
  ETAPAS_ESCOLARES,
  nivelParaEtapa,
  type BloqueCodigo,
  type EtapaEscolar,
  type Nivel,
} from "@/lib/test/bloques"

export type Franja = "correcto" | "intermedio" | "a_observar"

/** Grado del primario para los bloques cuyo corte depende del grado. */
export type GradoFranja = "primero" | "segundo" | "tercero"

const GRADOS: readonly GradoFranja[] = ["primero", "segundo", "tercero"]

/** Corte por aciertos: correcto desde `correctoDesde`, intermedio desde `intermedioDesde`, a observar debajo. */
export interface CortePorAciertos {
  correctoDesde: number
  intermedioDesde: number
}

/** Corte "hasta" (tiempo o errores): correcto hasta `correctoHasta`, intermedio hasta `intermedioHasta`, a observar arriba. */
export interface CorteHasta {
  correctoHasta: number
  intermedioHasta: number
}

export type Corte =
  /** Sin valores de la bibliografía para comparar: siempre sin franja. */
  | { tipo: "sin_referencia" }
  /** Aciertos sobre `total` ítems, iguales para todos los grados. */
  | ({ tipo: "aciertos"; total: number } & CortePorAciertos)
  /** Aciertos sobre `total` ítems, con un corte por grado del primario. */
  | { tipo: "aciertos_por_grado"; total: number; porGrado: Record<GradoFranja, CortePorAciertos> }
  /**
   * Denominación rápida del primario: tiempo del bloque en segundos enteros
   * (por grado) y errores; el bloque toma la franja más baja de las dos.
   */
  | { tipo: "tiempo_y_errores"; total: number; segundos: Record<GradoFranja, CorteHasta>; errores: CorteHasta }

/*
 * Valores de corte provisorios fijados por revisión bibliográfica
 * (23/11/2026); fundamentación en docs/valores-de-corte.md. No son normas
 * poblacionales.
 *
 * Cada corte guarda el total de ítems para el que vale: si el bloque de una
 * evaluación tiene otro total (por ejemplo, una evaluación vieja), queda sin
 * franja. Un bloque que no figura acá también queda sin franja.
 */
export const CORTES: Record<Nivel, Partial<Record<BloqueCodigo, Corte>>> = {
  inicial: {
    discriminacion_auditiva: { tipo: "aciertos", total: 6, correctoDesde: 4, intermedioDesde: 3 },
    conciencia_fonologica: { tipo: "aciertos", total: 3, correctoDesde: 2, intermedioDesde: 1 },
    conciencia_silabica: { tipo: "aciertos", total: 7, correctoDesde: 4, intermedioDesde: 3 },
    memoria_fonologica: { tipo: "aciertos", total: 4, correctoDesde: 3, intermedioDesde: 2 },
    denominacion_rapida: { tipo: "sin_referencia" },
  },
  primario: {
    discriminacion_auditiva: { tipo: "aciertos", total: 5, correctoDesde: 4, intermedioDesde: 3 },
    conciencia_fonologica: { tipo: "aciertos", total: 7, correctoDesde: 5, intermedioDesde: 4 },
    conciencia_silabica: { tipo: "aciertos", total: 6, correctoDesde: 4, intermedioDesde: 3 },
    memoria_fonologica: { tipo: "aciertos", total: 6, correctoDesde: 5, intermedioDesde: 4 },
    comprension_lectora: { tipo: "aciertos", total: 3, correctoDesde: 3, intermedioDesde: 2 },
    correspondencia_sonido_letra: {
      tipo: "aciertos_por_grado",
      total: 6,
      porGrado: {
        // 1.º tiene su propio corte por las letras espejo (b/d, p/q).
        primero: { correctoDesde: 5, intermedioDesde: 4 },
        segundo: { correctoDesde: 6, intermedioDesde: 5 },
        tercero: { correctoDesde: 6, intermedioDesde: 5 },
      },
    },
    reconocimiento_visual: { tipo: "aciertos", total: 2, correctoDesde: 2, intermedioDesde: 1 },
    lectura_pseudopalabras: { tipo: "aciertos", total: 7, correctoDesde: 5, intermedioDesde: 4 },
    denominacion_rapida: {
      tipo: "tiempo_y_errores",
      total: 100, // 2 cuadrículas de 50 estímulos
      segundos: {
        primero: { correctoHasta: 137, intermedioHasta: 146 }, // 2:17
        segundo: { correctoHasta: 121, intermedioHasta: 131 }, // 2:01
        tercero: { correctoHasta: 101, intermedioHasta: 109 }, // 1:41
      },
      errores: { correctoHasta: 1, intermedioHasta: 2 },
    },
  },
}

/** Textos visibles de cada franja. */
export const FRANJA_LABEL: Record<Franja, string> = {
  correcto: "Correcto",
  intermedio: "Intermedio",
  a_observar: "A observar",
}

export const SIN_FRANJA_LABEL = "Sin franja de referencia"

/** Qué son las franjas (desglose, "Franjas y recomendación" e informe en PDF). */
export const TEXTO_QUE_SON_FRANJAS =
  "Las franjas comparan cada bloque con valores de referencia de la bibliografía. Son orientativas y no son normas de población."

/** Qué significa "sin franja de referencia" (va después de SIN_FRANJA_LABEL y dos puntos). */
export const TEXTO_SIN_FRANJA =
  "no hay valores de la bibliografía para comparar este resultado. Su interpretación queda a cargo del profesional."

/** Lo que necesita un bloque para calcular su franja. */
export type BloqueParaFranja = Pick<BloqueResultado, "bloque_codigo" | "orden" | "correctas" | "total"> & {
  tiempo_ms?: number | null
  errores?: number | null
}

export type ConFranja<T> = T & { franja: Franja | null }

/**
 * Grado que se usa para los bloques que dependen del grado. La tabla `test`
 * no guarda la etapa: se usa la etapa escolar ACTUAL del niño, y solo en una
 * evaluación de primario. En cualquier otro caso, null (grado desconocido).
 */
export function gradoParaFranja(nivel: Nivel, etapa: EtapaEscolar | null | undefined): GradoFranja | null {
  if (nivel !== "primario") return null
  return GRADOS.find((g) => g === etapa) ?? null
}

/** true si el corte del bloque depende del grado (correspondencia sonido-letra y denominación rápida del primario). */
export function dependeDelGrado(nivel: Nivel, codigo: BloqueCodigo): boolean {
  const tipo = CORTES[nivel][codigo]?.tipo
  return tipo === "aciertos_por_grado" || tipo === "tiempo_y_errores"
}

function franjaPorAciertos(correctas: number, corte: CortePorAciertos): Franja {
  if (correctas >= corte.correctoDesde) return "correcto"
  if (correctas >= corte.intermedioDesde) return "intermedio"
  return "a_observar"
}

function franjaHasta(valor: number, corte: CorteHasta): Franja {
  if (valor <= corte.correctoHasta) return "correcto"
  if (valor <= corte.intermedioHasta) return "intermedio"
  return "a_observar"
}

const GRAVEDAD: Record<Franja, number> = { correcto: 0, intermedio: 1, a_observar: 2 }

/** La franja más baja de las dos (un valor peor nunca sube la franja). */
function masBaja(a: Franja, b: Franja): Franja {
  return GRAVEDAD[a] >= GRAVEDAD[b] ? a : b
}

/**
 * Franja de un bloque, o null si queda "sin franja de referencia": bloque
 * sin corte o marcado sin referencia, sin ejercicios, con un total distinto
 * al del corte, que depende del grado y el grado es desconocido, o
 * denominación rápida sin tiempo o sin errores (evaluaciones anteriores a S9).
 */
export function franjaDeBloque(nivel: Nivel, bloque: BloqueParaFranja, grado: GradoFranja | null): Franja | null {
  const corte = CORTES[nivel][bloque.bloque_codigo]
  if (!corte || corte.tipo === "sin_referencia") return null
  if (bloque.total <= 0 || bloque.total !== corte.total) return null

  switch (corte.tipo) {
    case "aciertos":
      return franjaPorAciertos(bloque.correctas, corte)
    case "aciertos_por_grado":
      return grado ? franjaPorAciertos(bloque.correctas, corte.porGrado[grado]) : null
    case "tiempo_y_errores": {
      if (!grado || bloque.tiempo_ms == null || bloque.errores == null) return null
      // Segundos enteros del bloque, con el mismo redondeo que formatearTiempo.
      const segundos = Math.round(bloque.tiempo_ms / 1000)
      return masBaja(franjaHasta(segundos, corte.segundos[grado]), franjaHasta(bloque.errores, corte.errores))
    }
  }
}

/** Todos los bloques de una evaluación en el orden del test, cada uno con su franja (o null). */
export function franjasDeEvaluacion<T extends BloqueParaFranja>(
  nivel: Nivel,
  bloques: readonly T[],
  grado: GradoFranja | null,
): ConFranja<T>[] {
  return [...bloques].sort((a, b) => a.orden - b.orden).map((b) => ({ ...b, franja: franjaDeBloque(nivel, b, grado) }))
}

/**
 * Recomendación de una evaluación: los bloques en "intermedio" y "a
 * observar", en el orden del test (sin reordenar por gravedad), y aparte los
 * que quedaron sin franja, que nunca entran. Si todos los que tienen franja
 * están en "correcto", `recomendados` queda vacía.
 */
export function recomendacion<T extends BloqueParaFranja>(
  nivel: Nivel,
  bloques: readonly T[],
  grado: GradoFranja | null,
): { recomendados: (T & { franja: Franja })[]; sinFranja: T[] } {
  const conFranja = franjasDeEvaluacion(nivel, bloques, grado)
  return {
    recomendados: conFranja.filter(
      (b): b is ConFranja<T> & { franja: Franja } => b.franja === "intermedio" || b.franja === "a_observar",
    ),
    sinFranja: conFranja.filter((b) => b.franja === null),
  }
}

/** Momento de una fecha ISO (o de "aaaa-mm-dd") para comparar; lo ilegible va al principio. */
const momento = (iso: string) => Date.parse(iso) || 0

/**
 * La evaluación más reciente por `fecha` y, si empatan, por `created_at`.
 * null si no hay ninguna. No depende del orden de la lista.
 */
export function ultimaEvaluacion<T extends { fecha: string; created_at: string }>(tests: readonly T[]): T | null {
  let ultima: T | null = null
  for (const t of tests) {
    if (
      !ultima ||
      momento(t.fecha) > momento(ultima.fecha) ||
      (momento(t.fecha) === momento(ultima.fecha) && momento(t.created_at) > momento(ultima.created_at))
    ) {
      ultima = t
    }
  }
  return ultima
}

/** Franja de cada bloque de una evaluación, para agrupar los juegos (juegosPorFranja). */
export type FranjasPorBloque = Partial<Record<BloqueCodigo, Franja | null>>

export type DisponibilidadRecomendacion<T> =
  | { estado: "sin_evaluaciones" }
  /** La última evaluación es de otro nivel que el que el niño tiene hoy. */
  | { estado: "otro_nivel"; nivelEvaluacion: Nivel; nivelNino: Nivel }
  | { estado: "disponible"; test: T; grado: GradoFranja | null; franjas: FranjasPorBloque }

/**
 * Si se puede mostrar la recomendación de un niño junto a los juegos de su
 * nivel actual (Entrenar en consulta, S11b; tareas, S15): hace falta una
 * evaluación y que la última sea del nivel que el niño tiene hoy
 * (nivelParaEtapa), porque los juegos que se muestran son los de ese nivel.
 */
export function recomendacionParaNino<
  T extends { fecha: string; created_at: string; nivel: Nivel; bloques: readonly BloqueParaFranja[] },
>(tests: readonly T[], etapa: EtapaEscolar): DisponibilidadRecomendacion<T> {
  const test = ultimaEvaluacion(tests)
  if (!test) return { estado: "sin_evaluaciones" }
  const nivelNino = nivelParaEtapa(etapa)
  if (test.nivel !== nivelNino) return { estado: "otro_nivel", nivelEvaluacion: test.nivel, nivelNino }
  const grado = gradoParaFranja(test.nivel, etapa)
  const franjas: FranjasPorBloque = Object.fromEntries(
    franjasDeEvaluacion(test.nivel, test.bloques, grado).map((b) => [b.bloque_codigo, b.franja]),
  )
  return { estado: "disponible", test, grado, franjas }
}

/**
 * "La franja de correspondencia sonido-letra y la de denominación rápida usan
 * el grado actual del niño (2do grado)." para los bloques que dependen del
 * grado y tienen franja; null si no hay ninguno o el grado es desconocido.
 */
export function textoGradoFranjas(
  nivel: Nivel,
  bloques: readonly { bloque_codigo: BloqueCodigo; franja: Franja | null }[],
  grado: GradoFranja | null,
): string | null {
  const etiquetaGrado = ETAPAS_ESCOLARES.find((e) => e.valor === grado)?.label
  const codigos = bloques.filter((b) => b.franja !== null && dependeDelGrado(nivel, b.bloque_codigo)).map((b) => b.bloque_codigo)
  if (codigos.length === 0 || !etiquetaGrado) return null
  const nombres = codigos.map((c) => BLOQUE_NOMBRES[c].toLowerCase())
  const sujeto =
    nombres.length === 1
      ? `La franja de ${nombres[0]} usa`
      : `La franja de ${nombres.slice(0, -1).join(", ")} y la de ${nombres.at(-1)} usan`
  return `${sujeto} el grado actual del niño (${etiquetaGrado}).`
}
