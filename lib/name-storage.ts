/**
 * Utility functions to manage child name storage
 * Saves and retrieves the child's name from localStorage
 */

export const saveChildName = (name: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("childName", name)
    // Dispatch event so other components can listen to name changes
    window.dispatchEvent(
      new CustomEvent("childNameChanged", { detail: { name } })
    )
  }
}

export const getChildName = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("childName")
  }
  return null
}

export const clearChildName = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("childName")
  }
}
