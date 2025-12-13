"use client"

import { useEffect, useMemo } from "react"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { useInView } from "react-intersection-observer"
import { GalleryCard } from "./gallery-card"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useLivestockInfinite } from "@/lib/hooks"
import { useFilterStore } from "@/lib/store"
import { SkeletonGalleryCard } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function InfiniteGallery() {
  const { filters } = useFilterStore()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useLivestockInfinite(filters)

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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}
        >
          <Masonry gutter="16px">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonGalleryCard key={i} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
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
          <h3 className="text-lg font-semibold mb-2">Failed to load livestock</h3>
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
          <div className="text-6xl mb-4">🐄</div>
          <h3 className="text-lg font-semibold mb-2">No livestock found</h3>
          <p className="text-muted-foreground">
            No animals match your current filters. Try adjusting your search criteria.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{items.length}</span>{" "}
          {data?.pages[0]?.count && (
            <>of <span className="font-medium text-foreground">{data.pages[0].count}</span></>
          )}{" "}
          listings
        </p>
      </div>

      {/* Masonry Grid */}
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}
      >
        <Masonry gutter="16px">
          {items.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              priority={index < 4} // Prioritize first 4 images
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>

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
              You&apos;ve reached the end of the herd.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {items.length} animals shown
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
