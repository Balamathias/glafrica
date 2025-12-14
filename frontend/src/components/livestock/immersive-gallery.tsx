"use client"

import { useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useInView } from "react-intersection-observer"
import { motion } from "framer-motion"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useLivestockInfinite } from "@/lib/hooks"
import { GalleryCard } from "@/components/gallery/gallery-card"
import { SkeletonGalleryCard } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { SearchFilters } from "@/lib/types"

export function ImmersiveGallery() {
  const searchParams = useSearchParams()

  // Build filters from URL params
  const filters: SearchFilters = useMemo(() => ({
    category: searchParams.get("category") || undefined,
    gender: (searchParams.get("gender") as SearchFilters["gender"]) || undefined,
    search: searchParams.get("search") || undefined,
    ordering: searchParams.get("sort") || "-created_at",
    min_price: searchParams.get("min_price")
      ? parseInt(searchParams.get("min_price")!)
      : undefined,
    max_price: searchParams.get("max_price")
      ? parseInt(searchParams.get("max_price")!)
      : undefined,
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
  } = useLivestockInfinite(filters)

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

  // Loading skeleton - CSS columns masonry
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-serif text-2xl font-semibold mb-2">
            No livestock found
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{items.length}</span>{" "}
          of <span className="font-medium text-foreground">{totalCount}</span> listings
        </p>
      </div>

      {/* CSS Columns Masonry Grid - More reliable than react-responsive-masonry */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="mb-4 break-inside-avoid">
            <GalleryCard
              item={item}
              priority={index < 4}
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
              You&apos;ve seen all {totalCount} listings
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
