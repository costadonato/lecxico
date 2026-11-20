import type { BloqueCodigo } from "@/lib/test/bloques"

/**
 * Color de cada bloque en el entrenamiento, siempre el mismo (tokens de
 * app/globals.css). Los bloques de color base usan el `-suave` de fondo y
 * el `-fuerte` de texto. Los de color `-fuerte` (reconocimiento visual,
 * pseudopalabras y denominación) usan el `-fuerte` de fondo con texto
 * blanco (contraste AA) para distinguirse de los de su mismo color.
 *
 * Las clases van completas para que Tailwind las encuentre.
 */
export interface EstiloBloque {
  /** Chip con el nombre del bloque. */
  chip: string
  /** Zona ilustrada de la tarjeta (detrás del icono). */
  zona: string
  /** Fondo suave (secciones, contenedores). */
  suave: string
  /** Texto e íconos sobre fondo claro. */
  texto: string
  /** Borde y anillos. */
  borde: string
}

const base = (c: string): EstiloBloque => ESTILOS_BASE[c]
const ESTILOS_BASE: Record<string, EstiloBloque> = {
  celeste: { chip: "bg-celeste-suave text-celeste-fuerte", zona: "bg-celeste", suave: "bg-celeste-suave", texto: "text-celeste-fuerte", borde: "border-celeste" },
  lavanda: { chip: "bg-lavanda-suave text-lavanda-fuerte", zona: "bg-lavanda", suave: "bg-lavanda-suave", texto: "text-lavanda-fuerte", borde: "border-lavanda" },
  mandarina: { chip: "bg-mandarina-suave text-mandarina-fuerte", zona: "bg-mandarina", suave: "bg-mandarina-suave", texto: "text-mandarina-fuerte", borde: "border-mandarina" },
  menta: { chip: "bg-menta-suave text-menta-fuerte", zona: "bg-menta", suave: "bg-menta-suave", texto: "text-menta-fuerte", borde: "border-menta" },
  sol: { chip: "bg-sol-suave text-sol-fuerte", zona: "bg-sol", suave: "bg-sol-suave", texto: "text-sol-fuerte", borde: "border-sol" },
  rojo: { chip: "bg-rojo-suave text-rojo-fuerte", zona: "bg-rojo", suave: "bg-rojo-suave", texto: "text-rojo-fuerte", borde: "border-rojo" },
  "celeste-fuerte": { chip: "bg-celeste-fuerte text-white", zona: "bg-celeste-fuerte", suave: "bg-celeste-suave", texto: "text-celeste-fuerte", borde: "border-celeste-fuerte" },
  "lavanda-fuerte": { chip: "bg-lavanda-fuerte text-white", zona: "bg-lavanda-fuerte", suave: "bg-lavanda-suave", texto: "text-lavanda-fuerte", borde: "border-lavanda-fuerte" },
  "sol-fuerte": { chip: "bg-sol-fuerte text-white", zona: "bg-sol-fuerte", suave: "bg-sol-suave", texto: "text-sol-fuerte", borde: "border-sol-fuerte" },
}

export const COLOR_BLOQUE: Record<BloqueCodigo, EstiloBloque> = {
  discriminacion_auditiva: base("celeste"),
  conciencia_fonologica: base("lavanda"),
  conciencia_silabica: base("mandarina"),
  memoria_fonologica: base("menta"),
  comprension_lectora: base("sol"),
  correspondencia_sonido_letra: base("rojo"),
  reconocimiento_visual: base("celeste-fuerte"),
  lectura_pseudopalabras: base("lavanda-fuerte"),
  denominacion_rapida: base("sol-fuerte"),
}
