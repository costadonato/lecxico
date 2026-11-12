import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lexend } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ProveedorMovimiento } from "@/components/motion/proveedor-movimiento"
import { SITIO_URL } from "@/lib/sitio"
import "./globals.css"

// Lexend: diseñada para reducir el estrés visual al leer (útil con dislexia).
const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
}

const TITULO = "Lecxico — Evaluación de indicadores de dislexia y entrenamiento lector"
const DESCRIPCION =
  "Plataforma para profesionales que trabajan con niños de 4 a 8 años: evaluación de indicadores de dislexia por bloques, entrenamiento guiado y seguimiento compartido. Los resultados son orientativos."

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: TITULO,
  description: DESCRIPCION,
  keywords: [
    "dislexia",
    "indicadores de dislexia",
    "lectura",
    "niños",
    "psicopedagogía",
    "fonoaudiología",
    "entrenamiento lector",
    "Argentina",
  ],
  authors: [{ name: "Lecxico" }],
  creator: "Lecxico",
  publisher: "Lecxico",
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    url: "/",
    siteName: "Lecxico",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITULO,
    description: DESCRIPCION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={lexend.variable}>
      <body className="font-sans antialiased">
        <ProveedorMovimiento>
          <Suspense fallback={null}>{children}</Suspense>
        </ProveedorMovimiento>
        <Analytics />
      </body>
    </html>
  )
}
