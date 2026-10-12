"use client"

import { useId } from "react"
import { motion, useReducedMotion, type Transition } from "motion/react"
import { cn } from "@/lib/utils"

export type EstadoLumo = "normal" | "feliz" | "pensando" | "dormido"

const TITULO_POR_ESTADO: Record<EstadoLumo, string> = {
  normal: "Lumo",
  feliz: "Lumo contento",
  pensando: "Lumo pensando",
  dormido: "Lumo dormido",
}

/* Todo el dibujo usa tokens de globals.css (rojo, pantalla, plata, celeste). */
const C = {
  rojo: "var(--rojo)",
  contorno: "var(--pantalla)",
  pantalla: "var(--pantalla)",
  pantallaClaro: "var(--pantalla-claro)",
  plata: "var(--plata)",
  plataOscuro: "var(--plata-oscuro)",
  celeste: "var(--celeste)",
  zeta: "var(--celeste-fuerte)",
}

/* Centro de cada elemento al animar escalas y giros dentro del SVG. */
const ORIGEN_CENTRO = { transformBox: "fill-box", transformOrigin: "50% 50%" } as const
const ORIGEN_BASE = { transformBox: "fill-box", transformOrigin: "50% 100%" } as const

const BUCLE = (duration: number, extra?: Transition): Transition => ({
  duration,
  repeat: Infinity,
  ease: "easeInOut",
  ...extra,
})

/**
 * Cabeza de Lumo dibujada en SVG: cabeza roja redondeada, pantalla oscura con
 * ojos celestes brillantes y dos antenas.
 *
 * Estados:
 * - normal: parpadea cada tanto.
 * - feliz: ojos sonrientes, mejillas y antenas que se balancean.
 * - pensando: mira de un lado a otro con tres puntitos (para cargas).
 * - dormido: ojos cerrados y "z" que suben (para estados vacíos).
 *
 * Con reduced-motion queda quieto: solo los puntitos de "pensando" cambian
 * de opacidad, para que se siga notando que algo está cargando.
 */
