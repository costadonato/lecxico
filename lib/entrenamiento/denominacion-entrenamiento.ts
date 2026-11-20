/*
 * NOMBRÁ RÁPIDO: CUADRÍCULAS GENERADAS PARA EL ENTRENAMIENTO (S13b)
 * ------------------------------------------------------------------
 * Nombrá rápido reusa el ejercicio de denominación de la evaluación
 * (components/test/ejercicio-denominacion.tsx), pero sus cuadrículas no
 * son fijas: se generan al azar en cada partida, con las reglas de
 * validarSecuencia (lib/test/denominacion.ts):
 *   - ciclo de las categorías del grado, de corrido;
 *   - usos parejos dentro de cada categoría (diferencia máxima de 1);
 *   - sin repetir un estímulo en dos apariciones seguidas de su categoría
 *     (en los grados de una sola categoría, eso es: sin dos celdas iguales
 *     seguidas).
 * La partida tiene 2 cuadrículas, distintas entre sí.
 *
 *   Grado | Inicial                           | Primario
 *   1     | Colores, 3 × 4                    | Letras, 4 × 5
 *   2     | Colores y vocales, 4 × 5          | Letras y números, 5 × 6
 *   3     | Colores, vocales y dibujos, 4 × 6 | Letras, números y colores, 5 × 8
 *
 * Los estímulos son los de la evaluación (DENOMINACION_POR_NIVEL): en
 * primario, letras A E S D P, números 2 4 6 7 9 y los cinco colores; en
 * inicial, vocales y colores, y además los dibujos flor, tren, globo, llave
 * y oso. En inicial no hay números. Estas categorías y estímulos los usa
 * también ¡Rápido, tocalo! (lib/entrenamiento/tocalo.ts).
 */

import { mezclar } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import { validarSecuencia } from "@/lib/test/denominacion"
import {
  DENOMINACION_POR_NIVEL,
  TEXTOS_DENOMINACION,
  type CategoriaEstimulo,
  type ConfigDenominacion,
  type EjercicioDenominacion,
  type Estimulo,
} from "@/lib/test/denominacion-config"

const dibujo = (valor: string): Estimulo => ({ categoria: "dibujo", valor, nombre: valor })

/** Dibujos de inicial (están en bancos.json). */
export const DIBUJOS_DENOMINACION: readonly Estimulo[] = ["flor", "tren", "globo", "llave", "oso"].map(dibujo)

const EVAL = DENOMINACION_POR_NIVEL
export const COLORES_DENOMINACION: readonly Estimulo[] = EVAL.primario.estimulos.color
export const VOCALES_DENOMINACION: readonly Estimulo[] = EVAL.inicial.estimulos.letra
export const LETRAS_DENOMINACION: readonly Estimulo[] = EVAL.primario.estimulos.letra
export const NUMEROS_DENOMINACION: readonly Estimulo[] = EVAL.primario.estimulos.numero

/** Categorías de cada grado, en el orden del ciclo. */
export const CATEGORIAS_POR_GRADO: Record<Nivel, Record<Grado, readonly CategoriaEstimulo[]>> = {
  inicial: { 1: ["color"], 2: ["color", "letra"], 3: ["color", "letra", "dibujo"] },
  primario: { 1: ["letra"], 2: ["letra", "numero"], 3: ["letra", "numero", "color"] },
}

/** Filas × columnas de las cuadrículas de Nombrá rápido. */
export const TAMANOS_NOMBRA: Record<Nivel, Record<Grado, { filas: number; columnas: number }>> = {
  inicial: { 1: { filas: 3, columnas: 4 }, 2: { filas: 4, columnas: 5 }, 3: { filas: 4, columnas: 6 } },
  primario: { 1: { filas: 4, columnas: 5 }, 2: { filas: 5, columnas: 6 }, 3: { filas: 5, columnas: 8 } },
}

export const CUADRICULAS_POR_PARTIDA = 2

/** Estímulos de Nombrá rápido de un nivel, por categoría (las letras de inicial son las vocales). */
export function estimulosNombra(nivel: Nivel): Partial<Record<CategoriaEstimulo, readonly Estimulo[]>> {
  return nivel === "inicial"
    ? { color: COLORES_DENOMINACION, letra: VOCALES_DENOMINACION, dibujo: DIBUJOS_DENOMINACION }
    : { letra: LETRAS_DENOMINACION, numero: NUMEROS_DENOMINACION, color: COLORES_DENOMINACION }
}

const PLURAL: Record<CategoriaEstimulo, string> = { letra: "letras", numero: "números", color: "colores", dibujo: "dibujos" }

