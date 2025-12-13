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
  Scale,
  Heart,
  Share2,
  MessageSquare,
  Shield,
  Syringe,
  Play,
  Pause,
  Check,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useModalStore, useChatStore } from "@/lib/store"
import { useLivestock } from "@/lib/hooks"
import { formatPrice, formatDate, GENDER_LABELS } from "@/lib/types"
import type { Media } from "@/lib/types"

export function LivestockDetailModal() {
  const { isDetailModalOpen, selectedLivestockId, closeDetailModal } = useModalStore()
  const { openChat, addMessage } = useChatStore()
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const { data: livestock, isLoading, error } = useLivestock(selectedLivestockId)

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

  const currentMedia = livestock?.media?.[currentMediaIndex]

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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-background rounded-2xl overflow-hidden shadow-premium-lg flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorState onClose={handleClose} />
            ) : livestock ? (
              <>
                {/* Media Section */}
                <div className="relative lg:w-[55%] h-[40vh] lg:h-full bg-black flex-shrink-0">
                  {/* Media Display */}
                  <div className="relative w-full h-full">
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
                          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                            {isVideoPlaying ? (
                              <Pause size={32} className="text-white" />
                            ) : (
                              <Play size={32} className="text-white fill-white" />
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
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No media available</span>
                      </div>
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {livestock.media.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevMedia}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={handleNextMedia}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}

                  {/* Thumbnails */}
                  {livestock.media.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm">
                      {livestock.media.map((media, index) => (
                        <button
                          key={media.id}
                          onClick={() => {
                            setCurrentMediaIndex(index)
                            setIsVideoPlaying(false)
                          }}
                          className={cn(
                            "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                            index === currentMediaIndex
                              ? "border-primary scale-105"
                              : "border-transparent opacity-70 hover:opacity-100"
                          )}
                        >
                          {media.media_type === "video" ? (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Play size={16} className="text-muted-foreground" />
                            </div>
                          ) : (
                            <Image
                              src={media.file}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Media Counter */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
                    {currentMediaIndex + 1} / {livestock.media.length}
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{livestock.category.name}</Badge>
                          {livestock.is_sold && <Badge variant="destructive">Sold</Badge>}
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold font-serif">
                          {livestock.name}
                        </h1>
                        <p className="text-muted-foreground mt-1">{livestock.breed}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsLiked(!isLiked)}
                          className={cn(
                            "p-2.5 rounded-full border transition-colors",
                            isLiked
                              ? "bg-red-500 border-red-500 text-white"
                              : "hover:bg-muted"
                          )}
                        >
                          <Heart size={20} className={cn(isLiked && "fill-current")} />
                        </button>
                        <button
                          onClick={handleShare}
                          className="p-2.5 rounded-full border hover:bg-muted transition-colors"
                        >
                          <Share2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(livestock.price, livestock.currency)}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <StatCard
                        icon={<Calendar size={18} />}
                        label="Age"
                        value={livestock.age}
                      />
                      <StatCard
                        icon={<Scale size={18} />}
                        label="Weight"
                        value={livestock.weight || "Not specified"}
                      />
                      <StatCard
                        icon={<MapPin size={18} />}
                        label="Location"
                        value={livestock.location}
                      />
                      <StatCard
                        icon={<Shield size={18} />}
                        label="Gender"
                        value={GENDER_LABELS[livestock.gender]}
                      />
                    </div>

                    {/* Tags */}
                    {livestock.tags.length > 0 && (
                      <div className="mb-6">
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
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {livestock.description}
                      </p>
                    </div>

                    {/* Health Status */}
                    <div className="mb-6">
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
                      <div className="mb-6">
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

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground">
                      Listed on {formatDate(livestock.created_at)}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 lg:p-6 border-t bg-muted/30 flex gap-3">
                    <Button
                      onClick={handleAskAbout}
                      variant="outline"
                      className="flex-1"
                    >
                      <MessageSquare size={18} className="mr-2" />
                      Ask AI About This
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={livestock.is_sold}
                    >
                      {livestock.is_sold ? "Sold Out" : "Contact Seller"}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="p-3 rounded-xl bg-muted/50 border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="font-semibold text-sm truncate">{value}</div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      <div className="lg:w-[55%] h-[40vh] lg:h-full bg-muted animate-pulse" />
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

function ErrorState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h3 className="text-xl font-semibold mb-2">Couldn&apos;t load details</h3>
      <p className="text-muted-foreground mb-4">
        There was a problem loading the livestock details.
      </p>
      <Button onClick={onClose} variant="outline">
        Close
      </Button>
    </div>
  )
}
