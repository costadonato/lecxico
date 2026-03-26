"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Check, X, Volume2, HelpCircle, Lightbulb, Sparkles } from "lucide-react"

interface PictureWordsProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

const wordChallenges = [
  // Palabras CVC simples
  { word: "cat", image: "🐱", difficulty: 1, commonErrors: ["kat"], helpLetters: ["c", "a", "t"] },
  { word: "dog", image: "🐕", difficulty: 1, commonErrors: ["dug"], helpLetters: ["d", "o", "g"] },
  { word: "sun", image: "☀️", difficulty: 1, commonErrors: ["son"], helpLetters: ["s", "u", "n"] },
  { word: "pen", image: "🖊️", difficulty: 1, commonErrors: ["pin"], helpLetters: ["p", "e", "n"] },
  // Palabras con dificultades v/b, i/e para hispanohablantes
  { word: "bed", image: "🛏️", difficulty: 2, commonErrors: ["bad", "bid"], helpLetters: ["b", "e", "d"] },
  { word: "van", image: "🚐", difficulty: 2, commonErrors: ["ban", "fan"], helpLetters: ["v", "a", "n"] },
  { word: "bike", image: "🚲", difficulty: 2, commonErrors: ["baik"], helpLetters: ["b", "i", "k", "e"] },
  // Palabras un poco más largas
  {
    word: "apple",
    image: "🍎",
    difficulty: 3,
    commonErrors: ["aple", "appel"],
    helpLetters: ["a", "p", "p", "l", "e"],
  },
  { word: "fish", image: "🐟", difficulty: 3, commonErrors: ["fis"], helpLetters: ["f", "i", "s", "h"] },
  { word: "tree", image: "🌲", difficulty: 3, commonErrors: ["tri"], helpLetters: ["t", "r", "e", "e"] },
]

