// Auth utilities for Lecxico platform
// Handles age-based routing, profile validation, and analytics

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
 * Determines age range based on user's age
 * @param age - User's age as number
 * @returns AgeRange classification
 */
export function getAgeRange(age: number): AgeRange {
  if (isNaN(age) || age < 0) return "unknown"
  if (age >= 6 && age <= 12) return "child"
  if (age >= 13 && age <= 16) return "teen"
  if (age >= 17) return "adult"
  return "unknown"
}

/**
 * Validates if age is within acceptable range for the platform
 */
export function isValidAge(age: number, expectedRange: "child" | "teen"): boolean {
  if (expectedRange === "child") {
    return age >= 6 && age <= 12
  }
  if (expectedRange === "teen") {
    return age >= 13 && age <= 17
  }
  return false
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
 * Main auth redirect handler
 * Called after successful login/registration
 */
export async function handleAuthRedirect(uid: string, router: any): Promise<void> {
  console.log("[v0] Starting auth redirect for uid:", uid)

  // Fetch user profile with retry logic
  let profile: UserProfile | null = null
  let retries = 3

  while (retries > 0 && !profile) {
    profile = await fetchUserProfile(uid)
    if (!profile) {
      retries--
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  // If profile doesn't exist or is incomplete
  if (!profile || !profile.age || !profile.profileComplete) {
    analytics.track("profile_incomplete", { uid })
    console.log("[v0] Profile incomplete, redirecting to profile completion")
    router.push("/profile/complete")
    return
  }

  const age = profile.age
  const ageRange = getAgeRange(age)

  console.log("[v0] User age:", age, "Range:", ageRange)

  // Track redirect event
  analytics.track("redirect_to_dashboard", {
    uid,
    ageRange,
    age,
    timestamp: new Date().toISOString(),
  })

  if (ageRange === "child") {
    const startTutorial = !profile.tutorialSeen
    console.log("[v0] Redirecting child to games/child")
    router.push(`/games/child${startTutorial ? "?startTutorial=true" : ""}`)
  } else if (ageRange === "teen") {
    console.log("[v0] Redirecting teen to dashboard/teen")
    router.push("/dashboard/teen")
  } else if (ageRange === "adult") {
    // Adults might be parents/teachers
    console.log("[v0] Redirecting adult to parent/dashboard")
    router.push("/parent/dashboard")
  } else {
    // Unknown age range - let user choose
    console.log("[v0] Unknown age range, redirecting to profile")
    router.push("/profile?chooseMode=true")
  }
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
