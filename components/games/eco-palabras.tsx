"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Volume2, Check, X, Lightbulb } from "lucide-react"

interface EcoPalabrasProps {
  onComplete: (score: number, metrics: any) => void
}

const words = [
  { word: "casa", syllables: ["ca", "sa"], image: "🏠" },
  { word: "perro", syllables: ["pe", "rro"], image: "🐕" },
  { word: "libro", syllables: ["li", "bro"], image: "📚" },
  { word: "flor", syllables: ["flor"], image: "🌸" },
  { word: "mariposa", syllables: ["ma", "ri", "po", "sa"], image: "🦋" },
]

export function EcoPalabras({ onComplete }: EcoPalabrasProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showSyllables, setShowSyllables] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [startTime] = useState(Date.now())

  const currentWord = words[currentIndex]

  const playAudio = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = "es-ES"
      utterance.rate = 0.7
      window.speechSynthesis.speak(utterance)
    }
  }

  const checkAnswer = () => {
    setAttempts(attempts + 1)
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase()
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setUserInput("")
          setFeedback(null)
          setShowSyllables(false)
        } else {
          const timeTaken = Math.round((Date.now() - startTime) / 1000)
          const accuracy = correctCount / words.length
          onComplete(correctCount, {
            correctSpellRate: accuracy,
            attemptsPerWord: attempts / words.length,
            hintsRequested: hintsUsed,
            timeTaken,
          })
        }
      }, 1500)
    } else {
      setTimeout(() => {
        setFeedback(null)
      }, 1500)
    }
  }

  const useHint = () => {
    setHintsUsed(hintsUsed + 1)
    setShowSyllables(true)
  }

  return (
    <div className="space-y-6">
      {/* Lumo mascot */}
      <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
        <img src="/images/lumo.png" alt="Lumo" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lumo dice:</p>
          <p className="text-sm text-muted-foreground">
            {feedback === "correct"
              ? "¡Excelente ortografía!"
              : feedback === "incorrect"
                ? "Mirá la sílaba resaltada."
                : "Escucha la palabra y escríbela correctamente."}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center">
            Palabra {currentIndex + 1} de {words.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-9xl">{currentWord.image}</div>
            <Button variant="outline" size="lg" onClick={playAudio}>
              <Volume2 className="w-5 h-5 mr-2" />
              Escuchar palabra
            </Button>
          </div>

          {/* Syllables hint */}
          {showSyllables && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm text-muted-foreground mb-2 text-center">Pista - Sílabas:</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {currentWord.syllables.map((syllable, index) => (
                  <span key={index} className="px-4 py-2 bg-primary/10 rounded-lg font-bold text-lg">
                    {syllable}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Escribe la palabra:</label>
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              placeholder="Escribe aquí..."
              className="text-2xl text-center h-16"
              disabled={feedback !== null}
              autoFocus
            />
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
              <div>
                <p className={`font-bold ${feedback === "correct" ? "text-green-700" : "text-red-700"}`}>
                  {feedback === "correct" ? "¡Perfecto!" : "Intenta de nuevo"}
                </p>
                {feedback === "incorrect" && (
                  <p className="text-sm text-red-600">La palabra correcta es: {currentWord.word}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={useHint} disabled={feedback !== null || showSyllables}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Ver Sílabas
            </Button>
            <Button className="flex-1" onClick={checkAnswer} disabled={!userInput.trim() || feedback !== null}>
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
