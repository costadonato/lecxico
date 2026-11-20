"use client"

import { useDetenerAudioAlNavegar } from "@/lib/entrenamiento/use-audio"

/** Corta cualquier audio al cambiar de ruta (reproductor único, lib/entrenamiento/audio.ts). */
export function DetenerAudioAlNavegar() {
  useDetenerAudioAlNavegar()
  return null
}
