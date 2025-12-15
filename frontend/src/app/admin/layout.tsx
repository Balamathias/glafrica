"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuthStore, useAdminUIStore } from "@/lib/admin-store"
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar"
import { AdminHeader } from "@/components/admin/layout/admin-header"
import { MobileAdminDrawer } from "@/components/admin/layout/mobile-admin-drawer"
import { CommandPalette } from "@/components/admin/ui/command-palette"
import { CreateLivestockModal } from "@/components/admin/livestock"
import { CreateCategoryModal } from "@/components/admin/categories"
import { CreateTagModal } from "@/components/admin/tags"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const {
    isSidebarExpanded,
    isCreateLivestockModalOpen,
    isCreateCategoryModalOpen,
    isCreateTagModalOpen,
    closeCreateLivestockModal,
    closeCreateCategoryModal,
    closeCreateTagModal,
  } = useAdminUIStore()

  // Check authentication (skip for login page, wait for hydration)
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [_hasHydrated, isAuthenticated, pathname, router])

  // Don't render layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show loading while waiting for hydration or checking auth
  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileAdminDrawer />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-h-screen flex-col",
          "transition-all duration-200 ease-out",
          // Adjust margin based on sidebar state
          isSidebarExpanded ? "md:ml-[260px]" : "md:ml-[72px]"
        )}
      >
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-full max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global Quick Create Modals - rendered at root level for proper z-index */}
      <CreateLivestockModal
        open={isCreateLivestockModalOpen}
        onOpenChange={(open) => !open && closeCreateLivestockModal()}
      />
      <CreateCategoryModal
        open={isCreateCategoryModalOpen}
        onOpenChange={(open) => !open && closeCreateCategoryModal()}
      />
      <CreateTagModal
        open={isCreateTagModalOpen}
        onOpenChange={(open) => !open && closeCreateTagModal()}
      />

      {/* Command Palette - Global Search */}
      <CommandPalette />
    </div>
  )
}
