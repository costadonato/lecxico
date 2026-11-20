import type { ComponentType } from "react"
import { Detective } from "@/components/entrenamiento/juegos/detective"
import { Memotono } from "@/components/entrenamiento/juegos/memotono"
import { Nombra } from "@/components/entrenamiento/juegos/nombra"
import { Palmas } from "@/components/entrenamiento/juegos/palmas"
import { Planeta } from "@/components/entrenamiento/juegos/planeta"
import { Rima } from "@/components/entrenamiento/juegos/rima"
import { Rompe } from "@/components/entrenamiento/juegos/rompe"
import { Tocalo } from "@/components/entrenamiento/juegos/tocalo"
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
  memotono: Memotono,
  rompe: Rompe,
  planeta: Planeta,
  nombra: Nombra,
  tocalo: Tocalo,
}
