export type UserRole = "parent" | "teacher" | "psychopedagogist" | "student" | "admin"

export type AlertLevel = "info" | "warning" | "critical"
export type AlertType = "low_accuracy" | "low_completion" | "no_progress" | "high_hints" | "streak_broken"

export interface User {
  uid: string
  role: UserRole
  linkedStudents: string[]
  profile: {
    name: string
    email: string
    consent: boolean
    createdAt: string
  }
}

export interface Student {
  id: string
  name: string
  age: number
  grade: string
  mode: "child" | "teen"
  avatar?: string
  parentIds: string[]
  teacherIds: string[]
  psychopedagogistId?: string
  enrolledAt: string
}

export interface SessionMetrics {
  sessionId: string
  studentId: string
  date: string
  duration: number // minutes
  exercisesCompleted: number
  correctAnswers: number
  totalAttempts: number
  hintsUsed: number
  wpm: number // words per minute
  accuracy: number // percentage
  categories: {
    [key: string]: {
      attempts: number
      correct: number
      avgTime: number
    }
  }
}

export interface StudentKPIs {
  studentId: string
  period: "week" | "month" | "all"
  wpm: number // words per minute
  wpmTrend: number // percentage change
  accuracy: number // percentage
  accuracyTrend: number
  completionRate: number // percentage
  streak: number // consecutive days
  maxSpan: number // memory span achieved
  hintsUsageRate: number // percentage
  totalExercises: number
  totalTime: number // minutes
  lastActive: string
  level: number
}

export interface Alert {
  id: string
  studentId: string
  type: AlertType
  level: AlertLevel
  title: string
  message: string
  createdAt: string
  resolvedAt?: string
  notifiedRoles: UserRole[]
  actionTaken?: string
  metadata: {
    metric?: string
    value?: number
    threshold?: number
    sessions?: number
  }
}

export interface InterventionPlan {
  id: string
  studentId: string
  createdBy: string
  createdAt: string
  duration: number // weeks
  objectives: string[]
  exercises: {
    gameId: string
    frequency: string // e.g., "3x por semana"
    duration: number // minutes
  }[]
  successCriteria: string[]
  observations: string[]
  status: "active" | "completed" | "paused"
}

export interface Report {
  id: string
  studentId: string
  type: "parent" | "teacher" | "psychopedagogist"
  generatedAt: string
  generatedBy: string
  period: {
    from: string
    to: string
  }
  summary: string
  metrics: StudentKPIs
  alerts: Alert[]
  recommendations: string[]
  interventionPlan?: InterventionPlan
}

export interface ClassSummary {
  classId: string
  teacherId: string
  students: {
    studentId: string
    name: string
    percentile: number
    wpm: number
    accuracy: number
    lastActive: string
    alertCount: number
  }[]
  averages: {
    wpm: number
    accuracy: number
    completionRate: number
  }
}
