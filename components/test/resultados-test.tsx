import { CheckCircle2, XCircle } from "lucide-react"
import { BLOQUE_NOMBRES, NIVEL_LABEL, type Nivel } from "@/lib/test/bloques"
import { porcentajeBloque, type BloqueResultado } from "@/lib/test/analisis"
import type { ConclusionTest } from "@/lib/types/database"

/**
 * Resultados de un test: porcentaje general, tabla por bloque y conclusión.
 * Solo usa datos que se guardan en la base (test + test_bloque_resultado),
 * así que sirve igual para la pantalla final del test y para un test del
 * historial. "X de Y respuestas correctas" sale de sumar correctas y total
 * de los bloques (la suma de correctas es puntaje_total).
 *
 * tema "oscuro": pantalla final del test (fondo degradado).
 * tema "claro": páginas de gestión (fondo gris claro).
 */
export function ResultadosTest({
  nivel,
  porcentajeTotal,
  conclusion,
  bloques,
  tema = "oscuro",
}: {
  nivel: Nivel
  porcentajeTotal: number
  conclusion: ConclusionTest | null
  bloques: BloqueResultado[]
  tema?: "oscuro" | "claro"
}) {
  const c = tema === "oscuro" ? OSCURO : CLARO
  const filas = [...bloques].sort((a, b) => a.orden - b.orden)
  const correctas = filas.reduce((acc, b) => acc + b.correctas, 0)
  const total = filas.reduce((acc, b) => acc + b.total, 0)
  const hayIndicadores = conclusion === "indicadores_detectados"

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

      {/* Conclusion */}
      <div className={`${c.tarjetaConclusion} p-6 flex items-start gap-4 ${hayIndicadores ? c.bordeIndicadores : c.bordeSinIndicadores}`}>
        {hayIndicadores ? (
          <XCircle className={`w-8 h-8 ${c.iconoIndicadores} shrink-0 mt-0.5`} />
        ) : (
          <CheckCircle2 className={`w-8 h-8 ${c.iconoSinIndicadores} shrink-0 mt-0.5`} />
        )}
        <div>
          <p className={`font-semibold text-lg ${hayIndicadores ? c.tituloIndicadores : c.tituloSinIndicadores}`}>
            {hayIndicadores
              ? "Se detectaron indicadores de dislexia"
              : "No se detectaron indicadores significativos"}
          </p>
          <p className={`text-sm ${c.textoSuave} mt-2`}>
            Este test es orientativo y <span className={`font-semibold ${c.textoDestacado}`}>no reemplaza un diagnóstico profesional</span>.
            Te recomendamos consultar con un especialista para una evaluación completa.
          </p>
        </div>
      </div>
    </div>
  )
}

/* Clases idénticas a las de la pantalla final original del test. */
const OSCURO = {
  tarjeta: "rounded-2xl bg-white/10 backdrop-blur-md border border-white/20",
  tarjetaConclusion: "rounded-2xl bg-white/10 backdrop-blur-md border",
  thead: "bg-white/10",
  borde: "border-white/10",
  texto: "text-white",
  textoSuave: "text-white/70",
  textoDestacado: "text-white/90",
  pct80: "text-green-400",
  pct60: "text-yellow-400",
  pct40: "text-orange-400",
  pctBajo: "text-red-400",
  bordeIndicadores: "border-red-400/60",
  bordeSinIndicadores: "border-green-400/60",
  iconoIndicadores: "text-red-400",
  iconoSinIndicadores: "text-green-400",
  tituloIndicadores: "text-red-300",
  tituloSinIndicadores: "text-green-300",
}

const CLARO: typeof OSCURO = {
  tarjeta: "rounded-xl bg-white border-2 shadow-sm",
  tarjetaConclusion: "rounded-xl bg-white border-2 shadow-sm",
  thead: "bg-gray-50",
  borde: "border-gray-200",
  texto: "text-gray-900",
  textoSuave: "text-gray-600",
  textoDestacado: "text-gray-900",
  pct80: "text-green-600",
  pct60: "text-yellow-600",
  pct40: "text-orange-600",
  pctBajo: "text-red-600",
  bordeIndicadores: "border-red-300",
  bordeSinIndicadores: "border-green-300",
  iconoIndicadores: "text-red-500",
  iconoSinIndicadores: "text-green-600",
  tituloIndicadores: "text-red-700",
  tituloSinIndicadores: "text-green-700",
}
