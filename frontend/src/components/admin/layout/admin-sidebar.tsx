"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  PawPrint,
  Image as ImageIcon,
  Folder,
  Tags,
  BarChart3,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminUIStore, useAuthStore } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: number | "dynamic"
  requiredRole?: "superadmin"
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    id: "livestock",
    label: "Livestock",
    icon: PawPrint,
    href: "/admin/livestock",
    badge: "dynamic",
  },
  { id: "media", label: "Media Library", icon: ImageIcon, href: "/admin/media" },
  { id: "categories", label: "Categories", icon: Folder, href: "/admin/categories" },
  { id: "tags", label: "Tags", icon: Tags, href: "/admin/tags" },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare, href: "/admin/inquiries", badge: "dynamic" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users", requiredRole: "superadmin" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { isSidebarExpanded, toggleSidebar } = useAdminUIStore()
  const { user, clearAuth } = useAuthStore()

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    clearAuth()
    window.location.href = "/admin/login"
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
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen",
          "bg-background/95 backdrop-blur-xl border-r border-border/50",
          "flex flex-col",
          "shadow-lg"
        )}
        initial={false}
        animate={{
          width: isSidebarExpanded ? 260 : 72,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-border/50 px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logo/logo.svg"
              alt="Green Livestock Africa"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <AnimatePresence mode="wait">
              {isSidebarExpanded && (
                <motion.span
                  className="font-playfair text-lg font-semibold whitespace-nowrap overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Admin
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                          "transition-all duration-200",
                          "hover:bg-accent/80",
                          active && "bg-primary/10 text-primary",
                          !isSidebarExpanded && "justify-center"
                        )}
                      >
                        {/* Active indicator */}
                        {active && (
                          <motion.div
                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}

                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            "transition-colors duration-200",
                            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />

                        <AnimatePresence mode="wait">
                          {isSidebarExpanded && (
                            <motion.div
                              className="flex flex-1 items-center justify-between overflow-hidden"
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span
                                className={cn(
                                  "text-sm font-medium whitespace-nowrap",
                                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}
                              >
                                {item.label}
                              </span>

                              {/* Badge */}
                              {item.badge && (
                                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium text-primary">
                                  {item.badge === "dynamic" ? "•" : item.badge}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Link>
                    </TooltipTrigger>
                    {!isSidebarExpanded && (
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border/50 p-3 space-y-2">
          {/* Toggle Sidebar Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className={cn(
                  "w-full gap-3",
                  isSidebarExpanded ? "justify-start" : "justify-center px-0"
                )}
              >
                {isSidebarExpanded ? (
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                ) : (
                  <PanelLeft className="h-4 w-4 shrink-0" />
                )}
                <AnimatePresence mode="wait">
                  {isSidebarExpanded && (
                    <motion.span
                      className="text-sm whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Collapse
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {!isSidebarExpanded && (
              <TooltipContent side="right">Expand Sidebar</TooltipContent>
            )}
          </Tooltip>

          {/* Logout Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
                  isSidebarExpanded ? "justify-start" : "justify-center px-0"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <AnimatePresence mode="wait">
                  {isSidebarExpanded && (
                    <motion.span
                      className="text-sm whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            {!isSidebarExpanded && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
