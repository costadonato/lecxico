/**
 * Resultado y mensajes de las acciones del tutor (lib/tutor/acciones.ts).
 * Funciones puras: se prueban en errores.test.ts.
 *
 * Las Server Actions devuelven un resultado en vez de lanzar porque, en
 * producción, Next.js oculta el mensaje de los errores lanzados.
 */

export type ResultadoAccion = { ok: true } | { ok: false; error: string }

export const MENSAJE_CONTRASENA_INCORRECTA = "La contraseña no es correcta."
export const MENSAJE_MUCHOS_INTENTOS = "Hiciste muchos intentos. Esperá unos minutos y probá de nuevo."
export const MENSAJE_ERROR_ACCION = "No se pudo completar la acción. Probá de nuevo."

/** Lo que importa de un AuthError de Supabase. */
export interface ErrorAuth {
  status?: number
  code?: string
}

/** Lo que importa de un PostgrestError de Supabase. */
export interface ErrorFuncion {
  code?: string
  message?: string
}

/**
 * Mensaje para un error de signInWithPassword al verificar la contraseña.
 * Nunca incluye la contraseña ni detalles del error.
 */
export function mensajeErrorContrasena(error: ErrorAuth | null | undefined): string {
  if (!error) return MENSAJE_ERROR_ACCION
  if (error.status === 429 || error.code === "over_request_rate_limit") return MENSAJE_MUCHOS_INTENTOS
  if (error.code === "invalid_credentials") return MENSAJE_CONTRASENA_INCORRECTA
  return MENSAJE_ERROR_ACCION
}

/**
 * Mensaje para un error de una función SQL del tutor. Los `raise exception`
 * de esas funciones (código P0001) traen un texto en español pensado para
 * mostrarse tal cual y que no revela si algo existe; cualquier otro error
 * se reemplaza por el mensaje genérico.
 */
export function mensajeErrorFuncion(error: ErrorFuncion | null | undefined): string {
  const mensaje = error?.message?.trim()
  if (error?.code === "P0001" && mensaje) return mensaje
  return MENSAJE_ERROR_ACCION
}
