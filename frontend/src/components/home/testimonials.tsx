"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    quote:
      "The quality of livestock here is exceptional. Every animal comes with complete documentation - genetics, health records, everything. It's transformed how I source breeding stock.",
    name: "Ibrahim Adamu",
    location: "Kano, Nigeria",
    role: "Livestock Breeder",
  },
  {
    quote:
      "As an investor, I needed transparency and trust. Green Livestock Africa delivered both. The process was smooth, and the returns on my cattle investment exceeded expectations.",
    name: "Amara Okonkwo",
    location: "Lagos, Nigeria",
    role: "Agricultural Investor",
  },
  {
    quote:
      "First time buying livestock online and I was nervous. The team walked me through everything, the AI assistant answered all my questions, and delivery was seamless.",
    name: "Fatima Bello",
    location: "Abuja, Nigeria",
    role: "First-time Buyer",
  },
]

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 bg-muted/30 overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by Investors{" "}
            <span className="text-gradient-primary">Across Africa</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their
            agricultural investments with us.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.15,
                ease: "easeOut",
              }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  quote,
  name,
  location,
  role,
}: {
  quote: string
  name: string
  location: string
  role: string
}) {
  return (
    <div
      className={cn(
        "relative h-full p-6 lg:p-8 rounded-2xl",
        "bg-background/50 backdrop-blur-sm border border-border/50",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300"
      )}
    >
      {/* Quote Icon */}
      <div className="absolute top-6 right-6 opacity-10">
        <Quote size={48} className="text-primary" />
      </div>

      {/* Quote Text */}
      <blockquote className="relative z-10 mb-6">
        <p className="text-muted-foreground leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar Placeholder */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-semibold text-lg">
            {name.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-semibold text-foreground">{name}</div>
          <div className="text-sm text-muted-foreground">
            {role} &middot; {location}
          </div>
        </div>
      </div>
    </div>
  )
}
