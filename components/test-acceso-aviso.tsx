"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Lock } from "lucide-react"

/* Mismo fondo que las pantallas del test */
const backgroundStyle = {
  background: "linear-gradient(135deg, #1a0000 0%, #7f1d1d 50%, #1e1e2e 100%)",
}

/**
 * Pantalla previa al test: sin `motivo` muestra un spinner (verificando
 * acceso); con `motivo`, el mensaje que impide comenzar.
 */
export function TestAccesoAviso({ motivo }: { motivo?: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col" style={backgroundStyle}>
      <header className="h-16 bg-red-600 shadow-lg shrink-0">
        <div className="container mx-auto h-full px-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Lecxico</h1>
          <button
            onClick={() => router.push("/test")}
            className="flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        {motivo ? (
          <div className="max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 text-center space-y-4">
            <Lock className="w-10 h-10 text-white/80 mx-auto" />
            <p className="text-lg font-semibold text-white">{motivo}</p>
          </div>
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        )}
      </main>
    </div>
  )
}
