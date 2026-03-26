"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Calculator,
  Globe,
  Search,
  Sparkles,
  Zap,
  Star,
  Target,
  Music,
  Gamepad2,
  ShoppingBag,
  Hash,
  ChevronsUp,
  Crosshair,
  Volume2,
  ImageIcon,
  Eye,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react"
import Link from "next/link"

const iconMap: Record<string, any> = {
  search: Search,
  sparkles: Sparkles,
  zap: Zap,
  star: Star,
  "book-open": BookOpen,
  target: Target,
  music: Music,
  gamepad: Gamepad2,
  "shopping-bag": ShoppingBag,
  calculator: Calculator,
  hash: Hash,
  "chevrons-up": ChevronsUp,
  crosshair: Crosshair,
  "volume-2": Volume2,
  image: ImageIcon,
  eye: Eye,
}

import { type GAMES_CATALOG, getGamesByCategory } from "@/lib/games-catalog"

export default function GamesCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<"reading" | "math" | "english">("reading")

  const readingGames = getGamesByCategory("reading")
  const mathGames = getGamesByCategory("math")
  const englishGames = getGamesByCategory("english")

  const categoryInfo = {
    reading: {
      title: "Juegos de Lectura",
      subtitle: "Dislexia",
      description: "Ejercicios diseñados específicamente para mejorar las habilidades de lectura en niños con dislexia",
      color: "from-primary/20 to-accent/20",
      icon: BookOpen,
      count: readingGames.length,
    },
    math: {
      title: "Juegos de Matemáticas",
      subtitle: "Discalculia",
      description: "Actividades adaptadas para desarrollar el sentido numérico y las operaciones matemáticas",
      color: "from-blue-500/20 to-cyan-500/20",
      icon: Calculator,
      count: mathGames.length,
    },
    english: {
      title: "English Games",
      subtitle: "Dyslexia-Friendly",
      description: "English learning games adapted for children with dyslexia, focusing on phonics and vocabulary",
      color: "from-purple-500/20 to-pink-500/20",
      icon: Globe,
      count: englishGames.length,
    },
  }

  const renderGameCard = (game: (typeof GAMES_CATALOG)[0]) => {
    const IconComponent = iconMap[game.icon] || BookOpen

    return (
      <Card key={game.id} className="border-2 hover:border-primary transition-all hover:shadow-lg group">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-14 h-14 ${
                game.category === "reading" ? "bg-primary" : game.category === "math" ? "bg-blue-600" : "bg-purple-600"
              } rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="text-xs">
                {game.difficulty}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {game.duration}
              </span>
            </div>
          </div>

          <CardTitle className="text-xl mb-2">{game.title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed mb-4">{game.description}</CardDescription>

          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Habilidades
              </h4>
              <div className="flex flex-wrap gap-1">
                {game.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <User className="w-3 h-3" />
                Adaptaciones
              </h4>
              <div className="flex flex-wrap gap-1">
                {game.adaptations.slice(0, 3).map((adaptation, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {adaptation}
                  </Badge>
                ))}
                {game.adaptations.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{game.adaptations.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Button size="lg" className="w-full" asChild>
            <Link href={`/games/${game.id}`}>
              {game.category === "english" ? "Play Now" : "Jugar Ahora"}
              <Sparkles className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Lecxico</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/games/child">Juegos Niños</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/games/teen">Juegos Teens</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Catálogo Completo de Juegos</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Todos nuestros juegos organizados por categorías: Lectura, Matemáticas e Inglés
          </p>
        </div>

        {/* Category Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {Object.entries(categoryInfo).map(([key, info]) => {
            const Icon = info.icon
            return (
              <Card
                key={key}
                className={`border-2 cursor-pointer transition-all ${
                  selectedCategory === key ? "border-primary shadow-lg" : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedCategory(key as any)}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{info.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{info.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{info.count} juegos</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Games Grid by Category */}
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as any)}
          className="max-w-7xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="reading" className="text-base">
              <BookOpen className="w-4 h-4 mr-2" />
              Lectura
            </TabsTrigger>
            <TabsTrigger value="math" className="text-base">
              <Calculator className="w-4 h-4 mr-2" />
              Matemáticas
            </TabsTrigger>
            <TabsTrigger value="english" className="text-base">
              <Globe className="w-4 h-4 mr-2" />
              English
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">{categoryInfo.reading.title}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{categoryInfo.reading.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{readingGames.map(renderGameCard)}</div>
          </TabsContent>

          <TabsContent value="math" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">{categoryInfo.math.title}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{categoryInfo.math.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{mathGames.map(renderGameCard)}</div>
          </TabsContent>

          <TabsContent value="english" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">{categoryInfo.english.title}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{categoryInfo.english.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{englishGames.map(renderGameCard)}</div>
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="border-2 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">¿Listo para empezar?</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Todos los juegos están diseñados con adaptaciones específicas para niños con dislexia y discalculia
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link href="/register">Crear Cuenta Gratis</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
