"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  LivestockHero,
  FloatingFilterBar,
  ImmersiveGallery,
  AISearchModal,
} from "@/components/livestock"
import { useModalStore } from "@/lib/store"

export function LivestockPageClient() {
  const [isAISearchOpen, setIsAISearchOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { openDetailModal, isDetailModalOpen } = useModalStore()

  // Handle highlight parameter to auto-open modal
  useEffect(() => {
    const highlightId = searchParams.get("highlight")
    if (highlightId) {
      openDetailModal(highlightId)
    }
  }, [searchParams, openDetailModal])

  // Clear highlight param when modal closes
  useEffect(() => {
    if (!isDetailModalOpen) {
      const highlightId = searchParams.get("highlight")
      if (highlightId) {
        // Remove highlight param from URL without navigation
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete("highlight")
        const newUrl = newParams.toString() ? `/livestock?${newParams.toString()}` : "/livestock"
        router.replace(newUrl, { scroll: false })
      }
    }
  }, [isDetailModalOpen, searchParams, router])

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
