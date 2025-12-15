"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  description?: string
  error?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

const iconSizeClasses = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked = false,
      indeterminate = false,
      onChange,
      label,
      description,
      error,
      size = "md",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const checkboxId = id || React.useId()

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    // Handle indeterminate state
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const handleClick = () => {
      if (!disabled) {
        onChange?.(!checked)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        handleClick()
      }
    }

    return (
      <div className={cn("flex items-start gap-3", className)}>
        {/* Hidden input for form compatibility */}
        <input
          ref={inputRef}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />

        {/* Custom checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={indeterminate ? "mixed" : checked}
          aria-labelledby={label ? `${checkboxId}-label` : undefined}
          aria-describedby={description ? `${checkboxId}-description` : undefined}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative shrink-0 rounded-md border-2 transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            sizeClasses[size],
            // States
            checked || indeterminate
              ? "border-primary bg-primary"
              : "border-muted-foreground/40 bg-background hover:border-muted-foreground/60",
            // Error state
            error && "border-destructive",
            // Disabled state
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {/* Check icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-primary-foreground"
            initial={false}
            animate={{
              scale: checked && !indeterminate ? 1 : 0,
              opacity: checked && !indeterminate ? 1 : 0,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Check className={iconSizeClasses[size]} strokeWidth={3} />
          </motion.div>

          {/* Indeterminate icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-primary-foreground"
            initial={false}
            animate={{
              scale: indeterminate ? 1 : 0,
              opacity: indeterminate ? 1 : 0,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Minus className={iconSizeClasses[size]} strokeWidth={3} />
          </motion.div>

          {/* Ripple effect on click */}
          <motion.span
            className="absolute inset-0 rounded-md bg-primary/20"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </button>

        {/* Label and description */}
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                id={`${checkboxId}-label`}
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium cursor-pointer select-none",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={handleClick}
              >
                {label}
              </label>
            )}
            {description && (
              <span
                id={`${checkboxId}-description`}
                className="text-xs text-muted-foreground"
              >
                {description}
              </span>
            )}
            {error && (
              <span className="text-xs text-destructive">{error}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"
