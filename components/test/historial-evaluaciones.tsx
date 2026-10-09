import Link from "next/link"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Seccion } from "@/components/seccion"
import { formatearFecha } from "@/lib/fechas"
import { bloquesMasDebiles } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, NIVEL_LABEL } from "@/lib/test/bloques"
import type { TestConBloques } from "@/lib/ninos/detalle"

/**
 * Sección "Historial de evaluaciones": todas las evaluaciones, de la más
 * reciente a la más vieja. La usan el detalle del niño (profesional) y
 * /perfil (niño); cada uno indica a dónde lleva "Ver detalle".
 */
export function HistorialEvaluaciones({
  tests,
  urlDetalle,
}: {
  tests: TestConBloques[]
  urlDetalle: (testId: string) => string
}) {
  return (
    <Seccion icono={<ClipboardList className="w-5 h-5" />} colorIcono="bg-blue-100 text-blue-600" titulo="Historial de evaluaciones">
      {tests.length === 0 ? (
        <p className="text-center text-gray-500 py-6">Todavía no hay evaluaciones registradas.</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-2 font-semibold">Fecha</th>
                <th className="px-4 py-2 font-semibold">Nivel</th>
                <th className="px-4 py-2 font-semibold">Porcentaje general</th>
                <th className="px-4 py-2 font-semibold">Bloque(s) con más errores</th>
                <th className="px-4 py-2 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => {
                const debiles = bloquesMasDebiles(t.bloques)
                return (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="px-4 py-2">{formatearFecha(t.fecha)}</td>
                    <td className="px-4 py-2">{NIVEL_LABEL[t.nivel]}</td>
                    <td className="px-4 py-2 font-medium">{t.porcentaje_total}%</td>
                    <td className="px-4 py-2">
                      {debiles.length > 0 ? debiles.map((b) => BLOQUE_NOMBRES[b.bloque_codigo]).join(", ") : "Ninguno"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={urlDetalle(t.id)}>Ver detalle</Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Seccion>
  )
}
