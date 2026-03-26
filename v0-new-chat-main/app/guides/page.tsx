import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Download, Video } from "lucide-react"

export default function GuidesPage() {
  const guides = [
    {
      title: "Guía para Padres: Primeros Pasos",
      description: "Todo lo que necesitas saber para comenzar a usar Lecxico con tu hijo",
      icon: BookOpen,
      type: "PDF",
    },
    {
      title: "Video Tutorial: Configuración de Perfil",
      description: "Aprende a configurar el perfil de tu hijo en 5 minutos",
      icon: Video,
      type: "Video",
    },
    {
      title: "Guía de Ejercicios por Edad",
      description: "Recomendaciones de ejercicios según la edad y nivel de tu hijo",
      icon: BookOpen,
      type: "PDF",
    },
    {
      title: "Manual para Docentes",
      description: "Cómo integrar Lecxico en el aula y hacer seguimiento grupal",
      icon: BookOpen,
      type: "PDF",
    },
    {
      title: "Video: Interpretando las Estadísticas",
      description: "Entiende el progreso de tu hijo a través de los reportes",
      icon: Video,
      type: "Video",
    },
    {
      title: "Guía de Motivación y Recompensas",
      description: "Estrategias para mantener a tu hijo motivado en su aprendizaje",
      icon: BookOpen,
      type: "PDF",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Guías y <span className="text-primary">Recursos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Materiales descargables para aprovechar al máximo Lecxico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {guides.map((guide) => {
            const Icon = guide.icon
            return (
              <Card key={guide.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar {guide.type}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
