"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Search,
  Settings,
  Menu,
  X,
  LayoutGrid,
  Info,
  Sun,
  Moon,
  ChevronLeft,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useUIStore, useChatStore } from "@/lib/store"

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  description?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <Home size={20} />, href: "/", description: "Discover livestock" },
  { label: "Browse", icon: <LayoutGrid size={20} />, href: "/browse", description: "View all listings" },
  { label: "Search", icon: <Search size={20} />, href: "/search", description: "Find specific animals" },
  { label: "About", icon: <Info size={20} />, href: "/about", description: "Learn about us" },
]

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar, setMobileMenuOpen, isMobileMenuOpen } = useUIStore()
  const { openChat } = useChatStore()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, setMobileMenuOpen])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 md:hidden glass rounded-xl shadow-premium"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-[100dvh] glass-strong hidden md:flex flex-col transition-all duration-300 ease-out",
          isSidebarCollapsed ? "w-[72px]" : "w-64"
        )}
        initial={false}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo/logomark.png"
                    alt="GLAfrica"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-serif font-bold text-lg tracking-tight text-gradient-primary">
                  GLAfrica
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isSidebarCollapsed && (
            <div className="relative w-8 h-8 mx-auto">
              <Image
                src="/logo/logomark.png"
                alt="GLAfrica"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("shrink-0", isSidebarCollapsed && "mx-auto")}>
                  {item.icon}
                </span>

                <AnimatePresence mode="wait">
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col min-w-0"
                    >
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground/70 truncate">
                          {item.description}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed mode */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-premium z-50 border">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}

          {/* AI Assistant Quick Access */}
          <button
            onClick={openChat}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative mt-4",
              "bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20",
              "text-foreground border border-primary/20"
            )}
          >
            <span className={cn("shrink-0", isSidebarCollapsed && "mx-auto")}>
              <Sparkles size={20} className="text-primary" />
            </span>

            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col min-w-0 text-left"
                >
                  <span className="font-medium text-sm">AI Assistant</span>
                  <span className="text-xs text-muted-foreground/70">Ask anything</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-premium z-50 border">
                AI Assistant
              </div>
            )}
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border/50 space-y-1">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group relative"
              )}
            >
              <span className={cn("shrink-0", isSidebarCollapsed && "mx-auto")}>
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </span>
              {!isSidebarCollapsed && (
                <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              )}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-premium z-50 border">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </div>
              )}
            </button>
          )}

          {/* Settings */}
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group relative"
            )}
          >
            <span className={cn("shrink-0", isSidebarCollapsed && "mx-auto")}>
              <Settings size={20} />
            </span>
            {!isSidebarCollapsed && <span className="text-sm">Settings</span>}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-premium z-50 border">
                Settings
              </div>
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            <span className={cn("shrink-0 transition-transform", isSidebarCollapsed ? "mx-auto rotate-180" : "")}>
              <ChevronLeft size={20} />
            </span>
            {!isSidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <motion.aside
        className="fixed top-0 left-0 z-50 h-full w-[85%] max-w-xs bg-background border-r md:hidden"
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo/logomark.png"
                  alt="GLAfrica"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif font-bold text-xl text-gradient-primary">
                GLAfrica
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs opacity-70">{item.description}</div>
                    )}
                  </div>
                </Link>
              )
            })}

            {/* AI Assistant Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                openChat()
              }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground border border-primary/20 mt-4"
            >
              <Sparkles size={20} className="text-primary" />
              <div className="text-left">
                <div className="font-medium">AI Assistant</div>
                <div className="text-xs text-muted-foreground">Ask anything about livestock</div>
              </div>
            </button>
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t space-y-2">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            )}
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
