import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, FileText, TrendingUp, Settings, Download, Plus, Activity, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function PsicopedagogoDashboardDemo() {
  // Mock data for demo
  const professional = {
    id: "demo-psicopedagogo",
    name: "Demo Psicopedagogo",
    professionalType: "psicopedagogo",
  }

  const students = [
    { id: "1", name: "María García", age: 8, grade: "3er Grado", enrolled_at: new Date().toISOString() },
    { id: "2", name: "Juan Pérez", age: 9, grade: "4to Grado", enrolled_at: new Date().toISOString() },
    { id: "3", name: "Sofía Rodríguez", age: 7, grade: "2do Grado", enrolled_at: new Date().toISOString() },
    { id: "4", name: "Lucas Fernández", age: 10, grade: "5to Grado", enrolled_at: new Date().toISOString() },
  ]

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
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">MODO DEMO</div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Alumno
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Evaluación y Seguimiento Profundo</h2>
          <p className="text-slate-600">Gestión completa de {students.length} estudiantes con herramientas clínicas</p>
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
              <CardTitle className="text-3xl font-bold text-purple-700">2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Intervenciones en curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Alertas</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Requieren evaluación</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-green-800">Progreso Positivo</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-700">3</CardTitle>
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
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 border rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-purple-700">{student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{student.name}</h4>
                            <p className="text-sm text-slate-600">
                              {student.age} años • {student.grade} • Plan activo
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-white">
                          Ver Perfil Completo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <Button variant="outline" className="w-full justify-start bg-white" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Planes de Intervención
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Generar Informe
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Juegos
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

        {/* Demo notice */}
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Modo Demostración</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Esta es una vista de demostración con datos de ejemplo. Para acceder al panel completo con tus
                  estudiantes reales y herramientas clínicas funcionales,{" "}
                  <Link href="/professional/register" className="underline font-semibold">
                    regístrate aquí
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
