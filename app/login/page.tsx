"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { AuthError } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Sparkles, Loader2, AlertCircle, BookOpen } from "lucide-react"
import { BotonGoogle } from "@/components/auth/boton-google"
import { rutaSegura } from "@/lib/auth/rutas"

const MENSAJES_QUERY: Record<string, string> = {
  enlace:
    "El enlace no es válido o ya venció. Si estabas confirmando tu email, probá iniciar sesión: puede que ya haya quedado confirmado.",
}

function mensajeErrorLogin(error: AuthError): string {
  if (error.code === "invalid_credentials") return "Email o contraseña incorrectos."
  if (error.code === "email_not_confirmed")
    return "Todavía no confirmaste tu email. Revisá tu casilla (y la carpeta de spam) y abrí el enlace que te enviamos."
  if (error.code === "over_request_rate_limit" || error.status === 429)
    return "Se hicieron demasiados intentos. Esperá unos minutos y probá de nuevo."
  return "No se pudo iniciar sesión. Probá de nuevo en unos minutos."
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  )
}

function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = rutaSegura(searchParams.get("next"))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(MENSAJES_QUERY[searchParams.get("error") ?? ""] ?? null)
  const [sinConfirmar, setSinConfirmar] = useState(false)
  const [reenvio, setReenvio] = useState<"idle" | "enviando" | "enviado" | "error">("idle")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSinConfirmar(false)
    setReenvio("idle")

    if (!email || !password) {
      setError("Completá el email y la contraseña.")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      console.error("Login error:", error)
      setError(mensajeErrorLogin(error))
      setSinConfirmar(error.code === "email_not_confirmed")
      setIsLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  const handleReenviar = async () => {
    setReenvio("enviando")
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setReenvio(error ? "error" : "enviado")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center">
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
          <Card className="border-2 shadow-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Bienvenido de vuelta</CardTitle>
              <CardDescription className="text-base">
                Iniciá sesión para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                      {sinConfirmar && (
                        <button
                          type="button"
                          onClick={handleReenviar}
                          disabled={reenvio === "enviando" || reenvio === "enviado"}
                          className="block mt-2 font-semibold underline disabled:no-underline disabled:opacity-70"
                        >
                          {reenvio === "enviado"
                            ? "Listo, te reenviamos el email."
                            : reenvio === "error"
                              ? "No se pudo reenviar. Probá de nuevo en unos minutos."
                              : reenvio === "enviando"
                                ? "Reenviando..."
                                : "Reenviar el email de confirmación"}
                        </button>
                      )}
                    </AlertDescription>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Link href="/recuperar" className="text-sm text-primary hover:underline font-medium">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-base h-12"
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

                <p className="text-center text-sm text-muted-foreground mt-4">
                  ¿No tenés una cuenta?{" "}
                  <Link href="/register" className="text-primary hover:underline font-semibold">
                    Registrate gratis
                  </Link>
                </p>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
              </div>
              <BotonGoogle texto="Continuar con Google (profesionales)" next={next} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
