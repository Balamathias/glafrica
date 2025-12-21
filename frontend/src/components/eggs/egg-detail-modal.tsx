"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Package,
  Tag,
  Clock,
  Egg as EggIcon,
  Play,
  Share2,
  Heart,
  ShoppingCart,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatPrice,
  formatDate,
  EGG_PACKAGING_LABELS,
  EGG_TYPE_LABELS,
  EGG_SIZE_LABELS,
} from "@/lib/types"
import type { EggPackaging, EggType, EggSize } from "@/lib/types"
import { useEgg } from "@/lib/hooks"
import { FreshnessBadge, FreshnessProgress } from "./freshness-badge"
import { Button } from "@/components/ui/button"

interface EggDetailModalProps {
  eggId: string | null
  isOpen: boolean
  onClose: () => void
}

export function EggDetailModal({ eggId, isOpen, onClose }: EggDetailModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const { data: egg, isLoading, error } = useEgg(eggId)

  // Reset state when modal opens with new egg
  useEffect(() => {
    if (isOpen) {
      setCurrentMediaIndex(0)
      setImageLoaded(false)
    }
  }, [isOpen, eggId])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !egg?.media?.length) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentMediaIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === "ArrowRight") {
        setCurrentMediaIndex((prev) =>
          Math.min((egg.media?.length || 1) - 1, prev + 1)
        )
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, egg?.media?.length, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const nextMedia = () => {
    if (egg?.media && currentMediaIndex < egg.media.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1)
      setImageLoaded(false)
    }
  }

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1)
      setImageLoaded(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && egg) {
      try {
        await navigator.share({
          title: egg.name,
          text: `Check out these premium eggs: ${egg.name}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="relative w-full max-w-6xl max-h-[95vh] bg-background/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all hover:scale-105"
            >
              <X size={20} />
            </button>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <EggIcon className="absolute inset-0 m-auto w-6 h-6 text-amber-500" />
                </div>
                <p className="text-muted-foreground">Loading egg details...</p>
              </div>
            ) : error || !egg ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Egg not found</h3>
                <p className="text-muted-foreground max-w-sm">
                  This egg might have been removed or is no longer available.
                </p>
                <Button onClick={onClose} variant="outline" className="mt-6">
                  Close
                </Button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row max-h-[95vh]">
                {/* Media Section */}
                <div className="relative w-full lg:w-3/5 bg-gradient-to-br from-black via-neutral-900 to-black">
                  {/* Media Display */}
                  <div className="relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] lg:min-h-[600px]">
                    {egg.media && egg.media.length > 0 ? (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentMediaIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                          >
                            {egg.media[currentMediaIndex].media_type === "video" ? (
                              <video
                                src={egg.media[currentMediaIndex].url}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                                muted
                              />
                            ) : (
                              <>
                                {/* Loading shimmer */}
                                {!imageLoaded && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse" />
                                )}
                                <Image
                                  src={egg.media[currentMediaIndex].url}
                                  alt={egg.name}
                                  fill
                                  className={cn(
                                    "object-contain transition-opacity duration-300",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                  )}
                                  sizes="(max-width: 1024px) 100vw, 60vw"
                                  onLoad={() => setImageLoaded(true)}
                                  priority
                                />
                              </>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        {/* Media Navigation Arrows */}
                        {egg.media.length > 1 && (
                          <>
                            <button
                              onClick={prevMedia}
                              disabled={currentMediaIndex === 0}
                              className={cn(
                                "absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-sm text-white transition-all z-10",
                                currentMediaIndex === 0
                                  ? "opacity-30 cursor-not-allowed"
                                  : "hover:bg-black/80 hover:scale-110"
                              )}
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button
                              onClick={nextMedia}
                              disabled={currentMediaIndex === egg.media.length - 1}
                              className={cn(
                                "absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-sm text-white transition-all z-10",
                                currentMediaIndex === egg.media.length - 1
                                  ? "opacity-30 cursor-not-allowed"
                                  : "hover:bg-black/80 hover:scale-110"
                              )}
                            >
                              <ChevronRight size={24} />
                            </button>
                          </>
                        )}

                        {/* Thumbnail Strip */}
                        {egg.media.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-md z-10">
                            {egg.media.map((media, index) => (
                              <button
                                key={media.id}
                                onClick={() => {
                                  setCurrentMediaIndex(index)
                                  setImageLoaded(false)
                                }}
                                className={cn(
                                  "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all",
                                  index === currentMediaIndex
                                    ? "border-amber-500 scale-105"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                )}
                              >
                                {media.media_type === "video" ? (
                                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                    <Play size={18} className="text-white" />
                                  </div>
                                ) : (
                                  <Image
                                    src={media.url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Media Counter */}
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm z-10">
                          {currentMediaIndex + 1} / {egg.media.length}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-orange-900/10">
                        <div className="text-center">
                          <EggIcon className="w-24 h-24 text-amber-500/30 mx-auto mb-4" />
                          <p className="text-muted-foreground">No images available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute top-4 right-16 flex items-center gap-2 z-20">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={cn(
                        "p-2.5 rounded-full backdrop-blur-sm transition-all hover:scale-110",
                        isLiked
                          ? "bg-red-500 text-white"
                          : "bg-black/50 text-white hover:bg-black/70"
                      )}
                    >
                      <Heart size={18} className={cn(isLiked && "fill-current")} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all hover:scale-110"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 lg:w-2/5 overflow-y-auto max-h-[50vh] lg:max-h-[95vh]">
                  <div className="p-6 lg:p-8 space-y-6">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30">
                        {egg.category?.name || egg.category_name}
                      </span>
                      <FreshnessBadge
                        status={egg.freshness_status}
                        daysUntilExpiry={egg.days_until_expiry}
                        showDays
                      />
                      {egg.is_featured && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full">
                          <Sparkles size={14} />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Title and Price */}
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 font-serif">
                        {egg.name}
                      </h1>
                      <p className="text-muted-foreground text-lg">{egg.breed}</p>
                    </div>

                    {/* Price Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                            {formatPrice(egg.price, egg.currency)}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            per {EGG_PACKAGING_LABELS[egg.packaging as EggPackaging]?.toLowerCase()}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Stock</p>
                          <p className="font-semibold text-foreground">{egg.quantity_available} units</p>
                        </div>
                      </div>
                    </div>

                    {/* Freshness Progress */}
                    {egg.freshness_status !== "unknown" && (
                      <div className="p-4 rounded-2xl bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Freshness Level</span>
                          <span className="text-sm text-muted-foreground">
                            {egg.freshness_percentage}% fresh
                          </span>
                        </div>
                        <FreshnessProgress
                          percentage={egg.freshness_percentage}
                          status={egg.freshness_status}
                        />
                      </div>
                    )}

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <SpecCard
                        icon={<Package className="w-5 h-5" />}
                        label="Packaging"
                        value={EGG_PACKAGING_LABELS[egg.packaging as EggPackaging]}
                      />
                      <SpecCard
                        icon={<EggIcon className="w-5 h-5" />}
                        label="Per Unit"
                        value={`${egg.eggs_per_unit} eggs`}
                      />
                      <SpecCard
                        icon={<Tag className="w-5 h-5" />}
                        label="Type"
                        value={EGG_TYPE_LABELS[egg.egg_type as EggType]}
                      />
                      <SpecCard
                        icon={<EggIcon className="w-5 h-5" />}
                        label="Size"
                        value={EGG_SIZE_LABELS[egg.size as EggSize]}
                      />
                      <SpecCard
                        icon={<MapPin className="w-5 h-5" />}
                        label="Location"
                        value={egg.location}
                        className="col-span-2"
                      />
                    </div>

                    {/* Dates */}
                    {(egg.production_date || egg.expiry_date) && (
                      <div className="grid grid-cols-2 gap-3">
                        {egg.production_date && (
                          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                              <Calendar size={16} />
                              <span className="text-xs font-medium">Produced</span>
                            </div>
                            <p className="font-semibold">{formatDate(egg.production_date)}</p>
                          </div>
                        )}
                        {egg.expiry_date && (
                          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                              <Clock size={16} />
                              <span className="text-xs font-medium">Best Before</span>
                            </div>
                            <p className="font-semibold">{formatDate(egg.expiry_date)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {egg.description && (
                      <div>
                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                          Description
                        </h3>
                        <p className="text-foreground/80 leading-relaxed">
                          {egg.description}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {egg.tags && egg.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {egg.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-3 py-1 bg-muted text-sm rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                      <Button
                        className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl"
                        size="lg"
                      >
                        <ShoppingCart size={18} className="mr-2" />
                        Contact for Purchase
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-2"
                        size="lg"
                        onClick={() => setIsLiked(!isLiked)}
                      >
                        <Heart
                          size={18}
                          className={cn("mr-2", isLiked && "fill-red-500 text-red-500")}
                        />
                        {isLiked ? "Saved" : "Save"}
                      </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-500" />
                        <span>Verified Quality</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-500" />
                        <span>Farm Fresh</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-500" />
                        <span>Local Source</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Specification Card Component
function SpecCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors",
        className
      )}
    >
      <div className="text-amber-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  )
}
