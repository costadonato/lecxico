"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ArrowRight, RotateCcw, Home, Volume2 } from "lucide-react"

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
  { id: 11, block: 2, type: 'multiple_choice', question: '¿Cómo queda GATO sin la /g/?', options: ['TATO', 'ATO', 'GATO'], correct: 'ATO' },
  { id: 12, block: 2, type: 'multiple_choice', question: '¿Cómo queda SALA sin la /s/?', options: ['SALA', 'LASA', 'ALA'], correct: 'ALA' },

  // BLOQUE 3 — Conciencia Silábica
  // Ejercicio F — Conteo de sílabas
  { id: 13, block: 3, type: 'syllable_count', word: 'MARIPOSA', options: [3, 4, 5], correct: 4, emoji: '🦋' },
  { id: 14, block: 3, type: 'syllable_count', word: 'PELOTA', options: [2, 3, 4], correct: 3, emoji: '⚽' },
  // Ejercicio G — Sílaba inicial
  { id: 15, block: 3, type: 'multiple_choice', question: '¿Cuál empieza con la misma sílaba que PELOTA?', options: ['PERA', 'MESA', 'CASA'], correct: 'PERA' },
  { id: 16, block: 3, type: 'multiple_choice', question: '¿Cuál empieza con la misma sílaba que CAMISA?', options: ['CABALLO', 'PELOTA', 'NUBE'], correct: 'CABALLO' },
  // Ejercicio H — Construir la palabra
  { id: 17, block: 3, type: 'syllable_drag', word: 'LUNA', emoji: '🌙', syllables: ['NA', 'LU'], correct: ['LU', 'NA'] },
  { id: 18, block: 3, type: 'syllable_drag', word: 'TOMATE', emoji: '🍅', syllables: ['TE', 'TO', 'MA'], correct: ['TO', 'MA', 'TE'] },

  // BLOQUE 4 — Memoria Fonológica
  // Ejercicio I — Repetir secuencia
  { id: 19, block: 4, type: 'sequence_order', sequence: ['CONEJO', 'CASA', 'LÁPIZ'], options: ['CASA', 'CONEJO', 'LÁPIZ'], correctOrder: [1, 0, 2] },
  { id: 20, block: 4, type: 'sequence_order', sequence: ['ZAPATO', 'SOL', 'MESA'], options: ['MESA', 'SOL', 'ZAPATO'], correctOrder: [2, 1, 0] },
  { id: 21, block: 4, type: 'sequence_order', sequence: ['LUNA', 'LIBRO', 'PERRO', 'MATE'], options: ['PERRO', 'LUNA', 'LIBRO', 'MATE'], correctOrder: [1, 2, 0, 3] },
  // Ejercicio J — Pseudopalabras orales
  { id: 22, block: 4, type: 'multiple_choice', question: '¿Cuál de estas opciones es la palabra que escuchaste?', options: ['FUNO', 'NUFO', 'FUBO'], correct: 'FUNO', spokenWord: 'FUNO' },
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
  { id: 28, block: 6, type: 'letter_fill', question: '¿Qué letra falta?', context: '🧠 CA_EZA', word: 'CA_EZA', options: ['B', 'E', 'R', 'Q'], correct: 'B' },
  { id: 29, block: 6, type: 'letter_fill', question: '¿Qué letra falta?', context: '🦆 _ATO', word: '_ATO', options: ['P', 'G', 'B', 'D'], correct: 'P' },
  // Ejercicio N — Letras espejo
  { id: 30, block: 6, type: 'mirror_letters', question: '¿Qué letra va aquí?', word: '_ado', emoji: '🎲', options: ['b', 'd'], correct: 'd' },
  { id: 31, block: 6, type: 'mirror_letters', question: '¿Qué letra va aquí?', word: '_eso', emoji: '💋', options: ['b', 'd'], correct: 'b' },

  // BLOQUE 7 — Reconocimiento Visual
  { id: 32, block: 7, type: 'multiple_choice', question: '¿Cuál está bien escrita?', options: ['PEROO', 'PERO', 'PERRO'], correct: 'PERRO', context: '🐕' },
  { id: 33, block: 7, type: 'multiple_choice', question: '¿Cuál está bien escrita?', options: ['AOTO', 'AUTO', 'AUTOO'], correct: 'AUTO', context: '🚗' },

  // BLOQUE 8 — Lectura de Pseudopalabras
  { id: 34, block: 8, type: 'pseudo_audio', writtenWord: 'GOPI', audioOptions: ['gopi', 'pogi', 'govi'], correct: 'gopi' },
  { id: 35, block: 8, type: 'pseudo_audio', writtenWord: 'FUMISA', audioOptions: ['fumosa', 'misafu', 'fumisa'], correct: 'fumisa' },
]

