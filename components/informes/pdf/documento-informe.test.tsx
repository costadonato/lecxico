import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { renderToBuffer } from "@react-pdf/renderer"
import { beforeAll, describe, expect, it } from "vitest"

import { DocumentoInforme } from "@/components/informes/pdf/documento-informe"
import { registrarFuentes } from "@/components/informes/pdf/estilos"
import { HOY_EJEMPLO, datosEjemplo, opcionesEjemplo } from "@/lib/informes/ejemplo"
import { construirInforme, type ModeloInforme } from "@/lib/informes/modelo"

/*
 * El PDF se arma sin fallar con el modelo mínimo (solo evaluación) y con el
 * completo. Con `npm run informe:ejemplo` (vitest --mode evidencia) además
 * guarda el completo en docs/evidencias/informe-ejemplo.pdf, con datos
 * ficticios (lib/informes/ejemplo.ts).
 */

const modo = (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE

const render = (modelo: ModeloInforme) => renderToBuffer(<DocumentoInforme modelo={modelo} />)

/** Cantidad de páginas del PDF (cada página es un objeto /Type /Page). */
const paginas = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length

beforeAll(() => {
  registrarFuentes(path.join(process.cwd(), "public", "fonts"))
})

describe("DocumentoInforme", () => {
  it("modelo mínimo: solo evaluación", async () => {
    const modelo = construirInforme(
      datosEjemplo(),
      opcionesEjemplo({ seguimiento: false, incluirRecomendacion: false, observaciones: "" }),
      "profesional",
      HOY_EJEMPLO,
    )
    const pdf = await render(modelo)
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-")
    expect(paginas(pdf)).toBeGreaterThanOrEqual(1)
  }, 30_000)

  it("modelo completo: los dos contenidos, todas las secciones y observaciones", async () => {
    const modelo = construirInforme(datosEjemplo(), opcionesEjemplo(), "profesional", HOY_EJEMPLO)
    const pdf = await render(modelo)
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-")
    expect(paginas(pdf)).toBeGreaterThan(1)
    if (modo === "evidencia") {
      const destino = path.join(process.cwd(), "docs", "evidencias", "informe-ejemplo.pdf")
      mkdirSync(path.dirname(destino), { recursive: true })
      writeFileSync(destino, pdf)
    }
  }, 30_000)

  it("secciones vacías, un niño sin evaluaciones y la variante tutor", async () => {
    const vacio = construirInforme(
      datosEjemplo({ tests: [], partidas: [], tareas: [] }),
      opcionesEjemplo({ testId: null }),
      "profesional",
      HOY_EJEMPLO,
    )
    expect((await render(vacio)).subarray(0, 5).toString()).toBe("%PDF-")
    const tutor = construirInforme(datosEjemplo({ emisor: null }), opcionesEjemplo(), "tutor", HOY_EJEMPLO)
    expect((await render(tutor)).subarray(0, 5).toString()).toBe("%PDF-")
  }, 30_000)
})
