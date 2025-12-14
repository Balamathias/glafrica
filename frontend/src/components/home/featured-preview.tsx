"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              <Sparkles size={16} />
              Featured Collection
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
            >
              Premium{" "}
              <span className="text-gradient-primary">Livestock</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl"
            >
              Hand-picked selections from our verified breeders,
              ready for your investment portfolio
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
          <div className="columns-2 lg:columns-3 gap-4">
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
                className="mb-4"
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
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
        Coming Soon
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Our curated livestock collection is being prepared.
        Check back soon for premium listings from verified breeders.
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 mt-6 text-primary font-medium hover:underline"
      >
        Get Notified
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}
