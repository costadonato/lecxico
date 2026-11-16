"use client"

import { useId, useState } from "react"
import { GraduationCap, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { Seccion } from "@/components/seccion"
import { DialogoContrasenaTutor } from "@/components/tutor/dialogo-contrasena-tutor"
import { cambiarEtapaTutor, eliminarCuentaNino } from "@/lib/tutor/acciones"
import { avisoCambioNivel } from "@/lib/tutor/etapa"
import { ETAPAS_ESCOLARES, NIVEL_LABEL, nivelParaEtapa, type EtapaEscolar } from "@/lib/test/bloques"

const etiquetaEtapa = (etapa: EtapaEscolar) => ETAPAS_ESCOLARES.find((e) => e.valor === etapa)?.label ?? etapa

/**
 * "Acciones del tutor" en /perfil (solo cuentas de niño): cambiar la etapa
 * escolar y eliminar la cuenta. Las dos piden la contraseña de la cuenta,
 * que el servidor verifica (lib/tutor/acciones.ts).
 */
export function AccionesTutor({ etapaInicial }: { etapaInicial: EtapaEscolar }) {
  return (
    <Seccion icono={<ShieldCheck />} tono="rojo" titulo="Acciones del tutor">
      <div className="space-y-6">
        <p className="text-base text-muted-foreground">
          Estas acciones las hace el tutor. Cada una pide la contraseña de la cuenta.
        </p>
        <CambiarEtapa etapaInicial={etapaInicial} />
        <EliminarCuenta />
      </div>
    </Seccion>
  )
}

/* ------------------------------------------------------------------ */
/*  Etapa escolar                                                       */
/* ------------------------------------------------------------------ */
function CambiarEtapa({ etapaInicial }: { etapaInicial: EtapaEscolar }) {
  const id = useId()
  const [actual, setActual] = useState(etapaInicial)
  const [nueva, setNueva] = useState<EtapaEscolar>(etapaInicial)
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const aviso = avisoCambioNivel(actual, nueva)
  const cambia = nueva !== actual

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-background/60 p-4">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <GraduationCap className="size-5 text-celeste-fuerte" aria-hidden="true" />
        Etapa escolar
      </h3>
      <p className="text-base">
        Etapa actual: <span className="font-semibold">{etiquetaEtapa(actual)}</span>{" "}
        <span className="text-muted-foreground">(evaluación de nivel {NIVEL_LABEL[nivelParaEtapa(actual)]})</span>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`${id}-etapa`} className="text-base font-semibold">
            Nueva etapa escolar
          </Label>
          <Select
            value={nueva}
            onValueChange={(v) => {
              setNueva(v as EtapaEscolar)
              setMensaje(null)
            }}
          >
            <SelectTrigger id={`${id}-etapa`} className="h-11 w-full text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ETAPAS_ESCOLARES.map((e) => (
                <SelectItem key={e.valor} value={e.valor} className="text-base">
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={() => setConfirmando(true)} disabled={!cambia}>
          Cambiar la etapa
        </Button>
      </div>

      <div aria-live="polite">
        {aviso && <p className="rounded-xl bg-sol-suave px-3 py-2 text-base text-foreground">{aviso}</p>}
      </div>
      {mensaje && <MensajeAlerta tipo="ok" texto={mensaje} />}

      <DialogoContrasenaTutor
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        titulo="¿Cambiar la etapa escolar?"
        descripcion={
          <>
            <p>
              La etapa pasa de {etiquetaEtapa(actual)} a {etiquetaEtapa(nueva)}.
            </p>
            {aviso && <p className="font-semibold text-foreground">{aviso}</p>}
          </>
        }
        textoConfirmar="Cambiar la etapa"
        destructivo={false}
        accion={(password) => cambiarEtapaTutor({ password, etapa: nueva })}
        onExito={() => {
          setActual(nueva)
          setMensaje(`La etapa escolar ahora es ${etiquetaEtapa(nueva)}.`)
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Eliminar la cuenta                                                  */
/* ------------------------------------------------------------------ */
function EliminarCuenta() {
  const id = useId()
  const [confirmando, setConfirmando] = useState(false)
  const [entiendo, setEntiendo] = useState(false)

  return (
    <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <Trash2 className="size-5 text-destructive" aria-hidden="true" />
        Eliminar la cuenta
      </h3>
      <p className="text-base">Borra la cuenta del niño y todos sus datos. No se puede deshacer.</p>
      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          setEntiendo(false)
          setConfirmando(true)
        }}
      >
        Eliminar la cuenta
      </Button>

      <DialogoContrasenaTutor
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        titulo="¿Eliminar la cuenta del niño?"
        descripcion={
          <p>
            Se van a borrar para siempre la cuenta y todos sus datos: evaluaciones, entrenamientos y vínculos con
            profesionales. Los profesionales vinculados dejan de ver todo, incluidas las evaluaciones que tomaron ellos.
            No se puede deshacer.
          </p>
        }
        textoConfirmar="Eliminar la cuenta"
        habilitado={entiendo}
        accion={(password) => eliminarCuentaNino({ password })}
        onExito={() => {
          // Navegación completa: la Server Action ya borró las cookies de sesión.
          window.location.replace("/login?cuenta=eliminada")
        }}
      >
        <label
          htmlFor={`${id}-entiendo`}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/50 p-3 text-base leading-relaxed transition-colors hover:border-primary/30"
        >
          <input
            id={`${id}-entiendo`}
            type="checkbox"
            checked={entiendo}
            onChange={(e) => setEntiendo(e.target.checked)}
            className="mt-1 size-5 shrink-0 cursor-pointer accent-primary"
          />
          <span>Entiendo que se borran todos los datos y no se pueden recuperar.</span>
        </label>
      </DialogoContrasenaTutor>
    </div>
  )
}
