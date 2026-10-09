"use client"

import type React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/** Label + input + mensaje de error/ayuda, con el estilo de los formularios de cuenta. */
export function Campo({
  id,
  label,
  error,
  ayuda,
  ...inputProps
}: { id: string; label: string; error?: string | null; ayuda?: React.ReactNode } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="uppercase font-bold text-xs tracking-wide">
        {label}
      </Label>
      <Input id={id} aria-invalid={!!error} {...inputProps} />
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

/** Casilla obligatoria de aceptación de Términos y Condiciones y Política de Privacidad. */
export function CasillaTyC({
  id,
  checked,
  onChange,
  error,
  prefijo = "Leí y acepto",
  sufijo = "",
}: {
  id: string
  checked: boolean
  onChange: (valor: boolean) => void
  error?: string | null
  /** Texto antes de "los Términos y Condiciones…". */
  prefijo?: string
  /** Texto después de "…Política de Privacidad" (sin el punto final). */
  sufijo?: string
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer text-sm leading-relaxed">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 accent-primary shrink-0"
        />
        <span>
          {prefijo} los{" "}
          <Link href="/terminos" target="_blank" className="text-primary font-medium hover:underline">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" className="text-primary font-medium hover:underline">
            Política de Privacidad
          </Link>
          {sufijo}.
        </span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
