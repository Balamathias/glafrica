"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Folder, FileText, Upload, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categoriesApi } from "@/lib/admin-api"

interface CreateCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  description: string
  icon: File | null
  iconPreview: string | null
}

const initialFormData: FormData = {
  name: "",
  description: "",
  icon: null,
  iconPreview: null,
}

export function CreateCategoryModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = React.useState<FormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setFormData(initialFormData)
      setErrors({})
      setSubmitError(null)
    }
  }, [open])

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

  const updateField = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, icon: "Please select an image file" }))
        return
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, icon: "Image must be less than 2MB" }))
        return
      }

      const preview = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        icon: file,
        iconPreview: preview,
      }))
    }
  }

  const removeIcon = () => {
    if (formData.iconPreview) {
      URL.revokeObjectURL(formData.iconPreview)
    }
    setFormData((prev) => ({
      ...prev,
      icon: null,
      iconPreview: null,
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await categoriesApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      // Success
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create category:", error)
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create category. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={cn(
                "relative w-full max-w-lg",
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
              {/* Header */}
              <div className="relative border-b border-border/50 bg-muted/30 px-4 py-4 md:px-6">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-primary/20" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-semibold">New Category</h2>
                      <p className="text-sm text-muted-foreground">
                        Create a new livestock category
                      </p>
                    </div>
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

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="px-4 py-6 md:px-6 space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Category Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      icon={<Folder className="h-4 w-4" />}
                      placeholder="e.g., Goats, Cattle, Sheep"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={cn(
                        errors.name && "border-destructive focus-visible:ring-destructive"
                      )}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <motion.p
                        className="text-xs text-destructive"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Description{" "}
                      <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <textarea
                        placeholder="Brief description of this category..."
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                        className={cn(
                          "flex w-full rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-sm transition-colors",
                          "placeholder:text-muted-foreground resize-none",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Icon Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Icon{" "}
                      <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                    </label>

                    {formData.iconPreview ? (
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-border/50">
                          <img
                            src={formData.iconPreview}
                            alt="Category icon"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeIcon}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "flex items-center gap-3 w-full p-4 rounded-xl border-2 border-dashed",
                          "border-border/50 bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
                          "transition-colors cursor-pointer",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        disabled={isSubmitting}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Upload icon</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                        </div>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />

                    {errors.icon && (
                      <motion.p
                        className="text-xs text-destructive"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.icon}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {submitError && (
                    <motion.div
                      className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {submitError}
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 bg-muted/30 px-4 py-4 md:px-6">
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Category"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
