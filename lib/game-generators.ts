import { spanishOrthographyRules, type ErrorType, getPhonemesByLevel } from "./linguistic-rules"
import { shuffle } from "./shuffle-utils"

// ====== CASA DE ERRORES GENERATOR ======

export interface GeneratedSentence {
  original: string
  withErrors: string
  errors: Array<{
    word: string
    correct: string
    position: number
    errorType: ErrorType
  }>
  difficulty: "easy" | "medium" | "hard"
}

const baseSentences = [
  "La vaca come hierba en el campo verde.",
  "Mi abuelo vive cerca del río azul.",
  "El lobo aúlla en la noche oscura.",
  "Voy al baño antes de salir.",
  "La casa tiene un techo rojo brillante.",
  "Voy a coser el zapato roto mañana.",
  "El cielo está azul y despejado hoy.",
  "La princesa vive en el palacio real.",
  "La gente camina por la calle principal.",
  "El girasol es amarillo y muy grande.",
  "El pollo está en el corral sucio.",
  "La llave abre la puerta principal siempre.",
  "El caballo galopa por el valle verde.",
  "La silla está junto a la mesa grande.",
  "Hay una estrella brillante en el cielo.",
  "Voy a hacer la tarea esta tarde.",
  "Hola amigo, ¿cómo estás hoy?",
  "El helado de chocolate está delicioso.",
  "El árbol da sombra en verano.",
  "Juan vive en España desde enero.",
  "María estudia en México cada día.",
]

function canApplyRule(word: string, errorType: ErrorType): boolean {
  const cleanWord = word.toLowerCase().replace(/[.,!?¿¡:;]/g, "")

  switch (errorType) {
    case "b_v":
      return /[bv]/.test(cleanWord)
    case "c_s_z":
      return /[csz]/.test(cleanWord)
    case "g_j":
      return /[gj]/.test(cleanWord)
    case "ll_y":
      return /ll|y/.test(cleanWord)
    case "h":
      return cleanWord.startsWith("h") || /[aeiou]h/.test(cleanWord)
    case "tilde":
      return /[áéíóúñ]/.test(cleanWord) || /[aeiou]n$/.test(cleanWord)
    case "mayuscula":
      return /^[A-ZÁÉÍÓÚÑ]/.test(word)
    default:
      return false
  }
}

function applyError(word: string, errorType: ErrorType): string | null {
  const cleanWord = word.toLowerCase().replace(/[.,!?¿¡:;]/g, "")
  const punctuation = word.match(/[.,!?¿¡:;]/g)?.join("") || ""
  const isCapitalized = word[0] === word[0].toUpperCase()

  let errorWord = cleanWord

  switch (errorType) {
    case "b_v":
      if (cleanWord.includes("b")) {
        errorWord = cleanWord.replace(/b/g, "v")
      } else if (cleanWord.includes("v")) {
        errorWord = cleanWord.replace(/v/g, "b")
      }
      break
    case "c_s_z":
      if (cleanWord.includes("c")) {
        errorWord = cleanWord.replace(/c(?=[ei])/g, "s")
      } else if (cleanWord.includes("s")) {
        errorWord = cleanWord.replace(/s/g, "c")
      } else if (cleanWord.includes("z")) {
        errorWord = cleanWord.replace(/z/g, "s")
      }
      break
    case "g_j":
      if (cleanWord.includes("g")) {
        errorWord = cleanWord.replace(/g(?=[ei])/g, "j")
      } else if (cleanWord.includes("j")) {
        errorWord = cleanWord.replace(/j/g, "g")
      }
      break
    case "ll_y":
      if (cleanWord.includes("ll")) {
        errorWord = cleanWord.replace(/ll/g, "y")
      } else if (cleanWord.includes("y")) {
        errorWord = cleanWord.replace(/y/g, "ll")
      }
      break
    case "h":
      if (cleanWord.startsWith("h")) {
        errorWord = cleanWord.substring(1)
      } else {
        errorWord = "h" + cleanWord
      }
      break
    case "tilde":
      // Remove tilde or add where it's missing
      if (/[áéíóú]/.test(cleanWord)) {
        errorWord = cleanWord.replace(/[áéíóú]/g, (m) => {
          return { á: "a", é: "e", í: "i", ó: "o", ú: "u" }[m] || m
        })
      } else if (/[aeiou]n$/.test(cleanWord)) {
        errorWord = cleanWord.replace(/([aeiou])(n)$/, (_, vowel) => {
          return { a: "á", e: "é", i: "í", o: "ó", u: "ú" }[vowel] + "n"
        })
      }
      break
    case "mayuscula":
      if (isCapitalized) {
        errorWord = cleanWord // Remove capitalization
      } else {
        errorWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)
      }
      break
  }

  if (errorWord === cleanWord) return null

  // Restore capitalization and punctuation
  if (isCapitalized && errorType !== "mayuscula") {
    errorWord = errorWord.charAt(0).toUpperCase() + errorWord.slice(1)
  }

  return errorWord + punctuation
}

