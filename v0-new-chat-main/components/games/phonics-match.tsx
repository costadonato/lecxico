"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Check, X, Star, HelpCircle } from "lucide-react"
import { generatePhonicsMatchSet, type PhonicsChallenge } from "@/lib/game-generators"

interface PhonicsMatchProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

export function PhonicsMatch({ onComplete, mode = "child" }: PhonicsMatchProps) {
  const [challenges, setChallenges] = useState<PhonicsChallenge[]>([])
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showTranslation, setShowTranslation] = useState(false)
  const [startTime] = useState(Date.now())

  const challenge = challenges[currentChallengeIndex]

  useEffect(() => {
    const generatedChallenges = generatePhonicsMatchSet(12) // 12 unique challenges
    setChallenges(generatedChallenges)
  }, [])

  useEffect(() => {
    if (challenge) {
      setTimeout(() => {
        playSound(challenge.word, "en-US")
        setTimeout(() => playSound(challenge.word, "en-US"), 1500)
      }, 500)
    }
  }, [currentChallengeIndex, challenge])

  if (challenges.length === 0) {
    return <div className="text-center p-8">Generando desafíos...</div>
  }

  const playSound = (text: string, lang = "en-US") => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.7 // Más lento para aprender
      utterance.pitch = 1.2
      utterance.volume = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  const handleHint = () => {
    setShowTranslation(true)
    setHintsUsed(hintsUsed + 1)
    playSound(`La palabra significa ${challenge.spanish}`, "es-ES")
    setTimeout(() => {
      playSound(challenge.word, "en-US")
    }, 2000)
  }

  const handleAnswer = (answer: string) => {
    if (showFeedback) return

    setSelectedAnswer(answer)
    const isCorrect = answer === challenge.image

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playSound("¡Excelente!", "es-ES")
    } else {
      playSound("¡Intenta de nuevo!", "es-ES")
    }

    setShowFeedback(true)

    setTimeout(() => {
      if (currentChallengeIndex < challenges.length - 1) {
        setCurrentChallengeIndex(currentChallengeIndex + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setShowTranslation(false)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const accuracy = (correctCount + (selectedAnswer === challenge.image ? 1 : 0)) / challenges.length

        onComplete((correctCount + (selectedAnswer === challenge.image ? 1 : 0)) * 10, {
          correctAnswers: correctCount + (selectedAnswer === challenge.image ? 1 : 0),
          totalQuestions: challenges.length,
          accuracy,
          hintsUsed,
          avgResponseTime: timeTaken / challenges.length,
        })
      }
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
        <img src="/images/lex.png" alt="Lex" className="w-16 h-16 object-contain" />
        <div className="flex-1">
          <p className="font-bold text-lg mb-1 text-blue-900">🎧 Escucha y selecciona</p>
          <p className="text-base text-blue-700 leading-relaxed">
            Escucha la palabra en inglés y selecciona la imagen correcta
          </p>
        </div>
      </div>

      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Volume2 className="w-6 h-6 text-blue-600" />
              <span className="text-xl">Palabra {currentChallengeIndex + 1}</span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                <span className="font-bold text-yellow-900 text-lg">{correctCount}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((currentChallengeIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {currentChallengeIndex + 1} de {challenges.length} palabras
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          <div className="text-center space-y-4">
            <p className="text-base text-blue-600 font-semibold">Escucha la palabra:</p>

            <button
              onClick={() => {
                playSound(challenge.word, "en-US")
                setTimeout(() => playSound(challenge.word, "en-US"), 1200)
              }}
              className="group mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-12 py-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-4 border-blue-300"
            >
              <div className="flex flex-col items-center gap-4">
                <Volume2 className="w-16 h-16 group-hover:scale-110 transition-transform" />
                <span className="text-5xl font-black tracking-wide">{challenge.word}</span>
                <span className="text-sm opacity-90 font-medium">Click para escuchar</span>
              </div>
            </button>

            {showTranslation && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl animate-fade-in">
                <p className="text-lg text-yellow-800">
                  <span className="font-semibold">Significado:</span> {challenge.spanish}
                </p>
              </div>
            )}
          </div>

          {!showFeedback && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleHint}
              className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50 text-lg py-6 bg-transparent"
            >
              <HelpCircle className="w-6 h-6 mr-2" />
              Ver traducción al español
            </Button>
          )}

          <div className="space-y-3">
            <p className="text-center text-base font-semibold text-gray-700">Selecciona la imagen correcta:</p>

            <div className="grid grid-cols-2 gap-4">
              {challenge.options.map((option) => {
                const isSelected = selectedAnswer === option
                const isCorrect = option === challenge.image
                const showResult = showFeedback

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={`p-8 text-8xl rounded-3xl transition-all duration-300 border-4 min-h-[140px] flex items-center justify-center relative ${
                      showResult
                        ? isCorrect
                          ? "bg-green-500 border-green-600 shadow-2xl scale-105 animate-bounce-once"
                          : isSelected
                            ? "bg-red-500 border-red-600 scale-95"
                            : "bg-gray-100 border-gray-300 opacity-40"
                        : isSelected
                          ? "bg-blue-100 border-blue-500 scale-95"
                          : "bg-white border-blue-200 hover:border-blue-500 hover:scale-105 hover:shadow-xl hover:bg-blue-50"
                    }`}
                  >
                    {option}
                    {showResult && isCorrect && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-10 h-10 text-white bg-green-600 rounded-full p-1" />
                      </div>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <div className="absolute top-2 right-2">
                        <X className="w-10 h-10 text-white bg-red-600 rounded-full p-1" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {showFeedback && (
            <div
              className={`p-8 rounded-3xl text-center animate-fade-in border-4 ${
                selectedAnswer === challenge.image
                  ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-500"
                  : "bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-500"
              }`}
            >
              {selectedAnswer === challenge.image ? (
                <>
                  <div className="text-8xl mb-4">🎉</div>
                  <p className="text-4xl font-black text-green-700 mb-3">¡Perfecto!</p>
                  <p className="text-xl text-green-600 mb-3">
                    <span className="font-bold">{challenge.word}</span> es{" "}
                    <span className="font-bold">{challenge.spanish}</span>
                  </p>
                  <div className="text-7xl">{challenge.image}</div>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-4">🤔</div>
                  <p className="text-4xl font-black text-orange-700 mb-3">¡Casi!</p>
                  <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-orange-300">
                    <p className="text-lg text-orange-700 mb-2">La respuesta correcta era:</p>
                    <div className="text-8xl my-4">{challenge.image}</div>
                    <p className="text-2xl font-bold text-orange-900">
                      {challenge.word} = {challenge.spanish}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
