"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useInView } from "react-intersection-observer"
import { motion } from "framer-motion"
import { Loader2, RefreshCw, AlertCircle, Egg as EggIcon } from "lucide-react"
import { useEggsInfinite } from "@/lib/hooks"
import { EggCard } from "./egg-card"
import { EggDetailModal } from "./egg-detail-modal"
import { SkeletonGalleryCard } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { EggSearchFilters } from "@/lib/types"

export function EggsImmersiveGallery() {
  const searchParams = useSearchParams()
  const [selectedEggId, setSelectedEggId] = useState<string | null>(null)

  // Build filters from URL params
  const filters: EggSearchFilters = useMemo(() => ({
    category: searchParams.get("category") || undefined,
    egg_type: (searchParams.get("egg_type") as EggSearchFilters["egg_type"]) || undefined,
    size: (searchParams.get("size") as EggSearchFilters["size"]) || undefined,
    packaging: (searchParams.get("packaging") as EggSearchFilters["packaging"]) || undefined,
    freshness: (searchParams.get("freshness") as EggSearchFilters["freshness"]) || undefined,
    search: searchParams.get("search") || undefined,
    ordering: searchParams.get("sort") || "-created_at",
  }), [searchParams])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useEggsInfinite(filters)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  })

  // Flatten all pages into a single array
  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.results) ?? []
  }, [data])

  const totalCount = data?.pages[0]?.count || 0

  // Fetch next page when sentinel is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleQuickView = (id: string) => {
    setSelectedEggId(id)
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <SkeletonGalleryCard index={i} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load eggs</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-4">
            <EggIcon className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="font-serif text-2xl font-semibold mb-2">
            No eggs found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms to find what you&apos;re
            looking for.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{items.length}</span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            egg products
          </p>
        </motion.div>

        {/* CSS Columns Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="mb-4 break-inside-avoid"
            >
              <EggCard
                item={item}
                priority={index < 4}
                onQuickView={handleQuickView}
              />
            </motion.div>
          ))}
        </div>

        {/* Loading Sentinel / End Message */}
        <div ref={ref} className="h-24 flex items-center justify-center w-full mt-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin text-amber-500" size={24} />
              <span>Loading more eggs...</span>
            </div>
          )}
          {!hasNextPage && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3">
                <EggIcon className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-muted-foreground text-sm">
                You&apos;ve seen all {totalCount} egg products
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <EggDetailModal
        eggId={selectedEggId}
        isOpen={!!selectedEggId}
        onClose={() => setSelectedEggId(null)}
      />
    </>
  )
}
