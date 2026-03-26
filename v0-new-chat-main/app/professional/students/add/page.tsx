"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    grade: "",
    mode: "" as "child" | "teen" | "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      // Get professional profile
      const { data: professional } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (!professional || professional.role !== "psychopedagogist") {
        throw new Error("Solo psicopedagogos pueden agregar estudiantes")
      }

      // Create student
      const { data: student, error } = await supabase
        .from("students")
        .insert({
          name: formData.name,
          age: Number.parseInt(formData.age),
          grade: formData.grade,
          mode: formData.mode,
          psychopedagogist_id: user.id,
          school_id: professional.school_id,
          enrolled_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Create initial progress record
      await supabase.from("user_progress").insert({
        student_id: student.id,
        current_level: 1,
        total_xp: 0,
        games_completed: 0,
        total_time_minutes: 0,
        overall_accuracy: 0,
        current_streak: 0,
        longest_streak: 0,
      })

      alert("Estudiante agregado exitosamente")
      router.push("/professional/dashboard")
    } catch (error: any) {
      console.error("[v0] Error adding student:", error)
      alert(error.message || "Error al agregar estudiante")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/professional/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Agregar Estudiante</h1>
              <p className="text-sm text-muted-foreground">Crear perfil de nuevo estudiante</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Nuevo Estudiante</CardTitle>
                <CardDescription>Completa los datos del estudiante</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ej: 10"
                    min={6}
                    max={17}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grado/Año</Label>
                  <Input
                    id="grade"
                    type="text"
                    placeholder="Ej: 4to grado"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Modo de interfaz</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value: "child" | "teen") => setFormData({ ...formData, mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Infantil (6-12 años)</SelectItem>
                    <SelectItem value="teen">Adolescente (13-17 años)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  El modo determina el diseño y complejidad de la interfaz
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Guardando..." : "Agregar Estudiante"}
                  <UserPlus className="ml-2 w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
