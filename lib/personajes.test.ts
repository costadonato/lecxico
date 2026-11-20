import { describe, expect, it } from "vitest"

import { PERSONAJES, anchoPorCara, obtenerPose, type NombrePersonaje, type Pose } from "@/lib/personajes"

/** Poses entre las que cambia el personaje del juego (components/entrenamiento/marco-juego.tsx). */
const POSES_DEL_JUEGO = ["explicando", "pensando", "festejando", "alentando"] as const

/** Alto en pantalla de una pose escalada por la cara (cara = 1). */
const altoPorCara = (p: Pose) => (p.encuadre?.alto ?? p.alto) / p.cara!.diametro

describe("anchoPorCara", () => {
  it("es el ancho de la imagen (o de su encuadre) sobre el diámetro de la cara", () => {
    const p: Pose = { src: "", ancho: 800, alto: 1000, alt: "", cara: { x: 0, y: 0, diametro: 400 } }
    expect(anchoPorCara(p)).toBe(2)
    expect(anchoPorCara({ ...p, encuadre: { x: 0, y: 0, ancho: 600, alto: 900 } })).toBe(1.5)
  })

  it("sin cara devuelve null", () => {
    expect(anchoPorCara({ src: "", ancho: 1, alto: 1, alt: "" })).toBeNull()
  })

  it("todas las poses tienen cara (las usa el personaje del juego)", () => {
    for (const p of Object.values(PERSONAJES)) {
      for (const pose of Object.values(p.poses) as Pose[]) expect(pose.cara, pose.src).toBeDefined()
    }
  })

  it.each(["lex", "lumo"] as NombrePersonaje[])(
    "escaladas por la cara, las poses del juego de %s miden parecido (±15 %%)",
    (personaje) => {
      const altos = POSES_DEL_JUEGO.map((pose) => altoPorCara(obtenerPose(personaje, pose)))
      const medio = altos.reduce((a, b) => a + b) / altos.length
      for (const a of altos) expect(Math.abs(a - medio) / medio).toBeLessThan(0.15)
    },
  )
})

describe("obtenerPose", () => {
  it("sin pose devuelve la inicial", () => {
    expect(obtenerPose("lex")).toBe(PERSONAJES.lex.poses.volando)
    expect(obtenerPose("lumo")).toBe(PERSONAJES.lumo.poses.holograma)
  })

  it("una pose inexistente vuelve a la inicial", () => {
    expect(obtenerPose("lex", "noexiste" as never)).toBe(PERSONAJES.lex.poses.volando)
  })
})
