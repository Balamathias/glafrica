"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  PawPrint,
  Image,
  Folder,
  Tags,
  BarChart3,
  Users,
  Settings,
  X,
  LogOut,
  ChevronRight,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminUIStore, useAuthStore } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  requiredRole?: "superadmin"
  children?: { label: string; href: string }[]
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    id: "livestock",
    label: "Livestock",
    icon: PawPrint,
    href: "/admin/livestock",
    children: [
      { label: "All Livestock", href: "/admin/livestock" },
      { label: "Add New", href: "/admin/livestock/create" },
      { label: "Sold Items", href: "/admin/livestock?status=sold" },
    ],
  },
  { id: "media", label: "Media Library", icon: Image, href: "/admin/media" },
  { id: "categories", label: "Categories", icon: Folder, href: "/admin/categories" },
  { id: "tags", label: "Tags", icon: Tags, href: "/admin/tags" },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare, href: "/admin/inquiries" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users", requiredRole: "superadmin" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
]

export function MobileAdminDrawer() {
  const pathname = usePathname()
  const { isMobileDrawerOpen, closeMobileDrawer } = useAdminUIStore()
  const { user, clearAuth } = useAuthStore()
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    clearAuth()
    closeMobileDrawer()
    window.location.href = "/admin/login"
  }

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      setExpandedItem(expandedItem === item.id ? null : item.id)
    } else {
      closeMobileDrawer()
    }
  }

  // Filter items based on user role
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRole) return true
    if (item.requiredRole === "superadmin") {
      return user?.is_superuser || user?.role === "superadmin"
    }
    return true
  })

  return (
    <AnimatePresence>
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileDrawer}
          />

          {/* Drawer */}
          <motion.div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-full max-w-xs md:hidden",
              "glass-strong border-r border-border/30",
              "flex flex-col"
            )}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
              <Link href="/admin" className="flex items-center gap-3" onClick={closeMobileDrawer}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-xl font-bold text-primary">G</span>
                </div>
                <span className="font-playfair text-lg font-semibold">Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileDrawer}
                className="h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="border-b border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {user.first_name?.[0] || user.username[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  const hasChildren = item.children && item.children.length > 0
                  const isItemExpanded = expandedItem === item.id

                  return (
                    <li key={item.id}>
                      <Link
                        href={hasChildren ? "#" : item.href}
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-4 py-3",
                          "transition-all duration-200",
                          "active:scale-[0.98]",
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent/80"
                        )}
                      >
                        {/* Active indicator */}
                        {active && (
                          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}

                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        />

                        <span
                          className={cn(
                            "flex-1 text-sm font-medium",
                            active ? "text-primary" : "text-foreground"
                          )}
                        >
                          {item.label}
                        </span>

                        {hasChildren && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200",
                              isItemExpanded && "rotate-90"
                            )}
                          />
                        )}
                      </Link>

                      {/* Submenu */}
                      <AnimatePresence>
                        {hasChildren && isItemExpanded && (
                          <motion.ul
                            className="ml-8 mt-1 space-y-1 border-l border-border/50 pl-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {item.children?.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={closeMobileDrawer}
                                  className={cn(
                                    "block py-2 text-sm",
                                    "text-muted-foreground active:text-foreground",
                                    pathname === child.href && "text-primary font-medium"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-border/50 p-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
