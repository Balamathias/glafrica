"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Search, Loader2, Folder, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { categoriesApi, type Category } from "@/lib/admin-api"

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load categories
  const loadCategories = React.useCallback(async () => {
    if (hasLoaded) return

    setIsLoading(true)
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
      setHasLoaded(true)
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setIsLoading(false)
    }
  }, [hasLoaded])

  // Load on open
  React.useEffect(() => {
    if (isOpen && !hasLoaded) {
      loadCategories()
    }
  }, [isOpen, hasLoaded, loadCategories])

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search on open
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const selectedCategory = categories.find((c) => c.id === value)

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (categoryId: string) => {
    onChange(categoryId)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 text-sm transition-colors",
          "hover:bg-accent",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          error ? "border-destructive" : "border-input",
          isOpen && "ring-2 ring-ring"
        )}
      >
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          {selectedCategory ? (
            <span>{selectedCategory.name}</span>
          ) : (
            <span className="text-muted-foreground">Select a category</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-border bg-background shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search */}
            <div className="p-2 border-b border-border/50">
              <Input
                ref={inputRef}
                icon={<Search className="h-4 w-4" />}
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto p-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {search ? "No categories found" : "No categories available"}
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = category.id === value
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelect(category.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        "hover:bg-accent",
                        isSelected && "bg-primary/10 text-primary"
                      )}
                    >
                      {category.icon ? (
                        <img
                          src={category.icon}
                          alt=""
                          className="h-5 w-5 rounded object-cover"
                        />
                      ) : (
                        <Folder className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="flex-1 text-left">{category.name}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
