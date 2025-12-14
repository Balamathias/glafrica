"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Scale,
  Shield,
  Syringe,
  Play,
  Pause,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useModalStore, useChatStore } from "@/lib/store"
import { useLivestock } from "@/lib/hooks"
import { formatPrice, formatDate, GENDER_LABELS } from "@/lib/types"

export function FullscreenDetailModal() {
  const { isDetailModalOpen, selectedLivestockId, closeDetailModal } = useModalStore()
  const { openChat, addMessage } = useChatStore()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)

  const { data: livestock, isLoading, error } = useLivestock(selectedLivestockId)

  // Reset state when livestock changes
  useEffect(() => {
    setCurrentMediaIndex(0)
    setIsVideoPlaying(false)
    setIsSheetExpanded(false)
  }, [selectedLivestockId])

  // Keyboard navigation
  useEffect(() => {
    if (!isDetailModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetailModal()
      if (e.key === "ArrowLeft") handlePrevMedia()
      if (e.key === "ArrowRight") handleNextMedia()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDetailModalOpen, livestock])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isDetailModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDetailModalOpen])

  const handleClose = () => {
    closeDetailModal()
    setCurrentMediaIndex(0)
    setIsVideoPlaying(false)
  }

  const handlePrevMedia = useCallback(() => {
    if (livestock?.media) {
      setCurrentMediaIndex((prev) =>
        prev === 0 ? livestock.media.length - 1 : prev - 1
      )
      setIsVideoPlaying(false)
    }
  }, [livestock])

  const handleNextMedia = useCallback(() => {
    if (livestock?.media) {
      setCurrentMediaIndex((prev) =>
        prev === livestock.media.length - 1 ? 0 : prev + 1
      )
      setIsVideoPlaying(false)
    }
  }, [livestock])

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

  // Handle swipe gestures on media
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handlePrevMedia()
    } else if (info.offset.x < -100) {
      handleNextMedia()
    }
  }

  // Safe media access
  const mediaArray = livestock?.media || []
  const safeIndex = currentMediaIndex < mediaArray.length ? currentMediaIndex : 0
  const currentMedia = mediaArray[safeIndex]

  return (
    <AnimatePresence>
      {isDetailModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black"
        >
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState onClose={handleClose} />
          ) : livestock ? (
            <div className="relative h-full flex flex-col">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4">
                <button
                  onClick={handleClose}
                  className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(
                      "p-2.5 rounded-full backdrop-blur-sm transition-all",
                      isLiked
                        ? "bg-red-500 text-white"
                        : "bg-black/50 text-white hover:bg-black/70"
                    )}
                  >
                    <Heart size={20} className={cn(isLiked && "fill-current")} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Media Section - Takes most of the screen */}
              <motion.div
                className="flex-1 relative"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
              >
                {currentMedia?.media_type === "video" ? (
                  <div className="relative w-full h-full">
                    <video
                      key={currentMedia.id}
                      src={currentMedia.file}
                      className="w-full h-full object-contain"
                      loop
                      playsInline
                      autoPlay={isVideoPlaying}
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    />
                    <button
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div
                        className={cn(
                          "p-5 rounded-full bg-white/20 backdrop-blur-sm transition-opacity",
                          isVideoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                        )}
                      >
                        {isVideoPlaying ? (
                          <Pause size={40} className="text-white" />
                        ) : (
                          <Play size={40} className="text-white fill-white" />
                        )}
                      </div>
                    </button>
                  </div>
                ) : currentMedia ? (
                  <Image
                    src={currentMedia.file}
                    alt={livestock.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/50">No media available</span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {mediaArray.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}

                {/* Thumbnails */}
                {mediaArray.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm">
                    {mediaArray.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => {
                          setCurrentMediaIndex(index)
                          setIsVideoPlaying(false)
                        }}
                        className={cn(
                          "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                          index === safeIndex
                            ? "border-primary scale-105"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        {media.media_type === "video" ? (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <Play size={18} className="text-white" />
                          </div>
                        ) : (
                          <Image
                            src={media.file}
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
                <div className="absolute top-20 left-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
                  {safeIndex + 1} / {mediaArray.length}
                </div>
              </motion.div>

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "60%" }}
                animate={{ y: isSheetExpanded ? "0%" : "60%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl h-[85vh] flex flex-col"
              >
                {/* Drag Handle */}
                <button
                  onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                  className="w-full py-3 flex justify-center flex-shrink-0"
                >
                  <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
                </button>

                {/* Sheet Content - Scrollable */}
                <div className="flex-1 px-6 pb-8 overflow-y-auto overscroll-contain">
                  {/* Header - Always Visible */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{livestock.category.name}</Badge>
                        {livestock.is_sold && <Badge variant="destructive">Sold</Badge>}
                      </div>
                      <h2 className="text-2xl font-bold font-serif">{livestock.name}</h2>
                      <p className="text-muted-foreground">{livestock.breed}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(livestock.price, livestock.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats - Always Visible */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <QuickStat icon={<Calendar size={16} />} label="Age" value={livestock.age} />
                    <QuickStat icon={<Scale size={16} />} label="Weight" value={livestock.weight || "N/A"} />
                    <QuickStat icon={<MapPin size={16} />} label="Location" value={livestock.location} />
                    <QuickStat icon={<Shield size={16} />} label="Gender" value={GENDER_LABELS[livestock.gender]} />
                  </div>

                  {/* Action Buttons - Always Visible */}
                  <div className="flex gap-3 mb-4">
                    <Button
                      onClick={handleAskAbout}
                      variant="outline"
                      className="flex-1"
                    >
                      <MessageSquare size={18} className="mr-2" />
                      Ask AI
                    </Button>
                    <Button className="flex-1" disabled={livestock.is_sold}>
                      {livestock.is_sold ? "Sold Out" : "Contact Seller"}
                    </Button>
                  </div>

                  {/* Expand Toggle */}
                  <button
                    onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isSheetExpanded ? (
                      <>
                        <ChevronDown size={16} />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronUp size={16} />
                        View full details
                      </>
                    )}
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isSheetExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t mt-4 space-y-6"
                      >
                        {/* Tags */}
                        {livestock.tags.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {livestock.tags.map((tag) => (
                                <Badge key={tag.id} variant="outline">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Description</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {livestock.description}
                          </p>
                        </div>

                        {/* Health Status */}
                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Shield size={16} className="text-green-500" />
                            Health Status
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {livestock.health_status}
                          </p>
                        </div>

                        {/* Vaccination History */}
                        {livestock.vaccination_history.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Syringe size={16} className="text-blue-500" />
                              Vaccination History
                            </h3>
                            <div className="space-y-2">
                              {livestock.vaccination_history.map((record, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                >
                                  <div className="p-1.5 rounded-full bg-green-500/10">
                                    <Check size={14} className="text-green-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{record.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {record.date}
                                      {record.next_due && ` • Next: ${record.next_due}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Listed Date */}
                        <div className="text-xs text-muted-foreground pt-4 border-t">
                          Listed on {formatDate(livestock.created_at)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="text-center p-2 rounded-xl bg-muted/50">
      <div className="flex justify-center text-muted-foreground mb-1">{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

function ErrorState({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h3 className="text-xl font-semibold text-white mb-2">Couldn&apos;t load details</h3>
      <p className="text-white/60 mb-4">
        There was a problem loading the livestock details.
      </p>
      <Button onClick={onClose} variant="outline">
        Close
      </Button>
    </div>
  )
}
