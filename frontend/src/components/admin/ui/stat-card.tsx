"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  suffix?: string
  prefix?: string
  description?: string
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  suffix,
  prefix,
  description,
  className,
}: StatCardProps) {
  // Determine trend from change if not explicitly provided
  const actualTrend = trend ?? (change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : "neutral")

  const TrendIcon = actualTrend === "up" ? TrendingUp : actualTrend === "down" ? TrendingDown : Minus

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "glass border border-border/50",
        "p-6",
        "group hover:shadow-premium transition-all duration-300",
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mt-3 flex items-baseline gap-1">
          {prefix && (
            <span className="text-lg font-medium text-muted-foreground">{prefix}</span>
          )}
          <motion.span
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </motion.span>
          {suffix && (
            <span className="text-lg font-medium text-muted-foreground">{suffix}</span>
          )}
        </div>

        {/* Change Indicator */}
        {change !== undefined && (
          <div className="mt-3 flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                actualTrend === "up" && "bg-emerald-500/10 text-emerald-500",
                actualTrend === "down" && "bg-red-500/10 text-red-500",
                actualTrend === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(change)}%</span>
            </div>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
