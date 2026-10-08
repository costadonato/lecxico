const SOLO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * "dd/mm/aaaa" en es-AR; cadena vacía si no hay fecha.
 * Acepta timestamps ISO y fechas sin hora ("YYYY-MM-DD", columnas date).
 * Estas últimas se leen tal cual: new Date("2019-05-10") es medianoche UTC,
 * que en Argentina caería el día anterior.
 */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return ""
  const soloFecha = SOLO_FECHA.exec(iso)
  if (soloFecha) return `${soloFecha[3]}/${soloFecha[2]}/${soloFecha[1]}`
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

/** Años cumplidos a hoy desde una fecha "YYYY-MM-DD"; null si no es válida. */
export function calcularEdad(fechaNacimiento: string | null | undefined): number | null {
  const m = fechaNacimiento ? SOLO_FECHA.exec(fechaNacimiento) : null
  if (!m) return null
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const hoy = new Date()
  let edad = hoy.getFullYear() - anio
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad--
  return edad >= 0 ? edad : null
}

/** "6 años", "1 año"; cadena vacía si no hay edad. */
export function textoEdad(edad: number | null): string {
  if (edad === null) return ""
  return edad === 1 ? "1 año" : `${edad} años`
}
