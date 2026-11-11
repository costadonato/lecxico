"use client"

import { useRouter } from "next/navigation"
import { Lock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Cargando } from "@/components/estados"
import { MarcoEvaluacion } from "@/components/test/marco-evaluacion"

/**
 * Pantalla previa al test: sin `motivo` muestra la carga (verificando
 * acceso); con `motivo`, el mensaje que impide comenzar. Con `elegirNino`
 * (usuario profesional) ofrece volver a /test para elegir un niño.
 */
export function TestAccesoAviso({ motivo, elegirNino = false }: { motivo?: string; elegirNino?: boolean }) {
  const router = useRouter()

  return (
    <MarcoEvaluacion onVolver={() => router.push("/test")}>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {motivo ? (
          <Card className="w-full max-w-md items-center gap-4 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-rojo-suave text-rojo-fuerte">
              <Lock className="size-7" />
            </span>
            <p className="text-lg font-semibold text-foreground">{motivo}</p>
            {elegirNino && (
              <Button onClick={() => router.push("/test")}>
                <Users />
                Elegir un niño
              </Button>
            )}
          </Card>
        ) : (
          <Cargando />
        )}
      </main>
    </MarcoEvaluacion>
  )
}
