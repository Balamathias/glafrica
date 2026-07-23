"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { BookOpen, Wrench, BadgeCheck, TrendingUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const PILLARS = [
  {
    n: "01",
    key: "Enlighten",
    icon: BookOpen,
    title: "Open knowledge, freely shared",
    body: "Workshops, on-farm sessions, and digital resources on breeding, nutrition, disease prevention, and farm management. Never gated behind enrollment or payment.",
    href: "/learn",
    cta: "Explore the knowledge hub",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
  },
  {
    n: "02",
    key: "Equip",
    icon: Wrench,
    title: "The inputs a trained farmer needs",
    body: "Improved genetics and lab support, vets on standby, vaccination schedules by livestock type, and quality inputs — grass seed, fertile eggs, tilapia fingerlings.",
    href: "/store",
    cta: "Visit the Farm Store",
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-500",
  },
  {
    n: "03",
    key: "Verify",
    icon: BadgeCheck,
    title: "Genetics and health, documented",
    body: "The verification of genetics and health records, now applied to livestock raised by farmers we have trained and equipped. Provenance you can check.",
    href: "/livestock",
    cta: "See verified livestock",
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
  },
  {
    n: "04",
    key: "Grow",
    icon: TrendingUp,
    title: "Proof the model works",
    body: "The investment marketplace — repositioned as evidence, not the headline. Trained farmers, verified animals, real outcomes for the farmer and the partner alike.",
    href: "/livestock",
    cta: "Browse the marketplace",
    gradient: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-500",
  },
]

export function ModelPillars() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      id="model"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-20 md:py-28"
    >
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="ledger inline-block text-[11px] uppercase tracking-[0.25em] text-primary"
          >
            How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Enlighten. Equip.{" "}
            <span className="text-gradient-signature">Verify. Grow.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            A single pathway from knowledge to livelihood — each step builds on the one
            before it.
          </motion.p>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 md:gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.li
                key={p.key}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              >
                <div
                  className={cn(
                    "group relative h-full rounded-3xl p-7 md:p-9",
                    "bg-card/50 backdrop-blur-sm",
                    "border border-border/50",
                    "transition-all duration-500",
                    "hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium"
                  )}
                >
                  {/* Gradient wash on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      p.gradient
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-baseline justify-between">
                      <span className="ledger text-sm tabular-nums text-primary">{p.n}</span>
                      <span className="ledger text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
                        {p.key}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl md:h-14 md:w-14",
                        "bg-muted/50 transition-colors duration-300 group-hover:bg-background/80"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6 transition-transform duration-300 group-hover:scale-110 md:h-7 md:w-7",
                          p.iconColor
                        )}
                      />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {p.body}
                    </p>

                    <Link
                      href={p.href}
                      className={cn(
                        "ledger mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest",
                        "text-foreground/70 transition-colors hover:text-primary"
                      )}
                    >
                      {p.cta}
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
