"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Check, X, Volume2, Timer } from "lucide-react"

interface SightWordsProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

const sightWords = [
  { word: "the", sentence: "I love ___ sun.", correctPosition: 2 },
  { word: "and", sentence: "Cat ___ dog play.", correctPosition: 1 },
  { word: "you", sentence: "Do ___ like games?", correctPosition: 1 },
  { word: "can", sentence: "I ___ run fast!", correctPosition: 1 },
  { word: "see", sentence: "I ___ a bird.", correctPosition: 1 },
  { word: "said", sentence: "She ___ hello.", correctPosition: 1 },
  { word: "have", sentence: "We ___ fun today.", correctPosition: 1 },
  { word: "they", sentence: "___ are my friends.", correctPosition: 0 },
]

export function SightWords({ onComplete, mode = "child" }: SightWordsProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [showWord, setShowWord] = useState(true)
  const [userAnswer, setUserAnswer] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [flashTime, setFlashTime] = useState(3)
  const [startTime] = useState(Date.now())

  const challenge = sightWords[currentChallenge]

  useEffect(() => {
    setShowWord(true)
    playSound(`Recuerda esta palabra: ${challenge.word}`)

    const timer = setTimeout(() => {
      setShowWord(false)
      playSound("Ahora encuentra la palabra en la frase")
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentChallenge])

  useEffect(() => {
    if (showWord && flashTime > 0) {
      const timer = setTimeout(() => {
        setFlashTime(flashTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showWord, flashTime])

  const playSound = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-US"
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  const handleAnswerSubmit = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === challenge.word.toLowerCase()

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playSound("¡Correcto! ¡Gran memoria!")
    } else {
      playSound("Intenta recordar la palabra la próxima vez!")
    }

    setShowFeedback(true)

    setTimeout(() => {
      if (currentChallenge < sightWords.length - 1) {
        setCurrentChallenge(currentChallenge + 1)
        setUserAnswer("")
        setShowFeedback(false)
        setFlashTime(3)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const accuracy = correctCount / sightWords.length

        onComplete(correctCount, {
          correctWords: correctCount,
          totalWords: sightWords.length,
          accuracy,
          avgResponseTime: timeTaken / sightWords.length,
        })
      }
    }, 2500)
  }

  const sentenceParts = challenge.sentence.split("___")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
        <img src="/images/lex.png" alt="Lex" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Lex dice:</p>
          <p className="text-sm text-muted-foreground">
            {showFeedback
              ? userAnswer.toLowerCase().trim() === challenge.word.toLowerCase()
                ? "¡Perfecto! ¡Lo recordaste!"
                : `La palabra era "${challenge.word}"`
              : showWord
                ? "¡Mira con atención y recuerda esta palabra!"
                : "Escribe la palabra que acabas de ver"}
          </p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-600" />
              Palabra {currentChallenge + 1} de {sightWords.length}
            </CardTitle>
            <span className="font-bold text-cyan-600">
              {correctCount} / {sightWords.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showWord ? (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 text-cyan-600 mb-4">
                <Timer className="w-6 h-6" />
                <span className="text-2xl font-bold">{flashTime}s</span>
              </div>

              <div className="p-12 bg-cyan-50 rounded-xl border-4 border-cyan-200">
                <p className="text-sm text-cyan-600 mb-4 font-semibold uppercase">Recuerda esta palabra:</p>
                <button
                  onClick={() => playSound(challenge.word)}
                  className="text-8xl font-bold text-cyan-700 hover:scale-110 transition-transform mx-auto flex items-center gap-4"
                >
                  {challenge.word}
                  <Volume2 className="w-12 h-12" />
                </button>
              </div>

              <p className="text-muted-foreground">La palabra desaparecerá en {flashTime} segundos...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-xl">
                  <p className="text-2xl text-center leading-relaxed">
                    {sentenceParts[0]}
                    <span className="inline-block w-32 h-12 border-b-4 border-cyan-500 mx-2"></span>
                    {sentenceParts[1]}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-muted-foreground">
                    Escribe la palabra que recuerdas:
                  </label>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && userAnswer && !showFeedback) {
                        handleAnswerSubmit()
                      }
                    }}
                    disabled={showFeedback}
                    className="w-full p-4 text-2xl font-bold text-center border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    placeholder="Escribe aquí..."
                    autoFocus
                  />
                </div>
              </div>

              {!showFeedback && userAnswer && (
                <Button size="lg" className="w-full" onClick={handleAnswerSubmit}>
                  Revisar Respuesta
                </Button>
              )}

              {showFeedback && (
                <div
                  className={`p-6 rounded-xl text-center ${
                    userAnswer.toLowerCase().trim() === challenge.word.toLowerCase()
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-orange-50 border-2 border-orange-500"
                  }`}
                >
                  {userAnswer.toLowerCase().trim() === challenge.word.toLowerCase() ? (
                    <>
                      <Check className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-green-700">¡Excelente memoria!</p>
                    </>
                  ) : (
                    <>
                      <X className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-orange-700">La palabra era:</p>
                      <p className="text-4xl font-bold text-orange-600 mt-2">{challenge.word}</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
