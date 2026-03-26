"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, Trophy, Star, Sparkles } from "lucide-react"
import {
  type RaceConfig,
  type Challenge,
  getShuffledOptions,
  readingRaceConfig,
  mathRaceConfig,
} from "@/lib/race-engine"
import { shuffle } from "@/lib/shuffle-utils"

interface CarreraEducativaProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
  type?: "reading" | "math"
}

export function CarreraEducativa({ onComplete, mode = "child", type = "reading" }: CarreraEducativaProps) {
  // Seleccionar configuración según el tipo
  const config: RaceConfig = type === "reading" ? readingRaceConfig : mathRaceConfig

  // Estados del juego
  const [challenges] = useState<Challenge[]>(() => shuffle([...config.challenges]).slice(0, config.totalSteps))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [position, setPosition] = useState(0) // Posición del corredor (0 a totalSteps)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [startTime] = useState(Date.now())

  const currentChallenge = challenges[currentIndex]
  const totalSteps = config.totalSteps

  // Mezclar opciones cuando cambia el desafío
  useEffect(() => {
    if (currentChallenge) {
      const shuffled = getShuffledOptions(currentChallenge)
      setOptions(shuffled)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowFeedback(false)
      setShowHint(false)
    }
  }, [currentIndex, currentChallenge])

  // Función de texto a voz
  const speak = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-ES"
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  // Leer el desafío automáticamente
  useEffect(() => {
    if (currentChallenge && !isComplete) {
      const timer = setTimeout(() => {
        speak(currentChallenge.prompt)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, currentChallenge, speak, isComplete])

  // Manejar selección de respuesta
  const handleAnswer = (answer: string) => {
    if (showFeedback || isComplete) return

    setSelectedAnswer(answer)
    const correct = answer === currentChallenge.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setCorrectCount((prev) => prev + 1)
      setPosition((prev) => Math.min(prev + 1, totalSteps))
      speak("¡Muy bien!")
    } else {
      setIncorrectCount((prev) => prev + 1)
      speak("Intenta de nuevo")
    }

    // Avanzar al siguiente desafío después del feedback
    setTimeout(() => {
      if (currentIndex < challenges.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        // Juego completado
        setIsComplete(true)
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        onComplete(correctCount + (correct ? 1 : 0), {
          totalChallenges: challenges.length,
          correctAnswers: correctCount + (correct ? 1 : 0),
          incorrectAnswers: incorrectCount + (correct ? 0 : 1),
          accuracy: ((correctCount + (correct ? 1 : 0)) / challenges.length) * 100,
          timeTaken,
          type: config.type,
        })
      }
    }, 1500)
  }

  // Pantalla de completado
  if (isComplete) {
    const accuracy = Math.round((correctCount / challenges.length) * 100)
    return (
      <div className="space-y-6">
        <Card className="border-4 border-yellow-400 bg-gradient-to-b from-yellow-50 to-orange-50">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute top-0 right-1/3 animate-pulse" />
            </div>

            <h2 className="text-3xl font-bold text-yellow-700">¡Carrera Completada!</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-4xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-gray-600">Correctas</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-4xl font-bold text-blue-600">{accuracy}%</p>
                <p className="text-sm text-gray-600">Precisión</p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-10 h-10 ${
                    i < Math.ceil(accuracy / 20) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <p className="text-lg text-gray-700">
              {accuracy >= 80
                ? "¡Excelente trabajo! Eres un campeón."
                : accuracy >= 60
                  ? "¡Muy bien! Sigue practicando."
                  : "¡Buen esfuerzo! La práctica hace al maestro."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pista de carrera visual */}
      <div className="relative bg-gradient-to-r from-green-100 via-green-50 to-green-100 rounded-2xl p-4 border-2 border-green-300 overflow-hidden">
        {/* Fondo de pista */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-green-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Línea de la pista */}
        <div className="relative h-20">
          {/* Línea base */}
          <div className="absolute top-1/2 left-4 right-4 h-3 bg-amber-200 rounded-full transform -translate-y-1/2 border-2 border-amber-300" />

          {/* Marcadores de progreso */}
          <div className="absolute top-1/2 left-4 right-4 flex justify-between transform -translate-y-1/2">
            {Array.from({ length: totalSteps + 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  i <= position ? "bg-green-500 border-green-600 scale-110" : "bg-white border-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Corredor */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out"
            style={{
              left: `calc(${(position / totalSteps) * 100}% - 16px + 16px)`,
            }}
          >
            <div className="relative">
              <div className="text-4xl animate-bounce">{type === "reading" ? "📚" : "🔢"}</div>
              {position > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800 animate-pulse">
                  {position}
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="text-3xl">🏁</div>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-green-700">
            Paso {currentIndex + 1} de {challenges.length}
          </span>
        </div>
      </div>

      {/* Desafío actual */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Prompt del desafío */}
          <div className="text-center space-y-4">
            <div
              className={`p-6 rounded-2xl ${
                type === "reading"
                  ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200"
                  : "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
              }`}
            >
              <p
                className={`font-bold leading-relaxed ${currentChallenge.prompt.length > 15 ? "text-2xl" : "text-4xl"}`}
              >
                {currentChallenge.prompt}
              </p>
            </div>

            {/* Botón de audio */}
            <Button variant="outline" size="sm" onClick={() => speak(currentChallenge.prompt)} className="gap-2">
              <Volume2 className="w-4 h-4" />
              Escuchar
            </Button>
          </div>

          {/* Instrucción */}
          <p className="text-center text-gray-600 text-sm">
            {type === "reading" ? "Selecciona la palabra correcta:" : "Selecciona la respuesta correcta:"}
          </p>

          {/* Opciones de respuesta - SIEMPRE EN ORDEN ALEATORIO */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrectOption = option === currentChallenge.correctAnswer
              const showResult = showFeedback && isSelected

              return (
                <Button
                  key={`${currentIndex}-${index}-${option}`}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`h-auto py-4 px-4 text-lg font-semibold transition-all duration-300 ${
                    showResult
                      ? isCorrectOption
                        ? "bg-green-500 hover:bg-green-500 text-white border-green-600 scale-105"
                        : "bg-red-500 hover:bg-red-500 text-white border-red-600 shake"
                      : showFeedback && isCorrectOption
                        ? "bg-green-100 border-green-400 text-green-700"
                        : "bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300 hover:scale-102"
                  }`}
                  variant="outline"
                >
                  {option}
                </Button>
              )
            })}
          </div>

          {/* Pista opcional */}
          {currentChallenge.hint && (
            <div className="text-center">
              {showHint ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg inline-block">
                  💡 {currentChallenge.hint}
                </p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  💡 Ver pista
                </Button>
              )}
            </div>
          )}

          {/* Feedback visual */}
          {showFeedback && (
            <div
              className={`text-center p-4 rounded-xl animate-in fade-in duration-300 ${
                isCorrect ? "bg-green-50 border-2 border-green-300" : "bg-orange-50 border-2 border-orange-300"
              }`}
            >
              <p className={`text-xl font-bold ${isCorrect ? "text-green-600" : "text-orange-600"}`}>
                {isCorrect ? "¡Correcto! 🎉" : "¡Casi! La respuesta es:"}
              </p>
              {!isCorrect && (
                <p className="text-lg font-semibold text-gray-700 mt-1">{currentChallenge.correctAnswer}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas en tiempo real */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
          <p className="text-2xl font-bold text-green-600">{correctCount}</p>
          <p className="text-xs text-green-700">Correctas</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-200">
          <p className="text-2xl font-bold text-orange-600">{incorrectCount}</p>
          <p className="text-xs text-orange-700">Intentos</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{challenges.length - currentIndex}</p>
          <p className="text-xs text-blue-700">Restantes</p>
        </div>
      </div>

      {/* Estilos para animación de error */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
