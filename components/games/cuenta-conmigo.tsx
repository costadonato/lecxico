"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Lightbulb } from "lucide-react"

interface CuentaConmigoProps {
  onComplete: (score: number, metrics: any) => void
}

const levels = [
  { count: 3, emoji: "🍎", name: "manzanas" },
  { count: 5, emoji: "🐶", name: "perritos" },
  { count: 7, emoji: "⭐", name: "estrellas" },
  { count: 4, emoji: "🚗", name: "autitos" },
  { count: 6, emoji: "🦋", name: "mariposas" },
  { count: 8, emoji: "🌸", name: "flores" },
  { count: 9, emoji: "🎈", name: "globos" },
  { count: 10, emoji: "🍪", name: "galletitas" },
]

export function CuentaConmigo({ onComplete }: CuentaConmigoProps) {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [correctCount, setCorrectCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const level = levels[currentLevel]
  const options = [level.count - 1, level.count, level.count + 1, level.count + 2]
    .filter((n) => n > 0)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-AR"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAnswer = (answer: number) => {
    if (feedback) return
    setSelectedAnswer(answer)
    setAttempts(attempts + 1)
    const isCorrect = answer === level.count
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playAudio("¡Muy bien!")
      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(currentLevel + 1)
          setSelectedAnswer(null)
          setFeedback(null)
          setShowHint(false)
        } else {
          const timeTaken = Math.round((Date.now() - startTime) / 1000)
          const accuracy = (correctCount + 1) / levels.length
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
      playAudio("Probá otra vez")
      setTimeout(() => {
        setFeedback(null)
        setSelectedAnswer(null)
      }, 1500)
    }
  }

  const useHint = () => {
    setHintsUsed(hintsUsed + 1)
    setShowHint(true)
    playAudio(`Contá las ${level.name} una por una`)
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
              ? "¡Contaste perfecto! Sos un campeón de los números 🎉"
              : feedback === "incorrect"
                ? "Tranquilo, contá de nuevo con calma"
                : `¿Cuántas ${level.name} ves? ¡Contá con tu dedito!`}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center">
            Nivel {currentLevel + 1} de {levels.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objects to count */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-primary/20">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {Array.from({ length: level.count }).map((_, i) => (
                <div
                  key={i}
                  className="text-6xl animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: "2s" }}
                >
                  {level.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-center text-yellow-800 font-semibold">
                💡 Tocá cada {level.emoji} mientras contás: 1, 2, 3...
              </p>
            </div>
          )}

          {/* Answer options */}
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={feedback !== null}
                className={`p-6 text-4xl font-bold rounded-xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 ${
                  selectedAnswer === option
                    ? feedback === "correct"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
                aria-label={`Opción ${option}`}
              >
                {option}
              </button>
            ))}
          </div>

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
                {feedback === "correct" ? "¡Excelente! 🌟" : "Intentá otra vez 💪"}
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
              onClick={() => playAudio(`¿Cuántas ${level.name} hay?`)}
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
