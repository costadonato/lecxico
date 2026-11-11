"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Volume2 } from "lucide-react"
import { bloqueCodigoPorOrden } from "@/lib/test/bloques"
import { guardarTest } from "@/lib/test/guardar-test"
import { useAccesoTest } from "@/lib/test/use-acceso-test"
import { useSalidaDelTest } from "@/lib/test/use-salida-test"
import { Button } from "@/components/ui/button"
import { TestAccesoAviso } from "@/components/test-acceso-aviso"
import { BarraProgresoEvaluacion } from "@/components/test/barra-progreso-evaluacion"
import { BotonAudio } from "@/components/test/boton-audio"
import { BotonOpcion } from "@/components/test/boton-opcion"
import { FinalEvaluacion } from "@/components/test/final-evaluacion"
import { MarcoEvaluacion } from "@/components/test/marco-evaluacion"
import { ChipEstimulo, TarjetaPregunta, TituloConsigna } from "@/components/test/tarjeta-pregunta"

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
/** A multiple_choice question that belongs to a reading_comprehension story */
interface StoryQuestion {
  question: string
  options: string[]
  correct: string
}

interface SameDifferentQuestion {
  id: number
  block: number
  type: "same_different"
  word1: string
  word2: string
  correct: "same" | "different"
  emoji1: string
  emoji2: string
}

interface MultipleChoiceQuestion {
  id: number
  block: number
  type: "multiple_choice"
  question: string
  options: string[]
  correct: string
  context?: string
  /** Ejercicio J: the pseudoword played as audio (heard, never shown) */
  spokenWord?: string
}

interface SyllableCountQuestion {
  id: number
  block: number
  type: "syllable_count"
  word: string
  options: number[]
  correct: number
  emoji: string
  /** Ejercicio F: word split into syllables with hyphens (shown + read aloud with pauses) */
  syllableDisplay?: string
}

interface ReadingComprehensionQuestion {
  id: number
  block: number
  type: "reading_comprehension"
  text: string
  storyQuestions: StoryQuestion[]
}

interface LetterFillQuestion {
  id: number
  block: number
  type: "letter_fill"
  question: string
  context?: string
  word: string
  options: string[]
  correct: string
}

interface MirrorLettersQuestion {
  id: number
  block: number
  type: "mirror_letters"
  question: string
  word: string
  emoji: string
  options: string[]
  correct: string
}

interface SequenceOrderQuestion {
  id: number
  block: number
  type: "sequence_order"
  /** Words played in audio, in order */
  sequence: string[]
  /** Words shown as buttons (shuffled) */
  options: string[]
  /** Indices into options[] in the correct click order */
  correctOrder: number[]
}

interface SyllabDragQuestion {
  id: number
  block: number
  type: "syllable_drag"
  word: string
  emoji: string
  /** Shuffled syllables */
  syllables: string[]
  /** Syllables in the correct order */
  correct: string[]
}

interface PseudoAudioQuestion {
  id: number
  block: number
  type: "pseudo_audio"
  /** Pseudoword shown on screen */
  writtenWord: string
  /** 3 options to pronounce with TTS */
  audioOptions: string[]
  /** Which option is correct */
  correct: string
}

/** Ejercicio E: the professional rates the child's spoken answer as right/wrong */
interface ProfessionalRatedQuestion {
  id: number
  block: number
  type: "professional_rated"
  question: string
  /** Optional big word shown in a box (e.g. a pseudoword to read aloud) */
  displayWord?: string
  /** Optional custom labels for the rating buttons */
  ratingLabels?: { correct: string; incorrect: string }
}

type Question =
  | SameDifferentQuestion
  | MultipleChoiceQuestion
  | SyllableCountQuestion
  | ReadingComprehensionQuestion
  | LetterFillQuestion
  | MirrorLettersQuestion
  | SequenceOrderQuestion
  | SyllabDragQuestion
  | PseudoAudioQuestion
  | ProfessionalRatedQuestion

