"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ArrowRight, RotateCcw, Save, Home, Volume2 } from "lucide-react"

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

type Question =
  | SameDifferentQuestion
  | MultipleChoiceQuestion
  | SyllableCountQuestion
  | ReadingComprehensionQuestion
  | LetterFillQuestion
  | MirrorLettersQuestion

/* ------------------------------------------------------------------ */
/*  QUESTION DATA  (7 blocks)                                          */
/* ------------------------------------------------------------------ */
const questions: Question[] = [
  // BLOQUE 1 — Discriminación Auditiva
  { id: 1, block: 1, type: 'same_different', word1: 'PALETA', word2: 'BALETA', correct: 'different', emoji1: '🍭', emoji2: '💃' },
  { id: 2, block: 1, type: 'same_different', word1: 'CAMINO', word2: 'CAMINO', correct: 'same', emoji1: '🛣️', emoji2: '🛣️' },
  { id: 3, block: 1, type: 'same_different', word1: 'CABALLO', word2: 'CABELLO', correct: 'different', emoji1: '🐴', emoji2: '💇' },

  // BLOQUE 2 — Conciencia Fonológica
  // C - Sonido inicial
  { id: 4, block: 2, type: 'multiple_choice', question: '¿Cuál empieza con el mismo sonido que MESA?', options: ['MARIPOSA', 'PATO', 'SOL'], correct: 'MARIPOSA', context: '🔊 MESA' },
  { id: 5, block: 2, type: 'multiple_choice', question: '¿Cuál empieza con el mismo sonido que BARCO?', options: ['BICICLETA', 'MESA', 'TORO'], correct: 'BICICLETA', context: '🔊 BARCO' },
  // D - Síntesis fonémica
  { id: 6, block: 2, type: 'multiple_choice', question: '¿Qué palabra se puede formar con estas letras?', options: ['SOL', 'AMO', 'MAR'], correct: 'SOL', context: 'S / O / L' },
  { id: 7, block: 2, type: 'multiple_choice', question: '¿Qué palabra se puede formar con estas letras?', options: ['MAR', 'MAS', 'LOS'], correct: 'MAR', context: 'M / A / R' },
  { id: 8, block: 2, type: 'multiple_choice', question: '¿Qué palabra se puede formar con estas letras?', options: ['GATO', 'RATA', 'MANO'], correct: 'GATO', context: 'G / A / T / O' },
  // E - Omisión de fonema
  { id: 9, block: 2, type: 'multiple_choice', question: '¿Cómo queda GATO sin la /g/?', options: ['ATO', 'TATO', 'GATO'], correct: 'ATO', context: 'GATO sin la /g/' },
  { id: 10, block: 2, type: 'multiple_choice', question: '¿Cómo queda SALA sin la /s/?', options: ['ALA', 'SALA', 'LASA'], correct: 'ALA', context: 'SALA sin la /s/' },

  // BLOQUE 3 — Conciencia Silábica
  // F - Conteo de sílabas
  { id: 11, block: 3, type: 'syllable_count', word: 'MARIPOSA', options: [3, 4, 5], correct: 4, emoji: '🦋' },
  { id: 12, block: 3, type: 'syllable_count', word: 'PELOTA', options: [2, 3, 4], correct: 3, emoji: '🎾' },
  // G - Sílaba inicial
  { id: 13, block: 3, type: 'multiple_choice', question: '¿Cuál empieza con la misma sílaba que PELOTA?', options: ['PERA', 'MESA', 'CASA'], correct: 'PERA', context: '🔊 PELOTA (PE-)' },
  { id: 14, block: 3, type: 'multiple_choice', question: '¿Cuál empieza con la misma sílaba que CAMISA?', options: ['CABALLO', 'PELOTA', 'NUBE'], correct: 'CABALLO', context: '🔊 CAMISA (CA-)' },

  // BLOQUE 4 — Memoria Fonológica
  { id: 15, block: 4, type: 'multiple_choice', question: '¿Cuál de estas palabras escuchaste primero?', options: ['LÁPIZ', 'CASA', 'CONEJO'], correct: 'CASA', context: '🔊 CASA – CONEJO – LÁPIZ' },
  { id: 16, block: 4, type: 'multiple_choice', question: '¿Cuál de estas palabras escuchaste segundo?', options: ['MESA', 'ZAPATO', 'SOL'], correct: 'SOL', context: '🔊 MESA – SOL – ZAPATO' },
  { id: 17, block: 4, type: 'multiple_choice', question: '¿Cuál de estas palabras escuchaste último?', options: ['PERRO', 'LIBRO', 'LUNA'], correct: 'LIBRO', context: '🔊 PERRO – LUNA – LIBRO' },

  // BLOQUE 5 — Comprensión Lectora
  {
    id: 18, block: 5, type: 'reading_comprehension',
    text: 'Sofía tiene un perro llamado Toto. Toto es muy juguetón y le encanta correr. Un día, Sofía y Toto fueron al parque a jugar. Allí, Toto encontró una pelota roja brillante. La agarró con la boca y la trajo de vuelta a Sofía. ¡Sofía estaba muy feliz!',
    storyQuestions: [
      { question: '¿Cómo se llama el perro de Sofía?', options: ['Pepe', 'Toto', 'Nino'], correct: 'Toto' },
      { question: '¿A dónde fueron Sofía y Toto?', options: ['Al río', 'Al parque', 'A la escuela'], correct: 'Al parque' },
      { question: '¿Qué encontró Toto en el parque?', options: ['Un hueso', 'Un sombrero', 'Una pelota roja'], correct: 'Una pelota roja' }
    ]
  },

  // BLOQUE 6 — Correspondencia Sonido-Letra
  // L - ¿Qué letra suena?
  { id: 19, block: 6, type: 'letter_fill', question: '¿Qué letra suena así?', context: '🔊 /ma/', word: '/ma/', options: ['M', 'N', 'B', 'P'], correct: 'M' },
  { id: 20, block: 6, type: 'letter_fill', question: '¿Qué letra suena así?', context: '🔊 /pa/', word: '/pa/', options: ['B', 'D', 'P', 'T'], correct: 'P' },
  // M - Letra faltante
  { id: 21, block: 6, type: 'letter_fill', question: '¿Qué letra falta?', context: '🧠 CA_EZA', word: 'CA_EZA', options: ['B', 'E', 'R', 'Q'], correct: 'B' },
  { id: 22, block: 6, type: 'letter_fill', question: '¿Qué letra falta?', context: '🦆 _ATO', word: '_ATO', options: ['P', 'G', 'B', 'D'], correct: 'P' },
  // N - Letras espejo
  { id: 23, block: 6, type: 'mirror_letters', question: '¿Qué letra va aquí?', word: '_ADO', emoji: '🎲', options: ['b', 'd'], correct: 'd' },
  { id: 24, block: 6, type: 'mirror_letters', question: '¿Qué letra va aquí?', word: '_ESO', emoji: '💋', options: ['b', 'd'], correct: 'b' },

  // BLOQUE 7 — Reconocimiento Visual
  { id: 25, block: 7, type: 'multiple_choice', question: '¿Cuál está bien escrita?', options: ['ELEFANTE', 'ELANTE', 'ELEFENT'], correct: 'ELEFANTE', context: '🐘' },
  { id: 26, block: 7, type: 'multiple_choice', question: '¿Cuál está bien escrita?', options: ['MARIPOSSA', 'MARIPOSA', 'MARIPOSE'], correct: 'MARIPOSA', context: '🦋' },
]

