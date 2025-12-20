"use client"

import { useState } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatPrice,
  formatDate,
  EGG_PACKAGING_LABELS,
  EGG_TYPE_LABELS,
  EGG_SIZE_LABELS,
  formatDaysUntilExpiry,
} from "@/lib/types"
import type { EggPackaging, EggType, EggSize } from "@/lib/types"
import { useEgg } from "@/lib/hooks"
import { FreshnessBadge, FreshnessProgress } from "./freshness-badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EggDetailModalProps {
  eggId: string | null
  isOpen: boolean
  onClose: () => void
}

export function EggDetailModal({ eggId, isOpen, onClose }: EggDetailModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const { data: egg, isLoading, error } = useEgg(eggId)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const nextMedia = () => {
    if (egg?.media && currentMediaIndex < egg.media.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1)
    }
  }

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1)
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-background rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error || !egg ? (
              <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <EggIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Egg not found</h3>
                <p className="text-muted-foreground">
                  This egg might have been removed or is no longer available.
                </p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row max-h-[90vh]">
                {/* Media Section */}
                <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-black flex-shrink-0">
                  {egg.media && egg.media.length > 0 ? (
                    <>
                      {egg.media[currentMediaIndex].media_type === "video" ? (
                        <video
                          src={egg.media[currentMediaIndex].url}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay
                          muted
                        />
                      ) : (
                        <Image
                          src={egg.media[currentMediaIndex].url}
                          alt={egg.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}

                      {/* Media Navigation */}
                      {egg.media.length > 1 && (
                        <>
                          <button
                            onClick={prevMedia}
                            disabled={currentMediaIndex === 0}
                            className={cn(
                              "absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white transition-all",
                              currentMediaIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-black/70"
                            )}
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={nextMedia}
                            disabled={currentMediaIndex === egg.media.length - 1}
                            className={cn(
                              "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white transition-all",
                              currentMediaIndex === egg.media.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-black/70"
                            )}
                          >
                            <ChevronRight size={24} />
                          </button>

                          {/* Thumbnail Strip */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
                            {egg.media.map((media, index) => (
                              <button
                                key={media.id}
                                onClick={() => setCurrentMediaIndex(index)}
                                className={cn(
                                  "relative w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                                  index === currentMediaIndex
                                    ? "border-primary"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                )}
                              >
                                {media.media_type === "video" ? (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Play size={16} className="text-white" />
                                  </div>
                                ) : (
                                  <Image
                                    src={media.url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <EggIcon className="w-24 h-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                  {/* Category Badge and Freshness */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {egg.category?.name || egg.category_name}
                    </span>
                    <FreshnessBadge
                      status={egg.freshness_status}
                      daysUntilExpiry={egg.days_until_expiry}
                      showDays
                    />
                    {egg.is_featured && (
                      <span className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title and Price */}
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {egg.name}
                  </h1>
                  <p className="text-muted-foreground text-lg mb-4">{egg.breed}</p>

                  <div className="text-3xl font-bold text-primary mb-6">
                    {formatPrice(egg.price, egg.currency)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      per {EGG_PACKAGING_LABELS[egg.packaging as EggPackaging].toLowerCase()}
                    </span>
                  </div>

                  {/* Freshness Progress */}
                  <div className="mb-6">
                    <FreshnessProgress
                      percentage={egg.freshness_percentage}
                      status={egg.freshness_status}
                    />
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Packaging</p>
                        <p className="font-medium">{EGG_PACKAGING_LABELS[egg.packaging as EggPackaging]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <EggIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Eggs per Unit</p>
                        <p className="font-medium">{egg.eggs_per_unit} eggs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Tag className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium">{EGG_TYPE_LABELS[egg.egg_type as EggType]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <EggIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Size</p>
                        <p className="font-medium">{EGG_SIZE_LABELS[egg.size as EggSize]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium">{egg.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Package className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p className="font-medium">{egg.quantity_available} units available</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {egg.production_date && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Production Date</p>
                          <p className="font-medium">{formatDate(egg.production_date)}</p>
                        </div>
                      </div>
                    )}

                    {egg.expiry_date && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Expiry Date</p>
                          <p className="font-medium">{formatDate(egg.expiry_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {egg.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {egg.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {egg.tags && egg.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {egg.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-3 py-1 bg-muted text-sm rounded-full"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Button */}
                  <Button className="w-full" size="lg">
                    Contact for Purchase
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
