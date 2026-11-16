import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Cliente con la clave service_role: saltea la RLS y puede ejecutar las
 * funciones tutor_* (supabase/migrations/0005) y auth.admin.
 *
 * Solo para el servidor de Next.js (`server-only` hace fallar el build si
 * un componente de cliente lo importa). La clave se lee de
 * SUPABASE_SERVICE_ROLE_KEY: nunca con prefijo NEXT_PUBLIC_.
 *
 * Usarlo solo después de verificar quién pide la acción (por ejemplo, con
 * lib/tutor/verificar-contrasena.ts) y con ids que salen de la sesión.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!clave) throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY")
  if (!url) throw new Error("Falta configurar NEXT_PUBLIC_SUPABASE_URL")

  return createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
