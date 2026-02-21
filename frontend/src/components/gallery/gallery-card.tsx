"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Play, MapPin, Heart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useModalStore } from "@/lib/store"
import type { LivestockListItem } from "@/lib/types"

interface GalleryCardProps {
  item: LivestockListItem
  priority?: boolean
}

export function GalleryCard({ item, priority = false }: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { openDetailModal } = useModalStore()

  const media = item.featured_image

  // Handle video playback on hover
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current && media?.media_type === "video") {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current && media?.media_type === "video") {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handleQuickView = () => {
    openDetailModal(item.id)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  // Fallback card for items without media - still clickable and shows info
  if (!media) {
    return (
      <motion.article
        whileHover={{ y: -4 }}
        className={cn(
          "group relative rounded-2xl overflow-hidden cursor-pointer",
          "transition-shadow duration-300 ease-out",
          "hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-primary/10",
          "bg-gradient-to-br from-muted to-muted/50"
        )}
        onClick={handleQuickView}
      >
        <div className="aspect-[3/4] p-4 flex flex-col">
          {/* Top: Category badge */}
          <div className="flex justify-between items-start mb-auto">
            <div className="px-2.5 py-1 bg-primary/10 rounded-full">
              <span className="text-xs text-primary font-medium">{item.category_name}</span>
            </div>
            <button
              onClick={handleLike}
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                isLiked
                  ? "bg-red-500 text-white"
                  : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
              )}
            >
              <Heart size={16} className={cn(isLiked && "fill-current")} />
            </button>
          </div>

          {/* Center: Placeholder icon */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <Eye size={24} className="text-muted-foreground/50" />
            </div>
          </div>

          {/* Bottom: Info */}
          <div className="mt-auto">
            <h3 className="font-semibold text-foreground text-base leading-tight mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{item.breed}</p>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin size={12} />
              <span className="truncate max-w-[120px]">{item.location}</span>
            </div>
          </div>
        </div>

        {/* Sold Overlay */}
        {item.is_sold && (
          <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
            <div className="transform -rotate-12">
              <span className="text-foreground font-bold text-xl border-2 border-foreground px-5 py-1.5 rounded-lg uppercase tracking-widest">
                Sold
              </span>
            </div>
          </div>
        )}
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer break-inside-avoid",
        "transition-shadow duration-300 ease-out",
        "hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-primary/10"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleQuickView}
    >
      {/* Media Container - Pinterest style uses natural aspect ratio */}
      <div
        className="relative w-full"
        style={{ aspectRatio: media.aspect_ratio || 0.75 }}
      >
        {media.media_type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={media.file}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
            />
            {/* Video Indicator */}
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                <Play size={12} className="text-white fill-white" />
                <span className="text-xs text-white font-medium">Video</span>
              </div>
            </div>
          </>
        ) : (
          <Image
            src={media.file}
            alt={item.name}
            fill
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              isHovered && "scale-105"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        )}

        {/* Permanent gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Top Actions Row */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {/* Category Badge */}
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-xs text-white font-medium">{item.category_name}</span>
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={cn(
              "p-2 rounded-full backdrop-blur-sm transition-all duration-200",
              isLiked
                ? "bg-red-500 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            )}
          >
            <Heart size={16} className={cn(isLiked && "fill-current")} />
          </button>
        </div>

        {/* Sold Overlay */}
        {item.is_sold && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <div className="transform -rotate-12">
              <span className="text-white font-bold text-xl border-2 border-white px-5 py-1.5 rounded-lg uppercase tracking-widest">
                Sold
              </span>
            </div>
          </div>
        )}

        {/* Quick View Button - appears on hover */}
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: isHovered ? 1 : 0.8,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-gray-900 text-sm font-semibold shadow-lg hover:bg-white transition-colors"
          >
            <Eye size={16} />
            Quick View
          </motion.button>
        </div>

        {/* Bottom Info Overlay - Always visible on the image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Media count indicator */}
          {item.media_count > 1 && (
            <span className="inline-block text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full mb-2">
              +{item.media_count - 1} more
            </span>
          )}

          {/* Name and Breed */}
          <h3 className="font-semibold text-white text-base leading-tight mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-white/70 text-sm mb-2 line-clamp-1">{item.breed}</p>

          {/* Location Row */}
          <div className="flex items-center gap-1 text-white/60 text-xs">
            <MapPin size={12} />
            <span className="truncate max-w-[120px]">{item.location}</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
