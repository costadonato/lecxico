"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, BookOpen, Brain, Lightbulb, Monitor } from 'lucide-react'
import { cn } from "@/lib/utils"

// Video data with real YouTube IDs (using educational/relevant placeholders where specific ones aren't provided)
const videos = [
  {
    id: "zafiGBrFkRM", // TED-Ed: What is dyslexia?
    title: "¿Qué es la dislexia y cómo identificarla?",
    description: "La dislexia afecta hasta a 1 de cada 5 personas, pero la experiencia de cada una es diferente. En este video explicativo, exploramos los signos tempranos, cómo funciona el cerebro disléxico y por qué es crucial el apoyo temprano para transformar las dificultades en fortalezas.",
    category: "Educación",
    icon: BookOpen,
    duration: "4:30"
  },
  {
    id: "TpnxD8objKU", // Updated with real video ID for exercises
    title: "5 ejercicios diarios para mejorar la lectura",
    description: "Descubre una rutina simple de 5 ejercicios que puedes realizar en casa. Estas actividades están diseñadas para fortalecer la conciencia fonológica, mejorar la fluidez lectora y aumentar la confianza de tu hijo de manera divertida y sin presiones.",
    category: "Consejos",
    icon: Lightbulb,
    duration: "8:15"
  },
  {
    id: "kdtW_t6tdCo", // Updated with real video ID for neuroscience
    title: "La neurociencia detrás del aprendizaje",
    description: "Sumérgete en la ciencia del aprendizaje. Explicamos cómo la plasticidad cerebral permite crear nuevas conexiones neuronales y cómo métodos específicos, como los utilizados en Lecxico, aprovechan esta capacidad para mejorar las habilidades de lectura y escritura.",
    category: "Ciencia",
    icon: Brain,
    duration: "6:45"
  },
  {
    id: "ar8eRkZh0Tk", // Updated with real video ID for advantages
    title: "El don de la dislexia: Ventajas creativas",
    description: "Más allá de los desafíos, la dislexia conlleva habilidades únicas. Descubre por qué muchas personas con dislexia destacan en creatividad, resolución de problemas, empatía y pensamiento tridimensional. Cambiemos la narrativa de la discapacidad a la diferencia.",
    category: "Inspiración",
    icon: Lightbulb,
    duration: "5:20"
  },
  {
    id: "avGK1xtEqdE", // Updated with real video ID for assistive tech
    title: "Herramientas digitales para el éxito escolar",
    description: "Una guía práctica sobre las mejores herramientas tecnológicas disponibles hoy en día. Desde lectores de texto hasta dictado por voz y organizadores visuales, aprende cómo la tecnología puede nivelar el campo de juego en el aula y en casa.",
    category: "Tecnología",
    icon: Monitor,
    duration: "7:10"
  }
]

export function BlogVideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0])

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Video Player Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden border-2 border-primary/10 shadow-xl">
          <div className="aspect-video w-full bg-black relative">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`} 
              title={selectedVideo.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {selectedVideo.category}
              </span>
              <span className="text-muted-foreground text-xs flex items-center gap-1">
                <PlayCircle className="w-3 h-3" /> {selectedVideo.duration}
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl text-primary">{selectedVideo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base md:text-lg leading-relaxed text-foreground/80">
              {selectedVideo.description}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Video List Sidebar */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          Más videos educativos
        </h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {videos.map((video) => {
            const Icon = video.icon
            const isSelected = selectedVideo.id === video.id
            
            return (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]" 
                    : "bg-card hover:bg-accent/50 border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3 relative z-10">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0 transition-colors",
                    isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={cn(
                      "font-semibold text-sm leading-tight line-clamp-2",
                      isSelected ? "text-white" : "text-foreground"
                    )}>
                      {video.title}
                    </h4>
                    <p className={cn(
                      "text-xs",
                      isSelected ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {video.category} • {video.duration}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 z-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
