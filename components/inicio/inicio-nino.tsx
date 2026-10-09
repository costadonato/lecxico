"use client"

import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { AppHeader } from "@/components/app-header"
import { Destello, Estrella, FondoDecorado } from "@/components/fondo-decorado"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { RESORTE } from "@/components/motion/transiciones"
import { Personaje } from "@/components/personajes/personaje"
import { cn } from "@/lib/utils"

export type TonoTarjeta = "rojo" | "celeste" | "sol" | "menta" | "lavanda"

export interface TarjetaInicio {
  title: string
  description: string
  href: string
  icono: LucideIcon
  tono: TonoTarjeta
}

/* Zona ilustrada de cada tarjeta (color fuerte) y color del ícono. */
const ESTILO_NINO: Record<TonoTarjeta, { zona: string; icono: string; flecha: string }> = {
  rojo: { zona: "bg-rojo", icono: "text-rojo-fuerte", flecha: "bg-rojo-suave text-rojo-fuerte" },
  celeste: { zona: "bg-celeste", icono: "text-celeste-fuerte", flecha: "bg-celeste-suave text-celeste-fuerte" },
  sol: { zona: "bg-sol", icono: "text-sol-fuerte", flecha: "bg-sol-suave text-sol-fuerte" },
  menta: { zona: "bg-menta", icono: "text-menta-fuerte", flecha: "bg-menta-suave text-menta-fuerte" },
  lavanda: { zona: "bg-lavanda", icono: "text-lavanda-fuerte", flecha: "bg-lavanda-suave text-lavanda-fuerte" },
}

/**
 * Inicio del niño: festivo. Lex lo saluda por su nombre (con voz) y las
 * opciones son tarjetas grandes y coloridas que aparecen en cascada.
 */
export function InicioNino({
  nombre,
  tarjetas,
  onElegir,
}: {
  nombre: string
  tarjetas: TarjetaInicio[]
  onElegir: (href: string) => void
}) {
  return (
    <div className="fondo-nino relative isolate min-h-screen overflow-hidden pb-16">
      <FondoDecorado variante="nino" />
      <AppHeader profile={{ nombre, rol: "nino" }} />

      <main className="container relative mx-auto max-w-6xl px-4">
        <h1 className="sr-only">Hola, {nombre}</h1>
        <section className="flex justify-center pb-4 pt-8 md:pt-12">
          <Personaje
            personaje="lex"
            animacion="saltar"
            mensaje={`¡Hola, ${nombre}! ¿Qué querés hacer hoy?`}
            ladoGlobo="derecha"
            conVoz
            prioridad
            claseImagen="w-32 sm:w-44 md:w-52"
            claseGlobo="max-w-[13rem] text-lg sm:max-w-sm sm:text-2xl sm:px-7 sm:py-5"
          />
        </section>

        <ListaCascada
          retraso={0.35}
          paso={0.12}
          className={cn(
            "mx-auto mt-8 grid grid-cols-1 gap-6",
            tarjetas.length === 1 ? "max-w-sm" : tarjetas.length === 2 ? "max-w-3xl sm:grid-cols-2" : "max-w-5xl sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {tarjetas.map((t) => (
            <ItemCascada key={t.title} elevar className="h-full">
              <TarjetaNino tarjeta={t} onClick={() => onElegir(t.href)} />
            </ItemCascada>
          ))}
        </ListaCascada>
      </main>
    </div>
  )
}

function TarjetaNino({ tarjeta, onClick }: { tarjeta: TarjetaInicio; onClick: () => void }) {
  const estilo = ESTILO_NINO[tarjeta.tono]
  const Icono = tarjeta.icono

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="reposo"
      whileHover="activo"
      whileFocus="activo"
      className="group flex h-full w-full flex-col overflow-hidden rounded-[2rem] border-2 border-white bg-card text-left shadow-media transition-shadow hover:shadow-elevada focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
    >
      <div className={cn("relative grid h-40 place-items-center overflow-hidden", estilo.zona)}>
        <span aria-hidden="true" className="absolute -left-8 -top-10 size-36 rounded-full bg-white/20" />
        <span aria-hidden="true" className="absolute -bottom-14 -right-6 size-40 rounded-full bg-white/15" />
        <Estrella className="absolute right-5 top-4 size-6 text-white/70" />
        <Destello className="absolute bottom-5 left-6 size-5 text-white/80" />
        <motion.span
          variants={{
            reposo: { rotate: 0, scale: 1, transition: RESORTE },
            activo: { rotate: [0, -10, 8, 0], scale: 1.08, transition: { duration: 0.5, ease: "easeOut" } },
          }}
          className="relative grid size-24 place-items-center rounded-[1.75rem] bg-white shadow-media"
        >
          <Icono className={cn("size-12", estilo.icono)} strokeWidth={2.2} />
        </motion.span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h2 className="text-2xl font-bold leading-snug text-foreground">{tarjeta.title}</h2>
        <p className="flex-1 text-base text-muted-foreground">{tarjeta.description}</p>
        <span
          className={cn(
            "mt-3 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-base font-bold",
            estilo.flecha,
          )}
        >
          Ir
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </motion.button>
  )
}
