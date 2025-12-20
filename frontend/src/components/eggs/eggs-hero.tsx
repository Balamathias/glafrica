"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Sparkles, Egg } from "lucide-react"
import { useEggCategories } from "@/lib/hooks"
import { cn } from "@/lib/utils"

interface EggsHeroProps {
  onAISearchClick?: () => void
}

export function EggsHero({ onAISearchClick }: EggsHeroProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: categories } = useEggCategories()
  const activeCategory = searchParams.get("category")

  // Handle category click
  const handleCategoryClick = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categorySlug) {
      params.set("category", categorySlug)
    } else {
      params.delete("category")
    }
    router.push(`/eggs?${params.toString()}`, { scroll: false })
  }

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue.trim()) {
      params.set("search", searchValue.trim())
    } else {
      params.delete("search")
    }
    router.push(`/eggs?${params.toString()}`, { scroll: false })
  }

  // Sync search value with URL
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "")
  }, [searchParams])

  return (
    <section className="relative pt-24 pb-10 min-h-[420px] flex items-center justify-center overflow-hidden">
      {/* Background with animated eggs pattern */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-amber-900/30 to-orange-900/20" />

        {/* Animated decorative eggs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large floating eggs */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] opacity-10"
          >
            <Egg className="w-32 h-32 text-primary" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -8, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-32 right-[15%] opacity-10"
          >
            <Egg className="w-24 h-24 text-amber-500" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, -12, 0],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-32 left-[25%] opacity-10"
          >
            <Egg className="w-20 h-20 text-orange-400" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 18, 0],
              rotate: [0, -5, 0],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-24 right-[20%] opacity-10"
          >
            <Egg className="w-28 h-28 text-primary" />
          </motion.div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white/90">Farm Fresh & Organic</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
        >
          Premium{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Eggs
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
        >
          Fresh from local farms to your table. Discover chicken, duck, quail, and more.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto mb-8"
        >
          <div
            className={cn(
              "relative flex items-center rounded-full transition-all duration-300",
              "bg-white/10 backdrop-blur-md border border-white/20",
              isFocused && "bg-white/20 border-white/40 shadow-lg shadow-amber-500/10"
            )}
          >
            <Search
              size={20}
              className="absolute left-5 text-white/60"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search by type, breed, location..."
              className={cn(
                "w-full py-4 pl-14 pr-32 rounded-full",
                "bg-transparent text-white placeholder:text-white/50",
                "focus:outline-none text-base md:text-lg"
              )}
            />
            <button
              type="submit"
              className={cn(
                "absolute right-2 px-6 py-2.5 rounded-full",
                "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium",
                "hover:from-amber-600 hover:to-orange-600 transition-all",
                "flex items-center gap-2 shadow-lg shadow-amber-500/20"
              )}
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </motion.form>

        {/* AI Search Button */}
        {onAISearchClick && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            onClick={onAISearchClick}
            className={cn(
              "mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-white/10 backdrop-blur-sm border border-white/20",
              "text-white/80 text-sm font-medium",
              "hover:bg-white/20 hover:border-white/30 transition-all duration-200"
            )}
          >
            <Sparkles size={16} className="text-amber-400" />
            Or try AI-powered search
          </motion.button>
        )}

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 pb-4"
        >
          {/* All Category */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
              !activeCategory
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10"
            )}
          >
            All Eggs
          </button>

          {/* Dynamic Categories */}
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category.slug
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10"
              )}
            >
              {category.name}
              {category.egg_count !== undefined && category.egg_count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({category.egg_count})</span>
              )}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
