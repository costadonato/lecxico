import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Heart, Lightbulb, Sparkles, CheckCircle, ArrowRight, BookOpen } from "lucide-react"
import { EncabezadoPublico } from "@/components/encabezado-publico"
import { Footer } from "@/components/footer"
import { FondoDecorado } from "@/components/fondo-decorado"
import { ItemCascada, ListaCascada } from "@/components/motion"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { Personaje } from "@/components/personajes/personaje"
import { Resaltado } from "@/components/resaltado"
import { cn } from "@/lib/utils"

const TONOS = [
  "bg-rojo-suave text-rojo-fuerte",
  "bg-celeste-suave text-celeste-fuerte",
  "bg-sol-suave text-sol-fuerte",
  "bg-lavanda-suave text-lavanda-fuerte",
]

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
    <div className="min-h-screen">
      <div className="relative isolate">
        <FondoDecorado variante="landing" />
        <EncabezadoPublico />

        <div className="container mx-auto px-4 py-14 md:py-20">
          {/* Hero (entrada con CSS: se ve aunque el JavaScript no haya cargado) */}
          <div className="mx-auto mb-16 max-w-4xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <span className="mb-6 inline-block rounded-full border border-rojo/15 bg-card/80 px-4 py-2 text-sm font-semibold text-rojo-fuerte shadow-suave">
              Información para vos y tu familia
            </span>
            <h1 className="mb-6 text-balance text-4xl font-bold leading-[1.15] md:text-6xl">
              Entender la dislexia es el primer paso para{" "}
              <Resaltado color="sol" className="whitespace-normal text-primary">
                aprender sin miedo
              </Resaltado>
            </h1>
            <p className="text-pretty text-xl leading-relaxed text-muted-foreground md:text-2xl">
              En Lecxico creemos que todos podemos aprender, solo necesitamos hacerlo a nuestra manera.
            </p>
          </div>

          {/* ¿Qué es la dislexia? */}
          <section className="mx-auto mb-12 max-w-5xl overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-media">
            <div className="grid grid-cols-1 items-center gap-0 md:grid-cols-2">
              <div className="relative flex h-80 items-center justify-center overflow-hidden bg-sol-suave md:h-full md:min-h-[26rem]">
                <div aria-hidden="true" className="absolute size-72 rounded-full bg-celeste-suave" />
                <div aria-hidden="true" className="absolute size-80 rounded-full border-2 border-dashed border-rojo/20" />
                <Personaje personaje="lex" claseImagen="w-44 md:w-56" decorativo={false} />
              </div>
              <div className="space-y-6 p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rojo-suave text-rojo-fuerte">
                    <Brain className="size-6" />
                  </div>
                  <h2 className="text-3xl font-bold">¿Qué es la dislexia?</h2>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  La dislexia es una forma diferente de procesar la lectura y el lenguaje. No tiene nada que ver con la
                  inteligencia.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Simplemente significa que tu cerebro aprende de manera única y especial. Como cuando algunos chicos son
                  mejores en deportes y otros en arte: cada uno tiene su propio estilo.
                </p>
                <div className="rounded-2xl border-l-4 border-celeste bg-celeste-suave p-4">
                  <p className="font-medium leading-relaxed text-foreground">
                    Con práctica, comprensión y las herramientas correctas, todos pueden aprender a leer y disfrutar de la
                    lectura.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Algunas señales comunes */}
          <section className="mx-auto mb-12 max-w-5xl rounded-[2rem] border border-border/80 bg-card p-6 shadow-suave md:p-10">
            <div className="mb-2 flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-celeste-suave text-celeste-fuerte">
                <BookOpen className="size-5" />
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">Algunas señales comunes</h2>
            </div>
            <p className="mb-6 text-base text-muted-foreground">
              Estas cosas son normales y hay formas divertidas de trabajarlas:
            </p>
            <ListaCascada enVista className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {caracteristicas.map((caracteristica, index) => (
                <ItemCascada key={index} className="flex items-start gap-4 rounded-2xl bg-muted/70 p-4">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-base font-bold", TONOS[index])}>
                    {index + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-foreground">{caracteristica}</p>
                </ItemCascada>
              ))}
            </ListaCascada>
            <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/25 bg-rojo-suave/50 p-6">
              <p className="text-center text-lg font-medium leading-relaxed text-foreground">
                Este espacio está pensado para vos, para que aprendas sin compararte y descubras que leer puede ser
                divertido.
              </p>
            </div>
          </section>

          {/* Superpoderes */}
          <section className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-[2rem] border border-border/80 bg-menta-suave p-6 shadow-suave md:p-10">
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-sol/30 blur-2xl" />
            <div className="relative mb-2 flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-menta-fuerte shadow-suave">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">Tus superpoderes únicos</h2>
            </div>
            <p className="relative mb-6 text-base text-muted-foreground">
              Las personas con dislexia tienen habilidades increíbles que las hacen especiales:
            </p>
            <ListaCascada enVista className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
              {fortalezas.map((fortaleza, index) => (
                <ItemCascada
                  key={index}
                  elevar
                  className="flex items-center gap-3 rounded-2xl border border-menta/30 bg-card p-4 shadow-suave"
                >
                  <CheckCircle className="size-6 shrink-0 text-menta-fuerte" />
                  <p className="font-medium leading-relaxed text-foreground">{fortaleza}</p>
                </ItemCascada>
              ))}
            </ListaCascada>
          </section>

          {/* Evaluación destacada */}
          <section className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-card p-8 shadow-elevada md:p-12">
            <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-50" />
            <div className="relative space-y-6 text-center">
              <div className="mx-auto grid size-24 place-items-center rounded-[1.75rem] bg-pantalla shadow-brillo-celeste">
                <LumoCara estado="feliz" tamano={80} />
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">Descubrí tu forma de aprender</h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Lecxico ofrece una evaluación de indicadores de dislexia para detectar señales de dislexia y conocer tu
                estilo de aprendizaje único.
              </p>
              <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background/80 p-6 text-left">
                <p className="mb-4 text-base leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Importante:</strong> Esta evaluación no reemplaza un diagnóstico
                  profesional, pero te puede ayudar a entender mejor cómo aprendés y qué herramientas pueden ayudarte más.
                </p>
                <ul className="grid gap-2 text-base text-muted-foreground sm:grid-cols-2">
                  {[
                    "Evaluación interactiva y fácil de hacer",
                    "Lectura por voz disponible",
                    "Diseño accesible con contraste claro",
                    "Resultados inmediatos y personalizados",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="mt-1 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="lg" className="mt-2 shadow-brillo-rojo" asChild>
                <Link href="/test-dislexia">
                  Hacer la evaluación ahora
                  <ArrowRight className="ml-1 size-5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Cómo ayuda Lecxico */}
          <section className="mx-auto mb-12 max-w-6xl">
            <div className="mb-12 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sol-suave text-sol-fuerte">
                  <Lightbulb className="size-6" />
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">Cómo te ayuda Lecxico</h2>
              </div>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
                Lecxico combina juegos educativos, ejercicios interactivos y seguimiento psicopedagógico para que aprender a
                leer sea divertido y efectivo.
              </p>
            </div>

            <ListaCascada enVista className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {comoAyuda.map((item, index) => {
                const Icon = item.icon
                return (
                  <ItemCascada
                    key={index}
                    elevar
                    className="rounded-3xl border border-border/80 bg-card p-6 shadow-suave transition-shadow hover:shadow-media"
                  >
                    <div className={cn("mb-4 grid size-14 place-items-center rounded-2xl", TONOS[index])}>
                      <Icon className="size-7" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{item.description}</p>
                  </ItemCascada>
                )
              })}
            </ListaCascada>

            <div className="mt-8 rounded-3xl border-2 border-dashed border-celeste/50 bg-celeste-suave/70 p-6">
              <p className="text-center text-lg leading-relaxed text-foreground">
                <strong>Lecxico se adapta a cada niño y adolescente</strong>, ayudando a mejorar la fluidez lectora, la
                comprensión y, lo más importante, <strong className="text-primary">la confianza</strong>.
              </p>
            </div>
          </section>

          {/* CTA final */}
          <section className="fondo-rojo relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] px-6 py-12 shadow-elevada sm:px-12">
            <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-30 invert" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div className="space-y-6 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white md:text-4xl">¿Listo para comenzar tu aventura?</h2>
                <p className="text-lg leading-relaxed text-white/90">
                  Únete a Lecxico hoy y descubre que leer puede ser tu superpoder. Lex y Lumo te están esperando.
                </p>
                <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row md:justify-start">
                  <Button size="lg" variant="claro" className="w-full sm:w-auto" asChild>
                    <Link href="https://lecxico.vercel.app">
                      Probar Lecxico
                      <Sparkles className="ml-1 size-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/40 bg-white/10 text-white shadow-none hover:border-white/60 hover:bg-white/20 hover:text-white sm:w-auto"
                    asChild
                  >
                    <Link href="/contact">Hablar con un experto</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto flex items-end gap-2 md:mx-0">
                <Personaje personaje="lumo" claseImagen="w-28 sm:w-32" decorativo sombra={false} animacion="saludar" />
              </div>
            </div>
          </section>

          <div className="mt-12 text-center">
            <Button variant="ghost" size="lg" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
