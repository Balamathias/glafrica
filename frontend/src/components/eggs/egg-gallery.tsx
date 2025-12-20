"use client"

import { useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import { EggCard } from "./egg-card"
import { Loader2, RefreshCw, AlertCircle, Egg as EggIcon } from "lucide-react"
import { useEggsInfinite } from "@/lib/hooks"
import { SkeletonGalleryCard } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { EggSearchFilters } from "@/lib/types"
import { EggDetailModal } from "./egg-detail-modal"

interface EggGalleryProps {
  filters?: EggSearchFilters
}

export function EggGallery({ filters }: EggGalleryProps) {
  const [selectedEggId, setSelectedEggId] = useState<string | null>(null)

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
      <div className="p-4 md:p-8">
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
      <div className="p-8 text-center">
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
      <div className="p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <EggIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No eggs found</h3>
          <p className="text-muted-foreground">
            No eggs match your current filters. Try adjusting your search criteria.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 md:p-8">
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{items.length}</span>{" "}
            {data?.pages[0]?.count && (
              <>of <span className="font-medium text-foreground">{data.pages[0].count}</span></>
            )}{" "}
            egg products
          </p>
        </div>

        {/* CSS Columns Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {items.map((item, index) => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              <EggCard
                item={item}
                priority={index < 4}
                onQuickView={handleQuickView}
              />
            </div>
          ))}
        </div>

        {/* Loading Sentinel / End Message */}
        <div ref={ref} className="h-24 flex items-center justify-center w-full mt-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading more...</span>
            </div>
          )}
          {!hasNextPage && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-muted-foreground text-sm">
                You&apos;ve reached the end of our egg collection.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {items.length} products shown
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
