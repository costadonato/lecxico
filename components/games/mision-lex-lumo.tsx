"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Star, Trophy, ChevronRight } from "lucide-react"

interface MisionLexLumoProps {
  onComplete: (score: number, metrics: any) => void
  mode?: "child" | "teen"
}

const missions = [
  {
    id: 1,
    title: "El Tesoro Perdido",
    story:
      "Lex y Lumo encontraron un mapa antiguo que lleva a un tesoro escondido. ¡Ayúdalos a resolver los acertijos!",
    tasks: [
      {
        type: "syllables",
        question: "¿Cuántas sílabas tiene la palabra 'tesoro'?",
        options: ["2", "3", "4"],
        correct: "3",
      },
      {
        type: "comprehension",
        question: "¿Qué encontraron Lex y Lumo?",
        options: ["Un libro", "Un mapa", "Una llave"],
        correct: "Un mapa",
      },
      {
        type: "spelling",
        question: "Completa: El tesoro está _____ (escondido/escondido)",
        options: ["escondido", "escondido", "escondido"],
        correct: "escondido",
      },
    ],
    reward: 150,
  },
  {
    id: 2,
    title: "La Aventura Espacial",
    story: "Lumo construyó un cohete para viajar al espacio. Lex está emocionado por explorar las estrellas.",
    tasks: [
      {
        type: "syllables",
        question: "Separa en sílabas: 'cohete'",
        options: ["co-he-te", "coh-e-te", "co-het-e"],
        correct: "co-he-te",
      },
      {
        type: "comprehension",
        question: "¿Quién construyó el cohete?",
        options: ["Lex", "Lumo", "Ambos"],
        correct: "Lumo",
      },
      {
        type: "vocabulary",
        question: "¿Qué significa 'explorar'?",
        options: ["Dormir", "Descubrir lugares nuevos", "Comer"],
        correct: "Descubrir lugares nuevos",
      },
    ],
    reward: 150,
  },
]

export function MisionLexLumo({ onComplete, mode = "child" }: MisionLexLumoProps) {
  const [currentMission, setCurrentMission] = useState(0)
  const [currentTask, setCurrentTask] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalStars, setTotalStars] = useState(0)
  const [startTime] = useState(Date.now())
  const [phase, setPhase] = useState<"intro" | "tasks" | "complete">("intro")

  const mission = missions[currentMission]
  const task = mission.tasks[currentTask]

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return
    setSelectedAnswer(answer)
  }

  const checkAnswer = () => {
    const isCorrect = selectedAnswer === task.correct
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1)
      setTotalStars(totalStars + 50)
    }
    setShowFeedback(true)

    setTimeout(() => {
      if (currentTask < mission.tasks.length - 1) {
        setCurrentTask(currentTask + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        setPhase("complete")
      }
    }, 2000)
  }

  const nextMission = () => {
    if (currentMission < missions.length - 1) {
      setCurrentMission(currentMission + 1)
      setCurrentTask(0)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setPhase("intro")
    } else {
      const timeTaken = Math.round((Date.now() - startTime) / 1000)
      const totalTasks = missions.reduce((sum, m) => sum + m.tasks.length, 0)
      const accuracy = correctAnswers / totalTasks

      onComplete(totalStars, {
        missionsCompleted: currentMission + 1,
        tasksCompleted: correctAnswers,
        totalStars,
        timeTaken,
        accuracy,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Mascots */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
          <img src="/images/lex.png" alt="Lex" className="w-12 h-12 object-contain mascot-no-bg" />
          <div>
            <p className="font-bold text-sm">Lex</p>
            <p className="text-xs text-muted-foreground">Aventurero</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl border border-accent/20">
          <img src="/images/lumo.png" alt="Lumo" className="w-12 h-12 object-contain mascot-no-bg" />
          <div>
            <p className="font-bold text-sm">Lumo</p>
            <p className="text-xs text-muted-foreground">Inventor</p>
          </div>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              {mission.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-amber-600">{totalStars}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Intro Phase */}
          {phase === "intro" && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🗺️</div>
              <div className="p-6 bg-primary/5 rounded-xl">
                <p className="text-lg leading-relaxed">{mission.story}</p>
              </div>
              <Button size="lg" onClick={() => setPhase("tasks")}>
                <ChevronRight className="w-5 h-5 mr-2" />
                Comenzar Misión
              </Button>
            </div>
          )}

          {/* Tasks Phase */}
          {phase === "tasks" && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  Desafío {currentTask + 1} de {mission.tasks.length}
                </span>
                <div className="flex gap-1">
                  {mission.tasks.map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-2 rounded-full ${
                        index < currentTask
                          ? "bg-green-500"
                          : index === currentTask
                            ? "bg-primary"
                            : "bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border-2 border-primary/20">
                <p className="text-xl font-semibold text-center mb-6">{task.question}</p>

                <div className="space-y-3">
                  {task.options.map((option, index) => {
                    const isSelected = selectedAnswer === option
                    const isCorrect = option === task.correct
                    const showResult = showFeedback

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showFeedback}
                        className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                          showResult
                            ? isCorrect
                              ? "bg-green-500 text-white"
                              : isSelected
                                ? "bg-red-500 text-white"
                                : "bg-muted"
                            : isSelected
                              ? "bg-primary text-primary-foreground scale-105"
                              : "bg-white hover:bg-muted hover:scale-105"
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              {!showFeedback && (
                <Button className="w-full" onClick={checkAnswer} disabled={!selectedAnswer}>
                  Verificar Respuesta
                </Button>
              )}
            </div>
          )}

          {/* Complete Phase */}
          {phase === "complete" && (
            <div className="text-center space-y-6">
              <Trophy className="w-24 h-24 text-amber-500 mx-auto" />
              <div>
                <h3 className="text-3xl font-bold mb-2">¡Misión Completada!</h3>
                <p className="text-lg text-muted-foreground">
                  Respondiste {correctAnswers} de {mission.tasks.length} preguntas correctamente
                </p>
              </div>

              <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
                <p className="text-sm text-amber-700 mb-2">Recompensa</p>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                  <span className="text-4xl font-bold text-amber-600">+{mission.reward}</span>
                </div>
              </div>

              <Button size="lg" onClick={nextMission}>
                {currentMission < missions.length - 1 ? "Siguiente Misión" : "Completar"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
