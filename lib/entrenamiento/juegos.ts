/*
 * CATÁLOGO DE JUEGOS DEL ENTRENAMIENTO
 * ------------------------------------------------------------------
 * Fuente: docs/banco-entrenamientos.md y la validación con las
 * especialistas del 19/11/2026 (docs/validacion-mockup-entrenamientos.md
 * en el proyecto). Los códigos coinciden con la tabla
 * entrenamiento_juego de la migración 0008: si se agrega un juego, va en
 * los dos lados (lo controla lib/entrenamiento/juegos.test.ts).
 *
 * El contenido de cada juego (palabras, oraciones, historias) está en
 * lib/entrenamiento/bancos.json, que se exporta de la planilla revisada
 * por las especialistas. Acá va solo la ficha: nivel, bloque, tamaño de
 * la partida, consigna y qué cambia entre grados.
 */

import type { BloqueCodigo, Nivel } from "@/lib/test/bloques"

export type { Nivel }
export type Grado = 1 | 2 | 3
export type Origen = "consulta" | "tarea" | "practica"

export type CodigoJuego =
  | "detective"
  | "rima"
  | "palmas"
  | "memotono"
  | "rompe"
  | "planeta"
  | "nombra"
  | "tocalo"
  | "lee"
  | "eco"
  | "caza"
  | "memopalabras"
  | "ojo_lince"
  | "lluvia"

export interface FichaNivel {
  bloque: BloqueCodigo
  rol: "principal" | "complementario"
  /** Cantidad de ítems (rondas) de una partida, por grado. */
  partida: Record<Grado, number>
  /** Qué es una ronda, en plural ("palabras", "secuencias"). */
  unidad: string
  /** Qué cambia en cada grado, para el profesional. */
  grados: Record<Grado, string>
  consigna: string
}

export interface FichaJuego {
  codigo: CodigoJuego
  nombre: string
  /** Emoji de la tarjeta (se dibuja con Fluent, ver lib/entrenamiento/dibujos.ts). */
  icono: string
  /** Personaje que acompaña el juego. */
  personaje: "lex" | "lumo"
  soloConsulta: boolean
  niveles: Partial<Record<Nivel, FichaNivel>>
}

const g = (a: number, b: number, c: number): Record<Grado, number> => ({ 1: a, 2: b, 3: c })

