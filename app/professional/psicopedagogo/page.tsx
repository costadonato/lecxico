import { redirect } from "next/navigation"
import { getCurrentProfessional, getAssignedStudents } from "@/lib/professional-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, FileText, TrendingUp, Settings, Download, Plus, Activity } from "lucide-react"
import Link from "next/link"

export default async function PsicopedagogoDashboard() {
  const professional = await getCurrentProfessional()

  if (!professional || professional.professionalType !== "psicopedagogo") {
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
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Panel Psicopedagógico</h1>
                <p className="text-sm text-slate-600">{professional.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button size="sm" asChild>
                <Link href="/professional/students/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Alumno
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Evaluación y Seguimiento Profundo</h2>
          <p className="text-slate-600">
            Gestión completa de {students.length} estudiante{students.length !== 1 ? "s" : ""} con herramientas clínicas
          </p>
        </div>

        {/* Herramientas Psicopedagógicas - Top section */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-800">
                <FileText className="w-4 h-4" />
                Notas Clínicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-purple-700">Observaciones privadas</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Activity className="w-4 h-4" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Evolución temporal</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Settings className="w-4 h-4" />
                Dificultad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Configurar juegos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <TrendingUp className="w-4 h-4" />
                Adaptación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Personalizar ejercicios</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-800">
                <Download className="w-4 h-4" />
                Informes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-700">Generar reportes</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Estudiantes</CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">{students.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Bajo seguimiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Planes Activos</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-700">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Intervenciones en curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Alertas</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Requieren evaluación</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-green-800">Progreso Positivo</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-700">{Math.round(students.length * 0.7)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-700">Evolución favorable</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Students list */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Estudiantes en Seguimiento
                </CardTitle>
                <CardDescription>
                  Gestión completa con acceso a observaciones clínicas y planes de intervención
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Sin estudiantes aún</h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Agrega tu primer estudiante para comenzar el seguimiento profesional
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/professional/students/add">
                        <Plus className="w-5 h-5 mr-2" />
                        Agregar Estudiante
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <Link key={student.id} href={`/professional/psicopedagogo/student/${student.id}`}>
                        <div className="p-4 border rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-semibold text-purple-700">{student.name.charAt(0)}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">{student.name}</h4>
                                <p className="text-sm text-slate-600">
                                  {student.age} años • {student.grade || "Sin grado"} • Plan activo
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white">
                              Ver Perfil Completo
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick actions */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-sm text-purple-900">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-white" size="sm" asChild>
                  <Link href="/professional/interventions">
                    <FileText className="w-4 h-4 mr-2" />
                    Planes de Intervención
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white" size="sm" asChild>
                  <Link href="/professional/reports">
                    <Download className="w-4 h-4 mr-2" />
                    Generar Informe
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white" size="sm" asChild>
                  <Link href="/professional/resources">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Juegos
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional info */}
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Brain className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Herramientas Completas</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Tienes acceso completo a evaluación, seguimiento profundo, configuración de dificultad, notas
                      clínicas y generación de informes profesionales.
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
