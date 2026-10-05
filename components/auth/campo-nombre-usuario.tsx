"use client"

import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { REGLA_NOMBRE_USUARIO } from "@/lib/auth/validaciones"
import type { EstadoNombreUsuario } from "@/lib/auth/use-nombre-usuario"

const MENSAJES: Partial<Record<EstadoNombreUsuario, { texto: string; tono: "ok" | "error" | "neutro" }>> = {
  formato: { texto: "El formato no es válido.", tono: "error" },
  verificando: { texto: "Verificando disponibilidad…", tono: "neutro" },
  disponible: { texto: "Disponible", tono: "ok" },
  ocupado: { texto: "Ese nombre de usuario ya está en uso.", tono: "error" },
  error: { texto: "No se pudo verificar la disponibilidad. Probá de nuevo.", tono: "error" },
}

interface Props {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  estado: EstadoNombreUsuario
  /** Error de validación al enviar (p. ej. "Completá este campo"). */
  error?: string | null
  ayuda?: string
  disabled?: boolean
}

/** Input de nombre de usuario con la regla de formato y el estado de disponibilidad. */
export function CampoNombreUsuario({ id, label, value, onChange, estado, error, ayuda, disabled }: Props) {
  const mensaje = MENSAJES[estado]

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="uppercase font-bold text-xs tracking-wide">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
        placeholder="ej: juan.perez"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        aria-invalid={estado === "formato" || estado === "ocupado" || !!error}
      />
      <p className="text-xs text-muted-foreground">
        {ayuda ? `${ayuda} ` : ""}
        {REGLA_NOMBRE_USUARIO}
      </p>
      {mensaje && (
        <p
          className={`flex items-center gap-1 text-sm ${
            mensaje.tono === "ok" ? "text-green-600" : mensaje.tono === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {estado === "verificando" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {mensaje.tono === "ok" && <CheckCircle2 className="w-3.5 h-3.5" />}
          {mensaje.tono === "error" && <XCircle className="w-3.5 h-3.5" />}
          {mensaje.texto}
        </p>
      )}
      {error && !mensaje && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
