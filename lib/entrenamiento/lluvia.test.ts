import { describe, expect, it } from "vitest"

import { rutaEmoji } from "@/lib/entrenamiento/bancos"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import {
  COLORES_LLUVIA,
  LLUVIAS_POR_PARTIDA,
  NOMBRES_EMOJI,
  PARAMETROS_LLUVIA,
  bancoLluvia,
  carrilesQueEntran,
  crearReloj,
  generarLluvias,
  gotasVisibles,
  nombreElemento,
  objetivosAparecidos,
  planLluvia,
  resultadoLluvia,
  type ItemLluvia,
} from "@/lib/entrenamiento/lluvia"
import { iniciarRondas, reducirRondas, resultadoRondas } from "@/lib/entrenamiento/rondas"
import { COLORES_ESTIMULO } from "@/lib/test/denominacion-config"

const NIVELES: Nivel[] = ["inicial", "primario"]
const GRADOS: Grado[] = [1, 2, 3]
const SEMILLAS = Array.from({ length: 40 }, (_, i) => i + 1)

function semilla(n: number) {
  let s = n
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    return s / 2 ** 32
  }
}

describe("banco de Lluvia", () => {
  it("9 ítems por grado; en inicial, 3 de cada categoría; en primario, objetivos en lista", () => {
    for (const nivel of NIVELES) {
      for (const g of GRADOS) {
        const items = bancoLluvia(nivel, g)
        expect(items, `${nivel} ${g}`).toHaveLength(9)
        for (const i of items) {
          expect(i.distractores, i.id).not.toContain(i.objetivo)
          if (nivel === "primario") {
            expect(Array.isArray(i.objetivo)).toBe(true)
            expect((i.objetivo as string[]).length).toBe(g === 3 ? 2 : 1)
            for (const o of i.objetivo as string[]) expect(i.distractores, i.id).not.toContain(o)
          }
        }
        if (nivel === "inicial") {
          for (const c of ["colores", "objetos", "vocales"]) expect(items.filter((i) => i.categoria === c)).toHaveLength(3)
        }
      }
    }
  })

  it("todos los colores tienen su hex; los nuevos no tocan el mapa de la evaluación", () => {
    for (const g of GRADOS) {
      for (const i of bancoLluvia("inicial", g).filter((i) => i.categoria === "colores")) {
        for (const c of [i.objetivo as string, ...i.distractores]) expect(COLORES_LLUVIA[c], c).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
    expect(Object.keys(COLORES_ESTIMULO)).toHaveLength(5)
    expect(COLORES_LLUVIA.naranja).toBe("#f97316")
  })

  it("todos los emojis tienen dibujo y nombre para el lector de pantalla", () => {
    for (const g of GRADOS) {
      for (const i of bancoLluvia("inicial", g).filter((i) => i.categoria === "objetos")) {
        for (const e of [i.objetivo as string, ...i.distractores]) {
          expect(rutaEmoji(e), e).toBeTruthy()
          expect(NOMBRES_EMOJI[e], e).toBeTruthy()
        }
      }
    }
  })

  it("nombreElemento", () => {
    expect(nombreElemento("objetos", "🍌")).toBe("banana")
    expect(nombreElemento("objetos", "🛸")).toBe("dibujo")
    expect(nombreElemento("vocales", "A")).toBe("letra a")
    expect(nombreElemento("colores", "rojo")).toBe("rojo")
    expect(nombreElemento("palabras", "nido")).toBe("nido")
  })
})

describe("generarLluvias", () => {
  it("inicial: una de cada categoría, en orden al azar", () => {
    const ordenes = new Set<string>()
    for (const s of SEMILLAS) {
      const lluvias = generarLluvias("inicial", 2, semilla(s))
      expect(lluvias).toHaveLength(LLUVIAS_POR_PARTIDA)
      expect(new Set(lluvias.map((l) => l.categoria))).toEqual(new Set(["colores", "objetos", "vocales"]))
      ordenes.add(lluvias.map((l) => l.categoria).join())
      for (const l of lluvias) expect(l.objetivos).toHaveLength(1)
    }
    expect(ordenes.size).toBeGreaterThan(1)
  })

  it("primario: 3 ítems al azar, sin repetir; dos objetivos en el grado 3", () => {
    for (const s of SEMILLAS) {
      const lluvias = generarLluvias("primario", 3, semilla(s))
      expect(new Set(lluvias.map((l) => l.id)).size).toBe(3)
      for (const l of lluvias) expect(l.objetivos).toHaveLength(2)
    }
    expect(generarLluvias("primario", 1)).toHaveLength(3)
  })
})

describe("planLluvia", () => {
  for (const nivel of NIVELES) {
    for (const grado of GRADOS) {
      it(`${nivel}, grado ${grado}: proporción, mínimo de objetivos y carriles sin superposición`, () => {
        const { caidaMs, intervaloMs } = PARAMETROS_LLUVIA.ritmo[nivel][grado]
        const separacion = caidaMs * PARAMETROS_LLUVIA.altoGota
        for (const s of SEMILLAS) {
          const [item] = generarLluvias(nivel, grado, semilla(s))
          for (const carriles of [PARAMETROS_LLUVIA.carriles[nivel], 3]) {
            const plan = planLluvia(item, nivel, grado, { carriles, azar: semilla(s + 100) })
            const { gotas } = plan
            expect(gotas.length).toBe(Math.ceil((30_000 - 1_000) / intervaloMs))
            const objetivos = gotas.filter((g) => g.esObjetivo)
            expect(objetivos.length).toBeGreaterThanOrEqual(6)
            expect(objetivos.length / gotas.length).toBeGreaterThan(0.3)
            expect(objetivos.length / gotas.length).toBeLessThan(0.4)
            for (const g of gotas) {
              expect(g.esObjetivo ? item.objetivos : item.distractores).toContain(g.valor)
              expect(g.carril).toBeGreaterThanOrEqual(0)
              expect(g.carril).toBeLessThan(carriles)
              expect(g.caidaMs).toBe(caidaMs)
              expect(g.inicioMs).toBeLessThan(30_000)
            }
            // Mismo carril: salen separadas al menos la separación (no se pisan al caer).
            for (let c = 0; c < carriles; c++) {
              const enCarril = gotas.filter((g) => g.carril === c)
              for (let i = 1; i < enCarril.length; i++) {
                expect(enCarril[i].inicioMs - enCarril[i - 1].inicioMs).toBeGreaterThanOrEqual(separacion)
              }
              // Modo sin movimiento: dos a la vista al mismo tiempo nunca comparten casilla.
              for (const a of enCarril) {
                for (const b of enCarril) {
                  const juntas = a.id < b.id && b.inicioMs < a.inicioMs + a.caidaMs
                  if (juntas) expect(a.fila).not.toBe(b.fila)
                }
              }
              for (const g of enCarril) expect(g.fila).toBeLessThan(plan.filas)
            }
          }
        }
      })
    }
  }

  it("con dos objetivos, los reparte parejo", () => {
    const item: ItemLluvia = { id: "x", categoria: "palabras", objetivos: ["bola", "dedo"], distractores: ["dola", "bedo"] }
    const plan = planLluvia(item, "primario", 3, { azar: semilla(4) })
    const bola = plan.gotas.filter((g) => g.valor === "bola").length
    const dedo = plan.gotas.filter((g) => g.valor === "dedo").length
    expect(Math.abs(bola - dedo)).toBeLessThanOrEqual(1)
  })

  it("con un solo distractor y un solo carril sigue armando la lluvia (las gotas esperan su turno)", () => {
    const item: ItemLluvia = { id: "x", categoria: "vocales", objetivos: ["A"], distractores: ["E"] }
    const plan = planLluvia(item, "inicial", 1, { carriles: 1, azar: semilla(2) })
    expect(plan.gotas.every((g) => g.carril === 0)).toBe(true)
    expect(plan.gotas.filter((g) => !g.esObjetivo).every((g) => g.valor === "E")).toBe(true)
    // Las que salieron después del final no cuentan como aparecidas.
    expect(objetivosAparecidos(plan).length).toBeLessThanOrEqual(plan.gotas.filter((g) => g.esObjetivo).length)
  })

  it("con el azar y los carriles por defecto", () => {
    const [item] = generarLluvias("inicial", 1)
    expect(planLluvia(item, "inicial", 1).carriles).toBe(4)
  })
})

describe("gotasVisibles y objetivosAparecidos", () => {
  const item: ItemLluvia = { id: "x", categoria: "colores", objetivos: ["rojo"], distractores: ["azul", "verde"] }
  const plan = planLluvia(item, "inicial", 1, { azar: semilla(1) })

  it("cada gota se ve desde que sale hasta que llega abajo", () => {
    const g = plan.gotas[3]
    expect(gotasVisibles(plan, g.inicioMs - 1).some((v) => v.gota.id === g.id)).toBe(false)
    const mitad = gotasVisibles(plan, g.inicioMs + g.caidaMs / 2).find((v) => v.gota.id === g.id)
    expect(mitad?.progreso).toBeCloseTo(0.5)
    expect(gotasVisibles(plan, g.inicioMs + g.caidaMs).some((v) => v.gota.id === g.id)).toBe(false)
  })

  it("a los 30 s no queda nada a la vista", () => {
    expect(gotasVisibles(plan, 29_999).length).toBeGreaterThan(0)
    expect(gotasVisibles(plan, 30_000)).toEqual([])
  })

  it("objetivosAparecidos: los objetivos que salieron", () => {
    expect(objetivosAparecidos(plan)).toEqual(plan.gotas.filter((g) => g.esObjetivo).map((g) => g.id))
  })
})

describe("carrilesQueEntran", () => {
  it("usa los del nivel si entran; si no, los que entran (al menos 1)", () => {
    expect(carrilesQueEntran("primario", 900)).toBe(5)
    expect(carrilesQueEntran("primario", 343)).toBe(3)
    expect(carrilesQueEntran("inicial", 343)).toBe(4)
    expect(carrilesQueEntran("inicial", 10)).toBe(1)
  })
})

describe("crearReloj", () => {
  it("cuenta el tiempo sin las pausas", () => {
    let ahora = 1000
    const reloj = crearReloj(() => ahora)
    ahora = 3000
    expect(reloj.transcurrido()).toBe(2000)
    reloj.pausar()
    expect(reloj.pausado).toBe(true)
    ahora = 10_000
    expect(reloj.transcurrido()).toBe(2000)
    reloj.pausar() // pausar dos veces no cambia nada
    reloj.reanudar()
    expect(reloj.pausado).toBe(false)
    ahora = 10_500
    expect(reloj.transcurrido()).toBe(2500)
    reloj.reanudar() // reanudar sin pausa no cambia nada
    expect(reloj.transcurrido()).toBe(2500)
  })

  it("con el reloj por defecto arranca en cero", () => {
    expect(crearReloj().transcurrido()).toBeLessThan(50)
  })
})

describe("resultadoLluvia", () => {
  it("suma tocados sobre aparecidos más equivocados, y el conteo va al detalle", () => {
    let e = iniciarRondas(["L1", "L2"])
    e = reducirRondas(e, { tipo: "resolver", correcta: false })
    e = reducirRondas(e, { tipo: "siguiente" })
    e = reducirRondas(e, { tipo: "resolver", correcta: true })
    const r = resultadoLluvia(resultadoRondas(e), [
      { aparecieron: 8, tocados: 6, equivocados: 2 },
      { aparecieron: 7, tocados: 7, equivocados: 0 },
    ])
    expect([r.correctas, r.total]).toEqual([13, 17])
    expect(r.detalle[0]).toEqual({ item: "L1", correcta: false, intentos: 1, aparecieron: 8, tocados: 6, equivocados: 2 })
  })

  it("una lluvia sin conteo cuenta cero", () => {
    const e = reducirRondas(iniciarRondas(["L1"]), { tipo: "resolver", correcta: false })
    expect(resultadoLluvia(resultadoRondas(e), []).detalle[0]).toMatchObject({ aparecieron: 0, tocados: 0 })
  })
})
