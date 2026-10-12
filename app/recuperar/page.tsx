"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthShell } from "@/components/auth/auth-shell"
import { Campo } from "@/components/auth/campos"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { emailValido } from "@/lib/auth/validaciones"

export default function RecuperarPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailValido(email)) {
      setError("Ingresá un email válido.")
      return
    }
    setError(null)
    setEnviando(true)
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
    })
    // No se informa si la cuenta existe: el mensaje es siempre el mismo.
    // Solo se avisa si se superó el límite de envíos, que no revela nada.
    if (error) console.error("resetPasswordForEmail:", error)
    setEnviando(false)
    if (error && (error.code === "over_email_send_rate_limit" || error.status === 429)) {
      setError("Se hicieron demasiados intentos. Esperá unos minutos y probá de nuevo.")
      return
    }
    setEnviado(true)
  }

  return (
    <AuthShell
      titulo="Recuperar contraseña"
      personaje="lumo"
      mensaje={enviado ? "¡Listo! Fijate en tu email." : "Tranqui, te ayudo a recuperar tu contraseña."}
    >
      <Card className="w-full max-w-md shadow-elevada">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">¿Olvidaste tu contraseña?</CardTitle>
          {!enviado && (
            <CardDescription className="text-base">
              Ingresá el email de la cuenta y te enviamos un enlace para crear una nueva. En las cuentas de niños, es el
              email del tutor.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {enviado ? (
            <div className="text-center space-y-4">
              <div className="mx-auto grid size-24 place-items-center rounded-[1.75rem] bg-pantalla shadow-brillo-celeste">
                <LumoCara estado="feliz" tamano={80} />
              </div>
              <p className="text-lg">Si el email está registrado, te va a llegar un enlace para restablecer la contraseña.</p>
              <p className="text-sm text-muted-foreground">Revisá también la carpeta de spam.</p>
              <Button asChild variant="outline">
                <Link href="/login">Volver a iniciar sesión</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Campo
                id="email"
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                autoComplete="email"
              />
              <Button type="submit" size="lg" className="w-full" disabled={enviando}>
                {enviando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Enviar enlace"}
              </Button>
              <p className="text-center text-base">
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Volver a iniciar sesión
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
