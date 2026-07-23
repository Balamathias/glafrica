"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface VideoFieldProps {
  /** Cloudflare R2 URL (never proxied through the API). */
  src: string
  /** Local poster shown before/without video (webp/png in /public). */
  poster: string
  /** Eager-load the hero video; below-fold fields stay `preload="none"`. */
  priority?: boolean
  className?: string
  /** Overlay scrim classes stacked above the video for text contrast. */
  overlayClassName?: string
  children?: React.ReactNode
}

/**
 * Full-bleed background video for a "Field" section. Only plays while in view,
 * respects reduced-motion and Save-Data by showing the poster alone, and never
 * decodes more than its own viewport's worth of video.
 */
export function VideoField({
  src,
  poster,
  priority = false,
  className,
  overlayClassName,
  children,
}: VideoFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [motionOk, setMotionOk] = useState(false)

  useEffect(() => {
    // Honour reduced-motion and Save-Data: poster only.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    const saveData = nav.connection?.saveData === true
    if (reduce || saveData) return
    setMotionOk(true)
  }, [])

  useEffect(() => {
    if (!motionOk) return
    const el = containerRef.current
    const video = videoRef.current
    if (!el || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay blocked — poster remains */
          })
        } else {
          video.pause()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [motionOk])

  return (
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      {motionOk ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload={priority ? "auto" : "none"}
          poster={poster}
          className="h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
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
