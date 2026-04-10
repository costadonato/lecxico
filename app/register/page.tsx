"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, User, Loader2, AlertCircle, Sparkles } from "lucide-react"

type UserType = "estudiante" | "profesional" | null

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  // Paso 3 — perfil del estudiante
  const [birthDate, setBirthDate] = useState("")
  const [hasDiagnosis, setHasDiagnosis] = useState(false)
  const [hasLiteracy, setHasLiteracy] = useState(true)
  const [academicLevel, setAcademicLevel] = useState<"inicial" | "primaria" | "secundaria" | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleRegister = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            birth_date: birthDate,
            has_diagnosis: hasDiagnosis,
            has_literacy: hasLiteracy,
            academic_level: academicLevel,
          },
        },
      })

      if (error) throw error

      router.push("/login")
    } catch (err: any) {
      console.error("Register error:", err.message)
      const msg: string = err.message ?? ""
      if (msg.toLowerCase().includes("user already registered")) {
        setError("Ya existe una cuenta con ese correo electrónico. ¿Ya tenés cuenta? Iniciá sesión.")
      } else if (msg.toLowerCase().includes("invalid email")) {
        setError("El correo electrónico ingresado no es válido.")
      } else {
        setError("Ocurrió un error al crear la cuenta. Por favor intentá de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Lecxico - Inicio">
            <Image src="/images/lecxico-logo.png" alt="Lecxico" width={120} height={40} className="h-8 w-auto" />
          </Link>
          <span className="text-lg font-semibold">¡Únete a Lecxico!</span>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-24 flex-1 flex items-start justify-center py-12">
        {step === 1 && (
          <div className="w-full max-w-2xl">
            <div className="border-2 border-primary rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-center mb-8">Seleccioná un tipo de usuario</h2>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <button
                  type="button"
                  onClick={() => setUserType("estudiante")}
                  className={`rounded-xl border-2 p-6 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    userType === "estudiante"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-white border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  <p className="text-xl font-bold mb-3">Estudiante</p>
                  <p className={`text-sm leading-relaxed ${userType === "estudiante" ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    Quiero probar/entrenar mis habilidades de lecto escritura.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("profesional")}
                  className={`rounded-xl border-2 p-6 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    userType === "profesional"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-white border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  <p className="text-xl font-bold mb-3">Profesional</p>
                  <p className={`text-sm leading-relaxed ${userType === "profesional" ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    Quiero realizar seguimiento a mis pacientes para estar al tanto de su entrenamiento y sus mejoras.
                  </p>
                </button>
              </div>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={userType === null}
                  onClick={() => setStep(2)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  SIGUIENTE →
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-2xl">
            <div className="border-2 border-primary rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-center mb-8">Completá tus datos</h2>

              <Card className="shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="uppercase font-bold text-xs tracking-wide">
                        Apellido/s
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="uppercase font-bold text-xs tracking-wide">
                        Nombre/s
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="uppercase font-bold text-xs tracking-wide">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="uppercase font-bold text-xs tracking-wide">
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (confirmPassword && e.target.value !== confirmPassword) {
                            setPasswordError("Las contraseñas no coinciden.")
                          } else {
                            setPasswordError(null)
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="uppercase font-bold text-xs tracking-wide">
                        Confirmar contraseña
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repetí tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (e.target.value !== password) {
                            setPasswordError("Las contraseñas no coinciden.")
                          } else {
                            setPasswordError(null)
                          }
                        }}
                      />
                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end mt-6">
                <Button
                  size="lg"
                  disabled={
                    !lastName.trim() ||
                    !firstName.trim() ||
                    !email.trim() ||
                    !password.trim() ||
                    !confirmPassword.trim() ||
                    password !== confirmPassword
                  }
                  onClick={() => setStep(3)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  SIGUIENTE →
                </Button>
              </div>
            </div>
          </div>
        )}
        {step === 3 && userType === "estudiante" && (
          <div className="w-full max-w-2xl">
            <div className="border-2 border-primary rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-center mb-8">Configurá tu perfil inicial</h2>

              <Card className="shadow-sm">
                <CardContent className="pt-6 space-y-6">
                  {/* Fecha de nacimiento */}
                  <div className="flex items-center gap-4">
                    <Label htmlFor="birthDate" className="uppercase font-bold text-xs tracking-wide w-64 shrink-0">
                      Fecha de nacimiento
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  {/* Diagnóstico previo */}
                  <div className="flex items-center gap-4">
                    <span className="uppercase font-bold text-xs tracking-wide w-64 shrink-0">
                      ¿Posee diagnóstico previo?
                    </span>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="diagnosis"
                          checked={hasDiagnosis === true}
                          onChange={() => setHasDiagnosis(true)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">SÍ</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="diagnosis"
                          checked={hasDiagnosis === false}
                          onChange={() => setHasDiagnosis(false)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">NO</span>
                      </label>
                    </div>
                  </div>

                  {/* Lectoescritura */}
                  <div className="flex items-center gap-4">
                    <span className="uppercase font-bold text-xs tracking-wide w-64 shrink-0">
                      ¿Ha aprendido a leer y escribir?
                    </span>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="literacy"
                          checked={hasLiteracy === true}
                          onChange={() => setHasLiteracy(true)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">SÍ</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="literacy"
                          checked={hasLiteracy === false}
                          onChange={() => setHasLiteracy(false)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">NO</span>
                      </label>
                    </div>
                  </div>

                  {/* Nivel académico */}
                  <div className="flex items-center gap-4">
                    <span className="uppercase font-bold text-xs tracking-wide w-64 shrink-0">
                      Nivel académico
                    </span>
                    <div className="flex gap-3">
                      {(["inicial", "primaria", "secundaria"] as const).map((level) => {
                        const labels: Record<string, string> = {
                          inicial: "🖍️ INICIAL",
                          primaria: "📖 PRIMARIA",
                          secundaria: "🖩 SECUNDARIA",
                        }
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setAcademicLevel(level)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              academicLevel === level
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-white border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            {labels[level]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="space-y-2">
                      <p className="text-sm text-destructive">{error}</p>
                      <button
                        type="button"
                        onClick={() => { setError(null); setStep(2) }}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        ← Volver a los datos
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end mt-6">
                <Button
                  size="lg"
                  disabled={!birthDate || academicLevel === null || isLoading}
                  onClick={handleRegister}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "CONTINUAR →"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
