"use client"

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import {
  audioDisponible,
  cargarManifiesto,
  decir as decirAudio,
  decirSecuencia as decirSecuenciaAudio,
  detener as detenerAudio,
  obtenerEstado,
  obtenerEstadoServidor,
  suscribir,
} from "@/lib/entrenamiento/audio"

/**
 * Acceso de un componente al reproductor único (lib/entrenamiento/audio.ts).
 *
 *   const { decir, decirSecuencia, detener, hablando } = useAudio()
 *   <button onClick={() => decir("vaca")}>Escuchar</button>
 *   <button onClick={() => decirSecuencia(["bota", "mono"], { pausaMs: 700, alTerminar })}>…</button>
 *
 * El audio arranca enseguida, sin espera. `alTerminar` se llama solo si el
 * audio (o la secuencia entera) termina solo, no si se corta.
 *
 * `hablando` es true solo mientras suena un audio (o una secuencia, de
 * principio a fin) que pidió ESTE componente; `sonando`, si suena
 * cualquiera. Al desmontarse, corta su propio audio.
 */
export function useAudio({ tono }: { tono?: number } = {}) {
  const dueno = useId()
  const estado = useSyncExternalStore(suscribir, obtenerEstado, obtenerEstadoServidor)
  const [disponible, setDisponible] = useState(false)

  useEffect(() => {
    setDisponible(audioDisponible())
    void cargarManifiesto()
    return () => {
      if (obtenerEstado().dueno === dueno) detenerAudio()
    }
  }, [dueno])

  const decir = useCallback(
    (texto: string, opciones: { velocidad?: number; alTerminar?: () => void } = {}) =>
      decirAudio(texto, { ...opciones, tono, dueno }),
    [dueno, tono],
  )

  const decirSecuencia = useCallback(
    (textos: readonly string[], opciones: { velocidad?: number; pausaMs?: number; alTerminar?: () => void } = {}) =>
      decirSecuenciaAudio(textos, { ...opciones, tono, dueno }),
    [dueno, tono],
  )

  return {
    decir,
    decirSecuencia,
    detener: detenerAudio,
    hablando: estado.dueno === dueno,
    sonando: estado.dueno !== null,
    disponible,
  }
}

/** Corta el audio al cambiar de ruta. Va una sola vez, en el layout raíz. */
export function useDetenerAudioAlNavegar() {
  const ruta = usePathname()
  useEffect(() => {
    detenerAudio()
  }, [ruta])
}
