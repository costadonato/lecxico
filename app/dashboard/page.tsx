"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ClipboardCheck, Gamepad2, LogOut, Stethoscope, UserRound, Users } from "lucide-react"
import { Cargando } from "@/components/estados"
import { InicioNino, type TarjetaInicio } from "@/components/inicio/inicio-nino"
import { InicioProfesional } from "@/components/inicio/inicio-profesional"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { obtenerPerfilActual, perfilIncompleto } from "@/lib/auth/perfil"
import type { Rol } from "@/lib/types/database"

const TARJETAS = {
  test: {
    title: "Evaluación de indicadores de dislexia",
    description: "Elegí un niño y realizá la evaluación",
    icono: ClipboardCheck,
    tono: "rojo",
    href: "/test",
  },
  entrenamiento: {
    title: "Entrenamiento",
    description: "Practicá con juegos interactivos",
    icono: Gamepad2,
    tono: "sol",
    href: "/entrenamiento",
  },
  perfil: {
    title: "Mi Perfil",
    description: "Revisá tu progreso y resultados",
    icono: UserRound,
    tono: "lavanda",
    href: "/perfil",
  },
  ninos: {
    title: "Mis niños",
    description: "Vinculá niños y gestioná a quiénes acompañás",
    icono: Users,
    tono: "celeste",
    href: "/ninos",
  },
  profesionales: {
    title: "Mis profesionales",
    description: "Mirá quiénes te acompañan",
    icono: Stethoscope,
    tono: "celeste",
    href: "/mis-profesionales",
  },
} satisfies Record<string, TarjetaInicio>

const TARJETAS_POR_ROL: Record<Rol, TarjetaInicio[]> = {
  profesional: [TARJETAS.test, TARJETAS.ninos],
  nino: [TARJETAS.entrenamiento, TARJETAS.profesionales, TARJETAS.perfil],
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [firstName, setFirstName] = useState<string>("")
  const [rol, setRol] = useState<Rol | null>(null)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const actual = await obtenerPerfilActual(supabase)
        if (!actual) {
          router.push("/login")
          return
        }
        if (!actual.profile) {
          setErrorCarga("Tu cuenta no tiene un perfil asociado. Contactá al equipo de Lecxico.")
          setIsLoading(false)
          return
        }
        if (perfilIncompleto(actual.profile)) {
          router.replace("/completar-perfil")
          return
        }

        setFirstName(actual.profile.nombre)
        setRol(actual.profile.rol)
        setIsLoading(false)

        if (actual.profile.rol === "nino") {
          const { error } = await supabase
            .from("ninos")
            .update({ ultima_conexion: new Date().toISOString() })
            .eq("profile_id", actual.user.id)
          if (error) console.error("No se pudo registrar la última conexión:", error)
        }
      } catch (e) {
        console.error("dashboard:", e)
        setErrorCarga("No se pudo cargar tu perfil. Recargá la página.")
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (isLoading) {
    return <Cargando pantallaCompleta />
  }

  if (errorCarga || !rol) {
    return (
      <div className="fondo-profesional flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <LumoCara estado="dormido" tamano={110} />
        <p className="max-w-md text-lg text-foreground">{errorCarga}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-base font-semibold text-foreground shadow-suave transition-colors duration-200 hover:border-primary/40 hover:bg-rojo-suave hover:text-rojo-fuerte"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    )
  }

  const cards = TARJETAS_POR_ROL[rol]
  const ir = (href: string) => router.push(href)

  return rol === "nino" ? (
    <InicioNino nombre={firstName} tarjetas={cards} onElegir={ir} />
  ) : (
    <InicioProfesional nombre={firstName} tarjetas={cards} onElegir={ir} />
  )
}
