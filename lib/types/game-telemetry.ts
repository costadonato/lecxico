// Tipos TypeScript para telemetría de juegos

export interface GameSession {
  id: string
  userId: string
  gameId: string
  sessionStart: Date
  sessionEnd?: Date
  levelStart: number
  levelEnd?: number
  totalAttempts: number
  correctAttempts: number
  hintsUsed: number
  timeSpentSeconds: number
  completed: boolean
  metadata?: Record<string, any>
}

export interface GameAttempt {
  id: string
  sessionId: string
  attemptNumber: number
  timestamp: Date
  level: number
  isCorrect: boolean
  timeToAnswer: number
  hintUsed: boolean
  contentId?: string
  userResponse?: string
  correctResponse?: string
  metadata?: Record<string, any>
}

export interface UserProgress {
  id: string
  userId: string
  gameId: string
  currentLevel: number
  maxLevelReached: number
  totalSessions: number
  totalTimeSeconds: number
  totalAttempts: number
  totalCorrect: number
  accuracy: number
  lastPlayed?: Date
  skillMetrics?: SkillMetrics
}

export interface SkillMetrics {
  // Lectura
  phonologicalAwareness?: number // 0-10
  vocabulary?: number
  fluency?: number
  comprehension?: number

  // Matemáticas
  numericalSense?: number
  comparison?: number
  calculation?: number

  // General
  workingMemory?: number
  attention?: number
  processingSpeed?: number
}

export interface SpacedRepetitionItem {
  id: string
  userId: string
  gameId: string
  contentId: string
  contentType: string
  lastSeen: Date
  timesReviewed: number
  accuracy: number
  nextReview: Date
  intervalDays: number
  metadata?: Record<string, any>
}

// Eventos de telemetría

export type TelemetryEvent =
  | SessionStartEvent
  | ExerciseAttemptEvent
  | SessionEndEvent
  | LevelUpEvent
  | HintUsedEvent
  | FatigueDetectedEvent

export interface SessionStartEvent {
  eventType: "session_start"
  sessionId: string
  userId: string
  gameId: string
  timestamp: string
  level: number
  metadata?: {
    deviceType?: string
    platform?: string
    userAgent?: string
  }
}

export interface ExerciseAttemptEvent {
  eventType: "exercise_attempt"
  sessionId: string
  attemptId: string
  userId: string
  gameId: string
  timestamp: string
  attemptNumber: number
  level: number
  contentId?: string
  userResponse?: string
  correctResponse?: string
  isCorrect: boolean
  timeToAnswer: number
  hintUsed: boolean
  metadata?: Record<string, any>
}

export interface SessionEndEvent {
  eventType: "session_end"
  sessionId: string
  userId: string
  gameId: string
  timestamp: string
  levelStart: number
  levelEnd: number
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  hintsUsed: number
  timeSpentSeconds: number
  completed: boolean
  metadata?: {
    maxConsecutiveCorrect?: number
    avgTimePerAttempt?: number
    levelUpAchieved?: boolean
  }
}

export interface LevelUpEvent {
  eventType: "level_up"
  sessionId: string
  userId: string
  gameId: string
  timestamp: string
  previousLevel: number
  newLevel: number
  triggeredBy: "consecutive_correct" | "high_accuracy" | "manual"
}

export interface HintUsedEvent {
  eventType: "hint_used"
  sessionId: string
  attemptId: string
  userId: string
  gameId: string
  timestamp: string
  hintType: "audio" | "visual" | "text" | "auto"
  consecutiveErrors: number
}

export interface FatigueDetectedEvent {
  eventType: "fatigue_detected"
  sessionId: string
  userId: string
  gameId: string
  timestamp: string
  indicators: {
    recentAccuracy: number
    avgTimeIncrease: number
    consecutiveErrors: number
  }
  recommendedAction: "break" | "easier_level" | "end_session"
}

// Funciones de utilidad

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100) / 100
}

export function calculateWordsPerMinute(words: number, seconds: number): number {
  if (seconds === 0) return 0
  return Math.round((words / seconds) * 60)
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
