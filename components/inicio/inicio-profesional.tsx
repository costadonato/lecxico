"use client"

import { ArrowRight } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { ChipEnDesarrollo } from "@/components/chip-en-desarrollo"
import { FondoDecorado } from "@/components/fondo-decorado"
import { ActividadReciente } from "@/components/inicio/actividad-reciente"
import type { TarjetaInicio, TonoTarjeta } from "@/components/inicio/inicio-nino"
import { EntradaPagina } from "@/components/motion/entrada-pagina"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { GloboDialogo, Personaje } from "@/components/personajes/personaje"
import { cn } from "@/lib/utils"

const ICONO_PRO: Record<TonoTarjeta, string> = {
  rojo: "bg-rojo-suave text-rojo-fuerte",
  celeste: "bg-celeste-suave text-celeste-fuerte",
  sol: "bg-sol-suave text-sol-fuerte",
  menta: "bg-menta-suave text-menta-fuerte",
  lavanda: "bg-lavanda-suave text-lavanda-fuerte",
}

/**
 * Inicio del profesional: sereno y ordenado, sobre el fondo rojizo. Arriba,
 * el botón de actividad reciente; Lumo, su asistente, lo saluda desde un
 * panel de vidrio; las opciones son tarjetas de vidrio del mismo alto que se
 * elevan apenas. Una tarjeta "proximamente" no es clickeable.
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
        <ActividadReciente className="mt-[18px]" />

        <EntradaPagina className="mt-5">
          <section className="vidrio-saludo relative overflow-hidden rounded-[2rem]">
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
          // Dos columnas (2 × 2 con cuatro tarjetas), todas del mismo alto; con
          // una cantidad impar, la última ocupa el ancho completo. En celular,
          // una columna y cada tarjeta con su alto (si no, todas tomarían el
          // de "Evaluación de indicadores de dislexia", que ocupa cinco renglones).
          className={cn(
            "mt-8 grid grid-cols-1 gap-5 md:auto-rows-fr",
            tarjetas.length > 1 && "md:grid-cols-2 md:[&>*:last-child:nth-child(odd)]:col-span-2",
          )}
        >
          {tarjetas.map((t) => (
            <ItemCascada key={t.title} elevar={t.proximamente ? false : "suave"} className="h-full">
              {t.proximamente ? <TarjetaProximamente tarjeta={t} /> : <TarjetaOpcion tarjeta={t} onElegir={onElegir} />}
            </ItemCascada>
          ))}
        </ListaCascada>
      </main>
    </div>
  )
}

const CLASE_TARJETA = "vidrio flex h-full w-full items-center gap-5 rounded-3xl p-6 text-left sm:p-7"

function TarjetaOpcion({ tarjeta: t, onElegir }: { tarjeta: TarjetaInicio; onElegir: (href: string) => void }) {
  const Icono = t.icono
  return (
    <button
      type="button"
      onClick={() => onElegir(t.href)}
      className={cn(
        CLASE_TARJETA,
        "group transition-[border-color,box-shadow] hover:border-rojo/35 hover:shadow-media focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
      )}
    >
      <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl", ICONO_PRO[t.tono])}>
        <Icono className="size-8" />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block text-xl font-bold leading-snug text-foreground">{t.title}</span>
        <span className="block text-base text-muted-foreground">{t.description}</span>
      </span>
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-full border border-white/80 bg-white/70 text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
      >
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </button>
  )
}

/**
 * Función que todavía no está (Tareas, hasta S15): se puede enfocar y la lee
 * el lector de pantalla, pero no hace nada. Ícono y título un poco atenuados
 * (con contraste AA) y sin flecha.
 */
function TarjetaProximamente({ tarjeta: t }: { tarjeta: TarjetaInicio }) {
  const Icono = t.icono
  return (
    <button
      type="button"
      aria-disabled="true"
      className={cn(CLASE_TARJETA, "cursor-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40")}
    >
      <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl opacity-75", ICONO_PRO[t.tono])}>
        <Icono className="size-8" />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xl font-bold leading-snug text-foreground/80">{t.title}</span>
          <ChipEnDesarrollo texto="Próximamente" />
        </span>
        <span className="block text-base text-muted-foreground">{t.description}</span>
      </span>
    </button>
  )
}
