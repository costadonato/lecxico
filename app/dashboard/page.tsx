"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Play, Brain, User, LogOut, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [firstName, setFirstName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setFirstName(user.user_metadata?.first_name || "Usuario")
      } else {
        router.push("/login")
      }
      setIsLoading(false)
    }

    fetchUser()
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Lecxico</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">¡Hola {firstName}!</h2>
          <p className="text-gray-500 mt-2">¿Qué te gustaría hacer hoy?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-primary transition-colors cursor-pointer border-2 shadow-sm" onClick={() => router.push("/test")}>
            <CardHeader className="text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Test</CardTitle>
                <CardDescription className="mt-2">Realiza una evaluación rápida</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer border-2 shadow-sm" onClick={() => router.push("/entrenamiento")}>
            <CardHeader className="text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Entrenamiento</CardTitle>
                <CardDescription className="mt-2">Practica tus habilidades</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer border-2 shadow-sm" onClick={() => router.push("/perfil")}>
            <CardHeader className="text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Mi Perfil</CardTitle>
                <CardDescription className="mt-2">Revisa tu progreso y ajustes</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
