/**
 * Datos del detalle de un niño para el profesional. Son consultas directas:
 * la RLS solo deja leer perfil, ninos, tests, bloques y entrenamientos de un
 * niño con vínculo ACTIVO. Si algo no se puede leer se devuelve "sin-acceso",
 * sin distinguir entre "no existe" y "no está vinculado".
 */
import { createClient } from "@/lib/supabase/client"
import type { Entrenamiento, Nino, Profile, Test, TestBloqueResultado } from "@/lib/types/database"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ResultadoCarga<T> = { estado: "sin-acceso" } | { estado: "listo"; datos: T }

export type TestConBloques = Test & { bloques: TestBloqueResultado[] }

export interface DetalleNino {
  perfil: Profile
  nino: Nino
  /** Vínculo activo del profesional actual con el niño. */
  vinculo: { id: string; fecha_afiliacion: string | null }
  /** Todos los tests del niño (de cualquier profesional), del más reciente al más viejo. */
  tests: TestConBloques[]
  /** Del más reciente al más viejo. */
  entrenamientos: Entrenamiento[]
}

function lanzar(error: { message: string } | null) {
  if (error) throw new Error(error.message || "No se pudo cargar la información.")
}

/** Perfil del niño si el profesional actual lo puede leer (vínculo activo). */
async function perfilVisible(ninoId: string): Promise<Profile | null> {
  if (!UUID_RE.test(ninoId)) return null
  const { data, error } = await createClient().from("profiles").select("*").eq("id", ninoId).maybeSingle<Profile>()
  lanzar(error)
  // El propio perfil del profesional también es visible: se exige rol niño.
  return data?.rol === "nino" ? data : null
}

export async function cargarDetalleNino(ninoId: string): Promise<ResultadoCarga<DetalleNino>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { estado: "sin-acceso" }

  const perfil = await perfilVisible(ninoId)
  if (!perfil) return { estado: "sin-acceso" }

  const [ninoRes, vinculoRes, testsRes, entrenamientosRes] = await Promise.all([
    supabase.from("ninos").select("*").eq("profile_id", ninoId).maybeSingle<Nino>(),
    supabase
      .from("profesional_nino")
      .select("id, fecha_afiliacion")
      .eq("profesional_id", user.id)
      .eq("nino_id", ninoId)
      .eq("estado", "activa")
      .maybeSingle<{ id: string; fecha_afiliacion: string | null }>(),
    supabase
      .from("test")
      .select("*")
      .eq("nino_id", ninoId)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("entrenamientos").select("*").eq("user_id", ninoId).order("created_at", { ascending: false }),
  ])
  lanzar(ninoRes.error)
  lanzar(vinculoRes.error)
  lanzar(testsRes.error)
  lanzar(entrenamientosRes.error)
  if (!ninoRes.data || !vinculoRes.data) return { estado: "sin-acceso" }

  // Bloques de todos los tests en una sola consulta.
  const tests = (testsRes.data ?? []) as Test[]
  const bloquesPorTest = new Map<string, TestBloqueResultado[]>()
  if (tests.length > 0) {
    const { data, error } = await supabase
      .from("test_bloque_resultado")
      .select("*")
      .in(
        "test_id",
        tests.map((t) => t.id),
      )
      .order("orden", { ascending: true })
    lanzar(error)
    for (const b of (data ?? []) as TestBloqueResultado[]) {
      bloquesPorTest.set(b.test_id, [...(bloquesPorTest.get(b.test_id) ?? []), b])
    }
  }

  return {
    estado: "listo",
    datos: {
      perfil,
      nino: ninoRes.data,
      vinculo: vinculoRes.data,
      tests: tests.map((t) => ({ ...t, bloques: bloquesPorTest.get(t.id) ?? [] })),
      entrenamientos: (entrenamientosRes.data ?? []) as Entrenamiento[],
    },
  }
}

export interface TestDeNino {
  perfil: Pick<Profile, "id" | "nombre" | "apellido">
  test: TestConBloques
}

/** Un test del historial, solo si pertenece a ese niño y hay vínculo activo. */
export async function cargarTestDeNino(ninoId: string, testId: string): Promise<ResultadoCarga<TestDeNino>> {
  if (!UUID_RE.test(testId)) return { estado: "sin-acceso" }
  const perfil = await perfilVisible(ninoId)
  if (!perfil) return { estado: "sin-acceso" }

  const supabase = createClient()
  const { data: test, error } = await supabase
    .from("test")
    .select("*")
    .eq("id", testId)
    .eq("nino_id", ninoId)
    .maybeSingle<Test>()
  lanzar(error)
  if (!test) return { estado: "sin-acceso" }

  const { data: bloques, error: bloquesError } = await supabase
    .from("test_bloque_resultado")
    .select("*")
    .eq("test_id", testId)
    .order("orden", { ascending: true })
  lanzar(bloquesError)

  return {
    estado: "listo",
    datos: {
      perfil: { id: perfil.id, nombre: perfil.nombre, apellido: perfil.apellido },
      test: { ...test, bloques: (bloques ?? []) as TestBloqueResultado[] },
    },
  }
}