export function generateCasaDeErroresChallenge(
  difficulty: "easy" | "medium" | "hard",
  previousErrorTypes: ErrorType[] = [],
): GeneratedSentence {
  const availableTypes = Object.keys(spanishOrthographyRules) as ErrorType[]
  const eligibleTypes = availableTypes.filter((type) => !previousErrorTypes.slice(-2).includes(type))

  if (eligibleTypes.length === 0) {
    eligibleTypes.push(...availableTypes)
  }

  const errorCount = difficulty === "easy" ? 1 : difficulty === "medium" ? 1 : 2
  let selectedSentence = ""
  let attempts = 0
  const errors: GeneratedSentence["errors"] = []
  const modifiedWords: string[] = []

  // Try to find a sentence where we can apply errors
  while (attempts < 30 && errors.length < errorCount) {
    selectedSentence = baseSentences[Math.floor(Math.random() * baseSentences.length)]
    const words = selectedSentence.split(" ")
    modifiedWords.length = 0
    modifiedWords.push(...words)
    errors.length = 0

    const shuffledTypes = shuffle(eligibleTypes)

    for (const errorType of shuffledTypes) {
      if (errors.length >= errorCount) break

      // Find words that can be modified by this rule
      const eligibleIndices: number[] = []
      words.forEach((word, index) => {
        if (!errors.some((e) => e.position === index) && canApplyRule(word, errorType)) {
          eligibleIndices.push(index)
        }
      })

      if (eligibleIndices.length > 0) {
        const randomIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)]
        const errorWord = applyError(words[randomIndex], errorType)

        if (errorWord) {
          modifiedWords[randomIndex] = errorWord
          errors.push({
            word: errorWord,
            correct: words[randomIndex],
            position: randomIndex,
            errorType,
          })
        }
      }
    }

    attempts++
  }

  // Fallback: if still no errors, force at least one
  if (errors.length === 0) {
    const words = selectedSentence.split(" ")
    modifiedWords.length = 0
    modifiedWords.push(...words)

    // Try each error type until one works
    for (const errorType of shuffle(eligibleTypes)) {
      for (let i = 0; i < words.length; i++) {
        if (canApplyRule(words[i], errorType)) {
          const errorWord = applyError(words[i], errorType)
          if (errorWord) {
            modifiedWords[i] = errorWord
            errors.push({
              word: errorWord,
              correct: words[i],
              position: i,
              errorType,
            })
            break
          }
        }
      }
      if (errors.length > 0) break
    }
  }

  return {
    original: selectedSentence,
    withErrors: modifiedWords.join(" "),
    errors,
    difficulty,
  }
}

export function generateCasaDeErroresSet(count: number): GeneratedSentence[] {
  const challenges: GeneratedSentence[] = []
  const usedSentences = new Set<string>()
  const recentErrorTypes: ErrorType[] = []

  let difficulty: "easy" | "medium" | "hard" = "easy"

  for (let i = 0; i < count; i++) {
    if (i >= count * 0.7) difficulty = "hard"
    else if (i >= count * 0.3) difficulty = "medium"

    let challenge: GeneratedSentence
    let attempts = 0

    do {
      challenge = generateCasaDeErroresChallenge(difficulty, recentErrorTypes)
      attempts++
    } while (usedSentences.has(challenge.withErrors) && attempts < 10)

    // Only add if it has at least one error
    if (challenge.errors.length > 0) {
      usedSentences.add(challenge.withErrors)
      challenges.push(challenge)
      challenge.errors.forEach((e) => recentErrorTypes.push(e.errorType))
      if (recentErrorTypes.length > 3) recentErrorTypes.shift()
    } else {
      i-- // Retry this iteration
    }
  }

  return shuffle(challenges)
}

// ====== MEMOTONO GENERATOR ======

