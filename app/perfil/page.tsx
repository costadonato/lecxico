"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, User, Mail, Dumbbell, Gamepad2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { HistorialEvaluaciones } from "@/components/test/historial-evaluaciones"
import { obtenerPerfilActual } from "@/lib/auth/perfil"
import { cargarTestsConBloques, type TestConBloques } from "@/lib/ninos/detalle"
import type { Entrenamiento, Profile } from "@/lib/types/database"

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [evaluaciones, setEvaluaciones] = useState<TestConBloques[]>([])
  const [errorEvaluaciones, setErrorEvaluaciones] = useState(false)
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([])

  useEffect(() => {
    const load = async () => {
      const actual = await obtenerPerfilActual(supabase).catch((e) => {
        console.error("perfil:", e)
        return undefined
      })
      if (actual === null) {
        router.push("/login")
        return
      }
      const user = actual?.user ?? (await supabase.auth.getUser()).data.user
      if (!user) {
        router.push("/login")
        return
      }

      setProfile(actual?.profile ?? null)
      setFirstName(actual?.profile?.nombre ?? "")
      setLastName(actual?.profile?.apellido ?? "")
      setEmail(user.email || "")

      // Historial de evaluaciones (con los bloques en una sola consulta)
      try {
        setEvaluaciones(await cargarTestsConBloques(supabase, user.id))
      } catch (e) {
        console.error("perfil evaluaciones:", e)
        setErrorEvaluaciones(true)
      }

      // Últimos 10 entrenamientos
      const { data: entData } = await supabase
        .from("entrenamientos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (entData) setEntrenamientos(entData)

      setIsLoading(false)
    }
    load()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {profile && <AppHeader profile={profile} />}

      <main className="container mx-auto px-4 mt-8 space-y-8 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="p-2" aria-label="Volver al inicio">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Mi Perfil</h1>
        </div>

        {/* ---- Datos personales ---- */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Datos personales</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{firstName || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Apellido</p>
                <p className="font-medium">{lastName || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="font-medium">{email}</p>
            </div>
          </CardContent>
        </Card>

        {/* ---- Historial de evaluaciones (sin recomendación) ---- */}
        {errorEvaluaciones ? (
          <MensajeAlerta tipo="error" texto="No se pudo cargar el historial de evaluaciones. Recargá la página." />
        ) : (
          <HistorialEvaluaciones tests={evaluaciones} urlDetalle={(testId) => `/perfil/evaluaciones/${testId}`} />
        )}

        {/* ---- Historial de entrenamientos ---- */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-xl">Historial de entrenamientos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {entrenamientos.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-4 py-2 font-semibold">Juego</th>
                      <th className="text-center px-4 py-2 font-semibold">Puntaje</th>
                      <th className="text-right px-4 py-2 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entrenamientos.map((e) => (
                      <tr key={e.id} className="border-b last:border-b-0">
                        <td className="px-4 py-2 flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-gray-400" />
                          {e.juego}
                        </td>
                        <td className="text-center px-4 py-2 font-medium">{e.puntaje}</td>
                        <td className="text-right px-4 py-2 text-gray-500">{formatDate(e.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-gray-500">Aún no realizaste ningún entrenamiento</p>
                <Button asChild>
                  <Link href="/entrenamiento">Ir a entrenar</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volver */}
        <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Button>
      </main>
    </div>
  )
}
