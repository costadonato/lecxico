"use client"

import { motion } from "motion/react"
import { useLetra } from "@/components/entrenamiento/proveedor-letra"
import { RESORTE } from "@/components/motion/transiciones"
import { cn } from "@/lib/utils"

/**
 * Switch "A a": cambia entre MAYÚSCULA y minúscula todo el texto del área
 * de juego. Es un role="switch" (encendido = minúscula). El switch mismo
 * no cambia de letra: siempre muestra una "A" y una "a" (normal-case en el
 * botón, que si no recibiría el text-transform de data-letra). Va dentro de
 * <ProveedorLetra>.
 */
export function SwitchLetra({ className }: { className?: string }) {
  const { letra, cambiar, error } = useLetra()
  const minuscula = letra === "minuscula"

  return (
    <span className={cn("relative inline-flex flex-col items-center normal-case", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={minuscula}
        aria-label="Letra minúscula"
        title={minuscula ? "Pasar a MAYÚSCULA" : "Pasar a minúscula"}
        onClick={() => cambiar(minuscula ? "mayuscula" : "minuscula")}
        className="relative inline-flex h-11 shrink-0 items-center rounded-full normal-case border border-border bg-muted p-1 text-lg font-bold outline-none transition-colors hover:border-lavanda focus-visible:ring-4 focus-visible:ring-ring/40"
      >
        <motion.span
          aria-hidden="true"
          className="absolute bottom-1 left-1 top-1 w-9 rounded-full bg-lavanda-fuerte shadow-suave"
          initial={false}
          animate={{ x: minuscula ? 36 : 0 }}
          transition={RESORTE}
        />
        <span aria-hidden="true" className={cn("relative z-10 grid w-9 place-items-center transition-colors", minuscula ? "text-muted-foreground" : "text-white")}>
          A
        </span>
        <span aria-hidden="true" className={cn("relative z-10 grid w-9 place-items-center transition-colors", minuscula ? "text-white" : "text-muted-foreground")}>
          a
        </span>
      </button>
      {error && (
        <span
          role="status"
          className="absolute right-0 top-full z-40 mt-1 w-max max-w-56 rounded-xl bg-card px-3 py-1.5 text-xs font-semibold text-destructive shadow-media"
        >
          {error}
        </span>
      )}
    </span>
  )
}
