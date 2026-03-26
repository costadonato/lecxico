"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Mail, Lock, Sparkles, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { handleAuthRedirect, analytics } from "@/lib/auth-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const uid = localStorage.getItem("current_user_uid")
    if (uid) {
      // User already logged in, redirect to appropriate dashboard
      handleAuthRedirect(uid, router)
    }
  }, [router])

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPassword = (password: string): boolean => {
    return password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos")
      return
    }

    if (!isValidEmail(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido")
      return
    }

    if (!isValidPassword(formData.password)) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      // For now, simulate authentication with localStorage

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const uid = localStorage.getItem("current_user_uid")

      if (!uid) {
        setError("Usuario no encontrado. Por favor regístrate primero.")
        setIsLoading(false)
        return
      }

      setSuccessMessage("¡Bienvenido de nuevo! Redirigiendo...")

      // Track login
      analytics.track("auth_login", { uid, timestamp: new Date().toISOString() })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect based on user profile
      await handleAuthRedirect(uid, router)
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("Error al iniciar sesión. Por favor verifica tus credenciales e intenta de nuevo.")
      analytics.track("auth_login_error", { error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Lecxico - Inicio">
            <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Bienvenido de vuelta</CardTitle>
              <CardDescription className="text-base">
                Inicia sesión para continuar tu aventura de aprendizaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

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
                    disabled={isLoading}
                    className="text-base h-12"
                    aria-describedby={error ? "email-error" : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    className="text-base h-12"
                    aria-describedby={error ? "password-error" : undefined}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <Sparkles className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-primary hover:underline font-semibold">
                    Regístrate gratis
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="border hover:border-primary transition-colors">
              <CardHeader className="p-4 text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm">Modo Infantil</CardTitle>
                <CardDescription className="text-xs">6-12 años</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border hover:border-accent transition-colors">
              <CardHeader className="p-4 text-center">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-sm">Modo Adolescente</CardTitle>
                <CardDescription className="text-xs">13-17 años</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
