"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackPageView } from "@/lib/analytics"

/**
 * Invisible component that tracks page views.
 * Place this in the root layout to track all page navigations.
 */
export function VisitTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string>("")

  useEffect(() => {
    // Build full path with query params
    const queryString = searchParams.toString()
    const fullPath = pathname + (queryString ? `?${queryString}` : "")

    // Avoid duplicate tracking for the same path
    if (fullPath === lastTrackedPath.current) return
    lastTrackedPath.current = fullPath

    // Don't track admin pages
    if (pathname.startsWith("/admin")) return

    // Track the page view
    trackPageView(fullPath)
  }, [pathname, searchParams])

  // This component renders nothing
  return null
}
