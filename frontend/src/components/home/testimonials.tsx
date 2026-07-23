"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import { EarTag } from "@/components/brand"

// NOTE: Farmer quotes below are PLACEHOLDERS awaiting real attributions from the
// owner (real names, locations, cohort). Investor/breeder quotes are the existing
// site copy. Farmer voices are ordered first by design.
const VOICES = [
  {
    quote:
      "Before the training I was losing kids every rainy season. Now I follow the vaccination schedule and keep records — my herd has doubled and I sell with confidence.",
    name: "Cohort 01 farmer",
    location: "",
    role: "Goat farmer",
    kind: "farmer" as const,
    placeholder: true,
  },
  {
    quote:
      "They taught us how to feed properly and prevent bloat. What I learned here I now teach two other families in my village. That is how it spreads.",
    name: "Cohort 01 farmer",
    location: "",
    role: "Mixed livestock farmer",
    kind: "farmer" as const,
    placeholder: true,
  },
  {
    quote:
      "The quality of livestock here is exceptional. Every animal comes with complete documentation — genetics, health records, everything. It transformed how I source breeding stock.",
    name: "Ibrahim Adamu",
    location: "Kano, Nigeria",
    role: "Livestock breeder",
    kind: "partner" as const,
    placeholder: false,
  },
]

const hasPlaceholders = VOICES.some((v) => v.placeholder)

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-muted/20 py-20 md:py-28">
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
            Voices from the field
          </span>
          <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
            The farmers first.{" "}
            <span className="text-gradient-signature">Then the market.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {VOICES.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            >
              <VoiceCard {...v} />
            </motion.div>
          ))}
        </div>

        {hasPlaceholders && (
          <p className="ledger mt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
            Farmer attributions are being finalised with Cohort 01.
          </p>
        )}
      </div>
    </section>
  )
}

function VoiceCard({
  quote,
  name,
  location,
  role,
  kind,
  placeholder,
}: {
  quote: string
  name: string
  location: string
  role: string
  kind: "farmer" | "partner"
  placeholder: boolean
}) {
  const isFarmer = kind === "farmer"
  return (
    <figure
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 backdrop-blur-sm md:p-8",
        "transition-all duration-500 hover:-translate-y-1 hover:shadow-premium",
        isFarmer
          ? "border-primary/25 bg-card/50 hover:border-primary/50"
          : "border-border/50 bg-card/50 hover:border-primary/30"
      )}
    >
      {/* Gradient wash on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          isFarmer ? "from-emerald-500/15 to-emerald-600/5" : "from-secondary/10 to-transparent"
        )}
      />

      {/* Oversized serif quote mark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 right-5 select-none font-display text-[7rem] leading-none text-primary/[0.08]"
      >
        &ldquo;
      </span>

      <div className="relative flex h-full flex-col">
        <EarTag accent={isFarmer} className="self-start">
          {isFarmer ? "Farmer" : "Partner"}
        </EarTag>

        <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/90">
          &ldquo;{quote}&rdquo;
        </blockquote>

        <figcaption className="mt-6 flex items-center gap-3 border-t border-border/50 pt-5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "bg-primary/10"
            )}
          >
            {placeholder ? (
              <Leaf className="h-4.5 w-4.5 text-primary" size={18} />
            ) : (
              <span className="font-semibold text-primary">{name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{name}</div>
            <div className="ledger truncate text-[11px] uppercase tracking-wider text-muted-foreground">
              {[role, location].filter(Boolean).join(" · ")}
            </div>
          </div>
        </figcaption>
      </div>
    </figure>
  )
}
