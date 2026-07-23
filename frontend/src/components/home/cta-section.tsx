"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "info@greenlivestockafrica.com",
    href: "mailto:info@greenlivestockafrica.com",
    nowrap: false,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+234 915 5467 776",
    href: "tel:+2349155467776",
    nowrap: true,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Odhiogbor road, IGP checkpoint Ele-uma, Mbiama. Rivers State, Nigeria.",
    href: null,
    nowrap: false,
  },
]

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-muted/20 py-20 md:py-32"
    >
      {/* Background glow decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute -left-1/4 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 top-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-display mb-4 text-balance text-3xl font-medium text-foreground sm:text-4xl md:text-5xl"
        >
          Start where you stand.{" "}
          <span className="text-gradient-signature">Grow from there.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Learn openly, equip your farm, and join a network raising the standard of
          livestock farming across Africa. Whether you keep two goats or two hundred.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="w-full rounded-full px-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 sm:w-auto"
          >
            <Link href="/learn">
              Start learning
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full px-8 sm:w-auto"
          >
            <Link href="/partner">Partner with us</Link>
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 flex items-center justify-center gap-4"
        >
          <div className="h-px w-16 bg-border" />
          <span className="ledger text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Or reach us at
          </span>
          <div className="h-px w-16 bg-border" />
        </motion.div>

        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid gap-4 text-left sm:grid-cols-3"
        >
          {contactInfo.map((item) => {
            const Icon = item.icon
            const inner = (
              <div
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm",
                  "transition-all duration-300",
                  item.href && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-premium"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50 text-primary">
                    <Icon size={15} />
                  </span>
                  <span className="ledger text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-3 break-words text-sm font-medium leading-relaxed text-foreground",
                    item.nowrap && "whitespace-nowrap",
                    item.href && "transition-colors group-hover:text-primary"
                  )}
                >
                  {item.value}
                </span>
              </div>
            )

            return item.href ? (
              <a key={item.label} href={item.href} className="block h-full">
                {inner}
              </a>
            ) : (
              <div key={item.label} className="h-full">
                {inner}
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
