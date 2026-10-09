import { Button } from "@/components/ui/button"
import { Brain, Gamepad2, TrendingUp, Users, Sparkles, Globe, Calculator } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { EncabezadoPublico } from "@/components/encabezado-publico"
import { Flotante, FondoDecorado } from "@/components/fondo-decorado"
import { ItemCascada, ListaCascada, NumeroAnimado } from "@/components/motion"
import { Personaje } from "@/components/personajes/personaje"
import { Resaltado } from "@/components/resaltado"
import { cn } from "@/lib/utils"

const TONOS = {
  rojo: { chip: "bg-rojo-suave text-rojo-fuerte", borde: "hover:border-rojo/40" },
  celeste: { chip: "bg-celeste-suave text-celeste-fuerte", borde: "hover:border-celeste/60" },
  sol: { chip: "bg-sol-suave text-sol-fuerte", borde: "hover:border-sol/70" },
  menta: { chip: "bg-menta-suave text-menta-fuerte", borde: "hover:border-menta/60" },
  lavanda: { chip: "bg-lavanda-suave text-lavanda-fuerte", borde: "hover:border-lavanda/60" },
}

const CARACTERISTICAS: { icono: typeof Brain; tono: keyof typeof TONOS; titulo: string; descripcion: string }[] = [
  {
    icono: Brain,
    tono: "rojo",
    titulo: "Basado en Neurociencia",
    descripcion: "Ejercicios psicopedagógicos validados científicamente para mejorar la fluidez lectora",
  },
  {
    icono: Gamepad2,
    tono: "celeste",
    titulo: "Gamificación",
    descripcion: "Aprende jugando con actividades interactivas y divertidas que mantienen la motivación",
  },
  {
    icono: Users,
    tono: "sol",
    titulo: "Doble Interfaz",
    descripcion: "Modo infantil (6-12 años) y modo adolescente (13-17 años) adaptados a cada edad",
  },
  {
    icono: TrendingUp,
    tono: "menta",
    titulo: "Seguimiento de Progreso",
    descripcion: "Estadísticas detalladas para padres y docentes sobre el avance del estudiante",
  },
  {
    icono: Brain,
    tono: "lavanda",
    titulo: "Ejercicios Personalizados",
    descripcion: "Actividades adaptadas al nivel y ritmo de aprendizaje de cada estudiante",
  },
  {
    icono: Sparkles,
    tono: "rojo",
    titulo: "Mascotas Interactivas",
    descripcion: "Lex y Lumo te acompañan en cada paso de tu aventura de aprendizaje",
  },
  {
    icono: Globe,
    tono: "celeste",
    titulo: "English Adaptado",
    descripcion: "Juegos de inglés con fonética simple y vocabulario básico, diseñados para niños con dislexia",
  },
  {
    icono: Calculator,
    tono: "sol",
    titulo: "Matemáticas Divertidas",
    descripcion: "Juegos de matemáticas con representación visual y conteo interactivo para facilitar el aprendizaje",
  },
]

const JUEGOS = [
  {
    icono: Brain,
    titulo: "Lectura / Dislexia",
    descripcion: "9 juegos interactivos de lectura y comprensión",
    boton: "Ver Juegos de Lectura",
    fondo: "bg-rojo",
    variante: "default" as const,
    claseBoton: "",
  },
  {
    icono: Calculator,
    titulo: "Matemáticas / Discalculia",
    descripcion: "6 juegos de matemáticas con representación visual",
    boton: "Ver Juegos de Matemáticas",
    fondo: "bg-celeste-fuerte",
    variante: "celeste" as const,
    claseBoton: "",
  },
  {
    icono: Globe,
    titulo: "English Adaptado",
    descripcion: "4 games with simple phonics, basic vocabulary, and dyslexia-friendly design",
    boton: "View English Games",
    fondo: "bg-lavanda-fuerte",
    variante: "default" as const,
    claseBoton: "bg-lavanda-fuerte hover:bg-lavanda-fuerte/90",
  },
]

