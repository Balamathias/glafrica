import { cn } from "@/lib/utils"

interface RecordLineProps {
  /** Ordered mono segments joined by a ledger divider (·). */
  segments: string[]
  /** Mark the entry as verified with an ochre stamp dot on the trailing segment. */
  verified?: boolean
  className?: string
}

/**
 * A single-line mono ledger entry, e.g.
 * `COHORT 01 · 93 FARMERS TRAINED · VERIFIED`.
 * Replaces glassy stat tiles — the honesty positioning rendered as type.
 */
export function RecordLine({ segments, verified = false, className }: RecordLineProps) {
  return (
    <div
      className={cn(
        "ledger inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs uppercase",
        "rounded-full border border-white/15 bg-black/25 px-4 py-2 text-white/80 backdrop-blur-sm",
        className
      )}
    >
      {segments.map((seg, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i > 0 && <span className="text-white/30">·</span>}
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
