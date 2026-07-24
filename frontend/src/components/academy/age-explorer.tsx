"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sprout, Wheat, GraduationCap, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tier {
  band: string
  program: string
  icon: React.ElementType
  blurb: string
  learns: string[]
  leaves: string
}

const TIERS: Tier[] = [
  {
    band: "Ages 5–8",
    program: "Introduction to Farming",
    icon: Sprout,
    blurb: "The first seeds of curiosity — where food comes from, and why farms matter.",
    learns: [
      "Where our food comes from",
      "Farm animals and crops",
      "Nature, soil, and water",
      "Learning through games and storytelling",
    ],
    leaves: "Leaves knowing that food is grown, cared for, and worth respecting.",
  },
  {
    band: "Ages 9–12",
    program: "Farm Basics",
    icon: Wheat,
    blurb: "Hands in the soil — real animals, real hygiene, real record-keeping.",
    learns: [
      "Poultry, goats, rabbits, fish, and crop production",
      "Animal welfare",
      "Biosecurity and farm hygiene",
      "Simple record keeping",
      "Basic farm experiments",
    ],
    leaves: "Leaves able to care for small animals and keep an honest record of a project.",
  },
  {
    band: "Ages 13–18",
    program: "Future Farmer Program",
    icon: GraduationCap,
    blurb: "From producer to entrepreneur — the full craft and business of farming.",
    learns: [
      "Livestock production and crop science",
      "Farm business and entrepreneurship",
      "Farm technology and AI in agriculture",
      "Disease prevention",
      "Leadership and problem-solving",
      "Financial literacy for farmers",
    ],
    leaves: "Leaves thinking like an agricultural entrepreneur, not only a producer.",
  },
]

export function AgeExplorer() {
  const [active, setActive] = useState(0)
  const tier = TIERS[active]
  const Icon = tier.icon

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Tier selector */}
      <div
        className="grid grid-cols-3 gap-2 sm:gap-3"
        role="tablist"
        aria-label="Choose an age band"
      >
        {TIERS.map((t, i) => {
          const selected = i === active
          const TabIcon = t.icon
          return (
            <button
              key={t.band}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={cn(
                "group flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 text-center transition-all duration-300 sm:px-4 sm:py-4",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                selected
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:-translate-y-0.5"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors sm:h-11 sm:w-11",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted/60 text-primary"
                )}
              >
                <TabIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" size={20} />
              </span>
              <span className={cn("text-xs font-semibold sm:text-sm", selected ? "text-primary" : "text-foreground")}>
                {t.band}
              </span>
              <span className="ledger hidden text-[9px] uppercase tracking-wider text-muted-foreground/70 sm:block">
                {`0${i + 1}`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Reveal card — warm vellum "record" of what this child learns */}
      <div className="relative mt-4 overflow-hidden rounded-3xl border border-black/10 surface-vellum shadow-premium-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5 sm:px-8">
              <div>
                <p className="ledger text-[10px] uppercase tracking-[0.25em] text-black/45">
                  {tier.band}
                </p>
                <h3 className="font-display mt-1 text-2xl text-[color:var(--canopy)] sm:text-3xl">
                  {tier.program}
                </h3>
                <p className="mt-1.5 max-w-md text-sm text-black/60">{tier.blurb}</p>
              </div>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "color-mix(in oklab, var(--canopy) 12%, transparent)" }}
              >
                <Icon className="h-6 w-6" style={{ color: "var(--canopy)" }} />
              </span>
            </div>

            {/* What they learn */}
            <div className="px-6 py-6 sm:px-8">
              <p className="ledger text-[10px] uppercase tracking-[0.2em] text-black/45">
                What they explore
              </p>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {tier.learns.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[color:var(--vellum-ink)]">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "color-mix(in oklab, var(--pasture) 22%, transparent)" }}
                    >
                      <Check className="h-2.5 w-2.5" style={{ color: "var(--canopy)" }} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Outcome line — ochre, the graduation stamp of the tier */}
              <div
                className="mt-6 flex items-start gap-2.5 rounded-2xl px-4 py-3"
                style={{ backgroundColor: "color-mix(in oklab, var(--ochre) 12%, transparent)" }}
              >
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#9a6f16" }} />
                <p className="text-sm font-medium" style={{ color: "#5f4708" }}>
                  {tier.leaves}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
