"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { motion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { CampanitaInvitaciones } from "@/components/campanita-invitaciones"
import { LogoLecxico } from "@/components/logo-lecxico"
import { EASE_SUAVE } from "@/components/motion/transiciones"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { CaraPersonaje } from "@/components/personajes/personaje"
import type { Profile } from "@/lib/types/database"

/**
 * Navbar de las páginas con sesión: logo, nombre, campanita de invitaciones
 * y cerrar sesión. No se usa en las páginas de la evaluación (sin notificaciones
 * mientras se evalúa).
 *
 * Es una "píldora" flotante: el niño la ve con la cara de Lex y el profesional
 * con la de Lumo, su asistente.
 */
export function AppHeader({ profile }: { profile: Pick<Profile, "nombre" | "rol"> }) {
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 shrink-0 px-3 pt-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SUAVE }}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-full border border-border/70 bg-card/80 pl-5 pr-2 shadow-media backdrop-blur-md sm:pl-6"
      >
        <Link
          href="/dashboard"
          aria-label="Lecxico - Inicio"
          className="rounded-lg py-2 outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
        >
          <LogoLecxico titulo="" className="h-5 sm:h-6" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="flex items-center gap-2 rounded-full bg-muted/80 p-1 sm:pr-4">
            {profile.rol === "nino" ? (
              <CaraPersonaje personaje="lex" tamano={36} className="bg-rojo-suave ring-2 ring-white" />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-celeste-suave ring-2 ring-white">
                <LumoCara tamano={30} />
              </span>
            )}
            <span className="hidden max-w-40 truncate font-semibold sm:inline">{profile.nombre}</span>
          </span>
          <CampanitaInvitaciones rol={profile.rol} />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-rojo-suave hover:text-rojo-fuerte focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 sm:px-4"
          >
            <LogOut className="size-5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </motion.div>
    </header>
  )
}
