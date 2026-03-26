"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Trophy, ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

// Mock exercise data - will be replaced with real data from Supabase
const exerciseData = {
  "1": {
    title: "Encuentra las Letras",
    type: "letter-recognition",
    difficulty: "Fácil",
    xp: 50,
    questions: [
      {
        id: 1,
        instruction: "Encuentra todas las letras 'b' en la siguiente palabra:",
        word: "biblioteca",
        targetLetter: "b",
        correctCount: 2,
      },
      {
        id: 2,
        instruction: "Encuentra todas las letras 'd' en la siguiente palabra:",
        word: "dedicado",
        targetLetter: "d",
        correctCount: 3,
      },
      {
        id: 3,
        instruction: "Encuentra todas las letras 'p' en la siguiente palabra:",
        word: "papelería",
        targetLetter: "p",
        correctCount: 2,
      },
    ],
  },
  "2": {
    title: "Palabras Mágicas",
    type: "word-formation",
    difficulty: "Fácil",
    xp: 50,
    questions: [
      {
        id: 1,
        instruction: "Ordena las letras para formar una palabra:",
        letters: ["G", "A", "T", "O"],
        correctWord: "GATO",
      },
      {
        id: 2,
        instruction: "Ordena las letras para formar una palabra:",
        letters: ["C", "A", "S", "A"],
        correctWord: "CASA",
      },
      {
        id: 3,
        instruction: "Ordena las letras para formar una palabra:",
        letters: ["S", "O", "L"],
        correctWord: "SOL",
      },
    ],
  },
  "3": {
    title: "Comprensión de Lectura",
    type: "reading-comprehension",
    difficulty: "Medio",
    xp: 100,
    passage:
      "El sol brillaba en el cielo azul. María salió al jardín con su perro Max. Jugaron juntos toda la tarde. Max corría detrás de la pelota mientras María reía feliz.",
    questions: [
      {
        id: 1,
        question: "¿Cómo estaba el cielo?",
        options: ["Nublado", "Azul", "Gris", "Oscuro"],
        correctAnswer: "Azul",
      },
      {
        id: 2,
        question: "¿Cómo se llama el perro?",
        options: ["Rex", "Max", "Bruno", "Rocky"],
        correctAnswer: "Max",
      },
      {
        id: 3,
        question: "¿Qué hacía Max?",
        options: ["Dormía", "Comía", "Corría detrás de la pelota", "Ladraba"],
        correctAnswer: "Corría detrás de la pelota",
      },
    ],
  },
}

export default function ExercisePage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string
  const exercise = exerciseData[exerciseId as keyof typeof exerciseData]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Ejercicio no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/child">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = exercise.questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const checkAnswer = () => {
    if (!selectedAnswer) return

    let correct = false

    if (exercise.type === "reading-comprehension") {
      const question = exercise.questions[currentQuestion] as any
      correct = selectedAnswer === question.correctAnswer
    }

    setIsCorrect(correct)
    if (correct) {
      setScore(score + 1)
    }
    setShowFeedback(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setIsCorrect(false)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    const percentage = Math.round((score / totalQuestions) * 100)
    const earnedXP = Math.round((percentage / 100) * exercise.xp)

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 relative overflow-hidden">
          {/* Lex celebrating */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20 md:opacity-40">
            <img src="/images/lex.png" alt="Lex celebrando" className="w-full h-full object-contain animate-float" />
          </div>
          {/* Lumo celebrating */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20 md:opacity-40">
            <img
              src="/images/lumo.png"
              alt="Lumo celebrando"
              className="w-full h-full object-contain animate-float-delayed"
            />
          </div>

          <CardHeader className="text-center space-y-4 relative z-10">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
            <CardTitle className="text-4xl">Ejercicio Completado!</CardTitle>
            <CardDescription className="text-lg">
              {percentage >= 80 ? "Excelente trabajo!" : "Buen intento! Sigue practicando!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-primary">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Precisión</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-accent">
                  {score}/{totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Correctas</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-secondary">+{earnedXP}</p>
                <p className="text-sm text-muted-foreground">XP Ganados</p>
              </div>
            </div>

            {percentage >= 80 && (
              <div className="flex items-center justify-center gap-2 p-4 bg-secondary/10 rounded-xl">
                <Star className="w-6 h-6 text-secondary fill-secondary" />
                <Star className="w-6 h-6 text-secondary fill-secondary" />
                <Star className="w-6 h-6 text-secondary fill-secondary" />
              </div>
            )}

            {/* Motivational message from mascots */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={percentage >= 80 ? "/images/lex.png" : "/images/lumo.png"}
                  alt={percentage >= 80 ? "Lex" : "Lumo"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{percentage >= 80 ? "Lex dice:" : "Lumo dice:"}</p>
                <p className="text-sm text-muted-foreground">
                  {percentage >= 80
                    ? "Increíble! Estás mejorando cada día. Sigue así!"
                    : "No te preocupes! Cada intento te hace más fuerte. Vamos a intentarlo de nuevo!"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/dashboard/child">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/dashboard/child">
                  Siguiente Ejercicio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/child">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Salir
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary fill-secondary" />
                <span className="font-bold">+{exercise.xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{exercise.title}</span>
                  <span className="text-muted-foreground">
                    Pregunta {currentQuestion + 1} de {totalQuestions}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          {exercise.type === "reading-comprehension" && (
            <>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Lee el siguiente texto:</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{exercise.passage}</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{(exercise.questions[currentQuestion] as any).question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(exercise.questions[currentQuestion] as any).options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={showFeedback}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                        selectedAnswer === option
                          ? showFeedback
                            ? isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{option}</span>
                        {showFeedback && selectedAnswer === option && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center">
                            {isCorrect ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* Feedback */}
          {showFeedback && (
            <Card className={`border-2 ${isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isCorrect ? <Check className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                      {isCorrect ? "Correcto!" : "Incorrecto"}
                    </p>
                    <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {isCorrect ? "Excelente trabajo!" : "Sigue intentando, lo harás mejor la próxima vez!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showFeedback ? (
              <Button size="lg" className="w-full text-lg" onClick={checkAnswer} disabled={!selectedAnswer}>
                Verificar Respuesta
              </Button>
            ) : (
              <Button size="lg" className="w-full text-lg" onClick={nextQuestion}>
                {currentQuestion < totalQuestions - 1 ? "Siguiente Pregunta" : "Ver Resultados"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
