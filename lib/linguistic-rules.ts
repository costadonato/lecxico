// Spanish orthography error types with real linguistic rules
export type ErrorType = "b_v" | "c_s_z" | "g_j" | "ll_y" | "h" | "tilde" | "mayuscula"

export interface OrthographyRule {
  type: ErrorType
  description: string
  examples: Array<{ incorrect: string; correct: string }>
}

export const spanishOrthographyRules: Record<ErrorType, OrthographyRule> = {
  b_v: {
    type: "b_v",
    description: "Confusión entre B y V (fonemas similares)",
    examples: [
      { incorrect: "baca", correct: "vaca" },
      { incorrect: "tuvo", correct: "tubo" },
      { incorrect: "benir", correct: "venir" },
      { incorrect: "haber", correct: "haver" }, // inverso también
      { incorrect: "nueve", correct: "nuebe" },
      { incorrect: "vivir", correct: "bibir" },
    ],
  },
  c_s_z: {
    type: "c_s_z",
    description: "Confusión entre C, S, Z (seseo/ceceo)",
    examples: [
      { incorrect: "caza", correct: "casa" },
      { incorrect: "coser", correct: "cocer" },
      { incorrect: "sapato", correct: "zapato" },
      { incorrect: "sien", correct: "cien" },
      { incorrect: "sereza", correct: "cereza" },
      { incorrect: "peses", correct: "peces" },
    ],
  },
  g_j: {
    type: "g_j",
    description: "Confusión entre G y J ante E, I",
    examples: [
      { incorrect: "jente", correct: "gente" },
      { incorrect: "genio", correct: "jenio" },
      { incorrect: "jirafa", correct: "girafa" },
      { incorrect: "muger", correct: "mujer" },
      { incorrect: "reloj", correct: "reloj" }, // este es correcto
      { incorrect: "viaje", correct: "viage" },
    ],
  },
  ll_y: {
    type: "ll_y",
    description: "Confusión entre LL e Y (yeísmo)",
    examples: [
      { incorrect: "poyo", correct: "pollo" },
      { incorrect: "caye", correct: "calle" },
      { incorrect: "llama", correct: "yama" },
      { incorrect: "cabayo", correct: "caballo" },
      { incorrect: "yave", correct: "llave" },
      { incorrect: "siya", correct: "silla" },
    ],
  },
  h: {
    type: "h",
    description: "Omisión o adición incorrecta de H",
    examples: [
      { incorrect: "acer", correct: "hacer" },
      { incorrect: "ola", correct: "hola" },
      { incorrect: "huevo", correct: "uevo" },
      { incorrect: "helado", correct: "elado" },
      { incorrect: "hola", correct: "ola" }, // inverso
      { incorrect: "haber", correct: "aber" },
    ],
  },
  tilde: {
    type: "tilde",
    description: "Error de acentuación (tildes)",
    examples: [
      { incorrect: "arbol", correct: "árbol" },
      { incorrect: "comio", correct: "comió" },
      { incorrect: "explico", correct: "explicó" },
      { incorrect: "dias", correct: "días" },
      { incorrect: "pelicula", correct: "película" },
      { incorrect: "musica", correct: "música" },
    ],
  },
  mayuscula: {
    type: "mayuscula",
    description: "Error de mayúsculas",
    examples: [
      { incorrect: "juan", correct: "Juan" },
      { incorrect: "españa", correct: "España" },
      { incorrect: "lunes", correct: "Lunes" },
      { incorrect: "mexico", correct: "México" },
    ],
  },
}

// Phonemic system for Spanish
export interface Phoneme {
  symbol: string // IPA-like symbol
  graphemes: string[] // Possible written forms
  examples: string[] // Example words
  difficulty: "basic" | "intermediate" | "advanced"
  confusables: string[] // Similar phonemes to avoid together
}

