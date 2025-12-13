"use client"

import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUIStore()

  return (
    <main
      className={cn(
        "min-h-screen transition-all duration-300 ease-out pt-16 md:pt-0",
        isSidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
      )}
    >
      {children}
    </main>
  )
}
