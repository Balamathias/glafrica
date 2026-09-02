"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { HEADLINE_STATS } from "@/lib/impact"
import { FarmersTrained } from "@/components/brand"

export function ImpactStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background py-16 md:py-24"
    >
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
              Delivered, not projected
            </span>
            <h2 className="font-display mt-3 text-2xl font-medium text-foreground sm:text-3xl">
              The numbers, <span className="text-gradient-signature">plainly stated</span>.
            </h2>
          </div>
          <Link
            href="/impact"
            className="ledger inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-foreground/70 transition-colors hover:text-primary"
          >
            Full impact report
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {HEADLINE_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              className={cn(
                "group relative rounded-3xl p-6 md:p-8",
                "bg-card/50 backdrop-blur-sm border border-border/50",
                "transition-all duration-500",
                "hover:-translate-y-1 hover:border-secondary/30 hover:shadow-premium"
              )}
            >
              {/* Gradient wash on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <dd
                  className="font-display text-4xl font-medium tabular-nums md:text-5xl"
                  style={{ color: "var(--ochre)" }}
                >
                  {s.key === "farmers_trained" ? <FarmersTrained /> : s.value}
                </dd>
                <dt className="mt-2 text-sm font-medium text-foreground">{s.label}</dt>
                <p className="ledger mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {s.note}
                </p>
              </div>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}
