"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

const LEVELS = [
  {
    icon: "🌱",
    title: "Nivel Inicial",
    subtitle: "4 a 5 años",
    description: "Para niños de 4 a 5 años que están aprendiendo a leer",
    href: "/test/inicial",
  },
  {
    icon: "📚",
    title: "Nivel Primario",
    subtitle: "6 a 8 años",
    description: "Para niños de 6 a 8 años que ya saben leer",
    href: "/test/primaria",
  },
]

/* Diagonal gradient: near-black red → dark red → deep indigo */
const backgroundStyle = {
  background: "linear-gradient(135deg, #1a0000 0%, #7f1d1d 50%, #1e1e2e 100%)",
}

export default function TestSelectionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
      {/* ---- Ambient blurred orbs (depth) ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-red-500 opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-pink-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-orange-500 opacity-20 blur-3xl" />
      </div>

      {/* ---- Navbar ---- */}
      <header className="relative z-10 h-16 bg-red-600 shadow-lg">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Lecxico</h1>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-white font-medium">
              Test de indicadores de dislexia
            </span>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </header>

      {/* ---- Content ---- */}
      <main className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-bold text-white">Test de indicadores de dislexia</h2>
          <p className="text-lg text-white/70">Seleccioná el nivel que corresponde</p>
        </div>

        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {LEVELS.map((level) => (
            <div
              key={level.href}
              onClick={() => router.push(level.href)}
              className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 flex flex-col items-center text-center gap-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <span className="text-6xl">{level.icon}</span>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{level.title}</h3>
                <p className="text-sm font-semibold text-white/70">{level.subtitle}</p>
              </div>
              <p className="text-sm text-white/70">{level.description}</p>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(level.href) }}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200"
              >
                Comenzar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
