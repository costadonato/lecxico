"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Lightbulb } from "lucide-react"

interface RompeYUneProps {
  onComplete: (score: number, metrics: any) => void
}

const words = [
  { word: "casa", syllables: ["ca", "sa"], image: "🏠" },
  { word: "gato", syllables: ["ga", "to"], image: "🐱" },
  { word: "pelota", syllables: ["pe", "lo", "ta"], image: "⚽" },
  { word: "mariposa", syllables: ["ma", "ri", "po", "sa"], image: "🦋" },
  { word: "computadora", syllables: ["com", "pu", "ta", "do", "ra"], image: "💻" },
]

export function RompeYUne({ onComplete }: RompeYUneProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([])
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([])
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [startTime] = useState(Date.now())
  const [correctCount, setCorrectCount] = useState(0)

  const currentWord = words[currentWordIndex]

  useEffect(() => {
    // Shuffle syllables
    const shuffled = [...currentWord.syllables].sort(() => Math.random() - 0.5)
    setShuffledSyllables(shuffled)
    setSelectedSyllables([])
    setFeedback(null)
  }, [currentWordIndex])

  const playAudio = () => {
    // Simulate TTS - in production, use Web Speech API
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = "es-ES"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSyllableClick = (syllable: string, index: number) => {
    if (feedback) return
    setSelectedSyllables([...selectedSyllables, syllable])
    setShuffledSyllables(shuffledSyllables.filter((_, i) => i !== index))
  }

  const handleRemoveSyllable = (index: number) => {
    if (feedback) return
    const syllable = selectedSyllables[index]
    setShuffledSyllables([...shuffledSyllables, syllable])
    setSelectedSyllables(selectedSyllables.filter((_, i) => i !== index))
  }

  const checkAnswer = () => {
    setAttempts(attempts + 1)
    const isCorrect = selectedSyllables.join("") === currentWord.word
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1)
        } else {
          // Complete exercise
          const timeTaken = Math.round((Date.now() - startTime) / 1000)
          const accuracy = correctCount / words.length
          onComplete(correctCount, {
            attempts,
            timeTaken,
            hintsUsed,
            accuracy,
            completed: true,
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
    playAudio()
  }

  return (
    <div className="space-y-6">
      {/* Lex mascot */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <img src="/images/lex.png" alt="Lex" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lex dice:</p>
          <p className="text-sm text-muted-foreground">
            {feedback === "correct"
              ? "¡Genial! Lo lograste!"
              : feedback === "incorrect"
                ? "Tranquilo, escuchá otra vez."
                : "¡Separamos las palabras en pedacitos!"}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center">
            Palabra {currentWordIndex + 1} de {words.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image and audio */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-8xl">{currentWord.image}</div>
            <Button variant="outline" size="lg" onClick={playAudio}>
              <Volume2 className="w-5 h-5 mr-2" />
              Escuchar palabra
            </Button>
          </div>

          {/* Selected syllables area */}
          <div className="min-h-20 p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
            <p className="text-sm text-muted-foreground mb-2 text-center">Arrastra las sílabas aquí:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedSyllables.map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => handleRemoveSyllable(index)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-xl font-bold hover:bg-primary/80 transition-all"
                  disabled={feedback !== null}
                >
                  {syllable}
                </button>
              ))}
            </div>
          </div>

          {/* Available syllables */}
          <div className="flex flex-wrap gap-3 justify-center">
            {shuffledSyllables.map((syllable, index) => (
              <button
                key={index}
                onClick={() => handleSyllableClick(syllable, index)}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-xl text-xl font-bold hover:bg-accent/80 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                disabled={feedback !== null}
                aria-label={`Sílaba ${syllable}, clic para seleccionar y formar la palabra`}
                aria-pressed={selectedSyllables.includes(syllable)}
              >
                {syllable}
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
                {feedback === "correct" ? "¡Perfecto!" : "Probemos otra vez"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={useHint} disabled={feedback !== null}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Pista
            </Button>
            <Button
              className="flex-1"
              onClick={checkAnswer}
              disabled={selectedSyllables.length === 0 || feedback !== null}
            >
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
