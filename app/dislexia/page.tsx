import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  ClipboardCheck,
  Gamepad2,
  Heart,
  Home,
  Lightbulb,
  Sparkles,
} from "lucide-react"
import { ChipEnDesarrollo } from "@/components/chip-en-desarrollo"
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

/** Señales acordes a los bloques que evalúa la plataforma. */
const SENALES = [
  "Dificultad para reconocer o separar los sonidos de las palabras",
  "Lectura lenta o con muchos errores para su edad",
  "Dificultad para asociar letras y sonidos",
  "Lentitud para nombrar cosas conocidas, como colores, letras o números",
]

const FORTALEZAS = ["Pensamiento creativo", "Resolución de problemas", "Pensamiento visual", "Actividades artísticas"]

const CARACTERISTICAS_EVALUACION = [
  "La toma un profesional",
  "Consignas con audio",
  "Diseño accesible con contraste claro",
  "Resultados orientativos para el profesional",
]

const COMO_ACOMPANA: { titulo: string; descripcion: string; icono: typeof Brain; enDesarrollo?: boolean }[] = [
  {
    titulo: "Evaluación por bloques",
    descripcion: "El profesional toma la evaluación de indicadores, con un recorrido para cada nivel.",
    icono: ClipboardCheck,
  },
  {
    titulo: "Juegos para practicar",
    descripcion: "Juegos vinculados a los bloques de la evaluación, en tres grados de dificultad.",
    icono: Gamepad2,
    enDesarrollo: true,
  },
  {
    titulo: "Siempre acompañado",
    descripcion: "El niño practica en casa con su tutor y hace las tareas que le asigna el profesional.",
    icono: Home,
    enDesarrollo: true,
  },
  {
    titulo: "Lex y Lumo",
    descripcion: "Acompañan al niño en cada actividad.",
    icono: Heart,
  },
]

