"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ShieldCheck, HeartPulse, Sparkles, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const VALUE_CARDS = [
  {
    icon: ShieldCheck,
    title: "Verified Genetics",
    description: "Documented lineage for every animal with certified pedigree records",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: HeartPulse,
    title: "Health Tracked",
    description: "Complete vaccination history and veterinary health records",
    gradient: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Intelligent search that understands exactly what you're looking for",
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-500",
  },
  {
    icon: Lock,
    title: "Secure Deals",
    description: "Protected transactions with full transparency at every step",
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-500",
  },
]

export function ValueProps() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-sm font-medium text-primary uppercase tracking-wider mb-4"
          >
            Why Choose Us
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            The{" "}
            <span className="text-gradient-primary">Green Livestock</span>{" "}
            Difference
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
          >
            We've reimagined livestock trading with technology, trust, and
            transparency at its core.
          </motion.p>
        </motion.div>

        {/* Value Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {VALUE_CARDS.map((card, index) => {
            const Icon = card.icon

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.1,
                  ease: "easeOut",
                }}
              >
                <div
                  className={cn(
                    "group relative h-full p-6 md:p-8 rounded-3xl",
                    "bg-card/50 backdrop-blur-sm",
                    "border border-border/50",
                    "transition-all duration-500",
                    "hover:border-primary/30 hover:shadow-premium",
                    "hover:-translate-y-1"
                  )}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-br",
                      card.gradient
                    )}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl mb-4 md:mb-5",
                        "bg-muted/50 group-hover:bg-background/80",
                        "transition-colors duration-300"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6 md:w-7 md:h-7 transition-transform duration-300",
                          "group-hover:scale-110",
                          card.iconColor
                        )}
                      />
                    </div>

                    {/* Content */}
                    <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
