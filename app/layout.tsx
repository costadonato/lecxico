import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lexend } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ProveedorMovimiento } from "@/components/motion/proveedor-movimiento"
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

export const metadata: Metadata = {
  title: "Lecxico - Plataforma Educativa para Dislexia",
  description:
    "Primera plataforma argentina para niños y adolescentes con dislexia. Mejora tu fluidez lectora con ejercicios gamificados y actividades psicopedagógicas validadas científicamente.",
  keywords: [
    "dislexia",
    "educación",
    "lectura",
    "niños",
    "adolescentes",
    "gamificación",
    "neurociencia",
    "Argentina",
    "psicopedagogía",
  ],
  authors: [{ name: "Lecxico", url: "https://lecxico.com" }],
  creator: "Lecxico",
  publisher: "Lecxico",
  openGraph: {
    title: "Lecxico - Plataforma Educativa para Dislexia",
    description:
      "Primera plataforma argentina para niños y adolescentes con dislexia. Mejora tu fluidez lectora con ejercicios gamificados.",
    url: "https://lecxico.com",
    siteName: "Lecxico",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lecxico - Plataforma Educativa para Dislexia con Lex y Lumo",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lecxico - Plataforma Educativa para Dislexia",
    description: "Primera plataforma argentina para niños y adolescentes con dislexia.",
    images: ["/twitter-image.png"],
    creator: "@lecxico",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
    generator: 'v0.app'
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
