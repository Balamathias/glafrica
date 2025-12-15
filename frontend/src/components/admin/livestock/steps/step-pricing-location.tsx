"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { DollarSign, MapPin, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useLivestockForm } from "../livestock-form-context"

const currencies = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
]

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

  const [showCurrencyDropdown, setShowCurrencyDropdown] = React.useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = React.useState(false)
  const [locationFilter, setLocationFilter] = React.useState("")

  const currencyRef = React.useRef<HTMLDivElement>(null)
  const locationRef = React.useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false)
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedCurrency = currencies.find((c) => c.code === state.currency) || currencies[0]

  const filteredLocations = popularLocations.filter((loc) =>
    loc.toLowerCase().includes((locationFilter || state.location).toLowerCase())
  )

  // Format price with commas
  const formatPrice = (value: string) => {
    const num = value.replace(/[^0-9.]/g, "")
    const parts = num.split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "")
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      updateField("price", raw)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold">Pricing & Location</h3>
        <p className="text-sm text-muted-foreground">
          Set the price and specify where this livestock is located.
        </p>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Price <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          {/* Currency Selector */}
          <div ref={currencyRef} className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm",
                "hover:bg-accent transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              <span className="font-medium">{selectedCurrency.symbol}</span>
              <span className="text-muted-foreground">{selectedCurrency.code}</span>
            </button>

            {showCurrencyDropdown && (
              <motion.div
                className="absolute top-full left-0 z-10 mt-1 w-56 rounded-lg border border-border bg-background shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="p-1">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => {
                        updateField("currency", currency.code)
                        setShowCurrencyDropdown(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                        "hover:bg-accent transition-colors",
                        state.currency === currency.code && "bg-primary/10 text-primary"
                      )}
                    >
                      <span className="w-6 font-medium">{currency.symbol}</span>
                      <span>{currency.name}</span>
                      <span className="ml-auto text-muted-foreground">{currency.code}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Price Input */}
          <div className="flex-1">
            <Input
              icon={<Banknote className="h-4 w-4" />}
              placeholder="0.00"
              value={formatPrice(state.price)}
              onChange={handlePriceChange}
              className={cn(
                "text-lg font-semibold",
                errors.price && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
        </div>
        {errors.price && (
          <motion.p
            className="text-xs text-destructive"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.price}
          </motion.p>
        )}

        {/* Price Preview */}
        {state.price && !errors.price && (
          <motion.div
            className="rounded-lg bg-primary/10 p-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-sm text-muted-foreground">Price Preview</p>
            <p className="text-2xl font-bold text-primary">
              {selectedCurrency.symbol}
              {formatPrice(state.price)}
            </p>
          </motion.div>
        )}
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

      {/* Helper card */}
      <div className="rounded-xl bg-muted/50 p-4 space-y-3">
        <h4 className="font-medium text-sm">Pricing Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Research market prices for similar livestock in your area</li>
          <li>• Consider the breed quality, age, and health status</li>
          <li>• Be competitive but fair - prices can be negotiated later</li>
          <li>• Include any unique qualities that justify premium pricing</li>
        </ul>
      </div>
    </div>
  )
}
