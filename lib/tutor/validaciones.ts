/**
 * Validación de lo que llega a las Server Actions del tutor. Una Server
 * Action se puede llamar con cualquier argumento, así que no se confía en
 * los tipos de TypeScript. Funciones puras: se prueban en validaciones.test.ts.
 */
import { ETAPAS_ESCOLARES, type EtapaEscolar } from "@/lib/test/bloques"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function esUuid(valor: unknown): valor is string {
  return typeof valor === "string" && UUID_RE.test(valor)
}

export function esEtapaEscolar(valor: unknown): valor is EtapaEscolar {
  return typeof valor === "string" && ETAPAS_ESCOLARES.some((e) => e.valor === valor)
}

/** La contraseña llega como texto no vacío (no se recorta: los espacios cuentan). */
export function esContrasena(valor: unknown): valor is string {
  return typeof valor === "string" && valor.length > 0
}

/** Elección de compartir el historial: true, false, o null si no eligió. */
export function esEleccionHistorial(valor: unknown): valor is boolean | null {
  return valor === null || typeof valor === "boolean"
}
