import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/** Aviso de éxito (verde menta) o error (rojo) de una acción. */
export function MensajeAlerta({ tipo, texto }: { tipo: "ok" | "error"; texto: string }) {
  return (
    <Alert variant={tipo === "error" ? "destructive" : "exito"}>
      {tipo === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertDescription>{texto}</AlertDescription>
    </Alert>
  )
}
