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
type QuestionType = "same_different" | "multiple_choice" | "syllable_count" | "letter_fill" | "word_image" | "syllable_match" | "sequence_order" | "rapid_naming"

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
  /** rapid_naming: ítems de la grilla (nombres de color o emojis) */
  items?: string[]
  /** rapid_naming: valor objetivo a seleccionar (nombre de color o emoji) */
  target?: string
  /** rapid_naming: cómo renderizar los ítems */
  itemKind?: "color" | "object"
  /** rapid_naming: columnas de la grilla */
  columns?: number
  /** rapid_naming: límite de tiempo en segundos */
  timeLimit?: number
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
  { id: 7,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que MAMÁ?", options: ["MARIPOSA", "PATO", "SOL"], correctIndex: 0 },
  { id: 8,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que SAPO?", options: ["NUBE", "SANDÍA", "PERRO"], correctIndex: 1 },
  { id: 9,  block: 2, blockName: "Conciencia Fonológica", type: "multiple_choice", prompt: "¿Cuál empieza igual que PELOTA?", options: ["ÁRBOL", "DADO", "PEZ"], correctIndex: 2 },

  // ── Bloque 3: Conciencia Silábica ──────────────────────────────────
  // Ejercicio D: contar sílabas
  { id: 10, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra GATO?", context: "GA-TO", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 11, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra NENA?", context: "NE-NA", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 12, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra CAMA?", context: "CA-MA", options: ["1", "2", "3"], correctIndex: 1 },
  { id: 13, block: 3, blockName: "Conciencia Silábica", type: "syllable_count", prompt: "¿Cuántas sílabas tiene la palabra PAN?", context: "PAN", options: ["1", "2", "3"], correctIndex: 0 },
  // Ejercicio E: elegir la palabra que empieza con la misma sílaba inicial
  { id: 14, block: 3, blockName: "Conciencia Silábica", type: "syllable_match", prompt: "PELOTA", options: ["Pera", "Silla", "Casa"], correctIndex: 0 },
  { id: 15, block: 3, blockName: "Conciencia Silábica", type: "syllable_match", prompt: "MAMÁ", options: ["Mano", "Pato", "Sol"], correctIndex: 0 },
  { id: 16, block: 3, blockName: "Conciencia Silábica", type: "syllable_match", prompt: "MATE", options: ["Casa", "Manzana", "Luna"], correctIndex: 1 },

  // ── Bloque 4: Memoria Auditiva (Ejercicio F: recordar el orden) ──
  { id: 17, block: 4, blockName: "Memoria Auditiva", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["SOL", "PAN"], options: ["Pan", "Sol"], correctOrder: [1, 0] },
  { id: 18, block: 4, blockName: "Memoria Auditiva", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["GATO", "CASA", "PATO"], options: ["Pato", "Gato", "Casa"], correctOrder: [1, 2, 0] },
  { id: 19, block: 4, blockName: "Memoria Auditiva", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["SILLA", "SOL", "NUBE"], options: ["Nube", "Silla", "Sol"], correctOrder: [1, 2, 0] },
  { id: 20, block: 4, blockName: "Memoria Auditiva", type: "sequence_order", prompt: "Marca las palabras en el orden en que las escuchaste.", sequence: ["PERRO", "LUNA", "DADO", "MATE"], options: ["Dado", "Perro", "Luna", "Mate"], correctOrder: [1, 2, 0, 3] },

  // ── Bloque 5: Denominación Rápida ──────────────────────────────────
  { id: 21, block: 5, blockName: "Denominación Rápida", type: "rapid_naming", prompt: "Tocá el cuadrado ROJO", options: [], itemKind: "color", target: "red", columns: 6, timeLimit: 15,
    items: ["blue","red","yellow","green","black","white"] },
  { id: 22, block: 5, blockName: "Denominación Rápida", type: "rapid_naming", prompt: "Tocá todos los cuadrados AZULES", options: [], itemKind: "color", target: "blue", columns: 5, timeLimit: 30,
    items: ["blue","red","yellow","green","black","red","blue","green","yellow","blue","white","green","blue","red","yellow"] },
  { id: 23, block: 5, blockName: "Denominación Rápida", type: "rapid_naming", prompt: "Tocá la ESTRELLA", options: [], itemKind: "object", target: "⭐", columns: 6, timeLimit: 15,
    items: ["🚗","🔑","⭐","☂️","✏️","🚗"] },
  { id: 24, block: 5, blockName: "Denominación Rápida", type: "rapid_naming", prompt: "Tocá todos los PARAGUAS", options: [], itemKind: "object", target: "☂️", columns: 5, timeLimit: 30,
    items: ["🚗","☂️","🔑","⭐","✏️","☂️","🚗","⭐","🔑","☂️","✏️","⭐","🚗","☂️","🔑"] },
]

const TOTAL_QUESTIONS = questions.length

/* ------------------------------------------------------------------ */
/*  EMOJI MAP                                                          */
/* ------------------------------------------------------------------ */
const questionEmojis: Record<number, { context?: string[]; prompt?: string; options?: string[] }> = {
  // Block 1 (Ejercicio B): option emojis for the word→image choices
  5: { options: ["🦆", "🐱", "🐭"] },
  6: { options: ["⚽", "🍎", "🌙"] },
  // Block 3 — Ejercicio D: emoji for the word
  10: { prompt: "🐱" },
  11: { prompt: "👧" },
  12: { prompt: "🛏️" },
  13: { prompt: "🍞" },
  // Block 3 — Ejercicio E: option emojis for the syllable match
  14: { options: ["🍐", "🪑", "🏠"] },
  15: { options: ["✋", "🦆", "☀️"] },
  16: { options: ["🏠", "🍎", "🌙"] },
  // Block 4 — Ejercicio F: option emojis (in the fixed options order)
  17: { options: ["🍞", "☀️"] },
  18: { options: ["🦆", "🐱", "🏠"] },
  19: { options: ["☁️", "🪑", "☀️"] },
  20: { options: ["🎲", "🐕", "🌙", "🧉"] },
}
const BLOCKS = [
  { id: 1, name: "Discriminación Auditiva" },
  { id: 2, name: "Conciencia Fonológica" },
  { id: 3, name: "Conciencia Silábica" },
  { id: 4, name: "Memoria Auditiva" },
  { id: 5, name: "Denominación Rápida" },
]

/* rapid_naming: color name → CSS color for the grid squares */
const RAPID_COLORS: Record<string, string> = {
  red: "#dc2626", blue: "#2563eb", yellow: "#facc15",
  green: "#16a34a", black: "#171717", white: "#ffffff",
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

/** Points earned / points available for a question (rapid_naming is fractionally scored). */
function questionScore(q: Question, ans: number | number[] | null): { correct: number; total: number } {
  if (q.type === "rapid_naming") {
    const targets = (q.items ?? []).reduce((acc, it, i) => (it === q.target ? [...acc, i] : acc), [] as number[])
    const total = targets.length
    const picked = Array.isArray(ans) ? ans : []
    const correct = picked.filter((i) => targets.includes(i)).length
    return { correct, total }
  }
  return { correct: isAnswerCorrect(q, ans) ? 1 : 0, total: 1 }
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function TestPage() {
  return (
    <Suspense fallback={<TestAccesoAviso />}>
      <TestInicial />
    </Suspense>
  )
}

function TestInicial() {
  const router = useRouter()
  const acceso = useAccesoTest("inicial")

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | number[] | null)[]>(Array(TOTAL_QUESTIONS).fill(null))
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  /** Selection order (option indices) for the active sequence_order question */
  const [sequenceSelection, setSequenceSelection] = useState<number[]>([])
  /** How many times the current sequence has been played (max 3) */
  const [playCount, setPlayCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  /* ---- salir a mitad del test pide confirmación (no hay guardado parcial) ---- */
  const testEnCurso = acceso.estado === "permitido" && !saved && (currentIndex > 0 || finished)
  const { salir, dialogo: dialogoSalida } = useSalidaDelTest(testEnCurso)
  /* ---- rapid_naming (Bloque 5) ---- */
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const current = questions[currentIndex]
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100
  const isSequenceOrder = current.type === "sequence_order"
  /** Whether the current question has a complete answer ready to submit */
  const canProceed =
    current.type === "rapid_naming" ? locked
    : isSequenceOrder ? sequenceSelection.length === current.options.length
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

  /* ---- rapid_naming handlers ---- */
  const handleReveal = () => { setRevealed(true); setTimeLeft(current.timeLimit ?? 30) }
  const handleItemToggle = (idx: number) => {
    if (locked) return
    setSelectedItems((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx])
  }
  const handleFinishRapid = () => setLocked(true)

  const handleNext = () => {
    if (!canProceed) return

    const updated = [...answers]
    updated[currentIndex] =
      current.type === "rapid_naming" ? [...selectedItems]
      : isSequenceOrder ? [...sequenceSelection]
      : selectedOption
    setAnswers(updated)

    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setSequenceSelection([])
      setPlayCount(0)
      setSelectedItems([])
      setRevealed(false)
      setTimeLeft(null)
      setLocked(false)
    } else {
      setFinished(true)
    }
  }

  /* ---- results computation ---- */
  const computeResults = () => {
    return BLOCKS.map((block) => {
      const blockQuestions = questions.filter((q) => q.block === block.id)
      let correct = 0, total = 0
      blockQuestions.forEach((q) => {
        const idx = questions.indexOf(q)
        const s = questionScore(q, answers[idx])
        correct += s.correct; total += s.total
      })
      return { ...block, total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0 }
    })
  }

  const totalCorrect = questions.reduce((acc, q, idx) => acc + questionScore(q, answers[idx]).correct, 0)
  const totalAnswerable = questions.reduce((acc, q, idx) => acc + questionScore(q, answers[idx]).total, 0)
  const totalPct = totalAnswerable > 0 ? Math.round((totalCorrect / totalAnswerable) * 100) : 0

  /* ---- save to Supabase ---- */
  const handleSave = async () => {
    if (acceso.estado !== "permitido") return
    setSaving(true)
    setSaveError(null)
    try {
      await guardarTest({
        ninoId: acceso.ninoId,
        nivel: "inicial",
        bloques: computeResults().map((b) => ({
          bloqueCodigo: bloqueCodigoPorOrden("inicial", b.id),
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
    setPlayCount(0)
    setSelectedItems([])
    setRevealed(false)
    setTimeLeft(null)
    setLocked(false)
    setFinished(false)
    setSaved(false)
    setSaveError(null)
  }

  /* ---- auto-save results as soon as the test finishes ---- */
  useEffect(() => {
    if (finished) handleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  /* ---- rapid_naming countdown timer ---- */
  useEffect(() => {
    if (current.type !== "rapid_naming" || !revealed || locked || timeLeft === null) return
    if (timeLeft <= 0) { setLocked(true); return }
    const t = setTimeout(() => setTimeLeft((prev) => (prev === null ? null : prev - 1)), 1000)
    return () => clearTimeout(t)
  }, [revealed, locked, timeLeft, current])

  /* ---- helper: is block 1 (auditory discrimination) ---- */
  const isBlock1 = current.block === 1
  const isWordImage = current.type === "word_image"
  const isSyllableMatch = current.type === "syllable_match"

  /* ---- text-to-speech ---- */
  const [speaking, setSpeaking] = useState(false)
  /** A Spanish voice picked from the browser's available voices (loaded async) */
  const [spanishVoice, setSpanishVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      // Preferir español de España; si no, cualquier español
      const preferred =
        voices.find((v) => v.lang === "es-ES") ??
        voices.find((v) => v.lang.startsWith("es")) ??
        null
      if (preferred) setSpanishVoice(preferred)
    }
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.85
    if (spanishVoice) utterance.voice = spanishVoice
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [spanishVoice])

  const speakQuestion = useCallback(() => {
    // syllable_count: read the whole word (hyphens removed) so short uppercase
    // syllables like "GA"/"NE" aren't spelled out as acronyms
    if (current.type === "syllable_count" && current.context) {
      speak(current.context.replace(/-/g, ""))
      return
    }

    const parts: string[] = []
    if (current.context) parts.push(current.context.replace("—", "..."))
    parts.push(current.prompt)
    speak(parts.join(". "))
  }, [current, speak])

  /* Play the sequence words one by one, with an 800ms gap between each (máx 3 veces) */
  const speakSequence = useCallback(() => {
    if (!current.sequence || typeof window === "undefined" || !window.speechSynthesis) return
    if (playCount >= 3) return
    window.speechSynthesis.cancel()
    setPlayCount((prev) => prev + 1)
    setSpeaking(true)
    const words = current.sequence
    words.forEach((word, i) => {
      window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = "es-ES"
        utterance.rate = 0.85
        if (spanishVoice) utterance.voice = spanishVoice
        if (i === words.length - 1) utterance.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }, i * 800)
    })
  }, [current, playCount, spanishVoice])

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
      bloque_codigo: bloqueCodigoPorOrden("inicial", b.id),
      orden: b.id,
      correctas: b.correct,
      total: b.total,
    }))

    return (
      <MarcoEvaluacion
        etiqueta="Resultados de la evaluación"
        onVolver={() => salir("/test")}
        nino={acceso.nino}
        nivel="inicial"
        decorado
      >
        {dialogoSalida}
        <FinalEvaluacion
          nivel="inicial"
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
  return (
    <MarcoEvaluacion
      etiqueta={current.blockName}
      onVolver={() => salir("/test")}
      nino={acceso.nino}
      nivel="inicial"
    >
      {dialogoSalida}

      {/* ---- Progress bar with dots ---- */}
      <BarraProgresoEvaluacion total={TOTAL_QUESTIONS} actual={currentIndex} etiqueta={current.blockName} />

      {/* ---- Question card ---- */}
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <TarjetaPregunta
          key={currentIndex}
          bloque={current.blockName}
          audio={
            !isBlock1 && (
              <BotonAudio onClick={speakQuestion} activo={speaking}>
                {speaking ? "Escuchando..." : "Escuchar"}
              </BotonAudio>
            )
          }
        >
          {current.type !== "rapid_naming" ? (
          <>
          {/* Context (block 1: words only, no emojis) */}
          {current.context && current.block === 1 && !isWordImage ? (
            <div className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              {current.context.split(" — ").map((word, i, arr) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <ChipEstimulo className="px-5 py-2 text-2xl font-extrabold tracking-wide sm:text-3xl">{word}</ChipEstimulo>
                    <BotonAudio onClick={() => speak(word)}>Escuchar</BotonAudio>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="hidden text-3xl font-bold text-muted-foreground/60 sm:inline sm:text-4xl">–</span>
                  )}
                </div>
              ))}
            </div>
          ) : current.context && !isWordImage ? (
            <div className="mb-4 flex flex-col items-center gap-2">
              {questionEmojis[current.id]?.prompt && (
                <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].prompt}</span>
              )}
              <ChipEstimulo className="px-8 py-4 text-3xl font-bold tracking-widest sm:text-4xl">
                {current.context}
              </ChipEstimulo>
            </div>
          ) : null}

          {/* Word in a box + audio button (block 1 ej. B word_image / block 3 ej. E syllable_match) */}
          {isWordImage || isSyllableMatch ? (
            <div className="mb-6 flex flex-col items-center gap-3">
              {isSyllableMatch && (
                <TituloConsigna>¿Qué palabra empieza por la misma sílaba?</TituloConsigna>
              )}
              <ChipEstimulo className="px-8 py-4 text-3xl font-extrabold tracking-widest sm:text-4xl">
                {current.prompt}
              </ChipEstimulo>
              {current.context && (
                <p className="text-center text-lg font-semibold text-foreground sm:text-xl">
                  {current.context}
                </p>
              )}
              <BotonAudio onClick={() => speak(current.prompt)}>Escuchar</BotonAudio>
            </div>
          ) : isSequenceOrder ? (
            /* Sequence-order (block 4, ejercicio F): instruction + play-sequence button */
            <div className="mb-6 flex flex-col items-center gap-4">
              <TituloConsigna>{current.prompt}</TituloConsigna>
              <BotonAudio
                onClick={speakSequence}
                disabled={speaking || playCount >= 3}
                activo={speaking}
                agotado={playCount >= 3}
                className="px-5"
              >
                {speaking
                  ? "Reproduciendo..."
                  : playCount >= 3
                    ? "Sin reproducciones"
                    : `Escuchar secuencia (quedan ${3 - playCount})`}
              </BotonAudio>
            </div>
          ) : (
            /* Prompt */
            <div className="mb-6 flex items-center justify-center gap-3">
              {!current.context && questionEmojis[current.id]?.prompt && (
                <span className="text-5xl sm:text-6xl">{questionEmojis[current.id].prompt}</span>
              )}
              <TituloConsigna>{current.prompt}</TituloConsigna>
              {current.block === 2 && questionEmojis[current.id]?.prompt && (
                <span className="text-4xl sm:text-5xl">{questionEmojis[current.id].prompt}</span>
              )}
            </div>
          )}

          {/* Options area */}
          <div className="flex flex-1 flex-col justify-center py-2">
            <div className={`grid gap-4 ${current.options.length <= 2 ? "grid-cols-2" : current.options.length === 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {current.options.map((opt, idx) => {
                const isSelected = selectedOption === idx

                // Block 4 — Ejercicio F (sequence_order): emoji + text + order badge
                if (isSequenceOrder) {
                  const optEmoji = questionEmojis[current.id]?.options?.[idx]
                  const order = sequenceSelection.indexOf(idx)
                  const isPicked = order !== -1
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
                }

                // Block 1 — Ejercicio B (word→image): emoji + text, no per-option audio
                if (isWordImage) {
                  const optEmoji = questionEmojis[current.id]?.options?.[idx]
                  return (
                    <BotonOpcion key={idx} onClick={() => handleSelect(idx)} seleccionada={isSelected}>
                      {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                      <span>{opt}</span>
                    </BotonOpcion>
                  )
                }

                // Block 1 — Ejercicio A (same/different): Sí / No buttons
                if (isBlock1) {
                  const isYes = idx === 0
                  return (
                    <BotonOpcion
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      seleccionada={isSelected}
                      tono={isYes ? "menta" : "rojo"}
                      className="px-4 py-8 text-2xl font-extrabold sm:px-8"
                    >
                      <span className="text-4xl">{isYes ? "👍" : "👎"}</span>
                      {isYes ? "Sí" : "No"}
                    </BotonOpcion>
                  )
                }

                // Default option buttons (with emoji for block 2)
                const optEmoji = questionEmojis[current.id]?.options?.[idx]
                return (
                  <BotonOpcion key={idx} onClick={() => handleSelect(idx)} seleccionada={isSelected}>
                    {optEmoji && <span className="text-4xl sm:text-5xl">{optEmoji}</span>}
                    <span className="flex items-center gap-2">
                      {opt}
                      <Volume2
                        className="size-4 opacity-50 transition-opacity hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); speak(opt) }}
                      />
                    </span>
                  </BotonOpcion>
                )
              })}
            </div>
          </div>
          </>
          ) : (
            /* Bloque 5 — Denominación Rápida (rapid_naming) */
            <div className="flex flex-1 flex-col justify-center py-2">
              <TituloConsigna className="mb-6">{current.prompt}</TituloConsigna>

              {!revealed ? (
                <div className="flex flex-1 items-center justify-center">
                  <Button size="lg" onClick={handleReveal}>
                    Mostrar secuencia
                  </Button>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-md">
                  <p className={`mb-4 text-center text-lg font-bold ${timeLeft !== null && timeLeft <= 5 && !locked ? "text-rojo-fuerte dark:text-primary" : "text-muted-foreground"}`}>
                    {locked ? "¡Tiempo!" : `Tiempo: ${timeLeft}s`}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${current.columns}, minmax(0, 1fr))`, gap: "0.75rem" }}>
                    {current.items?.map((item, idx) => {
                      const isPicked = selectedItems.includes(idx)
                      return (
                        <button
                          key={idx}
                          onClick={() => handleItemToggle(idx)}
                          disabled={locked}
                          className={`
                            rounded-lg transition-all focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-ring
                            ${isPicked ? "ring-[3px] ring-foreground ring-offset-2 ring-offset-card scale-95" : ""}
                            ${locked ? "opacity-90 cursor-not-allowed" : ""}
                          `}
                        >
                          {current.itemKind === "color" ? (
                            <span
                              className="block aspect-square w-full rounded-lg border-2 border-input"
                              style={{ backgroundColor: RAPID_COLORS[item] }}
                            />
                          ) : (
                            <span className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted text-4xl sm:text-5xl">
                              {item}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {!locked && (
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" size="lg" onClick={handleFinishRapid}>
                        Listo
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Next button */}
          <div className="flex justify-end pt-4">
            <Button size="lg" disabled={!canProceed} onClick={handleNext}>
              {currentIndex + 1 === TOTAL_QUESTIONS ? "Finalizar" : "Siguiente"}
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </TarjetaPregunta>
      </div>
    </MarcoEvaluacion>
  )
}
