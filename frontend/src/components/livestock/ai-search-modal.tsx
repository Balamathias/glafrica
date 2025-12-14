"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  X,
  Search,
  Loader2,
  ArrowRight,
  Wand2,
  MessageSquare,
  TrendingUp,
  Heart
} from "lucide-react"
import { useLivestockSearch } from "@/lib/hooks"
import { useModalStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Suggestion chips for common AI queries
const SUGGESTIONS = [
  { label: "Breeding pair", query: "Find me a healthy breeding pair" },
  { label: "Investment grade", query: "Show investment grade livestock with good genetics" },
  { label: "Vaccinated", query: "Fully vaccinated and healthy animals" },
  { label: "Under 500k", query: "Quality livestock under 500,000 naira" },
  { label: "Young bulls", query: "Young bulls suitable for breeding" },
  { label: "Dairy goats", query: "High-yield dairy goats" },
]

interface AISearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const { openDetailModal } = useModalStore()
  const { data: results, isLoading, error } = useLivestockSearch(submittedQuery)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setSubmittedQuery("")
      setHasSearched(false)
    }
  }, [isOpen])

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query
    if (q.trim().length >= 2) {
      setSubmittedQuery(q.trim())
      setHasSearched(true)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleResultClick = (livestockId: string) => {
    onClose()
    openDetailModal(livestockId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-2xl"
          >
            <div className="relative bg-background/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Gradient accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X size={20} className="text-muted-foreground" />
              </button>

              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4"
                  >
                    <Wand2 className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                    AI-Powered Search
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Describe what you&apos;re looking for in natural language
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                  <div
                    className={cn(
                      "relative flex items-center rounded-2xl transition-all duration-300",
                      "bg-muted/50 border-2",
                      query.length > 0
                        ? "border-primary/50 shadow-lg shadow-primary/10"
                        : "border-transparent"
                    )}
                  >
                    <Sparkles
                      size={20}
                      className="absolute left-4 text-primary"
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Find me a healthy Boer goat under 500k in Lagos"
                      className={cn(
                        "w-full py-4 pl-12 pr-24 rounded-2xl",
                        "bg-transparent text-foreground placeholder:text-muted-foreground/60",
                        "focus:outline-none text-base"
                      )}
                    />
                    <button
                      onClick={() => handleSearch()}
                      disabled={query.trim().length < 2 || isLoading}
                      className={cn(
                        "absolute right-2 px-4 py-2 rounded-xl",
                        "bg-primary text-primary-foreground font-medium",
                        "hover:bg-primary/90 transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "flex items-center gap-2"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Search size={18} />
                      )}
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                </div>

                {/* Suggestions (show when not searched yet) */}
                {!hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                      <MessageSquare size={14} />
                      Try these suggestions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((suggestion, index) => (
                        <motion.button
                          key={suggestion.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          onClick={() => handleSuggestionClick(suggestion.query)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm",
                            "bg-muted/50 text-muted-foreground",
                            "hover:bg-primary/10 hover:text-primary",
                            "border border-border/50 hover:border-primary/30",
                            "transition-all duration-200"
                          )}
                        >
                          {suggestion.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Results Section */}
                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    {isLoading ? (
                      <div className="py-12 text-center">
                        <div className="inline-flex items-center gap-3 text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span>Searching with AI...</span>
                        </div>
                        <div className="mt-4 flex justify-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary/50"
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : error ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>Something went wrong. Please try again.</p>
                      </div>
                    ) : results && results.length > 0 ? (
                      <div className="max-h-[40vh] overflow-y-auto -mx-2 px-2">
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                          <TrendingUp size={14} />
                          Found {results.length} matching result{results.length > 1 ? "s" : ""}
                        </p>
                        <div className="space-y-2">
                          {results.slice(0, 6).map((item, index) => (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleResultClick(item.id)}
                              className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-xl",
                                "bg-muted/30 hover:bg-muted/50",
                                "border border-transparent hover:border-primary/20",
                                "transition-all duration-200 text-left group"
                              )}
                            >
                              {/* Thumbnail */}
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                {item.featured_image?.file ? (
                                  <Image
                                    src={item.featured_image.file}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Heart size={20} className="text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.breed} • {item.category_name}
                                </p>
                                <p className="text-sm font-medium text-primary">
                                  ₦{item.price?.toLocaleString()}
                                </p>
                              </div>

                              {/* Arrow */}
                              <ArrowRight
                                size={18}
                                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                              />
                            </motion.button>
                          ))}
                        </div>

                        {results.length > 6 && (
                          <button
                            onClick={() => {
                              onClose()
                              router.push(`/livestock?search=${encodeURIComponent(submittedQuery)}`)
                            }}
                            className={cn(
                              "w-full mt-4 py-3 rounded-xl",
                              "text-primary font-medium text-sm",
                              "border border-primary/30 hover:bg-primary/5",
                              "transition-all duration-200",
                              "flex items-center justify-center gap-2"
                            )}
                          >
                            View all {results.length} results
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                          <Search size={24} className="text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">
                          No matches found for &quot;{submittedQuery}&quot;
                        </p>
                        <button
                          onClick={() => {
                            setSubmittedQuery("")
                            setHasSearched(false)
                            setQuery("")
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Try a different search
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Footer hint */}
                <div className="mt-6 pt-4 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    Powered by AI • Understands natural language queries
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
