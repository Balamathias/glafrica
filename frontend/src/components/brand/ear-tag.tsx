import { cn } from "@/lib/utils"

interface EarTagProps {
  children: React.ReactNode
  /** Accent tag (pasture) vs neutral. */
  accent?: boolean
  className?: string
}

/**
 * An ear-tag-shaped chip for species / category labels — one squared corner and
 * a punch hole, the way a real livestock ear tag reads.
 */
export function EarTag({ children, accent = false, className }: EarTagProps) {
  return (
    <span
      className={cn(
        "ledger inline-flex items-center gap-1.5 rounded-md rounded-tl-none border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em]",
        accent
          ? "border-[color:var(--pasture)]/40 bg-[color:var(--pasture)]/10 text-[color:var(--pasture)]"
          : "border-white/15 bg-white/[0.04] text-white/70",
        className
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          accent ? "bg-[color:var(--pasture)]" : "bg-white/40"
        )}
      />
      {children}
    </span>
  )
}