export interface MemoTonoSequence {
  level: number
  words: string[]
  difficulty: "easy" | "medium" | "hard"
  category?: string
}

// Word pools by category
const wordPools = {
  animals: ["gato", "perro", "pájaro", "pez", "león", "tigre", "elefante", "jirafa", "mono", "oso"],
  food: ["manzana", "plátano", "naranja", "pan", "queso", "leche", "agua", "pizza", "pasta", "arroz"],
  objects: ["mesa", "silla", "libro", "lápiz", "puerta", "ventana", "teléfono", "reloj", "cama", "sofá"],
  nature: ["árbol", "flor", "río", "montaña", "sol", "luna", "estrella", "nube", "lluvia", "viento"],
  actions: ["correr", "saltar", "nadar", "volar", "comer", "beber", "dormir", "jugar", "cantar", "bailar"],
  colors: ["rojo", "azul", "verde", "amarillo", "naranja", "morado", "rosa", "negro", "blanco", "gris"],
}

export function generateMemoTonoSequence(level: number, usedWords: Set<string> = new Set()): MemoTonoSequence {
  const categories = Object.keys(wordPools)
  const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof wordPools

  // Number of words based on level
  const wordCount = Math.min(level + 1, 7)

  // Select random words not used before
  const availableWords = wordPools[category].filter((word) => !usedWords.has(word))
  const selectedWords = shuffle(availableWords).slice(0, wordCount)

  // Mark words as used
  selectedWords.forEach((word) => usedWords.add(word))

  // Determine difficulty
  let difficulty: "easy" | "medium" | "hard" = "easy"
  if (wordCount >= 5) difficulty = "hard"
  else if (wordCount >= 3) difficulty = "medium"

  return {
    level,
    words: selectedWords,
    difficulty,
    category,
  }
}

export function generateMemoTonoSet(levelCount: number): MemoTonoSequence[] {
  const sequences: MemoTonoSequence[] = []
  const usedWords = new Set<string>()

  for (let i = 0; i < levelCount; i++) {
    const sequence = generateMemoTonoSequence(i + 1, usedWords)
    sequences.push(sequence)
  }

  return sequences
}

// ====== PHONICS MATCH GENERATOR ======

export interface PhonicsChallenge {
  phoneme: string
  word: string
  spanish: string
  image: string
  options: string[]
  difficulty: "basic" | "intermediate" | "advanced"
}

const phonicsWords = [
  // Animals
  { word: "cat", spanish: "gato", image: "🐱", phoneme: "/k/" },
  { word: "dog", spanish: "perro", image: "🐕", phoneme: "/d/" },
  { word: "fish", spanish: "pez", image: "🐟", phoneme: "/f/" },
  { word: "bird", spanish: "pájaro", image: "🐦", phoneme: "/b/" },
  { word: "duck", spanish: "pato", image: "🦆", phoneme: "/d/" },
  { word: "frog", spanish: "rana", image: "🐸", phoneme: "/f/" },
  { word: "bear", spanish: "oso", image: "🐻", phoneme: "/b/" },
  { word: "fox", spanish: "zorro", image: "🦊", phoneme: "/f/" },
  { word: "pig", spanish: "cerdo", image: "🐷", phoneme: "/p/" },
  { word: "cow", spanish: "vaca", image: "🐮", phoneme: "/k/" },

  // Food
  { word: "apple", spanish: "manzana", image: "🍎", phoneme: "/a/" },
  { word: "banana", spanish: "plátano", image: "🍌", phoneme: "/b/" },
  { word: "pizza", spanish: "pizza", image: "🍕", phoneme: "/p/" },
  { word: "cake", spanish: "pastel", image: "🎂", phoneme: "/k/" },
  { word: "egg", spanish: "huevo", image: "🥚", phoneme: "/e/" },
  { word: "bread", spanish: "pan", image: "🍞", phoneme: "/b/" },
  { word: "carrot", spanish: "zanahoria", image: "🥕", phoneme: "/k/" },
  { word: "donut", spanish: "dona", image: "🍩", phoneme: "/d/" },
  { word: "cheese", spanish: "queso", image: "🧀", phoneme: "/tʃ/" },
  { word: "soup", spanish: "sopa", image: "🍲", phoneme: "/s/" },

  // Objects
  { word: "ball", spanish: "pelota", image: "⚽", phoneme: "/b/" },
  { word: "car", spanish: "auto", image: "🚗", phoneme: "/k/" },
  { word: "book", spanish: "libro", image: "📖", phoneme: "/b/" },
  { word: "pen", spanish: "lapicero", image: "🖊️", phoneme: "/p/" },
  { word: "cup", spanish: "taza", image: "☕", phoneme: "/k/" },
  { word: "phone", spanish: "teléfono", image: "📱", phoneme: "/f/" },
  { word: "bag", spanish: "bolsa", image: "👜", phoneme: "/b/" },
  { word: "key", spanish: "llave", image: "🔑", phoneme: "/k/" },
  { word: "door", spanish: "puerta", image: "🚪", phoneme: "/d/" },
  { word: "clock", spanish: "reloj", image: "⏰", phoneme: "/k/" },

  // Nature
  { word: "house", spanish: "casa", image: "🏠", phoneme: "/h/" },
  { word: "sun", spanish: "sol", image: "☀️", phoneme: "/s/" },
  { word: "tree", spanish: "árbol", image: "🌳", phoneme: "/t/" },
  { word: "flower", spanish: "flor", image: "🌸", phoneme: "/f/" },
  { word: "star", spanish: "estrella", image: "⭐", phoneme: "/s/" },
  { word: "moon", spanish: "luna", image: "🌙", phoneme: "/m/" },
  { word: "cloud", spanish: "nube", image: "☁️", phoneme: "/k/" },
  { word: "rain", spanish: "lluvia", image: "🌧️", phoneme: "/r/" },
  { word: "fire", spanish: "fuego", image: "🔥", phoneme: "/f/" },
  { word: "snow", spanish: "nieve", image: "❄️", phoneme: "/s/" },
]

