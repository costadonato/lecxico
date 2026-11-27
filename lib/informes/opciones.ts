/**
 * Opciones del informe en PDF del profesional (S17a): qué contenido va,
 * qué evaluación, qué período y secciones del seguimiento, si entra lo de
 * otros profesionales y las observaciones. Lógica pura, sin React ni base
 * de datos. El diálogo (components/informes/dialogo-informe.tsx) las edita y
 * construirInforme (modelo.ts) las aplica.
 */
import { ultimaEvaluacion } from "@/lib/test/franjas"
import { esDiaValido, type PeriodoInforme } from "@/lib/informes/periodo"

export type SeccionSeguimientoInforme = "evolucion" | "denominacion" | "entrenamiento" | "tareas" | "practica"

/** Secciones del seguimiento, en el orden en que salen impresas. */
export const SECCIONES_SEGUIMIENTO: readonly { valor: SeccionSeguimientoInforme; texto: string }[] = [
  { valor: "evolucion", texto: "Evolución de las evaluaciones" },
  { valor: "denominacion", texto: "Denominación rápida" },
  { valor: "entrenamiento", texto: "Entrenamiento por juego" },
  { valor: "tareas", texto: "Tareas" },
  { valor: "practica", texto: "Práctica en casa" },
]

export const MAX_OBSERVACIONES = 2000

export interface OpcionesInforme {
  /** Contenido: la evaluación elegida, el seguimiento o los dos. */
  evaluacion: boolean
  seguimiento: boolean
  /** La evaluación que sale en "Evaluación" (null si no hay ninguna). */
  testId: string | null
  /** Bloques en "intermedio" y "a observar" con sus juegos. */
  incluirRecomendacion: boolean
  periodo: PeriodoInforme
  /** "aaaa-mm-dd", solo con periodo "elegir". */
  desde: string
  hasta: string
  secciones: Record<SeccionSeguimientoInforme, boolean>
  /**
   * Lo registrado por otros profesionales (evaluaciones, partidas de
   * consulta y de tarea, tareas). Solo se puede desmarcar si el tutor
   * compartió el historial; la práctica en casa siempre entra.
   */
  incluirOtrosProfesionales: boolean
  /** Texto libre que sale impreso al final. No se guarda en ningún lado. */
  observaciones: string
}

/** Lo que necesitan las opciones de cada evaluación visible. */
export interface EvaluacionElegible {
  id: string
  fecha: string
  created_at: string
  profesional_id: string | null
}

/**
 * Las opciones al abrir el diálogo: los dos contenidos (si hay evaluaciones;
 * si no, solo el seguimiento), la última evaluación o la que se pidió desde
 * su detalle, recomendación, últimos 3 meses, todas las secciones y lo de
 * otros profesionales.
 */
export function opcionesPorDefecto(
  detalle: { tests: readonly EvaluacionElegible[] },
  testId?: string | null,
): OpcionesInforme {
  const pedida = testId ? detalle.tests.find((t) => t.id === testId) : undefined
  const elegida = pedida ?? ultimaEvaluacion(detalle.tests)
  return {
    evaluacion: elegida !== null,
    seguimiento: true,
    testId: elegida?.id ?? null,
    incluirRecomendacion: true,
    periodo: "ultimos_3_meses",
    desde: "",
    hasta: "",
    secciones: { evolucion: true, denominacion: true, entrenamiento: true, tareas: true, practica: true },
    incluirOtrosProfesionales: true,
    observaciones: "",
  }
}

/**
 * true si un registro entra según la autoría: los del usuario siempre; los
 * de otros (y los de un profesional que borró su cuenta, autor null), solo
 * con "Incluir lo registrado por otros profesionales".
 */
export function autoriaIncluida(autor: string | null, usuarioId: string, incluirOtros: boolean): boolean {
  return incluirOtros || autor === usuarioId
}

/** Las evaluaciones que se pueden elegir con la autoría actual, de la más reciente a la más vieja. */
export function evaluacionesElegibles<T extends EvaluacionElegible>(
  tests: readonly T[],
  usuarioId: string,
  incluirOtros: boolean,
): T[] {
  const momento = (iso: string) => Date.parse(iso) || 0
  return tests
    .filter((t) => autoriaIncluida(t.profesional_id, usuarioId, incluirOtros))
    .sort((a, b) => momento(b.fecha) - momento(a.fecha) || momento(b.created_at) - momento(a.created_at))
}

export type CampoOpciones = "contenido" | "evaluacion" | "periodo" | "secciones" | "observaciones"

export interface ProblemaOpciones {
  campo: CampoOpciones
  mensaje: string
}

/**
 * Lo que impide generar el informe, con un mensaje corto por campo. Lista
 * vacía = se puede generar. `tests` son las evaluaciones visibles y
 * `usuarioId`, el profesional actual (para la autoría de la evaluación).
 */
export function validarOpciones(
  o: OpcionesInforme,
  contexto: { tests: readonly EvaluacionElegible[]; usuarioId: string },
): ProblemaOpciones[] {
  const problemas: ProblemaOpciones[] = []
  if (!o.evaluacion && !o.seguimiento) {
    problemas.push({ campo: "contenido", mensaje: "Elegí al menos un contenido: evaluación o seguimiento." })
  }
  if (o.evaluacion) {
    const elegibles = evaluacionesElegibles(contexto.tests, contexto.usuarioId, o.incluirOtrosProfesionales)
    if (elegibles.length === 0) {
      problemas.push({ campo: "evaluacion", mensaje: "No hay evaluaciones para incluir." })
    } else if (!elegibles.some((t) => t.id === o.testId)) {
      problemas.push({ campo: "evaluacion", mensaje: "Elegí una evaluación." })
    }
  }
  if (o.seguimiento) {
    if (o.periodo === "elegir") {
      if (!esDiaValido(o.desde) || !esDiaValido(o.hasta)) {
        problemas.push({ campo: "periodo", mensaje: "Completá las dos fechas del período." })
      } else if (o.desde > o.hasta) {
        problemas.push({ campo: "periodo", mensaje: "La fecha «desde» tiene que ser anterior o igual a «hasta»." })
      }
    }
    if (!Object.values(o.secciones).some(Boolean)) {
      problemas.push({ campo: "secciones", mensaje: "Elegí al menos una sección del seguimiento." })
    }
  }
  if (o.observaciones.length > MAX_OBSERVACIONES) {
    problemas.push({ campo: "observaciones", mensaje: `Las observaciones pueden tener hasta ${MAX_OBSERVACIONES} caracteres.` })
  }
  return problemas
}
