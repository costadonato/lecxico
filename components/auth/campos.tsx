"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  COMPROMISO_CIERRE,
  COMPROMISO_INTRO,
  COMPROMISO_PUNTOS,
  COMPROMISO_TEXTO_CORTO,
  COMPROMISO_TITULO,
} from "@/lib/compromiso"

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
      <Label htmlFor={id} className="text-base font-semibold">
        {label}
      </Label>
      <Input id={id} aria-invalid={!!error} {...inputProps} />
      {ayuda && <p className="text-sm text-muted-foreground">{ayuda}</p>}
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
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer rounded-2xl border border-border bg-muted/50 p-3 text-base leading-relaxed transition-colors hover:border-primary/30">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-primary"
        />
        <span>
          {prefijo} los{" "}
          <Link href="/terminos" target="_blank" className="text-primary font-semibold hover:underline">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" className="text-primary font-semibold hover:underline">
            Política de Privacidad
          </Link>
          {sufijo}.
        </span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

/**
 * Casilla obligatoria del compromiso de uso responsable de los datos (solo
 * profesionales). El texto corto va junto a la casilla; el completo
 * (lib/compromiso.ts) se abre en un diálogo con "Leer el compromiso".
 */
export function CasillaCompromiso({
  id,
  checked,
  onChange,
  error,
}: {
  id: string
  checked: boolean
  onChange: (valor: boolean) => void
  error?: string | null
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-3 text-base leading-relaxed transition-colors hover:border-primary/30">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-primary"
        />
        <div className="space-y-1">
          <label htmlFor={id} className="cursor-pointer">
            {COMPROMISO_TEXTO_CORTO}
          </label>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="block rounded-full font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
              >
                Leer el compromiso
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{COMPROMISO_TITULO}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">{COMPROMISO_INTRO}</DialogDescription>
              </DialogHeader>
              <ol className="list-decimal space-y-2 pl-6 text-base leading-relaxed">
                {COMPROMISO_PUNTOS.map((p) => (
                  <li key={p.titulo}>
                    <span className="font-semibold">{p.titulo}</span> {p.texto}
                  </li>
                ))}
              </ol>
              <p className="text-sm leading-relaxed text-muted-foreground">{COMPROMISO_CIERRE}</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cerrar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
