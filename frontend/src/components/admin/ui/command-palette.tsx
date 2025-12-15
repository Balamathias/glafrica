"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  LayoutDashboard,
  PawPrint,
  Image,
  Folder,
  Tags,
  BarChart3,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  X,
  Command,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAdminUIStore } from "@/lib/admin-store"
import { adminLivestockApi, type AdminLivestock } from "@/lib/admin-api"

// Navigation items for quick access
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin", keywords: ["home", "overview"] },
  { id: "livestock", label: "All Livestock", icon: PawPrint, href: "/admin/livestock", keywords: ["animals", "items"] },
  { id: "media", label: "Media Library", icon: Image, href: "/admin/media", keywords: ["images", "videos", "files"] },
  { id: "categories", label: "Categories", icon: Folder, href: "/admin/categories", keywords: ["organize", "groups"] },
  { id: "tags", label: "Tags", icon: Tags, href: "/admin/tags", keywords: ["labels", "filter"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics", keywords: ["reports", "stats", "metrics"] },
  { id: "users", label: "Users", icon: Users, href: "/admin/users", keywords: ["admin", "accounts"] },
]

// Quick actions
const QUICK_ACTIONS = [
  { id: "add-livestock", label: "Add New Livestock", icon: Plus, action: "openCreateLivestockModal", keywords: ["create", "new animal"] },
  { id: "add-category", label: "Add New Category", icon: Plus, action: "openCreateCategoryModal", keywords: ["create", "new group"] },
  { id: "add-tag", label: "Add New Tag", icon: Plus, action: "openCreateTagModal", keywords: ["create", "new label"] },
]

export function CommandPalette() {
  const router = useRouter()
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    openCreateLivestockModal,
    openCreateCategoryModal,
    openCreateTagModal,
  } = useAdminUIStore()

  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [livestockResults, setLivestockResults] = useState<AdminLivestock[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Reset state when palette opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("")
      setSelectedIndex(0)
      setLivestockResults([])
    }
  }, [isCommandPaletteOpen])

  // Search livestock when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setLivestockResults([])
      return
    }

    const searchLivestock = async () => {
      setIsSearching(true)
      try {
        const result = await adminLivestockApi.getList(1, { search: query })
        setLivestockResults(result.results.slice(0, 5))
      } catch (error) {
        console.error("Search failed:", error)
        setLivestockResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchLivestock, 300)
    return () => clearTimeout(debounce)
  }, [query])

  // Filter navigation items
  const filteredNavItems = useMemo(() => {
    if (!query) return NAV_ITEMS
    const lowerQuery = query.toLowerCase()
    return NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    )
  }, [query])

  // Filter quick actions
  const filteredActions = useMemo(() => {
    if (!query) return QUICK_ACTIONS
    const lowerQuery = query.toLowerCase()
    return QUICK_ACTIONS.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    )
  }, [query])

  // All results for keyboard navigation
  const allResults = useMemo(() => {
    const results: Array<{ type: string; item: typeof NAV_ITEMS[0] | typeof QUICK_ACTIONS[0] | AdminLivestock }> = []

    filteredNavItems.forEach((item) => results.push({ type: "nav", item }))
    filteredActions.forEach((item) => results.push({ type: "action", item }))
    livestockResults.forEach((item) => results.push({ type: "livestock", item }))

    return results
  }, [filteredNavItems, filteredActions, livestockResults])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % Math.max(allResults.length, 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + allResults.length) % Math.max(allResults.length, 1))
          break
        case "Enter":
          e.preventDefault()
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          closeCommandPalette()
          break
      }
    },
    [isCommandPaletteOpen, allResults, selectedIndex, closeCommandPalette]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Handle selection
  const handleSelect = (result: typeof allResults[0]) => {
    closeCommandPalette()

    if (result.type === "nav") {
      const navItem = result.item as typeof NAV_ITEMS[0]
      router.push(navItem.href)
    } else if (result.type === "action") {
      const actionItem = result.item as typeof QUICK_ACTIONS[0]
      switch (actionItem.action) {
        case "openCreateLivestockModal":
          openCreateLivestockModal()
          break
        case "openCreateCategoryModal":
          openCreateCategoryModal()
          break
        case "openCreateTagModal":
          openCreateTagModal()
          break
      }
    } else if (result.type === "livestock") {
      const livestock = result.item as AdminLivestock
      router.push(`/admin/livestock?view=${livestock.id}`)
    }
  }

  // Handle Cmd/Ctrl + K to open
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        useAdminUIStore.getState().toggleCommandPalette()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCommandPalette}
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border/50">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Search for pages, actions, or livestock..."
                  className="flex-1 h-14 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {/* Navigation Results */}
                {filteredNavItems.length > 0 && (
                  <div className="px-2">
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pages
                    </p>
                    {filteredNavItems.map((item, index) => {
                      const Icon = item.icon
                      const isSelected = selectedIndex === index

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect({ type: "nav", item })}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Quick Actions */}
                {filteredActions.length > 0 && (
                  <div className="px-2 mt-2">
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quick Actions
                    </p>
                    {filteredActions.map((item, index) => {
                      const Icon = item.icon
                      const actualIndex = filteredNavItems.length + index
                      const isSelected = selectedIndex === actualIndex

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect({ type: "action", item })}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          <kbd className="hidden sm:flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                            Enter
                          </kbd>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Livestock Search Results */}
                {query && query.length >= 2 && (
                  <div className="px-2 mt-2">
                    <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Livestock
                      {isSearching && (
                        <Loader2 className="inline-block ml-2 h-3 w-3 animate-spin" />
                      )}
                    </p>
                    {livestockResults.length > 0 ? (
                      livestockResults.map((livestock, index) => {
                        const actualIndex = filteredNavItems.length + filteredActions.length + index
                        const isSelected = selectedIndex === actualIndex

                        return (
                          <button
                            key={livestock.id}
                            onClick={() => handleSelect({ type: "livestock", item: livestock })}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                              isSelected
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            {livestock.featured_image ? (
                              <img
                                src={livestock.featured_image.file_url}
                                alt={livestock.name}
                                className="h-8 w-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                <PawPrint className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{livestock.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {livestock.category_name} &bull; {livestock.breed}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </button>
                        )
                      })
                    ) : !isSearching ? (
                      <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                        No livestock found for &quot;{query}&quot;
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Empty State */}
                {!query && allResults.length === 0 && (
                  <div className="py-8 text-center">
                    <Command className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Start typing to search...
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/30">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-background">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-background">
                      ↓
                    </kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-background">
                      Enter
                    </kbd>
                    to select
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {allResults.length} result{allResults.length !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
