"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Layers } from "lucide-react"
import { useCategoriesWithPreviews } from "@/lib/hooks"
import { cn } from "@/lib/utils"

// Fallback gradient backgrounds for categories without images
const CATEGORY_GRADIENTS = [
  "from-emerald-600/80 to-emerald-900/90",
  "from-amber-600/80 to-amber-900/90",
  "from-sky-600/80 to-sky-900/90",
  "from-rose-600/80 to-rose-900/90",
  "from-violet-600/80 to-violet-900/90",
  "from-teal-600/80 to-teal-900/90",
]

export function CategoriesShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { data: categories, isLoading, error } = useCategoriesWithPreviews()

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-32 bg-muted/30 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
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
            Browse by Category
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            Find Your{" "}
            <span className="text-gradient-primary">Perfect Livestock</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
          >
            Explore our curated selection of premium livestock across various
            categories
          </motion.p>
        </motion.div>

        {/* Categories Grid / Scroll */}
        {isLoading ? (
          <CategoriesSkeleton />
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Unable to load categories. Please try again later.</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <>
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden -mx-4 px-4">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="snap-start flex-shrink-0 w-[280px]"
                  >
                    <CategoryCard category={category} gradientIndex={index} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <CategoryCard category={category} gradientIndex={index} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <EmptyCategories />
        )}

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/livestock"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "text-primary font-medium",
              "border border-primary/30 rounded-full",
              "hover:bg-primary hover:text-primary-foreground",
              "transition-all duration-300"
            )}
          >
            View All Categories
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    description: string
    livestock_count: number
    preview_image: {
      file: string
      media_type: string
    } | null
  }
  gradientIndex: number
}

function CategoryCard({ category, gradientIndex }: CategoryCardProps) {
  const gradient = CATEGORY_GRADIENTS[gradientIndex % CATEGORY_GRADIENTS.length]

  return (
    <Link
      href={`/livestock?category=${encodeURIComponent(category.name)}`}
      className="group relative block h-72 md:h-80 rounded-3xl overflow-hidden"
    >
      {/* Background Image or Gradient */}
      <div className="absolute inset-0">
        {category.preview_image ? (
          <>
            <Image
              src={category.preview_image.file}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              gradient
            )}
          />
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        {/* Glassmorphic card that appears on hover */}
        <motion.div
          initial={false}
          className={cn(
            "absolute inset-x-4 bottom-4 p-5 rounded-2xl",
            "bg-white/10 backdrop-blur-md border border-white/20",
            "transform transition-all duration-300",
            "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          <p className="text-white/80 text-sm line-clamp-2">
            {category.description || `Explore our selection of ${category.name.toLowerCase()}`}
          </p>
          <div className="flex items-center gap-2 mt-3 text-primary font-medium text-sm">
            Explore
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </motion.div>

        {/* Default visible content */}
        <div className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
            {category.name}
          </h3>
          <p className="text-white/70 text-sm">
            {category.livestock_count} {category.livestock_count === 1 ? "listing" : "listings"}
          </p>
        </div>
      </div>

      {/* Corner badge */}
      <div className="absolute top-4 right-4">
        <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
          {category.livestock_count} available
        </div>
      </div>
    </Link>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-72 md:h-80 rounded-3xl bg-muted animate-pulse"
        />
      ))}
    </div>
  )
}

function EmptyCategories() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Layers className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
        No Categories Yet
      </h3>
      <p className="text-muted-foreground">
        Categories will appear here once livestock is added.
      </p>
    </div>
  )
}
