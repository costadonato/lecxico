"use client"

import { useEffect, useRef } from "react"
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { EASE_SUAVE } from "@/components/motion/transiciones"

/**
 * Número que cuenta desde 0 hasta `valor` cuando aparece en pantalla.
 * Con reduced-motion muestra el valor final directamente. Los lectores de
 * pantalla leen solo el valor final (el conteo es aria-hidden).
 */
export function NumeroAnimado({
  valor,
  sufijo = "",
  prefijo = "",
  duracion = 1.2,
  className,
}: {
  valor: number
  sufijo?: string
  prefijo?: string
  /** Segundos que dura el conteo. */
  duracion?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const enVista = useInView(ref, { once: true, margin: "0px 0px -40px 0px" })
  const reducir = useReducedMotion()
  const actual = useMotionValue(0)
  const texto = useTransform(actual, (v) => `${prefijo}${Math.round(v)}${sufijo}`)

  useEffect(() => {
    if (!enVista) return
    if (reducir) {
      actual.set(valor)
      return
    }
    const controles = animate(actual, valor, { duration: duracion, ease: EASE_SUAVE })
    return () => controles.stop()
  }, [enVista, reducir, valor, duracion, actual])

  return (
    <span ref={ref} className={className}>
      <motion.span aria-hidden="true" className="tabular-nums">
        {texto}
      </motion.span>
      <span className="sr-only">{`${prefijo}${valor}${sufijo}`}</span>
    </span>
  )
}
