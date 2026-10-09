import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/** Aviso de éxito (verde) o error (rojo) de una acción. */
export function MensajeAlerta({ tipo, texto }: { tipo: "ok" | "error"; texto: string }) {
  return (
    <Alert variant={tipo === "error" ? "destructive" : "default"} className={tipo === "ok" ? "border-green-300 bg-green-50 text-green-800" : ""}>
      {tipo === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertDescription className={tipo === "ok" ? "text-green-800" : ""}>{texto}</AlertDescription>
    </Alert>
  )
}
