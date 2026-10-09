/**
 * Filas de las tablas de Supabase (ver supabase/migrations/).
 * Fechas: strings ISO tal como las devuelve PostgREST.
 */
import type { BloqueCodigo, EtapaEscolar, Nivel } from "@/lib/test/bloques"

export type { BloqueCodigo, EtapaEscolar, Nivel }

export type Rol = "profesional" | "nino"

export type EstadoVinculo = "pendiente" | "activa" | "inactiva"

export type ConclusionTest = "indicadores_detectados" | "sin_indicadores"

export interface Profile {
  id: string
  rol: Rol
  nombre: string
  apellido: string
  /** Null solo mientras un alta por Google no lo completó. */
  nombre_usuario: string | null
  acepta_tyc: boolean
  fecha_aceptacion_tyc: string | null
  created_at: string
}

export interface Nino {
  profile_id: string
  /** date: "YYYY-MM-DD" */
  fecha_nacimiento: string
  etapa_escolar: EtapaEscolar
  tutor_email: string
  tutor_telefono: string | null
  ultima_conexion: string | null
  ultimo_entrenamiento: string | null
  ultima_prueba: string | null
}

export interface ProfesionalNino {
  id: string
  profesional_id: string
  nino_id: string
  estado: EstadoVinculo
  fecha_invitacion: string
  fecha_afiliacion: string | null
  fecha_baja: string | null
}

export interface Test {
  id: string
  nino_id: string
  /** Null si el profesional borró su cuenta. */
  profesional_id: string | null
  nivel: Nivel
  fecha: string
  puntaje_total: number
  porcentaje_total: number
  conclusion: ConclusionTest | null
  created_at: string
}

export interface TestBloqueResultado {
  id: string
  test_id: string
  bloque_codigo: BloqueCodigo
  orden: number
  correctas: number
  total: number
}

export interface Entrenamiento {
  id: string
  /** Id del niño. */
  user_id: string
  juego: string
  puntaje: number
  created_at: string
}

/** Fila de la RPC vinculos_del_profesional (0003). */
export interface VinculoDelProfesional {
  vinculo_id: string
  estado: EstadoVinculo
  nino_id: string
  /** Siempre presente: es lo que el profesional escribió para invitar. */
  nombre_usuario: string
  /** nombre, apellido y etapa_escolar solo con estado 'activa'. */
  nombre: string | null
  apellido: string | null
  etapa_escolar: EtapaEscolar | null
  fecha_invitacion: string
  fecha_afiliacion: string | null
  fecha_baja: string | null
}

/** Datos públicos del profesional que el niño puede ver (vínculo pendiente o activo). */
export type ProfesionalVisible = Pick<Profile, "nombre" | "apellido" | "nombre_usuario">

/** Vínculo visto desde la cuenta del niño, con el perfil del profesional. */
export interface VinculoDelNino {
  id: string
  estado: EstadoVinculo
  fecha_invitacion: string
  fecha_afiliacion: string | null
  profesional: ProfesionalVisible | null
}

/** Fila de la RPC ninos_para_test (0004): niños con vínculo activo y su último test. */
export interface NinoParaTest {
  nino_id: string
  nombre: string
  apellido: string
  nombre_usuario: string
  etapa_escolar: EtapaEscolar
  nivel: Nivel
  /** Del test más reciente del niño (de cualquier profesional); null si no tiene. */
  fecha_ultimo_test: string | null
  porcentaje_ultimo_test: number | null
}
