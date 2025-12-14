"use client"

import { useState } from "react"
import {
  LivestockHero,
  FloatingFilterBar,
  ImmersiveGallery,
  AISearchModal,
} from "@/components/livestock"

export function LivestockPageClient() {
  const [isAISearchOpen, setIsAISearchOpen] = useState(false)

  return (
    <>
      {/* Hero with search and category pills */}
      <LivestockHero onAISearchClick={() => setIsAISearchOpen(true)} />

      {/* Floating filter bar - appears on scroll */}
      <FloatingFilterBar onAISearchClick={() => setIsAISearchOpen(true)} />

      {/* Full-bleed masonry gallery */}
      <ImmersiveGallery />

      {/* AI Search Modal */}
      <AISearchModal
        isOpen={isAISearchOpen}
        onClose={() => setIsAISearchOpen(false)}
      />
    </>
  )
}
