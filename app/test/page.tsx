"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { ClipboardList, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PaginaApp } from "@/components/pagina-app"
import { DialogoVincularNino } from "@/components/dialogo-vincular-nino"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { NIVEL_LABEL, rutaDelTest } from "@/lib/test/bloques"
import { ninosParaTest } from "@/lib/test/ninos-para-test"
import { useRecargaVinculos } from "@/lib/vinculos"
import type { NinoParaTest } from "@/lib/types/database"

/** Paso previo a la evaluación: el profesional elige a qué niño (con vínculo activo) evaluar. */
export default function SeleccionNinoTestPage() {
  const pagina = usePerfilPagina("profesional")
  return (
    <PaginaApp pagina={pagina} titulo="Evaluación de indicadores de dislexia" acciones={<DialogoVincularNino />}>
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
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (ninos.length === 0) {
    return (
      <Card className="border-2 shadow-sm">
        <CardContent className="py-12 text-center space-y-4">
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-semibold">Todavía no hay niños para evaluar.</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Solo podés evaluar a niños con los que tenés un vínculo activo. Pedile el nombre de usuario del niño a su
            madre, padre o tutor/a y enviale una invitación; cuando la acepten, el niño va a aparecer en esta lista.
          </p>
          <DialogoVincularNino variant="outline" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o usuario"
          className="pl-9 bg-white"
          aria-label="Buscar niño"
        />
      </div>

      <Card className="border-2 shadow-sm overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold">Nombre completo</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Nivel</th>
                <th className="px-4 py-3 font-semibold">Última evaluación</th>
                <th className="px-4 py-3 font-semibold">Porcentaje</th>
                <th className="px-4 py-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((n) => (
                <tr key={n.nino_id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">
                    {n.nombre} {n.apellido}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">@{n.nombre_usuario}</td>
                  <td className="px-4 py-3">{NIVEL_LABEL[n.nivel]}</td>
                  <td className="px-4 py-3">
                    {n.fecha_ultimo_test ? formatearFecha(n.fecha_ultimo_test) : <span className="text-muted-foreground">Sin evaluaciones</span>}
                  </td>
                  <td className="px-4 py-3">
                    {n.porcentaje_ultimo_test !== null ? `${n.porcentaje_ultimo_test}%` : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" asChild>
                      <Link href={rutaDelTest(n.nivel, n.nino_id)}>Tomar evaluación</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Ningún niño coincide con “{busqueda.trim()}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
