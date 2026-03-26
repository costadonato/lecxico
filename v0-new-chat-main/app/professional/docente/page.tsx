import { redirect } from "next/navigation"
import { getCurrentProfessional, getAssignedStudents } from "@/lib/professional-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, BookOpen, Eye, Clock, Target } from "lucide-react"
import Link from "next/link"

export default async function DocenteDashboard() {
  const professional = await getCurrentProfessional()

  if (!professional || professional.professionalType !== "docente") {
    redirect("/professional/login")
  }

  const students = await getAssignedStudents(professional.id, professional.role)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Panel Docente</h1>
                <p className="text-sm text-slate-600">{professional.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Seguimiento Pedagógico</h2>
          <p className="text-slate-600">
            Vista general del desempeño de tus {students.length} estudiante{students.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Herramientas Docente - Top section */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Eye className="w-4 h-4" />
                Ver Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Seguimiento por alumno</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Target className="w-4 h-4" />
                Desempeño
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Por juego y área</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4" />
                Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Uso de la plataforma</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-700">Bajo rendimiento detectado</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Estudiantes</CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{students.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Asignados a tu aula</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Activos esta semana</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-700">
                {students.filter((s) => s.enrolled_at).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Han jugado recientemente</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-amber-800">Alertas Pendientes</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-700">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-700">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Students list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Lista de Estudiantes
            </CardTitle>
            <CardDescription>Seguimiento pedagógico básico por alumno</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Sin estudiantes asignados</p>
                <p className="text-sm text-slate-500">Los alumnos asignados aparecerán aquí automáticamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <Link key={student.id} href={`/professional/docente/student/${student.id}`}>
                    <div className="p-4 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-700">{student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{student.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span>{student.age} años</span>
                              <span>•</span>
                              <span>{student.grade || "Sin grado"}</span>
                              <span>•</span>
                              {/* Traffic light indicator */}
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-xs">Progreso normal</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-white">
                          Ver Progreso
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restrictions notice */}
        <Card className="mt-8 border-slate-200 bg-slate-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Herramientas de Docente</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Como docente, tienes acceso a seguimiento pedagógico, progreso por área y alertas automáticas. Para
                  evaluaciones clínicas o planes de intervención, contacta al psicopedagogo asignado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
