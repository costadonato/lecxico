import type { ComponentType } from "react"
import { Caza } from "@/components/entrenamiento/juegos/caza"
import { Detective } from "@/components/entrenamiento/juegos/detective"
import { Eco } from "@/components/entrenamiento/juegos/eco"
import { Lee } from "@/components/entrenamiento/juegos/lee"
import { Lluvia } from "@/components/entrenamiento/juegos/lluvia"
import { Memopalabras } from "@/components/entrenamiento/juegos/memopalabras"
import { Memotono } from "@/components/entrenamiento/juegos/memotono"
import { Nombra } from "@/components/entrenamiento/juegos/nombra"
import { OjoLince } from "@/components/entrenamiento/juegos/ojo-lince"
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
  lee: Lee,
  eco: Eco,
  caza: Caza,
  memopalabras: Memopalabras,
  ojo_lince: OjoLince,
  lluvia: Lluvia,
}
