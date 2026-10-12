"use client"

import type React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

/*
 * Capa decorativa detrás del contenido: manchas de color difusas y formas
 * (estrellas, anillos, letras) que flotan despacio. El contenedor padre
 * necesita "relative isolate" para que la capa quede detrás.
 *
 * - nino: festivo, con muchas formas de colores y letras b/d.
 * - profesional: sereno, una trama de puntos y dos brillos suaves.
 * - landing / auth: intermedio, para la portada y las pantallas de cuenta.
 */

type Variante = "nino" | "profesional" | "landing" | "auth"

export function FondoDecorado({ variante, className }: { variante: Variante; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {variante === "profesional" ? <FondoProfesional /> : <FondoFestivo variante={variante} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function FondoProfesional() {
  return (
    <>
      <div className="textura-puntos absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="absolute -right-24 -top-24 size-[26rem] rounded-full bg-celeste/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 size-[22rem] rounded-full bg-rojo/[0.06] blur-3xl" />
      <Flotante className="absolute right-[6%] top-28 hidden lg:block" duracion={12} amplitud={6}>
        <Anillo className="size-16 text-celeste/35" />
      </Flotante>
      <Flotante className="absolute bottom-24 left-[4%] hidden lg:block" duracion={14} amplitud={6} retraso={2}>
        <Anillo className="size-10 text-rojo/20" />
      </Flotante>
    </>
  )
}

const FORMAS_FESTIVAS: Record<Exclude<Variante, "profesional">, React.ReactNode> = {
  nino: (
    <>
      <Flotante className="absolute left-[4%] top-28" duracion={7}>
        <Estrella className="size-10 text-sol sm:size-14" />
      </Flotante>
      <Flotante className="absolute right-[5%] top-40" duracion={9} retraso={1}>
        <Anillo className="size-12 text-celeste sm:size-16" />
      </Flotante>
      <Flotante className="absolute left-[8%] top-[55%] hidden sm:block" duracion={8} retraso={2}>
        <Letra className="text-7xl text-lavanda/40">b</Letra>
      </Flotante>
      <Flotante className="absolute right-[9%] top-[62%] hidden sm:block" duracion={10} retraso={0.5}>
        <Letra className="text-7xl text-celeste/45">d</Letra>
      </Flotante>
      <Flotante className="absolute bottom-16 left-[18%] hidden md:block" duracion={6} retraso={1.5}>
        <Destello className="size-9 text-rojo/60" />
      </Flotante>
      <Flotante className="absolute bottom-24 right-[22%] hidden md:block" duracion={8} retraso={3}>
        <Estrella className="size-8 text-menta" />
      </Flotante>
      <Flotante className="absolute left-[42%] top-24 hidden lg:block" duracion={9} retraso={2.5}>
        <Garabato className="h-6 w-20 text-mandarina/70" />
      </Flotante>
    </>
  ),
  landing: (
    <>
      <Flotante className="absolute left-[30%] top-24 hidden md:block" duracion={8}>
        <Estrella className="size-12 text-sol" />
      </Flotante>
      <Flotante className="absolute right-[4%] top-[12%] hidden md:block" duracion={10} retraso={1}>
        <Anillo className="size-14 text-celeste" />
      </Flotante>
      <Flotante className="absolute bottom-[12%] left-[46%] hidden lg:block" duracion={9} retraso={2}>
        <Destello className="size-8 text-lavanda" />
      </Flotante>
    </>
  ),
  auth: (
    <>
      <Flotante className="absolute left-[5%] top-32 hidden md:block" duracion={8}>
        <Estrella className="size-10 text-sol" />
      </Flotante>
      <Flotante className="absolute bottom-20 right-[6%] hidden md:block" duracion={10} retraso={1.5}>
        <Anillo className="size-14 text-celeste/70" />
      </Flotante>
      <Flotante className="absolute right-[38%] top-24 hidden lg:block" duracion={9} retraso={3}>
        <Destello className="size-7 text-rojo/50" />
      </Flotante>
    </>
  ),
}

function FondoFestivo({ variante }: { variante: Exclude<Variante, "profesional"> }) {
  const intensa = variante === "nino"
  return (
    <>
      <div className={cn("absolute -left-32 -top-32 size-[30rem] rounded-full blur-3xl", intensa ? "bg-sol/35" : "bg-sol/25")} />
      <div className={cn("absolute -right-40 top-10 size-[28rem] rounded-full blur-3xl", intensa ? "bg-celeste/30" : "bg-celeste/20")} />
      <div className="absolute -bottom-40 left-1/3 size-[32rem] rounded-full bg-rojo/10 blur-3xl" />
      {intensa && <div className="absolute -bottom-24 -right-24 size-[24rem] rounded-full bg-lavanda/20 blur-3xl" />}
      <div className="textura-puntos absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {FORMAS_FESTIVAS[variante]}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Formas                                                              */
/* ------------------------------------------------------------------ */

/** Envoltorio que flota en bucle (quieto con reduced-motion). */
export function Flotante({
  children,
  className,
  duracion = 8,
  amplitud = 12,
  retraso = 0,
}: {
  children: React.ReactNode
  className?: string
  duracion?: number
  amplitud?: number
  retraso?: number
}) {
  const reducir = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ y: 0, rotate: 0 }}
      animate={reducir ? { y: 0, rotate: 0 } : { y: [0, -amplitud, 0], rotate: [0, 6, 0] }}
      transition={{ duration: duracion, repeat: Infinity, ease: "easeInOut", delay: retraso }}
    >
      {children}
    </motion.div>
  )
}

export function Estrella({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
      <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  )
}

export function Anillo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={3}>
      <circle cx={12} cy={12} r={9} />
    </svg>
  )
}

export function Destello({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 1c.6 5.4 3.6 8.4 9 9-5.4.6-8.4 3.6-9 9-.6-5.4-3.6-8.4-9-9 5.4-.6 8.4-3.6 9-9z" />
    </svg>
  )
}

export function Garabato({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 20" className={className} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round">
      <path d="M3 12c8-10 14 10 22 0s14 10 22 0 14 10 22 0" />
    </svg>
  )
}

function Letra({ children, className }: { children: string; className?: string }) {
  return <span className={cn("block select-none font-bold leading-none", className)}>{children}</span>
}
