/**
 * Cambio de etapa escolar desde "Acciones del tutor" (/perfil).
 * Funciones puras: se prueban en etapa.test.ts.
 */
import { NIVEL_LABEL, nivelParaEtapa, type EtapaEscolar, type Nivel } from "@/lib/test/bloques"

/** Niveles antes y después, o null si el cambio de etapa no cambia el nivel. */
export function cambioDeNivel(actual: EtapaEscolar, nueva: EtapaEscolar): { anterior: Nivel; nuevo: Nivel } | null {
  const anterior = nivelParaEtapa(actual)
  const nuevo = nivelParaEtapa(nueva)
  return anterior === nuevo ? null : { anterior, nuevo }
}

/** Aviso a mostrar antes de confirmar, o null si el nivel no cambia. */
export function avisoCambioNivel(actual: EtapaEscolar, nueva: EtapaEscolar): string | null {
  const cambio = cambioDeNivel(actual, nueva)
  if (!cambio) return null
  return `Con este cambio, la evaluación pasa de ${NIVEL_LABEL[cambio.anterior]} a ${NIVEL_LABEL[cambio.nuevo]}.`
}
