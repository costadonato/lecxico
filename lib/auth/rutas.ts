/**
 * Rutas de autenticación. Módulo sin dependencias para que lo puedan usar
 * el middleware (edge), los route handlers y el cliente.
 */

/** Requieren sesión. */
export const RUTAS_PROTEGIDAS = ["/dashboard", "/test", "/perfil", "/completar-perfil"]

/** Con sesión no tienen sentido: se redirige a /dashboard. */
export const RUTAS_SOLO_INVITADOS = ["/login", "/register"]

export const RUTA_INICIO = "/dashboard"

/** `ruta` es `base` o está debajo de ella (/test y /test/inicial, pero no /testing). */
export function coincideRuta(ruta: string, base: string): boolean {
  return ruta === base || ruta.startsWith(`${base}/`)
}

/**
 * Devuelve `next` solo si es una ruta interna ("/algo", no "//otro-sitio"
 * ni una URL absoluta); si no, `porDefecto`. Evita redirecciones abiertas.
 */
export function rutaSegura(next: string | null | undefined, porDefecto = RUTA_INICIO): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return porDefecto
  return next
}
