/*
 * MEMOTONO: GENERADOR DE LAS SECUENCIAS DE UNA PARTIDA (S13b)
 * ------------------------------------------------------------------
 * Memotono no tiene banco por grado: arma sus 6 secuencias a partir de
 * bancos.memotono[nivel], una lista de { palabra, silabas, parecidas }.
 *
 *   Grado | Inicial     | Primario                  | Distractores                          | Reproducciones
 *   1     | 2 elementos | 3 palabras de 1 o 2 síl.  | 2, ninguno parecido a la secuencia    | 3
 *   2     | 3 elementos | 4 palabras de 2 sílabas   | 3, uno parecido a una de la secuencia | 2
 *   3     | 4 elementos | 5 palabras de 2 o 3 síl.  | 4, todos parecidos a alguna           | 2
 *
 * Cada secuencia no repite palabras, no junta dos palabras parecidas entre
 * sí y no se repite dentro de la partida. El panel es la secuencia más los
 * distractores, en orden al azar, y todas sus palabras tienen dibujo.
 *
 * Inicial, grado 1: se alternan 3 secuencias de dibujos con 3 de colores
 * (bancos.memotono.colores). En las de colores, el panel muestra círculos
 * de color y los distractores son otros colores. En inicial no hay números.
 */

import datos from "@/lib/entrenamiento/bancos.json"
import { mezclar, tieneDibujo } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"

export interface PalabraMemotono {
  palabra: string
  silabas: number
  parecidas: string[]
}

export interface ItemMemotono {
  /** "MEM-bota-mono-ojo": estable y legible, para el detalle. */
  id: string
  tipo: "dibujos" | "colores"
  /** Lo que dice Lumo, en orden. */
  secuencia: string[]
  /** La secuencia y los distractores, mezclados. */
  panel: string[]
  /** Cuántas veces se puede escuchar la secuencia. */
  reproducciones: number
}

export const SECUENCIAS_POR_PARTIDA = 6

/** Pausa entre las palabras de la secuencia, por nivel. */
export const PAUSA_MEMOTONO_MS: Record<Nivel, number> = { inicial: 900, primario: 700 }

interface ReglaGrado {
  largo: Record<Nivel, number>
  /** Sílabas permitidas en primario (en inicial no se restringe). */
  silabasPrimario: readonly number[]
  distractores: number
  /** Cuántos distractores son parecidos a alguna palabra de la secuencia. */
  parecidos: "ninguno" | "uno" | "todos"
  reproducciones: number
}

export const REGLAS_MEMOTONO: Record<Grado, ReglaGrado> = {
  1: { largo: { inicial: 2, primario: 3 }, silabasPrimario: [1, 2], distractores: 2, parecidos: "ninguno", reproducciones: 3 },
  2: { largo: { inicial: 3, primario: 4 }, silabasPrimario: [2], distractores: 3, parecidos: "uno", reproducciones: 2 },
  3: { largo: { inicial: 4, primario: 5 }, silabasPrimario: [2, 3], distractores: 4, parecidos: "todos", reproducciones: 2 },
}

const BANCO = datos.bancos.memotono as unknown as Record<Nivel, PalabraMemotono[]> & { colores: string[] }

/** Palabras del nivel con dibujo. */
export function palabrasMemotono(nivel: Nivel): PalabraMemotono[] {
  return BANCO[nivel].filter((p) => tieneDibujo(p.palabra))
}

export const COLORES_MEMOTONO: readonly string[] = BANCO.colores

/** true si a y b se parecen (en cualquiera de los dos sentidos). */
function seParecen(lista: readonly PalabraMemotono[], a: string, b: string): boolean {
  return lista.some((p) => (p.palabra === a && p.parecidas.includes(b)) || (p.palabra === b && p.parecidas.includes(a)))
}

const INTENTOS = 300

