"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Scale,
  Heart,
  Share2,
  MessageSquare,
  Shield,
  Syringe,
  Play,
  Pause,
  Check,
  Tag,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  Loader2,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useModalStore, useChatStore } from "@/lib/store"
import { useLivestock } from "@/lib/hooks"
import { formatPrice, formatDate, GENDER_LABELS } from "@/lib/types"
import { trackLivestockView } from "@/lib/analytics"

export function LivestockDetailModal() {
  const { isDetailModalOpen, selectedLivestockId, closeDetailModal } = useModalStore()
  const { openChat, addMessage } = useChatStore()
  const [currentMediaIndex, setCurrentMediaIndex] = React.useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false)
  const [isVideoMuted, setIsVideoMuted] = React.useState(true)
  const [isLiked, setIsLiked] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const mediaContainerRef = React.useRef<HTMLDivElement>(null)

  const { data: livestock, isLoading, error } = useLivestock(selectedLivestockId)

  // Reset state when switching to a different livestock
  React.useEffect(() => {
    setCurrentMediaIndex(0)
    setIsVideoPlaying(false)
    setIsVideoMuted(true)
  }, [selectedLivestockId])

  // Track livestock view when modal opens with data
  React.useEffect(() => {
    if (isDetailModalOpen && livestock?.id) {
      trackLivestockView(livestock.id)
    }
  }, [isDetailModalOpen, livestock?.id])

  // Handle video play state
  React.useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isVideoPlaying])

  // Handle video mute state
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isVideoMuted
    }
  }, [isVideoMuted])

  const handleClose = () => {
    closeDetailModal()
    setCurrentMediaIndex(0)
    setIsVideoPlaying(false)
  }

  const handlePrevMedia = () => {
    if (livestock?.media) {
      setCurrentMediaIndex((prev) =>
        prev === 0 ? livestock.media.length - 1 : prev - 1
      )
      setIsVideoPlaying(false)
    }
  }

  const handleNextMedia = () => {
    if (livestock?.media) {
      setCurrentMediaIndex((prev) =>
        prev === livestock.media.length - 1 ? 0 : prev + 1
      )
      setIsVideoPlaying(false)
    }
  }

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDetailModalOpen) return
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowLeft") handlePrevMedia()
      if (e.key === "ArrowRight") handleNextMedia()
      if (e.key === " " && currentMedia?.media_type === "video") {
        e.preventDefault()
        setIsVideoPlaying((p) => !p)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isDetailModalOpen, livestock?.media?.length])

  // Lock body scroll
  React.useEffect(() => {
    if (isDetailModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDetailModalOpen])

  const handleAskAbout = () => {
    if (livestock) {
      closeDetailModal()
      openChat()
      addMessage("user", `Tell me more about ${livestock.name}. What makes it a good investment?`)
    }
  }

  const handleShare = async () => {
    if (livestock && navigator.share) {
      try {
        await navigator.share({
          title: livestock.name,
          text: `Check out ${livestock.name} on Green Livestock Africa`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  const toggleFullscreen = () => {
    if (!mediaContainerRef.current) return

    if (!document.fullscreenElement) {
      mediaContainerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Safely get current media
  const mediaArray = livestock?.media || []
  const safeIndex = currentMediaIndex < mediaArray.length ? currentMediaIndex : 0
  const currentMedia = mediaArray[safeIndex]

  return (
    <AnimatePresence>
      {isDetailModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "relative flex flex-col",
                "w-full max-w-5xl",
                "max-h-[95vh] md:max-h-[90vh]",
                "bg-background rounded-2xl shadow-premium-lg",
                "border border-border/50",
                "overflow-hidden"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="h-5 w-5" />
              </Button>

              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <ErrorState onClose={handleClose} />
              ) : livestock ? (
                <>
                  {/* Content - Horizontal Layout */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col lg:flex-row">
                      {/* Media Section - Left Side */}
                      <div
                        ref={mediaContainerRef}
                        className="lg:w-1/2 bg-black relative"
                      >
                        {/* Main Media Display */}
                        <div className="relative aspect-square lg:aspect-[4/3]">
                          <AnimatePresence mode="wait">
                            {currentMedia?.media_type === "video" ? (
                              <motion.div
                                key={`video-${currentMedia.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-full h-full"
                              >
                                <video
                                  ref={videoRef}
                                  src={currentMedia.file}
                                  className="w-full h-full object-contain"
                                  loop
                                  playsInline
                                  muted={isVideoMuted}
                                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                />

                                {/* Video Play/Pause Overlay */}
                                <div
                                  className={cn(
                                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                                    isVideoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                                  )}
                                >
                                  <button
                                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                    className="p-5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all transform hover:scale-105"
                                  >
                                    {isVideoPlaying ? (
                                      <Pause size={36} className="text-white" />
                                    ) : (
                                      <Play size={36} className="text-white fill-white ml-1" />
                                    )}
                                  </button>
                                </div>

                                {/* Video Controls Bar */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                                  <button
                                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                                  >
                                    {isVideoMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                  </button>
                                  <button
                                    onClick={toggleFullscreen}
                                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                                  >
                                    <Maximize2 size={18} />
                                  </button>
                                </div>

                                {/* Video Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm backdrop-blur-sm">
                                  <Play size={14} className="fill-current" />
                                  Video
                                </div>
                              </motion.div>
                            ) : currentMedia ? (
                              <motion.div
                                key={`image-${currentMedia.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-full h-full"
                              >
                                <Image
                                  src={currentMedia.file}
                                  alt={livestock.name}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 1024px) 100vw, 50vw"
                                  priority
                                />
                                {/* Image Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm backdrop-blur-sm">
                                  <ImageIcon size={14} />
                                  Photo
                                </div>
                              </motion.div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <div className="text-center text-muted-foreground">
                                  <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                  <span>No media available</span>
                                </div>
                              </div>
                            )}
                          </AnimatePresence>

                          {/* Navigation Arrows */}
                          {mediaArray.length > 1 && (
                            <>
                              <button
                                onClick={handlePrevMedia}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                              >
                                <ChevronLeft size={24} />
                              </button>
                              <button
                                onClick={handleNextMedia}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                              >
                                <ChevronRight size={24} />
                              </button>
                            </>
                          )}

                          {/* Media Counter */}
                          {mediaArray.length > 1 && (
                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm backdrop-blur-sm">
                              {currentMediaIndex + 1} / {mediaArray.length}
                            </div>
                          )}
                        </div>

                        {/* Thumbnails Strip */}
                        {mediaArray.length > 1 && (
                          <div className="flex gap-2 p-4 overflow-x-auto bg-black/50">
                            {mediaArray.map((media, index) => (
                              <button
                                key={media.id}
                                onClick={() => {
                                  setCurrentMediaIndex(index)
                                  setIsVideoPlaying(false)
                                }}
                                className={cn(
                                  "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                  index === safeIndex
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-transparent opacity-70 hover:opacity-100"
                                )}
                              >
                                {media.media_type === "video" ? (
                                  <div className="w-full h-full bg-muted/80 flex items-center justify-center">
                                    <Play size={18} className="text-white fill-white" />
                                  </div>
                                ) : (
                                  <Image
                                    src={media.file}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                )}
                                {media.is_featured && (
                                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Details Section - Right Side */}
                      <div className="lg:w-1/2 px-4 py-6 md:px-6 space-y-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
                        {/* Header */}
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20"
                                >
                                  {livestock.category.name}
                                </Badge>
                                {livestock.is_sold ? (
                                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                    Sold
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Available
                                  </Badge>
                                )}
                              </div>
                              <h2 className="text-2xl font-bold font-serif truncate">
                                {livestock.name}
                              </h2>
                              <p className="text-muted-foreground">{livestock.breed}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={cn(
                                  "p-2.5 rounded-full border-2 transition-all",
                                  isLiked
                                    ? "bg-red-500 border-red-500 text-white scale-110"
                                    : "border-border hover:bg-muted"
                                )}
                              >
                                <Heart size={18} className={cn(isLiked && "fill-current")} />
                              </button>
                              <button
                                onClick={handleShare}
                                className="p-2.5 rounded-full border-2 border-border hover:bg-muted transition-all"
                              >
                                <Share2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                            <span className="text-sm text-muted-foreground">Investment Price</span>
                            <div className="text-3xl font-bold text-primary">
                              {formatPrice(livestock.price, livestock.currency)}
                            </div>
                          </div>
                        </div>

                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <InfoCard
                            icon={<Calendar size={16} />}
                            label="Age"
                            value={livestock.age}
                          />
                          <InfoCard
                            icon={<Scale size={16} />}
                            label="Weight"
                            value={livestock.weight || "N/A"}
                          />
                          <InfoCard
                            icon={<MapPin size={16} />}
                            label="Location"
                            value={livestock.location}
                          />
                          <InfoCard
                            icon={<User size={16} />}
                            label="Gender"
                            value={GENDER_LABELS[livestock.gender]}
                          />
                        </div>

                        {/* Tags */}
                        {livestock.tags.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
                              <Tag size={14} className="text-primary" />
                              Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {livestock.tags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="px-3 py-1"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h3 className="font-medium mb-2 text-sm">Description</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {livestock.description}
                          </p>
                        </div>

                        {/* Health Status */}
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
                            <div className="p-1.5 rounded-full bg-emerald-500/20">
                              <Shield size={12} className="text-emerald-500" />
                            </div>
                            Health Status
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {livestock.health_status}
                          </p>
                        </div>

                        {/* Vaccination History */}
                        {livestock.vaccination_history.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-2 flex items-center gap-2 text-sm">
                              <div className="p-1.5 rounded-full bg-blue-500/20">
                                <Syringe size={12} className="text-blue-500" />
                              </div>
                              Vaccination History
                            </h3>
                            <div className="space-y-2">
                              {livestock.vaccination_history.map((record, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-emerald-500/10">
                                      <Check size={12} className="text-emerald-500" />
                                    </div>
                                    <span className="font-medium text-sm">{record.name}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {record.date}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                          Listed on {formatDate(livestock.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-border/50 bg-muted/30 px-4 py-4 md:px-6">
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAskAbout}
                        variant="outline"
                        className="flex-1"
                      >
                        <MessageSquare size={18} className="mr-2" />
                        Ask AI About This
                      </Button>
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={livestock.is_sold}
                      >
                        {livestock.is_sold ? "Sold Out" : "Contact Seller"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="p-2 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm truncate">{value}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row w-full">
      {/* Media skeleton */}
      <div className="lg:w-1/2 bg-muted animate-pulse aspect-square lg:aspect-[4/3]" />

      {/* Details skeleton */}
      <div className="lg:w-1/2 p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
        </div>

        <div className="h-20 w-full rounded-xl bg-muted animate-pulse" />

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>

        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-20 w-full bg-muted animate-pulse rounded" />
        </div>

        <div className="h-20 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function ErrorState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <X size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Couldn&apos;t load details</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        There was a problem loading the livestock details. Please try again.
      </p>
      <Button onClick={onClose} variant="outline" size="lg">
        Close
      </Button>
    </div>
  )
}
