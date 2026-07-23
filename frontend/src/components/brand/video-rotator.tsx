"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface RotatorSource {
  src: string
  poster: string
}

interface VideoRotatorProps {
  /** Two or more clips to cross-fade between, in order. */
  sources: RotatorSource[]
  /** Seconds each clip holds before cross-fading to the next. */
  intervalMs?: number
  /** Cross-fade duration in ms (kept in sync with the CSS transition). */
  fadeMs?: number
  className?: string
  /** Scrim classes stacked above the video for text contrast. */
  overlayClassName?: string
  children?: React.ReactNode
}

/**
 * Cross-fading background video for a hero "Field". All clips play muted+looping
 * while the section is in view; a timer toggles which one is on top. Honours
 * reduced-motion and Save-Data by showing the first poster alone, and pauses
 * every clip when the hero scrolls out of view.
 */
export function VideoRotator({
  sources,
  intervalMs = 12000,
  fadeMs = 1200,
  className,
  overlayClassName,
  children,
}: VideoRotatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [motionOk, setMotionOk] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    const saveData = nav.connection?.saveData === true
    if (!reduce && !saveData) setMotionOk(true)
  }, [])

  // Pause/resume all clips with viewport visibility; advance on a timer.
  useEffect(() => {
    if (!motionOk || sources.length < 2) return
    const el = containerRef.current
    if (!el) return

    let timer: ReturnType<typeof setInterval> | null = null
    const playAll = () => videoRefs.current.forEach((v) => v?.play().catch(() => {}))
    const pauseAll = () => videoRefs.current.forEach((v) => v?.pause())

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playAll()
          timer ??= setInterval(
            () => setActive((i) => (i + 1) % sources.length),
            intervalMs
          )
        } else {
          pauseAll()
          if (timer) {
            clearInterval(timer)
            timer = null
          }
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timer) clearInterval(timer)
    }
  }, [motionOk, sources.length, intervalMs])

  return (
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      {motionOk ? (
        sources.map((s, i) => (
          <video
            key={s.src}
            ref={(node) => {
              videoRefs.current[i] = node
            }}
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            poster={s.poster}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
            style={{
              opacity: i === active ? 1 : 0,
              transitionDuration: `${fadeMs}ms`,
            }}
          >
            <source src={s.src} type="video/mp4" />
          </video>
        ))
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sources[0]?.poster}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      )}
      {overlayClassName && <div className={cn("absolute inset-0", overlayClassName)} />}
      {children}
    </div>
  )
}
