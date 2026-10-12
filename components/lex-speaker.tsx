"use client"

import { useState, useEffect } from "react"
import dialoguesData from "@/lib/lex-dialogues.json"
import { useVoz } from "@/lib/hooks/use-voz"
import { PERSONAJES } from "@/lib/personajes"

type DialogueKey = keyof typeof dialoguesData

interface LexSpeakerProps {
  context: DialogueKey
  className?: string
  variant?: "default" | "compact"
  showTalkButton?: boolean
}

export function LexSpeaker({ context, className = "", variant = "default", showTalkButton = false }: LexSpeakerProps) {
  const [dialogue, setDialogue] = useState<{ text: string; audio: string } | null>(null)
  // Lectura en voz alta compartida con <Personaje> (misma voz y configuración).
  const { hablar, detener, hablando: isPlaying } = useVoz(PERSONAJES.lex.voz)

  useEffect(() => {
    // Load dialogue based on context
    const data = dialoguesData[context]
    if (data) {
      setDialogue(data)
    }
  }, [context])

  const handlePlayAudio = (textToSpeak?: string) => {
    if (isPlaying) {
      detener()
      return
    }
    hablar(textToSpeak || dialogue?.text || "")
  }

  if (!dialogue) return null

  return (
    <div className={`flex items-end gap-2 sm:gap-4 ${className}`}>
      {/* Lex Character */}
      <div className={`relative ${variant === "compact" ? "w-16 h-16 sm:w-24 sm:h-24" : "w-20 h-20 sm:w-32 sm:h-32"} flex-shrink-0`}>
        
      </div>

      {/* Speech Bubble */}
      
    </div>
  )
}
