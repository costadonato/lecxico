import Link from "next/link"
import { ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EstadoVacio } from "@/components/estados"
import { BarraPorcentaje } from "@/components/motion/barra-porcentaje"
import { NumeroAnimado } from "@/components/motion/numero-animado"
import { Seccion } from "@/components/seccion"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { formatearFecha } from "@/lib/fechas"
import { estiloNivel } from "@/lib/niveles"
import { bloquesMasDebiles } from "@/lib/test/analisis"
import { BLOQUE_NOMBRES, NIVEL_LABEL } from "@/lib/test/bloques"
import type { TestConBloques } from "@/lib/ninos/detalle"
import { cn } from "@/lib/utils"

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
    <Seccion icono={<ClipboardList />} tono="celeste" titulo="Historial de evaluaciones">
      {tests.length === 0 ? (
        <EstadoVacio compacto descripcion="Todavía no hay evaluaciones registradas." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 max-md:rounded-none max-md:border-0">
          <Table tarjetasEnCelular>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Porcentaje general</TableHead>
                <TableHead>Bloque(s) con más errores</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <CuerpoTablaAnimado>
              {tests.map((t) => {
                const debiles = bloquesMasDebiles(t.bloques)
                return (
                  <FilaTablaAnimada key={t.id}>
                    <TableCell data-label="Fecha" className="font-medium tabular-nums">
                      {formatearFecha(t.fecha)}
                    </TableCell>
                    <TableCell data-label="Nivel">
                      <Badge variant="celeste">{NIVEL_LABEL[t.nivel]}</Badge>
                    </TableCell>
                    <TableCell data-label="Porcentaje general">
                      <span className="flex items-center gap-3 max-md:justify-end">
                        <NumeroAnimado
                          valor={t.porcentaje_total}
                          sufijo="%"
                          className={cn("inline-block min-w-12 text-right font-bold", estiloNivel(t.porcentaje_total).texto)}
                        />
                        <BarraPorcentaje valor={t.porcentaje_total} className="w-20 max-md:w-16" />
                      </span>
                    </TableCell>
                    <TableCell data-label="Bloque(s) con más errores" className="whitespace-normal">
                      {debiles.length > 0 ? debiles.map((b) => BLOQUE_NOMBRES[b.bloque_codigo]).join(", ") : "Ninguno"}
                    </TableCell>
                    <TableCell data-acciones className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={urlDetalle(t.id)}>Ver detalle</Link>
                      </Button>
                    </TableCell>
                  </FilaTablaAnimada>
                )
              })}
            </CuerpoTablaAnimado>
          </Table>
        </div>
      )}
    </Seccion>
  )
}
