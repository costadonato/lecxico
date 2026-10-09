"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { invitarNino, MENSAJE_INVITACION_ENVIADA } from "@/lib/vinculos"

/**
 * Botón "Vincular nuevo niño" + diálogo para invitarlo por su nombre de
 * usuario exacto (RPC invitar_nino). Se usa en /ninos y en /test.
 */
export function DialogoVincularNino({ variant = "default" }: { variant?: "default" | "outline" }) {
  const [abierto, setAbierto] = useState(false)
  const [usuario, setUsuario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null)

  const cambiarAbierto = (valor: boolean) => {
    setAbierto(valor)
    if (!valor) {
      setUsuario("")
      setResultado(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario.trim()) {
      setResultado({ tipo: "error", texto: "Escribí el nombre de usuario del niño." })
      return
    }
    setEnviando(true)
    setResultado(null)
    try {
      await invitarNino(usuario)
      setResultado({ tipo: "ok", texto: MENSAJE_INVITACION_ENVIADA })
      setUsuario("")
    } catch (e) {
      setResultado({ tipo: "error", texto: e instanceof Error ? e.message : "No se pudo enviar la invitación." })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={cambiarAbierto}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <UserPlus className="mr-2 h-4 w-4" />
          Vincular nuevo niño
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <span className="mb-1 grid size-16 place-items-center rounded-2xl bg-pantalla shadow-brillo-celeste">
              <LumoCara estado="feliz" tamano={52} />
            </span>
            <DialogTitle>Vincular nuevo niño</DialogTitle>
            <DialogDescription>
              Escribí el nombre de usuario exacto del niño. Se lo podés pedir a su madre, padre o tutor/a. El niño va a
              aparecer en tu lista cuando acepten la invitación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="usuario-nino" className="text-base font-semibold">Nombre de usuario del niño</Label>
            <Input
              id="usuario-nino"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.toLowerCase())}
              placeholder="ej: juan.perez"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="off"
              disabled={enviando}
            />
          </div>
          {resultado && <MensajeAlerta tipo={resultado.tipo} texto={resultado.texto} />}
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
