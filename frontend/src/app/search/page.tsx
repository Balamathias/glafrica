"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GalleryCard } from "@/components/gallery/gallery-card"
import { useLivestockSearch } from "@/lib/hooks"
import { useChatStore } from "@/lib/store"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const { data: results, isLoading, error } = useLivestockSearch(searchTerm)
  const { openChat, addMessage } = useChatStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(query.trim())
  }

  const handleAskAI = () => {
    if (query.trim()) {
      openChat()
      addMessage("user", `Help me find livestock: ${query.trim()}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 md:px-8 py-12 md:py-16 text-center bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold font-serif mb-4"
          >
            Find Your Perfect Livestock
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-8"
          >
            Search our AI-powered catalog to find exactly what you&apos;re looking for
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Input
              icon={<Search size={20} />}
              placeholder="Try 'healthy Boer goat for breeding' or 'cattle under 500k'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-12 text-base"
            />
            <div className="flex gap-2">
              <Button type="submit" size="lg" className="flex-1 sm:flex-none">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleAskAI}
                className="flex-1 sm:flex-none"
              >
                <Sparkles size={18} className="mr-2" />
                Ask AI
              </Button>
            </div>
          </motion.form>
        </div>
      </header>

      {/* Results */}
      <section className="px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <p className="text-destructive mb-4">Something went wrong</p>
              <Button variant="outline" onClick={() => setSearchTerm(query)}>
                Try again
              </Button>
            </motion.div>
          ) : results && results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-6">
                Found <span className="font-medium text-foreground">{results.length}</span> results
                for &quot;{searchTerm}&quot;
              </p>
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}
              >
                <Masonry gutter="16px">
                  {results.map((item) => (
                    <GalleryCard key={item.id} item={item} />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            </motion.div>
          ) : searchTerm ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or ask our AI for help
              </p>
              <Button variant="outline" onClick={handleAskAI}>
                <Sparkles size={16} className="mr-2" />
                Ask AI to help
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">🐄</div>
              <h3 className="text-lg font-semibold mb-2">
                Start your search
              </h3>
              <p className="text-muted-foreground">
                Type what you&apos;re looking for above
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
