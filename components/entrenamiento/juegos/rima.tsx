"use client"

import { useMemo, useState } from "react"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Dibujo } from "@/components/entrenamiento/dibujo"
import { OpcionDibujo, type EstadoOpcion } from "@/components/entrenamiento/opcion-dibujo"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { mezclar, type ItemRima } from "@/lib/entrenamiento/bancos"

/**
 * Rima (conciencia fonológica).
 * - Inicial: arriba el estímulo con su dibujo y su audio; abajo tres
 *   opciones con dibujo, cada una con su audio al lado.
 * - Primario: palabras escritas, sin dibujos. Solo el grado 1 tiene audio
 *   (estímulo y opciones); los grados 2 y 3, no.
 */
export function Rima({ nivel, grado, items, onRonda }: PropsJuego<ItemRima>) {
  const r = useRondas(items, onRonda)
  const opciones = useMemo(() => items.map((i) => mezclar([i.correcta, ...i.distractores])), [items])
  if (!r.item) return null

  const conDibujo = nivel === "inicial"
  const conAudio = nivel === "inicial" || grado === 1

  return (
    <RondaRima
      key={r.estado.actual}
      item={r.item}
      opciones={opciones[r.estado.actual]}
      conDibujo={conDibujo}
      conAudio={conAudio}
      ronda={r}
    />
  )
}

function RondaRima({
  item,
  opciones,
  conDibujo,
  conAudio,
  ronda: r,
}: {
  item: ItemRima
  opciones: string[]
  conDibujo: boolean
  conAudio: boolean
  ronda: ReturnType<typeof useRondas<ItemRima>>
}) {
  const [tocadas, setTocadas] = useState<string[]>([])

  const elegir = (palabra: string) => {
    if (!r.puedeResponder || tocadas.includes(palabra)) return
    setTocadas((t) => [...t, palabra])
    r.responder(palabra === item.correcta)
  }

  const estadoDe = (palabra: string): EstadoOpcion => {
    if (palabra === item.correcta && (tocadas.includes(palabra) || r.estado.fase === "respuesta")) return "correcto"
    if (tocadas.includes(palabra)) return "incorrecto"
    return "normal"
  }

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-6 outline-none sm:gap-8">
      {/* Estímulo */}
      <div className="flex items-center gap-4 rounded-[2rem] border-[3px] border-lavanda/50 bg-lavanda-suave px-5 py-4 shadow-suave sm:gap-6 sm:px-8">
        {conDibujo ? (
          <Dibujo palabra={item.estimulo} className="size-24 sm:size-32" />
        ) : (
          <span className="text-3xl font-bold tracking-wide text-lavanda-fuerte sm:text-4xl">{item.estimulo}</span>
        )}
        {conAudio && <BotonEscuchar texto={item.estimulo} tamano="chico" etiquetaAccesible={`Escuchar ${item.estimulo}`} />}
      </div>

      <p className="text-center text-lg font-semibold text-foreground sm:text-xl">
        ¿Qué rima con <span className="font-bold text-lavanda-fuerte">{item.estimulo}</span>?
      </p>

      <div className={conDibujo ? "grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-5" : "grid w-full max-w-md grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-3"}>
        {opciones.map((p) => (
          <OpcionDibujo
            key={p}
            palabra={p}
            estado={estadoDe(p)}
            onElegir={() => elegir(p)}
            deshabilitada={!r.puedeResponder || tocadas.includes(p)}
            conDibujo={conDibujo}
            conAudio={conAudio}
          />
        ))}
      </div>
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}
