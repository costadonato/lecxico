import { redirect } from "next/navigation"
import {
  getCurrentProfessional,
  getStudentProgress,
  getStudentSessions,
  formatDate,
  formatRelativeTime,
} from "@/lib/professional-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TrendingUp, Clock, Target, Award, BookOpen, Calculator, Globe, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  getProgressByArea,
  getActivityHistory,
  getObservations,
  detectPedagogicalAlerts,
  getEducationalProfile,
} from "@/lib/professional-tools"

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const professional = await getCurrentProfessional()

  if (!professional) {
    redirect("/professional/login")
  }

  const supabase = await createClient()

  // Get student data
  const { data: student } = await supabase.from("students").select("*").eq("id", params.id).single()

  if (!student) {
    redirect("/professional/dashboard")
  }

  const progress = await getStudentProgress(params.id)
  const sessions = await getStudentSessions(params.id)

  // Calculate area-specific stats
  const readingSessions = sessions.filter((s) => s.game_id?.includes("lectura") || s.game_id?.includes("letra"))
  const mathSessions = sessions.filter((s) => s.game_id?.includes("matematica") || s.game_id?.includes("numero"))
  const englishSessions = sessions.filter((s) => s.game_id?.includes("english") || s.game_id?.includes("phonics"))

  const calculateAreaAccuracy = (areaSessions: typeof sessions) => {
    if (areaSessions.length === 0) return 0
    const totalCorrect = areaSessions.reduce((sum, s) => sum + (s.correct_attempts || 0), 0)
    const totalAttempts = areaSessions.reduce((sum, s) => sum + (s.total_attempts || 1), 0)
    return Math.round((totalCorrect / totalAttempts) * 100)
  }

  const progressByArea = await getProgressByArea(params.id)
  const activityHistory = await getActivityHistory(params.id)
  const observations = await getObservations(params.id)
  const alerts = await detectPedagogicalAlerts(params.id)
  const educationalProfile = await getEducationalProfile(params.id)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/professional/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Perfil del Estudiante</h1>
              <p className="text-sm text-muted-foreground">{student.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{student.name.charAt(0)}</span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {student.age} años • {student.grade || "Sin grado asignado"} • Modo{" "}
                    {student.mode === "child" ? "Infantil" : "Adolescente"}
                  </CardDescription>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      Inscrito: {formatDate(student.enrolled_at)}
                    </span>
                    {progress && (
                      <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
                        Nivel {progress.current_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Última actividad</p>
                <p className="text-lg font-semibold">
                  {progress ? formatRelativeTime(progress.last_active_at) : "Sin actividad"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {alerts.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="w-5 h-5" />
                Alertas Pedagógicas ({alerts.length})
              </CardTitle>
              <CardDescription className="text-orange-800">
                Patrones detectados que requieren atención profesional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-orange-900">{alert.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          alert.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : alert.severity === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {alert.severity === "high" ? "Alta" : alert.severity === "medium" ? "Media" : "Baja"}
                      </span>
                    </div>
                    <p className="text-sm text-orange-800">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Target className="w-4 h-4" />
                Juegos completados
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.games_completed || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-4 h-4" />
                Precisión general
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.overall_accuracy || 0}%</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4" />
                Tiempo total
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.total_time_minutes || 0}m</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Award className="w-4 h-4" />
                Racha actual
              </CardDescription>
              <CardTitle className="text-3xl">{progress?.current_streak || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Progreso por Área
                </CardTitle>
                <CardDescription>Desempeño en cada área educativa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {progressByArea.map((area) => (
                  <div key={area.area} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {area.area === "reading" && <BookOpen className="w-4 h-4 text-primary" />}
                        {area.area === "math" && <Calculator className="w-4 h-4 text-blue-600" />}
                        {area.area === "writing" && <Globe className="w-4 h-4 text-purple-600" />}
                        {area.areaName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{area.accuracy}%</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            area.trend === "improving"
                              ? "bg-green-100 text-green-700"
                              : area.trend === "declining"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {area.trend === "improving" ? "↑" : area.trend === "declining" ? "↓" : "→"}
                        </span>
                      </div>
                    </div>
                    <Progress value={area.accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {area.sessionsCount} sesiones • Nivel{" "}
                      {area.level === "high" ? "Alto" : area.level === "medium" ? "Medio" : "Bajo"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observaciones Profesionales</CardTitle>
                <CardDescription>Registro manual de seguimiento (solo visible para profesionales)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {observations.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                      {observations.map((obs) => (
                        <div key={obs.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">{obs.createdBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(obs.createdAt).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                          <p className="text-sm">{obs.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form action={`/api/observations`} method="POST">
                    <input type="hidden" name="studentId" value={params.id} />
                    <textarea
                      name="content"
                      className="w-full min-h-[120px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Escribe tus observaciones profesionales aquí..."
                      required
                    />
                    <select
                      name="type"
                      className="w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="progress">Avance</option>
                      <option value="difficulty">Dificultad</option>
                      <option value="strategy">Estrategia usada</option>
                    </select>
                    <Button className="w-full mt-3" type="submit">
                      Guardar Observación
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground italic">
                    Las observaciones son confidenciales y no se comparten con el estudiante ni sus padres sin
                    autorización.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Historial de Actividades
                </CardTitle>
                <CardDescription>Registro cronológico completo</CardDescription>
              </CardHeader>
              <CardContent>
                {activityHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sin actividad reciente</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activityHistory.slice(0, 20).map((activity) => (
                      <div key={activity.id} className="p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{activity.gameName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString("es-AR")} •{" "}
                              {activity.area === "reading"
                                ? "Lectura"
                                : activity.area === "math"
                                  ? "Matemática"
                                  : "Escritura"}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              activity.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {activity.completed ? "Completado" : "Incompleto"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Precisión</p>
                            <p className="text-sm font-semibold">{activity.accuracy}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tiempo</p>
                            <p className="text-sm font-semibold">{activity.timeSpent}s</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Intentos</p>
                            <p className="text-sm font-semibold">{activity.attempts}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
