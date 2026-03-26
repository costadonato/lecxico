"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Brain } from "lucide-react"
import { generateMemoTonoSet, type MemoTonoSequence } from "@/lib/game-generators"

interface MemoTonoProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

export function MemoTono({ onComplete, mode = "child" }: MemoTonoProps) {
  const [sequences, setSequences] = useState<MemoTonoSequence[]>([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [phase, setPhase] = useState<"listen" | "recall" | "feedback">("listen")
  const [userSequence, setUserSequence] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [correctCount, setCorrectCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(Date.now())
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const generatedSequences = generateMemoTonoSet(6) // 6 unique levels
    setSequences(generatedSequences)
  }, [])

  if (sequences.length === 0) {
    return <div className="text-center p-8">Generando secuencias...</div>
  }

  const currentSequence = sequences[currentLevel]

  const playSequence = async () => {
    if (!("speechSynthesis" in window)) return

    setIsPlaying(true)
    setPhase("listen")

    for (let i = 0; i < currentSequence.words.length; i++) {
      await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(currentSequence.words[i])
        utterance.lang = "es-ES"
        utterance.rate = 0.7
        utterance.onend = () => {
          setTimeout(resolve, 800)
        }
        window.speechSynthesis.speak(utterance)
      })
    }

    setIsPlaying(false)
    setPhase("recall")
  }

  const handleAddWord = () => {
    if (!currentInput.trim()) return
    setUserSequence([...userSequence, currentInput.trim().toLowerCase()])
    setCurrentInput("")
  }

  const handleRemoveWord = (index: number) => {
    setUserSequence(userSequence.filter((_, i) => i !== index))
  }

  const checkSequence = () => {
    setAttempts(attempts + 1)
    const isCorrect =
      userSequence.length === currentSequence.words.length &&
      userSequence.every((word, index) => word === currentSequence.words[index].toLowerCase())

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
    }

    setPhase("feedback")

    setTimeout(() => {
      if (currentLevel < sequences.length - 1) {
        setCurrentLevel(currentLevel + 1)
        setUserSequence([])
        setPhase("listen")
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const accuracy = correctCount / sequences.length
        const maxSequenceLength = Math.max(...sequences.map((s) => s.words.length))

        onComplete(correctCount * 10, {
          maxSequenceLength,
          avgRecallTime: timeTaken / sequences.length,
          errorsCount: attempts - correctCount,
          accuracy,
        })
      }
    }, 3000)
  }

  const instructions =
    mode === "child"
      ? "¡Escucha las palabras y repítelas en el mismo orden!"
      : "Memoriza la secuencia de palabras y reprodúcela en el orden correcto."

  return (
    <div className="space-y-6">
      {/* Mascot */}
      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <img
          src={mode === "child" ? "/images/lex.png" : "/images/lumo.png"}
          alt={mode === "child" ? "Lex" : "Lumo"}
          className="w-16 h-16 object-contain mascot-no-bg"
        />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">{mode === "child" ? "Lex" : "Lumo"} dice:</p>
          <p className="text-sm text-muted-foreground">
            {phase === "listen"
              ? instructions
              : phase === "recall"
                ? mode === "child"
                  ? "¡Ahora escribe las palabras que escuchaste!"
                  : "Reproduce la secuencia completa."
                : correctCount === currentLevel + 1
                  ? "¡Memoria perfecta!"
                  : "Sigue practicando, cada intento mejora tu memoria."}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Nivel {currentLevel + 1} de {sequences.length}
            </CardTitle>
            <div className="text-sm">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                {currentSequence.words.length} palabras
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Listen Phase */}
          {phase === "listen" && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🎧</div>
              <Button size="lg" onClick={playSequence} disabled={isPlaying}>
                <Volume2 className="w-5 h-5 mr-2" />
                {isPlaying ? "Escuchando..." : "Escuchar Secuencia"}
              </Button>
              <p className="text-sm text-muted-foreground">Presta atención y memoriza el orden de las palabras</p>
            </div>
          )}

          {/* Recall Phase */}
          {phase === "recall" && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  Palabras que recordaste ({userSequence.length}/{currentSequence.words.length}):
                </p>
                <div className="flex flex-wrap gap-2 justify-center min-h-12">
                  {userSequence.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleRemoveWord(index)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                    >
                      {index + 1}. {word}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                  placeholder="Escribe una palabra..."
                  className="flex-1 px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <Button onClick={handleAddWord} disabled={!currentInput.trim()}>
                  Agregar
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={checkSequence}
                disabled={userSequence.length !== currentSequence.words.length}
              >
                Verificar Secuencia
              </Button>
            </div>
          )}

          {/* Feedback Phase */}
          {phase === "feedback" && (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-xl text-center ${
                  correctCount === currentLevel + 1
                    ? "bg-green-50 border-2 border-green-500"
                    : "bg-orange-50 border-2 border-orange-500"
                }`}
              >
                {correctCount === currentLevel + 1 ? (
                  <>
                    <Check className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-green-700 mb-2">¡Perfecto!</p>
                    <p className="text-green-600">Recordaste todas las palabras en orden</p>
                  </>
                ) : (
                  <>
                    <X className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-orange-700 mb-2">Casi lo logras</p>
                    <p className="text-orange-600 mb-3">La secuencia correcta era:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentSequence.words.map((word, index) => (
                        <span key={index} className="px-4 py-2 bg-white rounded-lg font-semibold">
                          {index + 1}. {word}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{correctCount}</p>
              <p className="text-xs text-purple-700">Correctas</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{currentSequence.words.length}</p>
              <p className="text-xs text-blue-700">Palabras</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{attempts}</p>
              <p className="text-xs text-amber-700">Intentos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
