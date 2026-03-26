"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Star } from "lucide-react"
import Link from "next/link"
import { RompeYUne } from "@/components/games/rompe-y-une"
import { LluviaPalabras } from "@/components/games/lluvia-palabras"
import { EcoPalabras } from "@/components/games/eco-palabras"
import { HistoriasHuecos } from "@/components/games/historias-huecos"
import { MemoTono } from "@/components/games/memotono"
import { BuscaLetra } from "@/components/games/busca-letra"
import { CazaErrores } from "@/components/games/caza-errores"
import { MisionLexLumo } from "@/components/games/mision-lex-lumo"
import { CuentaConmigo } from "@/components/games/cuenta-conmigo"
import { CualEsMayor } from "@/components/games/cual-es-mayor"
import { CazadorNumeros } from "@/components/games/cazador-numeros"
import { SuperSumador } from "@/components/games/super-sumador"
import { TiendaLex } from "@/components/games/tienda-lex"
import { PhonicsMatch } from "@/components/games/phonics-match"
import { PictureWords } from "@/components/games/picture-words"
import { RhymeTime } from "@/components/games/rhyme-time"
import { SightWords } from "@/components/games/sight-words"
import { CarreraEducativa } from "@/components/games/carrera-educativa"

function CarreraLectura(props: { onComplete: (score: number, metrics: any) => void }) {
  return <CarreraEducativa {...props} type="reading" />
}

function CarreraMatematica(props: { onComplete: (score: number, metrics: any) => void }) {
  return <CarreraEducativa {...props} type="math" />
}

const games = {
  "rompe-y-une": {
    title: "Rompe y Une",
    component: RompeYUne,
    xp: 50,
  },
  "lluvia-palabras": {
    title: "Lluvia de Palabras",
    component: LluviaPalabras,
    xp: 50,
  },
  "eco-palabras": {
    title: "Eco de Palabras",
    component: EcoPalabras,
    xp: 75,
  },
  "historias-huecos": {
    title: "Historias con Huecos",
    component: HistoriasHuecos,
    xp: 100,
  },
  memotono: {
    title: "Memotono",
    component: MemoTono,
    xp: 75,
  },
  "busca-letra": {
    title: "Busca la Letra",
    component: BuscaLetra,
    xp: 50,
  },
  "caza-errores": {
    title: "Caza de Errores",
    component: CazaErrores,
    xp: 100,
  },
  "mision-lex-lumo": {
    title: "Misión Lex & Lumo",
    component: MisionLexLumo,
    xp: 150,
  },
  "cuenta-conmigo": {
    title: "Cuenta Conmigo",
    component: CuentaConmigo,
    xp: 50,
  },
  "cual-es-mayor": {
    title: "¿Cuál es Mayor?",
    component: CualEsMayor,
    xp: 50,
  },
  "cazador-numeros": {
    title: "Cazador de Números",
    component: CazadorNumeros,
    xp: 75,
  },
  "super-sumador": {
    title: "Súper Sumador",
    component: SuperSumador,
    xp: 75,
  },
  "tienda-lex": {
    title: "La Tienda de Lex",
    component: TiendaLex,
    xp: 100,
  },
  "phonics-match": {
    title: "Phonics Match",
    component: PhonicsMatch,
    xp: 50,
  },
  "picture-words": {
    title: "Picture Words",
    component: PictureWords,
    xp: 60,
  },
  "rhyme-time": {
    title: "Rhyme Time",
    component: RhymeTime,
    xp: 65,
  },
  "sight-words": {
    title: "Sight Words",
    component: SightWords,
    xp: 55,
  },
  "carrera-lectura": {
    title: "Carrera de Lectura",
    component: CarreraLectura,
    xp: 100,
  },
  "carrera-matematica": {
    title: "Carrera de Matemática",
    component: CarreraMatematica,
    xp: 100,
  },
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [completed, setCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [metrics, setMetrics] = useState<any>({})

  const game = games[gameId as keyof typeof games]

  if (gameId === "gauchos-reading") {
    router.push("/reading/gauchos")
    return null
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Juego no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/child">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleComplete = (score: number, gameMetrics: any) => {
    setFinalScore(score)
    setMetrics(gameMetrics)
    setCompleted(true)
  }

  const GameComponent = game.component

  if (completed) {
    const accuracy = metrics.accuracy || 0
    const percentage = Math.round(accuracy * 100)
    const earnedXP = Math.round(accuracy * game.xp)

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 relative overflow-hidden">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20 md:opacity-40">
            <img src="/images/lex.png" alt="Lex" className="w-full h-full object-contain animate-float mascot-no-bg" />
          </div>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20 md:opacity-40">
            <img
              src="/images/lumo.png"
              alt="Lumo"
              className="w-full h-full object-contain animate-float-delayed mascot-no-bg"
            />
          </div>

          <CardHeader className="text-center space-y-4 relative z-10">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
            <CardTitle className="text-4xl">Juego Completado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-primary">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Precisión</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-3xl font-bold text-secondary">+{earnedXP}</p>
                <p className="text-sm text-muted-foreground">XP Ganados</p>
              </div>
            </div>

            {percentage >= 80 && (
              <div className="flex items-center justify-center gap-2 p-4 bg-secondary/10 rounded-xl">
                <Star className="w-6 h-6 text-secondary fill-secondary" />
                <Star className="w-6 h-6 text-secondary fill-secondary" />
                <Star className="w-6 h-6 text-secondary fill-secondary" />
              </div>
            )}

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={percentage >= 80 ? "/images/lex.png" : "/images/lumo.png"}
                  alt={percentage >= 80 ? "Lex" : "Lumo"}
                  className="w-full h-full object-contain mascot-no-bg"
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{percentage >= 80 ? "Lex dice:" : "Lumo dice:"}</p>
                <p className="text-sm text-muted-foreground">
                  {percentage >= 80 ? "Increíble! Estás mejorando cada día!" : "Buen trabajo! Sigue practicando!"}
                </p>
              </div>
            </div>

            <Button className="w-full" asChild>
              <Link href="/dashboard/child">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/child">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Salir
              </Link>
            </Button>
            <h1 className="text-xl font-bold">{game.title}</h1>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary fill-secondary" />
              <span className="font-bold">+{game.xp} XP</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <GameComponent onComplete={handleComplete} />
        </div>
      </div>
    </div>
  )
}
