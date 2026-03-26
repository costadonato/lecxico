import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Heart, Target, Users, Lightbulb, BookOpen } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Inclusión",
      description: "Creemos que todos los niños merecen acceso a herramientas educativas de calidad",
    },
    {
      icon: Target,
      title: "Innovación",
      description: "Combinamos neurociencia y tecnología para crear experiencias de aprendizaje únicas",
    },
    {
      icon: Award,
      title: "Excelencia",
      description: "Todos nuestros ejercicios están validados científicamente por expertos",
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Construimos una red de apoyo entre familias, docentes y profesionales",
    },
  ]

  const team = [
    {
      name: "Bautista Stampone",
      role: "Fundador y Director General",
      image: "/images/bautista.png",
      description:
        "Motor creativo y estratégico de Lecxico. Combina su pasión por la tecnología y la educación con la visión de crear herramientas inclusivas que empoderen a los chicos con dislexia.",
    },
    {
      name: "Mónica Chávez",
      role: "Directora Psicopedagógica",
      image: "/images/monica.jpg",
      description:
        "Profesional con amplia experiencia en neuroeducación y diagnóstico de dislexia. Aporta el respaldo técnico y humano necesario para garantizar que Lecxico mantenga una base científica sólida.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Conocé al equipo detrás de <span className="text-primary">Lecxico</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            La primera plataforma argentina que combina, juegos interactivos y pedagogía
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-20">
          <Card className="border-2">
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center p-8">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/lex.png"
                      alt="Lex - Mascota de Lecxico"
                      width={280}
                      height={280}
                      className="mascot-no-bg animate-float"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">¿Por qué nace Lecxico?</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Lecxico nació de una necesidad real: crear herramientas que realmente funcionen para chicos con
                    dislexia en Argentina.
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Vimos que las familias y las escuelas necesitaban apoyo. Que los chicos merecían algo más que
                    ejercicios aburridos. Que la tecnología podía ser un puente, no una barrera.
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-lg font-medium text-foreground">
                    Así nació Lecxico: con el propósito de reducir la brecha educativa y acompañar a cada familia en el
                    camino hacia la confianza lectora.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Nuestro Equipo</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Una visión interdisciplinaria: tecnología + educación + empatía
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {team.map((member) => (
              <Card key={member.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-80 bg-gradient-to-br from-muted/50 to-muted/20">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{member.name}</CardTitle>
                  <CardDescription className="text-lg font-medium text-primary">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Nuestros Valores</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Los pilares que guían cada decisión en Lecxico
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2">
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold">Nuestra Visión de Futuro</h2>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Queremos que Lecxico sea más que una plataforma. Queremos construir una comunidad donde cada chico con
                  dislexia encuentre su lugar, donde las familias se sientan acompañadas y donde las escuelas tengan
                  herramientas reales para la inclusión.
                </p>
                <p className="text-lg md:text-xl font-medium text-foreground max-w-3xl mx-auto leading-relaxed">
                  Nuestro objetivo es impactar en la vida de miles de niños y adolescentes en toda Argentina y
                  Latinoamérica, demostrando que la tecnología con propósito puede transformar la educación.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-2">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Sumate a Nuestra Misión</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Buscamos inversores, colaboradores, psicopedagogos y profesionales apasionados por la educación
                inclusiva. Si creés que la tecnología puede cambiar vidas, este es tu lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/contact">
                  <Button size="lg" className="w-full sm:w-auto">
                    Contactanos
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    Comenzar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="ghost" size="lg">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
