"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Lightbulb, Plus } from "lucide-react"

interface SuperSumadorProps {
  onComplete: (score: number, metrics: any) => void
}

const emojis = ["🍎", "🐶", "⭐", "🚗", "🦋", "🌸", "🎈", "🍪"]

const generateLevel = (difficulty: number) => {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  const maxNum = difficulty <= 3 ? 5 : difficulty <= 6 ? 8 : 10
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1
  return { emoji, num1, num2, answer: num1 + num2 }
}

export function SuperSumador({ onComplete }: SuperSumadorProps) {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [level, setLevel] = useState(generateLevel(1))
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [correctCount, setCorrectCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const totalLevels = 8
  const options = [level.answer - 2, level.answer - 1, level.answer, level.answer + 1]
    .filter((n) => n > 0)
    .sort(() => Math.random() - 0.5)

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
    const isCorrect = answer === level.answer
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playAudio("¡Sumaste perfecto!")
      setTimeout(() => {
        if (currentLevel < totalLevels - 1) {
          setCurrentLevel(currentLevel + 1)
          setLevel(generateLevel(currentLevel + 2))
          setSelectedAnswer(null)
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
    playAudio(`Contá todos los objetos juntos`)
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
              ? "¡Sumaste genial! Los números son tus amigos 🎉"
              : feedback === "incorrect"
                ? "Tranquilo, contá todos los objetos juntos"
                : "¡Juntemos los grupos y contemos todos!"}
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
          {/* Addition visualization */}
          <div className="flex items-center justify-center gap-4">
            {/* First group */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-primary/20">
              <div className="flex flex-wrap gap-2 justify-center max-w-[150px]">
                {Array.from({ length: level.num1 }).map((_, i) => (
                  <div key={i} className="text-4xl">
                    {level.emoji}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-3xl font-bold text-center text-primary">{level.num1}</div>
            </div>

            {/* Plus sign */}
            <div className="text-5xl font-bold text-primary">
              <Plus className="w-12 h-12" />
            </div>

            {/* Second group */}
            <div className="p-6 bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl border-2 border-primary/20">
              <div className="flex flex-wrap gap-2 justify-center max-w-[150px]">
                {Array.from({ length: level.num2 }).map((_, i) => (
                  <div key={i} className="text-4xl">
                    {level.emoji}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-3xl font-bold text-center text-primary">{level.num2}</div>
            </div>

            {/* Equals */}
            <div className="text-5xl font-bold text-primary">=</div>

            {/* Question mark */}
            <div className="text-6xl">❓</div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-center text-yellow-800 font-semibold">
                💡 Contá todos los {level.emoji} juntos: {level.num1} + {level.num2} = ?
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
                {feedback === "correct" ? "¡Excelente suma! 🌟" : "Intentá otra vez 💪"}
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
              onClick={() => playAudio(`¿Cuánto es ${level.num1} más ${level.num2}?`)}
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
