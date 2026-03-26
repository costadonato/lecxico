"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, TrendingUp, Target, BarChart3, Clock, ArrowLeft, FileText, Brain } from "lucide-react"
import Link from "next/link"

export default function ProgressPage() {
  // Mock data - will be replaced with real data from Supabase
  const userData = {
    name: "María",
    joinDate: "Enero 2025",
    totalExercises: 89,
    totalTimeMinutes: 450,
    averageScore: 87,
  }

  const weeklyData = [
    { day: "Lun", exercises: 2, time: 30, avgScore: 85 },
    { day: "Mar", exercises: 1, time: 20, avgScore: 88 },
    { day: "Mié", exercises: 3, time: 45, avgScore: 82 },
    { day: "Jue", exercises: 2, time: 35, avgScore: 90 },
    { day: "Vie", exercises: 1, time: 15, avgScore: 87 },
    { day: "Sáb", exercises: 0, time: 0, avgScore: 0 },
    { day: "Dom", exercises: 1, time: 25, avgScore: 85 },
  ]

  const categoryProgress = [
    { category: "Fluidez lectora", percentage: 62, avgScore: 88, trend: "up" },
    { category: "Comprensión lectora", percentage: 60, avgScore: 85, trend: "stable" },
    { category: "Vocabulario", percentage: 43, avgScore: 82, trend: "up" },
    { category: "Conciencia fonológica", percentage: 77, avgScore: 91, trend: "up" },
  ]

  const recentActivity = [
    { date: "2025-12-18", game: "Busca la Letra", accuracy: 88, time: "8 min" },
    { date: "2025-12-17", game: "Eco de Palabras", accuracy: 82, time: "10 min" },
    { date: "2025-12-16", game: "Historias con Huecos", accuracy: 75, time: "12 min" },
    { date: "2025-12-15", game: "Rompe y Une", accuracy: 90, time: "7 min" },
  ]

  const maxExercises = Math.max(...weeklyData.map((d) => d.exercises), 1)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/child">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Seguimiento de Progreso</h1>
                <p className="text-sm text-muted-foreground">Análisis detallado de aprendizaje</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
          <p className="text-muted-foreground mb-4">Miembro desde {userData.joinDate}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <BookOpen className="w-4 h-4" />
                Ejercicios
              </CardDescription>
              <CardTitle className="text-3xl">{userData.totalExercises}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4" />
                Tiempo total
              </CardDescription>
              <CardTitle className="text-3xl">{Math.round(userData.totalTimeMinutes / 60)}h</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{userData.totalTimeMinutes} minutos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Target className="w-4 h-4" />
                Precisión promedio
              </CardDescription>
              <CardTitle className="text-3xl">{userData.averageScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">En todas las áreas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-4 h-4" />
                Tendencia
              </CardDescription>
              <CardTitle className="text-3xl">↑</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Mejorando</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Actividad Semanal
                </CardTitle>
                <CardDescription>Seguimiento de los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="exercises" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="exercises">Ejercicios Realizados</TabsTrigger>
                    <TabsTrigger value="time">Tiempo de Práctica</TabsTrigger>
                  </TabsList>

                  <TabsContent value="exercises" className="mt-6">
                    <div className="flex items-end justify-between gap-2 h-48">
                      {weeklyData.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center justify-end flex-1">
                            <div
                              className="w-full rounded-t-lg transition-all bg-primary"
                              style={{
                                height: `${(day.exercises / maxExercises) * 100}%`,
                                minHeight: day.exercises > 0 ? "30px" : "8px",
                                opacity: day.exercises > 0 ? 1 : 0.2,
                              }}
                            >
                              {day.exercises > 0 && (
                                <div className="text-center pt-2">
                                  <span className="text-xs font-bold text-primary-foreground">{day.exercises}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">{day.day}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="time" className="mt-6">
                    <div className="flex items-end justify-between gap-2 h-48">
                      {weeklyData.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center justify-end flex-1">
                            <div
                              className="w-full rounded-t-lg transition-all bg-blue-600"
                              style={{
                                height: `${(day.time / 45) * 100}%`,
                                minHeight: day.time > 0 ? "30px" : "8px",
                                opacity: day.time > 0 ? 1 : 0.2,
                              }}
                            >
                              {day.time > 0 && (
                                <div className="text-center pt-2">
                                  <span className="text-xs font-bold text-white">{day.time}m</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">{day.day}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Progreso por Área Educativa
                </CardTitle>
                <CardDescription>Habilidades evaluadas en las actividades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryProgress.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{category.category}</h4>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Precisión: {category.avgScore}%</span>
                        <span className="text-lg font-bold text-primary">{category.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${category.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimas sesiones de práctica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{activity.game}</h4>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Precisión</p>
                          <p className="text-sm font-bold">{activity.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duración</p>
                          <p className="text-sm font-bold">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary-foreground">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-xl">{userData.name}</CardTitle>
                <CardDescription>Estudiante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-muted-foreground">Total ejercicios</span>
                  <span className="font-bold">{userData.totalExercises}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-muted-foreground">Miembro desde</span>
                  <span className="font-bold text-sm">{userData.joinDate}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Brain className="w-5 h-5" />
                  Insights Educativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Fortalezas identificadas:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Conciencia fonológica en desarrollo positivo</li>
                    <li>• Buena precisión en reconocimiento</li>
                  </ul>
                </div>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Áreas de enfoque:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Continuar trabajo en vocabulario</li>
                    <li>• Reforzar comprensión lectora</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Nota:</strong> Los datos aquí presentados son observacionales y complementan la evaluación
                  profesional. Para interpretación especializada, consulta con tu psicopedagogo/a.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
