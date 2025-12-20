/**
 * Client-side analytics tracking utility for Green Livestock Africa.
 * Tracks page views and livestock modal views.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export type EventType = 'page_view' | 'livestock_view'

interface TrackEventData {
  type: EventType
  path: string
  livestock_id?: string
  referrer?: string | null
}

/**
 * Get or create a session ID stored in sessionStorage.
 * This ID persists for the browser session only.
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('gla_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('gla_session_id', sessionId)
  }
  return sessionId
}

/**
 * Track an analytics event (page view or livestock view).
 * Fails silently to avoid breaking the user experience.
 */
export async function trackEvent(data: TrackEventData): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return // SSR or no session

  try {
    await fetch(`${API_URL}/analytics/track/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        type: data.type,
        path: data.path,
        livestock_id: data.livestock_id || null,
        referrer: data.referrer ?? (typeof document !== 'undefined' ? document.referrer : null),
      }),
      keepalive: true, // Ensure request completes even on navigation
    })
  } catch {
    // Silent fail - analytics should never break UX
  }
}

/**
 * Track a page view event.
 * @param path - The page path (e.g., '/livestock')
 */
export function trackPageView(path: string): void {
  trackEvent({
    type: 'page_view',
    path,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
  })
}

/**
 * Track a livestock detail view (e.g., modal open).
 * @param livestockId - The UUID of the livestock item
 * @param path - The current page path
 */
export function trackLivestockView(livestockId: string, path?: string): void {
  trackEvent({
    type: 'livestock_view',
    path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    livestock_id: livestockId,
    referrer: typeof document !== 'undefined' ? document.referrer : null,
  })
}
