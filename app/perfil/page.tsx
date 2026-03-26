"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Loader2,
  LogOut,
  User,
  Mail,
  ClipboardList,
  Dumbbell,
  Calendar,
  Trophy,
  Gamepad2,
} from "lucide-react"

const BLOCK_NAMES: Record<number, string> = {
  1: "Discriminación auditiva",
  2: "Conciencia fonológica",
  3: "Conciencia silábica",
  4: "Correspondencia sonido-letra",
}

interface TestResult {
  fecha: string
  puntaje_total: number
  porcentaje_total: number
  bloque_1_correctas: number
  bloque_2_correctas: number
  bloque_3_correctas: number
  bloque_4_correctas: number
  conclusion: string
}

interface Entrenamiento {
  id: string
  juego: string
  puntaje: number
  fecha: string
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      setFirstName(user.user_metadata?.first_name || "")
      setLastName(user.user_metadata?.last_name || "")
      setEmail(user.email || "")

      // Último resultado del test
      const { data: testData } = await supabase
        .from("test_resultados")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })
        .limit(1)
        .single()

      if (testData) setTestResult(testData)

      // Últimos 10 entrenamientos
      const { data: entData } = await supabase
        .from("entrenamientos")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })
        .limit(10)

      if (entData) setEntrenamientos(entData)

      setIsLoading(false)
    }
    load()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

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

  const conclusionLabel = (c: string) =>
    c === "indicadores_detectados"
      ? { text: "Indicadores detectados", variant: "destructive" as const }
      : { text: "Sin indicadores", variant: "secondary" as const }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Mi Perfil</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 space-y-8 max-w-3xl">
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

        {/* ---- Resultado del test ---- */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Resultado del Test</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-5">
                {/* Summary row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(testResult.fecha)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {testResult.puntaje_total}/20 — {testResult.porcentaje_total}%
                  </Badge>
                  <Badge variant={conclusionLabel(testResult.conclusion).variant}>
                    {conclusionLabel(testResult.conclusion).text}
                  </Badge>
                </div>

                {/* Block table */}
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-2 font-semibold">Bloque</th>
                        <th className="text-center px-4 py-2 font-semibold">Correctas</th>
                        <th className="text-center px-4 py-2 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map((b) => {
                        const correctas = testResult[`bloque_${b}_correctas` as keyof TestResult] as number
                        return (
                          <tr key={b} className="border-b last:border-b-0">
                            <td className="px-4 py-2">{BLOCK_NAMES[b]}</td>
                            <td className="text-center px-4 py-2 font-medium">{correctas}</td>
                            <td className="text-center px-4 py-2 text-gray-500">5</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-gray-500">Aún no realizaste el test</p>
                <Button asChild>
                  <Link href="/test">Realizar test</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
                        <td className="text-right px-4 py-2 text-gray-500">{formatDate(e.fecha)}</td>
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
