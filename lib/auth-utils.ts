// Utilidades mock (localStorage) que todavía usan los juegos: perfil, tutorial y analytics.
// Se reemplazan en el slice 6. La autenticación real está en lib/auth/.

export type AgeRange = "child" | "teen" | "adult" | "unknown"

export interface UserProfile {
  uid: string
  name: string
  email: string
  age: number
  ageRange: AgeRange
  parentEmail?: string
  profileComplete: boolean
  tutorialSeen?: boolean
  createdAt: string
}

/**
 * Mock analytics tracking (replace with real analytics service)
 */
export const analytics = {
  track: (event: string, data: Record<string, any>) => {
    console.log(`[v0] Analytics Event: ${event}`, data)
    // In production, replace with: analytics.track(event, data)
  },
}

/**
 * Mock profile fetching (replace with real database call)
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In production, replace with:
    // const profile = await db.collection('users').doc(uid).get()
    // return profile.data() as UserProfile

    // For now, get from localStorage (mock)
    const stored = localStorage.getItem(`user_profile_${uid}`)
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    analytics.track("error_fetch_profile", { uid, error: String(error) })
    return null
  }
}

/**
 * Save user profile (mock - replace with real database)
 */
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    // In production, replace with:
    // await db.collection('users').doc(profile.uid).set(profile)

    // For now, save to localStorage (mock)
    localStorage.setItem(`user_profile_${profile.uid}`, JSON.stringify(profile))
    localStorage.setItem("current_user_uid", profile.uid)
    return true
  } catch (error) {
    console.error("[v0] Error saving profile:", error)
    return false
  }
}

/**
 * Get current user UID (mock - replace with real auth)
 */
export function getCurrentUserUid(): string | null {
  return localStorage.getItem("current_user_uid")
}

/**
 * Check if user needs parental consent (under 13)
 */
export function needsParentalConsent(age: number): boolean {
  return age < 13
}

/**
 * Mark tutorial as seen
 */
export async function markTutorialSeen(uid: string): Promise<void> {
  const profile = await fetchUserProfile(uid)
  if (profile) {
    profile.tutorialSeen = true
    await saveUserProfile(profile)
    analytics.track("tutorial_complete", { uid })
  }
}