/** Una secuencia de dibujos con su panel, o null si no se encontró ninguna nueva. */
function secuenciaDeDibujos(
  nivel: Nivel,
  regla: ReglaGrado,
  usadas: Set<string>,
  azar: () => number,
): Pick<ItemMemotono, "secuencia" | "panel"> | null {
  const todas = palabrasMemotono(nivel)
  const pool = nivel === "primario" ? todas.filter((p) => regla.silabasPrimario.includes(p.silabas)) : todas
  const largo = regla.largo[nivel]

  for (let intento = 0; intento < INTENTOS; intento++) {
    let candidatas = mezclar(pool, azar)
    // En el grado 3 los distractores salen de las parecidas: primero las palabras que tienen.
    if (regla.parecidos === "todos") {
      candidatas = [...candidatas.filter((p) => p.parecidas.length > 0), ...candidatas.filter((p) => p.parecidas.length === 0)]
    }
    const secuencia: string[] = []
    for (const c of candidatas) {
      if (secuencia.length === largo) break
      if (secuencia.some((s) => seParecen(todas, s, c.palabra))) continue
      secuencia.push(c.palabra)
    }
    if (secuencia.length < largo || usadas.has(secuencia.join("-"))) continue

    const parecidas = new Set(
      todas
        .filter((p) => !secuencia.includes(p.palabra) && secuencia.some((s) => seParecen(todas, s, p.palabra)))
        .map((p) => p.palabra),
    )
    const distintas = pool.map((p) => p.palabra).filter((p) => !secuencia.includes(p) && !parecidas.has(p))

    let distractores: string[]
    if (regla.parecidos === "ninguno") {
      distractores = mezclar(distintas, azar).slice(0, regla.distractores)
    } else if (regla.parecidos === "uno") {
      const una = mezclar([...parecidas], azar).slice(0, 1)
      distractores = [...una, ...mezclar(distintas, azar).slice(0, regla.distractores - 1)]
    } else {
      distractores = mezclar([...parecidas], azar).slice(0, regla.distractores)
    }
    if (distractores.length < regla.distractores) continue

    usadas.add(secuencia.join("-"))
    return { secuencia, panel: mezclar([...secuencia, ...distractores], azar) }
  }
  return null
}

/** Una secuencia de colores (inicial, grado 1): los distractores son otros colores. */
function secuenciaDeColores(
  regla: ReglaGrado,
  usadas: Set<string>,
  azar: () => number,
): Pick<ItemMemotono, "secuencia" | "panel"> | null {
  const largo = regla.largo.inicial
  for (let intento = 0; intento < INTENTOS; intento++) {
    const mezcla = mezclar(COLORES_MEMOTONO, azar)
    const secuencia = mezcla.slice(0, largo)
    // Con 5 colores siempre alcanzan: 2 de la secuencia y 2 distractores.
    const distractores = mezcla.slice(largo, largo + regla.distractores)
    if (usadas.has(secuencia.join("-"))) continue
    usadas.add(secuencia.join("-"))
    return { secuencia, panel: mezclar([...secuencia, ...distractores], azar) }
  }
  return null
}

/**
 * Las 6 secuencias de una partida. Si el banco no alcanza para armarlas,
 * devuelve una lista vacía (el marco muestra "Este grado todavía no tiene
 * contenido").
 */
export function generarMemotono(nivel: Nivel, grado: Grado, azar: () => number = Math.random): ItemMemotono[] {
  const regla = REGLAS_MEMOTONO[grado]
  const conColores = nivel === "inicial" && grado === 1
  const usadas = new Set<string>()
  const items: ItemMemotono[] = []

  for (let i = 0; i < SECUENCIAS_POR_PARTIDA; i++) {
    // Inicial, grado 1: dibujos, colores, dibujos, colores… (3 y 3).
    const tipo: ItemMemotono["tipo"] = conColores && i % 2 === 1 ? "colores" : "dibujos"
    const armada = tipo === "colores" ? secuenciaDeColores(regla, usadas, azar) : secuenciaDeDibujos(nivel, regla, usadas, azar)
    if (!armada) return []
    items.push({ id: `MEM-${armada.secuencia.join("-")}`, tipo, ...armada, reproducciones: regla.reproducciones })
  }
  return items
}

/** true si el niño tocó la secuencia completa y en orden. */
export function secuenciaCorrecta(item: Pick<ItemMemotono, "secuencia">, tocadas: readonly string[]): boolean {
  return tocadas.length === item.secuencia.length && item.secuencia.every((p, i) => tocadas[i] === p)
}
