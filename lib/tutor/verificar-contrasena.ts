import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import {
  MENSAJE_CONTRASENA_INCORRECTA,
  MENSAJE_ERROR_ACCION,
  mensajeErrorContrasena,
  type ResultadoAccion,
} from "@/lib/tutor/errores"
import { esContrasena } from "@/lib/tutor/validaciones"

export type Verificacion = { ok: true; ninoId: string } | { ok: false; error: string }

/**
 * Verifica que quien pide una acción del tutor sepa la contraseña de la
 * cuenta del niño que tiene la sesión abierta.
 *
 * 1. El usuario sale de la sesión (cookies), nunca del formulario. Sin
 *    sesión, o si el perfil no es 'nino', falla.
 * 2. La contraseña se prueba con signInWithPassword en un cliente APARTE,
 *    sin cookies ni persistencia: el cliente de cookies reemplazaría la
 *    sesión del navegador.
 * 3. Se comprueba que el usuario devuelto sea el mismo de la sesión.
 * 4. Esa sesión temporal se cierra con scope "local" (solo esa sesión; con
 *    "global" se cerraría también la del navegador).
 *
 * La contraseña nunca se loguea ni se devuelve.
 */
export async function verificarContrasenaTutor(password: unknown): Promise<Verificacion> {
  if (!esContrasena(password)) return { ok: false, error: MENSAJE_CONTRASENA_INCORRECTA }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false, error: MENSAJE_ERROR_ACCION }

  const { data: perfil, error: perfilError } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle<{ rol: string }>()
  if (perfilError || perfil?.rol !== "nino") return { ok: false, error: MENSAJE_ERROR_ACCION }

  const temporal = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { data, error } = await temporal.auth.signInWithPassword({ email: user.email, password })
  if (error || !data.user) {
    if (error?.code !== "invalid_credentials") console.error("verificarContrasenaTutor:", error?.status, error?.code)
    return { ok: false, error: mensajeErrorContrasena(error) }
  }

  try {
    await temporal.auth.signOut({ scope: "local" })
  } catch (e) {
    // Si no se pudo cerrar, la sesión temporal vence sola; la acción sigue.
    console.error("verificarContrasenaTutor: no se pudo cerrar la sesión temporal", e)
  }

  if (data.user.id !== user.id) return { ok: false, error: MENSAJE_ERROR_ACCION }
  return { ok: true, ninoId: user.id }
}

/**
 * Verifica la contraseña y, si es correcta, ejecuta `accion` con el id del
 * niño de la sesión. Cualquier error inesperado (por ejemplo, que falte
 * SUPABASE_SERVICE_ROLE_KEY) se loguea en el servidor y se devuelve el
 * mensaje genérico. Lo reutilizan todas las acciones del tutor (y el
 * pedido del informe en S17).
 */
export async function conContrasenaTutor(
  password: unknown,
  accion: (ninoId: string) => Promise<ResultadoAccion>,
  etiqueta: string,
): Promise<ResultadoAccion> {
  try {
    const verificacion = await verificarContrasenaTutor(password)
    if (!verificacion.ok) return verificacion
    return await accion(verificacion.ninoId)
  } catch (e) {
    console.error(`${etiqueta}:`, e instanceof Error ? e.message : e)
    return { ok: false, error: MENSAJE_ERROR_ACCION }
  }
}
