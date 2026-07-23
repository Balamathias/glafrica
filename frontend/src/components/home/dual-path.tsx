"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { Sprout, Tractor, ArrowRight } from "lucide-react"

const PATHS = [
  {
    icon: Sprout,
    tier: "New to farming",
    title: "Start with the fundamentals",
    body: "Begin with the basics of housing, feeding, and keeping animals healthy — then take on your first birds or goats with a plan you can follow.",
    href: "/learn",
    cta: "Begin the starter track",
  },
  {
    icon: Tractor,
    tier: "Already farming",
    title: "Sharpen genetics and yields",
    body: "Improve breeding, tighten your vaccination discipline, and access verified genetics and inputs to raise the quality and value of your herd.",
    href: "/learn",
    cta: "Go deeper",
  },
]

export function DualPath() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
            Find your starting point
          </span>
          <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
            Wherever you are, there is a{" "}
            <span className="text-gradient-signature">next step</span>.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {PATHS.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.tier}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={p.href}
                  className="group relative flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium md:p-10"
                >
                  {/* Gradient wash on hover */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80 md:h-14 md:w-14">
                      <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 md:h-7 md:w-7" />
                    </div>
                    <span className="ledger mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                      {p.tier}
                    </span>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                    <span className="ledger mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary">
                      {p.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
