"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, BadgeCheck } from "lucide-react"
import { useLivestockInfinite } from "@/lib/hooks"
import { GalleryCard } from "@/components/gallery/gallery-card"
import { cn } from "@/lib/utils"

export function FeaturedPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const { data, isLoading, error } = useLivestockInfinite()

  // Get first 6 items from the first page
  const featuredItems = data?.pages[0]?.results.slice(0, 6) || []

  return (
    <section
      ref={ref}
      id="featured"
      className="relative py-20 md:py-32 bg-background overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="ledger mb-4 inline-block text-[11px] uppercase tracking-[0.25em] text-primary"
            >
              Proof of outcomes
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground"
            >
              Raised by trained farmers.{" "}
              <span className="text-gradient-signature">Verified.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl"
            >
              The marketplace is the evidence, not the pitch — livestock with documented
              genetics and health records, raised by the farmers we train and equip.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/livestock"
              className={cn(
                "hidden md:inline-flex items-center gap-2 px-6 py-3",
                "bg-primary text-primary-foreground font-medium rounded-full",
                "hover:shadow-lg hover:shadow-primary/25 hover:scale-105",
                "transition-all duration-300"
              )}
            >
              View All Livestock
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Livestock Masonry Grid */}
        {isLoading ? (
          <FeaturedSkeleton />
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Unable to load livestock. Please try again later.</p>
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.1,
                  ease: "easeOut",
                }}
                className="mb-4 break-inside-avoid"
              >
                <GalleryCard item={item} priority={index < 3} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyFeatured />
        )}

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="md:hidden text-center mt-10"
        >
          <Link
            href="/livestock"
            className={cn(
              "inline-flex items-center gap-2 px-8 py-4 w-full justify-center",
              "bg-primary text-primary-foreground font-semibold rounded-full",
              "hover:shadow-lg hover:shadow-primary/25",
              "transition-all duration-300"
            )}
          >
            Explore All Livestock
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturedSkeleton() {
  // Variable heights for masonry effect
  const heights = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/3]", "aspect-square"]

  return (
    <div className="columns-2 lg:columns-3 gap-4">
      {heights.map((height, i) => (
        <div key={i} className="mb-4">
          <div className={`${height} bg-muted rounded-2xl animate-pulse`} />
        </div>
      ))}
    </div>
  )
}

function EmptyFeatured() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div
        className={cn(
          "relative rounded-3xl p-8 text-center md:p-10",
          "bg-card/50 backdrop-blur-sm border border-border/50"
        )}
      >
        <div className="ledger mb-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
          <span className="h-px w-6 bg-primary/50" />
          Listings in verification
          <span className="h-px w-6 bg-primary/50" />
        </div>
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
          <BadgeCheck className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-display text-2xl font-medium text-foreground">
          The first listings are being verified
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Livestock raised by our trained farmers is being documented — genetics,
          health records, photographs — before it appears here. Nothing is listed
          until it clears verification.
        </p>
        <Link
          href="/contact"
          className="ledger mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
        >
          Ask to be notified
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
