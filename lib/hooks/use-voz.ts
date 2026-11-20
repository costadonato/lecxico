"use client"

import { useCallback } from "react"
import { useAudio } from "@/lib/entrenamiento/use-audio"

/**
 * Lectura en voz alta del globo de los personajes. Desde S13a usa el
 * reproductor único de la app (lib/entrenamiento/audio.ts): un audio a la
 * vez, con un segundo de silencio antes y la voz en español preferida.
 * `disponible` es false en el servidor y en navegadores sin audio.
 */
export function useVoz({ tono = 1.2, velocidad = 0.9 }: { tono?: number; velocidad?: number } = {}) {
  const { decir, detener, hablando, disponible } = useAudio({ tono })
  const hablar = useCallback((texto: string) => decir(texto, { velocidad }), [decir, velocidad])
  return { hablar, detener, hablando, disponible }
}
