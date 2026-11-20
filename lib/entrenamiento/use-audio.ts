"use client"

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import {
  audioDisponible,
  cargarManifiesto,
  decir as decirAudio,
  detener as detenerAudio,
  obtenerEstado,
  obtenerEstadoServidor,
  suscribir,
} from "@/lib/entrenamiento/audio"

/**
 * Acceso de un componente al reproductor único (lib/entrenamiento/audio.ts).
 *
 *   const { decir, detener, hablando } = useAudio()
 *   <button onClick={() => decir("vaca")}>Escuchar</button>
 *
 * `hablando` es true solo mientras suena (o espera su segundo de silencio)
 * un audio que pidió ESTE componente; `sonando`, si suena cualquiera. Al
 * desmontarse, corta su propio audio.
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
    (texto: string, opciones: { velocidad?: number } = {}) => decirAudio(texto, { ...opciones, tono, dueno }),
    [dueno, tono],
  )

  return {
    decir,
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
