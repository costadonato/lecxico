"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, User, Mail, Dumbbell, Gamepad2 } from "lucide-react"
import { Cargando, EstadoVacio } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { MarcoPagina } from "@/components/pagina-app"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { CaraPersonaje } from "@/components/personajes/personaje"
import { Seccion } from "@/components/seccion"
import { CuerpoTablaAnimado, FilaTablaAnimada } from "@/components/tabla-animada"
import { HistorialEvaluaciones } from "@/components/test/historial-evaluaciones"
import { obtenerPerfilActual } from "@/lib/auth/perfil"
import { cargarTestsConBloques, type TestConBloques } from "@/lib/ninos/detalle"
import type { Entrenamiento, Profile } from "@/lib/types/database"

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [evaluaciones, setEvaluaciones] = useState<TestConBloques[]>([])
  const [errorEvaluaciones, setErrorEvaluaciones] = useState(false)
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([])

  useEffect(() => {
    const load = async () => {
      const actual = await obtenerPerfilActual(supabase).catch((e) => {
        console.error("perfil:", e)
        return undefined
      })
      if (actual === null) {
        router.push("/login")
        return
      }
      const user = actual?.user ?? (await supabase.auth.getUser()).data.user
      if (!user) {
        router.push("/login")
        return
      }

      setProfile(actual?.profile ?? null)
      setFirstName(actual?.profile?.nombre ?? "")
      setLastName(actual?.profile?.apellido ?? "")
      setEmail(user.email || "")

      // Historial de evaluaciones (con los bloques en una sola consulta)
      try {
        setEvaluaciones(await cargarTestsConBloques(supabase, user.id))
      } catch (e) {
        console.error("perfil evaluaciones:", e)
        setErrorEvaluaciones(true)
      }

      // Últimos 10 entrenamientos
      const { data: entData } = await supabase
        .from("entrenamientos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (entData) setEntrenamientos(entData)

      setIsLoading(false)
    }
    load()
  }, [router, supabase])

  if (isLoading) {
    return <Cargando pantallaCompleta />
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  return (
    <MarcoPagina profile={profile} titulo="Mi Perfil" volverA="/dashboard" etiquetaVolver="Volver al inicio" ancho="max-w-3xl">
      {/* ---- Datos personales ---- */}
      <Seccion icono={<User />} tono="lavanda" titulo="Datos personales">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile?.rol === "profesional" ? (
            <span className="grid size-20 shrink-0 place-items-center rounded-full bg-celeste-suave ring-4 ring-white">
              <LumoCara tamano={64} />
            </span>
          ) : (
            <CaraPersonaje personaje="lex" tamano={80} className="bg-rojo-suave ring-4 ring-white shadow-suave" />
          )}
          <dl className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/60 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Nombre</dt>
              <dd className="text-lg font-semibold">{firstName || "—"}</dd>
            </div>
            <div className="rounded-2xl bg-muted/60 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Apellido</dt>
              <dd className="text-lg font-semibold">{lastName || "—"}</dd>
            </div>
            <div className="rounded-2xl bg-muted/60 px-4 py-3 sm:col-span-2">
              <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-4" /> Email
              </dt>
              <dd className="break-all text-lg font-semibold">{email}</dd>
            </div>
          </dl>
        </div>
      </Seccion>

      {/* ---- Historial de evaluaciones (sin recomendación) ---- */}
      {errorEvaluaciones ? (
        <MensajeAlerta tipo="error" texto="No se pudo cargar el historial de evaluaciones. Recargá la página." />
      ) : (
        <HistorialEvaluaciones tests={evaluaciones} urlDetalle={(testId) => `/perfil/evaluaciones/${testId}`} />
      )}

      {/* ---- Historial de entrenamientos ---- */}
      <Seccion icono={<Dumbbell />} tono="menta" titulo="Historial de entrenamientos">
        {entrenamientos.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border/80 max-md:rounded-none max-md:border-0">
            <Table tarjetasEnCelular>
              <TableHeader>
                <TableRow>
                  <TableHead>Juego</TableHead>
                  <TableHead className="text-center">Puntaje</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <CuerpoTablaAnimado>
                {entrenamientos.map((e) => (
                  <FilaTablaAnimada key={e.id}>
                    <TableCell data-label="Juego" className="font-medium">
                      <span className="flex items-center gap-2 max-md:justify-end">
                        <span className="grid size-8 place-items-center rounded-xl bg-sol-suave text-sol-fuerte">
                          <Gamepad2 className="size-4" />
                        </span>
                        {e.juego}
                      </span>
                    </TableCell>
                    <TableCell data-label="Puntaje" className="text-center font-bold tabular-nums">{e.puntaje}</TableCell>
                    <TableCell data-label="Fecha" className="text-right tabular-nums text-muted-foreground">
                      {formatDate(e.created_at)}
                    </TableCell>
                  </FilaTablaAnimada>
                ))}
              </CuerpoTablaAnimado>
            </Table>
          </div>
        ) : (
          <EstadoVacio
            compacto
            personaje="lex"
            descripcion="Aún no realizaste ningún entrenamiento"
            accion={
              <Button asChild>
                <Link href="/entrenamiento">Ir a entrenar</Link>
              </Button>
            }
          />
        )}
      </Seccion>

      {/* Volver */}
      <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Button>
    </MarcoPagina>
  )
}
