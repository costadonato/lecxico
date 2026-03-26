import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Heart, Lightbulb, Sparkles, CheckCircle, ArrowRight, BookOpen } from "lucide-react"
import Image from "next/image"

export default function DislexiaPage() {
  const caracteristicas = [
    "Las letras pueden confundirse (b/d, p/q)",
    "Las palabras se pueden mezclar o moverse",
    "La lectura puede ser más lenta",
    "A veces cuesta seguir el renglón",
  ]

  const fortalezas = [
    "Pensamiento creativo único",
    "Gran capacidad de resolución de problemas",
    "Excelente memoria visual",
    "Habilidades artísticas desarrolladas",
  ]

  const comoAyuda = [
    {
      title: "Juegos interactivos",
      description: "Aprende jugando con ejercicios divertidos que hacen que la lectura sea una aventura",
      icon: Sparkles,
    },
    {
      title: "Ejercicios personalizados",
      description: "Actividades adaptadas a tu ritmo y nivel, sin presiones ni comparaciones",
      icon: Heart,
    },
    {
      title: "Seguimiento profesional",
      description: "Respaldo psicopedagógico científicamente validado para garantizar tu progreso",
      icon: Brain,
    },
    {
      title: "Acompañamiento constante",
      description: "Lex y Lumo están con vos en cada paso, celebrando cada logro",
      icon: Lightbulb,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              Información para vos y tu familia
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            Entender la dislexia es el primer paso para <span className="text-primary">aprender sin miedo</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed">
            En Lecxico creemos que todos podemos aprender, solo necesitamos hacerlo a nuestra manera.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="border-2 overflow-hidden">
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center p-8">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/lex.png"
                      alt="Lex - Tu compañero en el aprendizaje"
                      width={280}
                      height={280}
                      className="mascot-no-bg animate-float"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">¿Qué es la dislexia?</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    La dislexia es una forma diferente de procesar la lectura y el lenguaje. No tiene nada que ver con
                    la inteligencia.
                  </p>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Simplemente significa que tu cerebro aprende de manera única y especial. Como cuando algunos chicos
                    son mejores en deportes y otros en arte: cada uno tiene su propio estilo.
                  </p>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
                    <p className="text-foreground font-medium leading-relaxed">
                      Con práctica, comprensión y las herramientas correctas, todos pueden aprender a leer y disfrutar
                      de la lectura.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Características Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Algunas señales comunes</CardTitle>
              </div>
              <CardDescription className="text-base">
                Estas cosas son normales y hay formas divertidas de trabajarlas:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caracteristicas.map((caracteristica, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-foreground leading-relaxed">{caracteristica}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
                <p className="text-center text-foreground font-medium text-lg leading-relaxed">
                  Este espacio está pensado para vos, para que aprendas sin compararte y descubras que leer puede ser
                  divertido.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fortalezas Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="border-2 bg-gradient-to-br from-accent/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Tus superpoderes únicos</CardTitle>
              </div>
              <CardDescription className="text-base">
                Las personas con dislexia tienen habilidades increíbles que las hacen especiales:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fortalezas.map((fortaleza, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                    <p className="text-foreground font-medium leading-relaxed">{fortaleza}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Section - Destacado */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="border-4 border-primary bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                  <Heart className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Descubrí tu forma de aprender</h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Lecxico ofrece un test inicial para detectar señales de dislexia y conocer tu estilo de aprendizaje
                  único.
                </p>
                <div className="bg-card/80 p-6 rounded-lg border-2 max-w-2xl mx-auto">
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">
                    <strong className="text-foreground">Importante:</strong> Este test no reemplaza una evaluación
                    profesional, pero te puede ayudar a entender mejor cómo aprendés y qué herramientas pueden ayudarte
                    más.
                  </p>
                  <ul className="text-left space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Test interactivo y fácil de hacer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Lectura por voz disponible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Diseño accesible con contraste claro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Resultados inmediatos y personalizados</span>
                    </li>
                  </ul>
                </div>
                <Button size="lg" className="text-lg mt-4" asChild>
                  <Link href="/test-dislexia">
                    Hacer el test ahora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cómo ayuda Lecxico */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Cómo te ayuda Lecxico</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Lecxico combina juegos educativos, ejercicios interactivos y seguimiento psicopedagógico para que aprender
              a leer sea divertido y efectivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comoAyuda.map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20">
            <p className="text-center text-foreground text-lg leading-relaxed">
              <strong>Lecxico se adapta a cada niño y adolescente</strong>, ayudando a mejorar la fluidez lectora, la
              comprensión y, lo más importante, <strong className="text-primary">la confianza</strong>.
            </p>
          </div>
        </div>

        {/* CTA Final */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-accent border-0 text-primary-foreground">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">¿Listo para comenzar tu aventura?</h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                Únete a Lecxico hoy y descubre que leer puede ser tu superpoder. Lex y Lumo te están esperando.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg" asChild>
                  <Link href="https://lecxico.vercel.app">
                    Probar Lecxico
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 text-lg"
                  asChild
                >
                  <Link href="/contact">Hablar con un experto</Link>
                </Button>
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
