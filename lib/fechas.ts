const SOLO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/
/** Parte de fecha al comienzo de un texto ISO, con o sin hora. */
const PREFIJO_FECHA = /^(\d{4})-(\d{2})-(\d{2})/

/** true si el día existe en el calendario (no 30/02 ni mes 13). Años de 4 cifras, también menores a 100. */
function diaExiste(m: RegExpExecArray): boolean {
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const d = new Date(0)
  d.setUTCFullYear(anio, mes - 1, dia)
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
}

/**
 * La fecha de `valor`, o null si no se puede leer o es imposible. El
 * navegador corre un día imposible al mes siguiente ("2026-02-30T10:00Z" es
 * el 02/03): por eso se revisa la parte de fecha antes de leerla.
 */
function leerFecha(valor: string | Date): Date | null {
  if (typeof valor === "string") {
    const prefijo = PREFIJO_FECHA.exec(valor)
    if (prefijo && !diaExiste(prefijo)) return null
  }
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * "dd/mm/aaaa" en es-AR; cadena vacía si no hay fecha o no es válida.
 * Acepta timestamps ISO y fechas sin hora ("YYYY-MM-DD", columnas date).
 * Estas últimas se leen tal cual: new Date("2019-05-10") es medianoche UTC,
 * que en Argentina caería el día anterior.
 */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return ""
  const soloFecha = SOLO_FECHA.exec(iso)
  if (soloFecha) return diaExiste(soloFecha) ? `${soloFecha[3]}/${soloFecha[2]}/${soloFecha[1]}` : ""
  const fecha = leerFecha(iso)
  if (!fecha) return ""
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

/** "dd/mm" (ejes de los gráficos de seguimiento); cadena vacía si no hay fecha o no es válida. */
export function formatearFechaCorta(iso: string | null | undefined): string {
  return formatearFecha(iso).slice(0, 5)
}

/** Años cumplidos a hoy desde una fecha "YYYY-MM-DD"; null si no es válida o es imposible. */
export function calcularEdad(fechaNacimiento: string | null | undefined): number | null {
  const m = fechaNacimiento ? SOLO_FECHA.exec(fechaNacimiento) : null
  if (!m || !diaExiste(m)) return null
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

const dos = (n: number) => String(n).padStart(2, "0")

/** "dd/mm/aaaa hh:mm" (24 h, hora local); cadena vacía si no hay fecha o no es válida. */
export function formatearFechaHora(iso: string | null | undefined): string {
  const d = iso ? leerFecha(iso) : null
  if (!d) return ""
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`
}

const conUnidad = (n: number, singular: string, plural: string) => `hace ${n} ${n === 1 ? singular : plural}`

/**
 * Tiempo transcurrido desde `fecha` hasta `ahora`: "hace 1 minuto" (nunca
 * segundos), "hace 5 minutos", "hace 3 horas", "hace 2 días", "hace 1 semana",
 * "hace 4 meses", "hace 1 año". Una fecha futura (reloj desfasado) cuenta
 * como "hace 1 minuto". Meses y años son calendario (mismo día del mes).
 * Cadena vacía si la fecha no se puede leer o es imposible.
 */
export function tiempoRelativo(fecha: string | Date, ahora: Date = new Date()): string {
  const desde = leerFecha(fecha)
  if (!desde) return ""
  const minutos = Math.floor(Math.max(0, ahora.getTime() - desde.getTime()) / 60000)
  if (minutos < 2) return "hace 1 minuto"
  if (minutos < 60) return `hace ${minutos} minutos`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return conUnidad(horas, "hora", "horas")

  const dias = Math.floor(horas / 24)
  if (dias < 7) return conUnidad(dias, "día", "días")
  if (dias < 30) return conUnidad(Math.floor(dias / 7), "semana", "semanas")

  let meses = (ahora.getFullYear() - desde.getFullYear()) * 12 + (ahora.getMonth() - desde.getMonth())
  if (ahora.getDate() < desde.getDate()) meses--
  meses = Math.max(1, meses) // 30 días o más ya es "hace 1 mes", aunque falte un día de calendario
  if (meses < 12) return conUnidad(meses, "mes", "meses")
  return conUnidad(Math.floor(meses / 12), "año", "años")
}