export function PictureWords({ onComplete, mode = "child" }: PictureWordsProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [userWord, setUserWord] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintType, setHintType] = useState<"firstLetter" | "silhouette" | "listen" | null>(null)
  const [startTime] = useState(Date.now())
  const [attempts, setAttempts] = useState(0)

  const challenge = wordChallenges[currentChallenge]

  const playSound = (text: string, letterByLetter = false) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()

      if (letterByLetter) {
        const letters = text.split("")
        letters.forEach((letter, index) => {
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(letter)
            utterance.lang = "en-US"
            utterance.rate = 0.5
            utterance.pitch = 1.2
            speechSynthesis.speak(utterance)
          }, index * 800)
        })
      } else {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "en-US"
        utterance.rate = 0.6
        utterance.pitch = 1.1
        speechSynthesis.speak(utterance)
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      playSound(challenge.word)
    }, 500)
  }, [currentChallenge])

  const handleHint = () => {
    if (!hintType) {
      // First hint: show first letter
      setHintType("firstLetter")
      playSound("Look at the first letter")
    } else if (hintType === "firstLetter") {
      // Second hint: listen letter by letter
      setHintType("listen")
      playSound("Listen to each letter")
      setTimeout(() => playSound(challenge.word, true), 1000)
    } else if (hintType === "listen") {
      // Third hint: word silhouette
      setHintType("silhouette")
      playSound("Look at the word shape")
    }

    setShowHint(true)
    setHintsUsed(hintsUsed + 1)
  }

  const checkAnswer = () => {
    setAttempts(attempts + 1)
    const userAnswer = userWord.trim().toLowerCase()
    const correctWord = challenge.word.toLowerCase()
    const isCorrect = userAnswer === correctWord

    if (isCorrect) {
      setCorrectCount(correctCount + 1)
      playSound("Perfect spelling!")
    } else {
      if (challenge.commonErrors.includes(userAnswer)) {
        playSound("Almost! Listen carefully to the sounds")
      } else {
        playSound("Try again! Listen to the word")
      }
      playSound(challenge.word)
    }

    setShowFeedback(true)

    setTimeout(() => {
      if (currentChallenge < wordChallenges.length - 1) {
        setCurrentChallenge(currentChallenge + 1)
        setUserWord("")
        setShowFeedback(false)
        setShowHint(false)
        setHintType(null)
        setAttempts(0)
      } else {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const accuracy = correctCount / wordChallenges.length

        onComplete(correctCount * 10, {
          correctWords: correctCount,
          totalWords: wordChallenges.length,
          accuracy,
          hintsUsed,
          totalAttempts: attempts,
          avgResponseTime: timeTaken / wordChallenges.length,
        })
      }
    }, 3000)
  }

  const renderSilhouette = () => {
    return challenge.word.split("").map((letter, i) => (
      <div
        key={i}
        className={`w-12 h-16 border-4 rounded-lg flex items-center justify-center text-2xl font-bold ${
          letter === letter.toLowerCase() ? "border-purple-300 bg-purple-50" : "border-purple-400 bg-purple-100"
        }`}
      >
        {hintType === "silhouette" && <span className="text-purple-200 select-none">{letter}</span>}
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-300">
        <img src="/images/lumo.png" alt="Lumo" className="w-16 h-16 object-contain mascot-no-bg" />
        <div className="flex-1">
          <p className="font-bold text-base mb-1 text-purple-900">¡Escribe la palabra!</p>
          <p className="text-sm text-purple-700 leading-relaxed">
            {showFeedback
              ? userWord.trim().toLowerCase() === challenge.word.toLowerCase()
                ? "¡Ortografía perfecta!"
                : `Era: ${challenge.word}`
              : "Mira la imagen y escribe la palabra en inglés"}
          </p>
        </div>
      </div>

      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <ImageIcon className="w-6 h-6 text-purple-600" />
              <span className="text-lg">
                Palabra {currentChallenge + 1} de {wordChallenges.length}
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-purple-900 text-lg">{correctCount}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${((currentChallenge + 1) / wordChallenges.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="text-center space-y-6">
            <div className="text-9xl mb-6 animate-bounce-slow">{challenge.image}</div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => playSound(challenge.word)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-base">Escuchar palabra</span>
              </button>
              <button
                onClick={() => playSound(challenge.word, true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-xl font-bold hover:scale-105 transition-transform hover:bg-purple-50"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-base">Letra por letra</span>
              </button>
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
              {!hintType
                ? "Obtener una pista"
                : hintType === "firstLetter"
                  ? "Escuchar letra por letra"
                  : "Mostrar forma de la palabra"}
            </Button>
          )}

          {showHint && (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-yellow-700">
                <Lightbulb className="w-6 h-6" />
                <p className="font-bold text-base">Pista:</p>
              </div>
              {hintType === "firstLetter" && (
                <div className="text-center">
                  <p className="text-sm text-yellow-700 mb-3">La palabra comienza con:</p>
                  <div className="text-6xl font-black text-yellow-600 bg-white p-6 rounded-xl border-4 border-yellow-300 inline-block">
                    {challenge.word[0].toUpperCase()}
                  </div>
                </div>
              )}
              {hintType === "silhouette" && (
                <div className="space-y-3">
                  <p className="text-sm text-yellow-700 text-center">Forma de la palabra:</p>
                  <div className="flex gap-2 justify-center">{renderSilhouette()}</div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-base font-bold text-purple-700 block">Escribe la palabra aquí:</label>
            <input
              type="text"
              value={userWord}
              onChange={(e) => setUserWord(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && userWord && !showFeedback) {
                  checkAnswer()
                }
              }}
              disabled={showFeedback}
              className="w-full p-6 text-4xl font-bold text-center border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 bg-white"
              placeholder="..."
              autoFocus
              style={{ fontFamily: "OpenDyslexic, Arial, sans-serif" }}
            />
            <p className="text-sm text-muted-foreground text-center">{challenge.word.length} letras</p>
          </div>

          {!showFeedback && userWord && (
            <Button size="lg" className="w-full text-xl py-6 font-bold" onClick={checkAnswer}>
              Revisar Ortografía
            </Button>
          )}

          {showFeedback && (
            <div
              className={`p-8 rounded-2xl text-center animate-fade-in border-4 ${
                userWord.trim().toLowerCase() === challenge.word.toLowerCase()
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-500"
                  : "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-500"
              }`}
            >
              {userWord.trim().toLowerCase() === challenge.word.toLowerCase() ? (
                <>
                  <div className="text-8xl mb-4 animate-bounce">🎉</div>
                  <Check className="w-20 h-20 text-green-600 mx-auto mb-4" />
                  <p className="text-3xl font-black text-green-700 mb-2">¡Excelente!</p>
                  <p className="text-xl text-green-600">¡Ortografía perfecta de {challenge.word}!</p>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-4">🤔</div>
                  <X className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                  <p className="text-3xl font-black text-orange-700 mb-3">¡Inténtalo de nuevo!</p>
                  <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-orange-300 space-y-3">
                    <p className="text-lg text-orange-700">La palabra correcta es:</p>
                    <p className="text-6xl font-black text-orange-600 tracking-wider">{challenge.word}</p>
                    {challenge.commonErrors.includes(userWord.trim().toLowerCase()) && (
                      <p className="text-base text-orange-600 mt-3">
                        ¡Este es un error común! Escucha los sonidos con atención.
                      </p>
                    )}
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
