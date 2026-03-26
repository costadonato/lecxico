/**
 * Motor de Carrera Educativa - Reutilizable para Lectura y Matemática
 * Replica la mecánica exacta del video de referencia
 */

import { shuffle } from "./shuffle-utils"

// Tipos de desafío
export type ChallengeType = "reading" | "math"

// Interfaz base para un desafío
export interface Challenge {
  id: string
  prompt: string // Lo que se muestra al usuario (palabra, frase, operación)
  correctAnswer: string // Respuesta correcta
  wrongAnswers: string[] // Respuestas incorrectas
  hint?: string // Pista opcional
}

// Configuración del juego
export interface RaceConfig {
  type: ChallengeType
  title: string
  totalSteps: number // Cantidad de pasos en la pista
  challenges: Challenge[]
}

// Estado del juego
export interface RaceState {
  currentStep: number
  currentChallengeIndex: number
  correctAnswers: number
  incorrectAnswers: number
  isComplete: boolean
  shuffledOptions: string[]
}

// Función para mezclar opciones en cada ronda
export function getShuffledOptions(challenge: Challenge): string[] {
  const allOptions = [challenge.correctAnswer, ...challenge.wrongAnswers]
  return shuffle(allOptions)
}

// Contenido de Lectura
export const readingChallenges: Challenge[] = [
  // Nivel 1: Palabras simples (3-4 letras)
  { id: "r1", prompt: "SOL", correctAnswer: "SOL", wrongAnswers: ["SAL", "SIL", "SUL"], hint: "Brilla en el cielo" },
  { id: "r2", prompt: "CASA", correctAnswer: "CASA", wrongAnswers: ["COSA", "CASA", "MASA"], hint: "Donde vivimos" },
  { id: "r3", prompt: "LUNA", correctAnswer: "LUNA", wrongAnswers: ["LANA", "LONA", "CUNA"], hint: "Sale de noche" },
  { id: "r4", prompt: "PATO", correctAnswer: "PATO", wrongAnswers: ["PATA", "PITO", "PETO"], hint: "Animal que nada" },
  { id: "r5", prompt: "MANO", correctAnswer: "MANO", wrongAnswers: ["MONO", "MENO", "MINO"], hint: "Parte del cuerpo" },

  // Nivel 2: Palabras medianas (5-6 letras)
  {
    id: "r6",
    prompt: "PERRO",
    correctAnswer: "PERRO",
    wrongAnswers: ["PERRA", "FERRO", "CERRO"],
    hint: "Mascota fiel",
  },
  { id: "r7", prompt: "LIBRO", correctAnswer: "LIBRO", wrongAnswers: ["LIBRE", "LIEBRE", "LIBRA"], hint: "Lo leemos" },
  { id: "r8", prompt: "AMIGO", correctAnswer: "AMIGO", wrongAnswers: ["AMIGA", "AMAGO", "ABRIGO"], hint: "Compañero" },

  // Nivel 3: Frases cortas
  {
    id: "r9",
    prompt: "EL GATO DUERME",
    correctAnswer: "EL GATO DUERME",
    wrongAnswers: ["EL GATO CORRE", "EL PATO DUERME", "LA GATA DUERME"],
    hint: "El felino descansa",
  },
  {
    id: "r10",
    prompt: "LA NIÑA JUEGA",
    correctAnswer: "LA NIÑA JUEGA",
    wrongAnswers: ["EL NIÑO JUEGA", "LA NIÑA CANTA", "LA NIÑA SALTA"],
    hint: "La pequeña se divierte",
  },
]

// Contenido de Matemática
export const mathChallenges: Challenge[] = [
  // Nivel 1: Reconocimiento de números
  {
    id: "m1",
    prompt: "¿Cuánto es 2 + 1?",
    correctAnswer: "3",
    wrongAnswers: ["2", "4", "1"],
    hint: "Suma dos más uno",
  },
  {
    id: "m2",
    prompt: "¿Cuánto es 3 + 2?",
    correctAnswer: "5",
    wrongAnswers: ["4", "6", "3"],
    hint: "Suma tres más dos",
  },
  {
    id: "m3",
    prompt: "¿Cuánto es 4 + 1?",
    correctAnswer: "5",
    wrongAnswers: ["4", "6", "3"],
    hint: "Suma cuatro más uno",
  },
  {
    id: "m4",
    prompt: "¿Cuánto es 5 - 2?",
    correctAnswer: "3",
    wrongAnswers: ["2", "4", "5"],
    hint: "Resta dos a cinco",
  },
  {
    id: "m5",
    prompt: "¿Cuánto es 6 - 3?",
    correctAnswer: "3",
    wrongAnswers: ["2", "4", "6"],
    hint: "Resta tres a seis",
  },

  // Nivel 2: Operaciones medianas
  {
    id: "m6",
    prompt: "¿Cuánto es 7 + 3?",
    correctAnswer: "10",
    wrongAnswers: ["9", "11", "8"],
    hint: "Suma siete más tres",
  },
  {
    id: "m7",
    prompt: "¿Cuánto es 8 - 4?",
    correctAnswer: "4",
    wrongAnswers: ["3", "5", "6"],
    hint: "Resta cuatro a ocho",
  },
  {
    id: "m8",
    prompt: "¿Cuánto es 5 + 5?",
    correctAnswer: "10",
    wrongAnswers: ["8", "9", "11"],
    hint: "Suma cinco más cinco",
  },

  // Nivel 3: Un poco más difícil
  {
    id: "m9",
    prompt: "¿Cuánto es 9 - 5?",
    correctAnswer: "4",
    wrongAnswers: ["3", "5", "6"],
    hint: "Resta cinco a nueve",
  },
  {
    id: "m10",
    prompt: "¿Cuánto es 6 + 4?",
    correctAnswer: "10",
    wrongAnswers: ["9", "11", "8"],
    hint: "Suma seis más cuatro",
  },
]

// Configuraciones predefinidas
export const readingRaceConfig: RaceConfig = {
  type: "reading",
  title: "Carrera de Lectura",
  totalSteps: 10,
  challenges: readingChallenges,
}

export const mathRaceConfig: RaceConfig = {
  type: "math",
  title: "Carrera de Matemática",
  totalSteps: 10,
  challenges: mathChallenges,
}
