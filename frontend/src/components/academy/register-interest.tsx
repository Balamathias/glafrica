"use client"

import { useState } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Users, School, HeartHandshake, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { InquiryDialog } from "@/components/inquiry/inquiry-dialog"

interface Door {
  icon: React.ElementType
  audience: string
  title: string
  body: string
  cta: string
  context: string
  prefill: string
}

const DOORS: Door[] = [
  {
    icon: Users,
    audience: "Parents & guardians",
    title: "Register a child",
    body: "Join the first intake. Tell us your child's age and we'll be in touch as the Academy opens near you.",
    cta: "Register interest",
    context: "Future Farmers Academy — Parent / guardian",
    prefill:
      "I'd like to register my child for the Future Farmers Academy. Child's age / notes: ",
  },
  {
    icon: School,
    audience: "Schools",
    title: "Start a club or partnership",
    body: "Bring a farm-agriculture club to your school, or host a workshop. We'll build the programme with you.",
    cta: "Partner as a school",
    context: "Future Farmers Academy — School partnership",
    prefill:
      "Our school is interested in a Future Farmers Academy club or partnership. School name / location: ",
  },
  {
    icon: HeartHandshake,
    audience: "Sponsors & partners",
    title: "Fund students & scholarships",
    body: "Sponsor a cohort, a school club, or scholarships for outstanding young farmers. See the outcomes plainly.",
    cta: "Sponsor the Academy",
    context: "Future Farmers Academy — Sponsor / partner",
    prefill:
      "We're interested in supporting the Future Farmers Academy. Our organisation: ",
  },
]

export function RegisterInterest() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [active, setActive] = useState<Door | null>(null)

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
            The Academy is launching
          </span>
          <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
            Be part of the{" "}
            <span className="text-gradient-signature">first intake</span>.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            We&apos;re opening Future Farmers Academy in 2026. Whether you&apos;re a
            parent, a school, or a sponsor, this is where it begins.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {DOORS.map((door, i) => {
            const Icon = door.icon
            return (
              <motion.button
                key={door.title}
                type="button"
                onClick={() => setActive(door)}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className={cn(
                  "group relative flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-7 text-left backdrop-blur-sm md:p-8",
                  "transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                )}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80 md:h-14 md:w-14">
                    <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 md:h-7 md:w-7" />
                  </div>
                  <span className="ledger mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    {door.audience}
                  </span>
                  <h3 className="mt-1.5 text-xl font-semibold text-foreground">{door.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">{door.body}</p>
                  <span className="ledger mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary">
                    {door.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <InquiryDialog
        open={active !== null}
        onOpenChange={(o) => !o && setActive(null)}
        itemName={active?.title ?? ""}
        contextLabel={active?.context ?? "Future Farmers Academy"}
        subject="academy"
        title="Future Farmers Academy"
        description="Tell us a little about you and we'll follow up as the Academy opens. We respond within two working days."
        prefill={active?.prefill}
      />
    </section>
  )
}
