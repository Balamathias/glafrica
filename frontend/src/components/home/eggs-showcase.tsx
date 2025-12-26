"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Egg, Sparkles } from "lucide-react"
import { useEggsInfinite } from "@/lib/hooks"
import { EggCard } from "@/components/eggs/egg-card"
import { cn } from "@/lib/utils"

export function EggsShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const { data, isLoading, error } = useEggsInfinite()

  // Get first 6 items from the first page
  const featuredItems = data?.pages[0]?.results.slice(0, 6) || []

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 bg-background overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4"
            >
              <Sparkles size={16} />
              Farm Fresh Collection
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
            >
              Premium{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                Eggs
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl"
            >
              Fresh eggs from local farms - chicken, duck, quail, turkey and more.
              Quality you can trust.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/eggs"
              className={cn(
                "hidden md:inline-flex items-center gap-2 px-6 py-3",
                "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-full",
                "hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105",
                "transition-all duration-300"
              )}
            >
              View All Eggs
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Eggs Masonry Grid */}
        {isLoading ? (
          <EggsSkeleton />
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Unable to load eggs. Please try again later.</p>
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
                <EggCard item={item} priority={index < 3} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyEggs />
        )}

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="md:hidden text-center mt-10"
        >
          <Link
            href="/eggs"
            className={cn(
              "inline-flex items-center gap-2 px-8 py-4 w-full justify-center",
              "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full",
              "hover:shadow-lg hover:shadow-amber-500/25",
              "transition-all duration-300"
            )}
          >
            Explore All Eggs
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function EggsSkeleton() {
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

function EmptyEggs() {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
        <Egg className="w-10 h-10 text-amber-500" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
        Coming Soon
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Our premium eggs collection is being prepared.
        Check back soon for fresh eggs from local farms.
      </p>
      <Link
        href="/eggs"
        className="inline-flex items-center gap-2 mt-6 text-amber-600 dark:text-amber-400 font-medium hover:underline"
      >
        Browse Eggs
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}
