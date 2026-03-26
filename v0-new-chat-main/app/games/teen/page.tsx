"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Target, TrendingUp, Zap, Brain, MessageSquare } from "lucide-react"
import Link from "next/link"
import { TeenStartCard } from "@/components/teen-start-card"
import { getCurrentUserUid, fetchUserProfile } from "@/lib/auth-utils"

export default function TeenGamesPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Usuario")
  const [userStats, setUserStats] = useState({
    exercisesCompleted: 0,
    currentStreak: 0,
    xp: 0,
  })

  useEffect(() => {
    const uid = getCurrentUserUid()
    if (uid) {
      fetchUserProfile(uid).then((profile) => {
        if (profile) {
          setUserName(profile.name.split(" ")[0])
          // In production, fetch real stats from database
        }
      })
    }
  }, [])

  const exercises = [
    {
      id: "rompe-y-une",
      title: "Segmentación Silábica",
      description: "Mejora tu conciencia fonológica separando palabras en sílabas",
      icon: Target,
      category: "Fonología",
      duration: "5-10 min",
    },
    {
      id: "lluvia-palabras",
      title: "Reconocimiento Rápido",
      description: "Aumenta tu velocidad de lectura identificando palabras clave",
      icon: Zap,
      category: "Velocidad",
      duration: "3-5 min",
    },
    {
      id: "eco-palabras",
      title: "Dictado Multisensorial",
      description: "Fortalece la ortografía con ejercicios auditivos y visuales",
      icon: Brain,
      category: "Ortografía",
      duration: "5-8 min",
    },
    {
      id: "historias-huecos",
      title: "Comprensión Contextual",
      description: "Desarrolla tu comprensión lectora completando textos",
      icon: MessageSquare,
      category: "Comprensión",
      duration: "8-12 min",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Lecxico</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/teen">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/progress">Progreso</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/support">Ayuda</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <TeenStartCard userName={userName} stats={userStats} />
        </div>

        {/* Exercises Section */}
        <div id="exercises" className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Ejercicios Disponibles</h2>
            <p className="text-lg text-muted-foreground">
              Ejercicios diseñados específicamente para mejorar tu fluidez lectora y comprensión
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="border hover:border-primary transition-all hover:shadow-md group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <exercise.icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">{exercise.category}</span>
                      <span className="text-xs text-muted-foreground">{exercise.duration}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{exercise.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{exercise.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href={`/games/${exercise.id}`}>Comenzar Ejercicio</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle>Consejos para Mejorar</CardTitle>
                  <CardDescription>Maximiza tu progreso con estos tips</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Practica al menos 15 minutos diarios para ver resultados consistentes
                </p>
              </div>
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Alterna entre diferentes tipos de ejercicios para un desarrollo equilibrado
                </p>
              </div>
              <div className="flex gap-3">
                <Brain className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Revisa tu progreso semanalmente para identificar áreas de mejora
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
