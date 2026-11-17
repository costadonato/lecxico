import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Aviso de éxito (verde menta) o error (rojo) de una acción, o un aviso
 * informativo (celeste). El informativo usa role="status": no interrumpe
 * al lector de pantalla, y sus colores fijos mantienen el contraste en el
 * modo oscuro.
 */
export function MensajeAlerta({ tipo, texto }: { tipo: "ok" | "error" | "info"; texto: string }) {
  if (tipo === "info") {
    return (
      <Alert role="status" className="border-celeste/40 bg-celeste-suave text-celeste-fuerte">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-celeste-fuerte">{texto}</AlertDescription>
      </Alert>
    )
  }
  return (
    <Alert variant={tipo === "error" ? "destructive" : "exito"}>
      {tipo === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertDescription>{texto}</AlertDescription>
    </Alert>
  )
}
