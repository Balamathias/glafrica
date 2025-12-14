"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function HeroTransition() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])

  return (
    <div ref={ref} className="relative">
      {/* Main gradient transition */}
      <motion.div
        style={{ opacity }}
        className="h-20 md:h-32 bg-gradient-to-b from-black via-black/80 to-background"
      />

      {/* Decorative wave SVG */}
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-full h-8 md:h-12 text-background"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30C240 10 480 50 720 30C960 10 1200 50 1440 30V60H0V30Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
