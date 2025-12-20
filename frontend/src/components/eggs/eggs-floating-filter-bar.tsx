"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, SlidersHorizontal, Sparkles, Check, Egg } from "lucide-react"
import { useEggCategories } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import {
  EGG_TYPE_LABELS,
  EGG_SIZE_LABELS,
  EGG_PACKAGING_LABELS,
  FRESHNESS_LABELS,
} from "@/lib/types"
import type { EggType, EggSize, EggPackaging, FreshnessStatus } from "@/lib/types"

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "created_at", label: "Oldest" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-production_date", label: "Freshest First" },
]

interface EggsFloatingFilterBarProps {
  onAISearchClick?: () => void
}

export function EggsFloatingFilterBar({ onAISearchClick }: EggsFloatingFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = useEggCategories()

  const activeCategory = searchParams.get("category")
  const activeSort = searchParams.get("sort") || "-created_at"
  const activeSearch = searchParams.get("search")
  const activeType = searchParams.get("egg_type")
  const activeSize = searchParams.get("size")
  const activePackaging = searchParams.get("packaging")
  const activeFreshness = searchParams.get("freshness")

  // Count active filters
  const activeFilterCount = [
    activeCategory,
    activeSearch,
    activeType,
    activeSize,
    activePackaging,
    activeFreshness,
  ].filter(Boolean).length

  // Show/hide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.35
      setIsVisible(window.scrollY > heroHeight)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

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
    router.push(`/eggs?${params.toString()}`, { scroll: false })
  }

  // Clear all filters
  const clearFilters = () => {
    router.push("/eggs", { scroll: false })
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
                "flex flex-col gap-3 py-3 px-4 rounded-2xl",
                "bg-background/80 backdrop-blur-xl border border-border/50",
                "shadow-lg shadow-black/5"
              )}
            >
              {/* Top Row - Categories and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Category Pills - scrollable row */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-1 sm:pb-0">
                  <button
                    onClick={() => updateParams("category", null)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                      !activeCategory
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    All
                  </button>

                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => updateParams("category", category.slug)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                        activeCategory === category.slug
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
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
                  <GlassSelect
                    value={activeSort}
                    onChange={(value) => updateParams("sort", value)}
                    options={SORT_OPTIONS}
                    placeholder="Sort"
                  />

                  {/* AI Search Button */}
                  {onAISearchClick && (
                    <button
                      onClick={onAISearchClick}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
                        "transition-all duration-200"
                      )}
                    >
                      <Sparkles size={14} />
                      <span className="hidden sm:inline">AI Search</span>
                    </button>
                  )}

                  {/* More Filters Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "flex items-center gap-1.5 p-2 rounded-full transition-colors",
                      showFilters
                        ? "bg-amber-500 text-white"
                        : "bg-muted hover:bg-muted/80",
                      activeFilterCount > 0 && !showFilters && "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <SlidersHorizontal size={18} />
                    {activeFilterCount > 0 && (
                      <span className="text-xs font-bold">{activeFilterCount}</span>
                    )}
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

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-border/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Egg Type */}
                        <GlassSelect
                          value={activeType || ""}
                          onChange={(value) => updateParams("egg_type", value || null)}
                          options={Object.entries(EGG_TYPE_LABELS).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                          placeholder="Egg Type"
                          clearLabel="All Types"
                        />

                        {/* Size */}
                        <GlassSelect
                          value={activeSize || ""}
                          onChange={(value) => updateParams("size", value || null)}
                          options={Object.entries(EGG_SIZE_LABELS).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                          placeholder="Size"
                          clearLabel="All Sizes"
                        />

                        {/* Packaging */}
                        <GlassSelect
                          value={activePackaging || ""}
                          onChange={(value) => updateParams("packaging", value || null)}
                          options={Object.entries(EGG_PACKAGING_LABELS).map(([value, label]) => ({
                            value,
                            label,
                          }))}
                          placeholder="Packaging"
                          clearLabel="All Packaging"
                        />

                        {/* Freshness */}
                        <GlassSelect
                          value={activeFreshness || ""}
                          onChange={(value) => updateParams("freshness", value || null)}
                          options={Object.entries(FRESHNESS_LABELS)
                            .filter(([key]) => key !== "unknown")
                            .map(([value, label]) => ({
                              value,
                              label,
                            }))}
                          placeholder="Freshness"
                          clearLabel="Any Freshness"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Filter Chips */}
              <AnimatePresence>
                {(activeSearch || activeFilterCount > 1) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                      {activeSearch && (
                        <FilterChip
                          label={`"${activeSearch}"`}
                          onRemove={() => updateParams("search", null)}
                        />
                      )}
                      {activeCategory && (
                        <FilterChip
                          label={categories?.find((c) => c.slug === activeCategory)?.name || activeCategory}
                          onRemove={() => updateParams("category", null)}
                        />
                      )}
                      {activeType && (
                        <FilterChip
                          label={EGG_TYPE_LABELS[activeType as EggType]}
                          onRemove={() => updateParams("egg_type", null)}
                        />
                      )}
                      {activeSize && (
                        <FilterChip
                          label={EGG_SIZE_LABELS[activeSize as EggSize]}
                          onRemove={() => updateParams("size", null)}
                        />
                      )}
                      {activePackaging && (
                        <FilterChip
                          label={EGG_PACKAGING_LABELS[activePackaging as EggPackaging]}
                          onRemove={() => updateParams("packaging", null)}
                        />
                      )}
                      {activeFreshness && (
                        <FilterChip
                          label={FRESHNESS_LABELS[activeFreshness as FreshnessStatus]}
                          onRemove={() => updateParams("freshness", null)}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Glassmorphism Select Component (inline for this file)
interface GlassSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  clearLabel?: string
}

function GlassSelect({ value, onChange, options, placeholder, clearLabel = "All" }: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 w-full min-w-[120px] px-3 py-2 rounded-xl text-sm font-medium transition-all",
          "bg-muted/50 backdrop-blur-sm border border-border/50 hover:bg-muted hover:border-border",
          isOpen && "ring-2 ring-amber-500/30 border-amber-500/50"
        )}
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 top-full left-0 right-0 min-w-[160px] mt-1.5 py-1.5 rounded-xl",
                "bg-popover/95 backdrop-blur-xl border border-border shadow-xl"
              )}
            >
              <div className="max-h-60 overflow-y-auto">
                {/* Clear option */}
                <button
                  type="button"
                  onClick={() => {
                    onChange("")
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors",
                    !value && "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {clearLabel}
                  {!value && <Check size={14} />}
                </button>

                {/* Separator */}
                <div className="h-px bg-border my-1" />

                {/* Options */}
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors",
                      value === option.value && "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {option.label}
                    {value === option.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Filter Chip Component
function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </motion.span>
  )
}
