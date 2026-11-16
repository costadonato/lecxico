"use client"

import { useId } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

/**
 * Piezas del diálogo de aceptar una invitación (campanita del niño): qué va
 * a ver el profesional y la elección de compartir el historial
 * (profesional_nino.comparte_historial, 0005).
 */

export type EleccionHistorial = "si" | "no"

/** Qué va a ver el profesional si el tutor acepta. */
export function QueVaAVer({ profesional }: { profesional: string }) {
  return (
    <p>
      Si aceptás, {profesional} va a poder ver los datos del niño (nombre, fecha de nacimiento y etapa escolar), tu mail y
      tu teléfono, las evaluaciones que le tome y su entrenamiento: la práctica en casa y las tareas que le asigne. Va a ver
      esta información mientras el vínculo esté activo. Podés darlo de baja cuando quieras.
    </p>
  )
}

const OPCIONES_HISTORIAL = [
  {
    valor: "si",
    titulo: "Sí, compartir el historial",
    detalle: "Va a ver las evaluaciones y tareas de los demás profesionales, las de antes y las que se registren después.",
  },
  { valor: "no", titulo: "No, solo lo suyo", detalle: "Va a ver únicamente lo que registre él." },
] as const

/** Elección de compartir el historial: ninguna opción marcada al abrir. */
export function OpcionesHistorial({ valor, onCambio }: { valor: EleccionHistorial | null; onCambio: (v: EleccionHistorial) => void }) {
  const id = useId()
  return (
    <fieldset className="space-y-3">
      <legend id={`${id}-pregunta`} className="mb-3 text-base font-semibold">
        ¿Querés que también vea lo que registraron otros profesionales del niño?
      </legend>
      <RadioGroup
        value={valor ?? ""}
        onValueChange={(v) => onCambio(v as EleccionHistorial)}
        aria-labelledby={`${id}-pregunta`}
        className="gap-2"
      >
        {OPCIONES_HISTORIAL.map((o) => (
          <Label
            key={o.valor}
            htmlFor={`${id}-${o.valor}`}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border bg-muted/40 p-3 font-normal transition-colors hover:border-primary/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
          >
            <RadioGroupItem
              id={`${id}-${o.valor}`}
              value={o.valor}
              aria-describedby={`${id}-${o.valor}-detalle`}
              className="mt-1 size-5"
            />
            <span className="space-y-0.5">
              <span className="block text-base font-semibold text-foreground">{o.titulo}</span>
              <span id={`${id}-${o.valor}-detalle`} className="block text-sm leading-relaxed text-muted-foreground">
                {o.detalle}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <p className="text-sm text-muted-foreground">
        Esta elección vale mientras dure el vínculo. Para cambiarla, hay que darlo de baja y recibir una invitación nueva.
      </p>
    </fieldset>
  )
}
