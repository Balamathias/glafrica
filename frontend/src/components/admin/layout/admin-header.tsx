"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Menu, Search, Bell, Plus, ChevronRight, User, PawPrint, Folder, Tag, Sun, Moon, Monitor } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAdminUIStore, useAuthStore } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())

    return { href, label }
  })

  return breadcrumbs
}

export function AdminHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const {
    openMobileDrawer,
    openCommandPalette,
    openCreateLivestockModal,
    openCreateCategoryModal,
    openCreateTagModal,
  } = useAdminUIStore()
  const { user, clearAuth } = useAuthStore()

  const breadcrumbs = generateBreadcrumbs(pathname)

  const handleLogout = () => {
    clearAuth()
    window.location.href = "/admin/login"
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        "h-16 border-b border-border/50",
        "glass",
        "flex items-center justify-between px-4 md:px-6",
        "transition-all duration-300"
      )}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={openMobileDrawer}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <motion.div
              key={crumb.href}
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Mobile Title */}
        <span className="sm:hidden font-medium">
          {breadcrumbs[breadcrumbs.length - 1]?.label || "Admin"}
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Mobile Search */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={openCommandPalette}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
              {theme === "light" && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
              {theme === "dark" && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
              {theme === "system" && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Create */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="hidden sm:flex gap-1">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openCreateLivestockModal}>
              <PawPrint className="mr-2 h-4 w-4" />
              Add Livestock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCreateCategoryModal}>
              <Folder className="mr-2 h-4 w-4" />
              Add Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCreateTagModal}>
              <Tag className="mr-2 h-4 w-4" />
              Add Tag
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Quick Create */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="icon" className="sm:hidden">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openCreateLivestockModal}>
              <PawPrint className="mr-2 h-4 w-4" />
              Add Livestock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCreateCategoryModal}>
              <Folder className="mr-2 h-4 w-4" />
              Add Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openCreateTagModal}>
              <Tag className="mr-2 h-4 w-4" />
              Add Tag
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="hidden lg:block text-sm font-medium">
                {user?.first_name || user?.username || "Admin"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank">View Site</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
