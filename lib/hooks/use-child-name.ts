"use client"

import { useState, useEffect } from "react"
import { getChildName } from "@/lib/name-storage"

/**
 * Hook to access and listen to child name changes
 * Automatically updates when name is changed via saveChildName()
 * Returns the stored name or a default fallback
 */
export function useChildName(fallback: string = "Amigo") {
  const [childName, setChildName] = useState<string>(fallback)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load initial name from localStorage
    const savedName = getChildName()
    if (savedName) {
      setChildName(savedName)
    }
    setIsLoaded(true)

    // Listen for name changes from other components
    const handleNameChange = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.name) {
        setChildName(customEvent.detail.name)
      }
    }

    window.addEventListener("childNameChanged", handleNameChange)
    return () => {
      window.removeEventListener("childNameChanged", handleNameChange)
    }
  }, [fallback])

  return { childName, isLoaded }
}
