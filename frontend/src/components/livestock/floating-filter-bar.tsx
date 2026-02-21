"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react"
import { useCategories } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "created_at", label: "Oldest" },
]

interface FloatingFilterBarProps {
  onAISearchClick?: () => void
}

export function FloatingFilterBar({ onAISearchClick }: FloatingFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = useCategories()

  const activeCategory = searchParams.get("category")
  const activeSort = searchParams.get("sort") || "-created_at"
  const activeSearch = searchParams.get("search")

  // Count active filters
  const activeFilterCount = [
    activeCategory,
    activeSearch,
    searchParams.get("gender"),
  ].filter(Boolean).length

  // Show/hide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.35 // Show after 35vh
      setIsVisible(window.scrollY > heroHeight)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Update URL params
  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/livestock?${params.toString()}`, { scroll: false })
  }

  // Clear all filters
  const clearFilters = () => {
    router.push("/livestock", { scroll: false })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-40 pt-16"
        >
          <div className="mx-auto max-w-7xl px-4">
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 rounded-2xl",
                "bg-background/80 backdrop-blur-xl border border-border/50",
                "shadow-lg shadow-black/5"
              )}
            >
              {/* Category Pills - scrollable row */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-1 sm:pb-0">
                <button
                  onClick={() => updateParams("category", null)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                    !activeCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  All
                </button>

                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => updateParams("category", category.name)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                      activeCategory === category.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={activeSort}
                    onChange={(e) => updateParams("sort", e.target.value)}
                    className={cn(
                      "h-9 pl-3 pr-8 rounded-full text-sm font-medium",
                      "bg-muted border-none appearance-none cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                  />
                </div>

                {/* AI Search Button */}
                {onAISearchClick && (
                  <button
                    onClick={onAISearchClick}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                      "bg-primary/10 text-primary hover:bg-primary/20",
                      "transition-all duration-200"
                    )}
                  >
                    <Sparkles size={14} />
                    <span className="hidden sm:inline">AI Search</span>
                  </button>
                )}

                {/* More Filters Button (for future expansion) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    showFilters ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <SlidersHorizontal size={18} />
                </button>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    title="Clear all filters"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Active Filter Chips */}
            <AnimatePresence>
              {(activeSearch || activeFilterCount > 1) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pt-2 pb-1 px-2">
                    {activeSearch && (
                      <FilterChip
                        label={`Search: "${activeSearch}"`}
                        onRemove={() => updateParams("search", null)}
                      />
                    )}
                    {activeCategory && (
                      <FilterChip
                        label={`Category: ${activeCategory}`}
                        onRemove={() => updateParams("category", null)}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        "bg-primary/10 text-primary"
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </span>
  )
}
