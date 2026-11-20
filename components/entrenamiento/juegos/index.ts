import type { ComponentType } from "react"
import { Detective } from "@/components/entrenamiento/juegos/detective"
import { Palmas } from "@/components/entrenamiento/juegos/palmas"
import { Rima } from "@/components/entrenamiento/juegos/rima"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import type { CodigoJuego } from "@/lib/entrenamiento/juegos"

/**
 * Componente de cada juego construido. Tiene que coincidir con
 * JUEGOS_DISPONIBLES (lib/entrenamiento/presentacion.ts).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const COMPONENTES_JUEGO: Partial<Record<CodigoJuego, ComponentType<PropsJuego<any>>>> = {
  detective: Detective,
  rima: Rima,
  palmas: Palmas,
}
