/**
 * Bloques del test de indicadores y su relación con el nivel.
 * Los códigos y la lógica de nivel son espejo de
 * supabase/migrations/0001_slice1_esquema_rls.sql.
 */

export type Nivel = "inicial" | "primario"

export type EtapaEscolar = "sala_4" | "sala_5" | "primero" | "segundo" | "tercero"

/** Etapas escolares en orden, con su texto visible (ninos_etapa_escolar_check). */
export const ETAPAS_ESCOLARES: readonly { valor: EtapaEscolar; label: string }[] = [
  { valor: "sala_4", label: "Sala de 4" },
  { valor: "sala_5", label: "Sala de 5" },
  { valor: "primero", label: "1er grado" },
  { valor: "segundo", label: "2do grado" },
  { valor: "tercero", label: "3er grado" },
]

export const BLOQUE_CODIGOS = [
  "discriminacion_auditiva",
  "conciencia_fonologica",
  "conciencia_silabica",
  "memoria_fonologica",
  "denominacion_rapida",
  "comprension_lectora",
  "correspondencia_sonido_letra",
  "reconocimiento_visual",
  "lectura_pseudopalabras",
] as const

export type BloqueCodigo = (typeof BLOQUE_CODIGOS)[number]

/** Espejo de la función SQL nivel_para_etapa(). */
export function nivelParaEtapa(etapa: EtapaEscolar): Nivel {
  return etapa === "sala_4" || etapa === "sala_5" ? "inicial" : "primario"
}

/**
 * Bloques de cada test, en orden. La posición + 1 es el `id` de las
 * constantes BLOCKS de app/test/inicial y app/test/primaria.
 */
export const BLOQUES_POR_NIVEL: Record<Nivel, readonly BloqueCodigo[]> = {
  inicial: [
    "discriminacion_auditiva",
    "conciencia_fonologica",
    "conciencia_silabica",
    "memoria_fonologica", // se muestra como "Memoria Auditiva"
    "denominacion_rapida",
  ],
  primario: [
    "discriminacion_auditiva",
    "conciencia_fonologica",
    "conciencia_silabica",
    "memoria_fonologica", // se muestra como "Memoria Auditiva"
    "comprension_lectora",
    "correspondencia_sonido_letra",
    "reconocimiento_visual",
    "lectura_pseudopalabras",
  ],
}

/** Código del bloque `orden` (1-based, = id en BLOCKS) del test `nivel`. */
export function bloqueCodigoPorOrden(nivel: Nivel, orden: number): BloqueCodigo {
  const codigo = BLOQUES_POR_NIVEL[nivel][orden - 1]
  if (!codigo) throw new Error(`El test ${nivel} no tiene un bloque ${orden}`)
  return codigo
}

/** Nombre visible de cada bloque (igual al que muestran las pantallas del test). */
export const BLOQUE_NOMBRES: Record<BloqueCodigo, string> = {
  discriminacion_auditiva: "Discriminación Auditiva",
  conciencia_fonologica: "Conciencia Fonológica",
  conciencia_silabica: "Conciencia Silábica",
  memoria_fonologica: "Memoria Auditiva",
  denominacion_rapida: "Denominación Rápida",
  comprension_lectora: "Comprensión Lectora",
  correspondencia_sonido_letra: "Correspondencia Sonido-Letra",
  reconocimiento_visual: "Reconocimiento Visual",
  lectura_pseudopalabras: "Lectura de Pseudopalabras",
}
