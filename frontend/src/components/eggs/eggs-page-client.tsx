"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { EggsHero } from "./eggs-hero"
import { EggsFloatingFilterBar } from "./eggs-floating-filter-bar"
import { EggsImmersiveGallery } from "./eggs-immersive-gallery"
import { EggDetailModal } from "./egg-detail-modal"

export function EggsPageClient() {
  const [isAISearchOpen, setIsAISearchOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [highlightedEggId, setHighlightedEggId] = useState<string | null>(null)

  // Handle highlight parameter to auto-open modal
  useEffect(() => {
    const highlightId = searchParams.get("highlight")
    if (highlightId) {
      setHighlightedEggId(highlightId)
    }
  }, [searchParams])

  // Clear highlight param when modal closes
  const handleModalClose = () => {
    setHighlightedEggId(null)
    const highlightId = searchParams.get("highlight")
    if (highlightId) {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete("highlight")
      const newUrl = newParams.toString() ? `/eggs?${newParams.toString()}` : "/eggs"
      router.replace(newUrl, { scroll: false })
    }
  }

  return (
    <>
      {/* Hero with search and category pills */}
      <EggsHero onAISearchClick={() => setIsAISearchOpen(true)} />

      {/* Floating filter bar - appears on scroll */}
      <EggsFloatingFilterBar onAISearchClick={() => setIsAISearchOpen(true)} />

      {/* Full-bleed masonry gallery */}
      <EggsImmersiveGallery />

      {/* Highlighted Egg Modal (from URL) */}
      <EggDetailModal
        eggId={highlightedEggId}
        isOpen={!!highlightedEggId}
        onClose={handleModalClose}
      />

      {/* TODO: AI Search Modal for eggs */}
      {/* <AISearchModal
        isOpen={isAISearchOpen}
        onClose={() => setIsAISearchOpen(false)}
      /> */}
    </>
  )
}
