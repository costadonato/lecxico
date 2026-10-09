"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

/**
 * Inicia el flujo OAuth de Google. Vuelve por /auth/callback, que crea la
 * sesión y manda a /completar-perfil si es la primera vez.
 */
export function BotonGoogle({ texto, next }: { texto: string; next?: string }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setCargando(true)
    setError(null)
    const callback = new URL("/auth/callback", window.location.origin)
    if (next) callback.searchParams.set("next", next)

    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    })
    // Si todo sale bien el navegador ya se fue a Google; solo queda manejar el error.
    if (error) {
      console.error("Google OAuth:", error)
      setError("No se pudo conectar con Google. Probá de nuevo.")
      setCargando(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleClick} disabled={cargando}>
        {cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconoGoogle />}
        {texto}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  )
}

function IconoGoogle() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
    </svg>
  )
}
