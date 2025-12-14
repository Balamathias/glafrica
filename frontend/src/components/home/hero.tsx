"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Parallax effects
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  // Ensure video plays
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - video will show poster
      })
    }
  }, [])

  const scrollToContent = () => {
    const nextSection = document.getElementById("featured")
    nextSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden py-8 md:py-16"
    >
      {/* Video Background */}
      <motion.div
        style={{ scale: videoScale }}
        className="absolute inset-0 z-0"
      >
        {/* Fallback gradient while video loads */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-background/80 transition-opacity duration-1000",
            isVideoLoaded ? "opacity-0" : "opacity-100"
          )}
        />

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          poster="/atmospheric/high-res-wide-shot-with-negative-text.png"
          className="w-full h-full object-cover"
        >
          <source
            src="/atmospheric/4k-cinematic-loop-livestock-grazing.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay - dims the video for better text contrast */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Gradient overlays for depth and text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 80%)"
        }} />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 md:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/90">
                Africa&apos;s Premier Livestock Platform
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-4 md:mb-6"
          >
            Invest in{" "}
            <span className="relative">
              <span className="relative z-10 text-primary">Premium</span>
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 10C50 4 100 4 198 10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            <span className="text-white">African Livestock</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
          >
            Discover verified genetics, documented health histories, and
            exceptional breeds. Your gateway to agricultural wealth starts here.
          </motion.p>

          {/* CTA Buttons - Glassmorphic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary CTA */}
            <Link
              href="/livestock"
              className={cn(
                "group relative w-full sm:w-auto inline-flex items-center justify-center gap-2",
                "px-8 py-4 rounded-full",
                "bg-primary text-primary-foreground font-semibold",
                "shadow-lg shadow-primary/30",
                "transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/40 hover:scale-105",
                "active:scale-95"
              )}
            >
              Explore Livestock
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {/* Secondary CTA - Glassmorphic */}
            <Link
              href="/about"
              className={cn(
                "group relative w-full sm:w-auto inline-flex items-center justify-center gap-2",
                "px-8 py-4 rounded-full",
                "bg-white/10 backdrop-blur-md text-white font-semibold",
                "border border-white/20",
                "transition-all duration-300",
                "hover:bg-white/20 hover:border-white/30",
                "active:scale-95"
              )}
            >
              <Play size={18} className="fill-current" />
              See How It Works
            </Link>
          </motion.div>

          {/* Stats Row - Glassmorphic Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 md:mt-16 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto"
          >
            {[
              { value: "500+", label: "Livestock" },
              { value: "98%", label: "Verified" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className={cn(
                  "px-4 py-3 sm:px-6 sm:py-4 rounded-2xl",
                  "bg-white/10 backdrop-blur-md border border-white/10",
                  "text-center"
                )}
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/60 mt-0.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={24} className="group-hover:text-primary transition-colors" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  )
}
