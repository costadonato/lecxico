import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = { title: "Términos y Condiciones - Lecxico" }

// TODO: reemplazar por el texto definitivo de los Términos y Condiciones.
export default function TerminosPage() {
  return (
    <AuthShell titulo="Términos y Condiciones">
      <article className="w-full max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
        <p className="text-muted-foreground">Contenido en preparación.</p>
      </article>
    </AuthShell>
  )
}
