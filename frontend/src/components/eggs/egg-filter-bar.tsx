"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  EGG_TYPE_LABELS,
  EGG_SIZE_LABELS,
  EGG_PACKAGING_LABELS,
} from "@/lib/types"
import type { EggSearchFilters, EggCategory, EggType, EggSize, EggPackaging } from "@/lib/types"
import { useEggCategories } from "@/lib/hooks"

interface EggFilterBarProps {
  filters: EggSearchFilters
  onFiltersChange: (filters: EggSearchFilters) => void
  className?: string
}

export function EggFilterBar({ filters, onFiltersChange, className }: EggFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.search || "")

  const { data: categories } = useEggCategories()

  const handleCategoryChange = (categorySlug: string | undefined) => {
    onFiltersChange({ ...filters, category: categorySlug })
  }

  const handleTypeChange = (eggType: EggType | undefined) => {
    onFiltersChange({ ...filters, egg_type: eggType })
  }

  const handleSizeChange = (size: EggSize | undefined) => {
    onFiltersChange({ ...filters, size })
  }

  const handlePackagingChange = (packaging: EggPackaging | undefined) => {
    onFiltersChange({ ...filters, packaging })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchQuery || undefined })
  }

  const clearFilters = () => {
    setSearchQuery("")
    onFiltersChange({})
  }

  const activeFiltersCount = [
    filters.category,
    filters.egg_type,
    filters.size,
    filters.packaging,
    filters.search,
  ].filter(Boolean).length

  return (
    <div className={cn("bg-background/80 backdrop-blur-sm border-b", className)}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row - Search and Filter Toggle */}
        <div className="flex items-center gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search eggs..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "gap-2",
              activeFiltersCount > 0 && "border-primary text-primary"
            )}
          >
            <Filter size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </Button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <X size={16} className="mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Expanded Filter Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Bird Type
                  </label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) => handleCategoryChange(e.target.value || undefined)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Egg Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Egg Type
                  </label>
                  <select
                    value={filters.egg_type || ""}
                    onChange={(e) => handleTypeChange((e.target.value || undefined) as EggType | undefined)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    {Object.entries(EGG_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Size
                  </label>
                  <select
                    value={filters.size || ""}
                    onChange={(e) => handleSizeChange((e.target.value || undefined) as EggSize | undefined)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Sizes</option>
                    {Object.entries(EGG_SIZE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Packaging Filter */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Packaging
                  </label>
                  <select
                    value={filters.packaging || ""}
                    onChange={(e) => handlePackagingChange((e.target.value || undefined) as EggPackaging | undefined)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Packaging</option>
                    {Object.entries(EGG_PACKAGING_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Category Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
              !filters.category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            All Eggs
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                filters.category === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {cat.name}
              {cat.egg_count !== undefined && (
                <span className="ml-1.5 text-xs opacity-70">({cat.egg_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
