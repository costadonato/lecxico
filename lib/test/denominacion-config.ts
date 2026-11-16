/**
 * Configuración del bloque "Denominación Rápida" de la evaluación (S9).
 *
 * Formato (definido con las especialistas): una cuadrícula que mezcla
 * letras, números y colores (cuadrados pintados, sin palabras). El niño
 * nombra todos los estímulos en voz alta, lo más rápido que puede, de
 * izquierda a derecha y fila por fila. El profesional inicia y detiene el
 * cronómetro (que no se muestra) y al final carga la cantidad de errores.
 *
 * Estado de los valores:
 * - Confirmados con las especialistas:
 *   · Primario: letras A, E, S, D, P; números 2, 4, 6, 7, 9; colores rojo,
 *     azul, verde, amarillo y negro; 2 cuadrículas de 5 filas × 10 columnas.
 *   · Inicial: solo vocales (A, E, I, O, U) como letras; mismos colores.
 *   · Textos de práctica, consigna y criterio de error.
 * - PROVISORIOS (confirmar con las especialistas):
 *   · Inicial: los números (2, 4, 6, 7, 9) para sala de 4 y 5.
 *   · Inicial: el tamaño de la cuadrícula (4 filas × 6 columnas = 24).
 *
 * Las secuencias son FIJAS (todos los niños ven lo mismo, en el mismo
 * orden). Se generaron una sola vez con un script con semilla y se copiaron
 * acá como literales. Cumplen las reglas que verifica `validarSecuencia`
 * (lib/test/denominacion.ts), probada en denominacion.test.ts:
 * - las categorías siguen siempre el ciclo letra → número → color, de corrido
 *   a lo largo de toda la cuadrícula (también al cambiar de fila);
 * - dentro de cada categoría, cada estímulo aparece una cantidad pareja de
 *   veces (diferencia máxima de 1);
 * - un estímulo no se repite en dos apariciones seguidas de su categoría;
 * - los dos ejercicios de un nivel son distintos.
 */
import type { Nivel } from "@/lib/test/bloques"

export type CategoriaEstimulo = "letra" | "numero" | "color"

/** Orden fijo en que se alternan las categorías en la cuadrícula. */
export const CICLO_CATEGORIAS: readonly CategoriaEstimulo[] = ["letra", "numero", "color"]

export interface Estimulo {
  categoria: CategoriaEstimulo
  /** Lo que se muestra (letra o número) o la clave del color. Único en el nivel. */
  valor: string
  /** Lo que dice el niño ("a", "dos", "rojo"). */
  nombre: string
}

export interface EjercicioDenominacion {
  /** Identificador estable; se guarda en el detalle por ejercicio. */
  id: string
  /** Nombre visible para el profesional. */
  nombre: string
  filas: number
  columnas: number
  /** Valores de los estímulos, de izquierda a derecha y fila por fila. */
  secuencia: readonly Estimulo["valor"][]
}

export interface TextosDenominacion {
  /** Lo que el profesional lee en voz alta en la práctica. */
  practica: string
  /** Nota para el profesional durante la práctica. */
  notaPractica: string
  /** Consigna que el profesional lee antes de comenzar. */
  consigna: string
  /** Qué cuenta como error (se muestra al cargar los errores). */
  criterioError: string
}

export interface ConfigDenominacion {
  /** Estímulos del nivel, por categoría. */
  estimulos: Record<CategoriaEstimulo, readonly Estimulo[]>
  /** Los ejercicios del bloque, en el orden en que se toman. */
  ejercicios: readonly EjercicioDenominacion[]
  /** Fila de práctica: un estímulo de cada categoría. */
  practica: readonly Estimulo["valor"][]
  textos: TextosDenominacion
}

/**
 * Colores de los estímulos: propios, saturados y distinguibles entre sí.
 * No usan los tokens de la interfaz, así no cambian con el tema claro u oscuro.
 */
export const COLORES_ESTIMULO = {
  rojo: "#e11d1d",
  azul: "#1d4ed8",
  verde: "#15803d",
  amarillo: "#facc15",
  negro: "#111111",
} as const

export type ColorEstimulo = keyof typeof COLORES_ESTIMULO

