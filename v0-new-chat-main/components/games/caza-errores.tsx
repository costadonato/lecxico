"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, X, Sparkles } from "lucide-react"
import { generateCasaDeErroresSet, type GeneratedSentence } from "@/lib/game-generators"

interface CazaErroresProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

export function CazaErrores({ onComplete, mode = "child" }: CazaErroresProps) {
  const [sentences, setSentences] = useState<GeneratedSentence[]>([])
  const [currentSentence, setCurrentSentence] = useState(0)
  const [selectedWords, setSelectedWords] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const generatedSentences = generateCasaDeErroresSet(8)
    setSentences(generatedSentences)
  }, [])

  if (sentences.length === 0) {
    return <div className="text-center p-8">Generando desafíos...</div>
  }

  const sentence = sentences[currentSentence]
  const words = sentence.withErrors.split(" ")
  const errorPositions = sentence.errors.map((e) => e.position)

  const handleWordClick = (index: number) => {
    if (showFeedback) return

    if (selectedWords.includes(index)) {
      setSelectedWords(selectedWords.filter((i) => i !== index))
    } else {
      setSelectedWords([...selectedWords, index])
    }
  }

  const checkAnswer = () => {
    const foundAll = errorPositions.every((pos) => selectedWords.includes(pos))
    const noExtras = selectedWords.every((pos) => errorPositions.includes(pos))
    const isCorrect = foundAll && noExtras

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
    }

    setShowFeedback(true)

    setTimeout(() => {
      if (currentSentence < sentences.length - 1) {
        setCurrentSentence(currentSentence + 1)
        setSelectedWords([])
        setShowFeedback(false)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const totalErrors = sentences.reduce((sum, s) => sum + s.errors.length, 0)
        const accuracy = correctCount / sentences.length

        onComplete(correctCount * 10, {
          errorsDetected: selectedWords.length,
          correctDetections: correctCount,
          falsePositives: selectedWords.filter((pos) => !errorPositions.includes(pos)).length,
          avgTimePerSentence: timeTaken / sentences.length,
          accuracy,
        })
      }
    }, 4000)
  }

  const instructions =
    mode === "child"
      ? "¡Encuentra las palabras con errores de ortografía!"
      : "Identifica todas las palabras con errores ortográficos en la oración."

  return (
    <div className="space-y-6">
      {/* Mascot */}
      <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <img
          src={mode === "child" ? "/images/lex.png" : "/images/lumo.png"}
          alt={mode === "child" ? "Lex" : "Lumo"}
          className="w-16 h-16 object-contain mascot-no-bg"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">{mode === "child" ? "Lex" : "Lumo"} dice:</p>
          <p className="text-sm text-muted-foreground">
            {showFeedback
              ? correctCount === currentSentence + 1
                ? "¡Eres un detective de la ortografía!"
                : "Revisa las palabras resaltadas en verde."
              : instructions}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Oración {currentSentence + 1} de {sentences.length}
            </CardTitle>
            <div className="text-sm">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">
                {sentence.errors.length} {sentence.errors.length === 1 ? "error" : "errores"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sentence */}
          <div className="p-6 bg-muted/30 rounded-xl">
            <div className="flex flex-wrap gap-2 text-xl leading-relaxed">
              {words.map((word, index) => {
                const isSelected = selectedWords.includes(index)
                const isError = errorPositions.includes(index)
                const showResult = showFeedback

                return (
                  <button
                    key={index}
                    onClick={() => handleWordClick(index)}
                    disabled={showFeedback}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      showResult
                        ? isError
                          ? "bg-green-500 text-white"
                          : isSelected
                            ? "bg-red-500 text-white"
                            : ""
                        : isSelected
                          ? "bg-amber-500 text-white scale-105"
                          : "hover:bg-muted hover:scale-105"
                    }`}
                  >
                    {word}
                    {showResult && isError && (
                      <span className="block text-xs mt-1 font-normal">
                        ✓ {sentence.errors.find((e) => e.position === index)?.correct}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`p-6 rounded-xl ${
                correctCount === currentSentence + 1
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-orange-50 border-2 border-orange-500"
              }`}
            >
              {correctCount === currentSentence + 1 ? (
                <div className="text-center">
                  <Check className="w-16 h-16 text-green-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-700 mb-2">¡Perfecto!</p>
                  <p className="text-green-600">Encontraste todos los errores</p>
                </div>
              ) : (
                <div className="text-center">
                  <X className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-orange-700 mb-2">Casi lo logras</p>
                  <p className="text-orange-600 mb-3">Las palabras con errores eran:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sentence.errors.map((error, index) => (
                      <div key={index} className="px-4 py-2 bg-white rounded-lg border-2 border-orange-300">
                        <span className="line-through text-red-600 font-bold">{error.word}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-green-600 font-bold">{error.correct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!showFeedback && (
            <Button className="w-full" onClick={checkAnswer} disabled={selectedWords.length === 0}>
              <Sparkles className="w-4 h-4 mr-2" />
              Verificar Respuesta
            </Button>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{correctCount}</p>
              <p className="text-xs text-amber-700">Correctas</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{selectedWords.length}</p>
              <p className="text-xs text-blue-700">Seleccionadas</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{sentence.errors.length}</p>
              <p className="text-xs text-green-700">Errores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
