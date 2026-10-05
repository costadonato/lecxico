import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { obtenerPerfilActual, perfilIncompleto } from "@/lib/auth/perfil"
import { rutaSegura } from "@/lib/auth/rutas"

/**
 * Vuelta de Supabase Auth: confirmación de email, login con Google y
 * recuperación de contraseña.
 *
 * - ?code=...                 → flujo PKCE (por defecto en @supabase/ssr).
 * - ?token_hash=...&type=...  → enlaces de email con token_hash; funcionan
 *                               aunque el email se abra en otro navegador.
 *
 * Redirige a `next` (por defecto /dashboard), o a /completar-perfil si al
 * perfil le falta el nombre de usuario o la aceptación de TyC.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = rutaSegura(searchParams.get("next"))

  const supabase = await createClient()
  let error: unknown = searchParams.get("error") ?? null

  if (!error && code) {
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  } else if (!error && tokenHash && type) {
    ;({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }))
  } else if (!error) {
    error = "Falta el código de autenticación"
  }

  if (error) {
    console.error("auth/callback:", error, searchParams.get("error_description"))
    return NextResponse.redirect(`${origin}/login?error=enlace`)
  }

  // Al restablecer la contraseña se deja seguir aunque el perfil esté
  // incompleto; el dashboard lo va a mandar a completarlo después.
  if (next !== "/restablecer") {
    try {
      const actual = await obtenerPerfilActual(supabase)
      if (actual?.profile && perfilIncompleto(actual.profile)) {
        return NextResponse.redirect(`${origin}/completar-perfil`)
      }
    } catch (e) {
      console.error("auth/callback: no se pudo leer el perfil", e)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
