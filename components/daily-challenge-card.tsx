"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Trophy, CheckCircle2, ArrowRight, Calendar } from 'lucide-react'
import { LexSpeaker } from "@/components/lex-speaker"
import confetti from 'canvas-confetti'

interface DailyChallengeProps {
  userLevel: number
  category: "child" | "teen"
}

const CHALLENGES = [
  {
    id: 1,
    title: "Aventura de Palabras",
    description: "Completa 3 juegos de lectura hoy para ganar un premio especial.",
    target: 3,
    reward: 100,
    type: "reading"
  },
  {
    id: 2,
    title: "Cazador de Letras",
    description: "Encuentra 10 letras 'A' en el juego Busca la Letra.",
    target: 1,
    reward: 150,
    type: "identification"
  },
  {
    id: 3,
    title: "Maestro del Sonido",
    description: "Completa 2 niveles de Eco de Palabras sin errores.",
    target: 2,
    reward: 120,
    type: "phonology"
  }
]

export function DailyChallengeCard({ userLevel, category }: DailyChallengeProps) {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [streak, setStreak] = useState(3)
  const [currentChallenge, setCurrentChallenge] = useState(CHALLENGES[0])
  const [currentProgress, setCurrentProgress] = useState(1)

  useEffect(() => {
    // Select challenge based on date (simple rotation)
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    const challengeIndex = dayOfYear % CHALLENGES.length
    const selectedChallenge = CHALLENGES[challengeIndex]
    
    // Adjust title/desc for teen category if needed
    if (category === "teen") {
      selectedChallenge.title = selectedChallenge.title.replace("Aventura", "Desafío").replace("Cazador", "Experto")
    }
    
    setCurrentChallenge(selectedChallenge)

    // Load saved progress from localStorage (mock)
    const savedProgress = localStorage.getItem(`daily_challenge_${new Date().toISOString().split('T')[0]}`)
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress)
      setCurrentProgress(parsed.current)
      setIsCompleted(parsed.completed)
      if (parsed.completed) setProgress(100)
      else setProgress((parsed.current / selectedChallenge.target) * 100)
    } else {
      // Reset for new day
      setProgress((1 / selectedChallenge.target) * 100)
    }
  }, [category])

  const handleComplete = () => {
    // Simulate completion for demo
    const newProgress = currentChallenge.target
    setCurrentProgress(newProgress)
    setProgress(100)
    setIsCompleted(true)
    
    // Save to local storage
    localStorage.setItem(`daily_challenge_${new Date().toISOString().split('T')[0]}`, JSON.stringify({
      current: newProgress,
      completed: true
    }))

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  return (
    <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 text-accent" />
      </div>
      
      <CardHeader>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Desafío del Día</CardTitle>
              <CardDescription>Racha actual: {streak} días 🔥</CardDescription>
            </div>
          </div>
          <div className="bg-accent/10 px-3 py-1 rounded-full text-accent font-bold text-sm">
            +{currentChallenge.reward} XP
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {isCompleted ? (
          <div className="text-center py-4 space-y-4 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-700">¡Desafío Completado!</h3>
              <p className="text-muted-foreground">Has ganado {currentChallenge.reward} XP hoy</p>
            </div>
            <LexSpeaker context="daily_challenge_complete" variant="compact" className="justify-center" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{currentChallenge.title}</span>
                <span className="text-muted-foreground">{currentProgress}/{currentChallenge.target}</span>
              </div>
              <Progress value={progress} className="h-3 bg-accent/10" indicatorClassName="bg-accent" />
              <p className="text-sm text-muted-foreground">{currentChallenge.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-white group"
                onClick={handleComplete} // For demo purposes, clicking starts/completes it
              >
                {currentProgress === 0 ? "Iniciar Desafío" : "Continuar Desafío"}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
