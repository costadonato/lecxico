import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { JUEGOS, consignaDe, gradoTrasPartida, juegosDelNivel, porcentaje, type Grado } from "@/lib/entrenamiento/juegos"
import { BLOQUES_POR_NIVEL, type Nivel } from "@/lib/test/bloques"

/** Filas del insert de entrenamiento_juego en la 0008: código, niveles y solo_consulta. */
function juegosDeLaMigracion() {
  const sql = readFileSync(join(process.cwd(), "supabase/migrations/0008_s12_entrenamiento.sql"), "utf8")
  const fila = /\('([a-z_]+)',\s*array\[([^\]]+)\],\s*(true|false)\)/g
  return [...sql.matchAll(fila)].map((m) => ({
    codigo: m[1],
    niveles: m[2].split(",").map((n) => n.trim().replace(/'/g, "")),
    soloConsulta: m[3] === "true",
  }))
}

describe("catálogo y migración 0008", () => {
  const migracion = juegosDeLaMigracion()

  it("la migración tiene los 14 juegos", () => {
    expect(migracion).toHaveLength(14)
  })

  it("los códigos coinciden con los de la 0008", () => {
    expect(Object.keys(JUEGOS).sort()).toEqual(migracion.map((j) => j.codigo).sort())
  })

  it("cada juego tiene los mismos niveles y el mismo 'solo consulta' que en la base", () => {
    for (const fila of migracion) {
      const juego = JUEGOS[fila.codigo as keyof typeof JUEGOS]
      expect(Object.keys(juego.niveles).sort(), fila.codigo).toEqual([...fila.niveles].sort())
      expect(juego.soloConsulta, fila.codigo).toBe(fila.soloConsulta)
    }
  })

  it("el código de cada ficha es su clave", () => {
    for (const [clave, juego] of Object.entries(JUEGOS)) expect(juego.codigo).toBe(clave)
  })
})

describe("fichas por nivel", () => {
  const fichas = Object.values(JUEGOS).flatMap((j) =>
    (Object.entries(j.niveles) as [Nivel, NonNullable<(typeof j.niveles)[Nivel]>][]).map(([nivel, ficha]) => ({
      codigo: j.codigo,
      nivel,
      ficha,
    })),
  )

  it("cada bloque existe en BLOQUES_POR_NIVEL de su nivel", () => {
    for (const { codigo, nivel, ficha } of fichas) {
      expect(BLOQUES_POR_NIVEL[nivel], `${codigo} ${nivel}`).toContain(ficha.bloque)
    }
  })

  it("cada grado tiene un tamaño de partida positivo y una descripción", () => {
    for (const { codigo, ficha } of fichas) {
      for (const g of [1, 2, 3] as Grado[]) {
        expect(ficha.partida[g], codigo).toBeGreaterThan(0)
        expect(ficha.grados[g].length, codigo).toBeGreaterThan(0)
      }
      expect(ficha.consigna.length).toBeGreaterThan(0)
    }
  })

  it("cada bloque de cada nivel tiene al menos un juego principal", () => {
    for (const nivel of ["inicial", "primario"] as Nivel[]) {
      for (const bloque of BLOQUES_POR_NIVEL[nivel]) {
        const principal = fichas.some((f) => f.nivel === nivel && f.ficha.bloque === bloque && f.ficha.rol === "principal")
        expect(principal, `${nivel} ${bloque}`).toBe(true)
      }
    }
  })
})

describe("juegosDelNivel", () => {
  it("sin los de solo consulta no incluye Nombrá rápido", () => {
    const codigos = juegosDelNivel("inicial", { incluirSoloConsulta: false }).map((j) => j.codigo)
    expect(codigos).not.toContain("nombra")
    expect(codigos).toContain("detective")
    expect(codigos).not.toContain("rompe")
  })

  it("con los de solo consulta incluye Nombrá rápido", () => {
    expect(juegosDelNivel("primario", { incluirSoloConsulta: true }).map((j) => j.codigo)).toContain("nombra")
  })
})

describe("porcentaje", () => {
  it("redondea como la columna generada de la base", () => {
    expect(porcentaje(7, 8)).toBe(88)
    expect(porcentaje(4, 5)).toBe(80)
    expect(porcentaje(1, 3)).toBe(33)
    expect(porcentaje(2, 3)).toBe(67)
    expect(porcentaje(0, 8)).toBe(0)
    expect(porcentaje(8, 8)).toBe(100)
  })
})

describe("gradoTrasPartida", () => {
  it("con 80 % o más habilita el grado siguiente", () => {
    expect(gradoTrasPartida(1, 1, 80, false)).toBe(2)
    expect(gradoTrasPartida(2, 2, 100, false)).toBe(3)
  })

  it("con menos de 80 % no cambia", () => {
    expect(gradoTrasPartida(1, 1, 79, false)).toBe(1)
    expect(gradoTrasPartida(2, 2, 0, false)).toBe(2)
  })

  it("no pasa del grado 3", () => {
    expect(gradoTrasPartida(3, 3, 100, false)).toBe(3)
  })

  it("no baja el grado habilitado al jugar uno anterior", () => {
    expect(gradoTrasPartida(3, 1, 100, false)).toBe(3)
  })

  it("en consulta o tarea, un grado alto aprobado habilita hasta el siguiente", () => {
    expect(gradoTrasPartida(1, 2, 90, false)).toBe(3)
  })

  it("las partidas de una misión no desbloquean", () => {
    expect(gradoTrasPartida(1, 1, 100, true)).toBe(1)
  })
})

describe("consignaDe", () => {
  it("Palabras de otro planeta tiene su consigna para la consulta", () => {
    const ficha = JUEGOS.planeta.niveles.primario!
    expect(consignaDe(ficha, "consulta")).toMatch(/en voz alta/)
    expect(consignaDe(ficha, "practica")).toBe(ficha.consigna)
    expect(consignaDe(ficha, "tarea")).toBe(ficha.consigna)
  })

  it("los demás juegos usan la misma consigna en todos los orígenes", () => {
    const ficha = JUEGOS.detective.niveles.inicial!
    expect(consignaDe(ficha, "consulta")).toBe(ficha.consigna)
  })
})
