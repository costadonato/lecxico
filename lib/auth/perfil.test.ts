import { describe, expect, it } from "vitest"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { obtenerPerfilActual, perfilIncompleto } from "./perfil"
import type { Nino, Profile } from "@/lib/types/database"

function perfil(cambios: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    rol: "profesional",
    nombre: "Ana",
    apellido: "Arias",
    nombre_usuario: "ana",
    acepta_tyc: true,
    fecha_aceptacion_tyc: "2026-11-01T00:00:00Z",
    acepta_compromiso: true,
    fecha_aceptacion_compromiso: "2026-11-01T00:00:00Z",
    created_at: "2026-11-01T00:00:00Z",
    ...cambios,
  }
}

describe("perfilIncompleto", () => {
  it("un profesional con todo completo no está incompleto", () => {
    expect(perfilIncompleto(perfil())).toBe(false)
  })

  it("sin nombre de usuario está incompleto", () => {
    expect(perfilIncompleto(perfil({ nombre_usuario: null }))).toBe(true)
  })

  it("sin TyC está incompleto", () => {
    expect(perfilIncompleto(perfil({ acepta_tyc: false }))).toBe(true)
  })

  it("un profesional sin compromiso está incompleto", () => {
    expect(perfilIncompleto(perfil({ acepta_compromiso: false }))).toBe(true)
  })

  it("un niño no necesita el compromiso", () => {
    expect(perfilIncompleto(perfil({ rol: "nino", acepta_compromiso: false }))).toBe(false)
  })

  it("un niño sin TyC sigue incompleto", () => {
    expect(perfilIncompleto(perfil({ rol: "nino", acepta_compromiso: false, acepta_tyc: false }))).toBe(true)
  })
})

/* ------------------------------------------------------------------ */
/*  obtenerPerfilActual con un cliente de Supabase falso               */
/* ------------------------------------------------------------------ */
type Respuesta = { data: unknown; error: unknown }

function clienteFalso(user: Partial<User> | null, tablas: Record<string, Respuesta>): SupabaseClient {
  const consulta = (tabla: string) => {
    const q = {
      select: () => q,
      eq: () => q,
      maybeSingle: async () => tablas[tabla] ?? { data: null, error: null },
    }
    return q
  }
  return {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from: consulta,
  } as unknown as SupabaseClient
}

const NINO: Nino = {
  profile_id: "u1",
  fecha_nacimiento: "2020-01-01",
  etapa_escolar: "sala_5",
  tutor_email: "tutor@prueba.test",
  tutor_telefono: null,
  letra_entrenamiento: "mayuscula",
  ultima_conexion: null,
  ultimo_entrenamiento: null,
  ultima_prueba: null,
}

describe("obtenerPerfilActual", () => {
  it("sin sesión devuelve null", async () => {
    expect(await obtenerPerfilActual(clienteFalso(null, {}))).toBeNull()
  })

  it("profesional: devuelve el perfil y nino null, sin consultar ninos", async () => {
    const r = await obtenerPerfilActual(
      clienteFalso({ id: "u1" }, {
        profiles: { data: perfil(), error: null },
        ninos: { data: null, error: new Error("no debería consultarse") },
      }),
    )
    expect(r?.profile?.rol).toBe("profesional")
    expect(r?.nino).toBeNull()
  })

  it("niño: devuelve también la fila de ninos", async () => {
    const r = await obtenerPerfilActual(
      clienteFalso({ id: "u1" }, {
        profiles: { data: perfil({ rol: "nino" }), error: null },
        ninos: { data: NINO, error: null },
      }),
    )
    expect(r?.nino?.etapa_escolar).toBe("sala_5")
  })

  it("cuenta sin fila en profiles: profile null", async () => {
    const r = await obtenerPerfilActual(clienteFalso({ id: "u1" }, { profiles: { data: null, error: null } }))
    expect(r?.profile).toBeNull()
    expect(r?.nino).toBeNull()
  })

  it("lanza el error de la consulta de profiles", async () => {
    const error = new Error("profiles falló")
    await expect(
      obtenerPerfilActual(clienteFalso({ id: "u1" }, { profiles: { data: null, error } })),
    ).rejects.toBe(error)
  })

  it("lanza el error de la consulta de ninos", async () => {
    const error = new Error("ninos falló")
    await expect(
      obtenerPerfilActual(
        clienteFalso({ id: "u1" }, {
          profiles: { data: perfil({ rol: "nino" }), error: null },
          ninos: { data: null, error },
        }),
      ),
    ).rejects.toBe(error)
  })
})
