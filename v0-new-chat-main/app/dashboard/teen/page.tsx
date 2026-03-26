"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  TrendingUp,
  Target,
  Award,
  Clock,
  BarChart3,
  Flame,
  ChevronRight,
  BookMarked,
  Brain,
} from "lucide-react"
import Link from "next/link"

export default function TeenDashboard() {
  // Mock data - will be replaced with real data from Supabase
  const userData = {
    name: "Alex",
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    points: 1847,
    streak: 7,
    completedExercises: 89,
    weeklyGoal: 5,
    weeklyProgress: 3,
    readingSpeed: 145, // words per minute
    accuracy: 92, // percentage
  }

  const recentActivities = [
    {
      id: 1,
      title: "Comprensión Avanzada",
      type: "Lectura",
      score: 95,
      date: "Hoy",
      xp: 150,
    },
    {
      id: 2,
      title: "Análisis de Texto",
      type: "Ejercicio",
      score: 88,
      date: "Ayer",
      xp: 120,
    },
    {
      id: 3,
      title: "Vocabulario Técnico",
      type: "Práctica",
      score: 92,
      date: "Hace 2 días",
      xp: 100,
    },
  ]

  const exercises = [
    {
      id: "rompe-y-une",
      title: "Rompe y Une",
      description: "Segmentación silábica: arrastra y une sílabas para formar palabras",
      difficulty: "Intermedio",
      duration: "10 min",
      xp: 100,
      category: "Fluidez",
    },
    {
      id: "lluvia-palabras",
      title: "Lluvia de Palabras",
      description: "Mejora tu velocidad de reconocimiento visual atrapando palabras",
      difficulty: "Intermedio",
      duration: "8 min",
      xp: 120,
      category: "Fluidez",
    },
    {
      id: "eco-palabras",
      title: "Eco de Palabras",
      description: "Dictado interactivo multisensorial para mejorar ortografía",
      difficulty: "Intermedio",
      duration: "12 min",
      xp: 150,
      category: "Vocabulario",
    },
    {
      id: "historias-huecos",
      title: "Historias con Huecos",
      description: "Completa historias desarrollando comprensión contextual",
      difficulty: "Avanzado",
      duration: "15 min",
      xp: 200,
      category: "Comprensión",
    },
    {
      id: "cuenta-conmigo",
      title: "Cuenta Conmigo",
      description: "Fortalece el reconocimiento numérico contando objetos visuales",
      difficulty: "Básico",
      duration: "8 min",
      xp: 100,
      category: "Matemáticas",
    },
    {
      id: "cual-es-mayor",
      title: "¿Cuál es Mayor?",
      description: "Desarrolla comparación de cantidades y razonamiento lógico",
      difficulty: "Básico",
      duration: "10 min",
      xp: 100,
      category: "Matemáticas",
    },
    {
      id: "cazador-numeros",
      title: "Cazador de Números",
      description: "Mejora la secuenciación numérica y atención visual",
      difficulty: "Intermedio",
      duration: "12 min",
      xp: 150,
      category: "Matemáticas",
    },
    {
      id: "super-sumador",
      title: "Súper Sumador",
      description: "Practica operaciones básicas con apoyo visual multisensorial",
      difficulty: "Intermedio",
      duration: "15 min",
      xp: 150,
      category: "Matemáticas",
    },
    {
      id: "tienda-lex",
      title: "La Tienda de Lex",
      description: "Aplica matemáticas en contextos reales: compras y manejo de dinero",
      difficulty: "Avanzado",
      duration: "18 min",
      xp: 200,
      category: "Matemáticas",
    },
  ]

  const weeklyStats = [
    { day: "Lun", exercises: 2 },
    { day: "Mar", exercises: 1 },
    { day: "Mié", exercises: 0 },
    { day: "Jue", exercises: 3 },
    { day: "Vie", exercises: 1 },
    { day: "Sáb", exercises: 0 },
    { day: "Dom", exercises: 0 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Bienvenido, {userData.name}</h1>
                <p className="text-sm text-muted-foreground">Nivel {userData.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-lg">
                <Flame className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-sm">{userData.streak} días</span>
              </div>
              <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-lg">
                <Award className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm">{userData.points} pts</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">A</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Velocidad
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData.readingSpeed} ppm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+12 desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Precisión
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData.accuracy}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4" />
                    Ejercicios
                  </CardDescription>
                  <CardTitle className="text-3xl">{userData.completedExercises}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Total completados</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Progreso de Nivel</CardTitle>
                    <CardDescription>Nivel {userData.level}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{userData.xp}</p>
                    <p className="text-sm text-muted-foreground">de {userData.xpToNextLevel} XP</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={(userData.xp / userData.xpToNextLevel) * 100} className="h-2" />
              </CardContent>
            </Card>

            {/* Exercises Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Ejercicios Recomendados</CardTitle>
                <CardDescription>Basados en tu progreso y objetivos</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="comprehension">Comprensión</TabsTrigger>
                    <TabsTrigger value="fluency">Fluidez</TabsTrigger>
                    <TabsTrigger value="vocabulary">Vocabulario</TabsTrigger>
                    <TabsTrigger value="mathematics">Matemáticas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-3 mt-4">
                    {exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{exercise.title}</h3>
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {exercise.difficulty}
                            </span>
                            <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                              {exercise.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exercise.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" />+{exercise.xp} XP
                            </span>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/games/${exercise.id}`}>
                            Comenzar
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="comprehension" className="space-y-3 mt-4">
                    {exercises
                      .filter((ex) => ex.category === "Comprensión")
                      .map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{exercise.title}</h3>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {exercise.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {exercise.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />+{exercise.xp} XP
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/games/${exercise.id}`}>
                              Comenzar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </TabsContent>
                  <TabsContent value="fluency" className="space-y-3 mt-4">
                    {exercises
                      .filter((ex) => ex.category === "Fluidez")
                      .map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{exercise.title}</h3>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {exercise.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {exercise.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />+{exercise.xp} XP
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/games/${exercise.id}`}>
                              Comenzar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </TabsContent>
                  <TabsContent value="vocabulary" className="space-y-3 mt-4">
                    {exercises
                      .filter((ex) => ex.category === "Vocabulario")
                      .map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{exercise.title}</h3>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {exercise.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {exercise.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />+{exercise.xp} XP
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/games/${exercise.id}`}>
                              Comenzar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </TabsContent>
                  <TabsContent value="mathematics" className="space-y-3 mt-4">
                    {exercises
                      .filter((ex) => ex.category === "Matemáticas")
                      .map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{exercise.title}</h3>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {exercise.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {exercise.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />+{exercise.xp} XP
                              </span>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/games/${exercise.id}`}>
                              Comenzar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Meta Semanal
                </CardTitle>
                <CardDescription>Completa {userData.weeklyGoal} ejercicios esta semana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {userData.weeklyProgress} de {userData.weeklyGoal}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round((userData.weeklyProgress / userData.weeklyGoal) * 100)}%
                    </span>
                  </div>
                  <Progress value={(userData.weeklyProgress / userData.weeklyGoal) * 100} className="h-2" />
                </div>
                <div className="flex gap-1">
                  {weeklyStats.map((stat, index) => (
                    <div key={index} className="flex-1 space-y-1">
                      <div
                        className={`h-16 rounded-md ${
                          stat.exercises > 0 ? "bg-primary" : "bg-muted"
                        } flex items-end justify-center pb-1`}
                        style={{ height: `${Math.max(stat.exercises * 20, 16)}px` }}
                      >
                        {stat.exercises > 0 && (
                          <span className="text-xs text-primary-foreground">{stat.exercises}</span>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">{stat.day}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{activity.score}%</p>
                      <p className="text-xs text-muted-foreground">+{activity.xp} XP</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="border-accent bg-accent/5 relative overflow-hidden">
              {/* Subtle Lex in corner */}
              <div className="absolute -right-4 -top-4 w-20 h-20 opacity-30">
                <img src="/images/lex.png" alt="Lex" className="w-full h-full object-contain" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm font-semibold mb-1">Mejor momento del día</p>
                  <p className="text-xs text-muted-foreground">Tus mejores resultados son por la mañana (9-11 AM)</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm font-semibold mb-1">Área de mejora</p>
                  <p className="text-xs text-muted-foreground">Practica más ejercicios de vocabulario contextual</p>
                </div>
                {/* Lumo tech tip */}
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
                  <div className="w-12 h-12 flex-shrink-0">
                    <img src="/images/lumo.png" alt="Lumo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Tip de Lumo</p>
                    <p className="text-xs text-muted-foreground">
                      Intenta leer 15 minutos antes de dormir para mejorar tu retención
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