export const TEXTOS_DENOMINACION: TextosDenominacion = {
  practica: "Vamos a jugar con letras, números y colores. Decime el nombre de cada uno.",
  notaPractica: "Si no conoce algún nombre, enseñáselo ahora: es el único momento en que se lo puede corregir.",
  consigna: "Ahora nombrá todos, lo más rápido que puedas y sin equivocarte. Empezá por acá y seguí fila por fila.",
  criterioError: "Cuentan como error las omisiones y los nombres equivocados.",
}

const letra = (valor: string, nombre: string): Estimulo => ({ categoria: "letra", valor, nombre })
const numero = (valor: string, nombre: string): Estimulo => ({ categoria: "numero", valor, nombre })
const color = (valor: ColorEstimulo): Estimulo => ({ categoria: "color", valor, nombre: valor })

const NUMEROS: readonly Estimulo[] = [
  numero("2", "dos"),
  numero("4", "cuatro"),
  numero("6", "seis"),
  numero("7", "siete"),
  numero("9", "nueve"),
]

const COLORES: readonly Estimulo[] = [color("rojo"), color("azul"), color("verde"), color("amarillo"), color("negro")]

export const DENOMINACION_POR_NIVEL: Record<Nivel, ConfigDenominacion> = {
  primario: {
    estimulos: {
      letra: [letra("A", "a"), letra("E", "e"), letra("S", "ese"), letra("D", "de"), letra("P", "pe")],
      numero: NUMEROS,
      color: COLORES,
    },
    practica: ["E", "4", "azul"],
    textos: TEXTOS_DENOMINACION,
    ejercicios: [
      {
        id: "primario-1",
        nombre: "Cuadrícula 1",
        filas: 5,
        columnas: 10,
        // prettier-ignore
        secuencia: [
          "S", "2", "negro", "P", "6", "rojo", "D", "9", "azul", "A",
          "6", "verde", "P", "2", "negro", "E", "4", "verde", "S", "2",
          "amarillo", "E", "7", "rojo", "D", "9", "azul", "S", "2", "verde",
          "A", "7", "azul", "E", "4", "rojo", "P", "9", "negro", "A",
          "7", "amarillo", "D", "6", "verde", "A", "4", "amarillo", "E", "9",
        ],
      },
      {
        id: "primario-2",
        nombre: "Cuadrícula 2",
        filas: 5,
        columnas: 10,
        // prettier-ignore
        secuencia: [
          "D", "4", "azul", "S", "6", "verde", "E", "4", "azul", "P",
          "2", "negro", "D", "9", "amarillo", "E", "6", "verde", "S", "2",
          "negro", "D", "9", "rojo", "A", "7", "amarillo", "S", "9", "negro",
          "P", "7", "verde", "A", "2", "negro", "P", "6", "rojo", "A",
          "4", "amarillo", "E", "7", "azul", "D", "6", "rojo", "S", "7",
        ],
      },
    ],
  },
  inicial: {
    estimulos: {
      letra: [letra("A", "a"), letra("E", "e"), letra("I", "i"), letra("O", "o"), letra("U", "u")],
      numero: NUMEROS, // PROVISORIO
      color: COLORES,
    },
    practica: ["O", "4", "azul"],
    textos: TEXTOS_DENOMINACION,
    // Tamaño PROVISORIO: 4 filas × 6 columnas.
    ejercicios: [
      {
        id: "inicial-1",
        nombre: "Cuadrícula 1",
        filas: 4,
        columnas: 6,
        // prettier-ignore
        secuencia: [
          "A", "6", "amarillo", "E", "4", "negro",
          "U", "7", "rojo", "O", "2", "amarillo",
          "E", "9", "verde", "U", "6", "negro",
          "I", "2", "rojo", "A", "9", "azul",
        ],
      },
      {
        id: "inicial-2",
        nombre: "Cuadrícula 2",
        filas: 4,
        columnas: 6,
        // prettier-ignore
        secuencia: [
          "I", "4", "azul", "A", "9", "verde",
          "I", "2", "amarillo", "O", "7", "azul",
          "U", "9", "amarillo", "E", "6", "verde",
          "A", "2", "rojo", "U", "4", "negro",
        ],
      },
    ],
  },
}

/** Estímulo de `valor` en el nivel de `config` (undefined si no es del nivel). */
export function buscarEstimulo(config: ConfigDenominacion, valor: string): Estimulo | undefined {
  return CICLO_CATEGORIAS.flatMap((c) => config.estimulos[c]).find((e) => e.valor === valor)
}
