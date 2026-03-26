"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Play, MessageCircle, X } from 'lucide-react'
import dialoguesData from "@/lib/lex-dialogues.json"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type DialogueKey = keyof typeof dialoguesData

interface LexSpeakerProps {
  context: DialogueKey
  className?: string
  variant?: "default" | "compact"
  showTalkButton?: boolean
}

export function LexSpeaker({ context, className = "", variant = "default", showTalkButton = false }: LexSpeakerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [dialogue, setDialogue] = useState<{ text: string; audio: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Load dialogue based on context
    const data = dialoguesData[context]
    if (data) {
      setDialogue(data)
    }
    
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [context])

  const handlePlayAudio = (textToSpeak?: string) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    const text = textToSpeak || dialogue?.text || ""
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Configure voice (try to find a Spanish female/child-like voice)
    const voices = synthRef.current.getVoices()
    const spanishVoice = voices.find(voice => voice.lang.includes('es') && (voice.name.includes('Google') || voice.name.includes('Monica')))
    if (spanishVoice) {
      utterance.voice = spanishVoice
    }
    
    utterance.pitch = 1.2 // Slightly higher pitch for child-like effect
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.lang = 'es-ES'

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
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
