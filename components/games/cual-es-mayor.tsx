"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Lightbulb } from "lucide-react"

interface CualEsMayorProps {
  onComplete: (score: number, metrics: any) => void
}

const emojis = ["🍎", "🐶", "⭐", "🚗", "🦋", "🌸", "🎈", "🍪", "🎨", "🎵"]

const generateLevel = () => {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  const leftCount = Math.floor(Math.random() * 8) + 2
  const rightCount = Math.floor(Math.random() * 8) + 2
  return { emoji, leftCount, rightCount }
}

export function CualEsMayor({ onComplete }: CualEsMayorProps) {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [level, setLevel] = useState(generateLevel())
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [correctCount, setCorrectCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const totalLevels = 8

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-AR"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAnswer = (side: "left" | "right") => {
    if (feedback) return
    setSelectedSide(side)
    setAttempts(attempts + 1)
    const isCorrect =
      (side === "left" && level.leftCount > level.rightCount) ||
      (side === "right" && level.rightCount > level.leftCount)
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playAudio("¡Perfecto!")
      setTimeout(() => {
        if (currentLevel < totalLevels - 1) {
          setCurrentLevel(currentLevel + 1)
          setLevel(generateLevel())
          setSelectedSide(null)
          setFeedback(null)
          setShowHint(false)
        } else {
          const timeTaken = Math.round((Date.now() - startTime) / 1000)
          const accuracy = (correctCount + 1) / totalLevels
          onComplete(correctCount + 1, {
            attempts,
            timeTaken,
            hintsUsed,
            accuracy,
            completed: true,
          })
        }
      }, 2000)
    } else {
      playAudio("Mirá bien las cantidades")
      setTimeout(() => {
        setFeedback(null)
        setSelectedSide(null)
      }, 1500)
    }
  }

  const useHint = () => {
    setHintsUsed(hintsUsed + 1)
    setShowHint(true)
    playAudio("Contá los objetos de cada lado y compará")
  }

  return (
    <div className="space-y-6">
      {/* Lex mascot */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <img src="/images/lex.png" alt="Lex" className="w-16 h-16 object-contain" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lex dice:</p>
          <p className="text-sm text-muted-foreground">
            {feedback === "correct"
              ? "¡Excelente! Sabés comparar cantidades como un experto 🏆"
              : feedback === "incorrect"
                ? "Tranquilo, mirá bien cada grupo"
                : "¿Qué lado tiene MÁS? ¡Elegí el grupo más grande!"}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center">
            Nivel {currentLevel + 1} de {totalLevels}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comparison area */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left side */}
            <button
              onClick={() => handleAnswer("left")}
              disabled={feedback !== null}
              className={`p-6 rounded-xl border-4 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 ${
                selectedSide === "left"
                  ? feedback === "correct"
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-primary/30 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-primary"
              }`}
              aria-label={`Lado izquierdo con ${level.leftCount} objetos`}
            >
              <div className="flex flex-wrap gap-2 justify-center items-center min-h-[200px]">
                {Array.from({ length: level.leftCount }).map((_, i) => (
                  <div key={i} className="text-4xl">
                    {level.emoji}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-2xl font-bold text-primary">{level.leftCount}</div>
            </button>

            {/* Right side */}
            <button
              onClick={() => handleAnswer("right")}
              disabled={feedback !== null}
              className={`p-6 rounded-xl border-4 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 ${
                selectedSide === "right"
                  ? feedback === "correct"
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-primary/30 bg-gradient-to-br from-pink-50 to-orange-50 hover:border-primary"
              }`}
              aria-label={`Lado derecho con ${level.rightCount} objetos`}
            >
              <div className="flex flex-wrap gap-2 justify-center items-center min-h-[200px]">
                {Array.from({ length: level.rightCount }).map((_, i) => (
                  <div key={i} className="text-4xl">
                    {level.emoji}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-2xl font-bold text-primary">{level.rightCount}</div>
            </button>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-center text-yellow-800 font-semibold">
                💡 Contá cada grupo y elegí el que tiene MÁS objetos
              </p>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl ${
                feedback === "correct" ? "bg-green-50 border-2 border-green-500" : "bg-red-50 border-2 border-red-500"
              }`}
            >
              {feedback === "correct" ? (
                <Check className="w-8 h-8 text-green-600" />
              ) : (
                <X className="w-8 h-8 text-red-600" />
              )}
              <p className={`font-bold ${feedback === "correct" ? "text-green-700" : "text-red-700"}`}>
                {feedback === "correct" ? "¡Genial! 🌟" : "Probá otra vez 💪"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={useHint} disabled={feedback !== null || showHint}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Pista
            </Button>
            <Button
              className="flex-1"
              onClick={() => playAudio("¿Qué lado tiene más?")}
              variant="outline"
              disabled={feedback !== null}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Escuchar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
