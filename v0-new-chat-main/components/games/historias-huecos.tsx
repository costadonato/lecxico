"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Volume2 } from "lucide-react"

interface HistoriasHuecosProps {
  onComplete: (score: number, metrics: any) => void
}

const stories = [
  {
    id: 1,
    text: "El sol brillaba en el cielo ___. María salió al jardín con su perro Max. Jugaron juntos toda la ___.",
    blanks: [
      { position: 0, options: ["azul", "verde", "rojo"], correct: "azul" },
      { position: 1, options: ["mañana", "tarde", "noche"], correct: "tarde" },
    ],
    image: "☀️",
  },
  {
    id: 2,
    text: "En el bosque vivía un ___ muy sabio. Todos los animales iban a pedirle ___.",
    blanks: [
      { position: 0, options: ["búho", "gato", "perro"], correct: "búho" },
      { position: 1, options: ["comida", "consejos", "juguetes"], correct: "consejos" },
    ],
    image: "🦉",
  },
]

export function HistoriasHuecos({ onComplete }: HistoriasHuecosProps) {
  const [currentStory, setCurrentStory] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [startTime] = useState(Date.now())

  const story = stories[currentStory]

  const readText = () => {
    if ("speechSynthesis" in window) {
      const fullText = story.text.replace(/___/g, "espacio en blanco")
      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.lang = "es-ES"
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSelectAnswer = (blankIndex: number, answer: string) => {
    if (showFeedback) return
    setSelectedAnswers({ ...selectedAnswers, [blankIndex]: answer })
  }

  const checkAnswers = () => {
    let correct = 0
    story.blanks.forEach((blank, index) => {
      if (selectedAnswers[index] === blank.correct) {
        correct++
      }
    })

    setCorrectCount(correctCount + correct)
    setShowFeedback(true)

    setTimeout(() => {
      if (currentStory < stories.length - 1) {
        setCurrentStory(currentStory + 1)
        setSelectedAnswers({})
        setShowFeedback(false)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const totalBlanks = stories.reduce((sum, s) => sum + s.blanks.length, 0)
        const accuracy = correctCount / totalBlanks
        onComplete(correctCount, {
          choicesSelected: Object.keys(selectedAnswers).length,
          correctChoices: correctCount,
          timePerText: timeTaken / stories.length,
          accuracy,
        })
      }
    }, 3000)
  }

  const renderTextWithBlanks = () => {
    const parts = story.text.split("___")
    return (
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < story.blanks.length && (
              <span className="inline-flex flex-wrap gap-2 mx-1">
                {story.blanks[index].options.map((option) => {
                  const isSelected = selectedAnswers[index] === option
                  const isCorrect = option === story.blanks[index].correct
                  const showResult = showFeedback && isSelected

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectAnswer(index, option)}
                      disabled={showFeedback}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        showResult
                          ? isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {option}
                      {showResult &&
                        (isCorrect ? <Check className="inline w-4 h-4 ml-1" /> : <X className="inline w-4 h-4 ml-1" />)}
                    </button>
                  )
                })}
              </span>
            )}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lex mascot */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <img src="/images/lex.png" alt="Lex" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lex dice:</p>
          <p className="text-sm text-muted-foreground">
            {showFeedback
              ? "¡Gran inferencia!"
              : "Lee el texto y elige las palabras correctas para completar los espacios."}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Historia {currentStory + 1} de {stories.length}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={readText}>
              <Volume2 className="w-4 h-4 mr-2" />
              Leer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-6xl">{story.image}</div>

          <div className="p-6 bg-muted/30 rounded-xl">{renderTextWithBlanks()}</div>

          {!showFeedback && (
            <Button
              className="w-full"
              onClick={checkAnswers}
              disabled={Object.keys(selectedAnswers).length < story.blanks.length}
            >
              Verificar Respuestas
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