/** "colores", "colores y vocales", "letras, números y colores". */
export function nombreCategorias(nivel: Nivel, categorias: readonly CategoriaEstimulo[]): string {
  const nombres = categorias.map((c) => (c === "letra" && nivel === "inicial" ? "vocales" : PLURAL[c]))
  return nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`
}

/** "Vamos a jugar con colores y vocales. Decime el nombre de cada uno." */
export function textoPracticaNombra(nivel: Nivel, grado: Grado): string {
  return `Vamos a jugar con ${nombreCategorias(nivel, CATEGORIAS_POR_GRADO[nivel][grado])}. Decime el nombre de cada uno.`
}

const INTENTOS = 200

/**
 * `n` valores de `estimulos` con usos parejos (los que se usan una vez más
 * salen al azar) y sin dos iguales seguidos. Elige cada valor al azar,
 * pesado por los usos que le quedan; si se traba, vuelve a empezar.
 */
export function subsecuenciaPareja(estimulos: readonly Estimulo[], n: number, azar: () => number): string[] {
  const valores = estimulos.map((e) => e.valor)
  const base = Math.floor(n / valores.length)
  const conUnoMas = new Set(mezclar(valores, azar).slice(0, n % valores.length))

  for (let intento = 0; intento < INTENTOS; intento++) {
    const restan = new Map(valores.map((v) => [v, base + (conUnoMas.has(v) ? 1 : 0)]))
    const salida: string[] = []
    while (salida.length < n) {
      const anterior = salida[salida.length - 1]
      const opciones = valores.filter((v) => v !== anterior && restan.get(v)! > 0)
      if (opciones.length === 0) break
      const pesos = opciones.map((v) => restan.get(v)!)
      let r = azar() * pesos.reduce((a, b) => a + b, 0)
      let elegido = opciones[opciones.length - 1]
      for (let i = 0; i < opciones.length; i++) {
        r -= pesos[i]
        if (r < 0) {
          elegido = opciones[i]
          break
        }
      }
      salida.push(elegido)
      restan.set(elegido, restan.get(elegido)! - 1)
    }
    if (salida.length === n) return salida
  }
  return []
}

/** Una cuadrícula de `filas × columnas` que sigue el ciclo de `categorias`. */
export function generarSecuencia(
  estimulos: Partial<Record<CategoriaEstimulo, readonly Estimulo[]>>,
  categorias: readonly CategoriaEstimulo[],
  n: number,
  azar: () => number,
): string[] {
  const por = new Map(
    categorias.map((c) => {
      const cuantas = Array.from({ length: n }, (_, i) => categorias[i % categorias.length]).filter((x) => x === c).length
      return [c, subsecuenciaPareja(estimulos[c]!, cuantas, azar)]
    }),
  )
  return Array.from({ length: n }, (_, i) => por.get(categorias[i % categorias.length])![Math.floor(i / categorias.length)] ?? "")
}

/**
 * La configuración de Nombrá rápido para un nivel y grado: 2 cuadrículas
 * nuevas que pasan validarSecuencia y son distintas entre sí, la fila de
 * práctica (un estímulo de cada categoría) y los textos de la evaluación,
 * con la práctica del grado.
 */
export function generarConfigNombra(nivel: Nivel, grado: Grado, azar: () => number = Math.random): ConfigDenominacion {
  const categorias = CATEGORIAS_POR_GRADO[nivel][grado]
  const estimulos = estimulosNombra(nivel)
  const { filas, columnas } = TAMANOS_NOMBRA[nivel][grado]
  const base: ConfigDenominacion = {
    estimulos: Object.fromEntries(categorias.map((c) => [c, estimulos[c]])),
    ciclo: categorias,
    ejercicios: [],
    practica: categorias.map((c) => mezclar(estimulos[c]!, azar)[0].valor),
    textos: { ...TEXTOS_DENOMINACION, practica: textoPracticaNombra(nivel, grado) },
  }

  const ejercicios: EjercicioDenominacion[] = []
  for (let intento = 0; intento < INTENTOS && ejercicios.length < CUADRICULAS_POR_PARTIDA; intento++) {
    const numero = ejercicios.length + 1
    const ejercicio: EjercicioDenominacion = {
      id: `NOM-${nivel}-${grado}-${numero}`,
      nombre: `Cuadrícula ${numero}`,
      filas,
      columnas,
      secuencia: generarSecuencia(base.estimulos, categorias, filas * columnas, azar),
    }
    const repetida = ejercicios.some((e) => e.secuencia.join() === ejercicio.secuencia.join())
    if (!repetida && validarSecuencia(base, ejercicio).length === 0) ejercicios.push(ejercicio)
  }
  return { ...base, ejercicios }
}

/** Un ítem de la partida de Nombrá rápido: una cuadrícula. */
export interface ItemNombra {
  id: string
  config: ConfigDenominacion
  ejercicio: EjercicioDenominacion
}

/** Las 2 cuadrículas de una partida (vacío si no se pudieron generar). */
export function generarNombra(nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemNombra[] {
  const config = generarConfigNombra(nivel, grado, azar)
  if (config.ejercicios.length < CUADRICULAS_POR_PARTIDA) return []
  return config.ejercicios.map((ejercicio) => ({ id: ejercicio.id, config, ejercicio }))
}
