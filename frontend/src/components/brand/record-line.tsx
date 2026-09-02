import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface RecordLineProps {
  /** Ordered mono segments joined by a ledger divider (·). Nodes are allowed so
   * a segment can carry an animated figure. */
  segments: ReactNode[]
  /** Mark the entry as verified with an ochre stamp dot on the trailing segment. */
  verified?: boolean
  className?: string
}

/**
 * A mono ledger entry, e.g. `COHORT 01 · 93 FARMERS TRAINED · VERIFIED`.
 * One line on sm+; on small phones it stacks as a compact record card instead
 * of wrapping mid-segment. Replaces glassy stat tiles.
 */
export function RecordLine({ segments, verified = false, className }: RecordLineProps) {
  return (
    <div
      className={cn(
        "ledger inline-flex uppercase text-white/80 backdrop-blur-sm",
        "border border-white/15 bg-black/25",
        // Small phones: stacked record card
        "flex-col items-start gap-1.5 rounded-2xl px-4 py-3 text-[10px] tracking-[0.12em]",
        // sm+: the single-line pill
        "sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 sm:rounded-full sm:py-2 sm:text-xs sm:tracking-normal",
        className
      )}
    >
      {segments.map((seg, i) => (
        <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
          {i > 0 && <span className="hidden text-white/30 sm:inline">·</span>}
          <span className={cn(i === segments.length - 1 && verified && "text-[color:var(--ochre)]")}>
            {verified && i === segments.length - 1 && (
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ backgroundColor: "var(--ochre)" }}
              />
            )}
            {seg}
          </span>
        </span>
      ))}
    </div>
  )
}