/* ------------------------------------------------------------------ */
/*  QUESTION DATA  (7 blocks)                                          */
/* ------------------------------------------------------------------ */
const questions: Question[] = [
  // BLOQUE 1 — Discriminación Auditiva
  // Ejercicio A — Pares mínimos
  { id: 1, block: 1, type: 'same_different', word1: 'MALETA', word2: 'MANTECA', correct: 'different', emoji1: '🧳', emoji2: '🧈' },
  { id: 2, block: 1, type: 'same_different', word1: 'CAMINO', word2: 'CAMINO', correct: 'same', emoji1: '🛣️', emoji2: '🛣️' },
  { id: 3, block: 1, type: 'same_different', word1: 'CABALLO', word2: 'CABELLO', correct: 'different', emoji1: '🐴', emoji2: '💇' },
  // Ejercicio B — ¿Cuál escuchaste?
  { id: 4, block: 1, type: 'multiple_choice', question: '¿Cuál es la imagen que escuchaste?', options: ['MARIPOSA', 'ABEJA', 'ORUGA'], correct: 'ABEJA', context: 'ABEJA' },
  { id: 5, block: 1, type: 'multiple_choice', question: '¿Cuál es la imagen que escuchaste?', options: ['ELEFANTE', 'JIRAFA', 'CEBRA'], correct: 'CEBRA', context: 'CEBRA' },

  // BLOQUE 2 — Conciencia Fonológica
  // Ejercicio C — Sonido inicial
  { id: 6, block: 2, type: 'multiple_choice', question: '¿Qué palabra empieza con la misma letra que MESA?', options: ['MARIPOSA', 'PATO', 'SOL'], correct: 'MARIPOSA' },
  { id: 7, block: 2, type: 'multiple_choice', question: '¿Qué palabra empieza con la misma letra que BARCO?', options: ['BICICLETA', 'MESA', 'TORO'], correct: 'BICICLETA' },
  // Ejercicio D — Síntesis fonémica
  { id: 8, block: 2, type: 'multiple_choice', question: '¿Qué palabra se puede formar con estas letras?', options: ['SOL', 'AMO', 'MAR'], correct: 'SOL', context: 'O / S / L' },
  { id: 9, block: 2, type: 'multiple_choice', question: '¿Qué palabra se puede formar con estas letras?', options: ['MANO', 'RATA', 'GATO'], correct: 'GATO', context: 'A / T / G / O' },
  { id: 10, block: 2, type: 'multiple_choice', question: '¿Qué palabra se puede formar con estas letras?', options: ['PEZ', 'CAE', 'PAN'], correct: 'PAN', context: 'N / A / P' },
  // Ejercicio E — Omisión de fonema
  { id: 11, block: 2, type: 'professional_rated', question: '¿Cómo queda GATO sin la /g/?' },
  { id: 12, block: 2, type: 'professional_rated', question: '¿Cómo queda SALA sin la /s/?' },

  // BLOQUE 3 — Conciencia Silábica
  // Ejercicio F — Conteo de sílabas
  { id: 13, block: 3, type: 'syllable_count', word: 'MARIPOSA', options: [3, 4, 5], correct: 4, emoji: '🦋', syllableDisplay: 'MA-RI-PO-SA' },
  { id: 14, block: 3, type: 'syllable_count', word: 'PELOTA', options: [2, 3, 4], correct: 3, emoji: '⚽', syllableDisplay: 'PE-LO-TA' },
  // Ejercicio G — Sílaba inicial
  { id: 15, block: 3, type: 'multiple_choice', question: '¿Cuál empieza con la misma sílaba que PELOTA?', options: ['PERA', 'SILLA', 'CASA'], correct: 'PERA' },
  { id: 16, block: 3, type: 'multiple_choice', question: '¿Cuál empieza con la misma sílaba que CAMISA?', options: ['CABALLO', 'PELOTA', 'NUBE'], correct: 'CABALLO' },
  // Ejercicio H — Construir la palabra
  { id: 17, block: 3, type: 'syllable_drag', word: 'LUNA', emoji: '🌙', syllables: ['NA', 'LU'], correct: ['LU', 'NA'] },
  { id: 18, block: 3, type: 'syllable_drag', word: 'TOMATE', emoji: '🍅', syllables: ['TE', 'TO', 'MA'], correct: ['TO', 'MA', 'TE'] },

  // BLOQUE 4 — Memoria Fonológica
  // Ejercicio I — Repetir secuencia
  { id: 19, block: 4, type: 'sequence_order', sequence: ['CONEJO', 'CASA', 'LÁPIZ'], options: ['CASA', 'CONEJO', 'LÁPIZ'], correctOrder: [1, 0, 2] },
  { id: 20, block: 4, type: 'sequence_order', sequence: ['ZAPATO', 'SOL', 'SILLA'], options: ['SILLA', 'SOL', 'ZAPATO'], correctOrder: [2, 1, 0] },
  { id: 21, block: 4, type: 'sequence_order', sequence: ['LUNA', 'LIBRO', 'PERRO', 'MATE'], options: ['PERRO', 'LUNA', 'LIBRO', 'MATE'], correctOrder: [1, 2, 0, 3] },
  // Ejercicio J — Pseudopalabras orales
  { id: 22, block: 4, type: 'multiple_choice', question: '¿Cuál de estas opciones es la palabra que escuchaste?', options: ['FUNO', 'FUBO', 'NUFO'], correct: 'FUNO', spokenWord: 'FUNO' },
  { id: 23, block: 4, type: 'multiple_choice', question: '¿Cuál de estas opciones es la palabra que escuchaste?', options: ['PILA', 'LIPA', 'LIBA'], correct: 'LIPA', spokenWord: 'LIPA' },
  { id: 24, block: 4, type: 'multiple_choice', question: '¿Cuál de estas opciones es la palabra que escuchaste?', options: ['PELATO', 'TALOPE', 'TAPELO'], correct: 'TAPELO', spokenWord: 'TAPELO' },

  // BLOQUE 5 — Comprensión Lectora
  {
    id: 25, block: 5, type: 'reading_comprehension',
    text: 'Sofía tiene un perro llamado Toto. Toto es muy juguetón y le encanta correr. Un día, Sofía y Toto fueron al parque a jugar. Allí, Toto encontró una pelota roja brillante. La agarró con la boca y la trajo de vuelta a Sofía. ¡Sofía estaba muy feliz!',
    storyQuestions: [
      { question: '¿Cómo se llama el perro de Sofía?', options: ['Pepe', 'Toto', 'Nino'], correct: 'Toto' },
      { question: '¿A dónde fueron Sofía y Toto?', options: ['Al río', 'Al parque', 'A la escuela'], correct: 'Al parque' },
      { question: '¿Qué encontró Toto en el parque?', options: ['Un hueso', 'Un sombrero', 'Una pelota roja'], correct: 'Una pelota roja' },
    ]
  },

  // BLOQUE 6 — Correspondencia Sonido-Letra
  // Ejercicio L — ¿Con qué letra empieza esta sílaba?
  { id: 26, block: 6, type: 'letter_fill', question: '¿Con qué letra empieza esta sílaba?', word: '/ma/', options: ['M', 'N', 'B', 'P'], correct: 'M' },
  { id: 27, block: 6, type: 'letter_fill', question: '¿Con qué letra empieza esta sílaba?', word: '/pa/', options: ['B', 'D', 'P', 'T'], correct: 'P' },
  // Ejercicio M — Letra faltante
  { id: 28, block: 6, type: 'letter_fill', question: '¿Qué letra falta?', context: '👤 CA_EZA', word: 'CA_EZA', options: ['B', 'E', 'R', 'D'], correct: 'B' },
  { id: 29, block: 6, type: 'letter_fill', question: '¿Qué letra falta?', context: '🦆 _ATO', word: '_ATO', options: ['P', 'G', 'B', 'D'], correct: 'P' },
  // Ejercicio N — Letras espejo
  { id: 30, block: 6, type: 'mirror_letters', question: '¿Qué letra va aquí?', word: '_ado', emoji: '🎲', options: ['b', 'd'], correct: 'd' },
  { id: 31, block: 6, type: 'mirror_letters', question: '¿Qué letra va aquí?', word: '_eso', emoji: '💋', options: ['b', 'd'], correct: 'b' },

  // BLOQUE 7 — Reconocimiento Visual
  { id: 32, block: 7, type: 'multiple_choice', question: '¿Cuál está bien escrita?', options: ['PEROO', 'PERO', 'PERRO'], correct: 'PERRO', context: '🐕' },
  { id: 33, block: 7, type: 'multiple_choice', question: '¿Cuál está bien escrita?', options: ['AOTO', 'AUTO', 'AUTOO'], correct: 'AUTO', context: '🚗' },

  // BLOQUE 8 — Lectura de Pseudopalabras
  { id: 34, block: 8, type: 'pseudo_audio', writtenWord: 'TOPI', audioOptions: ['topi', 'poti', 'tovi'], correct: 'topi' },
  { id: 35, block: 8, type: 'pseudo_audio', writtenWord: 'FUMISA', audioOptions: ['fumosa', 'misafu', 'fumisa'], correct: 'fumisa' },
  // Lectura en voz alta evaluada por el profesional (dificultad incremental)
  { id: 36, block: 8, type: 'professional_rated', question: 'Leé la siguiente palabra en voz alta', displayWord: 'TASO', ratingLabels: { correct: 'Bien leído', incorrect: 'Mal leído' } },
  { id: 37, block: 8, type: 'professional_rated', question: 'Leé la siguiente palabra en voz alta', displayWord: 'MELUPA', ratingLabels: { correct: 'Bien leído', incorrect: 'Mal leído' } },
  { id: 38, block: 8, type: 'professional_rated', question: 'Leé la siguiente palabra en voz alta', displayWord: 'RIDOTE', ratingLabels: { correct: 'Bien leído', incorrect: 'Mal leído' } },
  { id: 39, block: 8, type: 'professional_rated', question: 'Leé la siguiente palabra en voz alta', displayWord: 'BALCUTINA', ratingLabels: { correct: 'Bien leído', incorrect: 'Mal leído' } },
  { id: 40, block: 8, type: 'professional_rated', question: 'Leé la siguiente palabra en voz alta', displayWord: 'PLONDRESAMO', ratingLabels: { correct: 'Bien leído', incorrect: 'Mal leído' } },
]

