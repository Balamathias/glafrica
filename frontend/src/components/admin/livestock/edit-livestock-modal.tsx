"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, AlertCircle, Loader2, Trash2, Star, Image as ImageIcon, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { adminLivestockApi, type LivestockDetail } from "@/lib/admin-api"
import { CategorySelect } from "./form-fields/category-select"
import { TagMultiSelect } from "./form-fields/tag-multi-select"
import { MediaUploadZone } from "./form-fields/media-upload-zone"

interface EditLivestockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  livestockId: string | null
  onSuccess?: () => void
}

interface ExistingMedia {
  id: string
  file_url: string
  media_type: string
  is_featured: boolean
  aspect_ratio: number
}

interface NewMedia {
  id: string
  file: File
  preview: string
  type: "image" | "video"
  aspectRatio: number
}

interface FormState {
  name: string
  category_id: string
  breed: string
  gender: string
  age: string
  weight: string
  price: string
  currency: string
  location: string
  description: string
  health_status: string
  vaccination_history: Array<{ id: string; name: string; date: string; notes?: string }>
  tag_ids: string[]
  is_sold: boolean
}

const CURRENCIES = [
  { value: "NGN", label: "₦ NGN" },
  { value: "USD", label: "$ USD" },
  { value: "GBP", label: "£ GBP" },
  { value: "EUR", label: "€ EUR" },
]

