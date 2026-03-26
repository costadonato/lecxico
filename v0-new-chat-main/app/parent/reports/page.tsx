"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Calendar, FileText } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      title: "Reporte Mensual - Abril 2025",
      student: "María González",
      date: "30 Abril 2025",
      type: "monthly",
      summary: "38 ejercicios completados, 92% de precisión promedio",
    },
    {
      id: 2,
      title: "Reporte Mensual - Marzo 2025",
      student: "María González",
      date: "31 Marzo 2025",
      type: "monthly",
      summary: "32 ejercicios completados, 89% de precisión promedio",
    },
    {
      id: 3,
      title: "Reporte Trimestral - Q1 2025",
      student: "María González",
      date: "31 Marzo 2025",
      type: "quarterly",
      summary: "93 ejercicios completados, mejora del 15% en comprensión",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/parent/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Reportes</h1>
              <p className="text-sm text-muted-foreground">Historial de reportes de progreso</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Reportes Disponibles
              </CardTitle>
              <CardDescription>Descarga reportes detallados del progreso de tus estudiantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.student}</p>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{report.date}</span>
                    </div>
                  </div>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