export function LumoCara({
  estado = "normal",
  tamano = 96,
  titulo,
  className,
}: {
  estado?: EstadoLumo
  /** Ancho y alto en píxeles. */
  tamano?: number
  /** Texto alternativo; si se omite, la imagen es decorativa (aria-hidden). */
  titulo?: string | boolean
  className?: string
}) {
  const reducir = useReducedMotion()
  const animar = !reducir
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const textoTitulo = titulo === true ? TITULO_POR_ESTADO[estado] : titulo || undefined

  return (
    <svg
      viewBox="0 0 120 120"
      width={tamano}
      height={tamano}
      className={cn("shrink-0 overflow-visible", className)}
      role={textoTitulo ? "img" : undefined}
      aria-hidden={textoTitulo ? undefined : true}
      aria-label={textoTitulo}
    >
      {textoTitulo && <title>{textoTitulo}</title>}
      <defs>
        <filter id={`${id}-brillo`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.8" result="difuso" />
          <feMerge>
            <feMergeNode in="difuso" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-pantalla`} cx="45%" cy="40%" r="75%">
          <stop offset="0%" style={{ stopColor: C.pantallaClaro }} />
          <stop offset="100%" style={{ stopColor: C.pantalla }} />
        </radialGradient>
      </defs>

      {/* Cabeza completa: respira (dormido) o salta un poquito (feliz). */}
      <motion.g
        style={ORIGEN_BASE}
        initial={{ y: 0, scale: 1 }}
        animate={
          !animar
            ? { y: 0, scale: 1 }
            : estado === "feliz"
              ? { y: [0, -3, 0] }
              : estado === "dormido"
                ? { scale: [1, 1.025, 1] }
                : { y: 0, scale: 1 }
        }
        transition={estado === "dormido" ? BUCLE(3.6) : BUCLE(1.1, { repeatDelay: 0.6 })}
      >
        <Antenas estado={estado} animar={animar} />

        {/* Orejas */}
        {[14, 106].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={67} r={10.5} style={{ fill: C.plata, stroke: C.contorno }} strokeWidth={2.5} />
            <circle cx={cx} cy={67} r={4.8} style={{ fill: C.rojo, stroke: C.contorno }} strokeWidth={1.5} />
          </g>
        ))}

        {/* Cabeza */}
        <rect x={16} y={30} width={88} height={76} rx={30} style={{ fill: C.rojo, stroke: C.contorno }} strokeWidth={3} />
        <ellipse cx={36} cy={39} rx={10} ry={3.6} transform="rotate(-22 36 39)" fill="white" opacity={0.32} />

        {/* Marco y pantalla */}
        <rect x={25} y={42} width={70} height={52} rx={18} style={{ fill: C.plata, stroke: C.contorno }} strokeWidth={2.5} />
        <rect x={30} y={47} width={60} height={42} rx={14} fill={`url(#${id}-pantalla)`} />
        <path d="M36 54 Q38 50 44 50" fill="none" stroke="white" strokeOpacity={0.18} strokeWidth={2.4} strokeLinecap="round" />
        {estado === "dormido" && <rect x={30} y={47} width={60} height={42} rx={14} style={{ fill: C.pantalla }} opacity={0.35} />}

        {/* Cara (brilla) */}
        <g filter={`url(#${id}-brillo)`}>
          <Ojos estado={estado} animar={animar} />
          <Boca estado={estado} />
        </g>

        {estado === "feliz" && (
          <g style={{ fill: C.rojo }} opacity={0.55}>
            <ellipse cx={39} cy={76} rx={4.5} ry={2.6} />
            <ellipse cx={81} cy={76} rx={4.5} ry={2.6} />
          </g>
        )}
      </motion.g>

      {estado === "dormido" && <Zetas animar={animar} />}
    </svg>
  )
}

/* ------------------------------------------------------------------ */

function Antenas({ estado, animar }: { estado: EstadoLumo; animar: boolean }) {
  const balanceo = animar && estado === "feliz"
  return (
    <>
      {[
        { x1: 43, x2: 35, signo: -1 },
        { x1: 77, x2: 85, signo: 1 },
      ].map(({ x1, x2, signo }, i) => (
        <motion.g
          key={x1}
          style={ORIGEN_BASE}
          initial={{ rotate: 0 }}
          animate={balanceo ? { rotate: [0, 10 * signo, -6 * signo, 0] } : { rotate: 0 }}
          transition={BUCLE(1.4, { delay: i * 0.15, repeatDelay: 0.3 })}
        >
          <line x1={x1} y1={33} x2={x2} y2={13} style={{ stroke: C.contorno }} strokeWidth={3} strokeLinecap="round" />
          <circle cx={x2} cy={11} r={5.2} style={{ fill: C.rojo, stroke: C.contorno }} strokeWidth={2} />
          {estado === "pensando" && (
            <motion.circle
              cx={x2}
              cy={11}
              r={3.4}
              style={{ fill: C.celeste }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={BUCLE(1.2, { delay: i * 0.6 })}
            />
          )}
        </motion.g>
      ))}
    </>
  )
}

function Ojos({ estado, animar }: { estado: EstadoLumo; animar: boolean }) {
  const trazo = { fill: "none", stroke: C.celeste, strokeWidth: 3.6, strokeLinecap: "round" } as const

  if (estado === "feliz") {
    return (
      <>
        <path d="M42 66 Q48 57 54 66" style={trazo} />
        <path d="M66 66 Q72 57 78 66" style={trazo} />
      </>
    )
  }

  if (estado === "dormido") {
    return (
      <>
        <path d="M42 63 Q48 68 54 63" style={trazo} />
        <path d="M66 63 Q72 68 78 63" style={trazo} />
      </>
    )
  }

  if (estado === "pensando") {
    // Mira hacia arriba y de un lado al otro, como buscando algo.
    return (
      <motion.g
        initial={{ x: 0 }}
        animate={animar ? { x: [-4, 4, 4, -4, -4] } : { x: 0 }}
        transition={BUCLE(2.6, { times: [0, 0.3, 0.5, 0.8, 1] })}
      >
        <ellipse cx={49} cy={60} rx={5} ry={6.2} style={{ fill: C.celeste }} />
        <ellipse cx={71} cy={60} rx={5} ry={6.2} style={{ fill: C.celeste }} />
      </motion.g>
    )
  }

  // normal: parpadeo cada tanto
  return (
    <motion.g
      style={ORIGEN_CENTRO}
      initial={{ scaleY: 1 }}
      animate={animar ? { scaleY: [1, 1, 0.08, 1, 1, 0.08, 1] } : { scaleY: 1 }}
      transition={{
        duration: 6,
        times: [0, 0.46, 0.48, 0.5, 0.92, 0.94, 0.96],
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <ellipse cx={48} cy={63} rx={5.6} ry={7.2} style={{ fill: C.celeste }} />
      <ellipse cx={72} cy={63} rx={5.6} ry={7.2} style={{ fill: C.celeste }} />
    </motion.g>
  )
}

function Boca({ estado }: { estado: EstadoLumo }) {
  if (estado === "feliz") {
    return <path d="M49 75 Q60 87 71 75 Z" style={{ fill: C.celeste, stroke: C.celeste }} strokeWidth={2} strokeLinejoin="round" />
  }
  if (estado === "dormido") {
    return <ellipse cx={60} cy={79} rx={2.8} ry={2.2} style={{ fill: C.celeste }} />
  }
  if (estado === "pensando") {
    // Tres puntitos que se encienden en orden (con reduced-motion también:
    // es solo opacidad y avisa que algo está cargando).
    return (
      <>
        {[51, 60, 69].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={78}
            r={2.6}
            style={{ fill: C.celeste }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={BUCLE(1.2, { delay: i * 0.2 })}
          />
        ))}
      </>
    )
  }
  return <path d="M51 76 Q60 83 69 76" style={{ fill: "none", stroke: C.celeste }} strokeWidth={3.4} strokeLinecap="round" />
}

function Zetas({ animar }: { animar: boolean }) {
  return (
    <g style={{ fill: C.zeta }} fontWeight={700} fontFamily="inherit">
      {[
        { x: 96, y: 34, size: 11 },
        { x: 104, y: 22, size: 14 },
        { x: 112, y: 8, size: 17 },
      ].map((z, i) => (
        <motion.text
          key={z.x}
          x={z.x}
          y={z.y}
          fontSize={z.size}
          initial={{ opacity: 0, y: 0 }}
          animate={animar ? { opacity: [0, 1, 0], y: [4, -6] } : { opacity: 0.8, y: 0 }}
          transition={BUCLE(3, { delay: i * 0.9, ease: "easeOut" })}
        >
          z
        </motion.text>
      ))}
    </g>
  )
}
