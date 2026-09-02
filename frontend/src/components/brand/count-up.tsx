"use client"

import { useEffect, useRef, useState } from "react"
import { useFarmersTrained } from "@/lib/site-figures"

interface CountUpProps {
  /** Target value. Changing it re-runs the animation. */
  value: number
  /** Total animation time. */
  durationMs?: number
  className?: string
}

/**
 * Animates a number up to `value` when it scrolls into view.
 *
 * Fires on intersection rather than on mount so the figures in the footer and
 * lower stat strips actually get seen counting rather than finishing silently
 * while the visitor is still at the top of the page.
 */
export function CountUp({ value, durationMs = 1600, className }: CountUpProps) {
  const [display, setDisplay] = useState(value)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Respect the setting completely: land on the final value, never animate.
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    let frame = 0
    let startedAt: number | null = null

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now
      const progress = Math.min((now - startedAt) / durationMs, 1)
      // Ease-out cubic — fast start, gentle settle onto the real figure.
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setDisplay(0)
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, durationMs])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  )
}

interface FarmersTrainedProps {
  /** Render as plain text (no animation) — for meta-ish or inline prose use. */
  static?: boolean
  className?: string
}

/**
 * The admin-editable "farmers trained" figure, animated.
 *
 * Self-fetching so it can be dropped into client components (hero, footer) and
 * client-rendered pages without threading props from a server boundary.
 */
export function FarmersTrained({ static: isStatic, className }: FarmersTrainedProps) {
  const farmersTrained = useFarmersTrained()

  if (isStatic) {
    return <span className={className}>{farmersTrained.toLocaleString()}</span>
  }

  return <CountUp value={farmersTrained} className={className} />
}
