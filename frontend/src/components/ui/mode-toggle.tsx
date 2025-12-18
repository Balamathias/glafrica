"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ModeToggleProps {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ModeToggle({ variant = "default", size = "md", className }: ModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }

  const variantClasses = {
    default: "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20",
    ghost: "hover:bg-muted",
    outline: "border border-border hover:bg-muted",
  }

  if (!mounted) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center",
        sizeClasses[size],
        variantClasses[variant],
        className
      )} />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full flex items-center justify-center transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={iconSizes[size]} className="text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={iconSizes[size]} className="text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
