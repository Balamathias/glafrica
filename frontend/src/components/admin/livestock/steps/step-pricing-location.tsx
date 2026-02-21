"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useLivestockForm } from "../livestock-form-context"

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

export function StepPricingLocation() {
  const { state, updateField } = useLivestockForm()
  const { errors } = state

  const [showLocationSuggestions, setShowLocationSuggestions] = React.useState(false)
  const [locationFilter, setLocationFilter] = React.useState("")

  const locationRef = React.useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
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
    loc.toLowerCase().includes((locationFilter || state.location).toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold">Location</h3>
        <p className="text-sm text-muted-foreground">
          Specify where this livestock is located.
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Location <span className="text-destructive">*</span>
        </label>
        <div ref={locationRef} className="relative">
          <Input
            icon={<MapPin className="h-4 w-4" />}
            placeholder="e.g., Lagos, Nigeria"
            value={state.location}
            onChange={(e) => {
              updateField("location", e.target.value)
              setLocationFilter(e.target.value)
              setShowLocationSuggestions(true)
            }}
            onFocus={() => setShowLocationSuggestions(true)}
            className={cn(errors.location && "border-destructive focus-visible:ring-destructive")}
          />

          {/* Location Suggestions */}
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
        <p className="text-xs text-muted-foreground">
          Type to search or select from popular locations
        </p>
      </div>
    </div>
  )
}
