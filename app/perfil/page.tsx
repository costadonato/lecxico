"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AtSign, User, Mail } from "lucide-react"
import { Cargando } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { NombreUsuarioCopiable } from "@/components/nombre-usuario-copiable"
import { MarcoPagina } from "@/components/pagina-app"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { CaraPersonaje } from "@/components/personajes/personaje"
import { Seccion } from "@/components/seccion"
import { AccionesTutor } from "@/components/tutor/acciones-tutor"
import { obtenerPerfilActual } from "@/lib/auth/perfil"
import type { Nino, Profile } from "@/lib/types/database"

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nino, setNino] = useState<Nino | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

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
      setNino(actual?.nino ?? null)
      setFirstName(actual?.profile?.nombre ?? "")
      setLastName(actual?.profile?.apellido ?? "")
      setEmail(user.email || "")
      setIsLoading(false)
    }
    load()
  }, [router, supabase])

  if (isLoading) {
    return <Cargando pantallaCompleta />
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
            {profile?.nombre_usuario && (
              <div className="rounded-2xl bg-muted/60 px-4 py-3 sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <AtSign className="size-4" /> Nombre de usuario
                </dt>
                <dd className="text-lg font-semibold">
                  <NombreUsuarioCopiable nombreUsuario={profile.nombre_usuario} />
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Seccion>

      {/* ---- Resultados (V8: el perfil del niño no los muestra) ---- */}
      {profile?.rol === "nino" && (
        <MensajeAlerta tipo="info" texto="Los resultados de las evaluaciones los ve el profesional que acompaña al niño." />
      )}

      {profile?.rol === "nino" && nino && <AccionesTutor etapaInicial={nino.etapa_escolar} />}

      {/* Volver */}
      <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Button>
    </MarcoPagina>
  )
}
