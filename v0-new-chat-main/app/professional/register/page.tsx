"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Briefcase, Mail, Lock, User, Building2, GraduationCap, Brain } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function ProfessionalRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "psychopedagogist" | "teacher" | "",
    professionalType: "" as "docente" | "psicopedagogo" | "", // New field
    institution: "",
    acceptTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. VALIDACIÓN FINAL
    if (!formData.name.trim()) {
      alert("Por favor ingresa tu nombre completo")
      return
    }

    if (!formData.email.trim()) {
      alert("Por favor ingresa tu correo electrónico")
      return
    }

    if (!formData.role) {
      alert("Selecciona tu rol profesional")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (!formData.acceptTerms) {
      alert("Debes aceptar los términos para continuar")
      return
    }

    if (!formData.professionalType) {
      alert("Selecciona tu rol profesional específico")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      console.log("[v0] Starting professional registration:", {
        email: formData.email,
        role: formData.role,
        professionalType: formData.professionalType,
      })

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            professional_type: formData.professionalType,
            institution: formData.institution || null,
          },
        },
      })

      if (authError) {
        console.error("[v0] Auth error:", authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario")
      }

      console.log("[v0] User created successfully:", authData.user.id)

      // Initialize professional panel in background
      supabase
        .rpc("initialize_professional_panel", {
          p_user_id: authData.user.id,
          p_role: formData.role,
        })
        .then(({ error: initError }) => {
          if (initError) {
            console.warn("[v0] Panel initialization warning:", initError)
          }
        })

      console.log("[v0] Redirecting to dashboard...")
      if (formData.professionalType === "docente") {
        router.push("/professional/docente")
      } else if (formData.professionalType === "psicopedagogo") {
        router.push("/professional/psicopedagogo")
      } else {
        router.push("/professional/dashboard")
      }
    } catch (error: any) {
      console.error("[v0] Registration error:", error)

      // Mensajes de error amigables
      let errorMessage = "Error al crear la cuenta. "

      if (error.message?.includes("already registered")) {
        errorMessage += "Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?"
      } else if (error.message?.includes("invalid email")) {
        errorMessage += "El correo electrónico no es válido."
      } else if (error.message?.includes("weak password")) {
        errorMessage += "La contraseña es demasiado débil. Usa al menos 8 caracteres."
      } else {
        errorMessage += error.message || "Intenta nuevamente."
      }

      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Lecxico - Inicio">
            <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/professional/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">Cuenta Profesional</CardTitle>
                <CardDescription className="text-base">
                  Para psicopedagogos y docentes. Crea tu cuenta para acceder a herramientas de seguimiento educativo.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre y apellido
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ej: María González"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo electrónico profesional
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalType" className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Tu rol profesional
                  </Label>
                  <Select
                    value={formData.professionalType}
                    onValueChange={(value: "docente" | "psicopedagogo") => {
                      setFormData({
                        ...formData,
                        professionalType: value,
                        role: value === "docente" ? "teacher" : "psychopedagogist",
                      })
                    }}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docente" className="text-base py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-semibold">
                            <GraduationCap className="w-4 h-4" />
                            <span>Docente</span>
                          </div>
                          <p className="text-xs text-slate-600">Seguimiento pedagógico básico en contexto escolar</p>
                        </div>
                      </SelectItem>
                      <SelectItem value="psicopedagogo" className="text-base py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-semibold">
                            <Brain className="w-4 h-4" />
                            <span>Psicopedagogo/a</span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Evaluación, seguimiento profundo e intervención educativa
                          </p>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Institución (opcional)
                  </Label>
                  <Input
                    id="institution"
                    type="text"
                    placeholder="Nombre de la escuela o centro"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="text-base h-12"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      Declaro ser profesional de la educación (docente o psicopedagogo/a) y acepto usar esta herramienta
                      de manera responsable y ética.
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Lecxico es una herramienta de acompañamiento. No reemplaza la evaluación profesional ni emite
                      diagnósticos automáticos.
                    </p>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta profesional"}
                  <Briefcase className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/professional/login" className="text-primary hover:underline font-semibold">
                    Inicia sesión aquí
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {formData.professionalType === "docente" && (
            <Card className="mt-6 border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-900">Herramientas para Docentes</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ver progreso por alumno</li>
                      <li>• Ver desempeño por juego</li>
                      <li>• Ver asistencia / uso</li>
                      <li>• Ver alertas automáticas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.professionalType === "psicopedagogo" && (
            <Card className="mt-6 border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Brain className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-purple-900">Herramientas para Psicopedagogos</h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Registro de observaciones clínicas</li>
                      <li>• Historial longitudinal del alumno</li>
                      <li>• Configuración de dificultad</li>
                      <li>• Adaptación de juegos</li>
                      <li>• Generación de informes profesionales</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
