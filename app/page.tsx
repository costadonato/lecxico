import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Brain,
  Check,
  ClipboardCheck,
  Gamepad2,
  GraduationCap,
  Home,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { EncabezadoPublico } from "@/components/encabezado-publico"
import { Flotante, FondoDecorado } from "@/components/fondo-decorado"
import { ItemCascada, ListaCascada, NumeroAnimado } from "@/components/motion"
import { Personaje } from "@/components/personajes/personaje"
import { Resaltado } from "@/components/resaltado"
import { BLOQUE_NOMBRES, BLOQUES_POR_NIVEL, type Nivel } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

const TONOS = {
  rojo: { chip: "bg-rojo-suave text-rojo-fuerte", borde: "hover:border-rojo/40" },
  celeste: { chip: "bg-celeste-suave text-celeste-fuerte", borde: "hover:border-celeste/60" },
  sol: { chip: "bg-sol-suave text-sol-fuerte", borde: "hover:border-sol/70" },
  menta: { chip: "bg-menta-suave text-menta-fuerte", borde: "hover:border-menta/60" },
  lavanda: { chip: "bg-lavanda-suave text-lavanda-fuerte", borde: "hover:border-lavanda/60" },
}

/** Cantidad de bloques distintos entre los dos niveles (se actualiza sola). */
const TOTAL_BLOQUES = new Set(Object.values(BLOQUES_POR_NIVEL).flat()).size

const CARACTERISTICAS: {
  icono: typeof Brain
  tono: keyof typeof TONOS
  titulo: string
  descripcion: string
  enDesarrollo?: boolean
}[] = [
  {
    icono: ClipboardCheck,
    tono: "rojo",
    titulo: "Evaluación por bloques",
    descripcion: "El profesional toma la evaluación de indicadores, con un recorrido para cada nivel.",
  },
  {
    icono: BarChart3,
    tono: "celeste",
    titulo: "Franjas orientativas",
    descripcion: "Los resultados se ubican en franjas y orientan una recomendación. No son un diagnóstico.",
    enDesarrollo: true,
  },
  {
    icono: Gamepad2,
    tono: "sol",
    titulo: "Entrenamiento con juegos",
    descripcion: "Juegos vinculados a los bloques, en 3 grados de dificultad.",
    enDesarrollo: true,
  },
  {
    icono: Home,
    tono: "menta",
    titulo: "Práctica en casa",
    descripcion: "El niño practica con su tutor o con las tareas que le asigna el profesional.",
    enDesarrollo: true,
  },
  {
    icono: Users,
    tono: "lavanda",
    titulo: "Seguimiento compartido",
    descripcion: "Los profesionales que el tutor autoriza ven el progreso. El tutor puede pedir un informe.",
    enDesarrollo: true,
  },
  {
    icono: ShieldCheck,
    tono: "rojo",
    titulo: "Consentimiento del tutor",
    descripcion: "El tutor da su consentimiento al crear la cuenta del niño. Solo se accede con un vínculo aceptado.",
  },
  {
    icono: GraduationCap,
    tono: "celeste",
    titulo: "Revisado con especialistas",
    descripcion: "Los ejercicios se revisan con especialistas en psicopedagogía.",
  },
  {
    icono: Sparkles,
    tono: "sol",
    titulo: "Lex y Lumo",
    descripcion: "Lex y Lumo acompañan al niño en cada actividad.",
  },
]

const NIVELES: {
  nivel: Nivel
  titulo: string
  edad: string
  icono: typeof Brain
  fondo: string
  tono: keyof typeof TONOS
}[] = [
  {
    nivel: "inicial",
    titulo: "Pre-lectores",
    edad: "Sala de 4 y Sala de 5",
    icono: Sparkles,
    fondo: "bg-rojo",
    tono: "rojo",
  },
  {
    nivel: "primario",
    titulo: "Primeros lectores",
    edad: "1.º a 3.er grado",
    icono: GraduationCap,
    fondo: "bg-celeste-fuerte",
    tono: "celeste",
  },
]

