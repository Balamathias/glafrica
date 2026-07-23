"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { HerdHealthCard } from "@/components/brand"

export function HerdHealthTeaser() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background py-20 md:py-28"
    >
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28"
          >
            <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
              The tool, not a brochure
            </span>
            <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
              The <span className="text-gradient-signature">Herd Health Card</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Choose a species and, if you know it, a birth date. We generate a
              vaccination and health protocol dated to your animals — the same
              schedule our trained farmers work from. Print it, or send it to a
              neighbour on WhatsApp.
            </p>
            <ul className="ledger mt-6 space-y-2 text-[13px] text-muted-foreground/80">
              <li>· Goats, sheep, cattle, layers, broilers</li>
              <li>· Real calendar dates from a birth date</li>
              <li>· Compiled from standard veterinary references</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <HerdHealthCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
