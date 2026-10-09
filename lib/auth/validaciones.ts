/**
 * Validaciones de los formularios de cuenta (registro, completar perfil,
 * restablecer contraseña). Las reglas de nombre de usuario son espejo de
 * las de la base (profiles_nombre_usuario_formato_check).
 */

export const NOMBRE_USUARIO_RE = /^[a-z0-9._]{3,30}$/

export const REGLA_NOMBRE_USUARIO =
  "Entre 3 y 30 caracteres: letras minúsculas sin acentos, números, punto (.) o guion bajo (_)."

export const PASSWORD_MIN = 8

/** Igual que la base: sin espacios alrededor y en minúsculas. */
export function normalizarNombreUsuario(valor: string): string {
  return valor.trim().toLowerCase()
}

export function nombreUsuarioValido(valor: string): boolean {
  return NOMBRE_USUARIO_RE.test(normalizarNombreUsuario(valor))
}

export function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())
}

/** Error de contraseña/confirmación, o null si están bien. */
export function errorPassword(password: string, confirmacion: string): string | null {
  if (password.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`
  if (password !== confirmacion) return "Las contraseñas no coinciden."
  return null
}

/** Fecha de hoy en hora local, como "YYYY-MM-DD" (para el max de <input type="date">). */
export function hoyISO(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** "YYYY-MM-DD" real (no 31/02), posterior a 1900 y anterior a hoy. */
export function fechaNacimientoValida(valor: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!m) return false
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const fecha = new Date(anio, mes - 1, dia)
  const existe = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
  return existe && anio >= 1900 && valor < hoyISO()
}
