/*
 * MAPA CENTRAL DE PERSONAJES Y POSES
 * ------------------------------------------------------------------
 * Cada pose es una imagen con fondo transparente. <Personaje> la toma de
 * acá por nombre: <Personaje personaje="lex" pose="volando" />.
 *
 * Para agregar una pose nueva:
 *   1. Guardá la imagen en WebP con fondo transparente en
 *      public/images/personajes/ (por ejemplo lex-festejando.webp).
 *   2. Agregá una línea en las poses del personaje:
 *        festejando: { src: "/images/personajes/lex-festejando.webp", ancho: 800, alto: 960, alt: "Lex festejando con los brazos en alto" },
 *      Listo: la pose ya se puede usar y TypeScript la autocompleta.
 *
 * `encuadre` (opcional) es la caja del personaje dentro de la imagen, en
 * píxeles. Solo hace falta si la imagen tiene mucho margen transparente
 * alrededor: así el personaje ocupa todo el espacio que se le da. Si la
 * imagen ya viene recortada, no se pone.
 *
 * `cara` (opcional) es el centro y el diámetro de la cara, en píxeles; la usa
 * <CaraPersonaje> para los avatares redondos.
 *
 * Las animaciones (flotar, saltar, saludar…) están en
 * components/personajes/animaciones.ts y se combinan con cualquier pose.
 */

export interface Pose {
  src: string
  /** Tamaño real de la imagen, en píxeles. */
  ancho: number
  alto: number
  /** Texto alternativo. */
  alt: string
  encuadre?: { x: number; y: number; ancho: number; alto: number }
  cara?: { x: number; y: number; diametro: number }
}

const POSES_LEX = {
  volando: {
    src: "/images/lex.webp",
    ancho: 1024,
    alto: 1024,
    alt: "Lex, un niño superhéroe con traje rojo, capa blanca y birrete, volando y señalando hacia arriba",
    encuadre: { x: 163, y: 102, ancho: 711, alto: 866 },
    cara: { x: 432, y: 305, diametro: 350 },
  },
  explicando: {
    src: "/images/personajes/lex-explicando.webp",
    ancho: 815,
    alto: 1182,
    alt: "Lex, el niño superhéroe de traje rojo, señalando hacia un costado como si mostrara algo",
    cara: { x: 318, y: 283, diametro: 364 },
  },
  festejando: {
    src: "/images/personajes/lex-festejando.webp",
    ancho: 910,
    alto: 1173,
    alt: "Lex, el niño superhéroe de traje rojo, saltando de alegría con los brazos en alto",
    cara: { x: 384, y: 302, diametro: 363 },
  },
  alentando: {
    src: "/images/personajes/lex-alentando.webp",
    ancho: 823,
    alto: 1151,
    alt: "Lex, el niño superhéroe de traje rojo, sonriendo con el pulgar arriba",
    cara: { x: 298, y: 304, diametro: 418 },
  },
  pensando: {
    src: "/images/personajes/lex-pensando.webp",
    ancho: 712,
    alto: 1169,
    alt: "Lex, el niño superhéroe de traje rojo, pensando con una mano en el mentón",
    cara: { x: 286, y: 268, diametro: 380 },
  },
} satisfies Record<string, Pose>

const POSES_LUMO = {
  holograma: {
    src: "/images/lumo.webp",
    ancho: 1024,
    alto: 1024,
    alt: "Lumo, un robot rojo con pantalla en la cara, saludando junto a una pantalla holográfica",
    encuadre: { x: 290, y: 116, ancho: 545, alto: 807 },
    cara: { x: 478, y: 282, diametro: 290 },
  },
  explicando: {
    src: "/images/personajes/lumo-explicando.webp",
    ancho: 789,
    alto: 1046,
    alt: "Lumo, el robot rojo, señalando hacia un costado como si mostrara algo",
    cara: { x: 300, y: 156, diametro: 411 },
  },
  festejando: {
    src: "/images/personajes/lumo-festejando.webp",
    ancho: 761,
    alto: 931,
    alt: "Lumo, el robot rojo, saltando de alegría con los brazos en alto",
    cara: { x: 410, y: 158, diametro: 375 },
  },
  alentando: {
    src: "/images/personajes/lumo-alentando.webp",
    ancho: 647,
    alto: 1052,
    alt: "Lumo, el robot rojo, sonriendo con el pulgar arriba",
    cara: { x: 290, y: 150, diametro: 376 },
  },
  pensando: {
    src: "/images/personajes/lumo-pensando.webp",
    ancho: 437,
    alto: 1021,
    alt: "Lumo, el robot rojo, pensando con una mano en el mentón y tres puntitos en la pantalla",
    cara: { x: 240, y: 146, diametro: 372 },
  },
} satisfies Record<string, Pose>

export const PERSONAJES = {
  lex: {
    nombre: "Lex",
    poses: POSES_LEX,
    poseInicial: "volando",
    /** Voz al leer el globo en voz alta (tono y velocidad de speechSynthesis). */
    voz: { tono: 1.2, velocidad: 0.9 },
  },
  lumo: {
    nombre: "Lumo",
    poses: POSES_LUMO,
    poseInicial: "holograma",
    voz: { tono: 0.85, velocidad: 0.95 },
  },
} as const

export type NombrePersonaje = keyof typeof PERSONAJES
export type PoseDe<P extends NombrePersonaje> = Extract<keyof (typeof PERSONAJES)[P]["poses"], string>

/**
 * Cuántas caras entran en el ancho de la imagen (recortada por su encuadre).
 * Con el ancho = diámetro de cara × esto, todas las poses quedan a la misma
 * escala. Null si la pose no tiene `cara`.
 */
export function anchoPorCara(pose: Pose): number | null {
  if (!pose.cara) return null
  return (pose.encuadre?.ancho ?? pose.ancho) / pose.cara.diametro
}

export function obtenerPose<P extends NombrePersonaje>(personaje: P, pose?: PoseDe<P>): Pose {
  const datos = PERSONAJES[personaje]
  const poses = datos.poses as Record<string, Pose>
  return poses[pose ?? datos.poseInicial] ?? poses[datos.poseInicial]
}
