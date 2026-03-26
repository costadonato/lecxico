"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Star, Trophy, Zap, Heart, Sparkles, Play, Calculator, Globe, Flag } from "lucide-react"
import Link from "next/link"
import { LexSpeaker } from "@/components/lex-speaker"
import { DailyChallengeCard } from "@/components/daily-challenge-card"
import { useChildName } from "@/lib/hooks/use-child-name"

export default function ChildDashboard() {
  const { childName } = useChildName("Amigo")

  // Mock data - will be replaced with real data from Supabase
  const userData = {
    name: childName,
    level: 5,
    xp: 350,
    xpToNextLevel: 500,
    stars: 47,
    streak: 3,
    completedExercises: 23,
  }

  const activities = [
    // READING - SPECIAL MODULE
    {
      id: "gauchos-reading",
      title: "Historia: Los Gauchos",
      description: "Lee sobre los gauchos y responde preguntas",
      icon: BookOpen,
      color: "bg-gradient-to-br from-amber-600 to-orange-600",
      category: "Lectura",
      difficulty: "Media",
      xp: 100,
      locked: false,
    },
    // LECTURA / DISLEXIA
    {
      id: "carrera-lectura",
      title: "Carrera de Lectura",
      description: "Avanza en la pista leyendo palabras y frases",
      icon: Flag,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      category: "Lectura",
      difficulty: "Media",
      xp: 100,
      locked: false,
    },
    {
      id: "rompe-y-une",
      title: "Rompe y Une",
      description: "Arrastra las sílabas para formar palabras",
      icon: Sparkles,
      color: "bg-primary",
      category: "Lectura",
      difficulty: "Fácil",
      xp: 50,
      locked: false,
    },
    {
      id: "lluvia-palabras",
      title: "Lluvia de Palabras",
      description: "Atrapa las palabras correctas que caen",
      icon: Star,
      color: "bg-accent",
      category: "Lectura",
      difficulty: "Fácil",
      xp: 50,
      locked: false,
    },
    {
      id: "eco-palabras",
      title: "Eco de Palabras",
      description: "Escucha y escribe las palabras",
      icon: Zap,
      color: "bg-secondary",
      category: "Lectura",
      difficulty: "Medio",
      xp: 75,
      locked: false,
    },
    {
      id: "historias-huecos",
      title: "Historias con Huecos",
      description: "Completa las historias con las palabras correctas",
      icon: BookOpen,
      color: "bg-chart-4",
      category: "Lectura",
      difficulty: "Medio",
      xp: 100,
      locked: false,
    },
    {
      id: "memotono",
      title: "Memotono",
      description: "Recuerda y repite las secuencias de palabras",
      icon: Heart,
      color: "bg-chart-1",
      category: "Lectura",
      difficulty: "Medio",
      xp: 75,
      locked: false,
    },
    {
      id: "busca-letra",
      title: "Busca la Letra",
      description: "Encuentra todas las letras en la cuadrícula",
      icon: Trophy,
      color: "bg-chart-2",
      category: "Lectura",
      difficulty: "Fácil",
      xp: 50,
      locked: false,
    },
    {
      id: "caza-errores",
      title: "Caza de Errores",
      description: "Encuentra y corrige los errores ortográficos",
      icon: Sparkles,
      color: "bg-chart-3",
      category: "Lectura",
      difficulty: "Difícil",
      xp: 100,
      locked: false,
    },
    {
      id: "mision-lex-lumo",
      title: "Misión Lex & Lumo",
      description: "Completa misiones especiales con tus amigos",
      icon: Star,
      color: "bg-chart-5",
      category: "Lectura",
      difficulty: "Especial",
      xp: 150,
      locked: false,
    },
    // MATEMÁTICAS
    {
      id: "carrera-matematica",
      title: "Carrera de Matemática",
      description: "Resuelve operaciones y llega a la meta",
      icon: Flag,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      category: "Matemáticas",
      difficulty: "Media",
      xp: 100,
      locked: false,
    },
    {
      id: "cuenta-conmigo",
      title: "Cuenta Conmigo",
      description: "Cuenta objetos y aprende los números",
      icon: Sparkles,
      color: "bg-blue-500",
      category: "Matemáticas",
      difficulty: "Fácil",
      xp: 50,
      locked: false,
    },
    {
      id: "cual-es-mayor",
      title: "¿Cuál es Mayor?",
      description: "Compara cantidades y descubre cuál es mayor",
      icon: Trophy,
      color: "bg-blue-600",
      category: "Matemáticas",
      difficulty: "Fácil",
      xp: 50,
      locked: false,
    },
    {
      id: "cazador-numeros",
      title: "Cazador de Números",
      description: "Encuentra los números en orden del 1 al 10",
      icon: Zap,
      color: "bg-blue-700",
      category: "Matemáticas",
      difficulty: "Medio",
      xp: 75,
      locked: false,
    },
    {
      id: "super-sumador",
      title: "Súper Sumador",
      description: "Suma grupos de objetos y aprende matemáticas",
      icon: Star,
      color: "bg-blue-800",
      category: "Matemáticas",
      difficulty: "Medio",
      xp: 75,
      locked: false,
    },
    {
      id: "tienda-lex",
      title: "La Tienda de Lex",
      description: "Compra productos y aprende sobre el dinero",
      icon: Heart,
      color: "bg-blue-900",
      category: "Matemáticas",
      difficulty: "Difícil",
      xp: 100,
      locked: false,
    },
    {
      id: "phonics-match",
      title: "Phonics Match",
      description: "Match English sounds with words",
      icon: BookOpen,
      color: "bg-purple-500",
      category: "English",
      difficulty: "Easy",
      xp: 50,
      locked: false,
    },
    {
      id: "picture-words",
      title: "Picture Words",
      description: "Spell English words from pictures",
      icon: Star,
      color: "bg-purple-600",
      category: "English",
      difficulty: "Easy",
      xp: 50,
      locked: false,
    },
    {
      id: "rhyme-time",
      title: "Rhyme Time",
      description: "Find words that rhyme in English",
      icon: Heart,
      color: "bg-purple-700",
      category: "English",
      difficulty: "Easy",
      xp: 50,
      locked: false,
    },
    {
      id: "sight-words",
      title: "Sight Words",
      description: "Practice common English words",
      icon: Zap,
      color: "bg-purple-800",
      category: "English",
      difficulty: "Medium",
      xp: 75,
      locked: false,
    },
  ]

  const achievements = [
    { id: 1, title: "Primera Estrella", icon: Star, unlocked: true },
    { id: 2, title: "Racha de 3 días", icon: Zap, unlocked: true },
    { id: 3, title: "10 Ejercicios", icon: Trophy, unlocked: true },
    { id: 4, title: "Nivel 5", icon: Sparkles, unlocked: true },
    { id: 5, title: "50 Estrellas", icon: Star, unlocked: false },
    { id: 6, title: "Racha de 7 días", icon: Zap, unlocked: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Hola, {childName}!</h1>
                <p className="text-sm text-muted-foreground">Nivel {userData.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-secondary fill-secondary" />
                <span className="font-bold text-lg">{userData.stars}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">M</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative overflow-hidden">
        <div className="grid lg:grid-cols-3 gap-6 pb-32 lg:pb-0">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Tu Progreso</CardTitle>
                    <CardDescription className="text-base">Sigue así, lo estás haciendo genial!</CardDescription>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Nivel {userData.level}</span>
                    <span className="text-muted-foreground">
                      {userData.xp} / {userData.xpToNextLevel} XP
                    </span>
                  </div>
                  <Progress value={(userData.xp / userData.xpToNextLevel) * 100} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 bg-card rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-5 h-5 text-secondary fill-secondary" />
                      <span className="text-2xl font-bold">{userData.streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Días seguidos</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-secondary fill-secondary" />
                      <span className="text-2xl font-bold">{userData.stars}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Estrellas</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="w-5 h-5 text-accent" />
                      <span className="text-2xl font-bold">{userData.completedExercises}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Ejercicios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Actividades</h2>
                <Button variant="ghost" asChild>
                  <Link href="/games/child">Ver todas</Link>
                </Button>
              </div>

              {/* Lectura Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Lectura</h3>
                  <span className="text-sm text-muted-foreground">
                    {activities.filter((a) => a.category === "Lectura").length} juegos
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {activities
                    .filter((a) => a.category === "Lectura")
                    .map((activity) => (
                      <Card
                        key={activity.id}
                        className={`border-2 transition-all hover:border-primary hover:shadow-lg cursor-pointer hover:scale-[1.02]`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div
                              className={`w-14 h-14 ${activity.color} rounded-2xl flex items-center justify-center shadow-lg`}
                            >
                              <activity.icon className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <CardTitle className="text-xl pt-2">{activity.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {activity.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold px-3 py-1 bg-muted rounded-full">
                                {activity.difficulty}
                              </span>
                              <div className="flex items-center gap-1 text-secondary">
                                <Star className="w-4 h-4 fill-secondary" />
                                <span className="text-sm font-bold">+{activity.xp}</span>
                              </div>
                            </div>
                            <Button size="sm" className="rounded-full" asChild>
                              <Link href={`/games/${activity.id}`}>
                                <Play className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Matemáticas Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Matemáticas</h3>
                  <span className="text-sm text-muted-foreground">
                    {activities.filter((a) => a.category === "Matemáticas").length} juegos
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {activities
                    .filter((a) => a.category === "Matemáticas")
                    .map((activity) => (
                      <Card
                        key={activity.id}
                        className={`border-2 transition-all hover:border-blue-600 hover:shadow-lg cursor-pointer hover:scale-[1.02]`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div
                              className={`w-14 h-14 ${activity.color} rounded-2xl flex items-center justify-center shadow-lg`}
                            >
                              <activity.icon className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <CardTitle className="text-xl pt-2">{activity.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {activity.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold px-3 py-1 bg-muted rounded-full">
                                {activity.difficulty}
                              </span>
                              <div className="flex items-center gap-1 text-secondary">
                                <Star className="w-4 h-4 fill-secondary" />
                                <span className="text-sm font-bold">+{activity.xp}</span>
                              </div>
                            </div>
                            <Button size="sm" className="rounded-full" asChild>
                              <Link href={`/games/${activity.id}`}>
                                <Play className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* English Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">English Games</h3>
                  <span className="text-sm text-muted-foreground">
                    {activities.filter((a) => a.category === "English").length} games
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {activities
                    .filter((a) => a.category === "English")
                    .map((activity) => (
                      <Card
                        key={activity.id}
                        className="border-2 transition-all hover:border-purple-600 hover:shadow-lg cursor-pointer hover:scale-[1.02]"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`w-14 h-14 ${activity.color} rounded-2xl flex items-center justify-center`}>
                              <activity.icon className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <CardTitle className="text-xl pt-2">{activity.title}</CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {activity.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold px-3 py-1 bg-muted rounded-full">
                                {activity.difficulty}
                              </span>
                              <div className="flex items-center gap-1 text-secondary">
                                <Star className="w-4 h-4 fill-secondary" />
                                <span className="text-sm font-bold">+{activity.xp}</span>
                              </div>
                            </div>
                            <Button size="sm" className="rounded-full" asChild>
                              <Link href={`/games/${activity.id}`}>
                                <Play className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Challenge */}
            <DailyChallengeCard userLevel={userData.level} category="child" />

            {/* Achievements */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-secondary" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 ${
                        achievement.unlocked
                          ? "bg-secondary/20 border-2 border-secondary"
                          : "bg-muted border-2 border-border opacity-50"
                      }`}
                    >
                      <achievement.icon
                        className={`w-6 h-6 ${achievement.unlocked ? "text-secondary" : "text-muted-foreground"}`}
                      />
                      <span className="text-xs text-center font-semibold px-1">{achievement.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Positioned LexSpeaker absolutely within the container with responsive constraints */}
        <LexSpeaker
          context="dashboard_welcome"
          showTalkButton={true}
          className="absolute bottom-4 right-4 z-20 max-w-[calc(100%-2rem)] sm:max-w-md"
        />
      </div>
    </div>
  )
}
