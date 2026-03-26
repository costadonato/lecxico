import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Headphones, PlayCircle } from 'lucide-react'
import { BlogVideoGallery } from "@/components/blog-video-gallery"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog de <span className="text-primary">Lecxico</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recursos educativos, videos y podcasts para acompañar el aprendizaje
          </p>
        </div>

        {/* Podcast Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary/5 p-8 flex items-center justify-center md:border-r border-primary/10">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                    <Headphones className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-xl">Podcast Lecxico</h3>
                  <p className="text-sm text-muted-foreground">En colaboración con la Universidad Católica de Córdoba</p>
                </div>
              </div>
              <div className="md:col-span-2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                  <span className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold tracking-wider">NUEVO EPISODIO</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Cómo superar el desafío de la dislexia       </h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Bautista Stampone comparte su camino con la dislexia y cómo esa experiencia lo llevó a crear Lecxico. Junto a Melisa Spilman, psicopedagoga, reflexionan sobre aprender distinto y acompañar mejor. Una charla simple, cercana y llena de herramientas prácticas.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="https://open.spotify.com/episode/6eAOhEM2OqccrrbFSTqh7z?si=97fd1524065b4fc6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white border-none h-12 px-6 text-base shadow-md hover:shadow-lg transition-all">
                      <PlayCircle className="w-6 h-6" />
                      Escuchar en Spotify
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Video Gallery Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-bold">Videoteca Educativa</h2>
          </div>
          
          <BlogVideoGallery />
        </div>

        <div className="text-center mt-16">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