const TOTAL_QUESTIONS = questions.length

/* ------------------------------------------------------------------ */
/*  EMOJI MAP  (word -> emoji, used for multiple_choice/letter_fill    */
/*  option buttons)                                                    */
/* ------------------------------------------------------------------ */
const questionEmojis: Record<string, string> = {
  'MARIPOSA': '🦋', 'ABEJA': '🐝', 'ORUGA': '🐛', 'ELEFANTE': '🐘',
  'JIRAFA': '🦒', 'CEBRA': '🦓', 'PATO': '🦆', 'SOL': '☀️', 'SILLA': '🪑',
  'BICICLETA': '🚲', 'TORO': '🐂', 'GATO': '🐱', 'CASA': '🏠', 'PERA': '🍐',
  'CABALLO': '🐴', 'PELOTA': '⚽', 'NUBE': '☁️', 'CONEJO': '🐰', 'LÁPIZ': '✏️',
  'ZAPATO': '👟', 'PERRO': '🐕', 'LUNA': '🌙', 'LIBRO': '📚', 'MATE': '🧉',
  'TOMATE': '🍅',
}

const BLOCKS = [
  { id: 1, name: "Discriminación Auditiva" },
  { id: 2, name: "Conciencia Fonológica" },
  { id: 3, name: "Conciencia Silábica" },
  { id: 4, name: "Memoria Auditiva" },
  { id: 5, name: "Comprensión Lectora" },
  { id: 6, name: "Correspondencia Sonido-Letra" },
  { id: 7, name: "Reconocimiento Visual" },
  { id: 8, name: "Lectura de Pseudopalabras" },
]

