"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Trophy, Heart, ArrowRight, Check } from 'lucide-react'
import Image from "next/image"
import { markTutorialSeen, getCurrentUserUid, analytics } from "@/lib/auth-utils"

interface ChildTutorialModalProps {
  open: boolean
  onComplete: () => void
  variant?: "child" | "teen"
}

export function ChildTutorialModal({ open, onComplete, variant = "child" }: ChildTutorialModalProps) {
  const [step, setStep] = useState(0)
  const uid = getCurrentUserUid()

  useEffect(() => {
    if (open && uid) {
      analytics.track("tutorial_start", { uid, variant })
    }
  }, [open, uid, variant])

  const childSteps = [
    {
      title: "¡Hola! Soy Lex",
      description:
        "¡Bienvenido a Lecxico! Soy Lex y junto a mi amigo Lumo te ayudaremos a convertirte en un superhéroe de la lectura.",
      image: "/images/lex.png",
      icon: Sparkles,
      color: "text-primary",
    },
    {
      title: "Conoce a Lumo",
      description:
        "Lumo es mi compañero robot. Él te mostrará ejercicios divertidos y te dará pistas cuando las necesites.",
      image: "/images/lumo.png",
      icon: Heart,
      color: "text-accent",
    },
    {
      title: "Juega y Aprende",
      description:
        "Cada juego que completes te dará puntos XP y desbloquearás logros especiales. ¡Mientras más juegues, más aprenderás!",
      icon: BookOpen,
      color: "text-secondary",
    },
    {
      title: "¡Gana Recompensas!",
      description:
        "Completa misiones, gana trofeos y sube de nivel. ¡Estamos aquí para ayudarte en cada paso de tu aventura!",
      icon: Trophy,
      color: "text-primary",
    },
  ]

  const teenSteps = [
    {
      title: "Bienvenido a Lecxico",
      description:
        "Una plataforma diseñada para potenciar tus habilidades de lectura y escritura con tecnología avanzada.",
      image: "/images/lex.png",
      icon: Sparkles,
      color: "text-primary",
    },
    {
      title: "Tu Asistente Inteligente",
      description:
        "Lumo utiliza inteligencia artificial para adaptar los desafíos a tu nivel y ritmo de aprendizaje.",
      image: "/images/lumo.png",
      icon: Heart,
      color: "text-accent",
    },
    {
      title: "Desafíos Diarios",
      description:
        "Mantén tu racha completando ejercicios diarios diseñados para mejorar tu fluidez y comprensión.",
      icon: BookOpen,
      color: "text-secondary",
    },
    {
      title: "Sigue tu Progreso",
      description:
        "Visualiza tus estadísticas, establece metas y observa cómo mejoras semana a semana.",
      icon: Trophy,
      color: "text-primary",
    },
  ]

  const steps = variant === "teen" ? teenSteps : childSteps
  const currentStep = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    if (uid) {
      await markTutorialSeen(uid)
    }
    onComplete()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl mascot-no-bg border-2 border-primary/10">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" onClick={handleComplete} className="text-muted-foreground hover:text-foreground">
            Saltar
          </Button>
        </div>

        <DialogHeader>
          <DialogTitle className="text-3xl text-center font-bold text-balance pt-4">{currentStep.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Visual Content */}
          <div className="flex justify-center h-48 items-center">
            {currentStep.image ? (
              <div className="relative w-48 h-48 animate-float">
                <Image
                  src={currentStep.image || "/placeholder.svg"}
                  alt={currentStep.title}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center animate-float shadow-lg">
                <currentStep.icon className={`w-16 h-16 ${currentStep.color}`} />
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xl text-center text-muted-foreground leading-relaxed text-pretty px-8 min-h-[5rem]">
            {currentStep.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 py-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === step ? "w-8 bg-primary" : index < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center pt-2">
            {step > 0 && (
              <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} className="min-w-32">
                Anterior
              </Button>
            )}
            <Button size="lg" onClick={handleNext} className="min-w-32 gap-2 shadow-md hover:shadow-lg transition-all">
              {step < steps.length - 1 ? (
                <>
                  Siguiente <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  ¡Comenzar! <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