export const JUEGOS: Record<CodigoJuego, FichaJuego> = {
  detective: {
    codigo: "detective",
    nombre: "Detective de sonidos",
    icono: "🕵️",
    personaje: "lumo",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "discriminacion_auditiva",
        rol: "principal",
        partida: g(8, 8, 8),
        unidad: "palabras",
        consigna: "Escuchá la palabra que dice Lumo y tocá su dibujo.",
        grados: {
          1: "Dibujos con nombres muy distintos",
          2: "Los nombres empiezan igual",
          3: "Cambia un solo sonido (bota, gota)",
        },
      },
      primario: {
        bloque: "discriminacion_auditiva",
        rol: "principal",
        partida: g(8, 8, 8),
        unidad: "palabras",
        consigna: "Escuchá la palabra que dice Lumo y tocá su dibujo.",
        grados: {
          1: "Los nombres comparten sílabas",
          2: "Cambia el primer sonido (boca, foca)",
          3: "Cambia un sonido del medio (mono, moño)",
        },
      },
    },
  },
  rima: {
    codigo: "rima",
    nombre: "Rima",
    icono: "🎶",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "conciencia_fonologica",
        rol: "principal",
        partida: g(8, 8, 8),
        unidad: "palabras",
        consigna: "Escuchá la palabra y tocá el dibujo que rima con ella.",
        grados: {
          1: "Las otras opciones no se parecen",
          2: "Una opción empieza igual",
          3: "Las otras opciones terminan parecido pero no riman",
        },
      },
      primario: {
        bloque: "conciencia_fonologica",
        rol: "principal",
        partida: g(8, 8, 8),
        unidad: "palabras",
        consigna: "Leé la palabra y tocá la que rima con ella.",
        grados: {
          1: "Con audio; las otras opciones no se parecen",
          2: "Sin audio; una opción empieza igual",
          3: "Sin audio; las otras terminan parecido pero no riman",
        },
      },
    },
  },
  palmas: {
    codigo: "palmas",
    nombre: "Palmas",
    icono: "🥁",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "conciencia_silabica",
        rol: "principal",
        partida: g(8, 8, 8),
        unidad: "palabras",
        consigna: "Escuchá la palabra y tocá el tambor una vez por cada sílaba. Después tocá «Listo».",
        grados: { 1: "Palabras de 1 y 2 sílabas", 2: "Palabras de 2 y 3 sílabas", 3: "Palabras de 3 y 4 sílabas" },
      },
    },
  },
  memotono: {
    codigo: "memotono",
    nombre: "Memotono",
    icono: "🎧",
    personaje: "lumo",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "memoria_fonologica",
        rol: "principal",
        partida: g(6, 6, 6),
        unidad: "secuencias",
        consigna: "Escuchá lo que dice Lumo y después tocá los dibujos en el mismo orden.",
        grados: {
          1: "2 elementos, 2 distractores distintos, se escucha 3 veces",
          2: "3 elementos, 3 distractores (uno suena parecido), se escucha 2 veces",
          3: "4 elementos, 4 distractores que suenan parecido, se escucha 2 veces",
        },
      },
      primario: {
        bloque: "memoria_fonologica",
        rol: "principal",
        partida: g(6, 6, 6),
        unidad: "secuencias",
        consigna: "Escuchá lo que dice Lumo y después tocá los dibujos en el mismo orden.",
        grados: {
          1: "3 palabras, 2 distractores distintos, se escucha 3 veces",
          2: "4 palabras, 3 distractores (uno suena parecido), se escucha 2 veces",
          3: "5 palabras, 4 distractores que suenan parecido, se escucha 2 veces",
        },
      },
    },
  },
  rompe: {
    codigo: "rompe",
    nombre: "Rompe y une",
    icono: "🧩",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      primario: {
        bloque: "conciencia_silabica",
        rol: "principal",
        partida: g(8, 8, 10),
        unidad: "palabras",
        consigna: "Armá la palabra: tocá cada sílaba en orden, o arrastrala a su casillero.",
        grados: {
          1: "2 o 3 sílabas directas, 1 sílaba de relleno",
          2: "3 o 4 sílabas con alguna trabada, 2 de relleno",
          3: "4 o 5 sílabas, 3 de relleno parecidas",
        },
      },
    },
  },
  planeta: {
    codigo: "planeta",
    nombre: "Palabras de otro planeta",
    icono: "🪐",
    personaje: "lumo",
    soloConsulta: false,
    niveles: {
      primario: {
        bloque: "lectura_pseudopalabras",
        rol: "principal",
        partida: g(8, 8, 8),
        unidad: "palabras",
        consigna: "Lex y Lumo encontraron palabras de otro planeta. Leé la palabra y elegí el audio que la dice bien.",
        grados: {
          1: "2 sílabas directas; los audios cambian una sílaba",
          2: "3 sílabas con una trabada; los audios cambian una letra",
          3: "3 o 4 sílabas con trabadas; inversiones y letras espejo",
        },
      },
    },
  },
  nombra: {
    codigo: "nombra",
    nombre: "Nombrá rápido",
    icono: "⏱️",
    personaje: "lumo",
    soloConsulta: true,
    niveles: {
      inicial: {
        bloque: "denominacion_rapida",
        rol: "principal",
        partida: g(2, 2, 2),
        unidad: "cuadrículas",
        consigna: "Nombrá en voz alta todo lo que ves, lo más rápido que puedas, fila por fila.",
        grados: { 1: "Colores, 3 × 4", 2: "Colores y vocales, 4 × 5", 3: "Colores, vocales y dibujos, 4 × 6" },
      },
      primario: {
        bloque: "denominacion_rapida",
        rol: "principal",
        partida: g(2, 2, 2),
        unidad: "cuadrículas",
        consigna: "Nombrá en voz alta todo lo que ves, lo más rápido que puedas, fila por fila.",
        grados: { 1: "Letras, 4 × 5", 2: "Letras y números, 5 × 6", 3: "Letras, números y colores, 5 × 8" },
      },
    },
  },
  tocalo: {
    codigo: "tocalo",
    nombre: "¡Rápido, tocalo!",
    icono: "⚡",
    personaje: "lumo",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "denominacion_rapida",
        rol: "principal",
        partida: g(12, 12, 12),
        unidad: "estímulos",
        consigna: "Lumo va a nombrar algo de la cuadrícula. Tocalo lo más rápido que puedas.",
        grados: {
          1: "Colores, 2 × 2, sin tiempo límite",
          2: "Colores y vocales, 2 × 3, 4 s por estímulo",
          3: "Colores, vocales y dibujos, 3 × 3, 3 s por estímulo",
        },
      },
      primario: {
        bloque: "denominacion_rapida",
        rol: "principal",
        partida: g(20, 20, 20),
        unidad: "estímulos",
        consigna: "Lumo va a nombrar algo de la cuadrícula. Tocalo lo más rápido que puedas.",
        grados: {
          1: "Letras, 2 × 3, sin tiempo límite",
          2: "Letras y números, 3 × 3, 3 s por estímulo",
          3: "Letras, números y colores, 3 × 4, 2 s por estímulo",
        },
      },
    },
  },
  lee: {
    codigo: "lee",
    nombre: "Leé y descubrí",
    icono: "📖",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      primario: {
        bloque: "comprension_lectora",
        rol: "principal",
        partida: g(2, 2, 2),
        unidad: "historias",
        consigna: "Leé la historia con calma. Cuando termines, tocá «Ya la leí» y respondé las preguntas.",
        grados: {
          1: "Un párrafo, 3 preguntas",
          2: "2 párrafos, 3 preguntas (qué pasó primero)",
          3: "3 párrafos, 4 preguntas (una de pensar por qué)",
        },
      },
    },
  },
  eco: {
    codigo: "eco",
    nombre: "Eco de palabras",
    icono: "✍️",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      primario: {
        bloque: "correspondencia_sonido_letra",
        rol: "principal",
        partida: g(5, 5, 5),
        unidad: "palabras",
        consigna: "Escuchá la palabra y escribila con el teclado de la pantalla.",
        grados: {
          1: "2 sílabas con una trabada o 3 simples",
          2: "3 sílabas con una trabada o 4 simples",
          3: "4 sílabas con una trabada o 5 simples",
        },
      },
    },
  },
  caza: {
    codigo: "caza",
    nombre: "Caza errores",
    icono: "🔎",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      primario: {
        bloque: "reconocimiento_visual",
        rol: "principal",
        partida: g(5, 5, 5),
        unidad: "oraciones",
        consigna: "Leé la oración y tocá las palabras que están mal escritas. Después tocá «Listo».",
        grados: {
          1: "Oraciones cortas, 1 error evidente",
          2: "6 a 9 palabras, 1 o 2 errores (inversiones y letras espejo)",
          3: "9 a 12 palabras, 2 errores sutiles",
        },
      },
    },
  },
  memopalabras: {
    codigo: "memopalabras",
    nombre: "Memopalabras",
    icono: "👀",
    personaje: "lumo",
    soloConsulta: false,
    niveles: {
      primario: {
        bloque: "reconocimiento_visual",
        rol: "complementario",
        partida: g(6, 6, 4),
        unidad: "conjuntos",
        consigna: "Leé las palabras y tocá «Ya las leí». Después marcá las que viste y tocá «Finalizar».",
        grados: {
          1: "3 palabras de 2 sílabas, distractores distintos",
          2: "4 palabras de 3 sílabas, distractores que empiezan igual",
          3: "5 palabras de 4 sílabas, distractores con una letra cambiada",
        },
      },
    },
  },
  ojo_lince: {
    codigo: "ojo_lince",
    nombre: "Ojo de lince",
    icono: "🔍",
    personaje: "lex",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "denominacion_rapida",
        rol: "complementario",
        partida: g(3, 3, 3),
        unidad: "cuadrículas",
        consigna: "Tocá todos los que son iguales al de la muestra. Después tocá «Finalizar».",
        grados: { 1: "Cuadrícula de 3 × 3", 2: "Cuadrícula de 3 × 4", 3: "Cuadrícula de 4 × 4" },
      },
      primario: {
        bloque: "correspondencia_sonido_letra",
        rol: "complementario",
        partida: g(3, 3, 3),
        unidad: "cuadrículas",
        consigna: "Tocá todas las letras que dice Lumo. Después tocá «Finalizar».",
        grados: {
          1: "5 × 5; la letra se ve y se escucha; distractores de forma distinta",
          2: "6 × 6; solo se escucha; distractores de forma parecida",
          3: "7 × 7; solo se escucha; letras espejo (b, d, p, q)",
        },
      },
    },
  },
  lluvia: {
    codigo: "lluvia",
    nombre: "Lluvia",
    icono: "🌧️",
    personaje: "lumo",
    soloConsulta: false,
    niveles: {
      inicial: {
        bloque: "denominacion_rapida",
        rol: "complementario",
        partida: g(3, 3, 3),
        unidad: "lluvias de 30 segundos",
        consigna: "Tocá solo los que son iguales a la muestra antes de que lleguen abajo.",
        grados: {
          1: "Distractores muy distintos",
          2: "Distractores de la misma categoría y más cantidad",
          3: "Distractores parecidos y caída más rápida",
        },
      },
      primario: {
        bloque: "reconocimiento_visual",
        rol: "complementario",
        partida: g(3, 3, 3),
        unidad: "lluvias de 30 segundos",
        consigna: "Tocá solo la palabra de la muestra antes de que llegue abajo.",
        grados: {
          1: "Distractores distintos",
          2: "Distractores que comparten sílabas",
          3: "Distractores con una letra cambiada o invertida; dos palabras para buscar",
        },
      },
    },
  },
}

/** Los juegos de un nivel, en el orden de los bloques de la evaluación y con el principal primero. */
export function juegosDelNivel(nivel: Nivel, opciones: { incluirSoloConsulta: boolean }): FichaJuego[] {
  return Object.values(JUEGOS).filter((j) => j.niveles[nivel] && (opciones.incluirSoloConsulta || !j.soloConsulta))
}

/** Porcentaje entero de una partida, igual que la columna generada de la base. */
export function porcentaje(correctas: number, total: number): number {
  return Math.round((100 * correctas) / total)
}

/** Grado habilitado después de una partida (misma regla que grados_habilitados en la 0008). */
export function gradoTrasPartida(habilitado: Grado, jugado: Grado, pct: number, enMision: boolean): Grado {
  if (enMision || pct < 80) return habilitado
  return Math.min(3, Math.max(habilitado, jugado + 1)) as Grado
}
