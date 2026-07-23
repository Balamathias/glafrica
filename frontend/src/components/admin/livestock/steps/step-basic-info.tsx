"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Beef, Dna, Calendar, Scale, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useLivestockForm } from "../livestock-form-context"
import { CategorySelect } from "../form-fields/category-select"
import { AIQuickfill } from "@/components/admin/ai-quickfill"
import type { LivestockSuggestion, EggSuggestion } from "@/lib/admin-api"

const genderOptions = [
  { value: "M", label: "Male", icon: "♂" },
  { value: "F", label: "Female", icon: "♀" },
  { value: "mixed", label: "Mixed Group", icon: "⚥" },
] as const

const popularLocations = [
  "Lagos, Nigeria",
  "Abuja, Nigeria",
  "Kano, Nigeria",
  "Port Harcourt, Nigeria",
  "Ibadan, Nigeria",
  "Kaduna, Nigeria",
  "Jos, Nigeria",
  "Sokoto, Nigeria",
]

export function StepBasicInfo() {
  const { state, updateField, updateFields, addMedia } = useLivestockForm()
  const { errors } = state

  const handleQuickfill = (s: LivestockSuggestion | EggSuggestion, file: File) => {
    const sug = s as LivestockSuggestion
    // Only overwrite with non-empty suggestions; the admin reviews every step.
    updateFields({
      ...(sug.name && { name: sug.name }),
      ...(sug.category_id && { category_id: sug.category_id }),
      ...(sug.breed && { breed: sug.breed }),
      ...(sug.gender && { gender: sug.gender }),
      ...(sug.age && { age: sug.age }),
      ...(sug.weight && { weight: sug.weight }),
      ...(sug.description && { description: sug.description }),
      ...(sug.tag_ids.length > 0 && { tag_ids: sug.tag_ids }),
    })
    // Queue the photo as this record's media so it isn't uploaded twice.
    addMedia([file])
  }

  const [showLocationSuggestions, setShowLocationSuggestions] = React.useState(false)
  const locationRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredLocations = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(state.location.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Start by providing the essential details about this livestock.
        </p>
      </div>

      {/* AI quick-fill — drafts the whole record from one photo */}
      <AIQuickfill kind="livestock" onResult={handleQuickfill} />

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          icon={<Beef className="h-4 w-4" />}
          placeholder="e.g., Premium Boer Goat Buck"
          value={state.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
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

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Category <span className="text-destructive">*</span>
        </label>
        <CategorySelect
          value={state.category_id}
          onChange={(value) => updateField("category_id", value)}
          error={errors.category_id}
        />
        {errors.category_id && (
          <motion.p
            className="text-xs text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.category_id}
          </motion.p>
        )}
      </div>

      {/* Breed */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Breed <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <Input
          icon={<Dna className="h-4 w-4" />}
          placeholder="e.g., Boer, Kalahari Red, Sokoto"
          value={state.breed}
          onChange={(e) => updateField("breed", e.target.value)}
          className={cn(errors.breed && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.breed && (
          <motion.p
            className="text-xs text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.breed}
          </motion.p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Gender <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map((option) => {
            const isSelected = state.gender === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("gender", option.value)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-background"
                )}
              >
                <span className="text-2xl">{option.icon}</span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-primary"
                    layoutId="gender-selected"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </div>
        {errors.gender && (
          <motion.p
            className="text-xs text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.gender}
          </motion.p>
        )}
      </div>

      {/* Age and Weight - Side by Side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Age */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Age <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <Input
            icon={<Calendar className="h-4 w-4" />}
            placeholder="e.g., 2 years, 6 months"
            value={state.age}
            onChange={(e) => updateField("age", e.target.value)}
            className={cn(errors.age && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.age && (
            <motion.p
              className="text-xs text-destructive"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.age}
            </motion.p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Weight <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <Input
            icon={<Scale className="h-4 w-4" />}
            placeholder="e.g., 45kg, 100lbs"
            value={state.weight}
            onChange={(e) => updateField("weight", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Location <span className="text-destructive">*</span>
        </label>
        <div ref={locationRef} className="relative">
          <Input
            icon={<MapPin className="h-4 w-4" />}
            placeholder="e.g., Mbiama, Rivers State"
            value={state.location}
            onChange={(e) => {
              updateField("location", e.target.value)
              setShowLocationSuggestions(true)
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            className={cn(errors.location && "border-destructive focus-visible:ring-destructive")}
          />
          {showLocationSuggestions && filteredLocations.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-1">
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      updateField("location", location)
                      setShowLocationSuggestions(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                      "hover:bg-accent transition-colors text-left",
                      state.location === location && "bg-primary/10 text-primary"
                    )}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {location}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        {errors.location && (
          <motion.p
            className="text-xs text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.location}
          </motion.p>
        )}
      </div>

      {/* Helper text */}
      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Name the animal the way its
          record reads — breed and role, e.g. &ldquo;Kalahari Red Buck&rdquo;. Clear records
          are what make verification credible.
        </p>
      </div>
    </div>
  )
}
