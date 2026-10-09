"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Cargando, EstadoVacio } from "@/components/estados"
import { Iniciales } from "@/components/iniciales"
import { BarraPorcentaje } from "@/components/motion/barra-porcentaje"
import { NumeroAnimado } from "@/components/motion/numero-animado"
import { PaginaApp } from "@/components/pagina-app"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { DialogoVincularNino } from "@/components/dialogo-vincular-nino"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { estiloNivel } from "@/lib/niveles"
import { NIVEL_LABEL, rutaDelTest } from "@/lib/test/bloques"
import { ninosParaTest } from "@/lib/test/ninos-para-test"
import { useRecargaVinculos } from "@/lib/vinculos"
import type { NinoParaTest } from "@/lib/types/database"
import { cn } from "@/lib/utils"

/** Paso previo a la evaluación: el profesional elige a qué niño (con vínculo activo) evaluar. */
export default function SeleccionNinoTestPage() {
  const pagina = usePerfilPagina("profesional")
  return (
    <PaginaApp
      pagina={pagina}
      titulo="Evaluación de indicadores de dislexia"
      acciones={<DialogoVincularNino />}
      ancho="max-w-6xl"
    >
      {() => <TablaNinosParaTest />}
    </PaginaApp>
  )
}

/** Minúsculas y sin tildes, para que "perez" encuentre a "Pérez". */
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

function TablaNinosParaTest() {
  const [ninos, setNinos] = useState<NinoParaTest[] | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")

  const recargar = useCallback(async () => {
    try {
      setNinos(await ninosParaTest())
      setErrorCarga(null)
    } catch (e) {
      console.error("test:", e)
      setErrorCarga("No se pudo cargar la lista de niños. Recargá la página.")
    }
  }, [])

  // Al volver a la pestaña se recarga: así aparece un niño cuyo tutor acaba
  // de aceptar la invitación, y se actualiza la última evaluación.
  useRecargaVinculos(recargar)

  // Filtra solo la lista ya cargada (sin consultas nuevas).
  const filtrados = useMemo(() => {
    const q = normalizar(busqueda)
    if (!ninos || !q) return ninos ?? []
    return ninos.filter((n) =>
      [n.nombre, n.apellido, `${n.nombre} ${n.apellido}`, n.nombre_usuario].some((campo) => normalizar(campo).includes(q)),
    )
  }, [ninos, busqueda])

  if (errorCarga) return <MensajeAlerta tipo="error" texto={errorCarga} />
  if (!ninos) {
    return <Cargando />
  }

  if (ninos.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no hay niños para evaluar."
        descripcion={
          <p>
            Solo podés evaluar a niños con los que tenés un vínculo activo. Pedile el nombre de usuario del niño a su
            madre, padre o tutor/a y enviale una invitación; cuando la acepten, el niño va a aparecer en esta lista.
          </p>
        }
        accion={<DialogoVincularNino variant="outline" />}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o usuario"
          className="h-12 rounded-full pl-12 shadow-suave"
          aria-label="Buscar niño"
        />
      </div>

      <Card className="overflow-hidden py-0 max-md:border-0 max-md:bg-transparent max-md:shadow-none">
        <Table tarjetasEnCelular>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Última evaluación</TableHead>
              <TableHead>Porcentaje</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <CuerpoTablaAnimado>
            {filtrados.map((n) => (
              <FilaTablaAnimada key={n.nino_id}>
                <TableCell data-label="Nombre completo" className="font-semibold">
                  <span className="flex items-center gap-3 max-md:justify-end">
                    <Iniciales nombre={n.nombre} apellido={n.apellido} semilla={n.nombre_usuario} className="max-md:hidden" />
                    {n.nombre} {n.apellido}
                  </span>
                </TableCell>
                <TableCell data-label="Usuario" className="text-muted-foreground">@{n.nombre_usuario}</TableCell>
                <TableCell data-label="Nivel">
                  <Badge variant="celeste">{NIVEL_LABEL[n.nivel]}</Badge>
                </TableCell>
                <TableCell data-label="Última evaluación" className="tabular-nums">
                  {n.fecha_ultimo_test ? formatearFecha(n.fecha_ultimo_test) : <span className="text-muted-foreground">Sin evaluaciones</span>}
                </TableCell>
                <TableCell data-label="Porcentaje">
                  {n.porcentaje_ultimo_test !== null ? (
                    <span className="flex items-center gap-3 max-md:justify-end">
                      <NumeroAnimado
                        valor={n.porcentaje_ultimo_test}
                        sufijo="%"
                        className={cn("inline-block min-w-12 text-right font-bold", estiloNivel(n.porcentaje_ultimo_test).texto)}
                      />
                      <BarraPorcentaje valor={n.porcentaje_ultimo_test} className="w-16" />
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell data-acciones className="text-right">
                  <Button size="sm" asChild>
                    <Link href={rutaDelTest(n.nivel, n.nino_id)}>Tomar evaluación</Link>
                  </Button>
                </TableCell>
              </FilaTablaAnimada>
            ))}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="whitespace-normal px-4 py-8 text-center text-muted-foreground">
                  Ningún niño coincide con “{busqueda.trim()}”.
                </TableCell>
              </TableRow>
            )}
          </CuerpoTablaAnimado>
        </Table>
      </Card>
    </div>
  )
}
