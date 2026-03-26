// Professional panel tools - functional implementations
// Handles data processing, analysis, and reporting for professionals

import { createClient } from "@/lib/supabase/server"

export interface ProgressByArea {
  area: "reading" | "writing" | "math"
  areaName: string
  sessionsCount: number
  accuracy: number
  totalTime: number
  level: "low" | "medium" | "high"
  trend: "improving" | "stable" | "declining"
}

export interface ActivityRecord {
  id: string
  date: string
  gameId: string
  gameName: string
  area: "reading" | "writing" | "math"
  completed: boolean
  accuracy: number
  timeSpent: number
  attempts: number
}

export interface ProfessionalObservation {
  id: string
  studentId: string
  createdBy: string
  createdAt: string
  content: string
  type: "progress" | "difficulty" | "strategy"
  private: boolean
}

export interface PedagogicalAlert {
  id: string
  studentId: string
  type: "repeated_errors" | "excessive_time" | "abandonment" | "fatigue"
  severity: "low" | "medium" | "high"
  title: string
  message: string
  detectedAt: string
  metadata?: any
}

// 1. TOOL: Progress Viewer by Area
export async function getProgressByArea(studentId: string): Promise<ProgressByArea[]> {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("student_id", studentId)
    .order("session_start", { ascending: false })

  if (!sessions) return []

  const areas = [
    { key: "reading", name: "Lectura", keywords: ["lectura", "letra", "palabra", "eco", "rompe"] },
    { key: "writing", name: "Escritura", keywords: ["escritura", "escribir"] },
    { key: "math", name: "Matemática", keywords: ["matematica", "numero", "cuenta", "suma"] },
  ]

  return areas.map((area) => {
    const areaSessions = sessions.filter((s) =>
      area.keywords.some((keyword) => s.game_id?.toLowerCase().includes(keyword)),
    )

    const totalCorrect = areaSessions.reduce((sum, s) => sum + (s.correct_attempts || 0), 0)
    const totalAttempts = areaSessions.reduce((sum, s) => sum + (s.total_attempts || 1), 0)
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
    const totalTime = areaSessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0)

    // Calculate level based on accuracy and session count
    let level: "low" | "medium" | "high" = "low"
    if (accuracy >= 80 && areaSessions.length >= 10) level = "high"
    else if (accuracy >= 60 && areaSessions.length >= 5) level = "medium"

    // Simple trend calculation (last 5 vs previous 5)
    const recent = areaSessions.slice(0, 5)
    const previous = areaSessions.slice(5, 10)
    const recentAvg =
      recent.length > 0
        ? recent.reduce((sum, s) => sum + (s.correct_attempts || 0) / (s.total_attempts || 1), 0) / recent.length
        : 0
    const previousAvg =
      previous.length > 0
        ? previous.reduce((sum, s) => sum + (s.correct_attempts || 0) / (s.total_attempts || 1), 0) / previous.length
        : 0

    let trend: "improving" | "stable" | "declining" = "stable"
    if (recentAvg > previousAvg + 0.1) trend = "improving"
    else if (recentAvg < previousAvg - 0.1) trend = "declining"

    return {
      area: area.key as any,
      areaName: area.name,
      sessionsCount: areaSessions.length,
      accuracy,
      totalTime,
      level,
      trend,
    }
  })
}

// 2. TOOL: Activity History
export async function getActivityHistory(
  studentId: string,
  filters?: { area?: string; startDate?: string; endDate?: string },
): Promise<ActivityRecord[]> {
  const supabase = await createClient()

  let query = supabase
    .from("game_sessions")
    .select("*")
    .eq("student_id", studentId)
    .order("session_start", { ascending: false })
    .limit(100)

  if (filters?.startDate) {
    query = query.gte("session_start", filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte("session_start", filters.endDate)
  }

  const { data: sessions } = await query

  if (!sessions) return []

  return sessions.map((session) => {
    const gameId = session.game_id || "unknown"
    let area: "reading" | "writing" | "math" = "reading"

    if (gameId.includes("matematica") || gameId.includes("numero") || gameId.includes("cuenta")) {
      area = "math"
    } else if (gameId.includes("escritura") || gameId.includes("escribir")) {
      area = "writing"
    }

    const accuracy =
      session.total_attempts > 0 ? Math.round((session.correct_attempts / session.total_attempts) * 100) : 0

    return {
      id: session.id,
      date: session.session_start,
      gameId: session.game_id,
      gameName: session.game_id?.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) || "Juego",
      area,
      completed: session.completed || false,
      accuracy,
      timeSpent: session.time_spent_seconds || 0,
      attempts: session.total_attempts || 0,
    }
  })
}

