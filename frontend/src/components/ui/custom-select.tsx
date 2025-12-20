"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface CustomSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  glassmorphism?: boolean
  showClearOption?: boolean
  clearLabel?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName,
  glassmorphism = true,
  showClearOption = true,
  clearLabel = "All",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on escape key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || placeholder

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          glassmorphism
            ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30"
            : "bg-muted border border-border text-foreground hover:bg-muted/80",
          isOpen && (glassmorphism ? "bg-white/20 border-white/40" : "bg-muted/80 ring-2 ring-primary/50"),
          triggerClassName
        )}
      >
        <span className={cn(!value && "opacity-70")}>{displayValue}</span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 top-full left-0 right-0 mt-2 py-1.5 rounded-xl overflow-hidden",
              glassmorphism
                ? "bg-black/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/20"
                : "bg-background border border-border shadow-lg"
            )}
          >
            <div className="max-h-60 overflow-y-auto">
              {/* Clear option */}
              {showClearOption && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(undefined)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors",
                    glassmorphism
                      ? "text-white/80 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted",
                    !value && (glassmorphism ? "text-primary bg-white/5" : "text-primary bg-primary/5")
                  )}
                >
                  <span>{clearLabel}</span>
                  {!value && <Check size={16} className="text-primary" />}
                </button>
              )}

              {/* Options */}
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors",
                    glassmorphism
                      ? "text-white hover:bg-white/10"
                      : "text-foreground hover:bg-muted",
                    value === option.value && (glassmorphism ? "text-primary bg-white/5" : "text-primary bg-primary/5")
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {value === option.value && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact variant for inline use
interface CompactSelectProps extends Omit<CustomSelectProps, "glassmorphism"> {
  variant?: "default" | "ghost" | "outline"
}

export function CompactSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  variant = "default",
  showClearOption = true,
  clearLabel = "All",
}: CompactSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  const variantStyles = {
    default: "bg-muted hover:bg-muted/80",
    ghost: "hover:bg-muted/50",
    outline: "border border-border hover:bg-muted/50",
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
          variantStyles[variant],
          isOpen && "ring-2 ring-primary/30"
        )}
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full left-0 min-w-[140px] mt-1.5 py-1 rounded-lg bg-popover border border-border shadow-lg"
          >
            {showClearOption && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors",
                  !value && "text-primary"
                )}
              >
                {clearLabel}
                {!value && <Check size={14} />}
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-muted transition-colors",
                  value === opt.value && "text-primary"
                )}
              >
                {opt.label}
                {value === opt.value && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
