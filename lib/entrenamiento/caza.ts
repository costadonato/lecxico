/*
 * CAZA ERRORES: PALABRAS DE LA ORACIÓN Y OBJETIVOS (S14a)
 * ------------------------------------------------------------------
 * Cada ítem del banco trae { id, oracion, errores }, con errores =
 * { palabra mal escrita: palabra correcta }. La oración se parte en
 * palabras: cada una es un botón, y la puntuación queda pegada pero fuera
 * de la palabra comparable ("tarde." marca "tarde").
 *
 * Los objetivos son índices de palabras: si una palabra con error
 * aparecería dos veces, solo cuenta la primera (en el banco no pasa; lo
 * controla bancos.test.ts).
 */

export interface PalabraOracion {
  /** Lo que se compara con las claves de `errores`. */
  palabra: string
  /** Signos pegados antes ("¿", "¡", comillas) y después (".", ",", "?"). */
  antes: string
  despues: string
}

const SIGNOS_ANTES = /^[¿¡"«“'(]+/
const SIGNOS_DESPUES = /[.,;:!?"»”')…]+$/

export function partirOracion(oracion: string): PalabraOracion[] {
  return oracion
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const antes = token.match(SIGNOS_ANTES)?.[0] ?? ""
      const resto = token.slice(antes.length)
      const despues = resto.match(SIGNOS_DESPUES)?.[0] ?? ""
      return { palabra: resto.slice(0, resto.length - despues.length), antes, despues }
    })
}

/** Índices de las palabras con error (la primera aparición de cada clave). */
export function objetivosCaza(palabras: readonly PalabraOracion[], errores: Record<string, string>): number[] {
  return Object.keys(errores)
    .map((mal) => palabras.findIndex((p) => p.palabra === mal))
    .filter((i) => i !== -1)
    .sort((a, b) => a - b)
}

/** "En esta oración hay 1 palabra mal escrita" / "2 palabras mal escritas". */
export function textoCantidadErrores(n: number): string {
  return n === 1 ? "En esta oración hay 1 palabra mal escrita" : `En esta oración hay ${n} palabras mal escritas`
}
