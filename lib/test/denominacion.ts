/**
 * Lógica pura del bloque "Denominación Rápida" (S9): puntaje de cada
 * ejercicio, suma del bloque, formato del tiempo y validación de las
 * secuencias de lib/test/denominacion-config.ts.
 *
 * Puntaje: por ejercicio, total = cantidad de estímulos de la cuadrícula y
 * correctas = total - errores. El bloque suma sus ejercicios y guarda
 * además el detalle de cada uno (tiempo y errores por separado).
 */
import {
  buscarEstimulo,
  cicloDe,
  type ConfigDenominacion,
  type EjercicioDenominacion,
} from "@/lib/test/denominacion-config"
import type { DetalleEjercicioDenominacion } from "@/lib/types/database"

export interface MedicionEjercicio {
  /** id del ejercicio (EjercicioDenominacion.id). */
  ejercicio: string
  /** Tiempo medido entre "Comenzar" y "Terminar". */
  tiempoMs: number
  /** Errores que cargó el profesional. */
  errores: number
  /** Cantidad de estímulos de la cuadrícula. */
  total: number
}

export interface ResultadoEjercicio extends MedicionEjercicio {
  correctas: number
}

export interface ResultadoBloqueDenominacion {
  tiempoMs: number
  errores: number
  correctas: number
  total: number
  /** Un elemento por ejercicio, con la forma de la columna `detalle`. */
  detalle: DetalleEjercicioDenominacion[]
}

const acotar = (valor: number, min: number, max: number) => Math.min(max, Math.max(min, valor))

/**
 * Resultado de un ejercicio. Los errores se redondean y se acotan a
 * [0, total], así correctas = total - errores también queda en [0, total]
 * (es lo que exige guardar_test). El tiempo se redondea a milisegundos enteros.
 */
export function resultadoEjercicio(m: MedicionEjercicio): ResultadoEjercicio {
  const errores = acotar(Math.round(m.errores), 0, m.total)
  return {
    ejercicio: m.ejercicio,
    tiempoMs: Math.round(m.tiempoMs),
    errores,
    correctas: m.total - errores,
    total: m.total,
  }
}

/** Suma de los ejercicios del bloque, con el detalle de cada uno. */
export function resultadoBloqueDenominacion(ejercicios: readonly ResultadoEjercicio[]): ResultadoBloqueDenominacion {
  const sumar = (campo: "tiempoMs" | "errores" | "correctas" | "total") =>
    ejercicios.reduce((acc, e) => acc + e[campo], 0)
  return {
    tiempoMs: sumar("tiempoMs"),
    errores: sumar("errores"),
    correctas: sumar("correctas"),
    total: sumar("total"),
    detalle: ejercicios.map((e) => ({
      ejercicio: e.ejercicio,
      tiempo_ms: e.tiempoMs,
      errores: e.errores,
      correctas: e.correctas,
      total: e.total,
    })),
  }
}

/** Tiempo como minutos:segundos ("1:05", "0:48"), redondeado al segundo. */
export function formatearTiempo(ms: number): string {
  const segundos = Math.max(0, Math.round(ms / 1000))
  const minutos = Math.floor(segundos / 60)
  return `${minutos}:${String(segundos % 60).padStart(2, "0")}`
}

/**
 * Problemas de la secuencia de `ejercicio` según las reglas del bloque
 * (lista vacía = válida):
 * - largo = filas × columnas;
 * - solo estímulos del nivel;
 * - ciclo de categorías de corrido (en la evaluación, letra → número →
 *   color; si la configuración trae su propio `ciclo`, ese);
 * - cada estímulo de una categoría aparece una cantidad pareja de veces
 *   (diferencia máxima de 1 entre el más y el menos usado);
 * - un estímulo no se repite en dos apariciones seguidas de su categoría.
 */
export function validarSecuencia(config: ConfigDenominacion, ejercicio: EjercicioDenominacion): string[] {
  const problemas: string[] = []
  const { secuencia, filas, columnas } = ejercicio

  if (secuencia.length !== filas * columnas) {
    problemas.push(`Tiene ${secuencia.length} estímulos y debería tener ${filas * columnas}.`)
  }

  const ciclo = cicloDe(config)
  const usos = new Map<string, number>()
  const anterior = new Map<string, string>()

  secuencia.forEach((valor, i) => {
    const estimulo = buscarEstimulo(config, valor)
    if (!estimulo) {
      problemas.push(`Posición ${i + 1}: "${valor}" no es un estímulo del nivel.`)
      return
    }
    const esperada = ciclo[i % ciclo.length]
    if (estimulo.categoria !== esperada) {
      problemas.push(`Posición ${i + 1}: se esperaba ${esperada} y hay ${estimulo.categoria}.`)
    }
    if (anterior.get(estimulo.categoria) === valor) {
      problemas.push(`Posición ${i + 1}: "${valor}" se repite seguido dentro de su categoría.`)
    }
    anterior.set(estimulo.categoria, valor)
    usos.set(valor, (usos.get(valor) ?? 0) + 1)
  })

  for (const categoria of ciclo) {
    const conteos = (config.estimulos[categoria] ?? []).map((e) => usos.get(e.valor) ?? 0)
    if (Math.max(...conteos) - Math.min(...conteos) > 1) {
      problemas.push(`Los estímulos de ${categoria} no aparecen una cantidad pareja de veces (${conteos.join(", ")}).`)
    }
  }

  return problemas
}