const PASOS = [
  {
    numero: 1,
    titulo: "Registro y vínculo",
    descripcion: "El profesional crea su cuenta y pide el vínculo con el niño.",
    color: "bg-rojo text-white",
  },
  {
    numero: 2,
    titulo: "Acepta el tutor",
    descripcion: "El tutor acepta el vínculo. Su consentimiento se da al crear la cuenta del niño.",
    color: "bg-celeste-fuerte text-white",
  },
  {
    numero: 3,
    titulo: "Evaluación",
    descripcion: "El profesional toma la evaluación por bloques, según el nivel del niño.",
    color: "bg-sol text-foreground",
  },
  {
    numero: 4,
    titulo: "Recomendación y práctica",
    descripcion: "Los resultados orientan un entrenamiento. El niño practica siempre acompañado.",
    color: "bg-menta-fuerte text-white",
    enDesarrollo: true,
  },
  {
    numero: 5,
    titulo: "Seguimiento",
    descripcion: "Los profesionales autorizados por el tutor siguen el progreso del niño.",
    color: "bg-lavanda-fuerte text-white",
    enDesarrollo: true,
  },
]

function ChipEnDesarrollo({ className }: { className?: string }) {
  return (
    <Badge variant="sol" className={cn("px-2.5 py-1 text-xs", className)}>
      En desarrollo
    </Badge>
  )
}

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
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-rojo/15 bg-card/80 px-4 py-2 text-sm font-semibold text-rojo-fuerte shadow-suave">
                <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
                Trabajo Final · Ingeniería en Informática · UNCa
              </span>
              <h1 className="text-balance text-4xl font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
                Evaluar{" "}
                <Resaltado color="sol" className="text-primary">
                  indicadores
                </Resaltado>{" "}
                de dislexia y{" "}
                <Resaltado color="celeste" className="text-celeste-fuerte" retraso={0.8}>
                  acompañar
                </Resaltado>{" "}
                el aprendizaje lector
              </h1>
              <p className="max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground">
                Una plataforma para profesionales que trabajan con niños de 4 a 8 años. Evaluación por bloques,
                entrenamiento guiado por los resultados y seguimiento compartido.{" "}
                <span className="font-semibold text-primary">Lex y Lumo</span> acompañan al niño.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="shadow-brillo-rojo" asChild>
                  <Link href="/register">Crear cuenta</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              </div>
              <dl className="grid max-w-md grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center shadow-suave">
                  <dt className="sr-only">Edades</dt>
                  <dd className="text-2xl font-bold text-primary sm:text-3xl">4 a 8</dd>
                  <dd className="text-sm text-muted-foreground">años</dd>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center shadow-suave">
                  <dt className="sr-only">Niveles</dt>
                  <dd className="text-2xl font-bold text-celeste-fuerte sm:text-3xl">
                    <NumeroAnimado valor={Object.keys(BLOQUES_POR_NIVEL).length} duracion={0.8} />
                  </dd>
                  <dd className="text-sm text-muted-foreground">niveles</dd>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3 text-center shadow-suave">
                  <dt className="sr-only">Bloques de evaluación</dt>
                  <dd className="text-2xl font-bold text-sol-fuerte sm:text-3xl">
                    <NumeroAnimado valor={TOTAL_BLOQUES} duracion={0.8} />
                  </dd>
                  <dd className="text-sm text-muted-foreground">bloques de evaluación</dd>
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
                  <ClipboardCheck className="size-8 sm:size-10" />
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
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-5xl">Pensado para el trabajo del profesional</h2>
            <p className="text-pretty text-xl text-muted-foreground">
              Las funciones marcadas “En desarrollo” todavía no están disponibles.
            </p>
          </div>
          <ListaCascada enVista className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARACTERISTICAS.map(({ icono: Icono, tono, titulo, descripcion, enDesarrollo }) => (
              <ItemCascada
                key={titulo}
                elevar
                className={cn(
                  "rounded-3xl border border-border/80 bg-card p-6 shadow-suave transition-colors hover:shadow-media",
                  TONOS[tono].borde,
                )}
              >
                <div className="mb-5 flex items-start justify-between gap-2">
                  <div className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", TONOS[tono].chip)}>
                    <Icono className="size-7" />
                  </div>
                  {enDesarrollo && <ChipEnDesarrollo />}
                </div>
                <h3 className="mb-2 text-xl font-bold">{titulo}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{descripcion}</p>
              </ItemCascada>
            ))}
          </ListaCascada>

          {/* Niveles */}
          <div id="levels" className="mx-auto mt-24 max-w-5xl scroll-mt-24">
            <h3 className="mb-3 text-center text-3xl font-bold">Dos niveles</h3>
            <p className="mb-10 text-center text-lg text-muted-foreground">
              Cada niño hace la evaluación que le corresponde por su etapa escolar.
            </p>
            <ListaCascada enVista className="grid gap-6 md:grid-cols-2">
              {NIVELES.map(({ nivel, titulo, edad, icono: Icono, fondo, tono }) => {
                const bloques = BLOQUES_POR_NIVEL[nivel]
                return (
                  <ItemCascada
                    key={nivel}
                    elevar
                    className="flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-media"
                  >
                    <div className={cn("relative flex items-center gap-4 overflow-hidden px-6 py-7 text-white", fondo)}>
                      <span aria-hidden="true" className="absolute -left-6 -top-10 size-32 rounded-full bg-white/15" />
                      <span aria-hidden="true" className="absolute -bottom-12 -right-4 size-36 rounded-full bg-white/10" />
                      <span className="relative grid size-16 shrink-0 place-items-center rounded-3xl bg-white/20 ring-4 ring-white/25">
                        <Icono className="size-8" />
                      </span>
                      <div className="relative">
                        <h4 className="text-2xl font-bold">{titulo}</h4>
                        <p className="text-lg text-white/90">{edad}</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 p-6">
                      <p className="font-semibold text-foreground">{bloques.length} bloques de evaluación</p>
                      <ul className="space-y-2.5">
                        {bloques.map((codigo) => (
                          <li key={codigo} className="flex items-start gap-3 text-base">
                            <span
                              className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", TONOS[tono].chip)}
                            >
                              <Check className="size-3.5" aria-hidden="true" />
                            </span>
                            {BLOQUE_NOMBRES[codigo]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ItemCascada>
                )
              })}
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
              Del registro al seguimiento, en cinco pasos
            </p>
          </div>
          <div className="relative mx-auto max-w-6xl">
            <ListaCascada enVista paso={0.15} className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
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
                  <h3 className="text-xl font-bold">{p.titulo}</h3>
                  <p className="mx-auto max-w-xs leading-relaxed text-muted-foreground">{p.descripcion}</p>
                  {p.enDesarrollo && <ChipEnDesarrollo />}
                </ItemCascada>
              ))}
            </ListaCascada>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-8 pt-20">
        <div className="fondo-rojo relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-6 py-14 shadow-elevada sm:px-12 md:py-16">
          <div aria-hidden="true" className="textura-puntos absolute inset-0 opacity-30 invert" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-balance text-3xl font-bold text-white md:text-5xl">
                ¿Trabajás con niños que están aprendiendo a leer?
              </h2>
              <p className="text-pretty text-xl leading-relaxed text-white/90">
                Creá tu cuenta y vinculá a los niños con los que trabajás.
              </p>
              <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row md:justify-start">
                <Button size="lg" variant="claro" asChild>
                  <Link href="/register">Crear cuenta</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white shadow-none hover:border-white/60 hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <Link href="/dislexia">Qué es la dislexia</Link>
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

      {/* Aviso */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl space-y-2 text-center text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">
            Lecxico ofrece resultados orientativos. No reemplaza la evaluación diagnóstica de un profesional.
          </p>
          <p>
            Prototipo en entorno de prueba, desarrollado como Trabajo Final de Ingeniería en Informática (FTyCA-UNCa),
            basado en el concepto Lecxico de Bautista Stampone.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
