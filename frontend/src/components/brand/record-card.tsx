import { cn } from "@/lib/utils"

interface RecordCardProps {
  /** Mono metadata row printed at the top, e.g. `ENTRY 04 · GOATS · NUTRITION`. */
  meta?: string
  /** "vellum" (warm paper) or "night" (dark surface). */
  tone?: "vellum" | "night"
  className?: string
  children: React.ReactNode
}

/**
 * A record surface with a mono metadata row. No backdrop blur, no hover
 * gradient wash — hover emphasis is border + lift only (per gradient charter).
 */
export function RecordCard({ meta, tone = "night", className, children }: RecordCardProps) {
  const isVellum = tone === "vellum"
  return (
    <div
      className={cn(
        "group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1",
        isVellum
          ? "surface-vellum border-black/10 hover:border-[color:var(--canopy)]/40"
          : "border-white/10 bg-white/[0.03] hover:border-[color:var(--pasture)]/40 hover:bg-white/[0.05]",
        className
      )}
    >
      {meta && (
        <div
          className={cn(
            "ledger border-b px-5 py-2.5 text-[10px] uppercase tracking-[0.18em]",
            isVellum ? "border-black/10 text-black/50" : "border-white/10 text-white/45"
          )}
        >
          {meta}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}
