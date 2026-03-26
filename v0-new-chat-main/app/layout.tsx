import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

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
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
