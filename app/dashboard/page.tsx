"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Loader2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { obtenerPerfilActual, perfilIncompleto } from "@/lib/auth/perfil"
import type { Rol } from "@/lib/types/database"

const TARJETAS = {
  test: {
    title: "Test",
    description: "Detectá indicadores de dislexia",
    icon: "🧠",
    href: "/test",
  },
  entrenamiento: {
    title: "Entrenamiento",
    description: "Practicá con juegos interactivos",
    icon: "🎮",
    href: "/entrenamiento",
  },
  perfil: {
    title: "Mi Perfil",
    description: "Revisá tu progreso y resultados",
    icon: "👤",
    href: "/perfil",
  },
  ninos: {
    title: "Mis niños",
    description: "Vinculá niños y gestioná a quiénes acompañás",
    icon: "👥",
    href: "/ninos",
  },
  profesionales: {
    title: "Mis profesionales",
    description: "Mirá quiénes te acompañan",
    icon: "🩺",
    href: "/mis-profesionales",
  },
}

const TARJETAS_POR_ROL: Record<Rol, (typeof TARJETAS)[keyof typeof TARJETAS][]> = {
  profesional: [TARJETAS.test, TARJETAS.ninos],
  nino: [TARJETAS.entrenamiento, TARJETAS.perfil, TARJETAS.profesionales],
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [firstName, setFirstName] = useState<string>("")
  const [rol, setRol] = useState<Rol | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const actual = await obtenerPerfilActual(supabase)
        if (!actual) {
          router.push("/login")
          return
        }
        if (!actual.profile) {
          setErrorCarga("Tu cuenta no tiene un perfil asociado. Contactá al equipo de Lecxico.")
          setIsLoading(false)
          return
        }
        if (perfilIncompleto(actual.profile)) {
          router.replace("/completar-perfil")
          return
        }

        setFirstName(actual.profile.nombre)
        setRol(actual.profile.rol)
        setIsLoading(false)

        if (actual.profile.rol === "nino") {
          const { error } = await supabase
            .from("ninos")
            .update({ ultima_conexion: new Date().toISOString() })
            .eq("profile_id", actual.user.id)
          if (error) console.error("No se pudo registrar la última conexión:", error)
        }
      } catch (e) {
        console.error("dashboard:", e)
        setErrorCarga("No se pudo cargar tu perfil. Recargá la página.")
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  /* Diagonal gradient: near-black red → dark red → deep indigo */
  const backgroundStyle = {
    background: "linear-gradient(135deg, #1a0000 0%, #7f1d1d 50%, #1e1e2e 100%)",
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
        <Loader2 className="w-10 h-10 animate-spin text-white/80" />
      </div>
    )
  }

  if (errorCarga || !rol) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={backgroundStyle}>
        <p className="text-lg text-white">{errorCarga}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    )
  }

  const cards = TARJETAS_POR_ROL[rol]

  return (
    <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
      {/* ---- Ambient blurred orbs (depth) ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-red-500 opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-pink-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-orange-500 opacity-20 blur-3xl" />
      </div>

      {/* ---- Navbar ---- */}
      <AppHeader profile={{ nombre: firstName, rol }} />

      <main className="relative z-10 container mx-auto px-4">
        {/* ---- Greeting with mascots ---- */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 pt-12 pb-10">
          <img
            src="/images/lex.png"
            alt="Lex"
            className="h-[180px] md:h-[220px] w-auto object-contain shrink-0 drop-shadow-2xl"
          />

          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">Hola, {firstName}</h2>
            <p className="text-lg text-white/70 mt-2">¿Qué querés hacer hoy?</p>
          </div>

          <img
            src="/images/lumo.png"
            alt="Lumo"
            className="h-[180px] md:h-[220px] w-auto object-contain shrink-0 drop-shadow-2xl"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* ---- Navigation cards ---- */}
        <div
          className={`grid grid-cols-1 gap-6 mx-auto pb-16 ${
            cards.length === 1 ? "max-w-sm" : cards.length === 2 ? "md:grid-cols-2 max-w-3xl" : "md:grid-cols-3 max-w-5xl"
          }`}
        >
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => router.push(card.href)}
              className="group rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-left hover:bg-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                {card.icon}
              </div>

              <h3 className="text-xl font-bold text-white mt-6">{card.title}</h3>
              <p className="text-sm text-white/70 mt-2">{card.description}</p>

              <div className="border-t border-white/20 mt-6 pt-4">
                <span className="text-sm text-white/50">Ir →</span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
