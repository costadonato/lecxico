"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthShell } from "@/components/auth/auth-shell"
import { Campo } from "@/components/auth/campos"
import { errorPassword, PASSWORD_MIN } from "@/lib/auth/validaciones"

/**
 * Se llega desde el email de recuperación, vía /auth/callback?next=/restablecer,
 * que ya dejó una sesión iniciada.
 */
export default function RestablecerPage() {
  const router = useRouter()
  const [conSesion, setConSesion] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setConSesion(!!user))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const invalida = errorPassword(password, confirmacion)
    if (invalida) {
      setError(invalida)
      return
    }
    setError(null)
    setGuardando(true)
    const { error } = await createClient().auth.updateUser({ password })
    if (error) {
      console.error("updateUser:", error)
      setError(
        error.code === "same_password"
          ? "La nueva contraseña tiene que ser distinta de la anterior."
          : error.code === "weak_password"
            ? "La contraseña es demasiado débil. Probá con una más larga o combiná letras y números."
            : "No se pudo cambiar la contraseña. Pedí un enlace nuevo y probá otra vez.",
      )
      setGuardando(false)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <AuthShell titulo="Nueva contraseña">
      <Card className="w-full max-w-md border-2 shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Elegí una nueva contraseña</CardTitle>
          {conSesion && <CardDescription>Tiene que tener al menos {PASSWORD_MIN} caracteres.</CardDescription>}
        </CardHeader>
        <CardContent>
          {conSesion === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !conSesion ? (
            <div className="text-center space-y-4">
              <p>El enlace no es válido o ya venció.</p>
              <Button asChild>
                <Link href="/recuperar">Pedir un enlace nuevo</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Campo id="password" label="Nueva contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <Campo id="confirmacion" label="Confirmar contraseña" type="password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} autoComplete="new-password" error={error} />
              <Button type="submit" size="lg" className="w-full" disabled={guardando}>
                {guardando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Guardar contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
