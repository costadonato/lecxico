"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { Gamepad2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DialogoVincularNino } from "@/components/dialogo-vincular-nino"
import { Cargando, EstadoVacio } from "@/components/estados"
import { Iniciales } from "@/components/iniciales"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { createClient } from "@/lib/supabase/client"
import { ultimasPartidas, type UltimaPartida } from "@/lib/entrenamiento/partidas"
import { nombreJuego, rutaConsulta } from "@/lib/entrenamiento/presentacion"
import { formatearFecha } from "@/lib/fechas"
import { NIVEL_LABEL } from "@/lib/test/bloques"
import { ninosParaTest } from "@/lib/test/ninos-para-test"
import { useRecargaVinculos } from "@/lib/vinculos"
import type { NinoParaTest } from "@/lib/types/database"

/** Minúsculas y sin tildes, para que "perez" encuentre a "Pérez". */
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

interface Datos {
  ninos: NinoParaTest[]
  ultimas: Map<string, UltimaPartida>
}

/**
 * Tabla de /entrenar: los niños con vínculo activo del profesional, su
 * último entrenamiento visible y "Entrenar en consulta". Misma estructura
 * que la tabla de /test (búsqueda, tarjetas en celular, estado vacío).
 */
export function TablaNinosParaEntrenar() {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")

  const recargar = useCallback(async () => {
    try {
      // ninos_para_test devuelve los niños con vínculo activo, que son los que se pueden entrenar.
      const ninos = await ninosParaTest()
      const ultimas = await ultimasPartidas(
        createClient(),
        ninos.map((n) => n.nino_id),
      )
      setDatos({ ninos, ultimas })
      setErrorCarga(null)
    } catch (e) {
      console.error("entrenar:", e)
      setErrorCarga("No se pudo cargar la lista de niños. Recargá la página.")
    }
  }, [])

  // Al volver a la pestaña se recarga (un vínculo nuevo, una partida nueva).
  useRecargaVinculos(recargar)

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda)
    if (!datos || !q) return datos?.ninos ?? []
    return datos.ninos.filter((n) =>
      [n.nombre, n.apellido, `${n.nombre} ${n.apellido}`, n.nombre_usuario].some((campo) => normalizar(campo).includes(q)),
    )
  }, [datos, busqueda])

  if (errorCarga) return <MensajeAlerta tipo="error" texto={errorCarga} />
  if (!datos) return <Cargando />

  if (datos.ninos.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no hay niños para entrenar."
        descripcion={
          <p>
            Solo podés entrenar con niños con los que tenés un vínculo activo. Pedile el nombre de usuario del niño a su
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
              <TableHead>Nivel</TableHead>
              <TableHead>Último entrenamiento</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <CuerpoTablaAnimado>
            {filtrados.map((n) => {
              const ultima = datos.ultimas.get(n.nino_id)
              return (
                <FilaTablaAnimada key={n.nino_id}>
                  <TableCell data-label="Nombre completo" className="font-semibold">
                    <span className="flex items-center gap-3 max-md:justify-end">
                      <Iniciales nombre={n.nombre} apellido={n.apellido} semilla={n.nombre_usuario} className="max-md:hidden" />
                      {n.nombre} {n.apellido}
                    </span>
                  </TableCell>
                  <TableCell data-label="Nivel">
                    <Badge variant="celeste">{NIVEL_LABEL[n.nivel]}</Badge>
                  </TableCell>
                  <TableCell data-label="Último entrenamiento" className="whitespace-normal">
                    {ultima ? (
                      <span className="flex flex-col max-md:items-end">
                        <span className="tabular-nums">{formatearFecha(ultima.fecha)}</span>
                        <span className="text-sm text-muted-foreground">
                          {nombreJuego(ultima.juego)}, grado {ultima.grado}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Todavía no entrenó</span>
                    )}
                  </TableCell>
                  <TableCell data-acciones className="text-right">
                    <Button size="sm" asChild>
                      <Link href={rutaConsulta(n.nino_id)}>
                        <Gamepad2 className="mr-1.5 size-4" aria-hidden="true" />
                        Entrenar en consulta
                      </Link>
                    </Button>
                  </TableCell>
                </FilaTablaAnimada>
              )
            })}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="whitespace-normal px-4 py-8 text-center text-muted-foreground">
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
