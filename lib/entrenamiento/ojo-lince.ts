/*
 * OJO DE LINCE: CUADRÍCULAS DE UNA PARTIDA (S14b)
 * ------------------------------------------------------------------
 * El niño marca todas las celdas iguales a la muestra (inicial) o a la
 * letra que dice Lumo (primario) y toca "Finalizar". La partida son 3
 * cuadrículas, completas, con cerca del 25 % de las celdas como objetivo,
 * en posiciones al azar.
 *
 * Inicial (complementario de denominación rápida): 3 × 3, 3 × 4 y 4 × 4.
 * Cada cuadrícula usa una categoría, en orden al azar: colores (los 5 de
 * la evaluación), dibujos (flor, tren, globo, llave, oso, estrella) o
 * vocales. Los distractores son los otros elementos de la categoría.
 *
 * Primario (complementario de correspondencia sonido-letra): 5 × 5, 6 × 6
 * y 7 × 7, siempre en minúscula. Cada cuadrícula tiene un objetivo
 * distinto. No se usa la v (suena igual que la b).
 *   1: objetivos m s t l f b d; distractores de forma distinta
 *      (a e o u r c n i, menos el objetivo y las de forma parecida).
 *   2: objetivos b n m f t e; distractores de forma parecida (PARECIDAS).
 *   3: objetivos b d p q; distractores, las otras tres letras espejo.
 */

import { mezclar } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import { COLORES_ESTIMULO } from "@/lib/test/denominacion-config"

export type CategoriaOjo = "colores" | "dibujos" | "vocales" | "letras"

export interface ItemOjoLince {
  /** "OJO-2-b": número de cuadrícula y objetivo. */
  id: string
  categoria: CategoriaOjo
  objetivo: string
  /** Lo que dice Lumo (primario) o el nombre del objetivo. */
  nombre: string
  /** Primario grado 1: la letra también se ve en la muestra. En inicial, siempre. */
  muestraVisible: boolean
  filas: number
  columnas: number
  /** Valores de las celdas, de izquierda a derecha y fila por fila. */
  celdas: string[]
  /** Índices de las celdas que son el objetivo. */
  objetivos: number[]
}

export const CUADRICULAS_OJO = 3

export const TAMANOS_OJO: Record<Nivel, Record<Grado, { filas: number; columnas: number }>> = {
  inicial: { 1: { filas: 3, columnas: 3 }, 2: { filas: 3, columnas: 4 }, 3: { filas: 4, columnas: 4 } },
  primario: { 1: { filas: 5, columnas: 5 }, 2: { filas: 6, columnas: 6 }, 3: { filas: 7, columnas: 7 } },
}

/** Cantidad de objetivos según la cantidad de celdas (cerca del 25 %). */
export const OBJETIVOS_POR_CELDAS: Record<number, number> = { 9: 2, 12: 3, 16: 4, 25: 6, 36: 9, 49: 12 }

export const ELEMENTOS_INICIAL: Record<Exclude<CategoriaOjo, "letras">, readonly string[]> = {
  colores: Object.keys(COLORES_ESTIMULO),
  dibujos: ["flor", "tren", "globo", "llave", "oso", "estrella"],
  vocales: ["A", "E", "I", "O", "U"],
}

/** Lo que dice Lumo de cada letra. */
export const NOMBRE_LETRA: Record<string, string> = {
  b: "be",
  d: "de",
  p: "pe",
  q: "cu",
  m: "eme",
  n: "ene",
  s: "ese",
  t: "te",
  l: "ele",
  f: "efe",
  h: "hache",
  k: "ka",
  a: "a",
  e: "e",
  i: "i",
  o: "o",
  u: "u",
  c: "ce",
  r: "erre",
}

/** Letras de forma parecida (distractores del grado 2). */
export const PARECIDAS: Record<string, readonly string[]> = {
  b: ["h", "l", "k"],
  n: ["h", "m", "u", "r"],
  m: ["n", "r", "u"],
  f: ["t", "l"],
  t: ["f", "l", "i"],
  e: ["c", "o", "a"],
}

export const LETRAS_ESPEJO: readonly string[] = ["b", "d", "p", "q"]

export const OBJETIVOS_PRIMARIO: Record<Grado, readonly string[]> = {
  1: ["m", "s", "t", "l", "f", "b", "d"],
  2: ["b", "n", "m", "f", "t", "e"],
  3: LETRAS_ESPEJO,
}

const FORMA_DISTINTA: readonly string[] = ["a", "e", "o", "u", "r", "c", "n", "i"]

/** Distractores de una letra objetivo en primario. */
export function distractoresLetra(grado: Grado, objetivo: string): string[] {
  if (grado === 1) return FORMA_DISTINTA.filter((l) => l !== objetivo && !(PARECIDAS[objetivo] ?? []).includes(l))
  if (grado === 2) return [...PARECIDAS[objetivo]]
  return LETRAS_ESPEJO.filter((l) => l !== objetivo)
}

/**
 * Celdas de una cuadrícula: `k` objetivos en posiciones al azar y el resto
 * con los distractores repartidos parejo (en orden al azar).
 */
export function llenarCuadricula(
  n: number,
  k: number,
  objetivo: string,
  distractores: readonly string[],
  azar: () => number,
): { celdas: string[]; objetivos: number[] } {
  const posiciones = mezclar(Array.from({ length: n }, (_, i) => i), azar)
  const objetivos = posiciones.slice(0, k).sort((a, b) => a - b)
  const relleno = mezclar(
    Array.from({ length: n - k }, (_, i) => distractores[i % distractores.length]),
    azar,
  )
  const celdas: string[] = []
  let j = 0
  for (let i = 0; i < n; i++) celdas.push(objetivos.includes(i) ? objetivo : relleno[j++])
  return { celdas, objetivos }
}

/** Las 3 cuadrículas de una partida. */
export function generarOjoLince(nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemOjoLince[] {
  const { filas, columnas } = TAMANOS_OJO[nivel][grado]
  const n = filas * columnas
  const k = OBJETIVOS_POR_CELDAS[n]

  if (nivel === "inicial") {
    const categorias = mezclar(["colores", "dibujos", "vocales"] as const, azar)
    return categorias.map((categoria, i) => {
      const elementos = ELEMENTOS_INICIAL[categoria]
      const [objetivo, ...distractores] = mezclar(elementos, azar)
      return {
        id: `OJO-${i + 1}-${objetivo}`,
        categoria,
        objetivo,
        nombre: categoria === "vocales" ? objetivo.toLowerCase() : objetivo,
        muestraVisible: true,
        filas,
        columnas,
        ...llenarCuadricula(n, k, objetivo, distractores, azar),
      }
    })
  }

  return mezclar(OBJETIVOS_PRIMARIO[grado], azar)
    .slice(0, CUADRICULAS_OJO)
    .map((objetivo, i) => ({
      id: `OJO-${i + 1}-${objetivo}`,
      categoria: "letras" as const,
      objetivo,
      nombre: NOMBRE_LETRA[objetivo],
      muestraVisible: grado === 1,
      filas,
      columnas,
      ...llenarCuadricula(n, k, objetivo, distractoresLetra(grado, objetivo), azar),
    }))
}
