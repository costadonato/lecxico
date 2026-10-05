import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = { title: "Política de Privacidad - Lecxico" }

// TODO: reemplazar por el texto definitivo de la Política de Privacidad.
export default function PrivacidadPage() {
  return (
    <AuthShell titulo="Política de Privacidad">
      <article className="w-full max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="text-muted-foreground">Contenido en preparación.</p>
      </article>
    </AuthShell>
  )
}
