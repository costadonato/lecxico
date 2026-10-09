"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthShell } from "@/components/auth/auth-shell"
import { Campo, CasillaTyC } from "@/components/auth/campos"
import { CampoNombreUsuario } from "@/components/auth/campo-nombre-usuario"
import { obtenerPerfilActual, perfilIncompleto } from "@/lib/auth/perfil"
import { useNombreUsuario } from "@/lib/auth/use-nombre-usuario"
import type { Profile } from "@/lib/types/database"

/**
 * Nombre y apellido sugeridos a partir de los datos de Google. Es el único
 * lugar donde se lee user_metadata: solo para prellenar el formulario.
 */
function sugerenciaGoogle(user: User): { nombre: string; apellido: string } {
  const meta = user.user_metadata ?? {}
  const completo = String(meta.full_name ?? meta.name ?? "").trim()
  const [primero = "", ...resto] = completo.split(/\s+/)
  return {
    nombre: String(meta.given_name ?? "").trim() || primero,
    apellido: String(meta.family_name ?? "").trim() || resto.join(" "),
  }
}

export default function CompletarPerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [usuario, setUsuario] = useState("")
  const [acepta, setAcepta] = useState(false)
  const [errores, setErrores] = useState<Record<string, string | undefined>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const nombreUsuario = useNombreUsuario(usuario, profile?.nombre_usuario)

  useEffect(() => {
    obtenerPerfilActual(createClient())
      .then((actual) => {
        if (!actual) return router.replace("/login")
        if (!actual.profile) {
          setErrorCarga("Tu cuenta no tiene un perfil asociado. Contactá al equipo de Lecxico.")
          return
        }
        if (!perfilIncompleto(actual.profile)) return router.replace("/dashboard")

        const google = sugerenciaGoogle(actual.user)
        setProfile(actual.profile)
        setNombre(actual.profile.nombre || google.nombre)
        setApellido(actual.profile.apellido || google.apellido)
        setUsuario(actual.profile.nombre_usuario ?? "")
        setAcepta(actual.profile.acepta_tyc)
      })
      .catch((e) => {
        console.error("completar-perfil:", e)
        setErrorCarga("No se pudo cargar tu perfil. Recargá la página.")
      })
      .finally(() => setCargando(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setErrorGeneral(null)
    setGuardando(true)
    const estadoUsuario = await nombreUsuario.verificarAhora()
    const nuevos = {
      nombre: nombre.trim() ? undefined : "Completá tu nombre.",
      apellido: apellido.trim() ? undefined : "Completá tu apellido.",
      usuario:
        estadoUsuario === "vacio"
          ? "Elegí un nombre de usuario."
          : estadoUsuario === "error"
            ? "No se pudo verificar el nombre de usuario. Probá de nuevo."
            : undefined,
      acepta: acepta ? undefined : "Tenés que aceptar los Términos y Condiciones y la Política de Privacidad.",
    }
    setErrores(nuevos)
    if (Object.values(nuevos).some(Boolean) || estadoUsuario !== "disponible") {
      setGuardando(false)
      return
    }

    // Solo columnas habilitadas para el usuario (0002); la fecha de
    // aceptación la fija la base.
    const { error } = await createClient()
      .from("profiles")
      .update({ nombre: nombre.trim(), apellido: apellido.trim(), nombre_usuario: nombreUsuario.nombre, acepta_tyc: true })
      .eq("id", profile.id)

    if (error) {
      console.error("completar-perfil update:", error)
      setErrorGeneral(
        error.code === "23505"
          ? "Ese nombre de usuario se acaba de ocupar. Elegí otro."
          : "No se pudo guardar el perfil. Probá de nuevo.",
      )
      setGuardando(false)
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <AuthShell titulo="Completá tu perfil">
      <Card className="w-full max-w-lg border-2 shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Completá tu perfil</CardTitle>
          <CardDescription>Necesitamos algunos datos más antes de empezar.</CardDescription>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : errorCarga ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorCarga}</AlertDescription>
            </Alert>
          ) : profile ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo id="nombre" label="Nombre/s" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} autoComplete="given-name" />
                <Campo id="apellido" label="Apellido/s" value={apellido} onChange={(e) => setApellido(e.target.value)} error={errores.apellido} autoComplete="family-name" />
              </div>
              <CampoNombreUsuario
                id="usuario"
                label="Nombre de usuario"
                value={usuario}
                onChange={setUsuario}
                estado={nombreUsuario.estado}
                error={errores.usuario}
              />
              {!profile.acepta_tyc && <CasillaTyC id="acepta" checked={acepta} onChange={setAcepta} error={errores.acepta} />}

              {errorGeneral && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorGeneral}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={guardando}>
                {guardando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Guardar y continuar"}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
