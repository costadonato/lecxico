"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Globe,
  Search,
  Target,
  Volume2,
  Music,
  Sparkles,
  Scissors,
  CloudRain,
  Crosshair,
  Hash,
  ChevronsUp,
  Zap,
  Mic,
  ImageIcon,
  Music2,
  Eye,
  Loader2,
  LogOut,
} from "lucide-react"

type Category = "lectura" | "matematicas" | "ingles"

interface Game {
  id: string
  name: string
  icon: React.ElementType
  category: Category
}

const GAMES: Game[] = [
  // Lectura y Dislexia
  { id: "busca-letra", name: "Busca la Letra", icon: Search, category: "lectura" },
  { id: "caza-errores", name: "Caza Errores", icon: Target, category: "lectura" },
  { id: "eco-palabras", name: "Eco Palabras", icon: Volume2, category: "lectura" },
  { id: "historias-huecos", name: "Historias con Huecos", icon: BookOpen, category: "lectura" },
  { id: "lluvia-palabras", name: "Lluvia de Palabras", icon: CloudRain, category: "lectura" },
  { id: "memotono", name: "Memotono", icon: Music, category: "lectura" },
  { id: "mision-lex-lumo", name: "Misión Lex y Lumo", icon: Sparkles, category: "lectura" },
  { id: "rompe-y-une", name: "Rompe y Une", icon: Scissors, category: "lectura" },
  // Matemáticas
  { id: "cazador-numeros", name: "Cazador de Números", icon: Crosshair, category: "matematicas" },
  { id: "cuenta-conmigo", name: "Cuenta Conmigo", icon: Hash, category: "matematicas" },
  { id: "cual-es-mayor", name: "¿Cuál es Mayor?", icon: ChevronsUp, category: "matematicas" },
  { id: "super-sumador", name: "Super Sumador", icon: Zap, category: "matematicas" },
  // Inglés
  { id: "phonics-match", name: "Phonics Match", icon: Mic, category: "ingles" },
  { id: "picture-words", name: "Picture Words", icon: ImageIcon, category: "ingles" },
  { id: "rhyme-time", name: "Rhyme Time", icon: Music2, category: "ingles" },
  { id: "sight-words", name: "Sight Words", icon: Eye, category: "ingles" },
]

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: "lectura", label: "Lectura y Dislexia", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { id: "matematicas", label: "Matemáticas", icon: Calculator, color: "text-blue-600", bg: "bg-blue-100" },
  { id: "ingles", label: "Inglés", icon: Globe, color: "text-purple-600", bg: "bg-purple-100" },
]

const CATEGORY_ICON_COLOR: Record<Category, string> = {
  lectura: "bg-primary text-white",
  matematicas: "bg-blue-600 text-white",
  ingles: "bg-purple-600 text-white",
}

export default function EntrenamientoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category>("lectura")

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setIsLoading(false)
    }
    checkAuth()
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

  const filteredGames = GAMES.filter((g) => g.category === activeCategory)
  const activeInfo = CATEGORIES.find((c) => c.id === activeCategory)!

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Entrenamiento</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Catálogo de Juegos</h2>
          <p className="text-gray-500 mt-2">Elegí una categoría y comenzá a practicar</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition-all text-sm ${
                  isActive
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={`ml-1 text-xs ${isActive ? "bg-white/20 text-white border-0" : ""}`}
                >
                  {GAMES.filter((g) => g.category === cat.id).length}
                </Badge>
              </button>
            )
          })}
        </div>

        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeInfo.bg}`}>
            <activeInfo.icon className={`w-5 h-5 ${activeInfo.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{activeInfo.label}</h3>
            <p className="text-sm text-gray-500">{filteredGames.length} juegos disponibles</p>
          </div>
        </div>

        {/* Games grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => {
            const Icon = game.icon
            return (
              <Link key={game.id} href={`/games/${game.id}`}>
                <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer border-2 shadow-sm h-full group">
                  <CardHeader className="text-center p-6 space-y-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform ${CATEGORY_ICON_COLOR[game.category]}`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{game.name}</CardTitle>
                      <CardDescription className="mt-1 text-xs">{activeInfo.label}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
