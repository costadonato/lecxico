"use client"

import type React from "react"
import { useEffect, useId, useRef, useState } from "react"
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MENSAJE_ERROR_ACCION, type ResultadoAccion } from "@/lib/tutor/errores"

/**
 * Diálogo único para las acciones del tutor: pide la contraseña de la
 * cuenta y ejecuta `accion`, que la verifica en el servidor
 * (lib/tutor/acciones.ts). Lo usan la campanita, /mis-profesionales,
 * "Acciones del tutor" en /perfil y, en S17, el pedido del informe.
 *
 * - Controlado: abierto mientras `abierto` sea true.
 * - Se envía con Enter. Mientras ejecuta muestra "cargando" y no deja
 *   enviar dos veces. Los errores se muestran adentro (role="alert").
 * - Al cerrar o al terminar, la contraseña se borra del estado.
 * - Como ConfirmarDialog, se renderiza fuera de popovers/menús para que no
 *   se cierre junto con ellos.
 */
export function DialogoContrasenaTutor({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  textoConfirmar,
  children,
  habilitado = true,
  destructivo = true,
  accion,
  onExito,
}: {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  descripcion: React.ReactNode
  textoConfirmar: string
  /** Contenido extra entre la descripción y la contraseña (opciones, casillas). */
  children?: React.ReactNode
  /** Si el contenido extra está completo (por ejemplo, se eligió una opción). */
  habilitado?: boolean
  /** Botón rojo (por defecto) o el principal. */
  destructivo?: boolean
  /** Recibe la contraseña; la verificación la hace el servidor. */
  accion: (password: string) => Promise<ResultadoAccion>
  /** Se llama después de una acción exitosa, antes de cerrar. */
  onExito?: () => void
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const enCurso = useRef(false)
  const [password, setPassword] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const [ejecutando, setEjecutando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Al cerrarse (por cualquier vía), no queda nada en el estado.
  useEffect(() => {
    if (!abierto) {
      setPassword("")
      setMostrar(false)
      setError(null)
    }
  }, [abierto])

  const cerrar = () => {
    if (enCurso.current) return
    setPassword("")
    setError(null)
    onCerrar()
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enCurso.current || !password || !habilitado) return
    enCurso.current = true
    setEjecutando(true)
    setError(null)
    let r: ResultadoAccion
    try {
      r = await accion(password)
    } catch {
      r = { ok: false, error: MENSAJE_ERROR_ACCION }
    }
    enCurso.current = false
    setEjecutando(false)
    if (r.ok) {
      setPassword("")
      onExito?.()
      onCerrar()
    } else {
      setError(r.error)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }

  const puedeEnviar = !!password && habilitado && !ejecutando

  return (
    <AlertDialog open={abierto} onOpenChange={(abrir) => !abrir && cerrar()}>
      <AlertDialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onOpenAutoFocus={(e) => {
          // Sin contenido extra, lo primero es escribir la contraseña.
          if (!children) {
            e.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        <form onSubmit={enviar} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{titulo}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">{descripcion}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {children}

          <div className="space-y-2">
            <Label htmlFor={`${id}-password`} className="text-base font-semibold">
              Contraseña de la cuenta
            </Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id={`${id}-password`}
                type={mostrar ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // readOnly y no disabled: un campo deshabilitado pierde el foco,
                // y después de un error el foco tiene que volver acá.
                readOnly={ejecutando}
                aria-invalid={!!error}
                aria-describedby={`${id}-ayuda${error ? ` ${id}-error` : ""}`}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setMostrar((m) => !m)}
                aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={mostrar}
                aria-controls={`${id}-password`}
                className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
              >
                {mostrar ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <p id={`${id}-ayuda`} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
              Esta acción la confirma el tutor con la contraseña de la cuenta.
            </p>
            {error && (
              <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-destructive">
                {error}
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={ejecutando}>
              Volver
            </AlertDialogCancel>
            {/* Button común (no AlertDialogAction) para que el diálogo no se cierre antes de terminar. */}
            <Button type="submit" variant={destructivo ? "destructive" : "default"} disabled={!puedeEnviar}>
              {ejecutando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {ejecutando ? "Confirmando..." : textoConfirmar}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