// 3. TOOL: Professional Observations (Create)
export async function createObservation(data: {
  studentId: string
  content: string
  type: "progress" | "difficulty" | "strategy"
  createdBy: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Store in audit_logs as professional observations
  const { error } = await supabase.from("audit_logs").insert({
    user_id: data.createdBy,
    action: "professional_observation",
    resource_type: "student",
    resource_id: data.studentId,
    changes: {
      content: data.content,
      type: data.type,
      timestamp: new Date().toISOString(),
    },
  })

  if (error) {
    console.error("[v0] Error creating observation:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// 3. TOOL: Professional Observations (Read)
export async function getObservations(studentId: string): Promise<ProfessionalObservation[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("audit_logs")
    .select("*, users(name)")
    .eq("resource_type", "student")
    .eq("resource_id", studentId)
    .eq("action", "professional_observation")
    .order("created_at", { ascending: false })

  if (!data) return []

  return data.map((log: any) => ({
    id: log.id,
    studentId: log.resource_id,
    createdBy: log.users?.name || "Profesional",
    createdAt: log.created_at,
    content: log.changes?.content || "",
    type: log.changes?.type || "progress",
    private: true,
  }))
}

// 4. TOOL: Pedagogical Alerts Detection
export async function detectPedagogicalAlerts(studentId: string): Promise<PedagogicalAlert[]> {
  const supabase = await createClient()

  const alerts: PedagogicalAlert[] = []

  // Get recent sessions (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("student_id", studentId)
    .gte("session_start", thirtyDaysAgo.toISOString())
    .order("session_start", { ascending: false })

  if (!sessions || sessions.length === 0) return alerts

  // Detection 1: Repeated errors (accuracy < 40% in last 5 sessions)
  const recentSessions = sessions.slice(0, 5)
  const lowAccuracySessions = recentSessions.filter((s) => {
    const accuracy = s.total_attempts > 0 ? (s.correct_attempts / s.total_attempts) * 100 : 0
    return accuracy < 40
  })

  if (lowAccuracySessions.length >= 3) {
    alerts.push({
      id: `repeated-errors-${studentId}`,
      studentId,
      type: "repeated_errors",
      severity: "medium",
      title: "Dificultad persistente detectada",
      message: "Se observa una dificultad persistente en las últimas actividades. Precisión por debajo del 40%.",
      detectedAt: new Date().toISOString(),
      metadata: { affectedSessions: lowAccuracySessions.length },
    })
  }

  // Detection 2: Excessive time (average time > 2x expected)
  const avgTime = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / sessions.length
  if (avgTime > 180) {
    // More than 3 minutes average
    alerts.push({
      id: `excessive-time-${studentId}`,
      studentId,
      type: "excessive_time",
      severity: "low",
      title: "Tiempos de resolución elevados",
      message: "Se observan tiempos de resolución superiores al promedio esperado.",
      detectedAt: new Date().toISOString(),
      metadata: { avgTimeSeconds: Math.round(avgTime) },
    })
  }

  // Detection 3: Abandonment (many incomplete sessions)
  const incompleteSessions = sessions.filter((s) => !s.completed)
  const abandonmentRate = (incompleteSessions.length / sessions.length) * 100

  if (abandonmentRate > 40) {
    alerts.push({
      id: `abandonment-${studentId}`,
      studentId,
      type: "abandonment",
      severity: "high",
      title: "Patrón de abandono de actividades",
      message: `Se detecta abandono frecuente de actividades (${Math.round(abandonmentRate)}% incompletas).`,
      detectedAt: new Date().toISOString(),
      metadata: { abandonmentRate: Math.round(abandonmentRate) },
    })
  }

  // Detection 4: Fatigue (marked in sessions)
  const fatigueDetected = sessions.filter((s) => s.fatigue_detected)
  if (fatigueDetected.length > 2) {
    alerts.push({
      id: `fatigue-${studentId}`,
      studentId,
      type: "fatigue",
      severity: "medium",
      title: "Indicadores de fatiga",
      message: "Se han detectado indicadores de fatiga en múltiples sesiones recientes.",
      detectedAt: new Date().toISOString(),
      metadata: { fatigueSessionsCount: fatigueDetected.length },
    })
  }

  return alerts
}

// 5. TOOL: Student Educational Profile
export interface EducationalProfile {
  student: {
    id: string
    name: string
    age: number
    grade?: string
    enrolledAt: string
  }
  summary: {
    totalSessions: number
    totalTimeMinutes: number
    overallAccuracy: number
    currentLevel: number
  }
  strengths: string[]
  areasToReinforce: string[]
  recommendations: string[]
}

export async function getEducationalProfile(studentId: string): Promise<EducationalProfile | null> {
  const supabase = await createClient()

  const { data: student } = await supabase.from("students").select("*").eq("id", studentId).single()

  const { data: progress } = await supabase.from("user_progress").select("*").eq("student_id", studentId).single()

  if (!student) return null

  const progressByArea = await getProgressByArea(studentId)

  // Determine strengths (areas with high level)
  const strengths: string[] = []
  const areasToReinforce: string[] = []

  progressByArea.forEach((area) => {
    if (area.level === "high" || area.accuracy >= 80) {
      strengths.push(area.areaName)
    }
    if (area.level === "low" || area.accuracy < 60) {
      areasToReinforce.push(area.areaName)
    }
  })

  // Generate recommendations
  const recommendations: string[] = []
  if (areasToReinforce.length > 0) {
    recommendations.push(`Reforzar actividades en: ${areasToReinforce.join(", ")}`)
  }
  if (progress && progress.hints_used > 20) {
    recommendations.push("Considerar reducir el uso de ayudas para promover autonomía")
  }
  if (progress && progress.current_streak < 3) {
    recommendations.push("Fomentar la práctica regular para mantener continuidad")
  }

  return {
    student: {
      id: student.id,
      name: student.name,
      age: student.age,
      grade: student.grade,
      enrolledAt: student.enrolled_at,
    },
    summary: {
      totalSessions: progress?.total_sessions || 0,
      totalTimeMinutes: progress?.total_time_minutes || 0,
      overallAccuracy: progress?.overall_accuracy || 0,
      currentLevel: progress?.current_level || 1,
    },
    strengths: strengths.length > 0 ? strengths : ["En proceso de evaluación"],
    areasToReinforce: areasToReinforce.length > 0 ? areasToReinforce : ["Ninguna identificada aún"],
    recommendations,
  }
}

// 6. TOOL: Report Generator
export interface GeneratedReport {
  id: string
  type: "individual" | "summary"
  title: string
  generatedAt: string
  content: {
    student?: EducationalProfile
    period: { start: string; end: string }
    summary: string
    details: any
  }
}

export async function generateReport(
  studentId: string,
  type: "individual" | "summary",
  periodStart: string,
  periodEnd: string,
): Promise<GeneratedReport> {
  const profile = await getEducationalProfile(studentId)
  const alerts = await detectPedagogicalAlerts(studentId)
  const progressByArea = await getProgressByArea(studentId)

  const summary = `Reporte educativo del estudiante ${profile?.student.name}. 
    Durante el período analizado se observa un nivel ${profile?.summary.currentLevel} con ${profile?.summary.totalSessions} sesiones completadas.
    Fortalezas identificadas en: ${profile?.strengths.join(", ")}.
    ${alerts.length > 0 ? `Se detectaron ${alerts.length} alerta(s) pedagógica(s) que requieren atención.` : ""}`

  return {
    id: `report-${studentId}-${Date.now()}`,
    type,
    title: `Reporte ${type === "individual" ? "Individual" : "Resumen"} - ${profile?.student.name}`,
    generatedAt: new Date().toISOString(),
    content: {
      student: profile || undefined,
      period: { start: periodStart, end: periodEnd },
      summary,
      details: {
        progressByArea,
        alerts,
        observations: await getObservations(studentId),
      },
    },
  }
}
