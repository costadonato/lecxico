"use client"

import { useMemo, useState } from "react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { OpcionDibujo, type EstadoOpcion } from "@/components/entrenamiento/opcion-dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { mezclar, type ItemDetective } from "@/lib/entrenamiento/bancos"

/** Reproducciones de la palabra por ronda (una más que en el mockup: ya no hay reproducción automática). */
const MAX_ESCUCHAR = 3

/**
 * Detective de sonidos (discriminación auditiva, inicial y primario).
 * Un botón "Escuchar" y tres dibujos: la palabra y sus dos distractores, en
 * orden al azar. Las opciones no tienen audio. Reintento según rondas.ts.
 */
export function Detective({ items, onRonda }: PropsJuego<ItemDetective>) {
  const r = useRondas(items, onRonda)
  // El orden de las opciones se fija una vez por partida.
  const opciones = useMemo(() => items.map((i) => mezclar([i.palabra, ...i.distractores])), [items])
  if (!r.item) return null

  return (
    <RondaDetective
      key={r.estado.actual}
      item={r.item}
      opciones={opciones[r.estado.actual]}
      ronda={r}
    />
  )
}

function RondaDetective({
  item,
  opciones,
  ronda: r,
}: {
  item: ItemDetective
  opciones: string[]
  ronda: ReturnType<typeof useRondas<ItemDetective>>
}) {
  const [tocadas, setTocadas] = useState<string[]>([])

  const elegir = (palabra: string) => {
    if (!r.puedeResponder || tocadas.includes(palabra)) return
    setTocadas((t) => [...t, palabra])
    r.responder(palabra === item.palabra)
  }

  const estadoDe = (palabra: string): EstadoOpcion => {
    if (palabra === item.palabra && (tocadas.includes(palabra) || r.estado.fase === "respuesta")) return "correcto"
    if (tocadas.includes(palabra)) return "incorrecto"
    return "normal"
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-6 outline-none sm:gap-8">
      <BotonEscuchar texto={item.palabra} max={MAX_ESCUCHAR} etiqueta="Escuchar" etiquetaAccesible="Escuchar la palabra" />
      <p className="text-center text-lg font-semibold text-muted-foreground sm:text-xl">¿Qué dibujo escuchaste?</p>
      <div className="grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-5">
        {opciones.map((p) => (
          <OpcionDibujo
            key={p}
            palabra={p}
            estado={estadoDe(p)}
            onElegir={() => elegir(p)}
            deshabilitada={!r.puedeResponder || tocadas.includes(p)}
          />
        ))}
      </div>
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}
