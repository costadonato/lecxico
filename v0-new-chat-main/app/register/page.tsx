"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Sparkles, User, Mail, Lock, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { saveUserProfile, handleAuthRedirect, analytics } from "@/lib/auth-utils"
import { saveChildName } from "@/lib/name-storage"

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"child" | "teen" | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    parentEmail: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    // Validate age for selected user type
    const age = Number.parseInt(formData.age)
    if (userType === "child" && (age < 6 || age > 12)) {
      alert("La edad debe estar entre 6 y 12 años para el modo infantil")
      return
    }
    if (userType === "teen" && (age < 13 || age > 17)) {
      alert("La edad debe estar entre 13 y 17 años para el modo adolescente")
      return
    }

    try {
      // In production, this would call Firebase/Supabase auth
      // For now, create a mock user
      const uid = `user_${Date.now()}`

      const profile = {
        uid,
        name: formData.name,
        email: formData.email,
        age,
        ageRange: userType === "child" ? ("child" as const) : ("teen" as const),
        parentEmail: formData.parentEmail,
        profileComplete: true,
        tutorialSeen: false,
        createdAt: new Date().toISOString(),
      }

      // Save profile
      await saveUserProfile(profile)

      // Save child name for personalization
      saveChildName(formData.name)

      // Track registration
      analytics.track("auth_signup", { uid, ageRange: profile.ageRange })

      // Redirect based on age
      await handleAuthRedirect(uid, router)
    } catch (error) {
      console.error("[v0] Registration error:", error)
      alert("Error al crear la cuenta. Por favor intenta de nuevo.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Lecxico - Inicio">
            <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={40} className="h-8 w-auto" />
          </Link>
          {/* </CHANGE> */}
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {!userType ? (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-balance">Únete a Lecxico</h1>
                <p className="text-xl text-muted-foreground text-pretty">Elige tu modo de aprendizaje para comenzar</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Child Mode Card */}
                <Card
                  className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg"
                  onClick={() => setUserType("child")}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Modo Infantil</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Para niños de 6 a 12 años. Interfaz colorida y divertida con juegos interactivos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg">
                      Elegir Modo Infantil
                    </Button>
                  </CardContent>
                </Card>

                {/* Teen Mode Card */}
                <Card
                  className="border-2 hover:border-accent transition-all cursor-pointer hover:shadow-lg"
                  onClick={() => setUserType("teen")}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                      <BookOpen className="w-10 h-10 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">Modo Adolescente</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Para adolescentes de 13 a 17 años. Diseño moderno con ejercicios más avanzados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-transparent" size="lg" variant="outline">
                      Elegir Modo Adolescente
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-2">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        userType === "child" ? "bg-primary/10" : "bg-accent/10"
                      }`}
                    >
                      {userType === "child" ? (
                        <Sparkles className={`w-6 h-6 ${userType === "child" ? "text-primary" : "text-accent"}`} />
                      ) : (
                        <BookOpen className={`w-6 h-6 ${userType === "child" ? "text-primary" : "text-accent"}`} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {userType === "child" ? "Modo Infantil" : "Modo Adolescente"}
                      </CardTitle>
                      <CardDescription>{userType === "child" ? "6-12 años" : "13-17 años"}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setUserType(null)}>
                    Cambiar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="text-base h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Edad
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder={userType === "child" ? "6-12 años" : "13-17 años"}
                      min={userType === "child" ? 6 : 13}
                      max={userType === "child" ? 12 : 17}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      className="text-base h-12"
                    />
                  </div>

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

                  {userType === "child" && (
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail" className="text-base flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Correo de padre/madre/tutor
                      </Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        placeholder="padre@email.com"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        required
                        className="text-base h-12"
                      />
                      <p className="text-sm text-muted-foreground">
                        Necesitamos el correo de un adulto para supervisar tu progreso
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
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
                      minLength={6}
                      className="text-base h-12"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg">
                    Crear mi cuenta
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                      Inicia sesión aquí
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
