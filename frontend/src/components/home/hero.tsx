"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { VideoRotator } from "@/components/brand"
import { RecordLine } from "@/components/brand"
import { VIDEOS, LOCAL_VIDEOS, POSTERS } from "@/lib/media"

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80])

  const scrollToContent = () => {
    document.getElementById("model")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
    >
      {/* Field: cinematic video that alternates between the Sahel goats (R2) and
          the prior grazing loop, with contrast scrims (atmospheric gradients kept). */}
      <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-0">
        <VideoRotator
          sources={[
            { src: VIDEOS.goatsSahel, poster: POSTERS.hero },
            { src: LOCAL_VIDEOS.grazingLoop, poster: POSTERS.hero },
            { src: VIDEOS.fishesInPond, poster: POSTERS.hero },
          ]}
          overlayClassName="bg-gradient-to-b from-[#0b120c]/70 via-[#0b120c]/45 to-[#0b120c]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b120c]/60 via-transparent to-[#0b120c]/40" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-8 lg:px-12"
      >
        <div className="mx-auto w-full max-w-5xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="ledger mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/70"
          >
            <span className="h-px w-8 bg-[color:var(--pasture)]" />
            Green Livestock Africa
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="max-w-4xl text-balance font-display text-[1.9rem] font-medium leading-[1.1] text-white min-[420px]:text-4xl sm:text-5xl sm:leading-[1.05] md:text-6xl lg:text-7xl"
          >
            Building the next generation of{" "}
            <span className="text-gradient-signature">African farmers</span>.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:mt-6 sm:text-lg"
          >
            Open training in breeding, nutrition, and disease prevention — livestock
            knowledge as the working answer to hunger and food insecurity across Africa.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/learn"
              className={cn(
                "group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 sm:w-auto",
                "bg-[color:var(--pasture)] font-semibold text-[color:var(--nightfield)]",
                "transition-transform duration-300 hover:scale-[1.03] active:scale-95"
              )}
            >
              Start learning
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/impact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/10 sm:w-auto"
            >
              See the outcomes
            </Link>
          </motion.div>

          {/* Signature record line — the hero's only "widget" */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8 sm:mt-10"
          >
            <RecordLine
              segments={["Cohort 01", "93 Farmers Trained", "Verified"]}
              verified
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="group absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/55 transition-colors hover:text-white sm:flex"
        aria-label="Scroll to content"
      >
        <span className="ledger text-[10px] uppercase tracking-[0.25em]">The model</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={22} />
        </motion.span>
      </motion.button>
    </section>
  )
}
