"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LivestockFormProvider,
  useLivestockForm,
  hasSavedDraft,
  type LivestockFormData,
} from "./livestock-form-context"
import { StepBasicInfo } from "./steps/step-basic-info"
import { StepPricingLocation } from "./steps/step-pricing-location"
import { StepDetailsHealth } from "./steps/step-details-health"
import { StepMediaTags } from "./steps/step-media-tags"
import { adminLivestockApi, categoriesApi, tagsApi } from "@/lib/admin-api"

interface CreateLivestockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editId?: string
}

const STEPS = [
  { id: 1, title: "Basic Info", description: "Name, breed, category" },
  { id: 2, title: "Pricing", description: "Price and location" },
  { id: 3, title: "Details", description: "Description and health" },
  { id: 4, title: "Media", description: "Photos, videos, tags" },
]

// Step Indicator Component
function StepIndicator() {
  const { state } = useLivestockForm()
  const { currentStep } = state

  return (
    <div className="flex items-center justify-between px-2">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id
        const isLast = index === STEPS.length - 1

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </motion.div>
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground hidden md:block">
                  {step.description}
                </p>
              </div>
            </div>

            {!isLast && (
              <div className="flex-1 mx-2 sm:mx-4">
                <div className="relative h-0.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Modal Content Component
function ModalContent({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess?: () => void
}) {
  const {
    state,
    nextStep,
    prevStep,
    validateStep,
    setSubmitting,
    resetForm,
    clearDraft,
    loadDraft,
  } = useLivestockForm()

  const [showDraftPrompt, setShowDraftPrompt] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Check for saved draft on mount
  React.useEffect(() => {
    if (hasSavedDraft()) {
      setShowDraftPrompt(true)
    }
  }, [])

  const handleLoadDraft = () => {
    loadDraft()
    setShowDraftPrompt(false)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftPrompt(false)
  }

  const handleClose = () => {
    if (state.isDirty) {
      // Show confirmation if there are unsaved changes
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleSubmit = async () => {
    // Validate final step
    if (!validateStep(4)) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      // Prepare livestock data
      const livestockData = {
        name: state.name,
        category_id: state.category_id,
        breed: state.breed,
        gender: state.gender,
        age: state.age,
        weight: state.weight || undefined,
        price: state.price,
        currency: state.currency,
        location: state.location,
        description: state.description,
        health_status: state.health_status,
        vaccination_history: state.vaccination_history.filter((v) => v.name.trim()),
        tag_ids: state.tag_ids,
      }

      // Create livestock
      const created = await adminLivestockApi.create(livestockData)

      // Upload media files
      for (let i = 0; i < state.mediaFiles.length; i++) {
        const media = state.mediaFiles[i]
        await adminLivestockApi.uploadMedia(created.id, media.file, {
          media_type: media.type,
          is_featured: i === state.featuredIndex,
          aspect_ratio: media.aspectRatio,
        })
      }

      // Success!
      clearDraft()
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Failed to create livestock:", error)
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create livestock. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StepBasicInfo />
      case 2:
        return <StepPricingLocation />
      case 3:
        return <StepDetailsHealth />
      case 4:
        return <StepMediaTags />
      default:
        return null
    }
  }

  return (
    <>
      {/* Draft Prompt Overlay */}
      <AnimatePresence>
        {showDraftPrompt && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-4 max-w-md rounded-2xl bg-background p-6 shadow-premium-lg border border-border/50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold">Resume Draft?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You have an unsaved draft from a previous session. Would you like to continue where
                you left off?
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={handleDiscardDraft} className="flex-1">
                  Start Fresh
                </Button>
                <Button onClick={handleLoadDraft} className="flex-1">
                  Resume Draft
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative border-b border-border/50 bg-muted/30 px-4 py-4 md:px-6">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-primary/20" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">Add New Livestock</h2>
            <p className="text-sm text-muted-foreground">
              Step {state.currentStep} of {STEPS.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="mt-6">
          <StepIndicator />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Error Message */}
        {submitError && (
          <motion.div
            className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 bg-muted/30 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={state.currentStep === 1 || state.isSubmitting}
          >
            Previous
          </Button>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={state.isSubmitting}>
              Cancel
            </Button>

            {state.currentStep < 4 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={state.isSubmitting}>
                {state.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Livestock"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Main Modal Component
export function CreateLivestockModal({
  open,
  onOpenChange,
  onSuccess,
  editId,
}: CreateLivestockModalProps) {
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
                // Full screen on mobile
                "h-full md:h-auto"
              )}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <LivestockFormProvider>
                <ModalContent
                  onClose={() => onOpenChange(false)}
                  onSuccess={onSuccess}
                />
              </LivestockFormProvider>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
