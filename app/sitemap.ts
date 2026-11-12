import type { MetadataRoute } from "next"
import { SITIO_URL } from "@/lib/sitio"

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas: { ruta: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }[] = [
    { ruta: "", changeFrequency: "weekly", priority: 1 },
    { ruta: "/dislexia", changeFrequency: "monthly", priority: 0.8 },
    { ruta: "/login", changeFrequency: "yearly", priority: 0.5 },
    { ruta: "/register", changeFrequency: "yearly", priority: 0.6 },
    { ruta: "/terminos", changeFrequency: "yearly", priority: 0.3 },
    { ruta: "/privacidad", changeFrequency: "yearly", priority: 0.3 },
  ]

  return rutas.map(({ ruta, changeFrequency, priority }) => ({
    url: `${SITIO_URL}${ruta}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
