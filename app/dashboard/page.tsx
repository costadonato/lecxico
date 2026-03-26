"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Brain, Gamepad2, User, LogOut, Loader2, Star } from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-red-50">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    )
  }

  const cards = [
    {
      title: "Test",
      description: "Detectá indicadores de dislexia",
      icon: Brain,
      href: "/test",
      gradient: "from-red-500 to-orange-400",
      shadow: "hover:shadow-red-200/60",
    },
    {
      title: "Entrenamiento",
      description: "Practicá con juegos interactivos",
      icon: Gamepad2,
      href: "/entrenamiento",
      gradient: "from-blue-500 to-violet-500",
      shadow: "hover:shadow-violet-200/60",
    },
    {
      title: "Mi Perfil",
      description: "Revisá tu progreso y resultados",
      icon: User,
      href: "/perfil",
      gradient: "from-emerald-500 to-teal-500",
      shadow: "hover:shadow-emerald-200/60",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 pb-16">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">Lecxico</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero with mascots */}
        <div className="flex items-center justify-center gap-6 mt-12 mb-2">
          <img
            src="/images/lex.png"
            alt="Lex"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg"
            style={{ animation: "dashboard-float 3s ease-in-out infinite" }}
          />
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              ¡Hola, {firstName}! 👋
            </h2>
            <p className="text-lg text-gray-500 mt-2">¿Qué querés hacer hoy?</p>
          </div>
          <img
            src="/images/lumo.png"
            alt="Lumo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg"
            style={{ animation: "dashboard-float 3s ease-in-out infinite 0.5s", mixBlendMode: "multiply" }}
          />
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.title}
                onClick={() => router.push(card.href)}
                className={`group relative rounded-2xl bg-gradient-to-br ${card.gradient} p-8 text-white text-left shadow-lg ${card.shadow} hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer`}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p className="text-white/85 text-base leading-relaxed">{card.description}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        {/* Motivational section */}
        <div className="max-w-3xl mx-auto mt-14">
          <div className="bg-white/70 backdrop-blur-sm border border-red-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Tu progreso</h4>
              <p className="text-gray-500">¡Seguí así! Cada día mejorás un poco más 🌟</p>
            </div>
          </div>
        </div>
      </main>

      {/* Float animation */}
      <style jsx>{`
        @keyframes dashboard-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
