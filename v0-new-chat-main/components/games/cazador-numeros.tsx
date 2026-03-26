"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Lightbulb } from "lucide-react"

interface CazadorNumerosProps {
  onComplete: (score: number, metrics: any) => void
}

const decorativeEmojis = ["⭐", "🌸", "🦋", "🌈", "☁️", "🌙", "💫", "🎨"]

export function CazadorNumeros({ onComplete }: CazadorNumerosProps) {
  const [targetNumber, setTargetNumber] = useState(1)
  const [numbers, setNumbers] = useState<{ num: number; x: number; y: number; found: boolean }[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [showHint, setShowHint] = useState(false)

  const maxNumber = 10

  useEffect(() => {
    // Generate random positions for numbers 1-10
    const nums = Array.from({ length: maxNumber }, (_, i) => ({
      num: i + 1,
      x: Math.random() * 70 + 10, // 10-80% from left
      y: Math.random() * 70 + 10, // 10-80% from top
      found: false,
    }))
    setNumbers(nums)
  }, [])

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-AR"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleNumberClick = (num: number) => {
    setAttempts(attempts + 1)
    if (num === targetNumber) {
      setNumbers(numbers.map((n) => (n.num === num ? { ...n, found: true } : n)))
      setFeedback(`¡Encontraste el ${num}!`)
      playAudio(`¡Muy bien! Encontraste el ${num}`)

      if (targetNumber === maxNumber) {
        // Complete!
        setTimeout(() => {
          const timeTaken = Math.round((Date.now() - startTime) / 1000)
          onComplete(maxNumber, {
            attempts,
            timeTaken,
            hintsUsed,
            accuracy: 1,
            completed: true,
          })
        }, 1500)
      } else {
        setTimeout(() => {
          setTargetNumber(targetNumber + 1)
          setFeedback(null)
          setShowHint(false)
        }, 1500)
      }
    } else {
      setFeedback(`Ese es el ${num}, buscá el ${targetNumber}`)
      playAudio(`Ese no es, buscá el ${targetNumber}`)
      setTimeout(() => setFeedback(null), 2000)
    }
  }

  const useHint = () => {
    setHintsUsed(hintsUsed + 1)
    setShowHint(true)
    playAudio(`Buscá el número ${targetNumber}`)
  }

  return (
    <div className="space-y-6">
      {/* Lex mascot */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <img src="/images/lex.png" alt="Lex" className="w-16 h-16 object-contain" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lex dice:</p>
          <p className="text-sm text-muted-foreground">
            {targetNumber === maxNumber && feedback
              ? "¡Encontraste todos los números! Sos un detective numérico 🕵️"
              : feedback
                ? feedback
                : `¡Buscá el número ${targetNumber}!`}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-3">
            <span>Buscá el número:</span>
            <span className="text-5xl font-bold text-primary">{targetNumber}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game area */}
          <div className="relative h-[400px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-primary/20 overflow-hidden">
            {/* Decorative emojis */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`deco-${i}`}
                className="absolute text-3xl opacity-20"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                }}
              >
                {decorativeEmojis[Math.floor(Math.random() * decorativeEmojis.length)]}
              </div>
            ))}

            {/* Numbers */}
            {numbers.map((item) => (
              <button
                key={item.num}
                onClick={() => handleNumberClick(item.num)}
                disabled={item.found}
                className={`absolute text-4xl font-bold rounded-full w-16 h-16 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50 ${
                  item.found
                    ? "bg-green-500 text-white scale-0"
                    : showHint && item.num === targetNumber
                      ? "bg-yellow-400 text-yellow-900 animate-pulse"
                      : "bg-white text-primary shadow-lg hover:shadow-xl"
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: item.found ? "scale(0)" : "scale(1)",
                }}
                aria-label={`Número ${item.num}`}
              >
                {item.num}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {Array.from({ length: maxNumber }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full ${i < targetNumber - 1 ? "bg-green-500" : "bg-gray-200"}`}
              />
            ))}
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-center text-yellow-800 font-semibold">
                💡 El número {targetNumber} está brillando en amarillo
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={useHint} disabled={showHint}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Pista
            </Button>
            <Button className="flex-1" onClick={() => playAudio(`Buscá el número ${targetNumber}`)} variant="outline">
              <Volume2 className="w-4 h-4 mr-2" />
              Escuchar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
