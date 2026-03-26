"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play } from "lucide-react"

interface LluviaPalabrasProps {
  onComplete: (score: number, metrics: any) => void
}

interface FallingWord {
  id: number
  word: string
  isTarget: boolean
  x: number
  y: number
  speed: number
}

const targetWords = ["casa", "gato", "sol", "luna", "mar"]
const distractorWords = ["perro", "árbol", "flor", "nube", "río", "montaña", "estrella"]

export function LluviaPalabras({ onComplete }: LluviaPalabrasProps) {
  const [words, setWords] = useState<FallingWord[]>([])
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [wrongCaught, setWrongCaught] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [streak, setStreak] = useState(0)
  const [startTime] = useState(Date.now())
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const wordIdRef = useRef(0)

  useEffect(() => {
    if (!isPlaying) return

    const gameInterval = setInterval(() => {
      setWords((prevWords) => {
        // Move words down
        const updated = prevWords
          .map((word) => ({
            ...word,
            y: word.y + word.speed,
          }))
          .filter((word) => {
            if (word.y > 100) {
              if (word.isTarget) {
                setMissed((m) => m + 1)
                setStreak(0)
              }
              return false
            }
            return true
          })

        // Add new word randomly
        if (Math.random() < 0.3 && updated.length < 8) {
          const isTarget = Math.random() < 0.4
          const wordList = isTarget ? targetWords : distractorWords
          const newWord: FallingWord = {
            id: wordIdRef.current++,
            word: wordList[Math.floor(Math.random() * wordList.length)],
            isTarget,
            x: Math.random() * 80 + 10,
            y: -10,
            speed: Math.random() * 1 + 1.5,
          }
          updated.push(newWord)
        }

        return updated
      })
    }, 50)

    const timerInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsPlaying(false)
          setTimeout(() => {
            const timeTaken = Math.round((Date.now() - startTime) / 1000)
            const accuracy = score / (score + wrongCaught + missed) || 0
            onComplete(score, {
              correctCaught: score,
              wrongCaught,
              missed,
              avgResponseMs: timeTaken * 1000,
              streak,
              accuracy,
            })
          }, 0)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      clearInterval(gameInterval)
      clearInterval(timerInterval)
    }
  }, [isPlaying, score, wrongCaught, missed, streak, startTime, onComplete])

  const handleWordClick = (word: FallingWord) => {
    if (word.isTarget) {
      setScore(score + 1)
      setStreak(streak + 1)
    } else {
      setWrongCaught(wrongCaught + 1)
      setStreak(0)
    }
    setWords(words.filter((w) => w.id !== word.id))
  }

  return (
    <div className="space-y-6">
      {/* Lumo mascot */}
      <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
        <img src="/images/lumo.png" alt="Lumo" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lumo dice:</p>
          <p className="text-sm text-muted-foreground">
            {streak >= 3
              ? `¡Racha de ${streak}! Seguimos así.`
              : "¡Atrapa solo las palabras objetivo: casa, gato, sol, luna, mar!"}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lluvia de Palabras</CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-2xl text-primary">{score}</p>
                <p className="text-muted-foreground">Correctas</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-2xl text-accent">{timeLeft}s</p>
                <p className="text-muted-foreground">Tiempo</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Game area */}
          <div
            ref={gameAreaRef}
            className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden border-2 border-sky-200"
          >
            {!isPlaying && timeLeft === 60 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <Button size="lg" onClick={() => setIsPlaying(true)}>
                  <Play className="w-5 h-5 mr-2" />
                  Comenzar Juego
                </Button>
              </div>
            )}

            {words.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word)}
                className={`absolute px-4 py-2 rounded-lg font-bold text-lg transition-all hover:scale-110 ${
                  word.isTarget
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground shadow"
                }`}
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {word.word}
              </button>
            ))}

            {isPlaying && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 z-20 bg-transparent"
                onClick={() => setIsPlaying(false)}
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xl font-bold text-green-600">{score}</p>
              <p className="text-xs text-green-700">Atrapadas</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-xl font-bold text-red-600">{wrongCaught}</p>
              <p className="text-xs text-red-700">Errores</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xl font-bold text-orange-600">{missed}</p>
              <p className="text-xs text-orange-700">Perdidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
