"use client"

import { useState } from "react"
import Image from "next/image"
import { Egg, Bird, Fish, Sprout, Beef, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog"
import { InquiryForm } from "@/components/inquiry/inquiry-form"
import { EarTag } from "@/components/brand"

interface Product {
  icon: typeof Egg
  tag: string
  title: string
  body: string
  image?: string
}

const PRODUCTS: Product[] = [
  {
    icon: Egg,
    tag: "Poultry",
    title: "Fertile eggs",
    body: "Fertile hatching eggs from healthy, productive stock — for farmers ready to incubate and grow their own flock.",
    image: "/images/eggs_in_crate.webp",
  },
  {
    icon: Bird,
    tag: "Poultry",
    title: "Exotic chickens",
    body: "Improved and exotic breeds selected for meat and egg performance under local conditions.",
  },
  {
    icon: Fish,
    tag: "Aquaculture",
    title: "Tilapia fingerlings",
    body: "Healthy fingerlings to stock ponds — a fast, protein-rich vertical for the trained farmer.",
  },
  {
    icon: Sprout,
    tag: "Inputs",
    title: "Grass seed & forage",
    body: "Quality pasture and forage seed for better nutrition, lower feed cost, and healthier ruminants.",
  },
  {
    icon: Beef,
    tag: "Livestock",
    title: "General livestock sourcing",
    body: "Goats, sheep, cattle and more — sourced from trained farmers with documented genetics and health.",
    image: "/images/goats.webp",
  },
]

export function StoreGrid() {
  const [active, setActive] = useState<Product | null>(null)

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => {
          const Icon = p.icon
          return (
            <button
              key={p.title}
              type="button"
              onClick={() => setActive(p)}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/50 text-left backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {p.image ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <EarTag accent>{p.tag}</EarTag>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center border-b border-border/60 bg-[color:var(--canopy)]/10">
                  <Icon className="h-10 w-10" style={{ color: "var(--pasture)" }} />
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                {!p.image && (
                  <div className="mb-3">
                    <EarTag>{p.tag}</EarTag>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
                <span className="ledger mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[color:var(--pasture)]">
                  Request availability
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="font-display">Request availability</DialogTitle>
            <DialogDescription>
              {active
                ? `Tell us about your ${active.title.toLowerCase()} needs and our sourcing desk will follow up. We respond within two working days.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {active && (
              <InquiryForm
                subject="purchase"
                contextLabel={`Farm Store — ${active.title}`}
                prefill={`I'd like to source ${active.title.toLowerCase()}. Quantity/notes: `}
                submitLabel="Send request"
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
