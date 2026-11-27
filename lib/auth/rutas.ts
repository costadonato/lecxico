/**
 * Rutas de autenticación. Módulo sin dependencias para que lo puedan usar
 * el middleware (edge), los route handlers y el cliente.
 */

/** Requieren sesión. La restricción por rol (p. ej. /ninos solo profesionales) la hace cada página. */
export const RUTAS_PROTEGIDAS = ["/dashboard", "/test", "/perfil", "/completar-perfil", "/ninos", "/mis-profesionales", "/entrenamiento", "/entrenar"]

/** Con sesión no tienen sentido: se redirige a /dashboard. */
export const RUTAS_SOLO_INVITADOS = ["/login", "/register"]

export const RUTA_INICIO = "/dashboard"

/** `ruta` es `base` o está debajo de ella (/test y /test/inicial, pero no /testing). */
export function coincideRuta(ruta: string, base: string): boolean {
  return ruta === base || ruta.startsWith(`${base}/`)
}

/** Origen ficticio para resolver una ruta y ver si se queda en el mismo sitio. */
const ORIGEN_PRUEBA = "https://lecxico.invalid"

/**
 * Caracteres de control (0x00 a 0x1F y 0x7F) o barra invertida. El parser de
 * URL del navegador descarta \t, \n y \r y lee "\" como "/", así que
 * "/\t/otro.com" o "/\otro.com" terminarían en "//otro.com".
 */
function tieneCaracterPeligroso(ruta: string): boolean {
  for (let i = 0; i < ruta.length; i++) {
    const codigo = ruta.charCodeAt(i)
    if (codigo <= 0x1f || codigo === 0x7f || codigo === 0x5c) return true
  }
  return false
}

/**
 * Devuelve `next` solo si es una ruta relativa del mismo sitio ("/algo", con
 * consulta y ancla si las tiene); si no, `porDefecto`. Evita redirecciones
 * abiertas. Rechaza:
 * - lo que no empieza con "/": URLs absolutas y esquemas (https:, javascript:, data:);
 * - caracteres de control y barra invertida;
 * - lo que, resuelto con new URL, cambia de origen o no es una URL: "//otro.com"
 *   apunta a otro sitio y "//" sola no se puede leer;
 * - lo que, resuelto, deja un pathname que empieza con "//" ("/..//otro.com"
 *   queda como "//otro.com"): si se vuelve a usar como ruta, apunta a otro sitio.
 */
export function rutaSegura(next: string | null | undefined, porDefecto = RUTA_INICIO): string {
  if (!next || !next.startsWith("/") || tieneCaracterPeligroso(next)) return porDefecto
  try {
    const url = new URL(next, ORIGEN_PRUEBA)
    if (url.origin !== ORIGEN_PRUEBA || url.pathname.startsWith("//")) return porDefecto
  } catch {
    return porDefecto
  }
  return next
}
