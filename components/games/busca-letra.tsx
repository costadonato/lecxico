"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Check, X, Timer } from "lucide-react"

interface BuscaLetraProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

const challenges = [
  { letter: "a", grid: "abeacdaefagahaiajak", size: 4, difficulty: "easy" },
  { letter: "m", grid: "mnmopqmrstmuvwmxyzm", size: 4, difficulty: "easy" },
  { letter: "s", grid: "sabcsdsesfsgshsisjskslsmsn", size: 5, difficulty: "medium" },
  { letter: "r", grid: "rabcrdefrgrhrijrklrmnroprqrrsrt", size: 6, difficulty: "medium" },
  { letter: "p", grid: "pabcpdefpghipjklpmnopqrsptuv pwxypz", size: 6, difficulty: "hard" },
]

export function BuscaLetra({ onComplete, mode = "child" }: BuscaLetraProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isActive, setIsActive] = useState(false)
  const [startTime] = useState(Date.now())

  const challenge = challenges[currentChallenge]
  const gridArray = challenge.grid.split("")
  const correctIndices = gridArray
    .map((char, index) => (char === challenge.letter ? index : -1))
    .filter((index) => index !== -1)

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          checkAnswer()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, currentChallenge])

  const handleCellClick = (index: number) => {
    if (showFeedback || !isActive) return

    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index))
    } else {
      setSelectedIndices([...selectedIndices, index])
    }
  }

  const checkAnswer = () => {
    setIsActive(false)
    const foundAll = correctIndices.every((i) => selectedIndices.includes(i))
    const noExtras = selectedIndices.every((i) => correctIndices.includes(i))
    const isCorrect = foundAll && noExtras

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
    }

    setShowFeedback(true)

    setTimeout(() => {
      if (currentChallenge < challenges.length - 1) {
        setCurrentChallenge(currentChallenge + 1)
        setSelectedIndices([])
        setShowFeedback(false)
        setTimeLeft(30)
        setIsActive(false)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const accuracy = correctCount / challenges.length
        const avgResponseTime = timeTaken / challenges.length

        onComplete(correctCount, {
          correctIdentifications: correctCount,
          falsePositives: selectedIndices.filter((i) => !correctIndices.includes(i)).length,
          avgResponseTime,
          accuracy,
        })
      }
    }, 3000)
  }

  const startChallenge = () => {
    setIsActive(true)
    setTimeLeft(30)
  }

  const instructions =
    mode === "child"
      ? `¡Encuentra todas las letras "${challenge.letter.toUpperCase()}" en la cuadrícula!`
      : `Identifica todas las ocurrencias de la letra "${challenge.letter.toUpperCase()}" lo más rápido posible.`

  return (
    <div className="space-y-6">
      {/* Mascot */}
      <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
        <img
          src={mode === "child" ? "/images/lex.png" : "/images/lumo.png"}
          alt={mode === "child" ? "Lex" : "Lumo"}
          className="w-16 h-16 object-contain mascot-no-bg"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">{mode === "child" ? "Lex" : "Lumo"} dice:</p>
          <p className="text-sm text-muted-foreground">
            {showFeedback
              ? correctCount === currentChallenge + 1
                ? "¡Excelente atención visual!"
                : "Sigue entrenando tu vista de águila."
              : instructions}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-600" />
              Desafío {currentChallenge + 1} de {challenges.length}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4" />
              <span className={`font-bold ${timeLeft <= 10 ? "text-red-600" : "text-cyan-600"}`}>{timeLeft}s</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isActive && !showFeedback && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🔍</div>
              <div className="p-4 bg-cyan-50 rounded-xl">
                <p className="text-3xl font-bold text-cyan-700 mb-2">
                  Busca la letra: <span className="text-5xl">{challenge.letter.toUpperCase()}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en todas las letras "{challenge.letter.toUpperCase()}" que encuentres
                </p>
              </div>
              <Button size="lg" onClick={startChallenge}>
                Comenzar Búsqueda
              </Button>
            </div>
          )}

          {(isActive || showFeedback) && (
            <>
              {/* Grid */}
              <div
                className="grid gap-2 mx-auto max-w-md"
                style={{
                  gridTemplateColumns: `repeat(${challenge.size}, minmax(0, 1fr))`,
                }}
              >
                {gridArray.map((char, index) => {
                  const isSelected = selectedIndices.includes(index)
                  const isCorrectCell = correctIndices.includes(index)
                  const showResult = showFeedback

                  return (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={showFeedback}
                      className={`aspect-square flex items-center justify-center text-2xl font-bold rounded-lg transition-all ${
                        showResult
                          ? isCorrectCell
                            ? "bg-green-500 text-white"
                            : isSelected
                              ? "bg-red-500 text-white"
                              : "bg-muted"
                          : isSelected
                            ? "bg-cyan-500 text-white scale-95"
                            : "bg-muted hover:bg-muted/80 hover:scale-105"
                      }`}
                    >
                      {char}
                    </button>
                  )
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <div
                  className={`p-6 rounded-xl text-center ${
                    correctCount === currentChallenge + 1
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-orange-50 border-2 border-orange-500"
                  }`}
                >
                  {correctCount === currentChallenge + 1 ? (
                    <>
                      <Check className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-green-700">¡Encontraste todas!</p>
                    </>
                  ) : (
                    <>
                      <X className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-orange-700">Casi perfecto</p>
                      <p className="text-orange-600">
                        Había {correctIndices.length} letras "{challenge.letter.toUpperCase()}"
                      </p>
                    </>
                  )}
                </div>
              )}

              {!showFeedback && (
                <Button className="w-full" onClick={checkAnswer}>
                  Verificar Respuesta
                </Button>
              )}
            </>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">{correctCount}</p>
              <p className="text-xs text-cyan-700">Correctas</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{selectedIndices.length}</p>
              <p className="text-xs text-blue-700">Seleccionadas</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{correctIndices.length}</p>
              <p className="text-xs text-purple-700">Objetivo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
