"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  MapPin,
  Calendar,
  Tag,
  Scale,
  DollarSign,
  Heart,
  Syringe,
  ExternalLink,
  Edit,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminLivestockApi, type LivestockDetail } from "@/lib/admin-api"

interface ViewLivestockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  livestockId: string | null
  onEdit?: () => void
  onMarkSold?: () => void
}

export function ViewLivestockModal({
  open,
  onOpenChange,
  livestockId,
  onEdit,
  onMarkSold,
}: ViewLivestockModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<LivestockDetail | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0)

  // Load livestock data when modal opens
  React.useEffect(() => {
    if (open && livestockId) {
      loadData()
    }
  }, [open, livestockId])

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setData(null)
      setActiveMediaIndex(0)
      setError(null)
    }
  }, [open])

  const loadData = async () => {
    if (!livestockId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await adminLivestockApi.getDetail(livestockId)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load livestock data")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onOpenChange])

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Media navigation
  const handlePrevMedia = () => {
    if (data?.media && data.media.length > 0) {
      setActiveMediaIndex((prev) =>
        prev === 0 ? data.media.length - 1 : prev - 1
      )
    }
  }

  const handleNextMedia = () => {
    if (data?.media && data.media.length > 0) {
      setActiveMediaIndex((prev) =>
        prev === data.media.length - 1 ? 0 : prev + 1
      )
    }
  }

  // Keyboard navigation for media
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !data?.media?.length) return
      if (e.key === "ArrowLeft") handlePrevMedia()
      if (e.key === "ArrowRight") handleNextMedia()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, data?.media?.length])

  const formatCurrency = (amount: string | number, currency: string = "NGN") => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const activeMedia = data?.media?.[activeMediaIndex]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              className={cn(
                "relative flex flex-col",
                "w-full max-w-5xl",
                "max-h-[95vh] md:max-h-[90vh]",
                "bg-background rounded-2xl shadow-premium-lg",
                "border border-border/50",
                "overflow-hidden"
              )}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button variant="outline" onClick={loadData}>
                      Try Again
                    </Button>
                  </div>
                ) : data ? (
                  <div className="flex flex-col lg:flex-row">
                    {/* Media Section */}
                    <div className="lg:w-1/2 bg-muted/30">
                      {/* Main Media Display */}
                      <div className="relative aspect-square lg:aspect-[4/3]">
                        {activeMedia ? (
                          activeMedia.media_type === "video" ? (
                            <video
                              key={activeMedia.id}
                              src={activeMedia.file_url}
                              className="h-full w-full object-contain bg-black"
                              controls
                              autoPlay
                              muted
                            />
                          ) : (
                            <img
                              key={activeMedia.id}
                              src={activeMedia.file_url}
                              alt={data.name}
                              className="h-full w-full object-contain"
                            />
                          )
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-16 w-16" />
                          </div>
                        )}

                        {/* Navigation Arrows */}
                        {data.media && data.media.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevMedia}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              onClick={handleNextMedia}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </>
                        )}

                        {/* Media Counter */}
                        {data.media && data.media.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                            {activeMediaIndex + 1} / {data.media.length}
                          </div>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {data.media && data.media.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto">
                          {data.media.map((media, index) => (
                            <button
                              key={media.id}
                              onClick={() => setActiveMediaIndex(index)}
                              className={cn(
                                "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                index === activeMediaIndex
                                  ? "border-primary ring-2 ring-primary/30"
                                  : "border-transparent hover:border-muted-foreground/30"
                              )}
                            >
                              {media.media_type === "video" ? (
                                <>
                                  <video
                                    src={media.file_url}
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play className="h-4 w-4 text-white" fill="white" />
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={media.file_url}
                                  alt=""
                                  className="h-full w-full object-cover"
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

                    {/* Details Section */}
                    <div className="lg:w-1/2 px-4 py-6 md:px-6 space-y-6">
                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="font-serif text-2xl font-bold">{data.name}</h2>
                            <p className="text-muted-foreground">{data.breed}</p>
                          </div>
                          {data.is_sold ? (
                            <Badge className="bg-red-500/10 text-red-500 shrink-0">
                              Sold
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 shrink-0">
                              Available
                            </Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mt-4">
                          <p className="text-3xl font-bold text-primary">
                            {formatCurrency(data.price, data.currency)}
                          </p>
                          {data.is_sold && data.sold_price && (
                            <p className="text-sm text-muted-foreground">
                              Sold for {formatCurrency(data.sold_price, data.currency)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="font-medium text-sm">{data.category_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Age</p>
                            <p className="font-medium text-sm">{data.age}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Scale className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Weight</p>
                            <p className="font-medium text-sm">{data.weight || "N/A"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-full bg-primary/10">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium text-sm">{data.location}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {data.description || "No description available."}
                        </p>
                      </div>

                      {/* Health Status */}
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          Health Status
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {data.health_status || "No health information available."}
                        </p>
                      </div>

                      {/* Vaccination History */}
                      {data.vaccination_history && data.vaccination_history.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Syringe className="h-4 w-4 text-primary" />
                            Vaccination History
                          </h3>
                          <div className="space-y-2">
                            {data.vaccination_history.map((vax) => (
                              <div
                                key={vax.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                              >
                                <span className="font-medium">{vax.name}</span>
                                <span className="text-muted-foreground">
                                  {formatDate(vax.date)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {data.tag_names && data.tag_names.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.tag_names.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Created: {formatDate(data.created_at)}</span>
                          <span>Updated: {formatDate(data.updated_at)}</span>
                        </div>
                        {data.is_sold && data.sold_at && (
                          <p className="mt-1">Sold on: {formatDate(data.sold_at)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer Actions */}
              {data && (
                <div className="border-t border-border/50 bg-muted/30 px-4 py-4 md:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/livestock?highlight=${data.id}`, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Site
                    </Button>

                    <div className="flex items-center gap-2">
                      {!data.is_sold && onMarkSold && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false)
                            onMarkSold()
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Sold
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onOpenChange(false)
                            onEdit()
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
