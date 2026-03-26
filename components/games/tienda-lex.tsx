"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Lightbulb, ShoppingCart, Coins } from "lucide-react"

interface TiendaLexProps {
  onComplete: (score: number, metrics: any) => void
}

const items = [
  { name: "Manzana", emoji: "🍎", price: 2 },
  { name: "Galletitas", emoji: "🍪", price: 3 },
  { name: "Jugo", emoji: "🧃", price: 4 },
  { name: "Helado", emoji: "🍦", price: 5 },
  { name: "Chocolate", emoji: "🍫", price: 6 },
  { name: "Caramelos", emoji: "🍬", price: 3 },
  { name: "Pan", emoji: "🍞", price: 2 },
  { name: "Leche", emoji: "🥛", price: 4 },
]

const generateLevel = (difficulty: number) => {
  const item = items[Math.floor(Math.random() * items.length)]
  const money = difficulty <= 3 ? item.price + 1 : item.price + Math.floor(Math.random() * 3) + 1
  const change = money - item.price
  return { item, money, change }
}

export function TiendaLex({ onComplete }: TiendaLexProps) {
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
  const options = [level.change - 1, level.change, level.change + 1, level.change + 2]
    .filter((n) => n >= 0)
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
    const isCorrect = answer === level.change
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playAudio("¡Compraste perfecto!")
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
    playAudio(`Tenés ${level.money} pesos y gastás ${level.item.price}. ¿Cuánto te sobra?`)
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
              ? "¡Compraste perfecto! Sos un experto en compras 🛒"
              : feedback === "incorrect"
                ? "Tranquilo, pensá cuánto te sobra"
                : "¡Bienvenido a mi tienda! ¿Cuánto vuelto te doy?"}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Compra {currentLevel + 1} de {totalLevels}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shop scenario */}
          <div className="space-y-4">
            {/* Item to buy */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{level.item.emoji}</div>
                  <div>
                    <p className="text-xl font-bold">{level.item.name}</p>
                    <p className="text-2xl text-primary font-bold">${level.item.price}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Money you have */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-green-600" />
                  <p className="text-lg font-semibold">Tenés:</p>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: level.money }).map((_, i) => (
                    <div key={i} className="text-3xl">
                      💵
                    </div>
                  ))}
                  <span className="text-3xl font-bold text-green-700">${level.money}</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <p className="text-center text-lg font-semibold text-yellow-900">¿Cuánto vuelto te dan? 🤔</p>
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-center text-yellow-800 font-semibold">
                💡 Restá: ${level.money} - ${level.item.price} = ?
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
                aria-label={`Opción ${option} pesos`}
              >
                ${option}
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
                {feedback === "correct" ? "¡Excelente compra! 🌟" : "Intentá otra vez 💪"}
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
              onClick={() =>
                playAudio(`Comprás ${level.item.name} por ${level.item.price} pesos con ${level.money} pesos`)
              }
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
