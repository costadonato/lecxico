import { createClient } from "@/lib/supabase/client"
import type { NinoParaTest } from "@/lib/types/database"

/** Niños a los que el profesional actual puede tomarles el test (RPC ninos_para_test). */
export async function ninosParaTest(): Promise<NinoParaTest[]> {
  const { data, error } = await createClient().rpc("ninos_para_test")
  if (error) throw new Error(error.message || "No se pudo cargar la lista de niños.")
  return (data ?? []) as NinoParaTest[]
}
