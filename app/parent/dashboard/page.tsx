"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Target,
  Award,
  AlertCircle,
  Download,
  Mail,
  Bell,
} from "lucide-react"
import Link from "next/link"

export default function ParentDashboard() {
  // Mock data - will be replaced with real data from Supabase
  const students = [
    {
      id: 1,
      name: "María González",
      age: 9,
      level: 5,
      mode: "child",
      lastActive: "Hoy, 10:30 AM",
      weeklyProgress: 85,
      totalExercises: 89,
      averageScore: 87,
      streak: 7,
      alerts: [],
    },
    {
      id: 2,
      name: "Carlos González",
      age: 14,
      level: 8,
      mode: "teen",
      lastActive: "Ayer, 8:45 PM",
      weeklyProgress: 60,
      totalExercises: 124,
      averageScore: 82,
      streak: 3,
      alerts: ["Baja actividad esta semana"],
    },
  ]

  const selectedStudent = students[0]

  const weeklyActivity = [
    { day: "Lun", completed: true, exercises: 2, time: 30 },
    { day: "Mar", completed: true, exercises: 1, time: 20 },
    { day: "Mié", completed: false, exercises: 0, time: 0 },
    { day: "Jue", completed: true, exercises: 3, time: 45 },
    { day: "Vie", completed: true, exercises: 1, time: 15 },
    { day: "Sáb", completed: false, exercises: 0, time: 0 },
    { day: "Dom", completed: true, exercises: 1, time: 25 },
  ]

  const recentExercises = [
    {
      id: 1,
      title: "Comprensión de Lectura",
      category: "Comprensión",
      score: 95,
      date: "Hoy, 10:30 AM",
      duration: "15 min",
    },
    {
      id: 2,
      title: "Palabras Mágicas",
      category: "Formación",
      score: 88,
      date: "Ayer, 4:20 PM",
      duration: "10 min",
    },
    {
      id: 3,
      title: "Encuentra las Letras",
      category: "Reconocimiento",
      score: 92,
      date: "Hace 2 días, 3:15 PM",
      duration: "8 min",
    },
  ]

  const categoryProgress = [
    { category: "Comprensión", progress: 62, trend: "up" },
    { category: "Fluidez", progress: 60, trend: "stable" },
    { category: "Vocabulario", progress: 43, trend: "up" },
    { category: "Reconocimiento", progress: 77, trend: "up" },
  ]

  const recommendations = [
    {
      id: 1,
      title: "Aumentar práctica de vocabulario",
      description: "María muestra buen progreso pero podría beneficiarse de más ejercicios de vocabulario contextual.",
      priority: "medium",
    },
    {
      id: 2,
      title: "Mantener la racha diaria",
      description: "Excelente racha de 7 días. Continuar con la práctica diaria para mejores resultados.",
      priority: "low",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Panel de Padres</h1>
                <p className="text-sm text-muted-foreground">Monitoreo y seguimiento de estudiantes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar Reporte
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        student.id === selectedStudent.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {student.age} años • Nivel {student.level}
                          </p>
                        </div>
                        {student.alerts.length > 0 && <AlertCircle className="w-5 h-5 text-orange-500" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso semanal</span>
                          <span className="font-semibold">{student.weeklyProgress}%</span>
                        </div>
                        <Progress value={student.weeklyProgress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overview Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <BookOpen className="w-4 h-4" />
                    Ejercicios
                  </CardDescription>
                  <CardTitle className="text-3xl">{selectedStudent.totalExercises}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Target className="w-4 h-4" />
                    Promedio
                  </CardDescription>
                  <CardTitle className="text-3xl">{selectedStudent.averageScore}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Precisión</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Award className="w-4 h-4" />
                    Racha
                  </CardDescription>
                  <CardTitle className="text-3xl">{selectedStudent.streak}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Días seguidos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="w-4 h-4" />
                    Nivel
                  </CardDescription>
                  <CardTitle className="text-3xl">{selectedStudent.level}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Actual</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Actividad Semanal
                </CardTitle>
                <CardDescription>Seguimiento de práctica diaria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex-1 text-center space-y-2">
                      <div
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                          day.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="text-2xl font-bold">{day.exercises}</span>
                        <span className="text-xs">{day.time}m</span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">{day.day}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Exercises */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  Ejercicios Recientes
                </CardTitle>
                <CardDescription>Últimas actividades completadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentExercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{exercise.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{exercise.category}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{exercise.date}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{exercise.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{exercise.score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Progreso por Categoría
                </CardTitle>
                <CardDescription>Desempeño en diferentes áreas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryProgress.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{category.category}</span>
                        {category.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                      </div>
                      <span className="text-sm font-bold">{category.progress}%</span>
                    </div>
                    <Progress value={category.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary-foreground">{selectedStudent.name.charAt(0)}</span>
                </div>
                <CardTitle className="text-xl">{selectedStudent.name}</CardTitle>
                <CardDescription>
                  {selectedStudent.age} años • Modo {selectedStudent.mode === "child" ? "Infantil" : "Adolescente"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <span className="text-sm text-muted-foreground">Última actividad</span>
                  <span className="text-xs font-semibold">{selectedStudent.lastActive}</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/student/${selectedStudent.id}/progress`}>Ver Perfil Completo</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Alerts */}
            {selectedStudent.alerts.length > 0 && (
              <Card className="border-orange-500 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-5 h-5" />
                    Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedStudent.alerts.map((alert, index) => (
                    <p key={index} className="text-sm text-orange-700">
                      {alert}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3 rounded-lg border ${
                      rec.priority === "high"
                        ? "border-red-200 bg-red-50"
                        : rec.priority === "medium"
                          ? "border-orange-200 bg-orange-50"
                          : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/parent/reports">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Reporte Mensual
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/parent/settings">
                    <Mail className="w-4 h-4 mr-2" />
                    Configurar Notificaciones
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/parent/goals">
                    <Target className="w-4 h-4 mr-2" />
                    Establecer Objetivos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
