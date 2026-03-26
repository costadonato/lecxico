"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Briefcase, Mail, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function ProfessionalLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      console.log("[v0] Attempting login with:", formData.email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("[v0] Login error:", error.message)

        if (error.message.includes("Email not confirmed")) {
          alert(
            "Tu correo electrónico aún no ha sido confirmado. Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación que te enviamos.",
          )
        } else if (error.message.includes("Invalid login credentials")) {
          alert(
            "Correo o contraseña incorrectos.\n\nPosibles soluciones:\n• Verifica que el correo y contraseña sean correctos\n• Si acabas de registrarte, espera unos segundos e intenta nuevamente\n• Si olvidaste tu contraseña, contáctanos para restablecerla",
          )
        } else {
          alert(error.message || "Error al iniciar sesión")
        }
        return
      }

      if (data.user) {
        console.log("[v0] User logged in:", data.user.id)

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role, professional_type")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error("[v0] Profile error:", profileError)
          alert("Error al verificar el perfil. Por favor contacta soporte.")
          await supabase.auth.signOut()
          return
        }

        if (
          profile &&
          (profile.role === "psychopedagogist" || profile.role === "teacher" || profile.role === "parent")
        ) {
          console.log("[v0] Professional access granted, redirecting...")

          if (profile.professional_type === "docente") {
            router.push("/professional/docente")
          } else if (profile.professional_type === "psicopedagogo") {
            router.push("/professional/psicopedagogo")
          } else {
            router.push("/professional/dashboard")
          }
        } else {
          alert("Esta cuenta no tiene permisos profesionales")
          await supabase.auth.signOut()
        }
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error.message)
      alert("Error inesperado al iniciar sesión. Por favor intenta nuevamente.")
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
            <Link href="/professional/register">Crear cuenta</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full">
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">Acceso Profesional</CardTitle>
                <CardDescription className="text-base">
                  Ingresa con tu cuenta de psicopedagogo o docente
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Correo electrónico
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
                  <Label htmlFor="password" className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="text-base h-12"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  <Briefcase className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/professional/register" className="text-primary hover:underline font-semibold">
                    Regístrate aquí
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
