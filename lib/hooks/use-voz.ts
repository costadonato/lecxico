"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Lectura en voz alta con speechSynthesis (la misma configuración que usaba
 * LexSpeaker: voz en español, preferentemente de Google o "Monica").
 * `disponible` es false en el servidor y en navegadores sin síntesis de voz.
 */
export function useVoz({ tono = 1.2, velocidad = 0.9 }: { tono?: number; velocidad?: number } = {}) {
  const [hablando, setHablando] = useState(false)
  const [disponible, setDisponible] = useState(false)
  const propia = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setDisponible(typeof window !== "undefined" && "speechSynthesis" in window)
    return () => {
      // Al desmontar, corta solo lo que empezó este componente.
      if (propia.current && window.speechSynthesis?.speaking) window.speechSynthesis.cancel()
    }
  }, [])

  const detener = useCallback(() => {
    window.speechSynthesis?.cancel()
    propia.current = null
    setHablando(false)
  }, [])

  const hablar = useCallback(
    (texto: string) => {
      const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined
      if (!synth || !texto) return
      synth.cancel()

      const utterance = new SpeechSynthesisUtterance(texto)
      const voz = synth
        .getVoices()
        .find((v) => v.lang.includes("es") && (v.name.includes("Google") || v.name.includes("Monica")))
      if (voz) utterance.voice = voz
      utterance.pitch = tono
      utterance.rate = velocidad
      utterance.lang = "es-ES"
      utterance.onstart = () => setHablando(true)
      utterance.onend = () => {
        if (propia.current === utterance) propia.current = null
        setHablando(false)
      }
      utterance.onerror = utterance.onend

      propia.current = utterance
      synth.speak(utterance)
    },
    [tono, velocidad],
  )

  return { hablar, detener, hablando, disponible }
}
