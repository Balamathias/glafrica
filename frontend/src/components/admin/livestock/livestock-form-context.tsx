"use client"

import * as React from "react"

// Types
export interface VaccinationRecord {
  id: string
  name: string
  date: string
  notes?: string
}

export interface MediaPreview {
  id: string
  file: File
  preview: string
  type: "image" | "video"
  aspectRatio: number
}

export interface LivestockFormData {
  // Step 1: Basic Information
  name: string
  category_id: string
  breed: string
  gender: "M" | "F" | "mixed" | ""
  age: string
  weight: string

  // Step 2: Pricing & Location
  price: string
  currency: string
  location: string

  // Step 3: Details & Health
  description: string
  health_status: string
  vaccination_history: VaccinationRecord[]

  // Step 4: Media & Tags
  tag_ids: string[]
}

export interface LivestockFormState extends LivestockFormData {
  // Media (handled separately - not JSON serializable)
  mediaFiles: MediaPreview[]
  featuredIndex: number

  // Meta
  currentStep: number
  isSubmitting: boolean
  isDirty: boolean
  errors: Record<string, string | undefined>
}

interface LivestockFormContextValue {
  state: LivestockFormState
  // Navigation
  goToStep: (step: number) => void
  nextStep: () => boolean
  prevStep: () => void
  // Field updates
  updateField: <K extends keyof LivestockFormData>(field: K, value: LivestockFormData[K]) => void
  updateFields: (fields: Partial<LivestockFormData>) => void
  // Media
  addMedia: (files: File[]) => void
  removeMedia: (id: string) => void
  setFeaturedMedia: (index: number) => void
  // Vaccination
  addVaccination: () => void
  updateVaccination: (id: string, updates: Partial<VaccinationRecord>) => void
  removeVaccination: (id: string) => void
  // Validation
  validateStep: (step: number) => boolean
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void
  // Submission
  setSubmitting: (isSubmitting: boolean) => void
  // Draft
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
  // Reset
  resetForm: () => void
}

const DRAFT_KEY = "livestock-form-draft"

const initialFormData: LivestockFormData = {
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
}

const initialState: LivestockFormState = {
  ...initialFormData,
  mediaFiles: [],
  featuredIndex: 0,
  currentStep: 1,
  isSubmitting: false,
  isDirty: false,
  errors: {},
}

const LivestockFormContext = React.createContext<LivestockFormContextValue | null>(null)

export function useLivestockForm() {
  const context = React.useContext(LivestockFormContext)
  if (!context) {
    throw new Error("useLivestockForm must be used within a LivestockFormProvider")
  }
  return context
}

