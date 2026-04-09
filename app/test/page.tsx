"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, Save, Home } from "lucide-react"

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
  // ── Bloque 1: Discriminación auditiva ──────────────────────────────
  { id: 1,  block: 1, blockName: "Discriminación auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "BESO — PESO", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 2,  block: 1, blockName: "Discriminación auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "CAMA — CANA", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 3,  block: 1, blockName: "Discriminación auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "PALA — BALA", options: ["Iguales", "Diferentes"], correctIndex: 1 },
  { id: 4,  block: 1, blockName: "Discriminación auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "TORO — TORO", options: ["Iguales", "Diferentes"], correctIndex: 0 },
  { id: 5,  block: 1, blockName: "Discriminación auditiva", type: "same_different", prompt: "¿Estas palabras suenan igual o diferente?", context: "DEDO — DADO", options: ["Iguales", "Diferentes"], correctIndex: 1 },

  // ── Bloque 2: Conciencia fonológica ────────────────────────────────
  { id: 6,  block: 2, blockName: "Conciencia fonológica", type: "multiple_choice", prompt: "¿Qué palabra rima con CASA?", options: ["Mesa", "Taza", "Perro"], correctIndex: 1 },
  { id: 7,  block: 2, blockName: "Conciencia fonológica", type: "multiple_choice", prompt: "¿Qué palabra empieza igual que MAMÁ?", options: ["Cama", "Mano", "Pato"], correctIndex: 1 },
  { id: 8,  block: 2, blockName: "Conciencia fonológica", type: "multiple_choice", prompt: "¿Qué palabra rima con GATO?", options: ["Plato", "Mesa", "Coche"], correctIndex: 0 },
  { id: 9,  block: 2, blockName: "Conciencia fonológica", type: "multiple_choice", prompt: "¿Qué palabra empieza igual que PERRO?", options: ["Pelota", "Carro", "Burro"], correctIndex: 0 },
  { id: 10, block: 2, blockName: "Conciencia fonológica", type: "multiple_choice", prompt: "¿Qué palabra rima con FLOR?", options: ["Sol", "Color", "Pez"], correctIndex: 1 },

  // ── Bloque 3: Conciencia silábica ──────────────────────────────────
  { id: 11, block: 3, blockName: "Conciencia silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra BOTELLA?", context: "BO - TE - LLA", options: ["2", "3", "4"], correctIndex: 1 },
  { id: 12, block: 3, blockName: "Conciencia silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra GATO?", context: "GA - TO", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 13, block: 3, blockName: "Conciencia silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra MARIPOSA?", context: "MA - RI - PO - SA", options: ["3", "4", "5"], correctIndex: 1 },
  { id: 14, block: 3, blockName: "Conciencia silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra ELEFANTE?", context: "E - LE - FAN - TE", options: ["3", "4", "5"], correctIndex: 1 },
  { id: 15, block: 3, blockName: "Conciencia silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra SOL?", context: "SOL", options: ["1", "2", "3"], correctIndex: 0 },

  // ── Bloque 4: Correspondencia sonido-letra ─────────────────────────
  { id: 16, block: 4, blockName: "Correspondencia sonido-letra", type: "letter_fill", prompt: "Completa la palabra: CA_EZA", options: ["b", "d", "p", "q"], correctIndex: 0 },
  { id: 17, block: 4, blockName: "Correspondencia sonido-letra", type: "letter_fill", prompt: "Completa la palabra: _ATO", options: ["g", "p", "t", "m"], correctIndex: 0 },
  { id: 18, block: 4, blockName: "Correspondencia sonido-letra", type: "letter_fill", prompt: "Completa la palabra: _ELOTA", options: ["b", "d", "p", "q"], correctIndex: 2 },
  { id: 19, block: 4, blockName: "Correspondencia sonido-letra", type: "letter_fill", prompt: "Completa la palabra: ME_A", options: ["s", "z", "c", "x"], correctIndex: 0 },
  { id: 20, block: 4, blockName: "Correspondencia sonido-letra", type: "letter_fill", prompt: "Completa la palabra: _UENTE", options: ["f", "j", "p", "t"], correctIndex: 0 },
]

const TOTAL_QUESTIONS = questions.length
const BLOCKS = [
  { id: 1, name: "Discriminación auditiva" },
  { id: 2, name: "Conciencia fonológica" },
  { id: 3, name: "Conciencia silábica" },
  { id: 4, name: "Correspondencia sonido-letra" },
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

  /* ================================================================ */
  /*  RESULTS SCREEN                                                   */
  /* ================================================================ */
  if (finished) {
    const blockResults = computeResults()
    const hasIndicators = totalPct < 60

    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FFF0F0" }}>
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center">
            <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">Lecxico</h1>
            <span className="flex-1 text-center text-lg font-bold text-red-600">
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
          <Card className="border-2 shadow-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-5xl font-extrabold text-primary">{totalPct}%</CardTitle>
              <CardDescription className="text-lg mt-1">{totalCorrect} de {TOTAL_QUESTIONS} respuestas correctas</CardDescription>
            </CardHeader>
          </Card>

          {/* Table */}
          <Card className="border-2 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-primary text-primary-foreground">
                  <tr>
                    <th className="py-3 px-4">Bloque</th>
                    <th className="py-3 px-4 text-center">Correctas</th>
                    <th className="py-3 px-4 text-center">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {blockResults.map((b, i) => (
                    <tr key={b.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
          <Card className={`border-2 shadow-sm ${hasIndicators ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
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
            <Button onClick={handleSave} disabled={saving || saved} className="flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar resultados"}
            </Button>
            <Button variant="outline" onClick={handleRestart} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" /> Repetir test
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex-1 gap-2">
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF0F0" }}>
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">Lecxico</h1>
          <span className="flex-1 text-center text-lg font-bold text-red-600">
            Test de indicadores de dislexia
          </span>
          <div className="w-[80px]" />
        </div>
      </header>

      {/* ---- Progress bar with dots ---- */}
      <div className="w-full bg-white border-b px-4 py-4">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Background line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
          {/* Filled line */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-green-400 -translate-y-1/2 rounded-full transition-all duration-300"
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
                    ? "w-6 h-6 bg-blue-500 ring-4 ring-blue-200"
                    : isCompleted
                      ? "w-4 h-4 bg-green-500"
                      : "w-4 h-4 bg-yellow-400"
                  }
                `}
              >
                {isCurrent && (
                  <span className="text-[9px] font-bold text-white">{idx + 1}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ---- Question card ---- */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div
          className="w-full max-w-2xl rounded-3xl border-2 bg-white shadow-lg flex flex-col"
          style={{ borderColor: "#5BBCB4", minHeight: "70vh" }}
        >
          {/* Question header - teal/celeste banner */}
          <div
            className="rounded-t-3xl px-8 py-6"
            style={{ backgroundColor: "#E0F5F3" }}
          >
            {/* Block name badge */}
            <span className="inline-block text-xs font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full mb-3">
              {current.blockName}
            </span>

            {/* Context (two words, syllable breakdown, etc.) */}
            {current.context && (
              <div className="mb-3">
                <span className="inline-block bg-white border-2 border-teal-200 rounded-2xl px-8 py-4 text-3xl sm:text-4xl font-bold tracking-widest text-gray-800 shadow-sm">
                  {current.context}
                </span>
              </div>
            )}

            {/* Prompt */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {current.prompt}
            </h2>
          </div>

          {/* Options area */}
          <div className="flex-1 flex flex-col justify-center px-8 py-8">
            <div className={`grid gap-4 ${current.options.length <= 2 ? "grid-cols-2" : current.options.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {current.options.map((opt, idx) => {
                const isSelected = selectedOption === idx

                // Block 1: special colored buttons
                if (isBlock1) {
                  const isFirst = idx === 0
                  const baseColor = isFirst ? "green" : "red"
                  const emoji = isFirst ? "👍" : "👎"
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`
                        rounded-2xl border-3 py-6 px-8 text-xl font-bold transition-all duration-150 flex items-center justify-center gap-3
                        ${isSelected
                          ? baseColor === "green"
                            ? "border-green-600 bg-green-500 text-white shadow-lg scale-[1.03]"
                            : "border-red-600 bg-red-500 text-white shadow-lg scale-[1.03]"
                          : baseColor === "green"
                            ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md"
                            : "border-red-400 bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md"
                        }
                      `}
                    >
                      <span className="text-2xl">{emoji}</span>
                      {opt}
                    </button>
                  )
                }

                // Default option buttons
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`
                      rounded-2xl border-2 py-5 px-6 text-lg font-bold transition-all duration-150
                      ${isSelected
                        ? "border-teal-500 bg-teal-500 text-white shadow-lg scale-[1.02]"
                        : "border-gray-300 bg-white text-gray-800 hover:border-teal-400 hover:shadow-md"
                      }
                    `}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Next button */}
          <div className="px-8 pb-8 flex justify-end">
            <button
              disabled={selectedOption === null}
              onClick={handleNext}
              className={`
                flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all duration-150
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
