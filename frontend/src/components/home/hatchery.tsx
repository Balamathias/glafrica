"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Bird, Egg, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoField, EarTag } from "@/components/brand"
import { InquiryDialog } from "@/components/inquiry/inquiry-dialog"
import { VIDEOS, POSTERS } from "@/lib/media"
import type { InquirySubject } from "@/lib/api"

/**
 * The 21-day incubation run, typeset as ledger rows. Day markers rather than
 * 01–04 numerals, matching the breeding protocol: numbered markers stay
 * reserved for the Enlighten → Equip → Verify → Grow pipeline.
 */
const INCUBATION = [
  {
    day: "Day 0",
    title: "Set",
    body: "Eggs go in at 37.5 °C and roughly 45% humidity, turned three to five times a day from here.",
  },
  {
    day: "Day 7",
    title: "Candle",
    body: "Held to the light. Veins mean an embryo is growing; clear eggs are infertile and come out.",
  },
  {
    day: "Day 18",
    title: "Lockdown",
    body: "Turning stops so chicks can position themselves. Humidity rises to about 65% so membranes don't dry onto them.",
  },
  {
    day: "Day 21",
    title: "Hatch",
    body: "They pip, they rest, they come out. Dried off and counted before they go anywhere.",
  },
]

type Route = {
  icon: typeof Bird
  tag: string
  title: string
  body: string
  cta: string
  subject: InquirySubject
  dialogTitle: string
  dialogDescription: string
  prefill: string
  contextLabel: string
}

const ROUTES: Route[] = [
  {
    icon: Bird,
    tag: "Buy chicks",
    title: "Day-old exotic chicks",
    body: "Exotic stock hatched here and collected at day one. Tell us how many you need and roughly when, and we set eggs to meet your date.",
    cta: "Ask about day-old chicks",
    subject: "purchase",
    dialogTitle: "Day-old exotic chicks",
    dialogDescription:
      "Tell us how many chicks you need and when you want them. We'll confirm what we can hatch to that date, and which breeds are available.",
    prefill: "I'd like to buy day-old exotic chicks. ",
    contextLabel: "Hatchery — Day-old exotic chicks",
  },
  {
    icon: Egg,
    title: "Bring us your eggs",
    tag: "Custom hatch",
    body: "Your fertile eggs, our incubator. You get the chicks at hatch — plus the count of what was set, what candled clear, and what came out.",
    cta: "Ask about custom hatching",
    subject: "visit",
    dialogTitle: "Custom hatching",
    dialogDescription:
      "Tell us roughly how many eggs you want set and when you could bring them. Farm visits are by booking only, so we'll agree a date with you first.",
    prefill: "I'd like you to incubate my fertile eggs. ",
    contextLabel: "Hatchery — Custom hatching",
  },
]

export function Hatchery() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [openRoute, setOpenRoute] = useState<Route | null>(null)

  return (
    <section ref={ref} className="relative">
      {/* Field: the hatch itself, full-bleed */}
      <div className="relative flex min-h-[420px] items-end overflow-hidden md:min-h-[480px]">
        <VideoField
          src={VIDEOS.littleChicks}
          poster={POSTERS.hero}
          overlayClassName="bg-gradient-to-b from-[#0b120c]/70 via-[#0b120c]/45 to-[#0b120c]"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-24 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <EarTag accent>The hatchery</EarTag>
            <h2 className="font-display mt-5 max-w-3xl text-balance text-3xl font-medium leading-[1.1] text-white sm:text-4xl md:text-5xl">
              Twenty-one days, <span className="text-gradient-signature">held steady</span>.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">
              The embryo does the work. Our job is to hold temperature, humidity,
              turning, and ventilation steady for three weeks and not flinch —
              then hand you chicks that are dry, counted, and ready to brood.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Ledger: the incubation run, then the two ways in */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0b120c] via-background to-background py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <div className="ledger border-b border-border/50 px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Incubation run · Chicken eggs
            </div>

            <ol className="grid divide-y divide-border/40 md:grid-cols-4 md:divide-x md:divide-y-0">
              {INCUBATION.map((step) => (
                <li key={step.day} className="px-6 py-5">
                  <span className="ledger text-[11px] uppercase tracking-[0.15em] text-primary">
                    {step.day}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>

            <p className="ledger border-t border-border/50 px-6 py-3 text-[10px] uppercase leading-relaxed tracking-[0.15em] text-muted-foreground/60">
              Standard incubation figures · Breeds available on request
            </p>
          </motion.div>

          {/* Two ways in */}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {ROUTES.map((route, i) => {
              const Icon = route.icon
              return (
                <motion.div
                  key={route.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                  className="group relative flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80">
                      <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="ledger mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                      {route.tag}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">{route.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {route.body}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setOpenRoute(route)}
                      className="mt-6 w-fit rounded-full px-6"
                    >
                      {route.cta}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {openRoute && (
        <InquiryDialog
          open
          onOpenChange={(open) => !open && setOpenRoute(null)}
          itemName={openRoute.title}
          contextLabel={openRoute.contextLabel}
          subject={openRoute.subject}
          title={openRoute.dialogTitle}
          description={openRoute.dialogDescription}
          prefill={openRoute.prefill}
        />
      )}
    </section>
  )
}
