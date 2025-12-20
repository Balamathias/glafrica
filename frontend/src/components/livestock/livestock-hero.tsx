"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Sparkles } from "lucide-react"
import { useCategories } from "@/lib/hooks"
import { cn } from "@/lib/utils"

interface LivestockHeroProps {
  onAISearchClick?: () => void
}

export function LivestockHero({ onAISearchClick }: LivestockHeroProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: categories } = useCategories()
  const activeCategory = searchParams.get("category")

  // Handle category click
  const handleCategoryClick = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryName) {
      params.set("category", categoryName)
    } else {
      params.delete("category")
    }
    router.push(`/livestock?${params.toString()}`, { scroll: false })
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
    router.push(`/livestock?${params.toString()}`, { scroll: false })
  }

  // Sync search value with URL
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "")
  }, [searchParams])

  return (
    <section className="relative pt-24 pb-10 min-h-[420px] flex items-center justify-center">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          poster="/atmospheric/high-res-wide-shot-with-negative-text.png"
        >
          <source
            src="/atmospheric/4k-cinematic-loop-livestock-grazing.mp4"
            type="video/mp4"
          />
          {/* Fallback to image if video doesn't load */}
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

        {/* Gradient Fade to Content */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
        >
          Discover Premium{" "}
          <span className="text-primary">Livestock</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
        >
          Find your next investment opportunity
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
              isFocused && "bg-white/20 border-white/40 shadow-lg shadow-primary/20"
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
              placeholder="Search breeds, locations, characteristics..."
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
                "bg-primary text-primary-foreground font-medium",
                "hover:bg-primary/90 transition-colors",
                "flex items-center gap-2"
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
            <Sparkles size={16} className="text-primary" />
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
                ? "bg-primary text-primary-foreground"
                : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            )}
          >
            All
          </button>

          {/* Dynamic Categories */}
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              )}
            >
              {category.name}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
