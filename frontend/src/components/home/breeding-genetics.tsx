"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Syringe, Eye, ClipboardCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EarTag } from "@/components/brand"
import { InquiryDialog } from "@/components/inquiry/inquiry-dialog"

/** The three breeds we hold semen for. */
const BREEDS = ["Kalahari", "Boer", "Sahel"]

/**
 * The synchronisation-to-confirmation timeline, kept deliberately close to the
 * standard progestagen + prostaglandin protocol used in does. Day markers
 * rather than 01–04 numerals: numbered markers belong to the
 * Enlighten → Equip → Verify → Grow pipeline alone.
 */
const PROTOCOL = [
  {
    day: "Day 0",
    title: "Synchronise",
    body: "A progesterone device goes in, and the doe is opened on the breeding record.",
  },
  {
    day: "Day 9–11",
    title: "Device out",
    body: "Removed alongside a prostaglandin injection. From here, heat is watched morning and evening.",
  },
  {
    day: "Day 11–13",
    title: "Insemination",
    body: "A straw thawed at the pen and placed on standing heat — roughly 43 to 48 hours after the device comes out.",
  },
  {
    day: "Day 30+",
    title: "Confirmation",
    body: "Pregnancy checked and the result written onto the herd record. You know at one month, not at five.",
  },
]

const WHY = [
  "Kalahari, Boer, and Sahel genetics — without a buck to feed, fence, or fear",
  "No venereal disease walked in on a borrowed buck",
  "Kids born in a tight window — even-sized, easier to sell",
  "Semen held in liquid nitrogen at −196 °C until the moment it is used",
]

const INCLUDED = [
  {
    icon: Syringe,
    title: "Insemination on your farm",
    body: "Book a date and trained technicians travel to you with the flask and the straws. No moving your animals, no borrowing someone else's buck.",
  },
  {
    icon: Eye,
    title: "Heat detection, taught",
    body: "Most failed services are missed heats, not bad semen. We teach the signs and the timing until you can call it yourself.",
  },
  {
    icon: ClipboardCheck,
    title: "Written to the herd record",
    body: "Sire, date, technician, and outcome — logged the same way the Herd Health Card logs a vaccination.",
  },
]

export function BreedingGenetics() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [inquiryOpen, setInquiryOpen] = useState(false)

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background py-20 md:py-28"
    >
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-1/4 bottom-1/4 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
            Artificial insemination
          </span>
          <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
            Better genetics, without{" "}
            <span className="text-gradient-signature">owning the buck</span>.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Artificial insemination puts proven Kalahari, Boer, and Sahel sires
            into your herd — bucks you could never house, feed, or afford. Our
            technicians come to the farm on a booked date. And we teach you the
            part that actually decides whether it works: reading heat, and
            keeping the record.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          {/* Media + the case for it */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/50">
              <Image
                src="/images/goats.webp"
                alt="Ear-tagged Boer goats in a pen on a Green Livestock Africa farm"
                width={1500}
                height={2000}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="h-[380px] w-full object-cover sm:h-[460px] lg:h-[520px]"
              />
              {/* Scrims: the photo is bright at both ends, so darken both */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <EarTag accent className="bg-[color:var(--pasture)]/20 backdrop-blur-sm">
                  Goats
                </EarTag>
                {BREEDS.map((breed) => (
                  <EarTag
                    key={breed}
                    className="border-white/30 bg-black/40 text-white backdrop-blur-sm"
                  >
                    {breed}
                  </EarTag>
                ))}
              </div>

              <div className="absolute inset-x-5 bottom-5">
                <p className="ledger text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/75">
                  Every straw carries a sire, a breed, and a batch — recorded on
                  the animal it goes into.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {WHY.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Protocol ledger + calls to action */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="ledger border-b border-border/50 px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                Breeding protocol · Does
              </div>

              <ol className="divide-y divide-border/40">
                {PROTOCOL.map((step) => (
                  <li
                    key={step.day}
                    className="grid gap-x-5 gap-y-1.5 px-6 py-5 sm:grid-cols-[6.5rem_1fr]"
                  >
                    <span className="ledger text-[11px] uppercase tracking-[0.15em] text-primary sm:pt-0.5">
                      {step.day}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="ledger border-t border-border/50 px-6 py-3 text-[10px] uppercase leading-relaxed tracking-[0.15em] text-muted-foreground/60">
                Timings follow standard veterinary protocol · Adjusted per animal
                on the day · Visits by booking only
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setInquiryOpen(true)}
                className="w-full rounded-full px-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 sm:w-auto"
              >
                Book a breeding visit
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-full px-8 sm:w-auto"
              >
                <Link href="/learn">Learn the protocol</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* What a breeding visit includes */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {INCLUDED.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="group relative flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80">
                    <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        itemName="Artificial insemination"
        contextLabel="Breeding & Genetics — Artificial insemination (goats)"
        subject="visit"
        title="Book a breeding visit"
        description="Tell us how many does, which breed you're after, and where the farm is. We visit by booking only, so our team will follow up to agree a date and talk through timing."
        prefill="I'd like to book artificial insemination for my does. "
      />
    </section>
  )
}
