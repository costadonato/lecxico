"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, TrendingUp, AlertCircle, Download, FileText, BarChart3, Brain, Calendar } from "lucide-react"
import Link from "next/link"

export default function ProfessionalDemo() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState("month")

  // Demo data
  const demoStudents = [
    {
      id: "1",
      name: "Juan Pérez",
      age: 8,
      grade: "3° grado",
      mode: "child",
      lastActive: "Hace 2 horas",
      alerts: 1,
      progress: {
        reading: { fluency: 65, comprehension: 58, precision: 72 },
        writing: { orthography: 45, phonological: 62 },
        math: { numbering: 78, operations: 55, problemSolving: 48 },
      },
      recentActivity: [
        { date: "2025-12-18", game: "Busca la Letra", accuracy: 75, time: "8 min" },
        { date: "2025-12-17", game: "Cuenta Conmigo", accuracy: 82, time: "12 min" },
        { date: "2025-12-16", game: "Eco de Palabras", accuracy: 68, time: "10 min" },
      ],
    },
    {
      id: "2",
      name: "María González",
      age: 10,
      grade: "5° grado",
      mode: "teen",
      lastActive: "Hace 1 día",
      alerts: 0,
      progress: {
        reading: { fluency: 82, comprehension: 78, precision: 85 },
        writing: { orthography: 72, phonological: 80 },
        math: { numbering: 88, operations: 75, problemSolving: 72 },
      },
      recentActivity: [
        { date: "2025-12-17", game: "Historias con Huecos", accuracy: 88, time: "15 min" },
        { date: "2025-12-16", game: "Super Sumador", accuracy: 78, time: "10 min" },
      ],
    },
    {
      id: "3",
      name: "Lucas Rodríguez",
      age: 7,
      grade: "2° grado",
      mode: "child",
      lastActive: "Hace 3 horas",
      alerts: 2,
      progress: {
        reading: { fluency: 42, comprehension: 38, precision: 45 },
        writing: { orthography: 35, phonological: 48 },
        math: { numbering: 62, operations: 48, problemSolving: 35 },
      },
      recentActivity: [
        { date: "2025-12-18", game: "Rompe y Une", accuracy: 52, time: "15 min" },
        { date: "2025-12-17", game: "¿Cuál es Mayor?", accuracy: 65, time: "8 min" },
      ],
    },
  ]

  const currentStudent = demoStudents.find((s) => s.id === selectedStudent) || demoStudents[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Panel Profesional</h1>
                <p className="text-sm text-muted-foreground">Modo Demo - Psicopedagoga</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button asChild>
                <Link href="/register">Crear Cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome and Notice */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Bienvenido/a al Panel Profesional</h2>
          <p className="text-muted-foreground mb-4">
            Esta es una versión de demostración con datos de ejemplo. Tienes {demoStudents.length} estudiantes
            asignados.
          </p>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <p className="text-sm text-blue-900">
                <strong>Nota ética:</strong> Esta herramienta acompaña tu práctica profesional, no reemplaza la
                evaluación especializada. Los indicadores aquí presentados son observacionales y requieren tu
                interpretación experta.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tools Section - AT THE TOP */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <AlertCircle className="w-4 h-4 mr-2" />
                Ver Alertas ({demoStudents.reduce((acc, s) => acc + s.alerts, 0)})
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BookOpen className="w-4 h-4 mr-2" />
                Recursos Pedagógicos
              </Button>
            </CardContent>
          </Card>

          {/* Psychopedagogical Tools */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <Brain className="w-5 h-5" />
                Herramientas Psicopedagógicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-blue-800 mb-3">
                Acceso completo a planes de intervención y seguimiento detallado
              </p>
              <Button size="sm" variant="outline" className="w-full bg-white">
                Ver Planes de Intervención
              </Button>
              <Button size="sm" variant="outline" className="w-full bg-white">
                Registro de Observaciones
              </Button>
            </CardContent>
          </Card>

          {/* Profile Summary */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary-foreground">D</span>
              </div>
              <CardTitle className="text-lg">Dra. Ana Martínez</CardTitle>
              <CardDescription>Psicopedagoga</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Ver Perfil Completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Users className="w-4 h-4" />
                Estudiantes
              </CardDescription>
              <CardTitle className="text-3xl">{demoStudents.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Asignados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-4 h-4" />
                Activos
              </CardDescription>
              <CardTitle className="text-3xl">
                {demoStudents.filter((s) => s.lastActive.includes("horas")).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Alertas
              </CardDescription>
              <CardTitle className="text-3xl">{demoStudents.reduce((acc, s) => acc + s.alerts, 0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <BarChart3 className="w-4 h-4" />
                Progreso Promedio
              </CardDescription>
              <CardTitle className="text-3xl">68%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">General</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Students List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Mis Estudiantes
              </CardTitle>
              <CardDescription>Selecciona para ver detalles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    currentStudent.id === student.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{student.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {student.age} años • {student.grade}
                        </p>
                      </div>
                    </div>
                    {student.alerts > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {student.alerts}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{student.lastActive}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Student Detail View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {currentStudent.name}
                    {currentStudent.alerts > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {currentStudent.alerts} alerta{currentStudent.alerts !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currentStudent.age} años • {currentStudent.grade} • Última actividad: {currentStudent.lastActive}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Filtro
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="progress">Progreso por Área</TabsTrigger>
                  <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
                  <TabsTrigger value="notes">Observaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="progress" className="space-y-6 mt-6">
                  {/* Reading Skills */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Lectura
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Fluidez lectora</span>
                          <span className="font-semibold">{currentStudent.progress.reading.fluency}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${currentStudent.progress.reading.fluency}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Comprensión lectora</span>
                          <span className="font-semibold">{currentStudent.progress.reading.comprehension}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${currentStudent.progress.reading.comprehension}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Precisión</span>
                          <span className="font-semibold">{currentStudent.progress.reading.precision}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${currentStudent.progress.reading.precision}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Writing Skills */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Escritura
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Ortografía funcional</span>
                          <span className="font-semibold">{currentStudent.progress.writing.orthography}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${currentStudent.progress.writing.orthography}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Conciencia fonológica</span>
                          <span className="font-semibold">{currentStudent.progress.writing.phonological}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${currentStudent.progress.writing.phonological}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Math Skills */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      Matemática
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Numeración</span>
                          <span className="font-semibold">{currentStudent.progress.math.numbering}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${currentStudent.progress.math.numbering}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Operaciones</span>
                          <span className="font-semibold">{currentStudent.progress.math.operations}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${currentStudent.progress.math.operations}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Resolución de problemas</span>
                          <span className="font-semibold">{currentStudent.progress.math.problemSolving}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${currentStudent.progress.math.problemSolving}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <div className="space-y-3">
                    {currentStudent.recentActivity.map((activity, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm">{activity.game}</h5>
                          <Badge variant={activity.accuracy >= 70 ? "default" : "secondary"}>
                            {activity.accuracy}% precisión
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{activity.date}</span>
                          <span>Duración: {activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground italic">
                        Espacio para tus observaciones profesionales. En la versión completa, podrás registrar notas
                        cualitativas, seguimiento de intervenciones y evolución temporal.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      Agregar Observación
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="py-8 text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Crea tu cuenta profesional</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Accede a todas las funcionalidades: planes de intervención, reportes exportables, seguimiento histórico,
              alertas automáticas y más herramientas diseñadas para tu práctica profesional.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Crear Cuenta Gratuita
                <TrendingUp className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
