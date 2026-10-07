/** "dd/mm/aaaa" en es-AR; cadena vacía si no hay fecha. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
