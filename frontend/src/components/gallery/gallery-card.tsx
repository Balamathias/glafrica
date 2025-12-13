"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Play, MapPin, Heart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useModalStore } from "@/lib/store"
import { formatPrice } from "@/lib/types"
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

  const handleClick = () => {
    openDetailModal(item.id)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  if (!media) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative rounded-xl overflow-hidden bg-card cursor-pointer shadow-sm hover:shadow-premium transition-shadow duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Media Container */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: media.aspect_ratio || 1 }}
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
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                <Play size={10} className="text-white fill-white" />
                <span className="text-[10px] text-white font-medium">Video</span>
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
              isHovered && "scale-110"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-xs">
            {item.category_name}
          </Badge>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            media.media_type === "video" ? "top-12" : "top-3",
            isLiked
              ? "bg-red-500 text-white"
              : "bg-black/30 text-white hover:bg-black/50"
          )}
        >
          <Heart size={16} className={cn(isLiked && "fill-current")} />
        </button>

        {/* Sold Overlay */}
        {item.is_sold && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <div className="transform -rotate-12">
              <span className="text-white font-bold text-2xl border-4 border-white px-6 py-2 rounded-lg uppercase tracking-widest">
                Sold
              </span>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={cn(
            "absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Quick View Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20"
            >
              <Eye size={16} />
              Quick View
            </motion.div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{item.breed}</p>
          </div>
          {item.media_count > 1 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
              +{item.media_count - 1}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-primary">
            {formatPrice(item.price, item.currency)}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{item.location}</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
