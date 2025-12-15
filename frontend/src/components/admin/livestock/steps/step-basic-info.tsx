"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Beef, Tag, Dna, Users, Calendar, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useLivestockForm } from "../livestock-form-context"
import { CategorySelect } from "../form-fields/category-select"

const genderOptions = [
  { value: "M", label: "Male", icon: "♂" },
  { value: "F", label: "Female", icon: "♀" },
  { value: "mixed", label: "Mixed Group", icon: "⚥" },
] as const

export function StepBasicInfo() {
  const { state, updateField } = useLivestockForm()
  const { errors } = state

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Start by providing the essential details about this livestock.
        </p>
      </div>

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
          Breed <span className="text-destructive">*</span>
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
          Gender <span className="text-destructive">*</span>
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
            Age <span className="text-destructive">*</span>
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

      {/* Helper text */}
      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Use descriptive names that highlight
          unique qualities. Good names help buyers find what they&apos;re looking for quickly.
        </p>
      </div>
    </div>
  )
}
