"use client"

import type React from "react"
import { MotionConfig } from "motion/react"

/**
 * Configuración global de motion: con reducedMotion="user", si el sistema pide
 * reducir el movimiento se anulan las animaciones de transformación (desplazar,
 * escalar, rotar) y solo quedan cambios de opacidad.
 */
export function ProveedorMovimiento({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
