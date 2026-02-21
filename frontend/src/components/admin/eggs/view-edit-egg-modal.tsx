"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Loader2,
  AlertCircle,
  Upload,
  Trash2,
  Edit,
  Eye,
  Package,
  MapPin,
  Tag,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  adminEggsApi,
  adminEggCategoriesApi,
  tagsApi,
  type AdminEggDetail,
  type AdminEggCategory,
  type Tag as TagType,
} from "@/lib/admin-api"
import {
  EGG_TYPE_LABELS,
  EGG_SIZE_LABELS,
  EGG_PACKAGING_LABELS,
} from "@/lib/types"
import type { EggType, EggSize, EggPackaging } from "@/lib/types"

interface ViewEditEggModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eggId: string | null
  initialMode?: "view" | "edit"
  onSuccess?: () => void
}

interface MediaFile {
  id?: string
  file?: File
  preview: string
  url?: string
  type: "image" | "video"
  aspectRatio: number
  isExisting?: boolean
}

export function ViewEditEggModal({
  open,
  onOpenChange,
  eggId,
  initialMode = "view",
  onSuccess,
}: ViewEditEggModalProps) {
  const [mode, setMode] = React.useState<"view" | "edit">(initialMode)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [egg, setEgg] = React.useState<AdminEggDetail | null>(null)
  const [categories, setCategories] = React.useState<AdminEggCategory[]>([])
  const [tags, setTags] = React.useState<TagType[]>([])
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([])
  const [mediaToDelete, setMediaToDelete] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    category_id: "",
    breed: "",
    egg_type: "table" as EggType,
    size: "medium" as EggSize,
    packaging: "crate_30" as EggPackaging,
    eggs_per_unit: 30,
    quantity_available: 1,
    location: "",
    description: "",
    is_available: true,
    is_featured: false,
    tag_ids: [] as string[],
  })

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open && eggId) {
      setMode(initialMode)
      loadData()
    } else {
      setEgg(null)
      setMediaFiles([])
      setMediaToDelete([])
      setError(null)
    }
  }, [open, eggId, initialMode])

  const loadData = async () => {
    if (!eggId) return

    setIsLoading(true)
    try {
      const [eggRes, categoriesRes, tagsRes] = await Promise.all([
        adminEggsApi.getDetail(eggId),
        adminEggCategoriesApi.getAll(),
        tagsApi.getAll(),
      ])

      setEgg(eggRes)
      setCategories(categoriesRes)
      setTags(tagsRes)

      // Populate form data
      setFormData({
        name: eggRes.name,
        category_id: eggRes.category_id || "",
        breed: eggRes.breed || "",
        egg_type: eggRes.egg_type as EggType,
        size: eggRes.size as EggSize,
        packaging: eggRes.packaging as EggPackaging,
        eggs_per_unit: eggRes.eggs_per_unit,
        quantity_available: eggRes.quantity_available,
        location: eggRes.location || "",
        description: eggRes.description || "",
        is_available: eggRes.is_available,
        is_featured: eggRes.is_featured,
        tag_ids: eggRes.tag_ids || [],
      })

      // Populate existing media
      const existingMedia: MediaFile[] = (eggRes.media || []).map((m: {
        id: string
        url: string
        media_type: string
        aspect_ratio: number
      }) => ({
        id: m.id,
        url: m.url,
        preview: m.url,
        type: m.media_type as "image" | "video",
        aspectRatio: m.aspect_ratio || 1,
        isExisting: true,
      }))
      setMediaFiles(existingMedia)
    } catch (err) {
      console.error("Failed to load egg:", err)
      setError("Failed to load egg details")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change
  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-update eggs_per_unit based on packaging
    if (field === "packaging") {
      const packagingMap: Record<string, number> = {
        crate_30: 30,
        tray_30: 30,
        tray_12: 12,
        half_crate_15: 15,
        custom: formData.eggs_per_unit,
      }
      setFormData((prev) => ({
        ...prev,
        eggs_per_unit: packagingMap[value as string] || 30,
      }))
    }
  }

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const type = file.type.startsWith("video/") ? "video" : "image"
      const preview = URL.createObjectURL(file)

      if (type === "image") {
        const img = document.createElement("img")
        img.onload = () => {
          const aspectRatio = img.width / img.height
          setMediaFiles((prev) => [
            ...prev,
            { file, preview, type, aspectRatio, isExisting: false },
          ])
        }
        img.src = preview
      } else {
        setMediaFiles((prev) => [
          ...prev,
          { file, preview, type, aspectRatio: 16 / 9, isExisting: false },
        ])
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remove media file
  const removeMedia = (index: number) => {
    const media = mediaFiles[index]
    if (media.isExisting && media.id) {
      setMediaToDelete((prev) => [...prev, media.id!])
    } else if (media.preview && !media.isExisting) {
      URL.revokeObjectURL(media.preview)
    }
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eggId) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.name || !formData.category_id) {
        throw new Error("Please fill in all required fields (name and bird type)")
      }

      // Update egg
      const eggData = {
        ...formData,
      }

      await adminEggsApi.update(eggId, eggData)

      // Delete removed media
      for (const mediaId of mediaToDelete) {
        try {
          await adminEggsApi.deleteMedia(eggId, mediaId)
        } catch (err) {
          console.error("Failed to delete media:", err)
        }
      }

      // Upload new media files
      const newMediaFiles = mediaFiles.filter((m) => !m.isExisting && m.file)
      for (let i = 0; i < newMediaFiles.length; i++) {
        const media = newMediaFiles[i]
        await adminEggsApi.uploadMedia(eggId, media.file!, {
          media_type: media.type,
          is_primary: mediaFiles.indexOf(media) === 0,
          aspect_ratio: media.aspectRatio,
        })
      }

      onSuccess?.()
      handleClose()
    } catch (err) {
      console.error("Failed to update egg:", err)
      setError(
        err instanceof Error ? err.message : "Failed to update egg. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    mediaFiles.forEach((m) => {
      if (!m.isExisting && m.preview) {
        URL.revokeObjectURL(m.preview)
      }
    })
    setMediaFiles([])
    setMediaToDelete([])
    setError(null)
    onOpenChange(false)
  }

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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  {mode === "view" ? (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Edit className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">
                      {mode === "view" ? "Egg Details" : "Edit Egg"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {mode === "view" ? "View product information" : "Update product details"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mode === "view" && (
                    <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mode === "view" ? (
                <ViewMode
                  egg={egg}
                  mediaFiles={mediaFiles}
                />
              ) : (
                <EditForm
                  formData={formData}
                  categories={categories}
                  mediaFiles={mediaFiles}
                  fileInputRef={fileInputRef}
                  error={error}
                  isSubmitting={isSubmitting}
                  onFieldChange={handleChange}
                  onFileSelect={handleFileSelect}
                  onRemoveMedia={removeMedia}
                  onSubmit={handleSubmit}
                  onCancel={() => setMode("view")}
                />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// View Mode Component
function ViewMode({
  egg,
  mediaFiles,
}: {
  egg: AdminEggDetail | null
  mediaFiles: MediaFile[]
}) {
  if (!egg) return null

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Media Gallery */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {mediaFiles.map((media, index) => (
              <div
                key={index}
                className={cn(
                  "relative rounded-lg overflow-hidden bg-muted",
                  index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                )}
              >
                {media.type === "image" ? (
                  <Image
                    src={media.url || media.preview}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={media.url || media.preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Header Info */}
        <div>
          <h3 className="text-2xl font-semibold">{egg.name}</h3>
          <p className="text-muted-foreground">{egg.breed}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{egg.category_name}</Badge>
          <Badge variant="secondary">
            {EGG_TYPE_LABELS[egg.egg_type as EggType]}
          </Badge>
          <Badge variant="secondary">
            {EGG_SIZE_LABELS[egg.size as EggSize]}
          </Badge>
          {egg.is_featured && (
            <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50">
              Featured
            </Badge>
          )}
          {!egg.is_available && (
            <Badge variant="destructive">Unavailable</Badge>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              <span className="text-sm">Packaging</span>
            </div>
            <p className="font-medium">
              {EGG_PACKAGING_LABELS[egg.packaging as EggPackaging]}
            </p>
            <p className="text-sm text-muted-foreground">
              {egg.eggs_per_unit} eggs per unit
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Tag className="h-4 w-4" />
              <span className="text-sm">Stock</span>
            </div>
            <p className={cn(
              "font-medium",
              egg.quantity_available < 5 && "text-orange-500"
            )}>
              {egg.quantity_available} units
            </p>
          </div>

          {egg.location && (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Location</span>
              </div>
              <p className="font-medium">{egg.location}</p>
            </div>
          )}

        </div>

        {/* Description */}
        {egg.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {egg.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {egg.tag_names && egg.tag_names.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {egg.tag_names.map((tagName: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tagName}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Edit Form Component
function EditForm({
  formData,
  categories,
  mediaFiles,
  fileInputRef,
  error,
  isSubmitting,
  onFieldChange,
  onFileSelect,
  onRemoveMedia,
  onSubmit,
  onCancel,
}: {
  formData: {
    name: string
    category_id: string
    breed: string
    egg_type: EggType
    size: EggSize
    packaging: EggPackaging
    eggs_per_unit: number
    quantity_available: number
    location: string
    description: string
    is_available: boolean
    is_featured: boolean
    tag_ids: string[]
  }
  categories: AdminEggCategory[]
  mediaFiles: MediaFile[]
  fileInputRef: React.RefObject<HTMLInputElement | null>
  error: string | null
  isSubmitting: boolean
  onFieldChange: (field: string, value: string | number | boolean | string[]) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveMedia: (index: number) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}) {
  return (
    <>
      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Bird Type *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => onFieldChange("category_id", value)}
                disabled={categories.length === 0}
              >
                <SelectTrigger className={categories.length === 0 ? "border-orange-500" : ""}>
                  <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select bird type"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No categories found.
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-breed">Breed</Label>
              <Input
                id="edit-breed"
                value={formData.breed}
                onChange={(e) => onFieldChange("breed", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-egg_type">Egg Type</Label>
              <Select
                value={formData.egg_type}
                onValueChange={(value) => onFieldChange("egg_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EGG_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size & Packaging */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-size">Egg Size</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => onFieldChange("size", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EGG_SIZE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-packaging">Packaging</Label>
              <Select
                value={formData.packaging}
                onValueChange={(value) => onFieldChange("packaging", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EGG_PACKAGING_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-eggs_per_unit">Eggs per Unit</Label>
              <Input
                id="edit-eggs_per_unit"
                type="number"
                min="1"
                value={formData.eggs_per_unit}
                onChange={(e) =>
                  onFieldChange("eggs_per_unit", parseInt(e.target.value) || 1)
                }
                disabled={formData.packaging !== "custom"}
              />
            </div>
          </div>

          {/* Stock & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity Available</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={formData.quantity_available}
                onChange={(e) =>
                  onFieldChange("quantity_available", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => onFieldChange("location", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Photos/Videos</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={onFileSelect}
                className="hidden"
              />

              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {mediaFiles.map((media, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    >
                      {media.type === "image" ? (
                        <Image
                          src={media.url || media.preview}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={media.url || media.preview}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveMedia(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Add Photos/Videos
              </Button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => onFieldChange("is_available", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Available for sale</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => onFieldChange("is_featured", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Featured product</span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </>
  )
}
