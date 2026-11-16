"use server"

/**
 * Acciones del tutor: cada una exige la contraseña de la cuenta, que el
 * servidor verifica antes de ejecutarla (lib/tutor/verificar-contrasena.ts).
 * Así, con la sesión del niño abierta, ni el niño ni otra persona las
 * puede hacer.
 *
 * Después de verificar, las escrituras van con el cliente service_role a
 * las funciones tutor_* de supabase/migrations/0005, que solo puede
 * ejecutar service_role. El id del niño sale siempre de la sesión.
 *
 * Devuelven { ok, error } en vez de lanzar (ver lib/tutor/errores.ts).
 */
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { conContrasenaTutor } from "@/lib/tutor/verificar-contrasena"
import { MENSAJE_ERROR_ACCION, mensajeErrorFuncion, type ResultadoAccion } from "@/lib/tutor/errores"
import { esEleccionHistorial, esEtapaEscolar, esUuid } from "@/lib/tutor/validaciones"

const ELEGI_HISTORIAL = "Elegí si compartís el historial."

/** Aceptar (con la elección de compartir el historial) o rechazar una invitación. */
export async function responderInvitacionTutor(datos: {
  password: string
  vinculoId: string
  aceptar: boolean
  comparteHistorial: boolean | null
}): Promise<ResultadoAccion> {
  const { password, vinculoId, aceptar, comparteHistorial } = datos ?? {}
  if (!esUuid(vinculoId) || typeof aceptar !== "boolean" || !esEleccionHistorial(comparteHistorial)) {
    return { ok: false, error: MENSAJE_ERROR_ACCION }
  }
  if (aceptar && comparteHistorial === null) return { ok: false, error: ELEGI_HISTORIAL }

  return conContrasenaTutor(
    password,
    async (ninoId) => {
      const { error } = await createAdminClient().rpc("tutor_responder_invitacion", {
        p_nino_id: ninoId,
        p_vinculo_id: vinculoId,
        p_aceptar: aceptar,
        p_comparte_historial: aceptar ? comparteHistorial : null,
      })
      if (error) return { ok: false, error: mensajeErrorFuncion(error) }
      return { ok: true }
    },
    "responderInvitacionTutor",
  )
}

/** Dar de baja un vínculo activo del niño. */
export async function desvincularTutor(datos: { password: string; vinculoId: string }): Promise<ResultadoAccion> {
  const { password, vinculoId } = datos ?? {}
  if (!esUuid(vinculoId)) return { ok: false, error: MENSAJE_ERROR_ACCION }

  return conContrasenaTutor(
    password,
    async (ninoId) => {
      const { error } = await createAdminClient().rpc("tutor_desvincular", {
        p_nino_id: ninoId,
        p_vinculo_id: vinculoId,
      })
      if (error) return { ok: false, error: mensajeErrorFuncion(error) }
      return { ok: true }
    },
    "desvincularTutor",
  )
}

/** Cambiar la etapa escolar del niño (y con ella, el nivel de la evaluación). */
export async function cambiarEtapaTutor(datos: { password: string; etapa: string }): Promise<ResultadoAccion> {
  const { password, etapa } = datos ?? {}
  if (!esEtapaEscolar(etapa)) return { ok: false, error: "La etapa escolar no es válida." }

  return conContrasenaTutor(
    password,
    async (ninoId) => {
      const { error } = await createAdminClient().rpc("tutor_cambiar_etapa", {
        p_nino_id: ninoId,
        p_etapa: etapa,
      })
      if (error) return { ok: false, error: mensajeErrorFuncion(error) }
      return { ok: true }
    },
    "cambiarEtapaTutor",
  )
}

/**
 * Eliminar la cuenta del niño con todos sus datos. Borrar el usuario de
 * Auth borra en cascada su perfil, vínculos, evaluaciones y entrenamientos
 * (supabase/migrations/0005, encabezado). Después se limpian las cookies
 * de sesión; el cliente redirige a /login?cuenta=eliminada.
 */
export async function eliminarCuentaNino(datos: { password: string }): Promise<ResultadoAccion> {
  return conContrasenaTutor(
    datos?.password,
    async (ninoId) => {
      const { error } = await createAdminClient().auth.admin.deleteUser(ninoId)
      if (error) {
        console.error("eliminarCuentaNino: deleteUser", error.status, error.code)
        return { ok: false, error: MENSAJE_ERROR_ACCION }
      }

      // El usuario ya no existe: signOut puede devolver un error del
      // servidor de Auth, pero igual borra las cookies. Se ignora.
      try {
        await (await createClient()).auth.signOut({ scope: "local" })
      } catch {
        // Sin cookies que limpiar: nada más que hacer.
      }
      return { ok: true }
    },
    "eliminarCuentaNino",
  )
}
