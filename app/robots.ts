import type { MetadataRoute } from "next"
import { SITIO_URL } from "@/lib/sitio"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/parent/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${SITIO_URL}/sitemap.xml`,
  }
}
