"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Check, X, Volume2, Star, HelpCircle, Lightbulb } from "lucide-react"
import { shuffle } from "@/lib/shuffle-utils"

interface RhymeTimeProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

const rhymeChallenges = [
  {
    word: "cat",
    translation: "gato",
    rhymes: ["hat", "bat", "mat"],
    rhymesTranslation: ["sombrero", "murciélago", "tapete"],
    nonRhymes: ["dog", "car", "sun"],
    image: "🐱",
  },
  {
    word: "ball",
    translation: "pelota",
    rhymes: ["tall", "wall", "fall"],
    rhymesTranslation: ["alto", "pared", "caer"],
    nonRhymes: ["house", "tree", "bike"],
    image: "⚽",
  },
  {
    word: "bee",
    translation: "abeja",
    rhymes: ["tree", "sea", "key"],
    rhymesTranslation: ["árbol", "mar", "llave"],
    nonRhymes: ["bird", "fish", "hand"],
    image: "🐝",
  },
  {
    word: "fox",
    translation: "zorro",
    rhymes: ["box", "socks"],
    rhymesTranslation: ["caja", "calcetines"],
    nonRhymes: ["shoe", "hat", "coat"],
    image: "🦊",
  },
  {
    word: "sun",
    translation: "sol",
    rhymes: ["run", "fun", "bun"],
    rhymesTranslation: ["correr", "diversión", "bollo"],
    nonRhymes: ["moon", "star", "cloud"],
    image: "☀️",
  },
  {
    word: "ship",
    translation: "barco",
    rhymes: ["trip", "chip", "flip"],
    rhymesTranslation: ["viaje", "patata frita", "voltear"],
    nonRhymes: ["boat", "plane", "train"],
    image: "🚢",
  },
]

