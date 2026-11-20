"use client"

import { DialogoVincularNino } from "@/components/dialogo-vincular-nino"
import { TablaNinosParaEntrenar } from "@/components/entrenamiento/tabla-ninos-entrenar"
import { PaginaApp } from "@/components/pagina-app"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"

/**
 * Acceso directo al modo en consulta (profesional): los niños con vínculo
 * activo, su último entrenamiento visible y "Entrenar en consulta". Misma
 * estructura que /test.
 */
export default function EntrenarPage() {
  const pagina = usePerfilPagina("profesional")
  return (
    <PaginaApp pagina={pagina} titulo="Entrenamiento" acciones={<DialogoVincularNino />} ancho="max-w-6xl">
      {() => <TablaNinosParaEntrenar />}
    </PaginaApp>
  )
}
