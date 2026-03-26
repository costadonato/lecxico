"use client"

import type React from "react"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Flame,
  Star,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  MessageCircle,
} from "lucide-react"
import { mockStudents, mockKPIs, mockAlerts } from "@/lib/mock-data/dashboard-data"
import type { Student } from "@/lib/types/dashboard"

interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  trend?: number
  icon?: React.ReactNode
  progress?: number
}

function KPICard({ title, value, subtitle, trend, icon, progress }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <TrendingDown className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {progress !== undefined && <Progress value={progress} className="mt-3" aria-label={`${title}: ${progress}%`} />}
      </CardContent>
    </Card>
  )
}

interface StudentSelectorProps {
  students: Student[]
  selectedStudent: Student
  onSelectStudent: (student: Student) => void
}

function StudentSelector({ students, selectedStudent, onSelectStudent }: StudentSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="Seleccionar estudiante">
      {students.map((student) => {
        const isSelected = selectedStudent.id === student.id
        return (
          <button
            key={student.id}
            onClick={() => onSelectStudent(student)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
            }`}
            role="radio"
            aria-checked={isSelected}
            aria-label={`${student.name}, ${student.grade}`}
          >
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg"
              aria-hidden="true"
            >
              {student.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{student.name}</p>
              <p className="text-sm text-gray-500">{student.grade}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function ParentOverviewPage() {
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0])

  const kpis = useMemo(() => mockKPIs[selectedStudent.id], [selectedStudent.id])
  const alerts = useMemo(() => mockAlerts.filter((a) => a.studentId === selectedStudent.id), [selectedStudent.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <nav className="container mx-auto px-4 py-4" aria-label="Navegación principal">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="Ir a inicio de Lecxico">
              <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={30} priority className="h-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" aria-label="Contactar al psicopedagogo">
                <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Contactar Psicopedagogo</span>
                <span className="sm:hidden">Contactar</span>
              </Button>
              <Button variant="ghost" size="sm" aria-label="Cerrar sesión">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8" aria-labelledby="page-title">
          <h1 id="page-title" className="text-3xl font-bold text-gray-900 mb-2">
            Seguimiento de Progreso
          </h1>
          <p className="text-gray-600 mb-6">Mirá cómo está avanzando tu hijo/a en su camino de aprendizaje</p>
          <StudentSelector
            students={mockStudents}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
          />
        </section>

        {alerts.length > 0 && (
          <section className="mb-8" aria-labelledby="alerts-title">
            <h2 id="alerts-title" className="sr-only">
              Alertas y notificaciones
            </h2>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.level === "critical" ? "destructive" : "default"}
                className="mb-4"
                role="alert"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-4">
                    {alert.message.replace(
                      "Recomendamos activar más apoyo visual y practicar ejercicios de decodificación.",
                      "Te sugerimos activar el modo de apoyo visual en la configuración y dedicar 10-15 minutos diarios a ejercicios de decodificación. ¡Juntos vamos a mejorar!",
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      Ver más detalles
                    </Button>
                    <Button size="sm">Agendar sesión de apoyo</Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </section>
        )}

        <section className="mb-8" aria-labelledby="kpis-title">
          <h2 id="kpis-title" className="text-xl font-semibold text-gray-900 mb-4">
            Indicadores Clave de Progreso
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <KPICard title="Velocidad Lectora" value={kpis.wpm} subtitle="palabras por minuto" trend={kpis.wpmTrend} />
            <KPICard
              title="Precisión"
              value={`${kpis.accuracy}%`}
              subtitle="respuestas correctas"
              trend={kpis.accuracyTrend}
              progress={kpis.accuracy}
            />
            <KPICard
              title="Racha Actual"
              value={kpis.streak}
              subtitle="días consecutivos"
              icon={<Flame className="w-10 h-10 text-orange-500" aria-hidden="true" />}
            />
            <KPICard
              title="Ejercicios Completados"
              value={kpis.totalExercises}
              subtitle="esta semana"
              icon={<CheckCircle2 className="w-10 h-10 text-green-500" aria-hidden="true" />}
            />
          </div>
        </section>

        <section className="mb-8" aria-labelledby="summary-title">
          <h2 id="summary-title" className="sr-only">
            Resumen semanal y recomendaciones
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity */}
            <article className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de la Semana</CardTitle>
                  <CardDescription>Actividad de {selectedStudent.name} en los últimos 7 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                        <div>
                          <p className="font-medium">Tiempo de práctica</p>
                          <p className="text-sm text-gray-600">{kpis.totalTime} minutos en total</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{Math.round(kpis.totalTime / 7)} min/día</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                        <div>
                          <p className="font-medium">Tasa de finalización</p>
                          <p className="text-sm text-gray-600">Ejercicios completados del total asignado</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{kpis.completionRate}%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                        <div>
                          <p className="font-medium">Nivel actual</p>
                          <p className="text-sm text-gray-600">Progreso en la plataforma</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Nivel {kpis.level}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>

            <aside aria-labelledby="recommendations-title">
              <Card>
                <CardHeader>
                  <CardTitle id="recommendations-title">Recomendaciones</CardTitle>
                  <CardDescription>Acciones que podés hacer hoy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">💪 Práctica diaria</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Dedicá 10-15 minutos diarios al juego "Rompe y Une". Es ideal para mejorar la separación de
                        sílabas y hacer la lectura más fluida.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-2">👁️ Apoyo visual</p>
                      <p className="text-xs text-green-700 leading-relaxed">
                        Activá el modo "Más apoyo visual" en la configuración. Esto hace que las letras sean más fáciles
                        de distinguir y reduce el cansancio visual.
                      </p>
                    </div>

                    <Button className="w-full bg-transparent" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                      Agendar sesión con el equipo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>

        <section className="flex flex-wrap gap-4" aria-label="Acciones disponibles">
          <Button size="lg" aria-label="Descargar informe semanal en PDF">
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Descargar Informe Semanal
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/parent/student/${selectedStudent.id}`}>Ver Historial Completo</Link>
          </Button>
        </section>
      </main>
    </div>
  )
}