// Validation rules
const validationRules: Record<number, Record<string, (value: unknown, state: LivestockFormState) => string | null>> = {
  1: {
    name: (value) => {
      if (!value || (value as string).trim().length < 3) {
        return "Name must be at least 3 characters"
      }
      return null
    },
    category_id: (value) => {
      if (!value) return "Please select a category"
      return null
    },
    breed: (value) => {
      if (!value || (value as string).trim().length < 2) {
        return "Breed must be at least 2 characters"
      }
      return null
    },
    gender: (value) => {
      if (!value) return "Please select a gender"
      return null
    },
    age: (value) => {
      if (!value || (value as string).trim().length === 0) {
        return "Age is required"
      }
      return null
    },
  },
  2: {
    price: (value) => {
      const num = parseFloat(value as string)
      if (isNaN(num) || num <= 0) {
        return "Price must be a positive number"
      }
      return null
    },
    location: (value) => {
      if (!value || (value as string).trim().length === 0) {
        return "Location is required"
      }
      return null
    },
  },
  3: {
    description: (value) => {
      if (!value || (value as string).trim().length < 50) {
        return "Description must be at least 50 characters"
      }
      return null
    },
    health_status: (value) => {
      if (!value || (value as string).trim().length < 20) {
        return "Health status must be at least 20 characters"
      }
      return null
    },
  },
  4: {
    mediaFiles: (_, state) => {
      if (state.mediaFiles.length === 0) {
        return "At least one media file is required"
      }
      return null
    },
  },
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Calculate aspect ratio from image/video
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

interface LivestockFormProviderProps {
  children: React.ReactNode
  editData?: Partial<LivestockFormData>
}

export function LivestockFormProvider({ children, editData }: LivestockFormProviderProps) {
  const [state, setState] = React.useState<LivestockFormState>(() => {
    // If editing, merge edit data
    if (editData) {
      return {
        ...initialState,
        ...editData,
        isDirty: false,
      }
    }
    return initialState
  })

  // Navigation
  const goToStep = React.useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setState((prev) => ({ ...prev, currentStep: step }))
    }
  }, [])

  const validateStep = React.useCallback((step: number): boolean => {
    const rules = validationRules[step]
    if (!rules) return true

    let isValid = true
    const newErrors: Record<string, string> = {}

    for (const [field, validate] of Object.entries(rules)) {
      const value = state[field as keyof LivestockFormState]
      const error = validate(value, state)
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    }

    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...newErrors },
    }))

    return isValid
  }, [state])

  const nextStep = React.useCallback((): boolean => {
    const isValid = validateStep(state.currentStep)
    if (isValid && state.currentStep < 4) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }))
      return true
    }
    return isValid
  }, [state.currentStep, validateStep])

  const prevStep = React.useCallback(() => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }))
    }
  }, [state.currentStep])

  // Field updates
  const updateField = React.useCallback(<K extends keyof LivestockFormData>(
    field: K,
    value: LivestockFormData[K]
  ) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
      isDirty: true,
      errors: { ...prev.errors, [field]: undefined },
    }))
  }, [])

  const updateFields = React.useCallback((fields: Partial<LivestockFormData>) => {
    setState((prev) => ({
      ...prev,
      ...fields,
      isDirty: true,
    }))
  }, [])

  // Media management
  const addMedia = React.useCallback(async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB video, 10MB image
      return (isImage || isVideo) && file.size <= maxSize
    })

    const newPreviews: MediaPreview[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
        aspectRatio: await calculateAspectRatio(file),
      }))
    )

    setState((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...newPreviews],
      isDirty: true,
      errors: { ...prev.errors, mediaFiles: undefined },
    }))
  }, [])

  const removeMedia = React.useCallback((id: string) => {
    setState((prev) => {
      const index = prev.mediaFiles.findIndex((m) => m.id === id)
      const newFiles = prev.mediaFiles.filter((m) => m.id !== id)

      // Revoke URL to prevent memory leaks
      const removed = prev.mediaFiles.find((m) => m.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }

      // Adjust featured index if needed
      let newFeaturedIndex = prev.featuredIndex
      if (index < prev.featuredIndex) {
        newFeaturedIndex = Math.max(0, prev.featuredIndex - 1)
      } else if (index === prev.featuredIndex) {
        newFeaturedIndex = 0
      }

      return {
        ...prev,
        mediaFiles: newFiles,
        featuredIndex: Math.min(newFeaturedIndex, newFiles.length - 1),
        isDirty: true,
      }
    })
  }, [])

  const setFeaturedMedia = React.useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      featuredIndex: Math.min(index, prev.mediaFiles.length - 1),
      isDirty: true,
    }))
  }, [])

  // Vaccination management
  const addVaccination = React.useCallback(() => {
    const newRecord: VaccinationRecord = {
      id: generateId(),
      name: "",
      date: "",
      notes: "",
    }
    setState((prev) => ({
      ...prev,
      vaccination_history: [...prev.vaccination_history, newRecord],
      isDirty: true,
    }))
  }, [])

  const updateVaccination = React.useCallback((id: string, updates: Partial<VaccinationRecord>) => {
    setState((prev) => ({
      ...prev,
      vaccination_history: prev.vaccination_history.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
      isDirty: true,
    }))
  }, [])

  const removeVaccination = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      vaccination_history: prev.vaccination_history.filter((v) => v.id !== id),
      isDirty: true,
    }))
  }, [])

  // Validation
  const setError = React.useCallback((field: string, message: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }))
  }, [])

  const clearError = React.useCallback((field: string) => {
    setState((prev) => {
      const newErrors = { ...prev.errors }
      delete newErrors[field]
      return { ...prev, errors: newErrors }
    })
  }, [])

  const clearAllErrors = React.useCallback(() => {
    setState((prev) => ({ ...prev, errors: {} }))
  }, [])

  // Submission
  const setSubmitting = React.useCallback((isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }))
  }, [])

  // Draft management
  const saveDraft = React.useCallback(() => {
    const draftData: Omit<LivestockFormData, "mediaFiles"> = {
      name: state.name,
      category_id: state.category_id,
      breed: state.breed,
      gender: state.gender,
      age: state.age,
      weight: state.weight,
      price: state.price,
      currency: state.currency,
      location: state.location,
      description: state.description,
      health_status: state.health_status,
      vaccination_history: state.vaccination_history,
      tag_ids: state.tag_ids,
    }

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        data: draftData,
        currentStep: state.currentStep,
        timestamp: Date.now(),
      }))
    } catch (e) {
      console.error("Failed to save draft:", e)
    }
  }, [state])

  const loadDraft = React.useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const { data, currentStep } = JSON.parse(saved)
        setState((prev) => ({
          ...prev,
          ...data,
          currentStep,
          isDirty: true,
        }))
        return true
      }
    } catch (e) {
      console.error("Failed to load draft:", e)
    }
    return false
  }, [])

  const clearDraft = React.useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      console.error("Failed to clear draft:", e)
    }
  }, [])

  // Reset
  const resetForm = React.useCallback(() => {
    // Clean up media preview URLs
    state.mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview))
    setState(initialState)
    clearDraft()
  }, [state.mediaFiles, clearDraft])

  // Auto-save draft on step change
  React.useEffect(() => {
    if (state.isDirty) {
      saveDraft()
    }
  }, [state.currentStep, state.isDirty, saveDraft])

  // Cleanup media URLs on unmount
  React.useEffect(() => {
    return () => {
      state.mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: LivestockFormContextValue = {
    state,
    goToStep,
    nextStep,
    prevStep,
    updateField,
    updateFields,
    addMedia,
    removeMedia,
    setFeaturedMedia,
    addVaccination,
    updateVaccination,
    removeVaccination,
    validateStep,
    setError,
    clearError,
    clearAllErrors,
    setSubmitting,
    saveDraft,
    loadDraft,
    clearDraft,
    resetForm,
  }

  return (
    <LivestockFormContext.Provider value={contextValue}>
      {children}
    </LivestockFormContext.Provider>
  )
}

// Helper to check if there's a saved draft
export function hasSavedDraft(): boolean {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      const { timestamp } = JSON.parse(saved)
      // Draft expires after 24 hours
      const dayInMs = 24 * 60 * 60 * 1000
      return Date.now() - timestamp < dayInMs
    }
  } catch {
    // Ignore
  }
  return false
}
