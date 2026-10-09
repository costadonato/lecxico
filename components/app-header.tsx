"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CampanitaInvitaciones } from "@/components/campanita-invitaciones"
import type { Profile } from "@/lib/types/database"

/**
 * Navbar de las páginas con sesión: logo, nombre, campanita de invitaciones
 * y cerrar sesión. No se usa en las páginas de la evaluación (sin notificaciones
 * mientras se evalúa).
 */
export function AppHeader({ profile }: { profile: Pick<Profile, "nombre" | "rol"> }) {
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="relative z-20 h-16 bg-red-600 shadow-lg shrink-0">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Lecxico
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:flex items-center gap-2 text-white font-medium">
            <User className="w-5 h-5" />
            {profile.nombre}
          </span>
          <CampanitaInvitaciones rol={profile.rol} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/40 px-3 sm:px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}
