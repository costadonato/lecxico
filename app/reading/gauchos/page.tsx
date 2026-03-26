"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen, Play, CheckCircle2, XCircle, Clock, Star, Trophy, ArrowRight, Lightbulb } from "lucide-react"
import { GAUCHOS_READING, type ReadingContent } from "@/lib/reading-content"
import Link from "next/link"

export default function GauchosReading() {
  const [mode, setMode] = useState<"child" | "teen" | null>(null)
  const [phase, setPhase] = useState<"intro" | "reading" | "questions" | "results">("intro")
  const [currentParagraph, setCurrentParagraph] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [readingTime, setReadingTime] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({})
  const [showVocabulary, setShowVocabulary] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const content: ReadingContent | null = mode ? GAUCHOS_READING[mode] : null

  useEffect(() => {
    if (phase !== "reading" || !contentRef.current) return

    const handleScroll = () => {
      const element = contentRef.current
      if (!element) return

      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight
      const progress = (scrollTop / scrollHeight) * 100

      setScrollProgress(progress)
    }

    const element = contentRef.current
    element.addEventListener("scroll", handleScroll)

    return () => element.removeEventListener("scroll", handleScroll)
  }, [phase])

  const handleStartReading = () => {
    setPhase("reading")
    setStartTime(Date.now())
  }

  const handleFinishReading = () => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setReadingTime(elapsed)
    }
    setPhase("questions")
  }

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    setShowFeedback((prev) => ({ ...prev, [questionId]: true }))
  }

  const calculateResults = () => {
    if (!content) return { correct: 0, total: 0, percentage: 0 }

    let correct = 0
    content.questions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (q.type === "true-false") {
        if (userAnswer === q.correctAnswer) correct++
      } else if (typeof q.correctAnswer === "number") {
        if (userAnswer === q.correctAnswer) correct++
      }
    })

    return {
      correct,
      total: content.questions.length,
      percentage: Math.round((correct / content.questions.length) * 100),
    }
  }

  const results = calculateResults()

  if (!mode || phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-4xl mb-2">Los Gauchos Argentinos</CardTitle>
            <CardDescription className="text-lg">Lectura y comprensión adaptada para dislexia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-secondary" />
                ¿Qué incluye esta actividad?
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Texto sobre la historia y cultura de los gauchos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Vocabulario con definiciones claras</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Preguntas de comprensión con feedback inmediato</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Métricas de progreso y tiempo de lectura</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-center">Elegí tu nivel:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto flex-col gap-3 p-6 border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
                  onClick={() => {
                    setMode("child")
                    setPhase("reading")
                    setStartTime(Date.now())
                  }}
                >
                  <Star className="w-8 h-8 text-secondary" />
                  <div className="text-center">
                    <div className="font-bold text-lg">Modo Niño</div>
                    <div className="text-sm text-muted-foreground">Texto más corto y preguntas simples</div>
                    <div className="text-xs text-muted-foreground mt-1">8-10 minutos</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto flex-col gap-3 p-6 border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
                  onClick={() => {
                    setMode("teen")
                    setPhase("reading")
                    setStartTime(Date.now())
                  }}
                >
                  <Trophy className="w-8 h-8 text-accent" />
                  <div className="text-center">
                    <div className="font-bold text-lg">Modo Adolescente</div>
                    <div className="text-sm text-muted-foreground">Texto completo con más análisis</div>
                    <div className="text-xs text-muted-foreground mt-1">12-15 minutos</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{content.title}</h1>
                <p className="text-sm text-muted-foreground">{content.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {phase === "reading" && (
                <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">{Math.floor((Date.now() - (startTime || 0)) / 1000)}s</span>
                </div>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/child">Volver</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Reading Phase */}
        {phase === "reading" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Lectura</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVocabulary(!showVocabulary)}
                    className="gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Vocabulario
                  </Button>
                </div>
                <Progress value={scrollProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">Deslizá hacia abajo para leer todo el texto</p>
              </CardHeader>
              <CardContent>
                <div
                  ref={contentRef}
                  className="prose prose-lg max-w-none space-y-6 max-h-[60vh] overflow-y-auto pr-4 leading-relaxed"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "1.125rem",
                    lineHeight: "1.8",
                  }}
                >
                  {content.text.map((paragraph, index) => (
                    <p key={index} className="text-foreground" style={{ marginBottom: "1.5rem" }}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {showVocabulary && content.vocabulary && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-xl space-y-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-secondary" />
                      Vocabulario
                    </h3>
                    <div className="grid gap-3">
                      {content.vocabulary.map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <span className="font-semibold text-primary">{item.word}:</span>
                          <span className="text-muted-foreground">{item.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button size="lg" onClick={handleFinishReading} disabled={scrollProgress < 90} className="gap-2">
                    {scrollProgress < 90 ? (
                      <>
                        <Clock className="w-5 h-5" />
                        Seguí leyendo...
                      </>
                    ) : (
                      <>
                        Finalizar Lectura
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Questions Phase */}
        {phase === "questions" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Preguntas de Comprensión</CardTitle>
                <CardDescription>Respondé las preguntas sobre lo que leíste</CardDescription>
                <Progress value={(Object.keys(answers).length / content.questions.length) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {Object.keys(answers).length} de {content.questions.length} respondidas
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {content.questions.map((question, index) => (
                  <div key={question.id} className="space-y-4 p-6 bg-muted/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-lg font-semibold leading-relaxed">{question.question}</p>

                        {question.type === "true-false" ? (
                          <RadioGroup
                            value={answers[question.id]?.toString()}
                            onValueChange={(value) => handleAnswer(question.id, value)}
                          >
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2 flex-1">
                                <RadioGroupItem value="true" id={`${question.id}-true`} />
                                <Label
                                  htmlFor={`${question.id}-true`}
                                  className="cursor-pointer text-base p-4 border-2 rounded-lg flex-1 hover:border-primary"
                                >
                                  Verdadero
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 flex-1">
                                <RadioGroupItem value="false" id={`${question.id}-false`} />
                                <Label
                                  htmlFor={`${question.id}-false`}
                                  className="cursor-pointer text-base p-4 border-2 rounded-lg flex-1 hover:border-primary"
                                >
                                  Falso
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        ) : (
                          <RadioGroup
                            value={answers[question.id]?.toString()}
                            onValueChange={(value) => handleAnswer(question.id, Number.parseInt(value))}
                          >
                            <div className="space-y-3">
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                  <RadioGroupItem value={optIndex.toString()} id={`${question.id}-${optIndex}`} />
                                  <Label
                                    htmlFor={`${question.id}-${optIndex}`}
                                    className="cursor-pointer text-base p-4 border-2 rounded-lg flex-1 hover:border-primary leading-relaxed"
                                  >
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        )}

                        {/* Feedback */}
                        {showFeedback[question.id] && answers[question.id] !== undefined && (
                          <div
                            className={`p-4 rounded-lg border-2 ${
                              (
                                question.type === "true-false"
                                  ? answers[question.id] === question.correctAnswer
                                  : answers[question.id] === question.correctAnswer
                              )
                                ? "bg-green-50 border-green-500 dark:bg-green-950"
                                : "bg-amber-50 border-amber-500 dark:bg-amber-950"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {(
                                question.type === "true-false"
                                  ? answers[question.id] === question.correctAnswer
                                  : answers[question.id] === question.correctAnswer
                              ) ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                              )}
                              <div>
                                <p className="font-semibold mb-1">
                                  {(
                                    question.type === "true-false"
                                      ? answers[question.id] === question.correctAnswer
                                      : answers[question.id] === question.correctAnswer
                                  )
                                    ? "¡Correcto!"
                                    : "No es correcto"}
                                </p>
                                <p className="text-sm leading-relaxed">{question.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <Button
                    size="lg"
                    onClick={() => setPhase("results")}
                    disabled={Object.keys(answers).length < content.questions.length}
                    className="gap-2"
                  >
                    Ver Resultados
                    <Trophy className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl">¡Actividad Completada!</CardTitle>
                <CardDescription className="text-lg">Excelente trabajo en la lectura sobre los gauchos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-card rounded-xl border-2">
                    <div className="text-4xl font-bold text-primary mb-2">{results.percentage}%</div>
                    <p className="text-sm text-muted-foreground">Comprensión</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-xl border-2">
                    <div className="text-4xl font-bold text-secondary mb-2">
                      {results.correct}/{results.total}
                    </div>
                    <p className="text-sm text-muted-foreground">Respuestas correctas</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-xl border-2">
                    <div className="text-4xl font-bold text-accent mb-2">
                      {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, "0")}
                    </div>
                    <p className="text-sm text-muted-foreground">Tiempo de lectura</p>
                  </div>
                </div>

                <div className="p-6 bg-muted/50 rounded-xl text-center">
                  <p className="text-lg font-semibold mb-2">
                    {results.percentage >= 80
                      ? "¡Excelente comprensión lectora!"
                      : results.percentage >= 60
                        ? "¡Muy buen trabajo!"
                        : "Seguí practicando, cada lectura te hace mejor!"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {results.percentage >= 80
                      ? "Demostraste una comprensión profunda del texto sobre los gauchos. Tu capacidad de análisis es sobresaliente."
                      : results.percentage >= 60
                        ? "Comprendiste los conceptos principales del texto. Con más práctica mejorarás aún más."
                        : "Cada lectura es una oportunidad de aprender. Te recomendamos volver a leer el texto con calma."}
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/dashboard/child">Volver al Inicio</Link>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      setPhase("intro")
                      setMode(null)
                      setAnswers({})
                      setShowFeedback({})
                      setScrollProgress(0)
                      setReadingTime(0)
                      setStartTime(null)
                    }}
                    className="gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Intentar de Nuevo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