/**
 * A stored answer: the index of the chosen option, or — for questions built up
 * click by click — the picks in the order the child made them.
 */
type Answer = number | number[] | string[]

/** Was `ans` the correct answer for a top-level question? */
const isOptionCorrect = (q: Question, ans: Answer): boolean => {
  switch (q.type) {
    case "same_different":
      return (ans === 0 ? "same" : "different") === q.correct
    case "multiple_choice":
    case "letter_fill":
    case "mirror_letters":
      return typeof ans === "number" && q.options[ans] === q.correct
    case "syllable_count":
      return typeof ans === "number" && q.options[ans] === q.correct
    case "pseudo_audio":
      return typeof ans === "number" && q.audioOptions[ans] === q.correct
    /* Rated by the professional: 0 = "Bien respondido" counts as correct */
    case "professional_rated":
      return ans === 0
    case "sequence_order":
      return (
        Array.isArray(ans) &&
        ans.length === q.correctOrder.length &&
        q.correctOrder.every((v, i) => ans[i] === v)
      )
    case "syllable_drag":
      return (
        Array.isArray(ans) &&
        ans.length === q.correct.length &&
        q.correct.every((v, i) => ans[i] === v)
      )
    /* Scored through its own storyQuestions, never as a single option */
    case "reading_comprehension":
      return false
  }
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function TestPrimariaPage() {
  return (
    <Suspense fallback={<TestAccesoAviso />}>
      <TestPrimaria />
    </Suspense>
  )
}

function TestPrimaria() {
  const router = useRouter()
  const acceso = useAccesoTest("primario")

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(TOTAL_QUESTIONS).fill(null))
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  /** Ejercicio I: option indices in the order they were clicked */
  const [sequenceSelection, setSequenceSelection] = useState<number[]>([])
  /** Ejercicio I: how many times the current sequence has been played (max 2) */
  const [playCount, setPlayCount] = useState(0)
  /** Ejercicio H: syllables placed so far, left to right */
  const [builtWord, setBuiltWord] = useState<string[]>([])
  /** Ejercicio P: which audio option is playing right now */
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  /* ---- salir a mitad del test pide confirmación (no hay guardado parcial) ---- */
  const testEnCurso = acceso.estado === "permitido" && !saved && (currentIndex > 0 || finished)
  const { salir, dialogo: dialogoSalida } = useSalidaDelTest(testEnCurso)

  /* ---- reading_comprehension sub-navigation ---- */
  /** -1 = showing the story text · 0..n-1 = answering storyQuestions[n] */
  const [storySubIndex, setStorySubIndex] = useState(-1)
  const [storyAnswers, setStoryAnswers] = useState<Record<string, number>>({})

  /* ---- text-to-speech ---- */
  const [speaking, setSpeaking] = useState(false)

  const current = questions[currentIndex]

  const activeStoryQuestion =
    current && current.type === "reading_comprehension" && storySubIndex >= 0
      ? current.storyQuestions[storySubIndex] ?? null
      : null
  const showingStoryText = !!current && current.type === "reading_comprehension" && storySubIndex === -1

  const displayPrompt = !current
    ? ""
    : activeStoryQuestion
      ? activeStoryQuestion.question
      : current.type === "same_different"
        ? "¿Son la misma palabra?"
        : current.type === "syllable_count"
          ? `¿Cuántas sílabas tiene la palabra ${current.word}?`
          : current.type === "reading_comprehension"
            ? "Leé el siguiente cuento y respondé las preguntas."
            : current.type === "sequence_order"
              ? "Marcá las palabras en el orden en que las escuchaste"
              : current.type === "syllable_drag"
                ? "Armá la palabra con las sílabas"
                : current.type === "pseudo_audio"
                  ? "¿Cuál de estos audios pronuncia correctamente esta palabra?"
                  : current.question

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const speakQuestion = useCallback(() => {
    if (!current) return
    const parts: string[] = []
    if (current.type === "reading_comprehension") {
      if (showingStoryText) parts.push(current.text)
    } else if (current.type === "same_different") {
      parts.push(`${current.word1}... ${current.word2}`)
    } else if (current.type === "syllable_count") {
      parts.push(current.syllableDisplay?.replace(/-/g, ", ") ?? current.word)
    } else if ((current.type === "multiple_choice" || current.type === "letter_fill") && current.context) {
      parts.push(current.context)
    }
    parts.push(displayPrompt)
    speak(parts.join(". "))
  }, [current, showingStoryText, displayPrompt, speak])

  /* ---- Ejercicio I: play the words one by one, 800ms apart ---- */
  const speakSequence = useCallback((words: string[]) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    if (playCount >= 2) return
    window.speechSynthesis.cancel()
    setPlayCount((prev) => prev + 1)
    setSpeaking(true)
    words.forEach((word, i) => {
      window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = "es-ES"
        utterance.rate = 0.85
        utterance.pitch = 1
        if (i === words.length - 1) utterance.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }, i * 800)
    })
  }, [playCount])

  /* ---- Ejercicio P: play one audio option and keep track of which one ---- */
  const speakAudioOption = useCallback((idx: number, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.onstart = () => setPlayingAudio(idx)
    utterance.onend = () => setPlayingAudio(null)
    utterance.onerror = () => setPlayingAudio(null)
    window.speechSynthesis.speak(utterance)
  }, [])

  /* ---- audio that plays on its own as soon as the question opens ---- */
  /** Ejercicio L hears the syllable, Ejercicios B and J hear the word; all hide the text */
  const autoPlayText = !current
    ? null
    : current.type === "letter_fill" && current.word.startsWith("/") && current.word.endsWith("/")
      ? current.word.replace(/\//g, "")
      : current.type === "multiple_choice" && current.block === 1 && current.context
        ? current.context.replace("🔊", "").trim()
        : null

  const puedeComenzar = acceso.estado === "permitido"
  useEffect(() => {
    if (puedeComenzar && autoPlayText) speak(autoPlayText)
  }, [currentIndex, autoPlayText, speak, puedeComenzar])

  /* ---- empty-data guard ---- */
  if (!current) {
    return (
      <div className="fondo-nino flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Evaluación de indicadores de dislexia · Nivel Primario</h1>
        <p className="text-muted-foreground">Todavía no hay preguntas cargadas para este nivel.</p>
        <Button onClick={() => router.push("/test")}>Volver</Button>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100
  const blockName = BLOCKS.find((b) => b.id === current.block)?.name ?? ""
  const displayOptions: (string | number)[] = activeStoryQuestion
    ? activeStoryQuestion.options
    : current.type === "same_different"
      ? ["Iguales", "Diferentes"]
      : current.type === "reading_comprehension" ||
          current.type === "sequence_order" ||
          current.type === "syllable_drag" ||
          current.type === "pseudo_audio" ||
          current.type === "professional_rated"
        ? []
        : current.options

  /* ---- per-exercise display rules ---- */
  /** Ejercicio L: `word` is a spoken syllable such as /ma/ — heard, never shown */
  const isSpokenSyllable =
    current.type === "letter_fill" && current.word.startsWith("/") && current.word.endsWith("/")
  /** Ejercicio B: the word is played as audio, so its `context` stays off screen */
  const isHeardWord = current.type === "multiple_choice" && current.block === 1
  /** Ejercicio B is the only exercise that pairs each option with its picture */
  const optionsShowEmoji = isHeardWord
  /** Exercises whose prompt carries the whole task get a bigger heading */
  const promptLarge = current.type === "multiple_choice" && !current.context
  /** Ejercicio H: chips not placed yet — duplicated syllables are consumed one at a time */
  const remainingSyllables = (() => {
    if (current.type !== "syllable_drag") return []
    const pending = [...builtWord]
    return current.syllables.filter((syl) => {
      const at = pending.indexOf(syl)
      if (at === -1) return true
      pending.splice(at, 1)
      return false
    })
  })()

  /** Whether the current question has a complete answer ready to submit */
  const canProceed =
    current.type === "sequence_order"
      ? sequenceSelection.length === current.options.length
      : current.type === "syllable_drag"
        ? builtWord.length === current.syllables.length
        : selectedOption !== null

  /* ---- handlers ---- */
  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx)
  }

  /** Ejercicio I: click to append an option to the order, click again to take it out */
  const handleSequenceSelect = (optionIdx: number) => {
    setSequenceSelection((prev) =>
      prev.includes(optionIdx) ? prev.filter((i) => i !== optionIdx) : [...prev, optionIdx]
    )
  }

  /** Ejercicio H: place the next syllable of the word */
  const handleSyllablePlace = (syllable: string) => {
    setBuiltWord((prev) => [...prev, syllable])
  }

  const goToNextTopLevel = () => {
    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setSequenceSelection([])
      setBuiltWord([])
      setPlayingAudio(null)
      setPlayCount(0)
    } else {
      setFinished(true)
    }
  }

  const handleNext = () => {
    if (current.type === "reading_comprehension") {
      const storyQuestions = current.storyQuestions

      // Step 1: move from the story text to its first question
      if (storySubIndex === -1) {
        setStorySubIndex(0)
        setSelectedOption(null)
        return
      }

      // Step 2: record the answer to the current story question
      if (selectedOption === null) return
      setStoryAnswers((prev) => ({ ...prev, [`${current.id}_${storySubIndex}`]: selectedOption }))

      if (storySubIndex + 1 < storyQuestions.length) {
        setStorySubIndex(storySubIndex + 1)
        setSelectedOption(null)
        return
      }

      // Step 3: story finished, move on to the next top-level question
      setStorySubIndex(-1)
      goToNextTopLevel()
      return
    }

    if (!canProceed) return
    const updated = [...answers]
    updated[currentIndex] =
      current.type === "sequence_order"
        ? [...sequenceSelection]
        : current.type === "syllable_drag"
          ? [...builtWord]
          : selectedOption
    setAnswers(updated)
    goToNextTopLevel()
  }

  /* ---- results computation ---- */
  const computeResults = () => {
    return BLOCKS.map((block) => {
      const blockQuestions = questions.filter((q) => q.block === block.id)
      let correct = 0
      let total = 0
      blockQuestions.forEach((q) => {
        if (q.type === "reading_comprehension") {
          total += q.storyQuestions.length
          q.storyQuestions.forEach((sq, si) => {
            const ans = storyAnswers[`${q.id}_${si}`]
            if (ans !== undefined && sq.options[ans] === sq.correct) correct++
          })
        } else {
          total += 1
          const idx = questions.indexOf(q)
          const ans = answers[idx]
          if (ans !== null && ans !== undefined && isOptionCorrect(q, ans)) correct++
        }
      })
      return { ...block, total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0 }
    })
  }

  const totalResults = computeResults()
  const totalCorrect = totalResults.reduce((acc, b) => acc + b.correct, 0)
  const totalAnswerable = totalResults.reduce((acc, b) => acc + b.total, 0)
  const totalPct = totalAnswerable > 0 ? Math.round((totalCorrect / totalAnswerable) * 100) : 0

  /* ---- save to Supabase ---- */
  const handleSave = async () => {
    if (acceso.estado !== "permitido") return
    setSaving(true)
    setSaveError(null)
    try {
      await guardarTest({
        ninoId: acceso.ninoId,
        nivel: "primario",
        bloques: computeResults().map((b) => ({
          bloqueCodigo: bloqueCodigoPorOrden("primario", b.id),
          orden: b.id,
          correctas: b.correct,
          total: b.total,
        })),
        puntajeTotal: totalCorrect,
        porcentajeTotal: totalPct,
        conclusion: totalPct < 60 ? "indicadores_detectados" : "sin_indicadores",
      })
      setSaved(true)
    } catch (err) {
      console.error("Error al guardar:", err)
      setSaveError((err as { message?: string })?.message || "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setAnswers(Array(TOTAL_QUESTIONS).fill(null))
    setSelectedOption(null)
    setSequenceSelection([])
    setBuiltWord([])
    setPlayingAudio(null)
    setPlayCount(0)
    setFinished(false)
    setSaved(false)
    setSaveError(null)
    setStorySubIndex(-1)
    setStoryAnswers({})
  }

  /* ---- auto-save results as soon as the test finishes ---- */
  useEffect(() => {
    if (finished) handleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  /* ---- sin acceso (o verificando): no se puede comenzar ---- */
  if (acceso.estado !== "permitido") {
    return (
      <TestAccesoAviso
        motivo={acceso.estado === "denegado" ? acceso.motivo : undefined}
        elegirNino={acceso.estado === "denegado" && acceso.elegirNino}
      />
    )
  }

  /* ================================================================ */
  /*  RESULTS SCREEN                                                   */
  /* ================================================================ */
  if (finished) {
    const bloquesResultado = computeResults().map((b) => ({
      bloque_codigo: bloqueCodigoPorOrden("primario", b.id),
      orden: b.id,
      correctas: b.correct,
      total: b.total,
    }))

    return (
      <MarcoEvaluacion
        etiqueta="Resultados de la evaluación"
        onVolver={() => salir("/test")}
        nino={acceso.nino}
        nivel="primario"
        decorado
      >
        {dialogoSalida}
        <FinalEvaluacion
          nivel="primario"
          porcentajeTotal={totalPct}
          bloques={bloquesResultado}
          guardando={saving}
          guardado={saved}
          errorGuardado={saveError}
          onReintentar={handleSave}
          onRepetir={handleRestart}
          onEvaluarOtro={() => router.push("/test")}
          onVolverInicio={() => salir("/dashboard")}
        />
      </MarcoEvaluacion>
    )
  }

  /* ================================================================ */
  /*  QUESTION SCREEN                                                  */
  /* ================================================================ */
  const isLastSubQuestion =
    current.type === "reading_comprehension" && activeStoryQuestion
      ? storySubIndex + 1 === current.storyQuestions.length
      : true
  const isLastTopLevel = currentIndex + 1 === TOTAL_QUESTIONS
  const isFinalStep = current.type === "reading_comprehension"
    ? (!showingStoryText && isLastSubQuestion && isLastTopLevel)
    : isLastTopLevel
  const nextDisabled = current.type === "reading_comprehension"
    ? (!showingStoryText && selectedOption === null)
    : !canProceed

  return (
    <MarcoEvaluacion
      etiqueta={blockName}
      onVolver={() => salir("/test")}
      nino={acceso.nino}
      nivel="primario"
    >
      {dialogoSalida}

      {/* ---- Progress bar with dots ---- */}
      <BarraProgresoEvaluacion total={TOTAL_QUESTIONS} actual={currentIndex} etiqueta={blockName} />

      {/* ---- Question card ---- */}
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <TarjetaPregunta
          key={`${currentIndex}-${storySubIndex}`}
          bloque={blockName}
          audio={
            isHeardWord && (
              <BotonAudio onClick={speakQuestion} activo={speaking}>
                {speaking ? "Escuchando..." : "Escuchar de nuevo"}
              </BotonAudio>
            )
          }
        >
          {/* Context / story */}
          {current.type === "same_different" ? (
            /* Ejercicio A: only the two words, each with its own audio button */
            <div className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <ChipEstimulo className="px-5 py-2 text-2xl font-extrabold tracking-wide sm:text-3xl">{current.word1}</ChipEstimulo>
                <BotonAudio onClick={() => speak(current.word1)}>Escuchar</BotonAudio>
              </div>
              <span className="hidden text-3xl font-bold text-muted-foreground/60 sm:inline sm:text-4xl">–</span>
              <div className="flex flex-col items-center gap-2">
                <ChipEstimulo className="px-5 py-2 text-2xl font-extrabold tracking-wide sm:text-3xl">{current.word2}</ChipEstimulo>
                <BotonAudio onClick={() => speak(current.word2)}>Escuchar</BotonAudio>
              </div>
            </div>
          ) : showingStoryText && current.type === "reading_comprehension" ? (
            <div className="mb-4 w-full">
              {/* Bloque 5: la historia también se puede escuchar */}
              <div className="mb-2 flex justify-end">
                <BotonAudio onClick={() => speak(current.text)} activo={speaking}>
                  {speaking ? "Reproduciendo..." : "Escuchar historia"}
                </BotonAudio>
              </div>
              <div className="max-h-72 overflow-y-auto whitespace-pre-line rounded-2xl border border-border/70 bg-muted p-5 text-left text-base leading-relaxed text-foreground sm:p-6 sm:text-lg">
                {current.text}
              </div>
            </div>
          ) : current.type === "syllable_count" ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">{current.emoji}</span>
              <ChipEstimulo className="px-8 py-4 text-3xl font-bold tracking-widest sm:text-4xl">
                {current.syllableDisplay ?? current.word}
              </ChipEstimulo>
            </div>
          ) : current.type === "mirror_letters" ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">{current.emoji}</span>
              <ChipEstimulo className="px-8 py-4 text-3xl font-bold tracking-widest sm:text-4xl">
                {current.word}
              </ChipEstimulo>
            </div>
          ) : current.type === "sequence_order" ? (
            /* Ejercicio I: the words are only heard, never shown */
            <div className="mb-4 flex justify-center">
              <BotonAudio
                onClick={() => speakSequence(current.sequence)}
                disabled={speaking || playCount >= 2}
                activo={speaking}
                agotado={playCount >= 2}
                className="px-5"
              >
                {speaking
                  ? "Reproduciendo..."
                  : playCount >= 2
                    ? "Sin reproducciones"
                    : `Escuchar secuencia (quedan ${2 - playCount})`}
              </BotonAudio>
            </div>
          ) : current.type === "syllable_drag" ? (
            /* Ejercicio H: only the picture — the word has to be recalled, not read */
            <div className="mb-4 flex justify-center">
              <span className="text-5xl sm:text-6xl">{current.emoji}</span>
            </div>
          ) : current.type === "pseudo_audio" ? (
            /* Ejercicio P: the written pseudoword the audios have to match */
            <div className="mb-4 flex justify-center">
              <ChipEstimulo className="px-8 py-4 text-3xl font-bold tracking-widest">
                {current.writtenWord}
              </ChipEstimulo>
            </div>
          ) : current.type === "professional_rated" && current.displayWord ? (
            /* Bloque 8: the pseudoword to read aloud */
            <div className="mb-4 flex justify-center">
              <ChipEstimulo className="px-8 py-4 text-3xl font-bold tracking-widest">
                {current.displayWord}
              </ChipEstimulo>
            </div>
          ) : isSpokenSyllable ? (
            /* Ejercicio L: the syllable is only heard — replay it as often as needed */
            <div className="mb-4 flex justify-center">
              <BotonAudio
                onClick={() => autoPlayText && speak(autoPlayText)}
                activo={speaking}
                className="px-5"
              >
                {speaking ? "Escuchando..." : "Escuchar de nuevo"}
              </BotonAudio>
            </div>
          ) : isHeardWord ? (
            /* Ejercicio B: the word is heard, so nothing about it is shown */
            null
          ) : current.type === "multiple_choice" && current.block === 4 && "spokenWord" in current && current.spokenWord ? (
            /* Ejercicio J: the pseudoword is only heard — máximo 2 reproducciones voluntarias */
            <div className="mb-4 flex justify-center">
              <BotonAudio
                onClick={() => {
                  if (playCount >= 2 || !current.spokenWord) return
                  setPlayCount((prev) => prev + 1)
                  speak(current.spokenWord.toLowerCase())
                }}
                disabled={speaking || playCount >= 2}
                activo={speaking}
                agotado={playCount >= 2}
                className="px-5"
              >
                {speaking
                  ? "Escuchando..."
                  : playCount >= 2
                    ? "Sin reproducciones"
                    : `Escuchar palabra (quedan ${2 - playCount})`}
              </BotonAudio>
            </div>
          ) : current.type === "multiple_choice" && current.block === 7 && current.context ? (
            /* Ejercicio O: just the picture of the word to spell */
            <div className="mb-4 flex justify-center">
              <span className="text-6xl sm:text-7xl">{current.context}</span>
            </div>
          ) : current.type === "letter_fill" && current.context ? (
            /* Ejercicio M: picture above, incomplete word below */
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">{current.context.split(" ")[0]}</span>
              <ChipEstimulo className="px-8 py-4 text-3xl font-bold tracking-widest sm:text-4xl">
                {current.context.split(" ").slice(1).join(" ")}
              </ChipEstimulo>
            </div>
          ) : current.type === "multiple_choice" && current.context ? (
            /* Ejercicios D y J: the letters / pseudoword to work from */
            <div className="mb-4 flex flex-col items-center gap-2">
              <ChipEstimulo className="px-8 py-4 text-2xl font-bold tracking-widest sm:text-3xl">
                {current.context}
              </ChipEstimulo>
            </div>
          ) : null}

          {/* Prompt */}
          <div className="mb-6 flex items-center justify-center">
            <TituloConsigna grande={promptLarge}>{displayPrompt}</TituloConsigna>
          </div>

          {/* Options area */}
          {!showingStoryText && current.type === "sequence_order" ? (
            /* Ejercicio I: pick every word, the badge shows the order chosen */
            <div className="flex flex-1 flex-col justify-center py-2">
              <div className="grid grid-cols-1 gap-4">
                {current.options.map((opt, idx) => {
                  const order = sequenceSelection.indexOf(idx)
                  const isPicked = order !== -1
                  const optEmoji = questionEmojis[opt]
                  return (
                    <BotonOpcion
                      key={idx}
                      onClick={() => handleSequenceSelect(idx)}
                      disabled={speaking}
                      seleccionada={isPicked}
                      orden={isPicked ? order + 1 : undefined}
                    >
                      {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                      <span>{opt}</span>
                    </BotonOpcion>
                  )
                })}
              </div>
            </div>
          ) : !showingStoryText && current.type === "syllable_drag" ? (
            /* Ejercicio H: slots on top, the syllables still available underneath */
            <div className="flex flex-1 flex-col justify-center gap-6 py-2">
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-muted p-4">
                {current.syllables.map((_, slot) => (
                  <span
                    key={slot}
                    className={`
                      min-w-[5rem] rounded-xl border-2 px-4 py-3 text-center text-2xl font-extrabold tracking-widest
                      ${builtWord[slot]
                        ? "border-rojo bg-rojo-suave text-rojo-fuerte"
                        : "border-dashed border-input/60 bg-card text-muted-foreground/60"
                      }
                    `}
                  >
                    {builtWord[slot] ?? "___"}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {remainingSyllables.map((syl, idx) => (
                  <BotonOpcion
                    key={`${syl}-${idx}`}
                    onClick={() => handleSyllablePlace(syl)}
                    className="px-6 py-4 text-2xl font-extrabold tracking-widest"
                  >
                    {syl}
                  </BotonOpcion>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setBuiltWord([])} disabled={builtWord.length === 0}>
                  ✕ Borrar
                </Button>
              </div>
            </div>
          ) : !showingStoryText && current.type === "pseudo_audio" ? (
            /* Ejercicio P: three audios, the written form stays above */
            <div className="flex flex-1 flex-col justify-center gap-4 py-2">
              {current.audioOptions.map((audio, idx) => {
                const isSelected = selectedOption === idx
                const isPlaying = playingAudio === idx
                return (
                  <BotonOpcion
                    key={idx}
                    onClick={() => { handleSelect(idx); speakAudioOption(idx, audio) }}
                    seleccionada={isSelected}
                    className={`flex-row gap-3 ${isPlaying ? "animate-pulse" : ""}`}
                  >
                    <Volume2 className="size-5" />
                    Opción {idx + 1}
                  </BotonOpcion>
                )
              })}
            </div>
          ) : !showingStoryText && current.type === "professional_rated" ? (
            /* Ejercicio E: the professional rates the child's spoken answer */
            <div className="flex flex-1 flex-col justify-center py-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  current.ratingLabels?.correct ?? "Bien respondido",
                  current.ratingLabels?.incorrect ?? "Mal respondido",
                ].map((label, idx) => {
                  const isSelected = selectedOption === idx
                  const isGood = idx === 0
                  return (
                    <BotonOpcion
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      seleccionada={isSelected}
                      tono={isGood ? "menta" : "rojo"}
                      className="px-3 py-8 text-center text-xl font-extrabold sm:px-8 sm:text-2xl"
                    >
                      <span className="text-4xl">{isGood ? "✓" : "✗"}</span>
                      {label}
                    </BotonOpcion>
                  )
                })}
              </div>
            </div>
          ) : !showingStoryText && (
            <div className="flex flex-1 flex-col justify-center py-2">
              <div className={`grid gap-4 ${displayOptions.length <= 2 ? "grid-cols-2" : displayOptions.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
                {displayOptions.map((opt, idx) => {
                  const isSelected = selectedOption === idx

                  // same_different: Sí / No buttons with emojis
                  if (!activeStoryQuestion && current.type === "same_different") {
                    const isSame = idx === 0
                    return (
                      <BotonOpcion
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        seleccionada={isSelected}
                        tono={isSame ? "menta" : "rojo"}
                        className="px-4 py-8 text-2xl font-extrabold sm:px-8"
                      >
                        <span className="text-4xl">{isSame ? "👍" : "👎"}</span>
                        {isSame ? "Sí" : "No"}
                      </BotonOpcion>
                    )
                  }

                  // mirror_letters: 2 large lowercase letter buttons
                  if (!activeStoryQuestion && current.type === "mirror_letters") {
                    return (
                      <BotonOpcion
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        seleccionada={isSelected}
                        className="px-8 py-10 text-5xl font-extrabold"
                      >
                        {String(opt).toLowerCase()}
                      </BotonOpcion>
                    )
                  }

                  // Default option buttons (multiple_choice, letter_fill, syllable_count, reading_comprehension questions)
                  const optLabel = String(opt)
                  const optEmoji = optionsShowEmoji ? questionEmojis[optLabel] : undefined
                  return (
                    <BotonOpcion key={idx} onClick={() => handleSelect(idx)} seleccionada={isSelected}>
                      {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                      <span>{optLabel}</span>
                    </BotonOpcion>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next button */}
          <div className="flex justify-end pt-4">
            <Button size="lg" disabled={nextDisabled} onClick={handleNext}>
              {isFinalStep ? "Finalizar" : "Siguiente"}
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </TarjetaPregunta>
      </div>
    </MarcoEvaluacion>
  )
}
