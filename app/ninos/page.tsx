"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PaginaApp } from "@/components/pagina-app"
import { ConfirmarDialog, type Confirmacion } from "@/components/confirmar-dialog"
import { DialogoVincularNino } from "@/components/dialogo-vincular-nino"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { formatearFecha } from "@/lib/fechas"
import { ETAPAS_ESCOLARES } from "@/lib/test/bloques"
import {
  desvincular,
  invitarNino,
  MENSAJE_INVITACION_ENVIADA,
  useRecargaVinculos,
  vinculosDelProfesional,
} from "@/lib/vinculos"
import type { VinculoDelProfesional } from "@/lib/types/database"

const etiquetaEtapa = (valor: string | null) => ETAPAS_ESCOLARES.find((e) => e.valor === valor)?.label ?? ""

export default function NinosPage() {
  const pagina = usePerfilPagina("profesional")
  return (
    <PaginaApp pagina={pagina} titulo="Mis niños" acciones={<DialogoVincularNino />}>
      {() => <TablaNinos />}
    </PaginaApp>
  )
}

/* ------------------------------------------------------------------ */
/*  Tabla                                                              */
/* ------------------------------------------------------------------ */
function TablaNinos() {
  const [vinculos, setVinculos] = useState<VinculoDelProfesional[] | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null)
  const [reafiliando, setReafiliando] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)

  const recargar = useCallback(async () => {
    try {
      setVinculos(await vinculosDelProfesional())
      setErrorCarga(null)
    } catch (e) {
      console.error("ninos:", e)
      setErrorCarga("No se pudo cargar la lista de niños. Recargá la página.")
    }
  }, [])

  useRecargaVinculos(recargar)

  // Activos primero (por apellido y nombre), inactivos al final (por usuario).
  // Los pendientes se ven en la campanita.
  const comparar = (a: string, b: string) => a.localeCompare(b, "es", { sensitivity: "base" })
  const activos = (vinculos ?? [])
    .filter((v) => v.estado === "activa")
    .sort((a, b) => comparar(a.apellido ?? "", b.apellido ?? "") || comparar(a.nombre ?? "", b.nombre ?? ""))
  const inactivos = (vinculos ?? [])
    .filter((v) => v.estado === "inactiva")
    .sort((a, b) => comparar(a.nombre_usuario, b.nombre_usuario))

  const pedirBaja = (v: VinculoDelProfesional) =>
    setConfirmacion({
      titulo: `¿Dar de baja a ${v.nombre} ${v.apellido}?`,
      descripcion:
        "Vas a dejar de ver su información (datos, evaluaciones y entrenamientos). Podés volver a invitarlo cuando quieras con su nombre de usuario.",
      textoConfirmar: "Dar de baja",
      accion: async () => {
        await desvincular(v.vinculo_id)
        setAviso(null)
      },
    })

  const reafiliar = async (v: VinculoDelProfesional) => {
    setReafiliando(v.vinculo_id)
    setAviso(null)
    try {
      await invitarNino(v.nombre_usuario)
      setAviso({ tipo: "ok", texto: MENSAJE_INVITACION_ENVIADA })
    } catch (e) {
      setAviso({ tipo: "error", texto: e instanceof Error ? e.message : "No se pudo enviar la invitación." })
    } finally {
      setReafiliando(null)
    }
  }

  if (errorCarga) return <MensajeAlerta tipo="error" texto={errorCarga} />
  if (!vinculos) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      {aviso && <MensajeAlerta tipo={aviso.tipo} texto={aviso.texto} />}

      {activos.length === 0 && inactivos.length === 0 ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <Users className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-semibold">Todavía no tenés niños vinculados.</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Para vincular a un niño necesitás su nombre de usuario: pedíselo a su madre, padre o tutor/a, que lo eligió al
              crear la cuenta. Después tocá “Vincular nuevo niño”; cuando el tutor acepte la invitación, el niño va a
              aparecer acá.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 shadow-sm overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-left">
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Apellido</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Etapa escolar</th>
                  <th className="px-4 py-3 font-semibold">Fecha de vinculación</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((v) => (
                  <tr key={v.vinculo_id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{v.nombre}</td>
                    <td className="px-4 py-3 font-medium">{v.apellido}</td>
                    <td className="px-4 py-3 text-muted-foreground">@{v.nombre_usuario}</td>
                    <td className="px-4 py-3">{etiquetaEtapa(v.etapa_escolar)}</td>
                    <td className="px-4 py-3">{formatearFecha(v.fecha_afiliacion)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/ninos/${v.nino_id}`}>Ver detalle</Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => pedirBaja(v)}>
                          Dar de baja
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {inactivos.map((v) => (
                  <tr key={v.vinculo_id} className="border-b last:border-b-0 bg-gray-50 text-gray-400">
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3">
                      @{v.nombre_usuario}
                      <span className="ml-2 text-xs">(dado de baja)</span>
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => reafiliar(v)} disabled={reafiliando !== null}>
                        {reafiliando === v.vinculo_id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        Volver a vincular
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmarDialog confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} />
    </>
  )
}
