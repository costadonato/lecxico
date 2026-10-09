import { BLOQUE_NOMBRES, NIVEL_LABEL, type Nivel } from "@/lib/test/bloques"
import { porcentajeBloque, type BloqueResultado } from "@/lib/test/analisis"

/**
 * Resultados de una evaluación: porcentaje general y tabla por bloque.
 * Solo usa datos que se guardan en la base (test + test_bloque_resultado),
 * así que sirve igual para la pantalla final y para una evaluación del
 * historial. "X de Y respuestas correctas" sale de sumar correctas y total
 * de los bloques (la suma de correctas es puntaje_total).
 *
 * No muestra la conclusión (indicadores sí/no): se sigue guardando en
 * test.conclusion, pero en pantalla solo va una aclaración neutra.
 *
 * tema "oscuro": pantalla final de la evaluación (fondo degradado).
 * tema "claro": páginas de gestión (fondo gris claro).
 */
export function ResultadosTest({
  nivel,
  porcentajeTotal,
  bloques,
  tema = "oscuro",
}: {
  nivel: Nivel
  porcentajeTotal: number
  bloques: BloqueResultado[]
  tema?: "oscuro" | "claro"
}) {
  const c = tema === "oscuro" ? OSCURO : CLARO
  const filas = [...bloques].sort((a, b) => a.orden - b.orden)
  const correctas = filas.reduce((acc, b) => acc + b.correctas, 0)
  const total = filas.reduce((acc, b) => acc + b.total, 0)

  const colorPorcentaje = (pct: number) => {
    if (pct >= 80) return c.pct80
    if (pct >= 60) return c.pct60
    if (pct >= 40) return c.pct40
    return c.pctBajo
  }

  return (
    <div className="space-y-8">
      {/* Score summary */}
      <div className={`${c.tarjeta} p-8 text-center`}>
        <p className={`text-5xl font-extrabold ${c.texto}`}>{porcentajeTotal}%</p>
        <p className={`text-lg ${c.textoSuave} mt-2`}>{correctas} de {total} respuestas correctas</p>
      </div>

      {/* Table */}
      <div className={`${c.tarjeta} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" aria-label={`Resultados por bloque · Nivel ${NIVEL_LABEL[nivel]}`}>
            <thead className={c.thead}>
              <tr>
                <th className={`py-3 px-4 ${c.texto} font-semibold`}>Bloque</th>
                <th className={`py-3 px-4 text-center ${c.texto} font-semibold`}>Correctas</th>
                <th className={`py-3 px-4 text-center ${c.texto} font-semibold`}>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((b) => {
                const pct = porcentajeBloque(b.correctas, b.total)
                return (
                  <tr key={b.bloque_codigo} className={`border-t ${c.borde}`}>
                    <td className={`py-3 px-4 font-medium ${c.texto}`}>{BLOQUE_NOMBRES[b.bloque_codigo]}</td>
                    <td className={`py-3 px-4 text-center ${c.textoSuave}`}>{b.correctas} / {b.total}</td>
                    <td className={`py-3 px-4 text-center font-bold ${colorPorcentaje(pct)}`}>{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className={`text-sm text-center ${c.textoSuave}`}>
        Esta evaluación es orientativa y no reemplaza un diagnóstico profesional.
      </p>
    </div>
  )
}

/* Clases idénticas a las de la pantalla final original de la evaluación. */
const OSCURO = {
  tarjeta: "rounded-2xl bg-white/10 backdrop-blur-md border border-white/20",
  thead: "bg-white/10",
  borde: "border-white/10",
  texto: "text-white",
  textoSuave: "text-white/70",
  pct80: "text-green-400",
  pct60: "text-yellow-400",
  pct40: "text-orange-400",
  pctBajo: "text-red-400",
}

const CLARO: typeof OSCURO = {
  tarjeta: "rounded-xl bg-white border-2 shadow-sm",
  thead: "bg-gray-50",
  borde: "border-gray-200",
  texto: "text-gray-900",
  textoSuave: "text-gray-600",
  pct80: "text-green-600",
  pct60: "text-yellow-600",
  pct40: "text-orange-600",
  pctBajo: "text-red-600",
}
