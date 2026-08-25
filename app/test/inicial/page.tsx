"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ArrowRight, RotateCcw, Home, Volume2 } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
type QuestionType = "same_different" | "multiple_choice" | "syllable_count" | "letter_fill" | "word_image" | "syllable_match" | "sequence_order"

interface Question {
  id: number
  block: number
  blockName: string
  type: QuestionType
  prompt: string
  options: string[]
  /** Correct option index (single-answer questions) */
  correctIndex?: number
  /** Extra context shown above the prompt (e.g. the two words to compare) */
  context?: string
  /** Words played (in order) for sequence_order questions — heard, not shown */
  sequence?: string[]
  /** Expected selection order (indices into options) for sequence_order questions */
  correctOrder?: number[]
}

/* ------------------------------------------------------------------ */
/*  QUESTION DATA  (4 blocks × 5 questions = 20)                     */
/* ------------------------------------------------------------------ */
const questions: Question[] = [
  // ── Bloque 1: Discriminación Auditiva ──────────────────────────────
  { id: 1,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Son la misma palabra?", context: "PALA — BALA", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 2,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Son la misma palabra?", context: "GATO — GATO", options: ["Iguales", "Diferentes"], correctIndex: 0 },
  { id: 3,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Son la misma palabra?", context: "CAMA — CANA", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 4,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Son la misma palabra?", context: "TORO — LORO", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  // Ejercicio B: escuchar la palabra y elegir la imagen correcta
  { id: 5,  block: 1, blockName: "Discriminación Auditiva", type: "word_image", prompt: "GATO", context: "¿Qué palabra escuchaste?", options: ["Pato", "Gato", "Ratón"], correctIndex: 1 },
  { id: 6,  block: 1, blockName: "Discriminación Auditiva", type: "word_image", prompt: "PELOTA", context: "¿Qué palabra escuchaste?", options: ["Pelota", "Manzana", "Luna"], correctIndex: 0 },

  // ── Bloque 2: Conciencia Fonológica ────────────────────────────────
  { id: 7,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que MAMÁ?", options: ["Mariposa", "Pato", "Sol"], correctIndex: 0 },
  { id: 8,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que SAPO?", options: ["Nube", "Sandía", "Perro"], correctIndex: 1 },
  { id: 9,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que PELOTA?", options: ["Árbol", "Dado", "Pez"], correctIndex: 2 },

  // ── Bloque 3: Conciencia Silábica ──────────────────────────────────
  // Ejercicio D: contar sílabas
  { id: 10, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra GATO?", context: "GATO", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 11, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra SOL?", context: "SOL", options: ["1", "2", "3"], correctIndex: 0 },
  { id: 12, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra CAMA?", context: "CAMA", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 13, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra PAN?", context: "PAN", options: ["1", "2", "3"], correctIndex: 0 },
  // Ejercicio E: elegir la palabra que empieza con la misma sílaba inicial
  { id: 14, block: 3, blockName: "Conciencia Silábica", type: "syllable_match", prompt: "PELOTA", options: ["Pera", "Mesa", "Casa"], correctIndex: 0 },
  { id: 15, block: 3, blockName: "Conciencia Silábica", type: "syllable_match", prompt: "MAMÁ", options: ["Mano", "Pato", "Sol"], correctIndex: 0 },
  { id: 16, block: 3, blockName: "Conciencia Silábica", type: "syllable_match", prompt: "SOPA", options: ["Sol", "Nube", "Gato"], correctIndex: 0 },

  // ── Bloque 4: Memoria Fonológica (Ejercicio F: recordar el orden) ──
  { id: 17, block: 4, blockName: "Memoria Fonológica", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["SOL", "PAN", "LUNA"], options: ["Luna", "Sol", "Pan"], correctOrder: [1, 2, 0] },
  { id: 18, block: 4, blockName: "Memoria Fonológica", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["GATO", "CASA", "PATO"], options: ["Pato", "Gato", "Casa"], correctOrder: [1, 2, 0] },
  { id: 19, block: 4, blockName: "Memoria Fonológica", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["MESA", "SOL", "NUBE"], options: ["Nube", "Mesa", "Sol"], correctOrder: [1, 2, 0] },
  { id: 20, block: 4, blockName: "Memoria Fonológica", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["PERRO", "LUNA", "DADO"], options: ["Dado", "Perro", "Luna"], correctOrder: [1, 2, 0] },
]

const TOTAL_QUESTIONS = questions.length

/* ------------------------------------------------------------------ */
/*  EMOJI MAP                                                          */
/* ------------------------------------------------------------------ */
const questionEmojis: Record<number, { context?: string[]; prompt?: string; options?: string[] }> = {
  // Block 1 (Ejercicio B): option emojis for the word→image choices
  5: { options: ["🦆", "🐱", "🐭"] },
  6: { options: ["⚽", "🍎", "🌙"] },
  // Block 2: prompt emoji + option emojis
  7: { prompt: "👩", options: ["🦋", "🦆", "☀️"] },
  8: { prompt: "🐸", options: ["☁️", "🍉", "🐕"] },
  9: { prompt: "⚽", options: ["🌳", "🎲", "🐟"] },
  // Block 3 — Ejercicio D: emoji for the word
  10: { prompt: "🐱" },
  11: { prompt: "☀️" },
  12: { prompt: "🛏️" },
  13: { prompt: "🍞" },
  // Block 3 — Ejercicio E: option emojis for the syllable match
  14: { options: ["🍐", "🪑", "🏠"] },
  15: { options: ["✋", "🦆", "☀️"] },
  16: { options: ["☀️", "☁️", "🐱"] },
  // Block 4 — Ejercicio F: option emojis (in the fixed options order)
  17: { options: ["🌙", "☀️", "🍞"] },
  18: { options: ["🦆", "🐱", "🏠"] },
  19: { options: ["☁️", "🪑", "☀️"] },
  20: { options: ["🎲", "🐕", "🌙"] },
}
const BLOCKS = [
  { id: 1, name: "Discriminación Auditiva" },
  { id: 2, name: "Conciencia Fonológica" },
  { id: 3, name: "Conciencia Silábica" },
  { id: 4, name: "Memoria Fonológica" },
]

/* Diagonal gradient: near-black red → dark red → deep indigo */
const backgroundStyle = {
  background: "linear-gradient(135deg, #1a0000 0%, #7f1d1d 50%, #1e1e2e 100%)",
}

/** True when the stored answer matches the question's expected answer. */
function isAnswerCorrect(q: Question, ans: number | number[] | null): boolean {
  if (ans === null) return false
  if (q.type === "sequence_order") {
    if (!Array.isArray(ans) || !q.correctOrder) return false
    return ans.length === q.correctOrder.length && ans.every((v, i) => v === q.correctOrder![i])
  }
  return ans === q.correctIndex
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function TestPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | number[] | null)[]>(Array(TOTAL_QUESTIONS).fill(null))
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  /** Selection order (option indices) for the active sequence_order question */
  const [sequenceSelection, setSequenceSelection] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const current = questions[currentIndex]
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100
  const isSequenceOrder = current.type === "sequence_order"
  /** Whether the current question has a complete answer ready to submit */
  const canProceed = isSequenceOrder
    ? sequenceSelection.length === current.options.length
    : selectedOption !== null

  /* ---- handlers ---- */
  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx)
  }

  /* Toggle an option into/out of the sequence-order selection */
  const handleSequenceSelect = (optionIdx: number) => {
    setSequenceSelection((prev) =>
      prev.includes(optionIdx) ? prev.filter((i) => i !== optionIdx) : [...prev, optionIdx]
    )
  }

  const handleNext = () => {
    if (!canProceed) return

    const updated = [...answers]
    updated[currentIndex] = isSequenceOrder ? [...sequenceSelection] : selectedOption
    setAnswers(updated)

    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setSequenceSelection([])
    } else {
      setFinished(true)
    }
  }

  /* ---- results computation ---- */
  const computeResults = () => {
    return BLOCKS.map((block) => {
      const blockQuestions = questions.filter((q) => q.block === block.id)
      let correct = 0
      blockQuestions.forEach((q) => {
        const idx = questions.indexOf(q)
        if (isAnswerCorrect(q, answers[idx])) correct++
      })
      return { ...block, total: blockQuestions.length, correct, pct: Math.round((correct / blockQuestions.length) * 100) }
    })
  }

  const totalCorrect = answers.reduce<number>((acc, ans, idx) => acc + (isAnswerCorrect(questions[idx], ans) ? 1 : 0), 0)
  const totalPct = Math.round((totalCorrect / TOTAL_QUESTIONS) * 100)

  /* ---- save to Supabase ---- */
  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const blockResults = computeResults()
      await supabase.from("test_resultados").insert({
        user_id: user.id,
        fecha: new Date().toISOString(),
        puntaje_total: totalCorrect,
        porcentaje_total: totalPct,
        bloque_1_correctas: blockResults[0].correct,
        bloque_2_correctas: blockResults[1].correct,
        bloque_3_correctas: blockResults[2].correct,
        bloque_4_correctas: blockResults[3].correct,
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
    setFinished(false)
    setSaved(false)
  }

  /* ---- auto-save results as soon as the test finishes ---- */
  useEffect(() => {
    if (finished) handleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  /* ---- helper: is block 1 (auditory discrimination) ---- */
  const isBlock1 = current.block === 1
  const isWordImage = current.type === "word_image"
  const isSyllableMatch = current.type === "syllable_match"

  /* ---- text-to-speech ---- */
  const [speaking, setSpeaking] = useState(false)

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
    const parts: string[] = []
    if (current.context) parts.push(current.context.replace("—", "..."))
    parts.push(current.prompt)
    speak(parts.join(". "))
  }, [current, speak])

  /* Play the sequence words one by one, with an 800ms gap between each */
  const speakSequence = useCallback(() => {
    if (!current.sequence || typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setSpeaking(true)
    const words = current.sequence
    words.forEach((word, i) => {
      window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = "es-ES"
        utterance.rate = 0.85
        if (i === words.length - 1) utterance.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }, i * 800)
    })
  }, [current])

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
            <p className="text-lg text-white/70 mt-2">{totalCorrect} de {TOTAL_QUESTIONS} respuestas correctas</p>
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
            <span className="hidden sm:inline text-white font-medium">{current.blockName}</span>
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
          {current.blockName}
        </p>
      </div>

      {/* ---- Question card ---- */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-8">
        <div
          key={currentIndex}
          className="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ minHeight: "60vh" }}
        >
          {/* Block name badge + audio button */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-block text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-full">
              {current.blockName}
            </span>
            {!isBlock1 && (
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
            )}
          </div>

          {/* Context (block 1: words only, no emojis) */}
          {current.context && current.block === 1 && !isWordImage ? (
            <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
              {current.context.split(" — ").map((word, i, arr) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="bg-white/20 rounded-xl px-5 py-2 text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{word}</span>
                    <button
                      onClick={() => speak(word)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white hover:bg-white/30 transition-all"
                    >
                      <Volume2 className="w-4 h-4" />
                      Escuchar
                    </button>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-3xl sm:text-4xl font-bold text-white/40">–</span>
                  )}
                </div>
              ))}
            </div>
          ) : current.context && !isWordImage ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              {questionEmojis[current.id]?.prompt && (
                <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].prompt}</span>
              )}
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-3xl sm:text-4xl font-bold tracking-widest text-white">
                {current.context}
              </span>
            </div>
          ) : null}

          {/* Word in a box + audio button (block 1 ej. B word_image / block 3 ej. E syllable_match) */}
          {isWordImage || isSyllableMatch ? (
            <div className="mb-6 flex flex-col items-center gap-3">
              {isSyllableMatch && (
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
                  ¿Qué palabra empieza por la misma sílaba?
                </h2>
              )}
              <span className="inline-block bg-white/20 rounded-xl px-8 py-4 text-3xl sm:text-4xl font-extrabold tracking-widest text-white">
                {current.prompt}
              </span>
              {current.context && (
                <p className="text-lg sm:text-xl font-semibold text-white text-center">
                  {current.context}
                </p>
              )}
              <button
                onClick={() => speak(current.prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white hover:bg-white/30 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                Escuchar
              </button>
            </div>
          ) : isSequenceOrder ? (
            /* Sequence-order (block 4, ejercicio F): instruction + play-sequence button */
            <div className="mb-6 flex flex-col items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
                {current.prompt}
              </h2>
              <button
                onClick={speakSequence}
                className={`
                  inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${speaking
                    ? "bg-white/30 text-white animate-pulse"
                    : "bg-white/20 text-white hover:bg-white/30"
                  }
                `}
              >
                <Volume2 className="w-5 h-5" />
                {speaking ? "Reproduciendo..." : "Escuchar secuencia"}
              </button>
            </div>
          ) : (
            /* Prompt */
            <div className="mb-6 flex items-center justify-center gap-3">
              {!current.context && questionEmojis[current.id]?.prompt && (
                <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].prompt}</span>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
                {current.prompt}
              </h2>
              {current.block === 2 && questionEmojis[current.id]?.prompt && (
                <span className="text-4xl sm:text-5xl">{questionEmojis[current.id].prompt}</span>
              )}
            </div>
          )}

          {/* Options area */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className={`grid gap-4 ${current.options.length <= 2 ? "grid-cols-2" : current.options.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {current.options.map((opt, idx) => {
                const isSelected = selectedOption === idx

                // Block 4 — Ejercicio F (sequence_order): emoji + text + order badge
                if (isSequenceOrder) {
                  const optEmoji = questionEmojis[current.id]?.options?.[idx]
                  const order = sequenceSelection.indexOf(idx)
                  const isPicked = order !== -1
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSequenceSelect(idx)}
                      className={`
                        relative rounded-2xl border py-5 px-6 text-lg font-bold transition-all duration-200 flex flex-col items-center gap-2
                        ${isPicked
                          ? "bg-red-500 border-red-400 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }
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
                }

                // Block 1 — Ejercicio B (word→image): emoji + text, no per-option audio
                if (isWordImage) {
                  const optEmoji = questionEmojis[current.id]?.options?.[idx]
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
                      <span>{opt}</span>
                    </button>
                  )
                }

                // Block 1 — Ejercicio A (same/different): Sí / No buttons
                if (isBlock1) {
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

                // Default option buttons (with emoji for block 2)
                const optEmoji = questionEmojis[current.id]?.options?.[idx]
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
                      {opt}
                      <Volume2
                        className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); speak(opt) }}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Next button */}
          <div className="pt-4 flex justify-end">
            <button
              disabled={!canProceed}
              onClick={handleNext}
              className={`
                flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold transition-all duration-200
                ${!canProceed
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-400 text-white shadow-lg"
                }
              `}
            >
              {currentIndex + 1 === TOTAL_QUESTIONS ? "Finalizar" : "Siguiente"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
