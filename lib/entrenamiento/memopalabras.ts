/*
 * MEMOPALABRAS: CONJUNTOS DE UNA PARTIDA (S14b)
 * ------------------------------------------------------------------
 * El niño lee unas palabras, toca "Ya las leí" y después marca, entre las
 * leídas y los distractores, las que vio. La partida se genera a partir de
 * bancos.memopalabras.primario[grado] ({ id, palabra, parecida }):
 *
 *   Grado | Conjuntos | Para leer | Distractores
 *   1     | 6         | 3         | otras palabras del grado 1 que no están en el
 *         |           |           | conjunto, primero las que todavía no aparecieron
 *   2     | 6         | 4         | la parecida de cada palabra (misma sílaba inicial)
 *   3     | 4         | 5         | la parecida de cada palabra (una letra cambiada
 *         |           |           | o invertida)
 *
 * Las palabras para leer no se repiten en la partida, y ninguna parecida
 * coincide con una palabra para leer del mismo conjunto: ninguna parecida
 * es una palabra del grado (lo controla memopalabras.test.ts).
 */

import datos from "@/lib/entrenamiento/bancos.json"
import { mezclar } from "@/lib/entrenamiento/bancos"
import type { Grado } from "@/lib/entrenamiento/juegos"

export interface PalabraMemo {
  id: string
  palabra: string
  /** Distractor de la palabra (null en el grado 1). */
  parecida: string | null
}

export interface ItemMemopalabras {
  /** "MPA-2-paloma-cometa-sirena-galleta": grado y palabras para leer. */
  id: string
  leer: string[]
  distractores: string[]
  /** Las leídas y los distractores, mezclados. */
  panel: string[]
}

export const REGLAS_MEMOPALABRAS: Record<Grado, { conjuntos: number; leer: number }> = {
  1: { conjuntos: 6, leer: 3 },
  2: { conjuntos: 6, leer: 4 },
  3: { conjuntos: 4, leer: 5 },
}

const BANCO = datos.bancos.memopalabras.primario as unknown as Record<string, PalabraMemo[]>

export function bancoMemopalabras(grado: Grado): PalabraMemo[] {
  return BANCO[String(grado)] ?? []
}

/** Los conjuntos de una partida (vacío si el banco no alcanza). */
export function generarMemopalabras(grado: Grado, azar: () => number = Math.random): ItemMemopalabras[] {
  const banco = bancoMemopalabras(grado)
  const regla = REGLAS_MEMOPALABRAS[grado]
  if (!regla || banco.length < regla.conjuntos * regla.leer) return []
  const { conjuntos, leer } = regla

  const elegidas = mezclar(banco, azar).slice(0, conjuntos * leer)
  const grupos = Array.from({ length: conjuntos }, (_, c) => elegidas.slice(c * leer, c * leer + leer))
  const aparecidas = new Set<string>()
  return grupos.map((grupo) => {
    const palabras = grupo.map((p) => p.palabra)
    let distractores: string[]
    if (grado === 1) {
      const otras = banco.map((p) => p.palabra).filter((p) => !palabras.includes(p))
      const nuevas = mezclar(
        otras.filter((p) => !aparecidas.has(p)),
        azar,
      )
      const vistas = mezclar(
        otras.filter((p) => aparecidas.has(p)),
        azar,
      )
      distractores = [...nuevas, ...vistas].slice(0, leer)
    } else {
      distractores = grupo.map((p) => p.parecida!)
    }
    for (const p of [...palabras, ...distractores]) aparecidas.add(p)
    return {
      id: `MPA-${grado}-${palabras.join("-")}`,
      leer: palabras,
      distractores,
      panel: mezclar([...palabras, ...distractores], azar),
    }
  })
}

/** Índices del panel que son palabras para leer (los objetivos de la selección). */
export function objetivosMemopalabras(item: Pick<ItemMemopalabras, "leer" | "panel">): number[] {
  return item.panel.flatMap((p, i) => (item.leer.includes(p) ? [i] : []))
}

/** Agrega a cada conjunto el tiempo de lectura (desde que se muestra hasta "Ya las leí"). */
export function conLectura<D extends object>(
  detalle: readonly D[],
  lecturas: readonly (number | undefined)[],
): (D & { lecturaMs?: number })[] {
  return detalle.map((d, i) => (lecturas[i] === undefined ? { ...d } : { ...d, lecturaMs: Math.round(lecturas[i]!) }))
}
