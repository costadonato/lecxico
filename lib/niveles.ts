/*
 * Escala de colores de los porcentajes de acierto (tokens --nivel-* de
 * globals.css). Mismos cortes que usaba la app: 80 / 60 / 40.
 */

export type NivelPorcentaje = "alto" | "medio" | "bajo" | "critico"

export function nivelDePorcentaje(pct: number): NivelPorcentaje {
  return pct >= 80 ? "alto" : pct >= 60 ? "medio" : pct >= 40 ? "bajo" : "critico"
}

/**
 * barra: relleno; trazo: borde de un SVG (anillos); texto: número (AA sobre
 * tarjeta y sobre `suave`); suave: fondo de chip. Las clases van completas
 * para que Tailwind las encuentre.
 */
export const ESTILO_NIVEL: Record<NivelPorcentaje, { barra: string; trazo: string; texto: string; suave: string }> = {
  alto: { barra: "bg-nivel-alto", trazo: "stroke-nivel-alto", texto: "text-nivel-alto-texto", suave: "bg-menta-suave" },
  medio: { barra: "bg-nivel-medio", trazo: "stroke-nivel-medio", texto: "text-nivel-medio-texto", suave: "bg-sol-suave" },
  bajo: { barra: "bg-nivel-bajo", trazo: "stroke-nivel-bajo", texto: "text-nivel-bajo-texto", suave: "bg-mandarina-suave" },
  critico: { barra: "bg-nivel-critico", trazo: "stroke-nivel-critico", texto: "text-nivel-critico-texto", suave: "bg-rojo-suave" },
}

export const estiloNivel = (pct: number) => ESTILO_NIVEL[nivelDePorcentaje(pct)]
