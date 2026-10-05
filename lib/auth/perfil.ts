/**
 * Perfil del usuario actual (profiles + ninos si corresponde).
 * Recibe el cliente de Supabase, así sirve tanto con lib/supabase/client
 * como con lib/supabase/server.
 */
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Nino, Profile } from "@/lib/types/database"

export interface PerfilActual {
  user: User
  /** Null si la cuenta no tiene fila en profiles (cuentas anteriores al slice 1). */
  profile: Profile | null
  /** Solo para rol 'nino'. */
  nino: Nino | null
}

/** Null si no hay sesión. Lanza el error de Supabase si falla una consulta. */
export async function obtenerPerfilActual(supabase: SupabaseClient): Promise<PerfilActual | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>()
  if (error) throw error

  let nino: Nino | null = null
  if (profile?.rol === "nino") {
    const { data, error: ninoError } = await supabase
      .from("ninos")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle<Nino>()
    if (ninoError) throw ninoError
    nino = data
  }

  return { user, profile, nino }
}

/** Le falta el nombre de usuario o la aceptación de TyC (típico del alta por Google). */
export function perfilIncompleto(profile: Profile): boolean {
  return !profile.nombre_usuario || !profile.acepta_tyc
}
