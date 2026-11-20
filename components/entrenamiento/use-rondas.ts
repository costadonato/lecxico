"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { EventoRonda } from "@/components/entrenamiento/juegos/tipos"
import {
  aciertoEnReintento,
  iniciarRondas,
  reducirRondas,
  resultadoRondas,
  type AccionRonda,
  type EstadoRondas,
} from "@/lib/entrenamiento/rondas"

/**
 * Las rondas de una partida (lib/entrenamiento/rondas.ts) con React:
 * guarda el estado, avisa cada cambio al marco con `onRonda` y, al pasar
 * de ronda, lleva el foco al contenedor de la ronda nueva (`refRonda`),
 * así el teclado y el lector de pantalla siguen el juego.
 */
export function useRondas<I extends { id: string }>(items: I[], onRonda: (e: EventoRonda) => void) {
  const [estado, setEstado] = useState<EstadoRondas>(() => iniciarRondas(items.map((i) => i.id)))
  const actual = useRef(estado)
  const avisar = useRef(onRonda)
  avisar.current = onRonda
  const refRonda = useRef<HTMLDivElement>(null)
  const primera = useRef(true)

  const aplicar = useCallback((accion: AccionRonda) => {
    const antes = actual.current
    const despues = reducirRondas(antes, accion)
    if (despues === antes) return
    actual.current = despues
    setEstado(despues)

    if (accion.tipo === "responder") {
      avisar.current({
        tipo: "respuesta",
        fase: despues.fase as "acierto" | "reintento" | "respuesta",
        enReintento: aciertoEnReintento(despues),
        ronda: despues.actual,
      })
    } else if (despues.fase === "terminada") {
      avisar.current({ tipo: "fin", resultado: resultadoRondas(despues) })
    } else {
      avisar.current({ tipo: "siguiente", ronda: despues.actual })
    }
  }, [])

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    if (estado.fase === "esperando") refRonda.current?.focus()
  }, [estado.actual, estado.fase])

  return {
    estado,
    item: items[estado.actual] as I | undefined,
    /** El niño respondió (bien o mal). */
    responder: (correcta: boolean) => aplicar({ tipo: "responder", correcta }),
    /** Pasa a la ronda siguiente (después de un acierto o de mostrar la respuesta). */
    siguiente: () => aplicar({ tipo: "siguiente" }),
    /** true mientras el niño puede responder. */
    puedeResponder: estado.fase === "esperando" || estado.fase === "reintento",
    /** true cuando la ronda está resuelta y falta tocar "Seguir". */
    resuelta: estado.fase === "acierto" || estado.fase === "respuesta",
    ultima: estado.actual === items.length - 1,
    refRonda,
  }
}