export function RhymeTime({ onComplete, mode = "child" }: RhymeTimeProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [startTime] = useState(Date.now())
  const [showTranslation, setShowTranslation] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)

  const challenge = rhymeChallenges[currentChallenge]

  useEffect(() => {
    const allWords = [...challenge.rhymes, ...challenge.nonRhymes]
    const shuffledWords = shuffle(allWords)
    setCurrentOptions(shuffledWords)

    setTimeout(() => {
      playSound(`Encuentra palabras que rimen con ${challenge.word}`, "es-ES")
      setTimeout(() => {
        playSound(challenge.word, "en-US")
      }, 2000)
    }, 500)
  }, [currentChallenge])

  const playSound = (text: string, lang = "en-US", slow = true) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = slow ? 0.7 : 0.9
      utterance.pitch = lang === "es-ES" ? 1.0 : 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const handleHint = () => {
    setShowTranslation(true)
    setHintsUsed(hintsUsed + 1)
    playSound("Aquí están las traducciones para ayudarte", "es-ES")
  }

  const handleWordClick = (word: string) => {
    if (showFeedback) return

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      setSelectedWords([...selectedWords, word])
      playSound(word, "en-US")
    }
  }

  const checkAnswer = () => {
    const foundAll = challenge.rhymes.every((rhyme) => selectedWords.includes(rhyme))
    const incorrectlySelected = selectedWords.filter((w) => !challenge.rhymes.includes(w))
    const isCorrect = foundAll && incorrectlySelected.length === 0

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playSound("¡Perfecto! ¡Encontraste todas las rimas!", "es-ES")
    } else {
      playSound("Casi lo tienes. ¡Intenta de nuevo!", "es-ES")
    }

    setShowFeedback(true)

    setTimeout(() => {
      if (currentChallenge < rhymeChallenges.length - 1) {
        setCurrentChallenge(currentChallenge + 1)
        setSelectedWords([])
        setShowFeedback(false)
        setShowTranslation(false)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const accuracy = correctCount / rhymeChallenges.length

        onComplete(correctCount * 10, {
          correctAnswers: correctCount,
          totalChallenges: rhymeChallenges.length,
          accuracy,
          hintsUsed,
          avgResponseTime: timeTaken / rhymeChallenges.length,
        })
      }
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl border-2 border-pink-300">
        <img src="/images/lumo.png" alt="Lumo" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-bold text-base mb-1 text-pink-900">¡Encuentra las rimas!</p>
          <p className="text-sm text-pink-700 leading-relaxed">
            {showFeedback
              ? selectedWords.filter((w) => challenge.rhymes.includes(w)).length === challenge.rhymes.length &&
                selectedWords.filter((w) => !challenge.rhymes.includes(w)).length === 0
                ? "¡Excelente oído para las rimas!"
                : "¡Sigue escuchando esos sonidos que riman!"
              : `Encuentra todas las palabras que rimen con "${challenge.word}" (${challenge.translation})`}
          </p>
        </div>
      </div>

      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-pink-900">
              <Music className="w-6 h-6 text-pink-600" />
              <span className="text-lg">
                Desafío {currentChallenge + 1} de {rhymeChallenges.length}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-pink-900 text-lg">{correctCount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="text-center space-y-4">
            <div className="text-9xl mb-4 animate-bounce-slow">{challenge.image}</div>

            <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200">
              <p className="text-sm text-pink-600 mb-3 font-semibold uppercase tracking-wide">
                Encuentra palabras que rimen con:
              </p>
              <button
                onClick={() => {
                  playSound(challenge.word, "en-US")
                  setTimeout(() => playSound(challenge.word, "en-US"), 1000)
                }}
                className="text-7xl font-black text-pink-700 hover:scale-110 transition-transform flex items-center justify-center gap-4 mx-auto bg-white p-6 rounded-2xl shadow-lg border-2 border-pink-300"
              >
                {challenge.word}
                <Volume2 className="w-12 h-12 text-pink-600" />
              </button>
              <p className="text-lg text-pink-500 mt-3 font-medium">({challenge.translation})</p>
            </div>
          </div>

          {!showFeedback && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleHint}
              className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50 text-base font-bold bg-transparent"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              ¿Necesitas ayuda? Ver traducciones
            </Button>
          )}

          {showTranslation && (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-yellow-700">
                <Lightbulb className="w-6 h-6" />
                <p className="font-bold text-base">Ayuda: Traducciones</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {currentOptions.map((word, index) => {
                  const rhymeIndex = challenge.rhymes.indexOf(word)
                  const translation = rhymeIndex >= 0 ? challenge.rhymesTranslation[rhymeIndex] : "---"
                  return (
                    <div key={index} className="p-3 bg-white rounded-lg border border-yellow-200">
                      <p className="font-bold text-yellow-800">{word}</p>
                      <p className="text-yellow-600 text-xs">({translation})</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {currentOptions.map((word) => {
              const isSelected = selectedWords.includes(word)
              const isRhyme = challenge.rhymes.includes(word)
              const showResult = showFeedback

              return (
                <button
                  key={word}
                  onClick={() => handleWordClick(word)}
                  disabled={showFeedback}
                  className={`p-6 text-2xl font-bold rounded-2xl transition-all duration-300 border-4 min-h-[100px] ${
                    showResult
                      ? isRhyme
                        ? "bg-green-500 text-white border-green-600 shadow-lg scale-105"
                        : isSelected
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-gray-100 border-gray-300 opacity-50"
                      : isSelected
                        ? "bg-pink-500 text-white border-pink-600 scale-95"
                        : "bg-white border-pink-300 hover:border-pink-500 hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>{word}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        playSound(word, "en-US")
                      }}
                      className="mt-1"
                      disabled={showFeedback}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                  {showResult && isRhyme && <Check className="w-8 h-8 mx-auto mt-2" />}
                  {showResult && isSelected && !isRhyme && <X className="w-8 h-8 mx-auto mt-2" />}
                </button>
              )
            })}
          </div>

          {!showFeedback && selectedWords.length > 0 && (
            <Button size="lg" className="w-full text-xl py-6 font-bold" onClick={checkAnswer}>
              Revisar mis rimas ({selectedWords.length} seleccionadas)
            </Button>
          )}

          {showFeedback && (
            <div
              className={`p-8 rounded-2xl text-center animate-fade-in border-4 ${
                selectedWords.filter((w) => challenge.rhymes.includes(w)).length === challenge.rhymes.length &&
                selectedWords.filter((w) => !challenge.rhymes.includes(w)).length === 0
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-500"
                  : "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-500"
              }`}
            >
              {selectedWords.filter((w) => challenge.rhymes.includes(w)).length === challenge.rhymes.length &&
              selectedWords.filter((w) => !challenge.rhymes.includes(w)).length === 0 ? (
                <>
                  <div className="text-8xl mb-4 animate-bounce">🎉</div>
                  <Check className="w-20 h-20 text-green-600 mx-auto mb-4" />
                  <p className="text-3xl font-black text-green-700 mb-2">¡Todas las rimas encontradas!</p>
                  <p className="text-xl text-green-600">¡Excelente trabajo!</p>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-4">🤔</div>
                  <X className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                  <p className="text-3xl font-black text-orange-700 mb-2">¡Casi lo tienes!</p>
                  <div className="mt-4 p-4 bg-white rounded-xl border-2 border-orange-300">
                    <p className="text-lg text-orange-700 mb-2">Las palabras que riman son:</p>
                    <p className="text-2xl font-bold text-orange-600">{challenge.rhymes.join(", ")}</p>
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
