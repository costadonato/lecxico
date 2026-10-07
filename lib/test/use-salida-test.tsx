"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"

export const MENSAJE_SALIDA_TEST = "Si salís ahora, se pierde el progreso del test."

/** Marca de la entrada "trampa" del historial (ver más abajo). */
const GUARDA = "lecxicoTestEnCurso"

/**
 * Pide confirmación antes de abandonar un test en curso (no hay guardado
 * parcial: salir descarta el progreso). Cubre:
 * - los botones de la app: usar `salir(destino)` en lugar de router.push;
 * - cerrar o recargar la pestaña (beforeunload; el navegador muestra su
 *   propio texto, no se puede personalizar);
 * - el botón Atrás del navegador.
 * Devuelve también el diálogo, que la página tiene que renderizar.
 */
export function useSalidaDelTest(enCurso: boolean) {
  const router = useRouter()
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const enCursoRef = useRef(enCurso)
  enCursoRef.current = enCurso
  /** true una vez confirmada la salida: deja de interceptar. */
  const saliendo = useRef(false)

  const pedirConfirmacion = useCallback((irse: () => void) => {
    setConfirmacion({
      titulo: "¿Salir del test?",
      descripcion: MENSAJE_SALIDA_TEST,
      textoConfirmar: "Salir del test",
      textoCancelar: "Seguir con el test",
      accion: async () => {
        saliendo.current = true
        irse()
      },
    })
  }, [])

  // Cerrar o recargar la pestaña.
  useEffect(() => {
    if (!enCurso) return
    const alSalir = (e: BeforeUnloadEvent) => {
      if (saliendo.current) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", alSalir)
    return () => window.removeEventListener("beforeunload", alSalir)
  }, [enCurso])

  // Botón Atrás del navegador: se agrega una entrada al historial con la
  // misma URL. Al ir atrás se vuelve a esa misma página (Next la restaura
  // sin desmontarla), se repone la entrada y se pregunta. Si confirma, se
  // retrocede dos pasos hasta la página anterior real.
  useEffect(() => {
    if (!enCurso) return
    if (!window.history.state?.[GUARDA]) window.history.pushState({ [GUARDA]: true }, "")
    const alIrAtras = () => {
      if (saliendo.current || !enCursoRef.current) return
      window.history.pushState({ [GUARDA]: true }, "")
      pedirConfirmacion(() => window.history.go(-2))
    }
    window.addEventListener("popstate", alIrAtras)
    return () => window.removeEventListener("popstate", alIrAtras)
  }, [enCurso, pedirConfirmacion])

  // Cuando el test deja de estar en curso (resultado guardado), se quita la
  // entrada agregada, así un solo Atrás vuelve a la página anterior.
  // No corre al desmontar, así que no interfiere con un router.push.
  useEffect(() => {
    if (!enCurso && !saliendo.current && window.history.state?.[GUARDA]) window.history.back()
  }, [enCurso])

  /** Navega a `destino`, pidiendo confirmación si el test está en curso. */
  const salir = useCallback(
    (destino: string) => {
      if (!enCursoRef.current) return router.push(destino)
      pedirConfirmacion(() => router.push(destino))
    },
    [router, pedirConfirmacion],
  )

  const dialogo = <ConfirmarDialog confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} />

  return { salir, dialogo }
}
