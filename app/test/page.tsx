"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, Save, Home, Volume2 } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
type QuestionType = "same_different" | "multiple_choice" | "syllable_count" | "letter_fill"

interface Question {
  id: number
  block: number
  blockName: string
  type: QuestionType
  prompt: string
  options: string[]
  correctIndex: number
  /** Extra context shown above the prompt (e.g. the two words to compare) */
  context?: string
}

/* ------------------------------------------------------------------ */
/*  QUESTION DATA  (4 blocks × 5 questions = 20)                     */
/* ------------------------------------------------------------------ */
const questions: Question[] = [
  // ── Bloque 1: Discriminación Auditiva ──────────────────────────────
  { id: 1,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "PALA — BALA", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 2,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "GATO — GATO", options: ["Iguales", "Diferentes"], correctIndex: 0 },
  { id: 3,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "CAMA — CANA", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 4,  block: 1, blockName: "Discriminación Auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "TORO — LORO", options: ["Iguales", "Diferentes"], correctIndex: 1 },

  // ── Bloque 2: Conciencia Fonológica ────────────────────────────────
  { id: 5,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que MAMÁ?", options: ["Mariposa", "Pato", "Sol"], correctIndex: 0 },
  { id: 6,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que SAPO?", options: ["Nube", "Sandía", "Perro"], correctIndex: 1 },
  { id: 7,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que PELOTA?", options: ["Árbol", "Dado", "Pez"], correctIndex: 2 },

  // ── Bloque 3: Conciencia Silábica ──────────────────────────────────
  { id: 8,  block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra GATO?", context: "GA - TO", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 9,  block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra SOL?", context: "SOL", options: ["1", "2", "3"], correctIndex: 0 },
  { id: 10, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra CAMA?", context: "CA - MA", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 11, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra PAN?", context: "PAN", options: ["1", "2", "3"], correctIndex: 0 },
  { id: 12, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra NUBE?", context: "NU - BE", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 13, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra PATO?", context: "PA - TO", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 14, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra CASA?", context: "CA - SA", options: ["1", "2", "3"], correctIndex: 1 },

  // ── Bloque 4: Memoria Fonológica ────────────────────────────────────
  { id: 15, block: 4, blockName: "Memoria Fonológica", type: "multiple_choice", prompt: "¿Cuál de estas imágenes escuchaste primero? SOL – PAN – LUNA", options: ["Luna", "Sol", "Pan"], correctIndex: 1 },
  { id: 16, block: 4, blockName: "Memoria Fonológica", type: "multiple_choice", prompt: "¿Cuál de estas imágenes escuchaste segundo? GATO – CASA – PATO", options: ["Gato", "Pato", "Casa"], correctIndex: 2 },
  { id: 17, block: 4, blockName: "Memoria Fonológica", type: "multiple_choice", prompt: "¿Cuál de estas imágenes escuchaste último? MESA – SOL – NUBE", options: ["Mesa", "Nube", "Sol"], correctIndex: 1 },

  // ── Bloque 5: Vocabulario y Comprensión Oral ───────────────────────
  { id: 18, block: 5, blockName: "Vocabulario y Comprensión Oral", type: "multiple_choice", prompt: "¿Cuál es la mariposa?", options: ["Mariposa", "Abeja", "Oruga"], correctIndex: 0 },
  { id: 19, block: 5, blockName: "Vocabulario y Comprensión Oral", type: "multiple_choice", prompt: "¿Cuál es el camión?", options: ["Auto", "Camión", "Colectivo"], correctIndex: 1 },
  { id: 20, block: 5, blockName: "Vocabulario y Comprensión Oral", type: "multiple_choice", prompt: "¿Cuál es la sandía?", options: ["Manzana", "Uva", "Sandía"], correctIndex: 2 },
  { id: 21, block: 5, blockName: "Vocabulario y Comprensión Oral", type: "multiple_choice", prompt: "¿Cuál es la araña?", options: ["Mariposa", "Araña", "Abeja"], correctIndex: 1 },
  { id: 22, block: 5, blockName: "Vocabulario y Comprensión Oral", type: "multiple_choice", prompt: "¿Cuál es la guitarra?", options: ["Guitarra", "Trompeta", "Tambor"], correctIndex: 0 },
  { id: 23, block: 5, blockName: "Vocabulario y Comprensión Oral", type: "multiple_choice", prompt: "¿Cuál es el elefante?", options: ["Jirafa", "Cebra", "Elefante"], correctIndex: 2 },
]

const TOTAL_QUESTIONS = questions.length

/* ------------------------------------------------------------------ */
/*  EMOJI MAP                                                          */
/* ------------------------------------------------------------------ */
const questionEmojis: Record<number, { context?: string[]; prompt?: string; options?: string[] }> = {
  // Block 1: pair emojis for each context word
  1: { context: ["🪣", "🔫"] },
  2: { context: ["🐱", "🐱"] },
  3: { context: ["🛏️", "👴"] },
  4: { context: ["🐂", "🦜"] },
  // Block 2: prompt emoji + option emojis
  5: { prompt: "👩", options: ["🦋", "🦆", "☀️"] },
  6: { prompt: "🐸", options: ["☁️", "🍉", "🐕"] },
  7: { prompt: "🎾", options: ["🌳", "🎲", "🐟"] },
  // Block 3: emoji for the word
  8:  { prompt: "🐱" },
  9:  { prompt: "☀️" },
  10: { prompt: "🛏️" },
  11: { prompt: "🍞" },
  12: { prompt: "☁️" },
  13: { prompt: "🦆" },
  14: { prompt: "🏠" },
  // Block 4: option emojis for the sequence words
  15: { options: ["🌙", "☀️", "🍞"] },
  16: { options: ["🐱", "🦆", "🏠"] },
  17: { options: ["🪑", "☁️", "☀️"] },
  // Block 5: option emojis for the vocabulary words
  18: { options: ["🦋", "🐝", "🐛"] },
  19: { options: ["🚗", "🚚", "🚌"] },
  20: { options: ["🍎", "🍇", "🍉"] },
  21: { options: ["🦋", "🕷️", "🐝"] },
  22: { options: ["🎸", "🎺", "🥁"] },
  23: { options: ["🦒", "🦓", "🐘"] },
}
const BLOCKS = [
  { id: 1, name: "Discriminación Auditiva" },
  { id: 2, name: "Conciencia Fonológica" },
  { id: 3, name: "Conciencia Silábica" },
  { id: 4, name: "Memoria Fonológica" },
  { id: 5, name: "Vocabulario y Comprensión Oral" },
]

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function TestPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL_QUESTIONS).fill(null))
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const current = questions[currentIndex]
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100

  /* ---- handlers ---- */
  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx)
  }

  const handleNext = () => {
    if (selectedOption === null) return

    const updated = [...answers]
    updated[currentIndex] = selectedOption
    setAnswers(updated)

    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
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
        if (answers[idx] === q.correctIndex) correct++
      })
      return { ...block, total: blockQuestions.length, correct, pct: Math.round((correct / blockQuestions.length) * 100) }
    })
  }

  const totalCorrect = answers.reduce<number>((acc, ans, idx) => acc + (ans === questions[idx].correctIndex ? 1 : 0), 0)
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
        bloque_5_correctas: blockResults[4].correct,
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
  }

  /* ---- helper: is block 1 (auditory discrimination) ---- */
  const isBlock1 = current.block === 1

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

  /* ================================================================ */
  /*  RESULTS SCREEN                                                   */
  /* ================================================================ */
  if (finished) {
    const blockResults = computeResults()
    const hasIndicators = totalPct < 60
    const getScoreColor = (pct: number) => {
      if (pct >= 80) return "bg-green-50 text-green-700"
      if (pct >= 60) return "bg-yellow-50 text-yellow-700"
      if (pct >= 40) return "bg-orange-50 text-orange-700"
      return "bg-red-50 text-red-700"
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center">
            <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">Lecxico</h1>
            <span className="flex-1 text-center text-lg font-bold text-gray-800">
              Test de indicadores de dislexia
            </span>
            <div className="w-[80px]" />
          </div>
        </header>

        <div className="max-w-2xl mx-auto space-y-8 py-10 px-4">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Resultados del Test</h2>
          </div>

          {/* Score summary */}
          <Card className="rounded-2xl border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-5xl font-extrabold text-red-600">{totalPct}%</CardTitle>
              <CardDescription className="text-lg mt-1">{totalCorrect} de {TOTAL_QUESTIONS} respuestas correctas</CardDescription>
            </CardHeader>
          </Card>

          {/* Table */}
          <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-red-500 text-white">
                  <tr>
                    <th className="py-3 px-4">Bloque</th>
                    <th className="py-3 px-4 text-center">Correctas</th>
                    <th className="py-3 px-4 text-center">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {blockResults.map((b) => (
                    <tr key={b.id} className={getScoreColor(b.pct)}>
                      <td className="py-3 px-4 font-medium">{b.name}</td>
                      <td className="py-3 px-4 text-center">{b.correct} / {b.total}</td>
                      <td className="py-3 px-4 text-center font-semibold">{b.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Conclusion */}
          <Card className={`rounded-2xl border-2 shadow-md ${hasIndicators ? "border-red-400 bg-red-50" : "border-green-400 bg-green-50"}`}>
            <CardContent className="py-6 flex items-start gap-4">
              {hasIndicators ? (
                <XCircle className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold text-lg ${hasIndicators ? "text-red-800" : "text-green-800"}`}>
                  {hasIndicators
                    ? "Se detectaron indicadores de dislexia"
                    : "No se detectaron indicadores significativos"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Este test es orientativo y <span className="font-semibold">no reemplaza un diagnóstico profesional</span>.
                  Te recomendamos consultar con un especialista para una evaluación completa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 gap-2 bg-red-500 hover:bg-red-600 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar resultados"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRestart}
              className="flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <RotateCcw className="w-4 h-4" /> Repetir test
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <Home className="w-4 h-4" /> Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ================================================================ */
  /*  QUESTION SCREEN                                                  */
  /* ================================================================ */
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-red-50">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">Lecxico</h1>
          <span className="flex-1 text-center text-lg font-bold text-gray-800">
            Test de indicadores de dislexia
          </span>
          <div className="w-[80px]" />
        </div>
      </header>

      {/* ---- Progress bar with dots ---- */}
      <div className="w-full bg-white shadow-sm px-4 py-4">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-[6px] bg-gray-200 -translate-y-1/2 rounded-full" />
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
                    ? "w-8 h-8 bg-white border-4 border-red-500"
                    : isCompleted
                      ? "w-5 h-5 bg-red-500"
                      : "w-5 h-5 bg-gray-200"
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
        <p className="text-center text-xs font-semibold text-red-500 mt-3">
          {current.blockName}
        </p>
      </div>

      {/* ---- Question card ---- */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div
          key={currentIndex}
          className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ minHeight: "70vh" }}
        >
          {/* Block name badge + audio button */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {current.blockName}
            </span>
            <button
              onClick={speakQuestion}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                ${speaking
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "bg-red-50 text-red-500 hover:bg-red-100"
                }
              `}
            >
              <Volume2 className="w-4 h-4" />
              {speaking ? "Escuchando..." : "Escuchar"}
            </button>
          </div>

          {/* Context with emojis */}
          {current.context && current.block === 1 && questionEmojis[current.id]?.context ? (
            <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
              {current.context.split(" — ").map((word, i, arr) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].context![i]}</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-wide">{word}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-3xl sm:text-4xl font-bold text-gray-400">–</span>
                  )}
                </div>
              ))}
            </div>
          ) : current.context ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              {questionEmojis[current.id]?.prompt && (
                <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].prompt}</span>
              )}
              <span className="inline-block bg-white border-2 border-gray-200 rounded-2xl px-8 py-4 text-3xl sm:text-4xl font-bold tracking-widest text-gray-800 shadow-sm">
                {current.context}
              </span>
            </div>
          ) : null}

          {/* Prompt */}
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl px-6 py-5 flex items-center justify-center gap-3">
            {!current.context && questionEmojis[current.id]?.prompt && (
              <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].prompt}</span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              {current.prompt}
            </h2>
            {current.block === 2 && questionEmojis[current.id]?.prompt && (
              <span className="text-4xl sm:text-5xl">{questionEmojis[current.id].prompt}</span>
            )}
          </div>

          {/* Options area */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className={`grid gap-4 ${current.options.length <= 2 ? "grid-cols-2" : current.options.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {current.options.map((opt, idx) => {
                const isSelected = selectedOption === idx

                // Block 1: Sí / No buttons
                if (isBlock1) {
                  const isYes = idx === 0
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`
                        rounded-2xl py-8 px-8 text-2xl font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-2
                        ${isSelected
                          ? isYes
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "border-2 border-gray-200 bg-white text-gray-800 hover:border-red-400 hover:bg-red-50"
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
                      rounded-2xl border-2 py-5 px-6 text-lg font-bold transition-all duration-200 flex flex-col items-center gap-2
                      ${isSelected
                        ? "border-transparent bg-red-500 text-white"
                        : "border-gray-200 bg-white text-gray-800 hover:border-red-400 hover:bg-red-50"
                      }
                    `}
                  >
                    {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                    <span className="flex items-center gap-2">
                      {opt}
                      <Volume2
                        className={`w-4 h-4 transition-opacity ${isSelected ? "opacity-70 hover:opacity-100" : "opacity-40 hover:opacity-100"}`}
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
              disabled={selectedOption === null}
              onClick={handleNext}
              className={`
                flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all duration-200
                ${selectedOption === null
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg"
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
