import { cn } from "@/lib/utils"

interface StampProps {
  /** Top line, e.g. "GLA". */
  mark?: string
  /** Main line, e.g. "VERIFIED" or "HERD HEALTH". */
  label: string
  /** Optional bottom line, e.g. "PROTOCOL". */
  sublabel?: string
  className?: string
}

/**
 * Ochre verification stamp — an oval "official mark". Used ONLY on delivered,
 * verified facts (impact rows, the herd-health card, verified genetics).
 * Its scarcity is the point: ochre never appears anywhere casual.
 */
export function Stamp({ mark = "GLA", label, sublabel, className }: StampProps) {
  return (
    <div
      className={cn(
        "ledger inline-flex -rotate-6 select-none flex-col items-center justify-center rounded-full px-5 py-3 text-center uppercase",
        className
      )}
      style={{
        color: "var(--ochre)",
        border: "2px solid var(--ochre)",
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--ochre) 40%, transparent)",
      }}
      aria-hidden="true"
    >
      <span className="text-[9px] tracking-[0.3em] opacity-70">{mark}</span>
      <span className="text-sm font-semibold leading-tight tracking-[0.15em]">{label}</span>
      {sublabel && <span className="text-[9px] tracking-[0.3em] opacity-70">{sublabel}</span>}
    </div>
  )
}
