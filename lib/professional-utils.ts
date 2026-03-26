// Professional panel utilities for role-based access and data management
// Handles psychopedagogists, teachers, and parents

import { createClient as createServerClient } from "@/lib/supabase/server"

export type ProfessionalRole = "psychopedagogist" | "teacher" | "parent"
export type ProfessionalType = "docente" | "psicopedagogo"

export interface ProfessionalUser {
  id: string
  name: string
  email: string
  role: ProfessionalRole
  professionalType?: ProfessionalType // New field for role differentiation
  school_id?: string
  avatar_url?: string
  notification_preferences?: any
}

export interface StudentProfile {
  id: string
  name: string
  age: number
  grade?: string
  mode: "child" | "teen"
  avatar_url?: string
  enrolled_at: string
  school_id?: string
  psychopedagogist_id?: string
  teacher_ids?: string[]
  parent_ids?: string[]
}

export interface StudentProgress {
  student_id: string
  current_level: number
  total_xp: number
  games_completed: number
  total_time_minutes: number
  overall_accuracy: number
  current_streak: number
  longest_streak: number
  last_active_at: string
  skill_scores?: {
    [key: string]: number
  }
}

/**
 * Get current professional user from Supabase auth
 */
export async function getCurrentProfessional(): Promise<ProfessionalUser | null> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch user profile from users table
  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: profile.id,
    name: profile.name || user.email || "Usuario",
    email: user.email || profile.email,
    role: profile.role as ProfessionalRole,
    professionalType: profile.professional_type as ProfessionalType, // Include professional type
    school_id: profile.school_id,
    avatar_url: profile.avatar_url,
    notification_preferences: profile.notification_preferences,
  }
}

/**
 * Get students assigned to professional user (with RLS)
 */
export async function getAssignedStudents(userId: string, role: ProfessionalRole): Promise<StudentProfile[]> {
  const supabase = await createServerClient()

  // RLS policies will automatically filter based on role
  const { data, error } = await supabase.from("students").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching students:", error)
    return []
  }

  return data || []
}

/**
 * Get student progress data
 */
export async function getStudentProgress(studentId: string): Promise<StudentProgress | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("user_progress").select("*").eq("student_id", studentId).single()

  if (error) {
    console.error("[v0] Error fetching progress:", error)
    return null
  }

  return data as StudentProgress
}

/**
 * Get student alerts (filtered by RLS)
 */
export async function getStudentAlerts(studentId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("student_id", studentId)
    .is("resolved_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching alerts:", error)
    return []
  }

  return data || []
}

/**
 * Get student game sessions (last 30 days)
 */
export async function getStudentSessions(studentId: string, limit = 20) {
  const supabase = await createServerClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("student_id", studentId)
    .gte("session_start", thirtyDaysAgo.toISOString())
    .order("session_start", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching sessions:", error)
    return []
  }

  return data || []
}

/**
 * Get role display name in Spanish
 */
export function getRoleDisplayName(role: ProfessionalRole, professionalType?: ProfessionalType): string {
  if (professionalType === "docente") return "Docente"
  if (professionalType === "psicopedagogo") return "Psicopedagogo/a"

  const roleNames: Record<ProfessionalRole, string> = {
    psychopedagogist: "Psicopedagogo/a",
    teacher: "Docente",
    parent: "Padre/Madre/Tutor",
  }
  return roleNames[role] || role
}

/**
 * Check if user has access to specific student
 */
export async function hasAccessToStudent(userId: string, studentId: string, role: ProfessionalRole): Promise<boolean> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("students").select("id").eq("id", studentId).single()

  // RLS will handle access control automatically
  return !error && !!data
}

/**
 * Get student skill breakdown
 */
export async function getStudentSkillBreakdown(studentId: string) {
  const progress = await getStudentProgress(studentId)
  if (!progress || !progress.skill_scores) {
    return []
  }

  return Object.entries(progress.skill_scores).map(([skill, score]) => ({
    skill,
    score: typeof score === "number" ? score : 0,
  }))
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format relative time (e.g., "Hace 2 horas")
 */
export function formatRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`

  return formatDate(date)
}

export function canAccessClinicalNotes(professionalType?: ProfessionalType): boolean {
  return professionalType === "psicopedagogo"
}

export function canEditGameDifficulty(professionalType?: ProfessionalType): boolean {
  return professionalType === "psicopedagogo"
}

export function canGenerateReports(professionalType?: ProfessionalType): boolean {
  return professionalType === "psicopedagogo"
}
