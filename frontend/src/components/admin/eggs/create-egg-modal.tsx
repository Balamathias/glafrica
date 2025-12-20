"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, AlertCircle, Calendar, Upload, Trash2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  type AdminEggCategory,
  type Tag,
} from "@/lib/admin-api"
import {
  EGG_TYPE_LABELS,
  EGG_SIZE_LABELS,
  EGG_PACKAGING_LABELS,
} from "@/lib/types"
import type { EggType, EggSize, EggPackaging } from "@/lib/types"

interface CreateEggModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface MediaFile {
  file: File
  preview: string
  type: "image" | "video"
  aspectRatio: number
}

export function CreateEggModal({ open, onOpenChange, onSuccess }: CreateEggModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<AdminEggCategory[]>([])
  const [tags, setTags] = React.useState<Tag[]>([])
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([])
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
    price: "",
    currency: "NGN",
    quantity_available: 1,
    production_date: "",
    expiry_date: "",
    location: "",
    description: "",
    is_available: true,
    is_featured: false,
    tag_ids: [] as string[],
  })

  // Load categories and tags
  React.useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setIsLoadingData(true)
    setError(null)
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        adminEggCategoriesApi.getAll(),
        tagsApi.getAll(),
      ])
      setCategories(categoriesRes)
      setTags(tagsRes)

      // Show warning if no categories exist
      if (!categoriesRes || categoriesRes.length === 0) {
        setError("No bird types (categories) found. Please create categories first or run: python manage.py seed_egg_categories")
      }
    } catch (err) {
      console.error("Failed to load form data:", err)
      setError("Failed to load form data. Please check your connection and try again.")
    } finally {
      setIsLoadingData(false)
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
      setFormData((prev) => ({ ...prev, eggs_per_unit: packagingMap[value as string] || 30 }))
    }
  }

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const type = file.type.startsWith("video/") ? "video" : "image"
      const preview = URL.createObjectURL(file)

      // Get aspect ratio for images
      if (type === "image") {
        const img = document.createElement("img")
        img.onload = () => {
          const aspectRatio = img.width / img.height
          setMediaFiles((prev) => [...prev, { file, preview, type, aspectRatio }])
        }
        img.src = preview
      } else {
        setMediaFiles((prev) => [...prev, { file, preview, type, aspectRatio: 16 / 9 }])
      }
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remove media file
  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.category_id || !formData.price) {
        throw new Error("Please fill in all required fields")
      }

      // Create egg
      const eggData = {
        ...formData,
        production_date: formData.production_date || undefined,
        expiry_date: formData.expiry_date || undefined,
      }

      const created = await adminEggsApi.create(eggData)

      // Upload media files
      for (let i = 0; i < mediaFiles.length; i++) {
        const media = mediaFiles[i]
        await adminEggsApi.uploadMedia(created.id, media.file, {
          media_type: media.type,
          is_primary: i === 0,
          aspect_ratio: media.aspectRatio,
        })
      }

      // Success
      onSuccess?.()
      handleClose()
    } catch (err: unknown) {
      console.error("Failed to create egg:", err)
      // Extract detailed error message from axios error
      let errorMessage = "Failed to create egg. Please try again."
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown; status?: number } }
        console.error("Error response:", axiosError.response?.data)
        console.error("Error status:", axiosError.response?.status)
        if (axiosError.response?.data) {
          if (typeof axiosError.response.data === 'string') {
            errorMessage = axiosError.response.data
          } else if (typeof axiosError.response.data === 'object') {
            const data = axiosError.response.data as Record<string, unknown>
            // Handle Django REST framework validation errors
            const errors = Object.entries(data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ')
            errorMessage = errors || JSON.stringify(data)
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const handleClose = () => {
    setFormData({
      name: "",
      category_id: "",
      breed: "",
      egg_type: "table",
      size: "medium",
      packaging: "crate_30",
      eggs_per_unit: 30,
      price: "",
      currency: "NGN",
      quantity_available: 1,
      production_date: "",
      expiry_date: "",
      location: "",
      description: "",
      is_available: true,
      is_featured: false,
      tag_ids: [],
    })
    mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview))
    setMediaFiles([])
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
                <div>
                  <h2 className="text-xl font-semibold">Add New Egg Product</h2>
                  <p className="text-sm text-muted-foreground">Fill in the details below</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Form */}
              {isLoadingData ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading form data...</p>
                  </div>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g., Fresh Layer Eggs"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Bird Type *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => handleChange("category_id", value)}
                        disabled={categories.length === 0}
                      >
                        <SelectTrigger className={categories.length === 0 ? "border-orange-500" : ""}>
                          <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select bird type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length === 0 ? (
                            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                              No categories found.<br />
                              Please create categories first.
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
                      {categories.length === 0 && (
                        <p className="text-xs text-orange-500">
                          Run: python manage.py seed_egg_categories
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="breed">Breed</Label>
                      <Input
                        id="breed"
                        value={formData.breed}
                        onChange={(e) => handleChange("breed", e.target.value)}
                        placeholder="e.g., ISA Brown"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="egg_type">Egg Type</Label>
                      <Select
                        value={formData.egg_type}
                        onValueChange={(value) => handleChange("egg_type", value)}
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
                      <Label htmlFor="size">Egg Size</Label>
                      <Select
                        value={formData.size}
                        onValueChange={(value) => handleChange("size", value)}
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
                      <Label htmlFor="packaging">Packaging</Label>
                      <Select
                        value={formData.packaging}
                        onValueChange={(value) => handleChange("packaging", value)}
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
                      <Label htmlFor="eggs_per_unit">Eggs per Unit</Label>
                      <Input
                        id="eggs_per_unit"
                        type="number"
                        min="1"
                        value={formData.eggs_per_unit}
                        onChange={(e) => handleChange("eggs_per_unit", parseInt(e.target.value) || 1)}
                        disabled={formData.packaging !== "custom"}
                      />
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Unit *</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground">
                          {formData.currency}
                        </span>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleChange("price", e.target.value)}
                          className="rounded-l-none"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity Available</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity_available}
                        onChange={(e) => handleChange("quantity_available", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="e.g., Lagos, Nigeria"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="production_date">Production Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="production_date"
                          type="date"
                          value={formData.production_date}
                          onChange={(e) => handleChange("production_date", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="expiry_date"
                          type="date"
                          value={formData.expiry_date}
                          onChange={(e) => handleChange("expiry_date", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe the eggs..."
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
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {mediaFiles.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {mediaFiles.map((media, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                              {media.type === "image" ? (
                                <Image
                                  src={media.preview}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <video src={media.preview} className="w-full h-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
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
                        onChange={(e) => handleChange("is_available", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Available for sale</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => handleChange("is_featured", e.target.checked)}
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
              )}

              {/* Footer */}
              {!isLoadingData && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || categories.length === 0}
                  title={categories.length === 0 ? "Please create bird type categories first" : undefined}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Egg"
                  )}
                </Button>
              </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