export default function DislexiaPage() {
  return (
    <div className="min-h-screen">
      <div className="relative isolate">
        <FondoDecorado variante="landing" />
        <EncabezadoPublico />

        <div className="container mx-auto px-4 py-14 md:py-20">
          {/* Hero (entrada con CSS: se ve aunque el JavaScript no haya cargado) */}
          <div className="mx-auto mb-16 max-w-4xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <span className="mb-6 inline-block rounded-full border border-rojo/15 bg-card/80 px-4 py-2 text-sm font-semibold text-rojo-fuerte shadow-suave">
              Información para familias y profesionales
            </span>
            <h1 className="mb-6 text-balance text-4xl font-bold leading-[1.15] md:text-6xl">
              Entender la dislexia es el primer paso para{" "}
              <Resaltado color="sol" className="whitespace-normal text-primary">
                aprender sin miedo
              </Resaltado>
            </h1>
            <p className="text-pretty text-xl leading-relaxed text-muted-foreground md:text-2xl">
              En Lecxico creemos que todos los niños pueden aprender, cada uno a su manera y con el acompañamiento
              adecuado.
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
                  La dislexia es un trastorno específico del aprendizaje. Afecta la exactitud o la velocidad para leer y
                  escribir palabras.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Persiste aunque el niño reciba una buena enseñanza. No tiene que ver con la inteligencia ni con el
                  esfuerzo. Detectarla y estimular la lectura desde temprano es especialmente eficaz.
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
              Son algunas de las señales que se pueden observar mientras el niño aprende a leer:
            </p>
            <ListaCascada enVista className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SENALES.map((senal, index) => (
                <ItemCascada key={senal} className="flex items-start gap-4 rounded-2xl bg-muted/70 p-4">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-base font-bold", TONOS[index])}>
                    {index + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-foreground">{senal}</p>
                </ItemCascada>
              ))}
            </ListaCascada>
            <p className="mt-4 text-base font-medium text-foreground">
              Estas señales no alcanzan para saber si un niño tiene dislexia: la evaluación la hace un profesional.
            </p>
            <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/25 bg-rojo-suave/50 p-6">
              <p className="text-center text-lg font-medium leading-relaxed text-foreground">
                Si reconocés algunas de estas señales, consultá con un profesional. Cada niño tiene su ritmo: acompañarlo
                sin compararlo lo ayuda a ganar confianza.
              </p>
            </div>
          </section>

          {/* Mucho más que la dislexia */}
          <section className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-[2rem] border border-border/80 bg-menta-suave p-6 shadow-suave md:p-10">
            <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-sol/30 blur-2xl" />
            <div className="relative mb-2 flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-menta-fuerte shadow-suave">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">Mucho más que la dislexia</h2>
            </div>
            <p className="relative mb-6 text-base text-muted-foreground">
              Muchas personas con dislexia se destacan en otras áreas, y conviene reconocer esas fortalezas. Pueden
              destacarse en:
            </p>
            <ListaCascada enVista className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
              {FORTALEZAS.map((fortaleza) => (
                <ItemCascada
                  key={fortaleza}
                  elevar
                  className="flex items-center gap-3 rounded-2xl border border-menta/30 bg-card p-4 shadow-suave"
                >
                  <CheckCircle className="size-6 shrink-0 text-menta-fuerte" />
                  <p className="font-medium leading-relaxed text-foreground">{fortaleza}</p>
                </ItemCascada>
              ))}
            </ListaCascada>
          </section>

          {/* Cómo es la evaluación */}
          <section className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-card p-8 shadow-elevada md:p-12">
            <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-50" />
            <div className="relative space-y-6 text-center">
              <div className="mx-auto grid size-24 place-items-center rounded-[1.75rem] bg-pantalla shadow-brillo-celeste">
                <LumoCara estado="feliz" tamano={80} />
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">Cómo es la evaluación en Lecxico</h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Lecxico ofrece una evaluación de indicadores de dislexia. La toma un profesional, con el niño frente a la
                pantalla.
              </p>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Tiene dos niveles: pre-lectores (sala de 4 y 5) y primeros lectores (1.º a 3.er grado). Se organiza por
                bloques de habilidades y las consignas tienen audio.
              </p>
              <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background/80 p-6 text-left">
                <p className="mb-4 text-base leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Importante:</strong> esta evaluación no reemplaza un diagnóstico
                  profesional. Los resultados los ve el profesional y son orientativos.
                </p>
                <ul className="grid gap-2 text-base text-muted-foreground sm:grid-cols-2">
                  {CARACTERISTICAS_EVALUACION.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="mt-1 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="lg" className="mt-2 h-auto min-h-13 w-full whitespace-normal py-3 shadow-brillo-rojo sm:w-auto" asChild>
                <Link href="/register">
                  Crear cuenta de profesional
                  <ArrowRight className="ml-1 size-5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Cómo acompaña Lecxico */}
          <section className="mx-auto mb-12 max-w-6xl">
            <div className="mb-12 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sol-suave text-sol-fuerte">
                  <Lightbulb className="size-6" />
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">Cómo acompaña Lecxico</h2>
              </div>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
                Lecxico es una plataforma para profesionales. Las funciones marcadas “En desarrollo” todavía no están
                disponibles.
              </p>
            </div>

            <ListaCascada enVista className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {COMO_ACOMPANA.map(({ titulo, descripcion, icono: Icono, enDesarrollo }, index) => (
                <ItemCascada
                  key={titulo}
                  elevar
                  className="rounded-3xl border border-border/80 bg-card p-6 shadow-suave transition-shadow hover:shadow-media"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", TONOS[index])}>
                      <Icono className="size-7" />
                    </div>
                    {enDesarrollo && <ChipEnDesarrollo />}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{titulo}</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{descripcion}</p>
                </ItemCascada>
              ))}
            </ListaCascada>

            <div className="mt-8 rounded-3xl border-2 border-dashed border-celeste/50 bg-celeste-suave/70 p-6">
              <p className="text-center text-lg leading-relaxed text-foreground">
                <strong>Lecxico es para niños de 4 a 8 años.</strong> Busca ayudarlos a mejorar la lectura y, sobre todo,{" "}
                <strong className="text-primary">la confianza</strong>.
              </p>
            </div>
          </section>

          {/* CTA final */}
          <section className="fondo-rojo relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] px-6 py-12 shadow-elevada sm:px-12">
            <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-30 invert" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div className="space-y-6 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  ¿Trabajás con niños que están aprendiendo a leer?
                </h2>
                <p className="text-lg leading-relaxed text-white/90">
                  Creá tu cuenta de profesional y tomá la evaluación de indicadores con los niños que acompañás.
                </p>
                <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row md:justify-start">
                  <Button size="lg" variant="claro" className="w-full sm:w-auto" asChild>
                    <Link href="/register">
                      Crear cuenta
                      <Sparkles className="ml-1 size-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/40 bg-white/10 text-white shadow-none hover:border-white/60 hover:bg-white/20 hover:text-white sm:w-auto"
                    asChild
                  >
                    <Link href="/#how-it-works">Cómo funciona</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto flex items-end gap-2 md:mx-0">
                <Personaje personaje="lumo" claseImagen="w-28 sm:w-32" decorativo sombra={false} animacion="saludar" />
              </div>
            </div>
          </section>

          {/* Fuentes */}
          <p className="mx-auto mt-12 max-w-5xl text-center text-sm text-muted-foreground">
            Fuentes: International Dyslexia Association (2025);{" "}
            <a
              href="https://disfam.org/dislexia/definicion/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-medium text-foreground underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              DISFAM
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            .
          </p>

          <div className="mt-6 text-center">
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
