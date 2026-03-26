"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calculator, Globe, Sparkles, Trophy, LibraryBig } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ChildTutorialModal } from "@/components/child-tutorial-modal"
import { getCurrentUserUid, fetchUserProfile } from "@/lib/auth-utils"
import { getGamesByAgeGroup } from "@/lib/games-catalog"

const iconMap: Record<string, any> = {
  search: BookOpen,
  sparkles: Sparkles,
  zap: BookOpen,
  star: BookOpen,
  "book-open": BookOpen,
  target: BookOpen,
  music: BookOpen,
  gamepad: BookOpen,
  "shopping-bag": BookOpen,
  calculator: Calculator,
  hash: Calculator,
  "chevrons-up": Calculator,
  crosshair: Calculator,
  "volume-2": Globe,
  image: Globe,
  eye: Globe,
}

export default function ChildGamesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showTutorial, setShowTutorial] = useState(false)
  const [userName, setUserName] = useState("Amigo")

  useEffect(() => {
    const startTutorial = searchParams.get("startTutorial") === "true"
    const uid = getCurrentUserUid()

    if (uid) {
      fetchUserProfile(uid).then((profile) => {
        if (profile) {
          setUserName(profile.name.split(" ")[0])
          if (startTutorial && !profile.tutorialSeen) {
            setShowTutorial(true)
          }
        }
      })
    }
  }, [searchParams])

  const allGames = getGamesByAgeGroup("child")
  const readingGames = allGames.filter((g) => g.category === "reading")
  const mathGames = allGames.filter((g) => g.category === "math")
  const englishGames = allGames.filter((g) => g.category === "english")

  const renderGameCard = (game: any) => {
    const IconComponent = iconMap[game.icon] || BookOpen
    const colorClass =
      game.category === "reading" ? "bg-primary" : game.category === "math" ? "bg-blue-600" : "bg-purple-600"

    return (
      <Card key={game.id} className="border-2 hover:border-primary transition-all hover:shadow-lg group">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <Badge variant="secondary" className="text-sm">
              {game.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{game.title}</CardTitle>
          <CardDescription className="text-base leading-relaxed">{game.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full" asChild>
            <Link href={`/games/${game.id}`}>
              {game.category === "english" ? "Play Now!" : "¡Jugar Ahora!"}
              <Sparkles className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Lecxico</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/games/catalog">
                <LibraryBig className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/child">Mi Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/progress">Mi Progreso</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Mascots */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-balance">
                    ¡Hola, {userName}!<span className="block text-primary mt-2">¿Listo para jugar?</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Lex y Lumo te esperan con juegos súper divertidos de lectura, matemáticas e inglés.
                  </p>
                  <div className="flex gap-3">
                    <Button size="lg" className="text-lg" onClick={() => setShowTutorial(true)}>
                      Ver Tutorial
                      <Sparkles className="ml-2 w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="#games">Ver Juegos</Link>
                    </Button>
                  </div>
                </div>

                <div className="relative h-64 md:h-80 mascot-no-bg">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-40 h-40 animate-float">
                    <Image src="/images/lex.png" alt="Lex" fill className="object-contain" />
                  </div>
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 animate-float"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <Image src="/images/lumo.png" alt="Lumo" fill className="object-contain" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div id="games" className="max-w-6xl mx-auto space-y-12">
          {/* Reading Games Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  Juegos de Lectura
                </h2>
                <p className="text-lg text-muted-foreground">
                  Todos los juegos son divertidos y te ayudan a leer mejor
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {readingGames.length} juegos
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">{readingGames.map(renderGameCard)}</div>
          </div>

          {/* Math Games Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-blue-600" />
                  Juegos de Matemáticas
                </h2>
                <p className="text-lg text-muted-foreground">Aprende números y cuentas jugando</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {mathGames.length} juegos
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">{mathGames.map(renderGameCard)}</div>
          </div>

          {/* English Games Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-purple-600" />
                  English Games
                </h2>
                <p className="text-lg text-muted-foreground">Learn English with fun, dyslexia-friendly games</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {englishGames.length} juegos
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">{englishGames.map(renderGameCard)}</div>
          </div>
        </div>

        {/* Motivational Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="border-2 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">¡Gana Recompensas!</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Cada juego que completes te da puntos XP y desbloquea logros especiales. ¡Sigue jugando para subir de
                nivel!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tutorial Modal */}
      <ChildTutorialModal open={showTutorial} onComplete={() => setShowTutorial(false)} />
    </div>
  )
}
