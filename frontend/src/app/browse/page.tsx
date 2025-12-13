"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  SlidersHorizontal,
  X,
  Search,
  Grid3X3,
  List,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { InfiniteGallery } from "@/components/gallery/infinite-gallery"
import { useFilterStore } from "@/lib/store"
import { useCategories } from "@/lib/hooks"
import { cn } from "@/lib/utils"

const GENDER_OPTIONS = [
  { value: undefined, label: "All Genders" },
  { value: "M" as const, label: "Male" },
  { value: "F" as const, label: "Female" },
  { value: "mixed" as const, label: "Mixed/Group" },
]

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
]

export default function BrowsePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { filters, setFilters, clearFilters, viewMode, setViewMode } = useFilterStore()
  const { data: categories } = useCategories()

  const activeFilterCount = [
    filters.category,
    filters.gender,
    filters.search,
    filters.is_sold !== undefined,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="px-4 md:px-8 py-8 border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
            Browse Livestock
          </h1>
          <p className="text-muted-foreground">
            Explore our complete collection of premium animals
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                icon={<Search size={18} />}
                placeholder="Search by name, breed, location..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ search: e.target.value || undefined })}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <Button
                variant={isFilterOpen ? "default" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative"
              >
                <SlidersHorizontal size={18} className="mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.ordering || "-created_at"}
                  onChange={(e) => setFilters({ ordering: e.target.value })}
                  className="h-10 px-3 pr-8 rounded-lg border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
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

              {/* View Mode Toggle */}
              <div className="hidden md:flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2.5 transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2.5 transition-colors",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) =>
                      setFilters({ category: e.target.value || undefined })
                    }
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <select
                    value={filters.gender || ""}
                    onChange={(e) =>
                      setFilters({
                        gender: (e.target.value || undefined) as typeof filters.gender,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <select
                    value={
                      filters.is_sold === undefined
                        ? ""
                        : filters.is_sold
                          ? "sold"
                          : "available"
                    }
                    onChange={(e) => {
                      const val = e.target.value
                      setFilters({
                        is_sold:
                          val === ""
                            ? undefined
                            : val === "sold"
                              ? true
                              : false,
                      })
                    }}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                  >
                    <option value="">All</option>
                    <option value="available">Available Only</option>
                    <option value="sold">Sold Only</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price || ""}
                      onChange={(e) =>
                        setFilters({
                          min_price: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price || ""}
                      onChange={(e) =>
                        setFilters({
                          max_price: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-destructive hover:text-destructive"
                  >
                    <X size={14} className="mr-1" />
                    Clear all
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Gallery */}
      <InfiniteGallery />
    </div>
  )
}
