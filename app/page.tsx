import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Gamepad2, TrendingUp, Users, Sparkles, Globe, Calculator } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Lecxico - Inicio">
            <Image
              src="/images/design-mode/Captura%20de%20pantalla%202025-10-03%20203159.png"
              alt="Lecxico"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Navegación principal">
            <Link
              href="#how-it-works"
              className="text-foreground/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Conocer cómo funciona Lecxico"
            >
              Cómo Funciona
            </Link>
            <Link
              href="/dislexia"
              className="text-foreground/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Información sobre dislexia"
            >
              Sobre la Dislexia
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  🇦🇷 Primera plataforma argentina
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                Aprende a leer de forma <span className="text-primary">divertida</span> y{" "}
                <span className="text-accent">efectiva</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                <span className="font-semibold text-primary">¡Hola! Somos Lex y Lumo</span>, y estamos aquí para
                convertir cada palabra en una aventura. Juntos descubriremos que leer es tu{" "}
                <span className="font-semibold text-accent">superpoder secreto</span>. ¿Listo para comenzar?
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg" asChild>
                  <Link href="/register">
                    Comenzar Gratis
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">6-17</div>
                  <div className="text-sm text-muted-foreground">años</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">100%</div>
                  <div className="text-sm text-muted-foreground">Científico</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">2</div>
                  <div className="text-sm text-muted-foreground">Modos</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Lex Character - Main Hero */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/images/lex.png"
                    alt="Lex, un niño superhéroe con traje rojo y capa blanca, mascota oficial de Lecxico que te guía en tu aventura de lectura"
                    className="w-full h-full object-contain drop-shadow-2xl animate-float mascot-image"
                    loading="eager"
                  />
                </div>
                {/* Lumo Character - Supporting */}
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-end justify-end">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_jme4kgjme4kgjme4%20%281%29-8y5xhjNZmj69uQ4VtGZxVGojE68AEW.png"
                    alt="Lumo, un robot amigable con mochila roja y pantalla interactiva, compañero tecnológico de Lex en Lecxico"
                    className="w-full h-full object-contain drop-shadow-xl animate-float-delayed mascot-image"
                    loading="eager"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent rounded-2xl shadow-lg flex items-center justify-center animate-bounce-slow">
                  <Gamepad2 className="w-12 h-12 text-accent-foreground" />
                </div>
                <div
                  className="absolute -bottom-4 -left-4 w-20 h-20 bg-secondary rounded-2xl shadow-lg flex items-center justify-center animate-bounce-slow"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Brain className="w-10 h-10 text-secondary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Características que hacen la diferencia
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Diseñado específicamente para niños y adolescentes con dislexia
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Basado en Neurociencia</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Ejercicios psicopedagógicos validados científicamente para mejorar la fluidez lectora
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Gamificación</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Aprende jugando con actividades interactivas y divertidas que mantienen la motivación
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Doble Interfaz</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Modo infantil (6-12 años) y modo adolescente (13-17 años) adaptados a cada edad
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Seguimiento de Progreso</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Estadísticas detalladas para padres y docentes sobre el avance del estudiante
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Ejercicios Personalizados</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Actividades adaptadas al nivel y ritmo de aprendizaje de cada estudiante
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Mascotas Interactivas</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Lex y Lumo te acompañan en cada paso de tu aventura de aprendizaje
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">English Adaptado</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Juegos de inglés con fonética simple y vocabulario básico, diseñados para niños con dislexia
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Matemáticas Divertidas</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Juegos de matemáticas con representación visual y conteo interactivo para facilitar el aprendizaje
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-16 max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">Explora Nuestros Juegos</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
                <CardHeader className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Brain className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Lectura / Dislexia</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    9 juegos interactivos de lectura y comprensión 
                  </CardDescription>
                  <Button className="mt-4" asChild>
                    <Link href="/games/catalog">Ver Juegos de Lectura</Link>
                  </Button>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-blue-600 transition-all hover:shadow-lg">
                <CardHeader className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Calculator className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Matemáticas / Discalculia</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                     6 juegos de matemáticas con representación visual
                  </CardDescription>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/games/catalog">Ver Juegos de Matemáticas</Link>
                  </Button>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-purple-600 transition-all hover:shadow-lg">
                <CardHeader className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">English Adaptado</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    4 games with simple phonics, basic vocabulary, and dyslexia-friendly design
                  </CardDescription>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href="/games/catalog">View English Games</Link>
                  </Button>
                </CardHeader>
              </Card>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">Cómo funciona Lecxico</h2>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Tres simples pasos para comenzar tu aventura de lectura
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-2xl font-bold">Regístrate</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crea tu perfil personalizado y elige tu modo: infantil o adolescente
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold text-accent-foreground">
                2
              </div>
              <h3 className="text-2xl font-bold">Practica</h3>
              <p className="text-muted-foreground leading-relaxed">
                Completa ejercicios divertidos adaptados a tu nivel y ritmo de aprendizaje
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold text-secondary-foreground">
                3
              </div>
              <h3 className="text-2xl font-bold">Mejora</h3>
              <p className="text-muted-foreground leading-relaxed">
                Observa tu progreso y celebra tus logros con Lex y Lumo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground text-balance">
              ¿Listo para comenzar tu aventura de lectura?
            </h2>
            <p className="text-xl text-primary-foreground/90 text-pretty leading-relaxed">
              Únete a Lecxico hoy y descubre una forma nueva y emocionante de aprender a leer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <Link href="/register">
                  Comenzar Gratis
                  <Sparkles className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                asChild
              >
                <Link href="#about">Conocer Más</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
