// Exercise types and data structures
export type ExerciseType =
  | "letter-recognition"
  | "word-formation"
  | "reading-comprehension"
  | "speed-reading"
  | "vocabulary"
  | "syllable-segmentation"
  | "word-rain"
  | "dictation"
  | "fill-blanks"
  | "memory-sequence"
  | "letter-search"
  | "error-hunt"
  | "weekly-mission"

export interface Exercise {
  id: string
  title: string
  type: ExerciseType
  difficulty: "Fácil" | "Medio" | "Avanzado"
  xp: number
  duration?: string
  category: string
  ageGroup: "child" | "teen" | "both"
  locked?: boolean
  description?: string
}

// Mock exercises database
export const exercises: Exercise[] = [
  {
    id: "1",
    title: "Encuentra las Letras",
    type: "letter-recognition",
    difficulty: "Fácil",
    xp: 50,
    duration: "5 min",
    category: "Reconocimiento",
    ageGroup: "child",
  },
  {
    id: "2",
    title: "Palabras Mágicas",
    type: "word-formation",
    difficulty: "Fácil",
    xp: 50,
    duration: "10 min",
    category: "Formación",
    ageGroup: "child",
  },
  {
    id: "3",
    title: "Comprensión de Lectura",
    type: "reading-comprehension",
    difficulty: "Medio",
    xp: 100,
    duration: "15 min",
    category: "Comprensión",
    ageGroup: "both",
  },
  {
    id: "4",
    title: "Velocidad Lectora",
    type: "speed-reading",
    difficulty: "Medio",
    xp: 150,
    duration: "10 min",
    category: "Fluidez",
    ageGroup: "teen",
  },
  {
    id: "5",
    title: "Vocabulario Contextual",
    type: "vocabulary",
    difficulty: "Avanzado",
    xp: 200,
    duration: "20 min",
    category: "Vocabulario",
    ageGroup: "teen",
  },
  {
    id: "cf-001",
    title: "Rompe y Une",
    type: "syllable-segmentation",
    difficulty: "Fácil",
    xp: 50,
    duration: "3 min",
    category: "Conciencia Fonológica",
    ageGroup: "child",
    description: "Arrastra bloques silábicos para formar palabras",
  },
  {
    id: "rv-002",
    title: "Lluvia de Palabras",
    type: "word-rain",
    difficulty: "Medio",
    xp: 100,
    duration: "2 min",
    category: "Fluidez",
    ageGroup: "both",
  },
  {
    id: "dt-003",
    title: "Eco de Palabras",
    type: "dictation",
    difficulty: "Fácil",
    xp: 75,
    duration: "4 min",
    category: "Grafema-Fonema",
    ageGroup: "child",
    description: "Escucha y escribe las palabras correctamente",
  },
  {
    id: "cc-004",
    title: "Historias con Huecos",
    type: "fill-blanks",
    difficulty: "Medio",
    xp: 100,
    duration: "5 min",
    category: "Comprensión",
    ageGroup: "both",
    description: "Completa los espacios en blanco con la palabra correcta",
  },
  {
    id: "mw-005",
    title: "Memotono",
    type: "memory-sequence",
    difficulty: "Medio",
    xp: 80,
    duration: "3 min",
    category: "Memoria Verbal",
    ageGroup: "both",
  },
  {
    id: "av-006",
    title: "Busca la Letra",
    type: "letter-search",
    difficulty: "Fácil",
    xp: 60,
    duration: "2 min",
    category: "Atención",
    ageGroup: "child",
  },
  {
    id: "sp-007",
    title: "Caza de Errores",
    type: "error-hunt",
    difficulty: "Medio",
    xp: 120,
    duration: "4 min",
    category: "Ortografía",
    ageGroup: "teen",
  },
  {
    id: "ms-008",
    title: "Misión Lex & Lumo",
    type: "weekly-mission",
    difficulty: "Medio",
    xp: 200,
    duration: "15 min",
    category: "Gamificación",
    ageGroup: "both",
    description: "Completa una serie de microejercicios para desbloquear recompensas",
  },
]

// Helper functions
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id)
}

export function getExercisesByAgeGroup(ageGroup: "child" | "teen"): Exercise[] {
  return exercises.filter((ex) => ex.ageGroup === ageGroup || ex.ageGroup === "both")
}

export function calculateXP(score: number, totalQuestions: number, baseXP: number): number {
  const percentage = score / totalQuestions
  return Math.round(percentage * baseXP)
}
