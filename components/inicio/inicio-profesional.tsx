"use client"

import { ArrowRight } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { FondoDecorado } from "@/components/fondo-decorado"
import type { TarjetaInicio, TonoTarjeta } from "@/components/inicio/inicio-nino"
import { EntradaPagina } from "@/components/motion/entrada-pagina"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { GloboDialogo, Personaje } from "@/components/personajes/personaje"
import { cn } from "@/lib/utils"

const ESTILO_PRO: Record<TonoTarjeta, { icono: string; borde: string }> = {
  rojo: { icono: "bg-rojo-suave text-rojo-fuerte", borde: "hover:border-rojo/35" },
  celeste: { icono: "bg-celeste-suave text-celeste-fuerte", borde: "hover:border-celeste/60" },
  sol: { icono: "bg-sol-suave text-sol-fuerte", borde: "hover:border-sol/70" },
  menta: { icono: "bg-menta-suave text-menta-fuerte", borde: "hover:border-menta/60" },
  lavanda: { icono: "bg-lavanda-suave text-lavanda-fuerte", borde: "hover:border-lavanda/60" },
}

/**
 * Inicio del profesional: sereno y ordenado. Lumo, su asistente, lo saluda
 * desde un panel; las opciones son tarjetas sobrias que se elevan apenas.
 */
export function InicioProfesional({
  nombre,
  tarjetas,
  onElegir,
}: {
  nombre: string
  tarjetas: TarjetaInicio[]
  onElegir: (href: string) => void
}) {
  return (
    <div className="fondo-profesional relative isolate min-h-screen pb-16">
      <FondoDecorado variante="profesional" />
      <AppHeader profile={{ nombre, rol: "profesional" }} />

      <main className="container mx-auto max-w-5xl px-4">
        <EntradaPagina className="mt-8 sm:mt-12">
          <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-suave">
            <div aria-hidden="true" className="textura-cuadricula absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <div className="relative grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8 md:grid-cols-[auto_1fr_auto]">
              <div className="grid size-24 place-items-center rounded-[1.75rem] bg-pantalla shadow-brillo-celeste sm:size-28">
                <LumoCara estado="feliz" tamano={88} titulo="Lumo, tu asistente" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">Hola, {nombre}</h1>
                <GloboDialogo
                  texto="¿Qué querés hacer hoy?"
                  personaje="lumo"
                  lado="derecha"
                  retraso={0.2}
                  className="max-w-sm px-4 py-2.5 text-base shadow-suave sm:text-lg"
                />
              </div>
              <Personaje
                personaje="lumo"
                animacion="flotarSuave"
                claseImagen="w-24"
                decorativo
                className="hidden md:flex"
                retraso={0.3}
              />
            </div>
          </section>
        </EntradaPagina>

        <ListaCascada
          retraso={0.3}
          paso={0.1}
          className={cn("mt-8 grid grid-cols-1 gap-5", tarjetas.length > 1 && "md:grid-cols-2")}
        >
          {tarjetas.map((t) => {
            const estilo = ESTILO_PRO[t.tono]
            const Icono = t.icono
            return (
              <ItemCascada key={t.title} elevar="suave" className="h-full">
                <button
                  type="button"
                  onClick={() => onElegir(t.href)}
                  className={cn(
                    "group flex h-full w-full items-center gap-5 rounded-3xl border border-border/80 bg-card p-6 text-left shadow-suave transition-[border-color,box-shadow] hover:shadow-media focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 sm:p-7",
                    estilo.borde,
                  )}
                >
                  <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl", estilo.icono)}>
                    <Icono className="size-8" />
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block text-xl font-bold leading-snug text-foreground">{t.title}</span>
                    <span className="block text-base text-muted-foreground">{t.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </button>
              </ItemCascada>
            )
          })}
        </ListaCascada>
      </main>
    </div>
  )
}
