import { pdf } from "@react-pdf/renderer"
import { DocumentoInforme } from "@/components/informes/pdf/documento-informe"
import { registrarFuentes } from "@/components/informes/pdf/estilos"
import type { ModeloInforme } from "@/lib/informes/modelo"

/*
 * Punto de entrada del PDF en el navegador. El diálogo lo carga con
 * import() dinámico al tocar "Generar PDF": react-pdf no pesa en la carga de
 * /ninos/[id]. El PDF se arma en el navegador con los datos que la RLS ya
 * deja leer; no se sube nada a ningún servicio.
 */

/** Arma el PDF y lo descarga con el nombre del modelo. */
export async function descargarInforme(modelo: ModeloInforme): Promise<void> {
  registrarFuentes(`${window.location.origin}/fonts`)
  const blob = await pdf(<DocumentoInforme modelo={modelo} />).toBlob()
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement("a")
    a.href = url
    a.download = modelo.nombreArchivo
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    // Un margen para que el navegador empiece la descarga antes de liberar el blob.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}
