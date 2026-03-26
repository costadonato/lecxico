import { redirect } from "next/navigation"
import { getCurrentProfessional, getAssignedStudents, getRoleDisplayName } from "@/lib/professional-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, AlertCircle, Settings, Bell, Download, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function ProfessionalDashboard() {
  const professional = await getCurrentProfessional()

  if (!professional) {
    redirect("/professional/login")
  }

  if (professional.professionalType === "docente") {
    redirect("/professional/docente")
  }

  if (professional.professionalType === "psicopedagogo") {
    redirect("/professional/psicopedagogo")
  }

  // Fallback for legacy users without professionalType
  if (professional.role === "teacher") {
    redirect("/professional/docente")
  }

  if (professional.role === "psychopedagogist") {
    redirect("/professional/psicopedagogo")
  }

  // Default fallback
  redirect("/professional/login")

  const students = await getAssignedStudents(professional.id, professional.role)

  const isNewProfessional = students.length === 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Panel Profesional</h1>
                <p className="text-sm text-muted-foreground">{getRoleDisplayName(professional.role)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/professional/settings">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">
              Bienvenido/a, {professional.name}
              {isNewProfessional && <Sparkles className="w-6 h-6 text-primary inline ml-2" />}
            </h2>
          </div>

          {isNewProfessional ? (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-lg font-semibold text-primary mb-2">¡Tu cuenta profesional está lista! 🎉</p>
              <p className="text-muted-foreground mb-3">
                Tu panel está configurado y listo para usar. Comienza agregando tu primer estudiante o explora las
                herramientas disponibles.
              </p>
              <div className="flex gap-3">
                {professional.role === "psychopedagogist" && (
                  <Button asChild>
                    <Link href="/professional/students/add">
                      <Users className="w-4 h-4 mr-2" />
                      Agregar primer alumno
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/professional/resources">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explorar herramientas
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Tienes {students.length} estudiante{students.length !== 1 ? "s" : ""} asignado
              {students.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/professional/reports">
                  <Download className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/professional/alerts">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Ver Alertas
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/professional/resources">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Recursos Pedagógicos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Role-specific quick info */}
          {professional.role === "psychopedagogist" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm text-blue-900">Herramientas Psicopedagógicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-800 mb-3">
                  Acceso completo a planes de intervención y seguimiento detallado
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/professional/interventions">Ver Planes</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary-foreground">{professional.name.charAt(0)}</span>
              </div>
              <CardTitle className="text-xl">{professional.name}</CardTitle>
              <CardDescription>{getRoleDisplayName(professional.role)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline" asChild>
                <Link href="/professional/profile">Ver Perfil Completo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Overview stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4" />
                    Estudiantes
                  </CardDescription>
                  <CardTitle className="text-3xl">{students.length}</CardTitle>
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
                  <CardTitle className="text-3xl">{students.filter((s) => s.enrolled_at).length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    Alertas
                  </CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </CardContent>
              </Card>
            </div>

            {/* Students list */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Mis Estudiantes
                </CardTitle>
                <CardDescription>
                  {isNewProfessional
                    ? "Comienza agregando estudiantes para ver su progreso aquí"
                    : "Lista de estudiantes bajo tu seguimiento"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Sin alumnos aún</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {professional.role === "psychopedagogist"
                        ? "Agrega tu primer estudiante para comenzar el seguimiento educativo."
                        : "Los estudiantes asignados a ti aparecerán aquí automáticamente."}
                    </p>
                    {professional.role === "psychopedagogist" && (
                      <Button size="lg" asChild>
                        <Link href="/professional/students/add">
                          <Users className="w-5 h-5 mr-2" />
                          Agregar primer alumno
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {students.map((student) => (
                      <Link key={student.id} href={`/professional/student/${student.id}`} className="block">
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary">{student.name.charAt(0)}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{student.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {student.age} años • {student.grade || "Sin grado"} • Modo{" "}
                                  {student.mode === "child" ? "Infantil" : "Adolescente"}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver Perfil
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

          <div className="space-y-6"></div>
        </div>
      </div>
    </div>
  )
}
