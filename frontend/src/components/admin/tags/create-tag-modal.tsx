"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Tag, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { tagsApi } from "@/lib/admin-api"

interface CreateTagModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  name: string
}

const initialFormData: FormData = {
  name: "",
}

export function CreateTagModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTagModalProps) {
  const [formData, setFormData] = React.useState<FormData>(initialFormData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const inputRef = React.useRef<HTMLInputElement>(null)

  // Reset form when modal closes and focus input when opens
  React.useEffect(() => {
    if (!open) {
      setFormData(initialFormData)
      setErrors({})
      setSubmitError(null)
    } else {
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100)
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

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Tag name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tag name must be at least 2 characters"
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Tag name must be less than 50 characters"
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
      await tagsApi.create(formData.name.trim())

      // Success
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create tag:", error)
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create tag. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate slug preview
  const slugPreview = formData.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

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
                "relative w-full max-w-md",
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
              <div className="relative border-b border-border/50 bg-muted/30 px-6 py-4">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-primary/20" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-semibold">New Tag</h2>
                      <p className="text-sm text-muted-foreground">
                        Create a tag for livestock
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
                <div className="p-6 space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tag Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      ref={inputRef}
                      icon={<Hash className="h-4 w-4" />}
                      placeholder="e.g., Premium, Organic, Young"
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

                  {/* Slug Preview */}
                  {slugPreview && (
                    <motion.div
                      className="rounded-lg bg-muted/50 p-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <p className="text-xs text-muted-foreground">Slug Preview</p>
                      <p className="text-sm font-mono text-primary">{slugPreview}</p>
                    </motion.div>
                  )}

                  {/* Helper text */}
                  <div className="rounded-xl bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Tip:</strong> Use descriptive tags that
                      help buyers filter and find livestock. Good examples: &quot;Vaccinated&quot;,
                      &quot;Breeding Stock&quot;, &quot;Show Quality&quot;.
                    </p>
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
                <div className="border-t border-border/50 bg-muted/30 px-6 py-4">
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
                        "Create Tag"
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
