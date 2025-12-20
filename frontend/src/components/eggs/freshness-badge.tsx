"use client"

import { cn } from "@/lib/utils"
import type { FreshnessStatus } from "@/lib/types"
import { FRESHNESS_LABELS, FRESHNESS_COLORS, formatDaysUntilExpiry } from "@/lib/types"
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface FreshnessBadgeProps {
  status: FreshnessStatus
  daysUntilExpiry?: number | null
  showDays?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
}

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
}

const StatusIcon = ({ status, size }: { status: FreshnessStatus; size: number }) => {
  switch (status) {
    case "fresh":
      return <CheckCircle size={size} />
    case "use_soon":
      return <Clock size={size} />
    case "expiring_soon":
      return <AlertTriangle size={size} />
    case "expired":
      return <XCircle size={size} />
    case "unknown":
      return <Clock size={size} />
    default:
      return <Clock size={size} />
  }
}

export function FreshnessBadge({
  status,
  daysUntilExpiry,
  showDays = false,
  size = "md",
  className,
}: FreshnessBadgeProps) {
  const colors = FRESHNESS_COLORS[status]
  const label = FRESHNESS_LABELS[status]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      <StatusIcon status={status} size={iconSizes[size]} />
      <span>{label}</span>
      {showDays && daysUntilExpiry !== undefined && (
        <span className="opacity-75">({formatDaysUntilExpiry(daysUntilExpiry)})</span>
      )}
    </div>
  )
}

// Progress bar variant for showing freshness percentage
interface FreshnessProgressProps {
  percentage: number
  status: FreshnessStatus
  className?: string
}

export function FreshnessProgress({ percentage, status, className }: FreshnessProgressProps) {
  const getProgressColor = () => {
    if (percentage > 70) return "bg-green-500"
    if (percentage > 40) return "bg-yellow-500"
    if (percentage > 0) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Freshness</span>
        <span className="text-xs font-medium">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", getProgressColor())}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
    </div>
  )
}