const TOTAL_QUESTIONS = questions.length

/* ------------------------------------------------------------------ */
/*  EMOJI MAP  (word -> emoji, used for multiple_choice/letter_fill    */
/*  option buttons)                                                    */
/* ------------------------------------------------------------------ */
const questionEmojis: Record<string, string> = {
  'MARIPOSA': '🦋', 'ABEJA': '🐝', 'ORUGA': '🐛', 'ELEFANTE': '🐘',
  'JIRAFA': '🦒', 'CEBRA': '🦓', 'PATO': '🦆', 'SOL': '☀️', 'MESA': '🪑',
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

/* Diagonal gradient: near-black red → dark red → deep indigo */
const backgroundStyle = {
  background: "linear-gradient(135deg, #1a0000 0%, #7f1d1d 50%, #1e1e2e 100%)",
}

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
  const router = useRouter()
  const supabase = createClient()

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
      parts.push(current.word)
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
        : current.type === "multiple_choice" && current.block === 4 && "spokenWord" in current && current.spokenWord
          ? current.spokenWord.toLowerCase()
          : null

  useEffect(() => {
    if (autoPlayText) speak(autoPlayText)
  }, [currentIndex, autoPlayText, speak])

  /* ---- empty-data guard ---- */
  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={backgroundStyle}>
        <h1 className="text-2xl font-bold text-white">Test de Nivel Primario</h1>
        <p className="text-white/70">Todavía no hay preguntas cargadas para este nivel.</p>
        <button
          onClick={() => router.push("/test")}
          className="flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-400 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200"
        >
          Volver
        </button>
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
          current.type === "pseudo_audio"
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
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const blockResults = computeResults()
      await supabase.from("test_resultados_primaria").insert({
        user_id: user.id,
        fecha: new Date().toISOString(),
        puntaje_total: totalCorrect,
        porcentaje_total: totalPct,
        bloque_1_correctas: blockResults[0].correct,
        bloque_2_correctas: blockResults[1].correct,
        bloque_3_correctas: blockResults[2].correct,
        bloque_4_correctas: blockResults[3].correct,
        bloque_5_correctas: blockResults[4].correct,
        bloque_6_correctas: blockResults[5].correct,
        bloque_7_correctas: blockResults[6].correct,
        bloque_8_correctas: blockResults[7]?.correct ?? 0,
        conclusion: totalPct < 60 ? "indicadores_detectados" : "sin_indicadores",
      })
      setSaved(true)
    } catch (err) {
      console.error("Error al guardar:", err)
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
    setStorySubIndex(-1)
    setStoryAnswers({})
  }

  /* ---- auto-save results as soon as the test finishes ---- */
  useEffect(() => {
    if (finished) handleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  /* ================================================================ */
  /*  RESULTS SCREEN                                                   */
  /* ================================================================ */
  if (finished) {
    const blockResults = computeResults()
    const hasIndicators = totalPct < 60
    const getScoreColor = (pct: number) => {
      if (pct >= 80) return "text-green-400"
      if (pct >= 60) return "text-yellow-400"
      if (pct >= 40) return "text-orange-400"
      return "text-red-400"
    }

    return (
      <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
        {/* ---- Ambient blurred orbs (depth) ---- */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-red-500 opacity-20 blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-pink-500 opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-orange-500 opacity-20 blur-3xl" />
        </div>

        {/* ---- Navbar ---- */}
        <header className="relative z-10 h-16 bg-red-600 shadow-lg">
          <div className="container mx-auto h-full px-4 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Lecxico</h1>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-white font-medium">Resultados del Test</span>
              <button
                onClick={() => router.push("/test")}
                className="flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-2xl mx-auto space-y-8 py-10 px-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Resultados del Test</h2>
          </div>

          {/* Score summary */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center">
            <p className="text-5xl font-extrabold text-white">{totalPct}%</p>
            <p className="text-lg text-white/70 mt-2">{totalCorrect} de {totalAnswerable} respuestas correctas</p>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/10">
                  <tr>
                    <th className="py-3 px-4 text-white font-semibold">Bloque</th>
                    <th className="py-3 px-4 text-center text-white font-semibold">Correctas</th>
                    <th className="py-3 px-4 text-center text-white font-semibold">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {blockResults.map((b) => (
                    <tr key={b.id} className="border-t border-white/10">
                      <td className="py-3 px-4 font-medium text-white">{b.name}</td>
                      <td className="py-3 px-4 text-center text-white/70">{b.correct} / {b.total}</td>
                      <td className={`py-3 px-4 text-center font-bold ${getScoreColor(b.pct)}`}>{b.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conclusion */}
          <div className={`rounded-2xl bg-white/10 backdrop-blur-md border p-6 flex items-start gap-4 ${hasIndicators ? "border-red-400/60" : "border-green-400/60"}`}>
            {hasIndicators ? (
              <XCircle className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold text-lg ${hasIndicators ? "text-red-300" : "text-green-300"}`}>
                {hasIndicators
                  ? "Se detectaron indicadores de dislexia"
                  : "No se detectaron indicadores significativos"}
              </p>
              <p className="text-sm text-white/70 mt-2">
                Este test es orientativo y <span className="font-semibold text-white/90">no reemplaza un diagnóstico profesional</span>.
                Te recomendamos consultar con un especialista para una evaluación completa.
              </p>
            </div>
          </div>

          {/* Save status indicator */}
          {(saving || saved) && (
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando resultados...
                </>
              ) : (
                "Resultados guardados ✓"
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pb-10">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-400 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" /> Repetir test
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-400 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200"
            >
              <Home className="w-4 h-4" /> Volver al inicio
            </button>
          </div>
        </main>
      </div>
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
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={backgroundStyle}>
      {/* ---- Ambient blurred orbs (depth) ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-red-500 opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-pink-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-orange-500 opacity-20 blur-3xl" />
      </div>

      {/* ---- Navbar ---- */}
      <header className="relative z-10 h-16 bg-red-600 shadow-lg shrink-0">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Lecxico</h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-white font-medium">{blockName}</span>
            <button
              onClick={() => router.push("/test")}
              className="flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </header>

      {/* ---- Progress bar with dots ---- */}
      <div className="relative z-10 w-full px-4 py-6">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-[6px] bg-white/20 -translate-y-1/2 rounded-full" />
          {/* Filled line */}
          <div
            className="absolute top-1/2 left-0 h-[6px] bg-red-400 -translate-y-1/2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / (TOTAL_QUESTIONS - 1)) * 100}%` }}
          />
          {/* Dots */}
          {questions.map((_, idx) => {
            const isCompleted = idx < currentIndex
            const isCurrent = idx === currentIndex
            return (
              <div
                key={idx}
                className={`
                  relative z-10 rounded-full transition-all duration-300 flex items-center justify-center
                  ${isCurrent
                    ? "w-8 h-8 bg-white"
                    : isCompleted
                      ? "w-5 h-5 bg-red-400"
                      : "w-5 h-5 bg-white/20"
                  }
                `}
              >
                {isCurrent && (
                  <span className="text-xs font-bold text-red-600">{idx + 1}</span>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-center text-sm font-semibold text-white/70 mt-3">
          {blockName}
        </p>
      </div>

      {/* ---- Question card ---- */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div
          key={`${currentIndex}-${storySubIndex}`}
          className="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ minHeight: "60vh" }}
        >
          {/* Block name badge + audio button */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-block text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-full">
              {blockName}
            </span>
            {isHeardWord && (
              <button
                onClick={speakQuestion}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                  ${speaking
                    ? "bg-white/30 text-white animate-pulse"
                    : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
              >
                <Volume2 className="w-4 h-4" />
                {speaking ? "Escuchando..." : "Escuchar de nuevo"}
              </button>
            )}
          </div>

          {/* Context / story */}
          {current.type === "same_different" ? (
            /* Ejercicio A: only the two words, each with its own audio button */
            <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <span className="bg-white/20 rounded-xl px-5 py-2 text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{current.word1}</span>
                <button
                  onClick={() => speak(current.word1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white hover:bg-white/30 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  Escuchar
                </button>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-white/40">–</span>
              <div className="flex flex-col items-center gap-2">
                <span className="bg-white/20 rounded-xl px-5 py-2 text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{current.word2}</span>
                <button
                  onClick={() => speak(current.word2)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white hover:bg-white/30 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  Escuchar
                </button>
              </div>
            </div>
          ) : showingStoryText && current.type === "reading_comprehension" ? (
            <div className="mb-4 w-full">
              {/* Bloque 5: la historia también se puede escuchar */}
              <div className="mb-2 flex justify-end">
                <button
                  onClick={() => speak(current.text)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
                    ${speaking
                      ? "bg-white/30 text-white animate-pulse"
                      : "bg-white/20 text-white hover:bg-white/30"
                    }
                  `}
                >
                  <Volume2 className="w-4 h-4" />
                  {speaking ? "Reproduciendo..." : "Escuchar historia"}
                </button>
              </div>
              <div className="bg-white/20 rounded-xl p-6 max-h-72 overflow-y-auto text-left text-base sm:text-lg leading-relaxed text-white whitespace-pre-line">
                {current.text}
              </div>
            </div>
          ) : current.type === "syllable_count" ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">{current.emoji}</span>
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-3xl sm:text-4xl font-bold tracking-widest text-white">
                {current.word}
              </span>
            </div>
          ) : current.type === "mirror_letters" ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="text-5xl sm:text-6xl">{current.emoji}</span>
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-3xl sm:text-4xl font-bold tracking-widest text-white">
                {current.word}
              </span>
            </div>
          ) : current.type === "sequence_order" ? (
            /* Ejercicio I: the words are only heard, never shown */
            <div className="mb-4 flex justify-center">
              <button
                onClick={() => speakSequence(current.sequence)}
                disabled={speaking || playCount >= 2}
                className={`
                  inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${speaking
                    ? "bg-white/30 text-white animate-pulse"
                    : playCount >= 2
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
              >
                <Volume2 className="w-5 h-5" />
                {speaking
                  ? "Reproduciendo..."
                  : playCount >= 2
                    ? "Sin reproducciones"
                    : `Escuchar secuencia (quedan ${2 - playCount})`}
              </button>
            </div>
          ) : current.type === "syllable_drag" ? (
            /* Ejercicio H: only the picture — the word has to be recalled, not read */
            <div className="mb-4 flex justify-center">
              <span className="text-5xl sm:text-6xl">{current.emoji}</span>
            </div>
          ) : current.type === "pseudo_audio" ? (
            /* Ejercicio P: the written pseudoword the audios have to match */
            <div className="mb-4 flex justify-center">
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-3xl font-bold tracking-widest text-white">
                {current.writtenWord}
              </span>
            </div>
          ) : isSpokenSyllable ? (
            /* Ejercicio L: the syllable is only heard — replay it as often as needed */
            <div className="mb-4 flex justify-center">
              <button
                onClick={() => autoPlayText && speak(autoPlayText)}
                className={`
                  inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${speaking
                    ? "bg-white/30 text-white animate-pulse"
                    : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
              >
                <Volume2 className="w-5 h-5" />
                {speaking ? "Escuchando..." : "Escuchar de nuevo"}
              </button>
            </div>
          ) : isHeardWord ? (
            /* Ejercicio B: the word is heard, so nothing about it is shown */
            null
          ) : current.type === "multiple_choice" && current.block === 4 && "spokenWord" in current && current.spokenWord ? (
            /* Ejercicio J: the pseudoword is only heard — replay it as often as needed */
            <div className="mb-4 flex justify-center">
              <button
                onClick={() => current.spokenWord && speak(current.spokenWord.toLowerCase())}
                className={`
                  inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${speaking
                    ? "bg-white/30 text-white animate-pulse"
                    : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
              >
                <Volume2 className="w-5 h-5" />
                {speaking ? "Escuchando..." : "Escuchar palabra"}
              </button>
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
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-3xl sm:text-4xl font-bold tracking-widest text-white">
                {current.context.split(" ").slice(1).join(" ")}
              </span>
            </div>
          ) : current.type === "multiple_choice" && current.context ? (
            /* Ejercicios D y J: the letters / pseudoword to work from */
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-2xl sm:text-3xl font-bold tracking-widest text-white">
                {current.context}
              </span>
            </div>
          ) : null}

          {/* Prompt */}
          <div className="mb-6 flex items-center justify-center">
            <h2 className={`font-bold text-white text-center ${promptLarge ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
              {displayPrompt}
            </h2>
          </div>

          {/* Options area */}
          {!showingStoryText && current.type === "sequence_order" ? (
            /* Ejercicio I: pick every word, the badge shows the order chosen */
            <div className="flex-1 flex flex-col justify-center py-2">
              <div className="grid gap-4 grid-cols-1">
                {current.options.map((opt, idx) => {
                  const order = sequenceSelection.indexOf(idx)
                  const isPicked = order !== -1
                  const optEmoji = questionEmojis[opt]
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSequenceSelect(idx)}
                      disabled={speaking}
                      className={`
                        relative rounded-2xl border py-5 px-6 text-lg font-bold transition-all duration-200 flex flex-col items-center gap-2
                        ${isPicked
                          ? "bg-red-500 border-red-400 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }
                        ${speaking ? "opacity-40 cursor-not-allowed" : ""}
                      `}
                    >
                      {isPicked && (
                        <span className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white text-red-600 text-sm font-extrabold">
                          {order + 1}°
                        </span>
                      )}
                      {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : !showingStoryText && current.type === "syllable_drag" ? (
            /* Ejercicio H: slots on top, the syllables still available underneath */
            <div className="flex-1 flex flex-col justify-center gap-6 py-2">
              <div className="flex items-center justify-center gap-3 flex-wrap bg-white/10 rounded-xl p-4">
                {current.syllables.map((_, slot) => (
                  <span
                    key={slot}
                    className={`
                      min-w-[5rem] rounded-lg px-4 py-3 text-center text-2xl font-extrabold tracking-widest
                      ${builtWord[slot]
                        ? "bg-white text-red-600"
                        : "bg-white/10 text-white/40"
                      }
                    `}
                  >
                    {builtWord[slot] ?? "___"}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                {remainingSyllables.map((syl, idx) => (
                  <button
                    key={`${syl}-${idx}`}
                    onClick={() => handleSyllablePlace(syl)}
                    className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-2xl font-extrabold tracking-widest text-white transition-all duration-200 hover:bg-white/20"
                  >
                    {syl}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setBuiltWord([])}
                  disabled={builtWord.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white transition-all hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✕ Borrar
                </button>
              </div>
            </div>
          ) : !showingStoryText && current.type === "pseudo_audio" ? (
            /* Ejercicio P: three audios, the written form stays above */
            <div className="flex-1 flex flex-col justify-center gap-4 py-2">
              {current.audioOptions.map((audio, idx) => {
                const isSelected = selectedOption === idx
                const isPlaying = playingAudio === idx
                return (
                  <button
                    key={idx}
                    onClick={() => { handleSelect(idx); speakAudioOption(idx, audio) }}
                    className={`
                      rounded-2xl border py-5 px-6 text-lg font-bold transition-all duration-200 flex items-center justify-center gap-3
                      ${isSelected
                        ? "bg-red-500 border-red-400 text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      }
                      ${isPlaying ? "animate-pulse" : ""}
                    `}
                  >
                    <Volume2 className="w-5 h-5" />
                    Opción {idx + 1}
                  </button>
                )
              })}
            </div>
          ) : !showingStoryText && (
            <div className="flex-1 flex flex-col justify-center py-2">
              <div className={`grid gap-4 ${displayOptions.length <= 2 ? "grid-cols-2" : displayOptions.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
                {displayOptions.map((opt, idx) => {
                  const isSelected = selectedOption === idx

                  // same_different: Sí / No buttons with emojis
                  if (!activeStoryQuestion && current.type === "same_different") {
                    const isSame = idx === 0
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`
                          rounded-2xl py-8 px-8 text-2xl font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-2 border
                          ${isSelected
                            ? isSame
                              ? "bg-green-500/80 border-green-400 text-white"
                              : "bg-red-500/80 border-red-400 text-white"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                          }
                        `}
                      >
                        <span className="text-4xl">{isSame ? "👍" : "👎"}</span>
                        {isSame ? "Sí" : "No"}
                      </button>
                    )
                  }

                  // mirror_letters: 2 large lowercase letter buttons
                  if (!activeStoryQuestion && current.type === "mirror_letters") {
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`
                          rounded-2xl py-10 px-8 text-5xl font-extrabold transition-all duration-200 flex items-center justify-center border
                          ${isSelected
                            ? "bg-red-500 border-red-400 text-white"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                          }
                        `}
                      >
                        {String(opt).toLowerCase()}
                      </button>
                    )
                  }

                  // Default option buttons (multiple_choice, letter_fill, syllable_count, reading_comprehension questions)
                  const optLabel = String(opt)
                  const optEmoji = optionsShowEmoji ? questionEmojis[optLabel] : undefined
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`
                        rounded-2xl border py-5 px-6 text-lg font-bold transition-all duration-200 flex flex-col items-center gap-2
                        ${isSelected
                          ? "bg-red-500 border-red-400 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }
                      `}
                    >
                      {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                      <span>{optLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next button */}
          <div className="pt-4 flex justify-end">
            <button
              disabled={nextDisabled}
              onClick={handleNext}
              className={`
                flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold transition-all duration-200
                ${nextDisabled
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-400 text-white shadow-lg"
                }
              `}
            >
              {isFinalStep ? "Finalizar" : "Siguiente"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
