"use client"

import { useRef, useState } from "react"
import { EjercicioDenominacion } from "@/components/test/ejercicio-denominacion"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import type { ItemNombra } from "@/lib/entrenamiento/denominacion-entrenamiento"
import { resultadoBloqueDenominacion, type ResultadoEjercicio } from "@/lib/test/denominacion"

/**
 * Nombrá rápido (denominación rápida, inicial y primario, solo en
 * consulta). Reusa el ejercicio de la evaluación
 * (components/test/ejercicio-denominacion.tsx): práctica (solo antes de la
 * primera cuadrícula), consigna con la cuadrícula tapada, cronómetro oculto
 * y carga de errores. La partida es de 2 cuadrículas generadas al azar.
 *
 * Lo maneja el profesional: sus textos van en normal-case; las letras de la
 * cuadrícula siguen el switch "A a". El marco lo muestra sin personaje.
 *
 * Resultado: correctas, total, tiempo y errores son la suma de las dos
 * cuadrículas; el detalle, uno por cuadrícula (DetalleEjercicioDenominacion).
 */
export function Nombra({ items, onRonda, letra }: PropsJuego<ItemNombra>) {
  const [actual, setActual] = useState(0)
  const resultados = useRef<ResultadoEjercicio[]>([])
  const item = items[actual]
  if (!item) return null

  const confirmar = (resultado: ResultadoEjercicio) => {
    resultados.current = [...resultados.current.slice(0, actual), resultado]
    if (actual < items.length - 1) {
      setActual(actual + 1)
      onRonda({ tipo: "siguiente", ronda: actual + 1 })
      return
    }
    const bloque = resultadoBloqueDenominacion(resultados.current)
    onRonda({
      tipo: "fin",
      resultado: {
        correctas: bloque.correctas,
        total: bloque.total,
        tiempoMs: bloque.tiempoMs,
        errores: bloque.errores,
        detalle: bloque.detalle,
      },
    })
  }

  return (
    <div className="flex min-h-[24rem] flex-col normal-case [&_button]:normal-case">
      <EjercicioDenominacion
        key={item.id}
        config={item.config}
        ejercicio={item.ejercicio}
        numero={actual + 1}
        cantidad={items.length}
        conPractica={actual === 0}
        onConfirmar={confirmar}
        letra={letra}
        mostrarNumero={false}
      />
    </div>
  )
}
