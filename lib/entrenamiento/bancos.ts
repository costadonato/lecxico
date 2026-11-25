/*
 * ACCESO TIPADO A LOS BANCOS DEL ENTRENAMIENTO
 * ------------------------------------------------------------------
 * bancos.json se exporta de la planilla que revisan las especialistas:
 * contenido de cada juego por nivel y grado, el mapa `dibujos`
 * (palabra → WebP de Fluent Emoji en public/emoji/) y `emojis`
 * (emoji → WebP). Acá van los tipos de los ítems y las funciones para armar
 * una partida.
 *
 * Un ítem que usa una palabra sin dibujo se descarta al armar la partida de
 * un juego con dibujos (las palabras de `a_generar`; hoy no hay ninguna).
 */

import datos from "@/lib/entrenamiento/bancos.json"
import type { CodigoJuego, Grado, Nivel } from "@/lib/entrenamiento/juegos"
import type { HistoriaLee } from "@/lib/entrenamiento/lee"

/** Detective de sonidos: la palabra que suena y dos distractores. */
export interface ItemDetective {
  id: string
  palabra: string
  distractores: string[]
}

/** Rima: el estímulo, la palabra que rima y dos distractores. */
export interface ItemRima {
  id: string
  estimulo: string
  correcta: string
  distractores: string[]
}

/** Palmas: la palabra y su cantidad de sílabas. */
export interface ItemPalmas {
  id: string
  palabra: string
  silabas: number
}

/** Rompe y une: la palabra, sus sílabas en orden (en mayúscula) y las sílabas de relleno. */
export interface ItemRompe {
  id: string
  palabra: string
  silabas: string[]
  relleno: string[]
}

/** Palabras de otro planeta: la pseudopalabra y dos distractores. */
export interface ItemPlaneta {
  id: string
  palabra: string
  distractores: string[]
}

/** Eco de palabras: la palabra que se escucha y se escribe. */
export interface ItemEco {
  id: string
  palabra: string
}

/** Caza errores: la oración y sus errores ({ mal escrita: correcta }). */
export interface ItemCaza {
  id: string
  oracion: string
  errores: Record<string, string>
}

/** Tipo de los ítems de cada juego construido que tiene banco por grado. */
export interface ItemsPorJuego {
  detective: ItemDetective
  rima: ItemRima
  palmas: ItemPalmas
  rompe: ItemRompe
  planeta: ItemPlaneta
  lee: HistoriaLee
  eco: ItemEco
  caza: ItemCaza
}

export type JuegoConBanco = keyof ItemsPorJuego

/** Cualquier ítem de un banco: todos tienen id. */
export interface ItemBanco {
  id: string
  [campo: string]: unknown
}

type BancoPorGrado = Record<string, unknown[]>
type Bancos = Record<string, Partial<Record<Nivel, BancoPorGrado>>>

const BANCOS = datos.bancos as unknown as Bancos
const DIBUJOS = datos.dibujos as Record<string, string>
const EMOJIS = datos.emojis as Record<string, string>

/** Versión del banco (borrador o revisión de las especialistas). */
export const VERSION_BANCOS: string = datos.version

/** Palabras que todavía no tienen dibujo (en el JSON, con la descripción del dibujo a generar). */
export const PALABRAS_SIN_DIBUJO: readonly string[] = Object.keys(datos.a_generar)

/** Los emojis se comparan sin el selector de variante (U+FE0F), que a veces viene y a veces no. */
const sinVariante = (s: string) => s.replace(/️/g, "")
const EMOJIS_NORMALIZADOS = new Map(Object.entries(EMOJIS).map(([k, v]) => [sinVariante(k), v]))

export function tieneDibujo(palabra: string): boolean {
  return Object.prototype.hasOwnProperty.call(DIBUJOS, palabra)
}

/** Ruta pública del dibujo de una palabra, o null si no tiene. */
export function rutaDibujo(palabra: string): string | null {
  return tieneDibujo(palabra) ? DIBUJOS[palabra] : null
}

/** Ruta pública del WebP de un emoji, o null si no está en el mapa. */
export function rutaEmoji(char: string): string | null {
  return EMOJIS_NORMALIZADOS.get(sinVariante(char)) ?? null
}

/** Todas las rutas de dibujos y emojis (para comprobar que los archivos existen). */
export function rutasDeImagenes(): string[] {
  return [...new Set([...Object.values(DIBUJOS), ...Object.values(EMOJIS)])]
}

/**
 * Palabras que se muestran con dibujo en cada juego y nivel. Rima en
 * primario se juega con palabras escritas, sin dibujos.
 */
const PALABRAS_CON_DIBUJO: Partial<Record<CodigoJuego, Partial<Record<Nivel, (item: ItemBanco) => string[]>>>> = {
  detective: {
    inicial: (i) => [i.palabra as string, ...(i.distractores as string[])],
    primario: (i) => [i.palabra as string, ...(i.distractores as string[])],
  },
  rima: {
    inicial: (i) => [i.estimulo as string, i.correcta as string, ...(i.distractores as string[])],
  },
  palmas: {
    inicial: (i) => [i.palabra as string],
  },
  rompe: {
    primario: (i) => [i.palabra as string],
  },
}

/** true si el juego, en ese nivel, muestra las palabras con dibujos. */
export function usaDibujos(juego: CodigoJuego, nivel: Nivel): boolean {
  return Boolean(PALABRAS_CON_DIBUJO[juego]?.[nivel])
}

/** Las palabras de un ítem que se muestran con dibujo (vacío si el juego no usa dibujos). */
export function palabrasConDibujo(juego: CodigoJuego, nivel: Nivel, item: ItemBanco): string[] {
  return PALABRAS_CON_DIBUJO[juego]?.[nivel]?.(item) ?? []
}

/** Los ítems crudos de un grado, sin filtrar (vacío si el juego no tiene banco por grado). */
export function itemsCrudos(juego: CodigoJuego, nivel: Nivel, grado: Grado): ItemBanco[] {
  const lista = BANCOS[juego]?.[nivel]?.[String(grado)]
  return Array.isArray(lista) ? (lista as ItemBanco[]) : []
}

/**
 * Los ítems que se pueden jugar en un juego, nivel y grado. Si el juego usa
 * dibujos, descarta los ítems con alguna palabra sin dibujo.
 */
export function itemsDe<J extends JuegoConBanco>(juego: J, nivel: Nivel, grado: Grado): ItemsPorJuego[J][]
export function itemsDe(juego: CodigoJuego, nivel: Nivel, grado: Grado): ItemBanco[]
export function itemsDe(juego: CodigoJuego, nivel: Nivel, grado: Grado): ItemBanco[] {
  const items = itemsCrudos(juego, nivel, grado)
  return usaDibujos(juego, nivel) ? items.filter((i) => palabrasConDibujo(juego, nivel, i).every(tieneDibujo)) : items
}

/** Mezcla una copia de la lista (Fisher-Yates). `azar` devuelve un número en [0, 1). */
export function mezclar<T>(lista: readonly T[], azar: () => number = Math.random): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Mezcla los ítems y toma `n` sin repetir (o todos, si hay menos). */
export function elegirPartida<T>(items: readonly T[], n: number, azar: () => number = Math.random): T[] {
  return mezclar(items, azar).slice(0, Math.max(0, n))
}