export function EditLivestockModal({
  open,
  onOpenChange,
  livestockId,
  onSuccess,
}: EditLivestockModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [formState, setFormState] = React.useState<FormState>({
    name: "",
    category_id: "",
    breed: "",
    gender: "",
    age: "",
    weight: "",
    price: "",
    currency: "NGN",
    location: "",
    description: "",
    health_status: "",
    vaccination_history: [],
    tag_ids: [],
    is_sold: false,
  })

  // Media state
  const [existingMedia, setExistingMedia] = React.useState<ExistingMedia[]>([])
  const [newMedia, setNewMedia] = React.useState<NewMedia[]>([])
  const [featuredMediaId, setFeaturedMediaId] = React.useState<string | null>(null)
  const [mediaToDelete, setMediaToDelete] = React.useState<string[]>([])

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Load livestock data when modal opens
  React.useEffect(() => {
    if (open && livestockId) {
      loadLivestockData()
    }
  }, [open, livestockId])

  const loadLivestockData = async () => {
    if (!livestockId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await adminLivestockApi.getDetail(livestockId)

      setFormState({
        name: data.name,
        category_id: data.category_id,
        breed: data.breed,
        gender: data.gender,
        age: data.age,
        weight: data.weight || "",
        price: data.price,
        currency: data.currency,
        location: data.location,
        description: data.description || "",
        health_status: data.health_status || "",
        vaccination_history: data.vaccination_history || [],
        tag_ids: data.tag_ids || [],
        is_sold: data.is_sold,
      })

      setExistingMedia(data.media || [])
      const featured = data.media?.find(m => m.is_featured)
      setFeaturedMediaId(featured?.id || data.media?.[0]?.id || null)
      setMediaToDelete([])
      setNewMedia([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load livestock data")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleMediaAdd = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      return (isImage || isVideo) && file.size <= maxSize
    })

    const newPreviews: NewMedia[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" as const : "image" as const,
        aspectRatio: await calculateAspectRatio(file),
      }))
    )

    setNewMedia(prev => [...prev, ...newPreviews])
  }

  const handleRemoveExistingMedia = (mediaId: string) => {
    setMediaToDelete(prev => [...prev, mediaId])
    setExistingMedia(prev => prev.filter(m => m.id !== mediaId))

    // Update featured if needed
    if (featuredMediaId === mediaId) {
      const remaining = existingMedia.filter(m => m.id !== mediaId)
      setFeaturedMediaId(remaining[0]?.id || newMedia[0]?.id || null)
    }
  }

  const handleRemoveNewMedia = (mediaId: string) => {
    const media = newMedia.find(m => m.id === mediaId)
    if (media) {
      URL.revokeObjectURL(media.preview)
    }
    setNewMedia(prev => prev.filter(m => m.id !== mediaId))

    // Update featured if needed
    if (featuredMediaId === mediaId) {
      const remainingExisting = existingMedia
      const remainingNew = newMedia.filter(m => m.id !== mediaId)
      setFeaturedMediaId(remainingExisting[0]?.id || remainingNew[0]?.id || null)
    }
  }

  const handleSetFeatured = (mediaId: string) => {
    setFeaturedMediaId(mediaId)
  }

  // Vaccination management
  const addVaccination = () => {
    setFormState(prev => ({
      ...prev,
      vaccination_history: [
        ...prev.vaccination_history,
        { id: `vax-${Date.now()}`, name: "", date: "", notes: "" }
      ],
    }))
  }

  const updateVaccination = (id: string, updates: Partial<FormState["vaccination_history"][0]>) => {
    setFormState(prev => ({
      ...prev,
      vaccination_history: prev.vaccination_history.map(v =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }))
  }

  const removeVaccination = (id: string) => {
    setFormState(prev => ({
      ...prev,
      vaccination_history: prev.vaccination_history.filter(v => v.id !== id),
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formState.name || formState.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }
    if (!formState.category_id) {
      newErrors.category_id = "Please select a category"
    }
    if (!formState.breed || formState.breed.trim().length < 2) {
      newErrors.breed = "Breed must be at least 2 characters"
    }
    if (!formState.gender) {
      newErrors.gender = "Please select a gender"
    }
    if (!formState.age) {
      newErrors.age = "Age is required"
    }

    const price = parseFloat(formState.price)
    if (isNaN(price) || price <= 0) {
      newErrors.price = "Price must be a positive number"
    }
    if (!formState.location) {
      newErrors.location = "Location is required"
    }
    if (!formState.description || formState.description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters"
    }
    if (!formState.health_status || formState.health_status.trim().length < 20) {
      newErrors.health_status = "Health status must be at least 20 characters"
    }

    // Check media
    const totalMedia = existingMedia.length + newMedia.length
    if (totalMedia === 0) {
      newErrors.media = "At least one media file is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !livestockId) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Update livestock data
      await adminLivestockApi.update(livestockId, {
        name: formState.name,
        category_id: formState.category_id,
        breed: formState.breed,
        gender: formState.gender,
        age: formState.age,
        weight: formState.weight || undefined,
        price: formState.price,
        currency: formState.currency,
        location: formState.location,
        description: formState.description,
        health_status: formState.health_status,
        vaccination_history: formState.vaccination_history.filter(v => v.name.trim()),
        tag_ids: formState.tag_ids,
      } as never)

      // Delete removed media
      for (const mediaId of mediaToDelete) {
        try {
          await adminLivestockApi.deleteMedia(livestockId, mediaId)
        } catch {
          // Continue even if delete fails
        }
      }

      // Upload new media
      for (let i = 0; i < newMedia.length; i++) {
        const media = newMedia[i]
        const isFeatured = featuredMediaId === media.id ||
          (existingMedia.length === 0 && i === 0 && !featuredMediaId)

        await adminLivestockApi.uploadMedia(livestockId, media.file, {
          media_type: media.type,
          is_featured: isFeatured,
          aspect_ratio: media.aspectRatio,
        })
      }

      // Clean up
      newMedia.forEach(m => URL.revokeObjectURL(m.preview))

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update livestock")
    } finally {
      setIsSubmitting(false)
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

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      newMedia.forEach(m => URL.revokeObjectURL(m.preview))
    }
  }, [])

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
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              className={cn(
                "relative flex flex-col",
                "w-full max-w-4xl",
                "max-h-[95vh] md:max-h-[90vh]",
                "bg-background rounded-2xl shadow-premium-lg",
                "border border-border/50",
                "overflow-hidden",
                "h-full md:h-auto"
              )}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative border-b border-border/50 bg-muted/30 px-4 py-4 md:px-6">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-500 via-amber-500/50 to-amber-500/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-semibold">Edit Livestock</h2>
                    <p className="text-sm text-muted-foreground">
                      Update livestock information
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Basic Information */}
                    <section>
                      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium mb-1.5">
                            Name <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={formState.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="e.g., Premium Bull #127"
                            className={errors.name ? "border-destructive" : ""}
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                          )}
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Category <span className="text-destructive">*</span>
                          </label>
                          <CategorySelect
                            value={formState.category_id}
                            onChange={(value) => updateField("category_id", value)}
                            error={errors.category_id}
                          />
                        </div>

                        {/* Breed */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Breed <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={formState.breed}
                            onChange={(e) => updateField("breed", e.target.value)}
                            placeholder="e.g., Angus, Holstein"
                            className={errors.breed ? "border-destructive" : ""}
                          />
                          {errors.breed && (
                            <p className="mt-1 text-xs text-destructive">{errors.breed}</p>
                          )}
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Gender <span className="text-destructive">*</span>
                          </label>
                          <div className="flex gap-3">
                            {[
                              { value: "M", label: "Male" },
                              { value: "F", label: "Female" },
                              { value: "mixed", label: "Mixed" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => updateField("gender", option.value)}
                                className={cn(
                                  "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                                  formState.gender === option.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-muted-foreground/50"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          {errors.gender && (
                            <p className="mt-1 text-xs text-destructive">{errors.gender}</p>
                          )}
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Age <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={formState.age}
                            onChange={(e) => updateField("age", e.target.value)}
                            placeholder="e.g., 2 years, 6 months"
                            className={errors.age ? "border-destructive" : ""}
                          />
                          {errors.age && (
                            <p className="mt-1 text-xs text-destructive">{errors.age}</p>
                          )}
                        </div>

                        {/* Weight */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Weight</label>
                          <Input
                            value={formState.weight}
                            onChange={(e) => updateField("weight", e.target.value)}
                            placeholder="e.g., 450kg"
                          />
                        </div>
                      </div>
                    </section>

                    {/* Pricing & Location */}
                    <section>
                      <h3 className="text-lg font-medium mb-4">Pricing & Location</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Price <span className="text-destructive">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={formState.currency}
                              onChange={(e) => updateField("currency", e.target.value)}
                              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                            >
                              {CURRENCIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              value={formState.price}
                              onChange={(e) => updateField("price", e.target.value)}
                              placeholder="0"
                              className={cn("flex-1", errors.price && "border-destructive")}
                            />
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Location <span className="text-destructive">*</span>
                          </label>
                          <Input
                            value={formState.location}
                            onChange={(e) => updateField("location", e.target.value)}
                            placeholder="e.g., Lagos, Nigeria"
                            className={errors.location ? "border-destructive" : ""}
                          />
                          {errors.location && (
                            <p className="mt-1 text-xs text-destructive">{errors.location}</p>
                          )}
                        </div>

                        {/* Sold Status */}
                        <div className="sm:col-span-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <button
                              type="button"
                              onClick={() => updateField("is_sold", !formState.is_sold)}
                              className={cn(
                                "relative h-6 w-11 rounded-full transition-colors",
                                formState.is_sold ? "bg-primary" : "bg-muted-foreground/30"
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                                  formState.is_sold && "translate-x-5"
                                )}
                              />
                            </button>
                            <span className="text-sm font-medium">
                              {formState.is_sold ? "Marked as Sold" : "Available for Sale"}
                            </span>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Details & Health */}
                    <section>
                      <h3 className="text-lg font-medium mb-4">Details & Health</h3>
                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Description <span className="text-destructive">*</span>
                          </label>
                          <Textarea
                            value={formState.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Provide a detailed description..."
                            rows={4}
                            className={errors.description ? "border-destructive" : ""}
                          />
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formState.description.length}/50 characters minimum
                            </p>
                            {errors.description && (
                              <p className="text-xs text-destructive">{errors.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Health Status */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            Health Status <span className="text-destructive">*</span>
                          </label>
                          <Textarea
                            value={formState.health_status}
                            onChange={(e) => updateField("health_status", e.target.value)}
                            placeholder="Describe the health condition..."
                            rows={3}
                            className={errors.health_status ? "border-destructive" : ""}
                          />
                          {errors.health_status && (
                            <p className="mt-1 text-xs text-destructive">{errors.health_status}</p>
                          )}
                        </div>

                        {/* Vaccination History */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">
                              Vaccination History
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addVaccination}
                            >
                              Add Vaccine
                            </Button>
                          </div>
                          {formState.vaccination_history.length > 0 ? (
                            <div className="space-y-3">
                              {formState.vaccination_history.map((vax) => (
                                <div
                                  key={vax.id}
                                  className="flex gap-2 items-start p-3 rounded-lg border border-border/50 bg-muted/30"
                                >
                                  <div className="flex-1 grid gap-2 sm:grid-cols-3">
                                    <Input
                                      value={vax.name}
                                      onChange={(e) =>
                                        updateVaccination(vax.id, { name: e.target.value })
                                      }
                                      placeholder="Vaccine name"
                                    />
                                    <Input
                                      type="date"
                                      value={vax.date}
                                      onChange={(e) =>
                                        updateVaccination(vax.id, { date: e.target.value })
                                      }
                                    />
                                    <Input
                                      value={vax.notes || ""}
                                      onChange={(e) =>
                                        updateVaccination(vax.id, { notes: e.target.value })
                                      }
                                      placeholder="Notes (optional)"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeVaccination(vax.id)}
                                    className="shrink-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                              No vaccinations recorded
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Media */}
                    <section>
                      <h3 className="text-lg font-medium mb-4">
                        Media <span className="text-destructive">*</span>
                      </h3>

                      {/* Existing Media */}
                      {existingMedia.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Existing Media</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {existingMedia.map((media) => (
                              <div
                                key={media.id}
                                className={cn(
                                  "relative aspect-square rounded-lg overflow-hidden border-2 group",
                                  featuredMediaId === media.id
                                    ? "border-primary"
                                    : "border-border/50"
                                )}
                              >
                                {media.media_type === "video" ? (
                                  <video
                                    src={media.file_url}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={media.file_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                )}

                                {/* Type indicator */}
                                <div className="absolute top-1 left-1">
                                  {media.media_type === "video" ? (
                                    <Video className="h-4 w-4 text-white drop-shadow" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 text-white drop-shadow" />
                                  )}
                                </div>

                                {/* Featured badge */}
                                {featuredMediaId === media.id && (
                                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                    <Star className="h-3 w-3 fill-current" />
                                  </div>
                                )}

                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => handleSetFeatured(media.id)}
                                    title="Set as featured"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={() => handleRemoveExistingMedia(media.id)}
                                    title="Remove"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Media */}
                      {newMedia.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">New Media</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {newMedia.map((media) => (
                              <div
                                key={media.id}
                                className={cn(
                                  "relative aspect-square rounded-lg overflow-hidden border-2 group",
                                  featuredMediaId === media.id
                                    ? "border-primary"
                                    : "border-border/50 border-dashed"
                                )}
                              >
                                {media.type === "video" ? (
                                  <video
                                    src={media.preview}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={media.preview}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                )}

                                {/* Type indicator */}
                                <div className="absolute top-1 left-1">
                                  {media.type === "video" ? (
                                    <Video className="h-4 w-4 text-white drop-shadow" />
                                  ) : (
                                    <ImageIcon className="h-4 w-4 text-white drop-shadow" />
                                  )}
                                </div>

                                {/* Featured badge */}
                                {featuredMediaId === media.id && (
                                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                    <Star className="h-3 w-3 fill-current" />
                                  </div>
                                )}

                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => handleSetFeatured(media.id)}
                                    title="Set as featured"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={() => handleRemoveNewMedia(media.id)}
                                    title="Remove"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload Zone */}
                      <MediaUploadZone onFilesAdded={handleMediaAdd} />

                      {errors.media && (
                        <p className="mt-2 text-sm text-destructive">{errors.media}</p>
                      )}
                    </section>

                    {/* Tags */}
                    <section>
                      <h3 className="text-lg font-medium mb-4">Tags</h3>
                      <TagMultiSelect
                        value={formState.tag_ids}
                        onChange={(value) => updateField("tag_ids", value)}
                      />
                    </section>

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
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 bg-muted/30 px-4 py-4 md:px-6">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isLoading}
                  >
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
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper function
async function calculateAspectRatio(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const img = new Image()
      img.onload = () => {
        resolve(img.width / img.height)
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => resolve(1)
      img.src = URL.createObjectURL(file)
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video")
      video.onloadedmetadata = () => {
        resolve(video.videoWidth / video.videoHeight)
        URL.revokeObjectURL(video.src)
      }
      video.onerror = () => resolve(1)
      video.src = URL.createObjectURL(file)
    } else {
      resolve(1)
    }
  })
}