const TOTAL_QUESTIONS = questions.length

/* ------------------------------------------------------------------ */
/*  EMOJI MAP  (word -> emoji, used for multiple_choice/letter_fill    */
/*  option buttons)                                                    */
/* ------------------------------------------------------------------ */
const questionEmojis: Record<string, string> = {
  'MARIPOSA': '🦋', 'PATO': '🦆', 'SOL': '☀️', 'BICICLETA': '🚲',
  'MESA': '🪑', 'TORO': '🐂', 'PELOTA': '🎾', 'RATA': '🐀',
  'MANO': '🤚', 'GATO': '🐱', 'PERA': '🍐', 'CASA': '🏠',
  'CABALLO': '🐴', 'NUBE': '☁️', 'LÁPIZ': '✏️', 'CONEJO': '🐰',
  'ZAPATO': '👟', 'LIBRO': '📚', 'PERRO': '🐕', 'LUNA': '🌙',
  'ELEFANTE': '🐘', 'AMO': '❤️', 'MAR': '🌊', 'MAS': '➕',
  'LOS': '👥', 'ATO': '❓', 'ALA': '🐦', 'SALA': '🏠', 'LASA': '❓',
}

const BLOCKS = [
  { id: 1, name: "Discriminación Auditiva" },
  { id: 2, name: "Conciencia Fonológica" },
  { id: 3, name: "Conciencia Silábica" },
  { id: 4, name: "Memoria Fonológica" },
  { id: 5, name: "Comprensión Lectora" },
  { id: 6, name: "Correspondencia Sonido-Letra" },
  { id: 7, name: "Reconocimiento Visual" },
]