export const spanishPhonemes: Phoneme[] = [
  {
    symbol: "/a/",
    graphemes: ["a"],
    examples: ["casa", "gato", "mapa"],
    difficulty: "basic",
    confusables: [],
  },
  {
    symbol: "/e/",
    graphemes: ["e"],
    examples: ["mesa", "peso", "leche"],
    difficulty: "basic",
    confusables: [],
  },
  {
    symbol: "/i/",
    graphemes: ["i", "y"],
    examples: ["niño", "piso", "rey"],
    difficulty: "basic",
    confusables: [],
  },
  {
    symbol: "/o/",
    graphemes: ["o"],
    examples: ["oso", "solo", "otro"],
    difficulty: "basic",
    confusables: [],
  },
  {
    symbol: "/u/",
    graphemes: ["u"],
    examples: ["uno", "puro", "luz"],
    difficulty: "basic",
    confusables: [],
  },
  {
    symbol: "/p/",
    graphemes: ["p"],
    examples: ["pato", "tapa", "copa"],
    difficulty: "basic",
    confusables: ["/b/"],
  },
  {
    symbol: "/b/",
    graphemes: ["b", "v"],
    examples: ["beso", "vaca", "nube"],
    difficulty: "intermediate",
    confusables: ["/p/"],
  },
  {
    symbol: "/t/",
    graphemes: ["t"],
    examples: ["toro", "gato", "sal"],
    difficulty: "basic",
    confusables: ["/d/"],
  },
  {
    symbol: "/d/",
    graphemes: ["d"],
    examples: ["dedo", "nada", "red"],
    difficulty: "basic",
    confusables: ["/t/"],
  },
  {
    symbol: "/k/",
    graphemes: ["c", "qu", "k"],
    examples: ["casa", "queso", "kilo"],
    difficulty: "intermediate",
    confusables: ["/g/"],
  },
  {
    symbol: "/g/",
    graphemes: ["g", "gu"],
    examples: ["gato", "guerra", "lago"],
    difficulty: "intermediate",
    confusables: ["/k/"],
  },
  {
    symbol: "/f/",
    graphemes: ["f"],
    examples: ["foca", "café", "flor"],
    difficulty: "basic",
    confusables: [],
  },
  {
    symbol: "/s/",
    graphemes: ["s", "c", "z"],
    examples: ["sol", "cielo", "zapato"],
    difficulty: "advanced",
    confusables: [],
  },
  {
    symbol: "/x/",
    graphemes: ["j", "g"],
    examples: ["jota", "gente", "reloj"],
    difficulty: "advanced",
    confusables: [],
  },
  {
    symbol: "/m/",
    graphemes: ["m"],
    examples: ["mano", "cama", "come"],
    difficulty: "basic",
    confusables: ["/n/"],
  },
  {
    symbol: "/n/",
    graphemes: ["n"],
    examples: ["nido", "pan", "luna"],
    difficulty: "basic",
    confusables: ["/m/"],
  },
  {
    symbol: "/ɲ/",
    graphemes: ["ñ"],
    examples: ["niño", "año", "caña"],
    difficulty: "intermediate",
    confusables: [],
  },
  {
    symbol: "/l/",
    graphemes: ["l"],
    examples: ["luna", "palo", "sol"],
    difficulty: "basic",
    confusables: ["/r/"],
  },
  {
    symbol: "/r/",
    graphemes: ["r"],
    examples: ["pero", "cara", "mar"],
    difficulty: "intermediate",
    confusables: ["/l/", "/rr/"],
  },
  {
    symbol: "/rr/",
    graphemes: ["rr", "r"],
    examples: ["perro", "carro", "rosa"],
    difficulty: "advanced",
    confusables: ["/r/"],
  },
  {
    symbol: "/ʎ/",
    graphemes: ["ll"],
    examples: ["pollo", "calle", "lluvia"],
    difficulty: "advanced",
    confusables: ["/y/"],
  },
  {
    symbol: "/y/",
    graphemes: ["y", "ll"],
    examples: ["yema", "playa", "mayo"],
    difficulty: "advanced",
    confusables: ["/ʎ/"],
  },
  {
    symbol: "/tʃ/",
    graphemes: ["ch"],
    examples: ["chico", "leche", "noche"],
    difficulty: "intermediate",
    confusables: [],
  },
]

// Get phonemes by difficulty level, avoiding confusables
export function getPhonemesByLevel(difficulty: "basic" | "intermediate" | "advanced"): Phoneme[] {
  const phonemes = spanishPhonemes.filter((p) => p.difficulty === difficulty)

  // For basic level, exclude confusables
  if (difficulty === "basic") {
    return phonemes.filter((p) => p.confusables.length === 0)
  }

  return phonemes
}

// Validate if two phonemes should not appear together
export function arePhonemesSimilar(p1: string, p2: string): boolean {
  const phoneme1 = spanishPhonemes.find((p) => p.symbol === p1)
  const phoneme2 = spanishPhonemes.find((p) => p.symbol === p2)

  if (!phoneme1 || !phoneme2) return false

  return phoneme1.confusables.includes(p2) || phoneme2.confusables.includes(p1)
}
