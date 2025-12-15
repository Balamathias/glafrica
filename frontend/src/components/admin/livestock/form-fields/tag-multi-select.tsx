"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Search, Loader2, Tag, Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { tagsApi, type Tag as TagType } from "@/lib/admin-api"

interface TagMultiSelectProps {
  value?: string[]
  onChange?: (value: string[]) => void
}

export function TagMultiSelect({ value, onChange }: TagMultiSelectProps) {
  const selectedIds = value || []

  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [tags, setTags] = React.useState<TagType[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load tags
  const loadTags = React.useCallback(async () => {
    if (hasLoaded) return

    setIsLoading(true)
    try {
      const data = await tagsApi.getAll()
      setTags(data)
      setHasLoaded(true)
    } catch (error) {
      console.error("Failed to load tags:", error)
    } finally {
      setIsLoading(false)
    }
  }, [hasLoaded])

  // Load on open
  React.useEffect(() => {
    if (isOpen && !hasLoaded) {
      loadTags()
    }
  }, [isOpen, hasLoaded, loadTags])

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

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id))

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  const canCreateNew =
    search.trim() &&
    !tags.some((t) => t.name.toLowerCase() === search.trim().toLowerCase())

  const handleToggle = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange?.(selectedIds.filter((id) => id !== tagId))
    } else {
      onChange?.([...selectedIds, tagId])
    }
  }

  const handleRemove = (tagId: string) => {
    onChange?.(selectedIds.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!search.trim() || isCreating) return

    setIsCreating(true)
    try {
      const newTag = await tagsApi.create(search.trim())
      setTags((prev) => [...prev, newTag])
      onChange?.([...selectedIds, newTag.id])
      setSearch("")
    } catch (error) {
      console.error("Failed to create tag:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {selectedTags.map((tag) => (
              <motion.span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <Tag className="h-3 w-3" />
                {tag.name}
                <button
                  type="button"
                  onClick={() => handleRemove(tag.id)}
                  className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dropdown */}
      <div ref={containerRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm transition-colors",
            "hover:bg-accent",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            isOpen && "ring-2 ring-ring"
          )}
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {selectedIds.length > 0
                ? `${selectedIds.length} tag${selectedIds.length !== 1 ? "s" : ""} selected`
                : "Select or create tags"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown Panel */}
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
                  placeholder="Search or create tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canCreateNew) {
                      e.preventDefault()
                      handleCreateTag()
                    }
                  }}
                  className="h-9"
                />
              </div>

              {/* Create New Tag Option */}
              {canCreateNew && (
                <div className="p-2 border-b border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={isCreating}
                    className="w-full justify-start gap-2 text-primary"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Create &quot;{search.trim()}&quot;
                  </Button>
                </div>
              )}

              {/* Tag List */}
              <div className="max-h-64 overflow-y-auto p-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTags.length === 0 && !canCreateNew ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {search ? "No tags found" : "No tags available"}
                  </div>
                ) : (
                  filteredTags.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggle(tag.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-accent",
                          isSelected && "bg-primary/10 text-primary"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-left">{tag.name}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