// Additional images for distractors
const distractorImages = [
  "🐭",
  "🐰",
  "🐷",
  "🐮",
  "🐙",
  "🦈",
  "🐋",
  "🦅",
  "🦜",
  "🦆",
  "🍊",
  "🍇",
  "🍐",
  "🍔",
  "🌭",
  "🍟",
  "🧁",
  "🍪",
  "🍩",
  "🏀",
  "⚾",
  "🎾",
  "🚕",
  "🚙",
  "🚌",
  "📚",
  "📕",
  "📗",
  "🏡",
  "🏢",
  "🏰",
  "🌙",
  "⭐",
  "☁️",
  "🌲",
  "🌴",
  "🎄",
  "🌺",
  "🌻",
  "🌷",
]

export function generatePhonicsMatchChallenge(
  difficulty: "basic" | "intermediate" | "advanced",
  usedWords: Set<string> = new Set(),
): PhonicsChallenge {
  // Get available phonemes for this difficulty
  const availablePhonemes = getPhonemesByLevel(difficulty)

  // Select random phoneme
  const phoneme = availablePhonemes[Math.floor(Math.random() * availablePhonemes.length)]

  // Find words matching this phoneme that haven't been used
  const matchingWords = phonicsWords.filter((w) => w.phoneme === phoneme.symbol && !usedWords.has(w.word))

  if (matchingWords.length === 0) {
    // Fallback to any unused word
    const fallbackWords = phonicsWords.filter((w) => !usedWords.has(w.word))
    const word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
    usedWords.add(word.word)

    return generatePhonicsMatchChallenge(difficulty, usedWords)
  }

  const word = matchingWords[Math.floor(Math.random() * matchingWords.length)]
  usedWords.add(word.word)

  // Generate distractor options (wrong answers)
  const distractors = shuffle(distractorImages)
    .filter((img) => img !== word.image)
    .slice(0, 3)

  // Combine correct answer with distractors and shuffle
  const options = shuffle([word.image, ...distractors])

  return {
    phoneme: phoneme.symbol,
    word: word.word,
    spanish: word.spanish,
    image: word.image,
    options,
    difficulty,
  }
}

export function generatePhonicsMatchSet(count: number): PhonicsChallenge[] {
  const challenges: PhonicsChallenge[] = []
  const usedWords = new Set<string>()

  for (let i = 0; i < count; i++) {
    let difficulty: "basic" | "intermediate" | "advanced" = "basic"
    if (i >= count * 0.7) difficulty = "advanced"
    else if (i >= count * 0.3) difficulty = "intermediate"

    const challenge = generatePhonicsMatchChallenge(difficulty, usedWords)
    challenges.push(challenge)
  }

  return challenges
}