const PASOS = [
  {
    numero: 1,
    titulo: "Regístrate",
    descripcion: "Crea tu perfil personalizado y elige tu modo: infantil o adolescente",
    color: "bg-rojo text-white",
  },
  {
    numero: 2,
    titulo: "Practica",
    descripcion: "Completa ejercicios divertidos adaptados a tu nivel y ritmo de aprendizaje",
    color: "bg-celeste-fuerte text-white",
  },
  {
    numero: 3,
    titulo: "Mejora",
    descripcion: "Observa tu progreso y celebra tus logros con Lex y Lumo",
    color: "bg-sol text-foreground",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="relative isolate">
        <FondoDecorado variante="landing" />
        <EncabezadoPublico />

        {/* Hero */}
        <section className="relative">
          <div className="container mx-auto grid items-center gap-12 px-4 pb-20 pt-10 md:grid-cols-2 md:pb-28 md:pt-16">
            {/* Entrada con CSS (no motion): el título se ve aunque el JavaScript todavía no haya cargado. */}
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <span className="inline-flex items-center gap-2 rounded-full border border-rojo/15 bg-card/80 px-4 py-2 text-sm font-semibold text-rojo-fuerte shadow-suave">
                <BanderaArgentina />
                Primera plataforma argentina
              </span>
              <h1 className="text-balance text-4xl font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
                Aprende a leer de forma{" "}
                <Resaltado color="sol" className="text-primary">
                  divertida
                </Resaltado>{" "}
                y{" "}
                <Resaltado color="celeste" className="text-celeste-fuerte" retraso={0.8}>
                  efectiva
                </Resaltado>
              </h1>
              <p className="max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary">¡Hola! Somos Lex y Lumo</span>, y estamos aquí para
                convertir cada palabra en una aventura. Juntos descubriremos que leer es tu{" "}
                <span className="font-semibold text-celeste-fuerte">superpoder secreto</span>. ¿Listo para comenzar?
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="shadow-brillo-rojo" asChild>
                  <Link href="/register">
                    Comenzar Gratis
                    <Sparkles className="ml-1 size-5" />
                  </Link>
                </Button>
              </div>
              <dl className="grid max-w-md grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center shadow-suave">
                  <dt className="sr-only">Edades</dt>
                  <dd className="text-2xl font-bold text-primary sm:text-3xl">6-17</dd>
                  <dd className="text-sm text-muted-foreground">años</dd>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center shadow-suave">
                  <dt className="sr-only">Base científica</dt>
                  <dd className="text-2xl font-bold text-celeste-fuerte sm:text-3xl">
                    <NumeroAnimado valor={100} sufijo="%" />
                  </dd>
                  <dd className="text-sm text-muted-foreground">Científico</dd>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center shadow-suave">
                  <dt className="sr-only">Modos</dt>
                  <dd className="text-2xl font-bold text-sol-fuerte sm:text-3xl">
                    <NumeroAnimado valor={2} duracion={0.8} />
                  </dd>
                  <dd className="text-sm text-muted-foreground">Modos</dd>
                </div>
              </dl>
            </div>

            {/* Escenario de Lex y Lumo */}
            <div className="relative mx-auto aspect-square w-full max-w-lg">
              <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-sol-suave" />
              <div aria-hidden="true" className="absolute inset-[16%] rounded-full bg-celeste-suave/80" />
              <div aria-hidden="true" className="absolute inset-[6%] rounded-full border-2 border-dashed border-rojo/20" />

              <Personaje
                personaje="lex"
                prioridad
                mensaje="¡Hola! Somos Lex y Lumo"
                ladoGlobo="arriba"
                claseImagen="w-[50%] sm:w-[54%]"
                claseGlobo="text-base sm:text-lg"
                className="absolute inset-x-0 top-[2%] items-start pl-[6%]"
                retraso={0.2}
              />
              <Personaje
                personaje="lumo"
                prioridad
                claseImagen="w-full"
                className="absolute bottom-[2%] right-[2%] w-[38%]"
                retraso={0.5}
              />

              <Flotante className="absolute -right-1 top-[14%] sm:-right-3" duracion={5} amplitud={10}>
                <span className="grid size-16 place-items-center rounded-2xl bg-sol text-foreground shadow-media sm:size-20">
                  <Gamepad2 className="size-8 sm:size-10" />
                </span>
              </Flotante>
              <Flotante className="absolute bottom-[8%] left-0 sm:-left-3" duracion={6} amplitud={10} retraso={1}>
                <span className="grid size-14 place-items-center rounded-2xl bg-celeste-fuerte text-white shadow-media sm:size-16">
                  <Brain className="size-7 sm:size-8" />
                </span>
              </Flotante>
            </div>
          </div>
        </section>
      </div>

      {/* Características */}
      <section id="features" className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">Características que hacen la diferencia</h2>
            <p className="text-pretty text-xl text-muted-foreground">
              Diseñado específicamente para niños y adolescentes con dislexia
            </p>
          </div>
          <ListaCascada enVista className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARACTERISTICAS.map(({ icono: Icono, tono, titulo, descripcion }) => (
              <ItemCascada
                key={titulo}
                elevar
                className={cn(
                  "rounded-3xl border border-border/80 bg-card p-6 shadow-suave transition-colors hover:shadow-media",
                  TONOS[tono].borde,
                )}
              >
                <div className={cn("mb-5 grid size-14 place-items-center rounded-2xl", TONOS[tono].chip)}>
                  <Icono className="size-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{titulo}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{descripcion}</p>
              </ItemCascada>
            ))}
          </ListaCascada>

          {/* Juegos */}
          <div className="mx-auto mt-24 max-w-6xl">
            <h3 className="mb-10 text-center text-3xl font-bold">Explora Nuestros Juegos</h3>
            <ListaCascada enVista className="grid gap-6 md:grid-cols-3">
              {JUEGOS.map(({ icono: Icono, ...j }) => (
                <ItemCascada
                  key={j.titulo}
                  elevar
                  className="flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-media"
                >
                  <div className={cn("relative grid h-36 place-items-center overflow-hidden", j.fondo)}>
                    <span aria-hidden="true" className="absolute -left-6 -top-10 size-32 rounded-full bg-white/15" />
                    <span aria-hidden="true" className="absolute -bottom-12 -right-4 size-36 rounded-full bg-white/10" />
                    <span className="relative grid size-20 place-items-center rounded-3xl bg-white/20 text-white ring-4 ring-white/25">
                      <Icono className="size-10" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
                    <h4 className="text-2xl font-bold">{j.titulo}</h4>
                    <p className="flex-1 text-base leading-relaxed text-muted-foreground">{j.descripcion}</p>
                    <Button className={cn("mt-2", j.claseBoton)} variant={j.variante} asChild>
                      <Link href="/games/catalog">{j.boton}</Link>
                    </Button>
                  </div>
                </ItemCascada>
              ))}
            </ListaCascada>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="how-it-works" className="relative overflow-hidden bg-card/60 py-20">
        <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-70" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">Cómo funciona Lecxico</h2>
            <p className="text-pretty text-xl leading-relaxed text-muted-foreground">
              Tres simples pasos para comenzar tu aventura de lectura
            </p>
          </div>
          <div className="relative mx-auto max-w-5xl">
            <svg
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden h-4 w-[68%] text-border md:block"
              viewBox="0 0 600 16"
              preserveAspectRatio="none"
            >
              <path d="M0 8 H600" stroke="currentColor" strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" />
            </svg>
            <ListaCascada enVista paso={0.15} className="relative grid gap-10 md:grid-cols-3">
              {PASOS.map((p) => (
                <ItemCascada key={p.numero} className="space-y-4 text-center">
                  <div
                    className={cn(
                      "mx-auto grid size-16 place-items-center rounded-full text-2xl font-bold shadow-media ring-8 ring-background",
                      p.color,
                    )}
                  >
                    {p.numero}
                  </div>
                  <h3 className="text-2xl font-bold">{p.titulo}</h3>
                  <p className="mx-auto max-w-xs leading-relaxed text-muted-foreground">{p.descripcion}</p>
                </ItemCascada>
              ))}
            </ListaCascada>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="fondo-rojo relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-6 py-14 shadow-elevada sm:px-12 md:py-16">
          <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-30 invert" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-balance text-3xl font-bold text-white md:text-5xl">
                ¿Listo para comenzar tu aventura de lectura?
              </h2>
              <p className="text-pretty text-xl leading-relaxed text-white/90">
                Únete a Lecxico hoy y descubre una forma nueva y emocionante de aprender a leer
              </p>
              <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row md:justify-start">
                <Button size="lg" variant="claro" asChild>
                  <Link href="/register">
                    Comenzar Gratis
                    <Sparkles className="ml-1 size-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white shadow-none hover:border-white/60 hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <Link href="#about">Conocer Más</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto flex items-end gap-2 md:mx-0">
              <Personaje personaje="lex" claseImagen="w-40 sm:w-52" decorativo sombra={false} />
              <Personaje personaje="lumo" claseImagen="w-28 sm:w-36" decorativo sombra={false} retraso={0.3} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/** Bandera argentina (reemplaza al emoji, que en Windows se ve como "AR"). */
function BanderaArgentina() {
  return (
    <svg viewBox="0 0 18 12" className="h-3.5 w-auto shrink-0 overflow-hidden rounded-[3px] shadow-suave" role="img" aria-label="Argentina">
      <rect width={18} height={12} className="fill-white" />
      <rect width={18} height={4} className="fill-bandera-celeste" />
      <rect y={8} width={18} height={4} className="fill-bandera-celeste" />
      <circle cx={9} cy={6} r={1.3} className="fill-bandera-sol" />
    </svg>
  )
}
