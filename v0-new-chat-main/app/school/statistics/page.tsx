"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  BarChart3,
  BookOpen,
  Award,
  Flame,
  Eye,
} from "lucide-react"
import { mockStudents, mockKPIs, mockAlerts } from "@/lib/mock-data/dashboard-data"

export default function SchoolStatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week")
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate class-wide statistics
  const classStats = useMemo(() => {
    const allKPIs = Object.values(mockKPIs)
    const totalStudents = mockStudents.length

    const avgWPM = allKPIs.reduce((sum, kpi) => sum + kpi.wpm, 0) / totalStudents
    const avgAccuracy = allKPIs.reduce((sum, kpi) => sum + kpi.accuracy, 0) / totalStudents
    const avgCompletionRate = allKPIs.reduce((sum, kpi) => sum + kpi.completionRate, 0) / totalStudents
    const totalExercises = allKPIs.reduce((sum, kpi) => sum + kpi.totalExercises, 0)
    const activeStudents = allKPIs.filter((kpi) => kpi.streak > 0).length
    const atRiskStudents = mockAlerts.length

    return {
      avgWPM: Math.round(avgWPM),
      avgAccuracy: Math.round(avgAccuracy),
      avgCompletionRate: Math.round(avgCompletionRate),
      totalExercises,
      activeStudents,
      atRiskStudents,
      totalStudents,
    }
  }, [])

  // Combine student data with their KPIs
  const studentsWithKPIs = useMemo(() => {
    return mockStudents.map((student) => ({
      ...student,
      kpis: mockKPIs[student.id],
      alerts: mockAlerts.filter((alert) => alert.studentId === student.id),
    }))
  }, [])

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentsWithKPIs
    return studentsWithKPIs.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [studentsWithKPIs, searchQuery])

  // Sort students by different metrics
  const topPerformers = useMemo(() => {
    return [...studentsWithKPIs].sort((a, b) => b.kpis.accuracy - a.kpis.accuracy).slice(0, 5)
  }, [studentsWithKPIs])

  const needsAttention = useMemo(() => {
    return studentsWithKPIs.filter(
      (student) => student.alerts.length > 0 || student.kpis.accuracy < 70 || student.kpis.completionRate < 60,
    )
  }, [studentsWithKPIs])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={30} priority className="h-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Reporte
              </Button>
              <Button variant="ghost" size="sm">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Escolar - Estadísticas</h1>
          <p className="text-gray-600">Vista general del progreso de todos los estudiantes</p>
        </div>

        {/* Class Overview KPIs */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen General</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4" />
                  Total Estudiantes
                </CardDescription>
                <CardTitle className="text-3xl">{classStats.totalStudents}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">{classStats.activeStudents} activos</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Target className="w-4 h-4" />
                  Precisión Promedio
                </CardDescription>
                <CardTitle className="text-3xl">{classStats.avgAccuracy}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={classStats.avgAccuracy} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <BookOpen className="w-4 h-4" />
                  Velocidad Promedio
                </CardDescription>
                <CardTitle className="text-3xl">{classStats.avgWPM}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">palabras por minuto</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  Requieren Atención
                </CardDescription>
                <CardTitle className="text-3xl">{classStats.atRiskStudents}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">estudiantes con alertas</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Additional Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Ejercicios Completados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{classStats.totalExercises}</p>
                <p className="text-sm text-muted-foreground mt-2">Esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-accent" />
                  Tasa de Finalización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-accent">{classStats.avgCompletionRate}%</p>
                <Progress value={classStats.avgCompletionRate} className="h-2 mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Estudiantes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-orange-500">{classStats.activeStudents}</p>
                <p className="text-sm text-muted-foreground mt-2">de {classStats.totalStudents} totales</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="top">Destacados</TabsTrigger>
            <TabsTrigger value="attention">Requieren Atención</TabsTrigger>
          </TabsList>

          {/* All Students */}
          <TabsContent value="all" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar estudiante por nombre o grado..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Estudiantes ({filteredStudents.length})</CardTitle>
                <CardDescription>Desempeño individual de cada estudiante</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            {student.alerts.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Alerta
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student.grade} • {student.age} años • Modo{" "}
                            {student.mode === "child" ? "Infantil" : "Adolescente"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-6 mr-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{student.kpis.accuracy}%</p>
                          <p className="text-xs text-muted-foreground">Precisión</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-accent">{student.kpis.wpm}</p>
                          <p className="text-xs text-muted-foreground">WPM</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary">{student.kpis.streak}</p>
                          <p className="text-xs text-muted-foreground">Racha</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500">{student.kpis.totalExercises}</p>
                          <p className="text-xs text-muted-foreground">Ejercicios</p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/parent/student/${student.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalle
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Performers */}
          <TabsContent value="top" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Estudiantes Destacados
                </CardTitle>
                <CardDescription>Los 5 estudiantes con mejor desempeño</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 border-2 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.grade}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{student.kpis.accuracy}%</p>
                          <p className="text-xs text-muted-foreground">Precisión</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-accent">{student.kpis.wpm}</p>
                          <p className="text-xs text-muted-foreground">WPM</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500">{student.kpis.streak}</p>
                          <p className="text-xs text-muted-foreground">Racha</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Needing Attention */}
          <TabsContent value="attention" className="space-y-6">
            {needsAttention.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    Estudiantes que Requieren Atención
                  </CardTitle>
                  <CardDescription>
                    Estudiantes con alertas o bajo rendimiento que necesitan apoyo adicional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {needsAttention.map((student) => (
                      <div key={student.id} className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">{student.grade}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">
                            {student.alerts.length} {student.alerts.length === 1 ? "Alerta" : "Alertas"}
                          </Badge>
                        </div>

                        {/* Alerts */}
                        {student.alerts.map((alert) => (
                          <Alert key={alert.id} variant="destructive" className="mb-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{alert.title}</AlertTitle>
                            <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                          </Alert>
                        ))}

                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-xl font-bold text-primary">{student.kpis.accuracy}%</p>
                            <p className="text-xs text-muted-foreground">Precisión</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-xl font-bold text-accent">{student.kpis.completionRate}%</p>
                            <p className="text-xs text-muted-foreground">Finalización</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-xl font-bold text-secondary">{student.kpis.streak}</p>
                            <p className="text-xs text-muted-foreground">Racha</p>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <p className="text-xl font-bold text-orange-500">{student.kpis.hintsUsageRate}%</p>
                            <p className="text-xs text-muted-foreground">Uso de Pistas</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" asChild>
                            <Link href={`/parent/student/${student.id}`}>Ver Perfil Completo</Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            Crear Plan de Intervención
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">¡Excelente!</h3>
                  <p className="text-muted-foreground">
                    No hay estudiantes que requieran atención especial en este momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <section className="flex flex-wrap gap-4">
          <Button size="lg">
            <Download className="w-4 h-4 mr-2" />
            Descargar Reporte Completo
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/parent/dashboard">Ver Panel Individual</Link>
          </Button>
          <Button size="lg" variant="outline">
            Configurar Alertas
          </Button>
        </section>
      </main>
    </div>
  )
}
