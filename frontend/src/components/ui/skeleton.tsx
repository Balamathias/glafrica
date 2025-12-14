import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Preset skeleton components for common use cases
function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

// Predefined aspect ratios to avoid hydration mismatch
const SKELETON_ASPECTS = [0.75, 1, 0.8, 0.9, 1.2, 0.85, 1.1, 0.95]

function SkeletonGalleryCard({ index = 0 }: { index?: number }) {
  const aspectRatio = SKELETON_ASPECTS[index % SKELETON_ASPECTS.length]
  return (
    <div className="rounded-2xl overflow-hidden bg-muted animate-pulse">
      <div className="w-full" style={{ aspectRatio }} />
    </div>
  )
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }
  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />
}

export { Skeleton, SkeletonCard, SkeletonGalleryCard, SkeletonText, SkeletonAvatar }
