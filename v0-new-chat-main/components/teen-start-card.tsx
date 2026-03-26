"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, Target, Zap } from "lucide-react"
import Link from "next/link"

interface TeenStartCardProps {
  userName?: string
  stats?: {
    exercisesCompleted: number
    currentStreak: number
    xp: number
  }
}

export function TeenStartCard({ userName = "Usuario", stats }: TeenStartCardProps) {
  const defaultStats = {
    exercisesCompleted: 0,
    currentStreak: 0,
    xp: 0,
  }

  const userStats = stats || defaultStats

  return (
    <Card className="border-2 hover:border-primary transition-all">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl">Bienvenido, {userName}</CardTitle>
            <CardDescription className="text-base mt-2">Continúa tu progreso donde lo dejaste</CardDescription>
          </div>
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold">{userStats.exercisesCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Ejercicios</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-2xl font-bold">{userStats.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Días seguidos</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-2xl font-bold">{userStats.xp}</span>
            </div>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button size="lg" className="w-full text-lg" asChild>
          <Link href="/games/teen#exercises">
            Comenzar Ejercicio
            <BookOpen className="ml-2 w-5 h-5" />
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild>
            <Link href="/progress">Ver Progreso</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/teen">Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