/* Diagonal gradient: near-black red → dark red → deep indigo */
const backgroundStyle = {
  background: "linear-gradient(135deg, #1a0000 0%, #7f1d1d 50%, #1e1e2e 100%)",
}

/** Was the option at `idx` the correct answer for a top-level question? */
const isOptionCorrect = (q: Question, idx: number): boolean => {
  switch (q.type) {
    case "same_different":
      return (idx === 0 ? "same" : "different") === q.correct
    case "multiple_choice":
    case "letter_fill":
    case "mirror_letters":
      return q.options[idx] === q.correct
    case "syllable_count":
      return q.options[idx] === q.correct
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
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL_QUESTIONS).fill(null))
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
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
        ? "¿Estas palabras suenan igual o diferente?"
        : current.type === "syllable_count"
          ? `¿Cuántas sílabas tiene la palabra ${current.word}?`
          : current.type === "reading_comprehension"
            ? "Leé el siguiente cuento y respondé las preguntas."
            : current.question

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.85
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
      ? ["Sí", "No"]
      : current.type === "reading_comprehension"
        ? []
        : current.options

  /* ---- handlers ---- */
  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx)
  }

  const goToNextTopLevel = () => {
    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
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

    if (selectedOption === null) return
    const updated = [...answers]
    updated[currentIndex] = selectedOption
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
    setFinished(false)
    setSaved(false)
    setStorySubIndex(-1)
    setStoryAnswers({})
  }

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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pb-10">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-400 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:bg-white/10 disabled:text-white/50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar resultados"}
            </button>
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
    : selectedOption === null

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
              {speaking ? "Escuchando..." : "Escuchar"}
            </button>
          </div>

          {/* Context / story */}
          {current.type === "same_different" ? (
            <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl sm:text-6xl">{current.emoji1}</span>
                <span className="bg-white/20 rounded-xl px-5 py-2 text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{current.word1}</span>
              </div>
              <span className="text-3xl sm:text-4xl font-bold text-white/40">–</span>
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl sm:text-6xl">{current.emoji2}</span>
                <span className="bg-white/20 rounded-xl px-5 py-2 text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{current.word2}</span>
              </div>
            </div>
          ) : showingStoryText && current.type === "reading_comprehension" ? (
            <div className="mb-4 w-full">
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
          ) : (current.type === "multiple_choice" || current.type === "letter_fill") && current.context ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-2xl sm:text-3xl font-bold tracking-widest text-white">
                {current.context}
              </span>
            </div>
          ) : null}

          {/* Prompt */}
          <div className="mb-6 flex items-center justify-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
              {displayPrompt}
            </h2>
          </div>

          {/* Options area */}
          {!showingStoryText && (
            <div className="flex-1 flex flex-col justify-center py-2">
              <div className={`grid gap-4 ${displayOptions.length <= 2 ? "grid-cols-2" : displayOptions.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
                {displayOptions.map((opt, idx) => {
                  const isSelected = selectedOption === idx

                  // same_different: Sí / No buttons
                  if (!activeStoryQuestion && current.type === "same_different") {
                    const isYes = idx === 0
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`
                          rounded-2xl py-8 px-8 text-2xl font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-2 border
                          ${isSelected
                            ? isYes
                              ? "bg-green-500/80 border-green-400 text-white"
                              : "bg-red-500/80 border-red-400 text-white"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                          }
                        `}
                      >
                        <span className="text-4xl">{isYes ? "👍" : "👎"}</span>
                        {isYes ? "Sí" : "No"}
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
                  const optEmoji = current.block === 7 ? undefined : questionEmojis[optLabel]
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
                      <span className="flex items-center gap-2">
                        {optLabel}
                        <Volume2
                          className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); speak(optLabel) }}
                        />
                      </span>
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
